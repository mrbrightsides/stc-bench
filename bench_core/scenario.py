# bench_core/scenario.py
import yaml
from pathlib import Path

def load_scenario(path):
    """Load YAML scenario and return dict."""
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Scenario file not found: {path}")
    with p.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)
