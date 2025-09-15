# bench_core/web3_worker.py
from web3 import Web3
import time
import uuid
from bench_core.utils import now_ms

def web3_worker(
    worker_id: int,
    iterations: int,
    think_time: float,
    collector,
    rpc_url: str,
    privkey: str,
    contract_address: str = None,
    abi: list = None,
    action_callable = None
):
    """
    Simple web3 worker that signs and sends transactions.
    - action_callable(contract, w3, account, iteration) -> dict row
      if provided, it's used to build/send tx and returns dict with keys:
      txhash, gasUsed, gasPrice, status, latency_ms, timestamp_ms, error(optional)
    """
    w3 = Web3(Web3.HTTPProvider(rpc_url))
    acct = w3.eth.account.from_key(privkey)
    nonce_base = w3.eth.get_transaction_count(acct.address)

    # optional contract instance
    contract = None
    if contract_address and abi:
        contract = w3.eth.contract(address=Web3.to_checksum_address(contract_address), abi=abi)

    for i in range(iterations):
        req_id = f"{worker_id}-{i}-{uuid.uuid4().hex[:6]}"
        t0 = now_ms()
        try:
            if action_callable:
                # action_callable expected to handle tx build/sign/send/wait
                res = action_callable(contract, w3, acct, i, nonce_base + i)
                res.update({"worker_id": worker_id, "iteration": i, "req_id": req_id})
            else:
                # Default: send tiny ETH transfer to self (useful as heartbeat)
                to = acct.address
                tx = {
                    "to": to,
                    "value": 0,
                    "gas": 21000,
                    "gasPrice": w3.eth.gas_price,
                    "nonce": nonce_base + i,
                    "chainId": w3.eth.chain_id
                }
                signed = acct.sign_transaction(tx)
                txh = w3.eth.send_raw_transaction(signed.rawTransaction)
                receipt = w3.eth.wait_for_transaction_receipt(txh, timeout=120)
                latency_ms = now_ms() - t0
                res = {
                    "txhash": txh.hex(),
                    "gasUsed": receipt.gasUsed,
                    "gasPrice": tx["gasPrice"],
                    "status": receipt.status,
                    "latency_ms": latency_ms,
                    "timestamp_ms": now_ms()
                }
                res.update({"worker_id": worker_id, "iteration": i, "req_id": req_id})
        except Exception as e:
            latency_ms = now_ms() - t0
            res = {
                "error": str(e),
                "latency_ms": latency_ms,
                "timestamp_ms": now_ms(),
                "worker_id": worker_id,
                "iteration": i,
                "req_id": req_id
            }
        collector.record(res)
        time.sleep(think_time)
