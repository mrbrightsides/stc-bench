# bench_core/collector.py
import json
import time
from threading import Lock
import statistics

class ResultsCollector:
    def __init__(self):
        self.meta = {}
        self.transactions = []
        self.rows = []

    def add_transaction(self, tx):
        self.transactions.append(tx)
        # contoh update rows juga
        self.rows.append(tx)

    def set_meta(self, meta):
        self.meta = meta

    def to_dict(self):
        """Return results as dict (for JSON output / Streamlit)"""
        return {
            "meta": self.meta,
            "transactions": self.transactions,
            "rows": self.rows
        }

    def save_json(self, filepath):
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(self.to_dict(), f, indent=2)
