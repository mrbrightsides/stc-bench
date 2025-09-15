# ui_streamlit/app.py
import streamlit as st
import subprocess
import json
import glob
import os
import pandas as pd
from pathlib import Path

# helper di app.py
from eth_utils import is_address, to_checksum_address
import json

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

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SCENARIO_DIR = os.path.join(ROOT, "scenarios")
OUTPUT_DIR = os.path.join(ROOT, "outputs")
RUNNER_PATH = os.path.join(ROOT, "bench_core", "runner.py")

# Quick CSS theme (dark + teal accents)
st.markdown("""
<style>
:root { --accent:#20c997; --accent2:#7c4dff; }
.block-container { padding-top: 1rem; }
section[data-testid="stSidebar"] .st-expander { border:1px solid #313131; border-radius:12px; }
div[data-testid="stMetric"]{
  background: linear-gradient(135deg, rgba(32,201,151,.08), rgba(124,77,255,.06));
  border: 1px solid rgba(128,128,128,.15);
  padding: 12px; border-radius: 12px;
}
.stButton>button, .stDownloadButton>button{
  border-radius:10px; border:1px solid rgba(255,255,255,.15);
}
.stTabs [data-baseweb="tab-list"] { gap: 6px; }
.stTabs [data-baseweb="tab"]{
  background: rgba(255,255,255,.03); border: 1px solid rgba(255,255,255,.08);
  border-radius: 10px; padding: 6px 12px;
}
[data-testid="stHeader"] { background: transparent; }
</style>
""", unsafe_allow_html=True)

with st.sidebar:
    st.sidebar.markdown("📘 **About**")
    st.sidebar.markdown("""
    STC Bench adalah modul benchmarking ringan untuk smart contract di jaringan Ethereum (testnet/mainnet).
    Tujuannya: mengeksekusi skenario uji, mencatat detail transaksi, lalu men-translate hasilnya ke format standar (CSV/NDJSON) yang siap divisualisasikan di STC Analytics.
   
    # 🔑 Setup Connection
    Masukkan RPC URL dan Private Key Anda di sini (jangan khawatir, data tidak disimpan)
       
    # 📜 Contract & Scenario
    Masukkan Contract Address, ABI, dan pilih file skenario benchmark (YAML)
    
    # ▶️ Run Benchmark
    Jalankan skenario dan hasil akan tersimpan otomatis di folder `outputs/`
       
    # 📂 Output & Export
    Benchmark menghasilkan file JSON yang dapat ditranslate ke CSV/NDJSON untuk digunakan di STC Analytics
    
    ---
    ### 🧩 RANTAI Ecosystem
    1. [STC Analytics](https://stc-analytics.streamlit.app/)
    2. [STC GasVision](https://stc-gasvision.streamlit.app/)
    3. [STC Converter](https://stc-converter.streamlit.app/)
    4. [STC Insight](https://stc-insight.streamlit.app/)
    5. [STC Plugin](https://smartourism.elpeef.com/)
    6. [SmartFaith](https://smartfaith.streamlit.app/)
    7. [Learn3](https://learn3.streamlit.app/)
    8. [Nexus](https://rantai-nexus.streamlit.app/)

    ---
    #### 🙌 Dukungan & kontributor
    - ⭐ **Star / Fork**: [GitHub repo](https://github.com/mrbrightsides/rantai-nexus)
    - Built with 💙 by [Khudri](https://s.id/khudri)
    - Dukung pengembangan proyek ini melalui: 
      [💖 GitHub Sponsors](https://github.com/sponsors/mrbrightsides) • 
      [☕ Ko-fi](https://ko-fi.com/khudri) • 
      [💵 PayPal](https://www.paypal.com/paypalme/akhmadkhudri) • 
      [🍵 Trakteer](https://trakteer.id/akhmad_khudri)

    Versi UI: v1.0 • Streamlit • Theme Dark
    """)

# === Logo dan Header ===
LOGO_URL = "https://i.imgur.com/7j5aq4l.png"
col1, col2 = st.columns([1, 4])
with col1:
    st.image(LOGO_URL, width=60)
with col2:
    st.markdown("## STC Bench")

st.set_page_config(page_title="STC Bench", layout="wide")
st.title("⚡ STC Benchmarking")

st.markdown("Benchmark. Export. Connect to STC Analytics. Dari transaksi mentah menjadi data siap analisis, menerjemahkan performa smart contract menjadi insight bermakna.")

with st.sidebar:
    st.subheader("RPC & Wallets (optional)")
    rpc_url = st.text_input("RPC URL", value="https://sepolia.infura.io/v3/YOUR_KEY")
    pkeys_raw = st.text_area("Private Keys (one per line)", value="")

st.subheader("Contract")
col1, col2 = st.columns(2)
with col1:
    contract_address = st.text_input("Contract Address (0x...)")
with col2:
    abi_text = st.text_area("ABI JSON (paste)")

st.subheader("Scenario")
scenario_text = st.text_area("scenario.json (paste or edit)", height=220,
                             value='{"title":"Simple Transfer","network":"Sepolia","actions": []}')

run_btn = st.button("🚀 Run Benchmark")

if run_btn:
    # save temporary scenario
    os.makedirs(SCENARIO_DIR, exist_ok=True)
    temp_path = os.path.join(SCENARIO_DIR, "ui_temp_scenario.yaml")
    # try to accept JSON or YAML-ish string; for now write as YAML
    try:
        import yaml
        parsed = yaml.safe_load(scenario_text)
        with open(temp_path, "w", encoding="utf-8") as f:
            yaml.safe_dump(parsed, f)
    except Exception:
        with open(temp_path, "w", encoding="utf-8") as f:
            f.write(scenario_text)

    # run runner as subprocess so Streamlit UI doesn't block
    cmd = ["python", RUNNER_PATH, temp_path]
    proc = subprocess.Popen(cmd)
    st.success(f"Runner started (pid={proc.pid}) — check outputs/ when done")

st.write("---")
st.header("Latest outputs")
files = sorted(glob.glob(os.path.join(OUTPUT_DIR, "run-*.json")), reverse=True)

if files:
    chosen = st.selectbox("Select output", files)
    if st.button("Load Output"):
        with open(chosen, "r", encoding="utf-8") as f:
            data = json.load(f)
        st.write("Summary", data.get("meta", {}))
        df = pd.DataFrame(data.get("rows", []))
        st.dataframe(df.head(200))

        # exporter buttons
        from bench_core.exporter import json_to_csv_ndjson
        csv_path, ndjson_path = None, None
        try:
            csv_path, ndjson_path = json_to_csv_ndjson(chosen)
            st.success("Converted JSON -> CSV / NDJSON")
            with open(csv_path, "rb") as f:
                st.download_button("Download CSV", data=f, file_name=Path(csv_path).name)
            with open(ndjson_path, "rb") as f:
                st.download_button("Download NDJSON", data=f, file_name=Path(ndjson_path).name)
        except Exception as e:
            st.error(f"Export failed: {e}")
else:
    st.info("No outputs yet. Run a scenario first.")
