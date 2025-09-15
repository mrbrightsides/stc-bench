# bench_core/workers.py
import time
import uuid
from bench_core.utils import now_ms

def synthetic_worker(worker_id, iterations, think_time, collector):
    """
    Simple synthetic worker that simulates work by sleeping.
    collector must have a .record(dict) method.
    """
    for i in range(iterations):
        req_id = f"{worker_id}-{i}-{uuid.uuid4().hex[:6]}"
        t0 = now_ms()
        # simulate work (replace with real web3 tx code later)
        time.sleep(think_time)
        t1 = now_ms()
        latency_ms = t1 - t0
        collector.record({
            "worker_id": worker_id,
            "iteration": i,
            "req_id": req_id,
            "latency_ms": latency_ms,
            "timestamp_ms": t1
        })
