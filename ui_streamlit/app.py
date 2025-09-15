import streamlit as st
import streamlit.components.v1 as components

# Page config full width
st.set_page_config(page_title="STC Single Module", layout="wide")

# Optional: hide Streamlit header/footer
st.markdown("""
<style>
    header, footer {visibility: hidden;}
    body, html, .block-container {margin:0; padding:0; height:100%; width:100%;}
</style>
""", unsafe_allow_html=True)

def embed_iframe(url: str, hide_top: int = 120):
    """
    Embed iframe full viewport dengan opsi crop atas (hide_top).
    """
    # Ambil height dari query params jika ada, default 800
    height = int(st.query_params.get("height", ["800"])[0])

    components.html(f"""
    <div style="position:relative; width:100%; height:100vh; overflow:hidden;">
        <iframe src="{url}" 
                style="position:absolute; top:-{hide_top}px; left:0; width:100%; height:calc(100vh + {hide_top}px); border:none;">
        </iframe>
    </div>
    """, height=height)

# Panggil iframe
iframe_url = "https://ohara.ai/mini-apps/a11f2bf3-af2b-4763-aeb8-53999129c2e5"
embed_iframe(iframe_url, hide_top=72)
