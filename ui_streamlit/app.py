# ui_streamlit/app.py
import time
import streamlit as st
import subprocess
import json
import pandas as pd
import io
from pathlib import Path
import sys
from eth_utils import is_address, to_checksum_address
from glob import glob

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
SCENARIO_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

# CSS Theme
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

# --- Contract & Scenario Inputs ---
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
        # Save scenario temp file
        temp_path = SCENARIO_DIR / "ui_temp_scenario.yaml"
        with open(temp_path, "w") as f:
            f.write(scenario_text)

        # Run benchmark via subprocess
        cmd = [sys.executable, str(RUNNER_PATH), str(temp_path)]
        st.info("⏳ Benchmark running... please wait")
        try:
            proc = subprocess.Popen(cmd)
            proc.wait(timeout=300)  # max 5 menit
        except subprocess.TimeoutExpired:
            proc.kill()
            st.error("❌ Benchmark timeout")
        except Exception as e:
            st.error(f"Runner error: {e}")

        # Load latest output JSON
        files = sorted(glob(str(OUTPUT_DIR / "run-*.json")), reverse=True)
        if files:
            latest_file = files[0]
            try:
                with open(latest_file) as f:
                    data = json.load(f)
                st.success(f"✅ Benchmark finished: {latest_file.name}")

                # Summary & preview
                st.write("### Summary", data.get("meta", {}))
                df = pd.DataFrame(data.get("transactions", []))
                st.dataframe(df.head(100))

                # Download JSON
                st.download_button(
                    "⬇️ Download benchmark JSON",
                    data=json.dumps(data, indent=2),
                    file_name="benchmark.json",
                    mime="application/json"
                )

                # Export CSV in-memory
                runs_csv = io.StringIO()
                tx_csv = io.StringIO()
                df.to_csv(runs_csv, index=False)
                df.to_csv(tx_csv, index=False)  # bisa disesuaikan runs vs tx
                runs_csv.seek(0)
                tx_csv.seek(0)
                st.download_button("⬇️ Download CSV (runs)", data=runs_csv, file_name="bench_runs.csv", mime="text/csv")
                st.download_button("⬇️ Download CSV (tx)", data=tx_csv, file_name="bench_tx.csv", mime="text/csv")

            except Exception as e:
                st.error(f"Failed to load output JSON: {e}")
        else:
            st.warning("⚠️ No output JSON found. Did the runner complete?")

# --- Upload JSON lama / analisa ---
st.subheader("📂 Upload JSON Benchmark (optional)")
uploaded_file = st.file_uploader("Upload benchmark JSON", type="json")
if uploaded_file:
    temp_upload_path = OUTPUT_DIR / "temp_uploaded.json"
    with open(temp_upload_path, "wb") as f:
        f.write(uploaded_file.getbuffer())

    try:
        with open(temp_upload_path) as f:
            data = json.load(f)
        st.write("### Summary", data.get("meta", {}))
        df = pd.DataFrame(data.get("transactions", []))
        st.dataframe(df.head(100))

        st.download_button(
            "⬇️ Download uploaded JSON",
            data=json.dumps(data, indent=2),
            file_name="benchmark_uploaded.json",
            mime="application/json"
        )
    except Exception as e:
        st.error(f"Failed to load uploaded JSON: {e}")

# --- Parse & Bundle for Analytics ---
st.subheader("⚡ Parse & Bundle (for Analytics)")
bundle_btn = st.button("Generate bundle")
if bundle_btn:
    target_file = None
    if uploaded_file:
        target_file = temp_upload_path
    else:
        files = sorted(glob(str(OUTPUT_DIR / "run-*.json")), reverse=True)
        if files:
            target_file = files[0]

    if target_file:
        try:
            runs_csv, tx_csv = parse_caliper_report(target_file)
            bundle = bundle_if_ready(runs_csv, tx_csv, OUTPUT_DIR)
            st.success("✅ Parsed & bundled for Analytics")
            st.download_button("📦 Download bundle ZIP (runs+tx)", data=open(bundle, "rb"), file_name="bundle.ndjson", mime="application/zip")
        except Exception as e:
            st.error(f"Parse+Bundle failed: {e}")
    else:
        st.info("No JSON available to parse & bundle.")
