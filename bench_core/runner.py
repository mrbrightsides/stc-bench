# bench_core/runner.py
import os
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
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
        futures = []
        for wid in range(workers):
            futures.append(ex.submit(
                synthetic_worker,
                worker_id=wid,
                iterations=iterations,
                think_time=think_time,
                collector=collector
            ))

        for fut in as_completed(futures):
            # will raise exceptions if worker had error
            fut.result()

    results_file = os.path.join(outdir, f"run-{start_ts}.json")
    collector.save_json(results_file)
    print(f"Saved results -> {results_file}")
    return results_file

if __name__ == "__main__":
    import sys
    scenario = sys.argv[1] if len(sys.argv) > 1 else "scenarios/example_scenario.yaml"
    run_scenario(scenario)
