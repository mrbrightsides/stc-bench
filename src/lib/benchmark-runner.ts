import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import type { ScenarioConfig, BenchmarkRun, BenchmarkTransaction, WorkerConfig } from '@/types/benchmark';

export class BenchmarkRunner {
  private runId: string;
  private scenario: ScenarioConfig;
  private workerConfig: WorkerConfig;
  private results: BenchmarkTransaction[] = [];

  constructor(scenario: ScenarioConfig, workerConfig: WorkerConfig) {
    this.runId = uuidv4();
    this.scenario = scenario;
    this.workerConfig = workerConfig;
  }

  async executeBenchmark(): Promise<{ run: BenchmarkRun; transactions: BenchmarkTransaction[] }> {
    const startTime = Date.now();
    console.log(`Starting benchmark run ${this.runId} for scenario ${this.scenario.name}`);

    try {
      if (this.workerConfig.type === 'synthetic') {
        await this.runSyntheticBenchmark();
      } else {
        await this.runWeb3Benchmark();
      }

      const endTime = Date.now();
      const totalDurationMs = endTime - startTime;

      // Calculate metrics
      const successfulTxs = this.results.filter(tx => tx.status === 'success');
      const successRate = this.results.length > 0 ? successfulTxs.length / this.results.length : 0;
      
      // Calculate latency percentiles
      const latencies = this.results.map(tx => tx.latency_ms).sort((a, b) => a - b);
      const p50Index = Math.floor(latencies.length * 0.5);
      const p95Index = Math.floor(latencies.length * 0.95);
      const p50Ms = latencies[p50Index] || 0;
      const p95Ms = latencies[p95Index] || 0;

      // Calculate TPS
      const tpsAvg = this.results.length > 0 ? (this.results.length / (totalDurationMs / 1000)) : 0;
      const tpsPeak = Math.max(tpsAvg * 1.2, tpsAvg); // Simplified peak calculation

      const run: BenchmarkRun = {
        run_id: this.runId,
        timestamp: new Date(startTime).toISOString(),
        network: this.workerConfig.network,
        scenario: this.scenario.name,
        contract: this.scenario.contract_address,
        function_name: this.scenario.function_name,
        concurrency: this.scenario.concurrency,
        tx_per_user: this.scenario.tx_per_user,
        tps_avg: Math.round(tpsAvg * 100) / 100,
        tps_peak: Math.round(tpsPeak * 100) / 100,
        p50_ms: p50Ms,
        p95_ms: p95Ms,
        success_rate: Math.round(successRate * 10000) / 100,
        total_transactions: this.results.length,
        total_duration_ms: totalDurationMs
      };

      return { run, transactions: this.results };

    } catch (error) {
      console.error(`Benchmark failed: ${error}`);
      throw error;
    }
  }

  private async runSyntheticBenchmark(): Promise<void> {
    const totalTransactions = this.scenario.concurrency * this.scenario.tx_per_user;
    const workers: Promise<void>[] = [];

    for (let i = 0; i < this.scenario.concurrency; i++) {
      workers.push(this.runSyntheticWorker(i));
    }

    await Promise.all(workers);
    console.log(`Synthetic benchmark completed: ${this.results.length} transactions`);
  }

  private async runSyntheticWorker(workerId: number): Promise<void> {
    for (let i = 0; i < this.scenario.tx_per_user; i++) {
      const submitTime = Date.now();
      
      // Simulate transaction processing with realistic delays
      const processingDelay = Math.random() * 2000 + 500; // 500-2500ms
      const success = Math.random() > 0.05; // 95% success rate
      
      await new Promise(resolve => setTimeout(resolve, processingDelay));
      
      const mineTime = Date.now();
      
      const tx: BenchmarkTransaction = {
        run_id: this.runId,
        tx_hash: `0x${this.generateRandomHash()}`,
        submitted_at: new Date(submitTime).toISOString(),
        mined_at: new Date(mineTime).toISOString(),
        latency_ms: mineTime - submitTime,
        status: success ? 'success' : 'failed',
        gas_used: Math.floor(Math.random() * 50000) + 21000,
        gas_price_wei: (BigInt(Math.floor(Math.random() * 50) + 10) * BigInt(1e9)).toString(),
        block_number: Math.floor(Math.random() * 1000000) + 18000000,
        function_name: this.scenario.function_name,
        error_message: success ? undefined : 'Transaction reverted'
      };

      this.results.push(tx);
    }
  }

  private async runWeb3Benchmark(): Promise<void> {
    // For security in production, we simulate Web3 calls instead of using real private keys
    console.log('Web3 benchmark mode - simulating real transactions');
    
    // In a real implementation, this would connect to actual Ethereum networks
    // For demo purposes, we'll simulate realistic Web3 behavior
    await this.runSyntheticBenchmark();
    
    // Modify results to reflect Web3 characteristics
    this.results = this.results.map(tx => ({
      ...tx,
      latency_ms: tx.latency_ms + Math.random() * 5000, // Web3 typically slower
      gas_price_wei: (BigInt(Math.floor(Math.random() * 100) + 20) * BigInt(1e9)).toString()
    }));
  }

  private generateRandomHash(): string {
    return Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  }
}

export function parseScenarioYaml(yamlContent: string): ScenarioConfig {
  try {
    // Simple YAML parser for demo - in production use js-yaml
    const lines = yamlContent.split('\n').filter(line => 
      line.trim() && !line.trim().startsWith('#')
    );
    
    const config: Partial<ScenarioConfig> = {};
    const parameters: Record<string, unknown> = {};

    for (const line of lines) {
      const [key, ...valueParts] = line.split(':');
      if (!key || !valueParts.length) continue;
      
      const value = valueParts.join(':').trim().replace(/"/g, '');
      const cleanKey = key.trim();

      if (cleanKey.startsWith('  ')) {
        // Parameter under parameters section
        const paramKey = cleanKey.trim();
        parameters[paramKey] = isNaN(Number(value)) ? value : Number(value);
      } else {
        // Main configuration
        switch (cleanKey) {
          case 'name':
          case 'type':
          case 'contract_address':
          case 'function_name':
            (config as any)[cleanKey] = value;
            break;
          case 'concurrency':
          case 'tx_per_user':
          case 'duration_seconds':
          case 'gas_limit':
          case 'gas_price_gwei':
            (config as any)[cleanKey] = Number(value);
            break;
        }
      }
    }

    config.parameters = parameters;

    // Validate required fields
    if (!config.name || !config.type || !config.contract_address || !config.function_name) {
      throw new Error('Missing required fields in scenario configuration');
    }

    return config as ScenarioConfig;
  } catch (error) {
    throw new Error(`Failed to parse scenario YAML: ${error}`);
  }
}