# ⚡STC Bench

STC Bench adalah modul benchmarking ringan untuk smart contract di jaringan Ethereum (testnet/mainnet).
Tujuannya: mengeksekusi skenario uji, mencatat detail transaksi, lalu men-translate hasilnya ke format standar (CSV/NDJSON) yang siap divisualisasikan di STC Analytics.

---

## ✨ Fitur

- Eksekusi skenario benchmark berbasis YAML.

- Mendukung input contract address dan ABI.

- Output ke outputs/*.json + terjemahan ke:

  - bench_runs.csv

  - bench_tx.csv

  - (opsional) NDJSON untuk pipeline analitik.

- Bisa dijalankan lewat CLI atau UI berbasis Streamlit.

---

## 📦 Instalasi

Clone repo ini lalu install lokal:
```bash
git clone https://github.com/mrbrightsides/stc-bench.git
cd stc-bench
pip install -e .
```

---

## 🚀 Cara Pakai

1. Jalankan Benchmark
```bash
python -m bench_core.runner scenarios/example_scenario.yaml
```
Hasil akan tersimpan di folder outputs/ dengan format run-YYYY-MM-DD_HH-MM-SS.json.

2. Translate ke CSV
```bash
python parse_bench.py
```

3. UI Streamlit (opsional)
```bash
streamlit run ui_streamlit/app.py
```
Masukkan contract address, ABI, dan skenario → hasil otomatis tersimpan di outputs/.

---

## 📊 Format Output

bench_runs.csv
| run\_id | timestamp | network | scenario | contract | function\_name | concurrency | tx\_per\_user | tps\_avg | tps\_peak | p50\_ms | p95\_ms | success\_rate |
| ------- | --------- | ------- | -------- | -------- | -------------- | ----------- | ------------- | -------- | --------- | ------- | ------- | ------------- |

bench_tx.csv
| run\_id | tx\_hash | submitted\_at | mined\_at | latency\_ms | status | gas\_used | gas\_price\_wei | block\_number | function\_name |
| ------- | -------- | ------------- | --------- | ----------- | ------ | --------- | --------------- | ------------- | -------------- |

---

## 🛠️ Roadmap

- Multi-network config (Sepolia, Ganache, Hardhat).

- Integrasi CI/CD.

- Contoh skenario lebih kompleks.

---

📜 Lisensi

MIT License.
