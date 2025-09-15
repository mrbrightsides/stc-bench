import time
import io
import json
import subprocess
from pathlib import Path
import streamlit as st
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
RUNNER_PATH = ROOT / "bench_core/runner.py"
SCENARIO_DIR = ROOT / "scenarios"
OUTPUT_DIR = ROOT / "outputs"

st.set_page_config(page_title="STC Bench", layout="wide")
st.title("⚡ STC Benchmarking")

# --- Contract & Scenario ---
st.subheader("Scenario YAML")
scenario_text = st.text_area(
    "scenario.yaml (paste or edit)", height=250,
    value="""\
name: "synthetic-local"
description: "Synthetic benchmark for local testing"
workers: 2
iterations_per_worker: 3
think_time_seconds: 0.01
actions: []
"""
)
run_btn = st.button("🚀 Run Benchmark")

if run_btn:
    if "<YOUR_WALLET_ADDRESS>" in scenario_text or "<RECIPIENT_ADDRESS>" in scenario_text:
        st.error("⚠️ Please replace placeholders <YOUR_WALLET_ADDRESS> and <RECIPIENT_ADDRESS>")
    else:
        # save temporary scenario
        SCENARIO_DIR.mkdir(exist_ok=True)
        temp_path = SCENARIO_DIR / "ui_temp_scenario.yaml"
        temp_path.write_text(scenario_text, encoding="utf-8")

        cmd = ["python", str(RUNNER_PATH), str(temp_path)]
        proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        st.info("⏳ Benchmark running...")

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

                # Export CSV in-memory
                csv_buf = io.StringIO()
                df.to_csv(csv_buf, index=False)
                csv_buf.seek(0)
                st.download_button("⬇️ Download CSV", data=csv_buf, file_name="bench_runs.csv", mime="text/csv")

            except Exception as e:
                st.error(f"Parse failed: {e}")

# --- Optional: Upload JSON lama / analisa ---
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
