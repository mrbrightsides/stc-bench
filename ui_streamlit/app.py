import streamlit as st
import streamlit.components.v1 as components

# Page config: wide biar sidebar bisa muncul
st.set_page_config(page_title="STC Benchmarking", layout="wide")

# Hide Streamlit header/footer
st.markdown("""
<style>
    header, footer {visibility: hidden;}
    body, html, .block-container {margin:0; padding:0; height:100%; width:100%;}
    iframe {border:none;}
</style>
""", unsafe_allow_html=True)

# Sidebar content (collapsible by default)
with st.sidebar:
    st.title("Menu")
    st.write("Ini sidebar collabsible")
    option = st.radio("Pilih modul:", ["A", "B", "C"])

# Fungsi embed iframe crop top
def embed_iframe(url: str, hide_top_px: int = 72):
    """
    Embed iframe full viewport, crop top, sisain space sidebar
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
embed_iframe(iframe_url, hide_top_px=120)
