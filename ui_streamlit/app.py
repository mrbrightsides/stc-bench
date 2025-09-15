import streamlit as st
import streamlit.components.v1 as components

st.set_page_config(page_title="STC Benchmarking", layout="wide")
st.markdown("""
<style>
    /* Streamlit */
    footer {visibility: hidden;}
    
    /* Ohara iframe wrapper */
    iframe {border: none;}
    
    /* Body/Container full height */
    body, html, .block-container {margin:0; padding:0; height:100%; width:100%;}

    /* Hide bottom drag handle from Ohara */
    div.absolute.bottom-0 {display: none !important;}
</style>
""", unsafe_allow_html=True)

# URL iframe
iframe_url = "https://ohara.ai/mini-apps/a11f2bf3-af2b-4763-aeb8-53999129c2e5"

# Render iframe: crop top, hide bottom, responsive full height minus crop
top_crop = 120  # px
st.markdown(
    f"""
    <div style="position:relative; width:100%; height:100vh; overflow:hidden;">
        <iframe src="{iframe_url}"
            style="position:absolute; top:-{top_crop}px; left:0;
                   width:100%; height:calc(100vh + {top_crop}px);">
        </iframe>
    </div>
    """,
    unsafe_allow_html=True
)
