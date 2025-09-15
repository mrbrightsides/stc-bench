import streamlit as st

# set full-page layout
st.set_page_config(layout="wide")

# iframe URL dengan hideTop=100
iframe_url = "https://ohara.ai/mini-apps/a11f2bf3-af2b-4763-aeb8-53999129c2e5?hideTop=1000"

# tampilkan iframe full-screen
st.markdown(
    f'''
    <iframe src="{iframe_url}" 
            style="width:100%; height:100vh; border:none;" 
            allowfullscreen>
    </iframe>
    ''',
    unsafe_allow_html=True
)
