import streamlit as st
import streamlit.components.v1 as components

with st.sidebar:
    st.sidebar.markdown("📘 **About**")
    st.sidebar.markdown("""
    STC Bench adalah modul benchmarking ringan untuk smart contract di jaringan Ethereum (testnet/mainnet).
    Tujuannya: mengeksekusi skenario uji, mencatat detail transaksi, lalu men-translate hasilnya ke format standar (CSV/NDJSON) yang siap divisualisasikan di STC Analytics.
       
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

st.set_page_config(page_title="STC Benchmarking", layout="wide")

st.markdown("""
<style>
    header, footer {visibility: hidden;}
    body, html, .block-container {margin:0; padding:0; height:100%; width:100%;}
    iframe {border:none;}
</style>
""", unsafe_allow_html=True)

def embed_iframe_top_crop(url: str, hide_top_px: int = 72):
    """
    Embed iframe full viewport, crop top header, tanpa absolute bottom.
    hide_top_px = jumlah pixel yang mau dicrop dari atas iframe
    """
    components.html(f"""
    <div style="height:100vh; overflow:hidden;">
        <iframe src="{url}" 
                style="width:100%; height:calc(100vh + {hide_top_px}px); 
                       margin-top:-{hide_top_px}px;">
        </iframe>
    </div>
    """, height=1000)

iframe_url = "https://ohara.ai/mini-apps/a11f2bf3-af2b-4763-aeb8-53999129c2e5"
embed_iframe_top_crop(iframe_url, hide_top_px=120)
