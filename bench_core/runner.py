# bench_core/runner.py
import os
import time
import json
from concurrent.futures import ThreadPoolExecutor, as_completed
from bench_core.scenario import load_scenario
from bench_core.workers import synthetic_worker
from bench_core.collector import ResultsCollector

def run_scenario(scenario_path, outdir=None, save_file=True):
    scenario = load_scenario(scenario_path)
    workers = int(scenario.get("workers", 4))
    iterations = int(scenario.get("iterations_per_worker", 100))
    think_time = float(scenario.get("think_time_seconds", 0.01))

    collector = ResultsCollector()
    start_ts = time.strftime("%Y-%m-%d_%H-%M-%S")

    try:
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
                fut.result()  # raise exception if worker failed
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        return

    # optional save ke file
    results_data = collector.to_dict()  # ambil dict sebelum save
    if save_file and outdir:
        os.makedirs(outdir, exist_ok=True)
        results_file = os.path.join(outdir, f"run-{start_ts}.json")
        collector.save_json(results_file)
        print(f"Saved results -> {results_file}")

    # print JSON ke stdout supaya Streamlit bisa baca
    print(json.dumps(results_data))

    return results_data

if __name__ == "__main__":
    import sys
    scenario_file = sys.argv[1] if len(sys.argv) > 1 else "scenarios/example_scenario.yaml"
    # default outdir = "outputs" biar kompatibel
    run_scenario(scenario_file, outdir="outputs", save_file=True)
