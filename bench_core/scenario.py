try:
    import yaml
except ModuleNotFoundError:
    print("PyYAML not found! Install via requirements.txt")
    raise

def load_scenario(path):
    """
    Load YAML scenario file and return as dict
    """
    with open(path, "r", encoding="utf-8") as f:
        try:
            scenario = yaml.safe_load(f)
        except Exception as e:
            raise ValueError(f"Failed to parse YAML scenario: {e}")
    return scenario
