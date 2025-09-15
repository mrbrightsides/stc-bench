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

# CSS & Theme (optional, sama kaya sebelumnya)
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
scenario_text = st.text_area("scenario.json (paste or edit)", height=220,
                             value='{"title":"Simple Transfer","network":"Sepolia","actions": []}')

# --- Run Benchmark ---
run_btn = st.button("🚀 Run Benchmark")
if run_btn:
    temp_path = "temp_scenario.yaml"
    try:
        import yaml
        parsed = yaml.safe_load(scenario_text)
        with open(temp_path, "w", encoding="utf-8") as f:
            yaml.safe_dump(parsed, f)
    except Exception:
        with open(temp_path, "w", encoding="utf-8") as f:
            f.write(scenario_text)

    # Run runner dan capture output di memory
    cmd = ["python", str(RUNNER_PATH), temp_path]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    st.info("⏳ Benchmark running... please wait")
    try:
        out, err = proc.communicate(timeout=120)
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

            # Export CSV / NDJSON in-memory
            runs_csv = io.StringIO()
            tx_csv = io.StringIO()
            df.to_csv(runs_csv, index=False)
            df.to_csv(tx_csv, index=False)  # sesuaikan field kalau mau beda runs vs tx
            runs_csv.seek(0)
            tx_csv.seek(0)
            st.download_button("⬇️ Download CSV (runs)", data=runs_csv, file_name="bench_runs.csv", mime="text/csv")
            st.download_button("⬇️ Download CSV (tx)", data=tx_csv, file_name="bench_tx.csv", mime="text/csv")

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

# --- Optional: parse & bundle for analytics ---
st.subheader("⚡ Parse & Bundle (for Analytics)")
bundle_btn = st.button("Generate bundle")
if bundle_btn and uploaded_file:
    try:
        # gunakan file uploaded atau terakhir run
        import parse_bench_and_bundle as pbb
        pbb.INPUT_FILE = uploaded_file
        runs_csv, tx_csv = parse_caliper_report(uploaded_file)
        bundle = bundle_if_ready(runs_csv, tx_csv)
        st.success("✅ Parsed & bundled for Analytics")

        # download bundle
        st.download_button("📦 Download bundle ZIP (runs+tx)", data=open(bundle, "rb"), file_name="bundle.ndjson", mime="application/zip")
    except Exception as e:
        st.error(f"Parse+Bundle failed: {e}")
