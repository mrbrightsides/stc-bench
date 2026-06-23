import { NextRequest, NextResponse } from 'next/server';
import type { ScenarioConfig, WorkerConfig, BenchmarkResult } from '@/types/benchmark';
import { BenchmarkRunner } from '@/lib/benchmark-runner';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { scenario, contractAddress, contractAbi } = body;

    // Validate input
    if (!scenario || !contractAddress || !contractAbi) {
      return NextResponse.json(
        { error: 'Missing required fields: scenario, contractAddress, contractAbi' },
        { status: 400 }
      );
    }

    // Parse ABI to validate
    let parsedAbi;
    try {
      parsedAbi = JSON.parse(contractAbi);
      if (!Array.isArray(parsedAbi)) {
        throw new Error('ABI must be an array');
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid ABI JSON format' },
        { status: 400 }
      );
    }

    // Update scenario with contract address
    const updatedScenario: ScenarioConfig = {
      ...scenario,
      contract_address: contractAddress
    };

    // Determine worker configuration based on scenario type
    const workerConfig: WorkerConfig = {
      type: updatedScenario.type === 'synthetic' ? 'synthetic' : 'web3',
      network: 'Sepolia',
      rpc_url: 'https://sepolia.infura.io/v3/demo', // Demo RPC for security
      // Never expose real private keys in production
    };

    console.log(`Starting benchmark: ${updatedScenario.name}`);
    console.log(`Worker type: ${workerConfig.type}`);
    console.log(`Network: ${workerConfig.network}`);

    // Create and run benchmark
    const runner = new BenchmarkRunner(updatedScenario, workerConfig);
    const { run, transactions } = await runner.executeBenchmark();

    // Create result structure
    const result: BenchmarkResult = {
      runs: [run],
      transactions,
      summary: {
        total_runs: 1,
        total_transactions: transactions.length,
        overall_success_rate: run.success_rate,
        avg_tps: run.tps_avg,
        networks: [run.network]
      }
    };

    console.log(`Benchmark completed: ${transactions.length} transactions, ${run.success_rate}% success rate`);

    // Return results as JSON
    return NextResponse.json(result);

  } catch (error) {
    console.error('Benchmark execution failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Benchmark execution failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ 
    message: 'STC Bench API - Use POST to run benchmarks',
    version: '1.0.0',
    supported_formats: ['json', 'ndjson'],
    supported_types: ['transfer', 'mint', 'synthetic'],
    networks: ['Sepolia']
  });
}