import streamlit as st
import streamlit.components.v1 as components

# Page config full width
st.set_page_config(page_title="STC Single Module", layout="wide")

# Hide Streamlit header & footer
st.markdown("""
<style>
    header {visibility: hidden;}
    footer {visibility: hidden;}
    body, html, .block-container {margin: 0; padding: 0; height: 100%; width: 100%;}
</style>
""", unsafe_allow_html=True)

def embed_iframe(url: str, hide_top: int = 0, hide_bottom: int = 0):
    """
    Embed iframe full viewport dengan opsi crop atas/bawah.
    """
    # Hitung tinggi iframe + container
    total_height = f"calc(100vh + {hide_bottom}px)"
    top_offset = f"-{hide_top}px"

    components.html(f"""
    <div style="position:relative; width:100%; height:100vh; overflow:hidden;">
        <iframe src="{url}" 
                style="position:absolute; top:{top_offset}; left:0; width:100%; height:{total_height}; border:none;">
        </iframe>
    </div>
    """, height=st.query_params().get("height", [800])[0])

# Panggil iframe
iframe_url = "https://ohara.ai/mini-apps/a11f2bf3-af2b-4763-aeb8-53999129c2e5"
embed_iframe(iframe_url, hide_top=72, hide_bottom=72)
