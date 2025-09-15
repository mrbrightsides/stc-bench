import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

# --- pastikan sys.path mengenal bench_core ---
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from bench_core.scenario import load_scenario
from bench_core.workers import synthetic_worker
from bench_core.collector import ResultsCollector

def run_scenario(scenario_path, outdir="outputs"):
    scenario = load_scenario(scenario_path)
    workers = int(scenario.get("workers", 4))
    iterations = int(scenario.get("iterations_per_worker", 100))
    think_time = float(scenario.get("think_time_seconds", 0.01))

    collector = ResultsCollector()
    os.makedirs(outdir, exist_ok=True)
    start_ts = time.strftime("%Y-%m-%d_%H-%M-%S")

    with ThreadPoolExecutor(max_workers=workers) as ex:
        futures = [
            ex.submit(
                synthetic_worker,
                worker_id=wid,
                iterations=iterations,
                think_time=think_time,
                collector=collector
            )
            for wid in range(workers)
        ]
        for fut in as_completed(futures):
            fut.result()  # raise exception if worker fails

    results_file = os.path.join(outdir, f"run-{start_ts}.json")
    collector.save_json(results_file)
    print(json.dumps({
        "results_file": results_file,
        "meta": getattr(collector, "meta", {}),
        "transactions": getattr(collector, "transactions", [])
    }))  # print JSON supaya Streamlit bisa baca stdout
    return results_file

if __name__ == "__main__":
    import json
    import sys
    scenario_file = sys.argv[1] if len(sys.argv) > 1 else "scenarios/example_scenario.yaml"
    run_scenario(scenario_file, outdir="outputs")
