import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(
    page_title="STC Benchmarking",
    page_icon="⚡",
    layout="wide"
)

with st.sidebar:
    st.sidebar.image(
        "https://i.imgur.com/7j5aq4l.png",
        use_container_width=True
    )
    st.sidebar.markdown("📘 **About**")
    st.sidebar.markdown("""
    STC Bench adalah modul benchmarking ringan untuk smart contract di jaringan Ethereum (testnet/mainnet).
    Tujuannya: mengeksekusi skenario uji, mencatat detail transaksi, lalu men-translate hasilnya ke format standar (CSV/NDJSON) yang siap divisualisasikan di STC Analytics.
       
    # 📜 Contract & Scenario
    Masukkan Contract Address, ABI, dan pilih file skenario benchmark (YAML)
    
    # ▶️ Run Benchmark
    Jalankan skenario dan hasil akan bisa di unduh, simpang di folder `outputs/`
       
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
    9. [DataHub](https://stc-data.streamlit.app/)

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

def embed_iframe(src, hide_top_px=72, height=800):
    components.html(f"""
    <div style="height:{height}px; overflow:hidden; position:relative;">
        <iframe src="{src}" 
                style="width:100%; height:{height + hide_top_px}px; border:none; position:relative; top:-{hide_top_px}px;">
        </iframe>
    </div>
    """, height=height)

# URL Ohara
iframe_url = "https://ohara.ai/mini-apps/a11f2bf3-af2b-4763-aeb8-53999129c2e5"

# Panggil fungsi
embed_iframe(iframe_url, hide_top_px=120, height=800)
