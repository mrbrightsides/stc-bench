# bench_core/exporter.py
import json
import csv
from pathlib import Path

def json_to_csv_ndjson(json_path, csv_path=None, ndjson_path=None):
    p = Path(json_path)
    with p.open("r", encoding="utf-8") as f:
        data = json.load(f)

    rows = data.get("rows", [])
    if not rows:
        raise ValueError("No rows found in JSON file")

    # use keys union
    keys = set()
    for r in rows:
        keys.update(r.keys())
    keys = sorted(keys)

    # CSV
    if not csv_path:
        csv_path = p.with_suffix(".csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as cf:
        writer = csv.DictWriter(cf, fieldnames=keys)
        writer.writeheader()
        for r in rows:
            writer.writerow({k: r.get(k, "") for k in keys})

    # NDJSON (one json object per line)
    if not ndjson_path:
        ndjson_path = p.with_suffix(".ndjson")
    with open(ndjson_path, "w", encoding="utf-8") as nf:
        for r in rows:
            nf.write(json.dumps(r, ensure_ascii=False) + "\n")

    return str(csv_path), str(ndjson_path)
