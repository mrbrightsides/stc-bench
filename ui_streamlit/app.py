import streamlit as st

# Page config full width
st.set_page_config(page_title="STC Single Module", layout="wide")

# Hide Streamlit header & footer
st.markdown("""
<style>
    header {visibility: hidden;}
    footer {visibility: hidden;}
    iframe {border: none;}
    body, html, .block-container {margin: 0; padding: 0; height: 100%; width: 100%;}
</style>
""", unsafe_allow_html=True)

# Fixed iframe URL, full width & height
iframe_url = "https://ohara.ai/mini-apps/a11f2bf3-af2b-4763-aeb8-53999129c2e5"
st.markdown(
    f'<iframe src="{iframe_url}" style="width:100%; height:100vh;"></iframe>',
    unsafe_allow_html=True
)
