import streamlit as st

st.set_page_config(page_title="Single Module STC", layout="wide")

# --- Sidebar (opsional) ---
with st.sidebar:
    st.title("🔧 Controls")
    url = st.text_input("Iframe URL", value="https://stc-analytics.streamlit.app/")
    width = st.slider("Width", 200, 1200, 1000)
    height = st.slider("Height", 200, 800, 600)

# --- Main area: iframe langsung ---
st.header("📊 STC Module")
if url:
    st.markdown(
        f'<iframe src="{url}" width="{width}" height="{height}" frameborder="0"></iframe>',
        unsafe_allow_html=True
    )
else:
    st.info("Enter a URL in the sidebar to embed the module.")
