use spacetimedb::{table, reducer, ReducerContext, Table};

#[table(name = benchmark_run, public)]
#[derive(Clone)]
pub struct BenchmarkRun {
    #[primary_key]
    run_id: String,
    #[index(btree)]
    timestamp: String,
    #[index(btree)]
    network: String,
    scenario: String,
    contract: String,
    function_name: String,
    concurrency: u32,
    tx_per_user: u32,
    tps_avg: f64,
    tps_peak: f64,
    p50_ms: u32,
    p95_ms: u32,
    success_rate: f64,
}

#[table(name = benchmark_transaction, public)]
#[derive(Clone)]
pub struct BenchmarkTransaction {
    #[primary_key]
    tx_hash: String,
    #[index(btree)]
    run_id: String,
    submitted_at: String,
    mined_at: String,
    latency_ms: u32,
    status: String,
    gas_used: u32,
    gas_price_wei: String,
    block_number: u32,
    function_name: String,
}

#[reducer]
pub fn save_benchmark_run(
    ctx: &ReducerContext,
    run_id: String,
    timestamp: String,
    network: String,
    scenario: String,
    contract: String,
    function_name: String,
    concurrency: u32,
    tx_per_user: u32,
    tps_avg: f64,
    tps_peak: f64,
    p50_ms: u32,
    p95_ms: u32,
    success_rate: f64,
) -> Result<(), String> {
    let row = BenchmarkRun {
        run_id,
        timestamp,
        network,
        scenario,
        contract,
        function_name,
        concurrency,
        tx_per_user,
        tps_avg,
        tps_peak,
        p50_ms,
        p95_ms,
        success_rate,
    };

    match ctx.db.benchmark_run().try_insert(row) {
        Ok(_) => Ok(()),
        Err(e) => {
            let msg = format!("Failed to insert BenchmarkRun: {}", e);
            spacetimedb::log::error!("{}", msg);
            Err(msg)
        }
    }
}

#[reducer]
pub fn save_benchmark_transaction(
    ctx: &ReducerContext,
    tx_hash: String,
    run_id: String,
    submitted_at: String,
    mined_at: String,
    latency_ms: u32,
    status: String,
    gas_used: u32,
    gas_price_wei: String,
    block_number: u32,
    function_name: String,
) -> Result<(), String> {
    let row = BenchmarkTransaction {
        tx_hash,
        run_id,
        submitted_at,
        mined_at,
        latency_ms,
        status,
        gas_used,
        gas_price_wei,
        block_number,
        function_name,
    };

    match ctx.db.benchmark_transaction().try_insert(row) {
        Ok(_) => Ok(()),
        Err(e) => {
            let msg = format!("Failed to insert BenchmarkTransaction: {}", e);
            spacetimedb::log::error!("{}", msg);
            Err(msg)
        }
    }
}

// Note: Reducers do not return data in SpacetimeDB. Clients should subscribe to the
// public tables (benchmark_run, benchmark_transaction) and query/filter client-side.

#[reducer]
pub fn get_all_runs(_ctx: &ReducerContext) -> Result<(), String> {
    // Clients can subscribe to benchmark_run and order by timestamp descending client-side.
    Ok(())
}

#[reducer]
pub fn get_runs_by_network(_ctx: &ReducerContext, _network: String) -> Result<(), String> {
    // Clients can subscribe to benchmark_run and filter by the 'network' field client-side.
    Ok(())
}

#[reducer]
pub fn get_transactions_by_run(_ctx: &ReducerContext, _run_id: String) -> Result<(), String> {
    // Clients can subscribe to benchmark_transaction and filter by 'run_id' client-side.
    Ok(())
}

#[reducer]
pub fn delete_run(ctx: &ReducerContext, run_id: String) -> Result<(), String> {
    // Delete the run
    ctx.db.benchmark_run().run_id().delete(&run_id);

    // Collect and delete associated transactions
    let mut to_delete: Vec<String> = Vec::new();
    for tx in ctx.db.benchmark_transaction().iter() {
        if tx.run_id == run_id {
            to_delete.push(tx.tx_hash.clone());
        }
    }

    for hash in to_delete.iter() {
        ctx.db.benchmark_transaction().tx_hash().delete(hash);
    }

    Ok(())
}