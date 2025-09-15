import json
import csv
import uuid
from datetime import datetime
from pathlib import Path
import os

from make_bundle import create_bundle

INPUT_FILE = "outputs/run-2025-09-15_12-54-37.json"
RUNS_CSV = Path("outputs/bench_runs.csv")
TX_CSV = Path("outputs/bench_tx.csv")

def parse_caliper_report():
    with open(INPUT_FILE, "r") as f:
        data = json.load(f)

    run_id = str(uuid.uuid4())

    # --- bench_runs.csv ---
    run_info = {
        "run_id": run_id,
        "timestamp": datetime.utcnow().isoformat(),
        "network": data.get("network", "unknown"),
        "scenario": data.get("test", {}).get("name", "default_scenario"),
        "contract": data.get("contractAddress", "0x0"),
        "function_name": data.get("test", {}).get("operation", "unknown"),
        "concurrency": data.get("test", {}).get("workers", 1),
        "tx_per_user": data.get("test", {}).get("txPerClient", 0),
        "tps_avg": data.get("metrics", {}).get("tps", {}).get("average", 0),
        "tps_peak": data.get("metrics", {}).get("tps", {}).get("peak", 0),
        "p50_ms": data.get("metrics", {}).get("latency", {}).get("50th", 0),
        "p95_ms": data.get("metrics", {}).get("latency", {}).get("95th", 0),
        "success_rate": data.get("metrics", {}).get("successRate", 0),
    }

    RUNS_CSV.parent.mkdir(parents=True, exist_ok=True)
    with open(RUNS_CSV, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=run_info.keys())
        writer.writeheader()
        writer.writerow(run_info)

    # --- bench_tx.csv ---
    tx_records = []
    for tx in data.get("transactions", []):
        tx_records.append({
            "run_id": run_id,
            "tx_hash": tx.get("hash"),
            "submitted_at": tx.get("submitted"),
            "mined_at": tx.get("mined"),
            "latency_ms": tx.get("latency", 0),
            "status": tx.get("status", "UNKNOWN"),
            "gas_used": tx.get("gasUsed", 0),
            "gas_price_wei": tx.get("gasPrice", 0),
            "block_number": tx.get("blockNumber", 0),
            "function_name": tx.get("function", "unknown")
        })

    if tx_records:
        with open(TX_CSV, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=tx_records[0].keys())
            writer.writeheader()
            writer.writerows(tx_records)
    else:
        with open(TX_CSV, "w", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["run_id","tx_hash","submitted_at","mined_at","latency_ms","status","gas_used","gas_price_wei","block_number","function_name"])

    print(f"✅ Parsed: {RUNS_CSV} & {TX_CSV}")

def bundle_if_ready():
    if RUNS_CSV.exists() and TX_CSV.exists():
        bundle = create_bundle(RUNS_CSV, TX_CSV, Path("outputs"))
        print("📦 Bundle created:", bundle)
    else:
        print("⚠️ bench_runs.csv & bench_tx.csv belum ada, jalankan parse dulu.")

if __name__ == "__main__":
    parse_caliper_report()
    bundle_if_ready()
