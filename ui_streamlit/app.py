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

# --- Setup ROOT & import helper ---
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))
from parse_bench_and_bundle import parse_caliper_report, bundle_if_ready

# --- Helper functions ---
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
OUTPUT_DIR = ROOT / "outputs"
SCENARIO_DIR = ROOT / "scenarios"

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

# --- Run Benchmark ---
run_btn = st.button("🚀 Run Benchmark")
if run_btn:
    if "<YOUR_WALLET_ADDRESS>" in scenario_text or "<RECIPIENT_ADDRESS>" in scenario_text:
        st.error("⚠️ Please replace placeholders <YOUR_WALLET_ADDRESS> and <RECIPIENT_ADDRESS> before running the benchmark.")
    else:
        # simpan scenario temporer
        SCENARIO_DIR.mkdir(exist_ok=True)
        temp_path = SCENARIO_DIR / "ui_temp_scenario.yaml"
        try:
            import yaml
            parsed = yaml.safe_load(scenario_text)
            with open(temp_path, "w", encoding="utf-8") as f:
                yaml.safe_dump(parsed, f)
        except Exception:
            with open(temp_path, "w", encoding="utf-8") as f:
                f.write(scenario_text)

        # jalankan runner
        cmd = [sys.executable, str(RUNNER_PATH), str(temp_path)]
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        st.info("⏳ Benchmark running... please wait")

        try:
            out, err = proc.communicate(timeout=180)
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

                # Download JSON
                st.download_button(
                    "⬇️ Download benchmark JSON",
                    data=json.dumps(data, indent=2),
                    file_name="benchmark.json",
                    mime="application/json"
                )

                # Export CSV / NDJSON in-memory
                runs_csv = io.StringIO()
                tx_csv = io.StringIO()
                df.to_csv(runs_csv, index=False)
                df.to_csv(tx_csv, index=False)  # bisa disesuaikan runs vs tx
                runs_csv.seek(0)
                tx_csv.seek(0)
                st.download_button("⬇️ Download CSV (runs)", data=runs_csv, file_name="bench_runs.csv", mime="text/csv")
                st.download_button("⬇️ Download CSV (tx)", data=tx_csv, file_name="bench_tx.csv", mime="text/csv")
            except Exception as e:
                st.error(f"Parse failed: {e}")

# --- Upload JSON lama / analisa ---
st.subheader("📂 Upload JSON Benchmark (optional)")
uploaded_file = st.file_uploader("Upload benchmark JSON", type="json")
uploaded_data = None
if uploaded_file:
    try:
        uploaded_data = json.load(uploaded_file)
        st.write("### Summary", uploaded_data.get("meta", {}))
        df = pd.DataFrame(uploaded_data.get("transactions", []))
        st.dataframe(df.head(100))
        st.download_button(
            "⬇️ Download uploaded JSON",
            data=json.dumps(uploaded_data, indent=2),
            file_name="benchmark_uploaded.json",
            mime="application/json"
        )
    except Exception as e:
        st.error(f"Failed to load uploaded JSON: {e}")

# --- Optional: parse & bundle for analytics ---
st.subheader("⚡ Parse & Bundle (for Analytics)")
bundle_btn = st.button("Generate bundle")
if bundle_btn and (uploaded_file or 'data' in locals()):
    try:
        input_file_path = None
        if uploaded_file:
            # simpan uploaded ke file temporer
            temp_json_path = OUTPUT_DIR / "uploaded_temp.json"
            OUTPUT_DIR.mkdir(exist_ok=True)
            with open(temp_json_path, "w", encoding="utf-8") as f:
                json.dump(uploaded_data, f)
            input_file_path = temp_json_path
        else:
            # gunakan last benchmark output dari app
            latest_files = sorted(OUTPUT_DIR.glob("run-*.json"), reverse=True)
            if latest_files:
                input_file_path = latest_files[0]

        if input_file_path and input_file_path.exists():
            runs_csv, tx_csv = parse_caliper_report(input_file_path)
            bundle = bundle_if_ready(runs_csv, tx_csv, OUTPUT_DIR)
            st.success("✅ Parsed & bundled for Analytics")
            # download bundle
            st.download_button(
                "📦 Download bundle ZIP (runs+tx)",
                data=open(bundle, "rb"),
                file_name=Path(bundle).name,
                mime="application/zip"
            )
        else:
            st.warning("No valid input JSON for bundle.")
    except Exception as e:
        st.error(f"Parse+Bundle failed: {e}")
