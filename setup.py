from setuptools import setup, find_packages

setup(
    name="stc-bench",
    version="0.1.0",
    description="STC Bench - Blockchain benchmarking toolkit",
    author="ELPEEF",
    packages=find_packages(include=["bench_core", "bench_core.*"]),
    install_requires=[
        "streamlit",
        "pandas",
        "pyyaml",
        "web3",
        "eth-utils",
    ],
    python_requires=">=3.8",
)
