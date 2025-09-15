# ui_streamlit/app.py
import time
import streamlit as st
import subprocess
import json
import pandas as pd
from pathlib import Path
import sys
from eth_utils import is_address, to_checksum_address
import os

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from parse_bench_and_bundle import parse_caliper_report, bundle_if_ready

def validate_address(addr):
    try:
        return to_checksum_address(addr) if is_address(addr) else None
    except Exception:
        return None

def parse_abi(text):
    try:
        return json.loads(text)
    except Exception:
        return None

RUNNER_PATH = ROOT / "bench_core/runner.py"
SCENARIO_DIR = ROOT / "scenarios"
OUTPUT_DIR = ROOT / "outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

# --- CSS & Theme ---
st.markdown("""
<style>
:root { --accent:#20c997; --accent2:#7c4dff; }
.block-container { padding-top: 1rem; }
div[data-testid="stMetric"]{ background: linear-gradient(135deg, rgba(32,201,151,.08), rgba(124,77,255,.06)); border: 1px solid rgba(128,128,128,.15); padding: 12px; border-radius: 12px;}
.stButton>button, .stDownloadButton>button{ border-radius:10px; border:1px solid rgba(255,255,255,.15);}
</style>
""", unsafe_allow_html=True)

st.set_page_config(page_title="STC Bench", layout="wide")
st.title("⚡ STC Benchmarking")

# --- Input Contract & Scenario ---
st.subheader("Contract")
contract_address = st.text_input("Contract Address (0x...)")
abi_text = st.text_area("ABI JSON (paste)")

st.subheader("Scenario")
scenario_text = st.text_area(
    "scenario.yaml (paste or edit)", 
    height=250,
    value="""\
name: "real-transfer-sepolia"
description: "Benchmark real Ethereum transactions on Sepolia testnet"
network: "Sepolia"
workers: 2
iterations_per_worker: 3
think_time_seconds: 0.01
actions:
  - type: "transfer"
    from: "<YOUR_WALLET_ADDRESS>"
    to: "<RECIPIENT_ADDRESS>"
    value_eth: 0.001
"""
)

run_btn = st.button("🚀 Run Benchmark")

if run_btn:
    if "<YOUR_WALLET_ADDRESS>" in scenario_text or "<RECIPIENT_ADDRESS>" in scenario_text:
        st.error("⚠️ Please replace placeholders <YOUR_WALLET_ADDRESS> and <RECIPIENT_ADDRESS> before running the benchmark.")
    else:
        # simpan scenario temporer
        os.makedirs(SCENARIO_DIR, exist_ok=True)
        temp_path = SCENARIO_DIR / "ui_temp_scenario.yaml"
        import yaml
        parsed = yaml.safe_load(scenario_text)
        with open(temp_path, "w", encoding="utf-8") as f:
            yaml.safe_dump(parsed, f)

        # jalankan runner
        cmd = ["python", str(RUNNER_PATH), str(temp_path)]
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        st.info("⏳ Benchmark running... please wait")

        try:
            out, err = proc.communicate(timeout=300)
        except subprocess.TimeoutExpired:
            proc.kill()
            st.error("❌ Benchmark timeout")
            out, err = b"", b""

        if err and err.strip():
            st.error(f"Runner error: {err.decode()}")

        if out:
            try:
                data = json.loads(out.decode())
                st.success("✅ Benchmark finished")

                # Summary & preview
                st.write("### Summary", data.get("meta", {}))
                df = pd.DataFrame(data.get("transactions", []))
                st.dataframe(df.head(100))

                # Download JSON langsung
                st.download_button(
                    "⬇️ Download benchmark JSON",
                    data=json.dumps(data, indent=2),
                    file_name="benchmark.json",
                    mime="application/json"
                )

                # --- CSV/NDJSON --- simpan ke file sementara
                runs_file = OUTPUT_DIR / "bench_runs_temp.csv"
                tx_file = OUTPUT_DIR / "bench_tx_temp.csv"
                df.to_csv(runs_file, index=False)
                df.to_csv(tx_file, index=False)  # sesuaikan runs vs tx kalau perlu

                st.download_button("⬇️ Download CSV (runs)", data=open(runs_file, "rb"), file_name="bench_runs.csv", mime="text/csv")
                st.download_button("⬇️ Download CSV (tx)", data=open(tx_file, "rb"), file_name="bench_tx.csv", mime="text/csv")

                # Bundle untuk Analytics
                bundle = bundle_if_ready(runs_file, tx_file, OUTPUT_DIR)
                if bundle and bundle.exists():
                    st.download_button("📦 Download bundle ZIP (runs+tx)", data=open(bundle, "rb"), file_name=bundle.name, mime="application/zip")

            except Exception as e:
                st.error(f"Parse failed: {e}")

# --- Upload JSON lama / analisa ---
st.subheader("📂 Upload JSON Benchmark (optional)")
uploaded_file = st.file_uploader("Upload benchmark JSON", type="json")
if uploaded_file:
    data = json.load(uploaded_file)
    st.write("### Summary", data.get("meta", {}))
    df = pd.DataFrame(data.get("transactions", []))
    st.dataframe(df.head(100))
    st.download_button(
        "⬇️ Download uploaded JSON",
        data=json.dumps(data, indent=2),
        file_name="benchmark_uploaded.json",
        mime="application/json"
    )
