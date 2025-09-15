# scenario.json – STC Bench


Standar minimal agar semua run konsisten dan siap diproses STC Analytics.


## Root Fields
- `title` (string): Nama skenario.
- `network` (string): Label jaringan (mis. "Sepolia").
- `rpc_url` (string): **Diisi otomatis dari UI** atau CLI.
- `chain_id` (int, optional)
- `contract_address` (string): 0x…
- `abi` (array|path): **Diisi otomatis** (array JSON dari UI) atau path file.
- `private_keys` (string[], masked): **Diisi otomatis** dari UI/CLI.
- `gas_price_wei` (int, optional): Override gas price.
- `gas_bumping` (bool, optional): Enable bumping sederhana (future work).
- `max_pending` (int, optional): Batas pending di mempool sisi client.
- `actions` (Action[]): Daftar aksi.


## Action
- `name` (string): Nama fungsi di contract (tanpa tanda kurung), contoh: `mint`.
- `params` (array): Argumen fungsi dalam urutan ABI.
- `value_wei` (int, default 0): ETH yang dikirim.
- `repeats` (int, default 1): Berapa kali dipanggil.
- `concurrency` (int, default 1): Worker paralel untuk aksi ini.
- `think_time_ms` (int, default 0): Delay antar submit.


## Contoh: Simple Transfer (ERC20 transfer)
```json
{
"title": "ERC20 Transfer Burst",
"network": "Sepolia",
"chain_id": 11155111,
"contract_address": "0xYourTokenAddress",
"abi": [],
"private_keys": ["<PK1>", "<PK2>"],
"gas_price_wei": null,
"actions": [
{ "name": "transfer", "params": ["0xRecipient", "100000000000000000"], "repeats": 20, "concurrency": 5 }
]
}