# bench_core/collector.py
import json
import time
from threading import Lock
import statistics

class ResultsCollector:
    def __init__(self):
        self.rows = []
        self.lock = Lock()

    def record(self, row: dict):
        with self.lock:
            self.rows.append(row)

    def stats(self):
        lat = [r["latency_ms"] for r in self.rows if "latency_ms" in r]
        if not lat:
            return {}
        lat_sorted = sorted(lat)
        n = len(lat_sorted)
        def pct(p):
            idx = min(n-1, max(0, int(p * n) - 1))
            return lat_sorted[idx]
        return {
            "count": n,
            "min_ms": lat_sorted[0],
            "max_ms": lat_sorted[-1],
            "mean_ms": statistics.mean(lat_sorted),
            "p50_ms": pct(0.5),
            "p95_ms": pct(0.95)
        }

    def save_json(self, path):
        out = {
            "meta": {
                "generated_at": int(time.time()*1000),
                "summary": self.stats()
            },
            "rows": self.rows
        }
        with open(path, "w", encoding="utf-8") as f:
            json.dump(out, f, indent=2)
