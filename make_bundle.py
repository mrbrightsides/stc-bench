import zipfile
from pathlib import Path

def create_bundle(runs_csv: Path, tx_csv: Path, output_dir: Path) -> Path:
    """Membuat zip bundle dari bench_runs.csv dan bench_tx.csv"""
    if not runs_csv.exists() or not tx_csv.exists():
        raise FileNotFoundError("❌ File runs/tx CSV tidak ditemukan")

    output_dir.mkdir(parents=True, exist_ok=True)
    bundle_path = output_dir / "bench_bundle.zip"

    with zipfile.ZipFile(bundle_path, "w") as zipf:
        zipf.write(runs_csv, runs_csv.name)
        zipf.write(tx_csv, tx_csv.name)

    return bundle_path

if __name__ == "__main__":
    # Contoh manual run
    runs = Path("outputs/bench_runs.csv")
    tx = Path("outputs/bench_tx.csv")
    out = Path("outputs")
    bundle = create_bundle(runs, tx, out)
    print("Bundle:", bundle)
