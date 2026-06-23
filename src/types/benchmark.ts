export interface ContractInput {
  address: string;
  abi: string;
}

export interface ScenarioConfig {
  name: string;
  type: 'transfer' | 'mint' | 'synthetic';
  contract_address: string;
  function_name: string;
  concurrency: number;
  tx_per_user: number;
  duration_seconds?: number;
  gas_limit?: number;
  gas_price_gwei?: number;
  parameters?: Record<string, unknown>;
}

export interface BenchmarkRun {
  run_id: string;
  timestamp: string;
  network: string;
  scenario: string;
  contract: string;
  function_name: string;
  concurrency: number;
  tx_per_user: number;
  tps_avg: number;
  tps_peak: number;
  p50_ms: number;
  p95_ms: number;
  success_rate: number;
  total_transactions: number;
  total_duration_ms: number;
}

export interface BenchmarkTransaction {
  run_id: string;
  tx_hash: string;
  submitted_at: string;
  mined_at: string;
  latency_ms: number;
  status: 'success' | 'failed' | 'pending';
  gas_used: number;
  gas_price_wei: string;
  block_number: number;
  function_name: string;
  error_message?: string;
}

export interface BenchmarkResult {
  runs: BenchmarkRun[];
  transactions: BenchmarkTransaction[];
  summary: {
    total_runs: number;
    total_transactions: number;
    overall_success_rate: number;
    avg_tps: number;
    networks: string[];
  };
}

export interface WorkerConfig {
  type: 'synthetic' | 'web3';
  network: string;
  rpc_url: string;
  private_key?: string;
  wallet_address?: string;
}

export const DEFAULT_SCENARIO_YAML = `# STC Bench Scenario Configuration
name: "Transfer Benchmark"
type: "transfer"
contract_address: "0x..."
function_name: "transfer"
concurrency: 5
tx_per_user: 10
duration_seconds: 60
gas_limit: 21000
gas_price_gwei: 20
parameters:
  to: "0x..."
  value: "1000000000000000000"  # 1 ETH in wei
`;

export const SAMPLE_ABI = `[
  {
    "inputs": [
      {"name": "to", "type": "address"},
      {"name": "value", "type": "uint256"}
    ],
    "name": "transfer",
    "outputs": [{"name": "", "type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]`;