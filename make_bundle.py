#!/usr/bin/env python3
"""
make_bundle.py
Create a zip bundle containing bench_runs.csv and bench_tx.csv (from outputs/).
Usage:
  python make_bundle.py            # -> bundle latest files in outputs/
  python make_bundle.py --dir outputs
  python make_bundle.py --runs path/to/bench_runs.csv --tx path/to/bench_tx.csv
"""
import argparse
from pathlib import Path
import zipfile
from datetime import datetime
import sys

def find_latest_csvs(outdir: Path):
    runs = sorted(outdir.glob("bench_runs*.csv"), key=lambda p: p.stat().st_mtime, reverse=True)
    tx = sorted(outdir.glob("bench_tx*.csv"), key=lambda p: p.stat().st_mtime, reverse=True)
    return (runs[0] if runs else None, tx[0] if tx else None)

def create_bundle(runs_path: Path, tx_path: Path, outdir: Path):
    ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    bundle_name = outdir / f"bench_bundle_{ts}.zip"
    with zipfile.ZipFile(bundle_name, "w", compression=zipfile.ZIP_DEFLATED) as z:
        if runs_path and runs_path.exists():
            z.write(runs_path, arcname=runs_path.name)
        else:
            print("Warning: bench_runs.csv not found, adding placeholder file.")
            z.writestr("bench_runs.csv", "run_id,timestamp,network,scenario,contract,function_name,concurrency,tx_per_user,tps_avg,tps_peak,p50_ms,p95_ms,success_rate\n")
        if tx_path and tx_path.exists():
            z.write(tx_path, arcname=tx_path.name)
        else:
            print("Warning: bench_tx.csv not found, adding placeholder file.")
            z.writestr("bench_tx.csv", "run_id,tx_hash,submitted_at,mined_at,latency_ms,status,gas_used,gas_price_wei,block_number,function_name\n")
    return bundle_name

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--dir", "-d", default="outputs", help="outputs directory")
    p.add_argument("--runs", help="path to bench_runs.csv (optional)")
    p.add_argument("--tx", help="path to bench_tx.csv (optional)")
    args = p.parse_args()

    outdir = Path(args.dir)
    if not outdir.exists():
        print("Output dir not found:", outdir)
        sys.exit(1)

    runs_path = Path(args.runs) if args.runs else None
    tx_path = Path(args.tx) if args.tx else None

    if not runs_path or not tx_path:
        found_runs, found_tx = find_latest_csvs(outdir)
        runs_path = runs_path or found_runs
        tx_path = tx_path or found_tx

    bundle = create_bundle(runs_path, tx_path, outdir)
    print("Created bundle:", bundle)

if __name__ == "__main__":
    main()
