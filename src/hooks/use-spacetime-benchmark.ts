'use client';

import { useState, useEffect, useRef } from 'react';
import { DbConnection, type BenchmarkRun as SpacetimeBenchmarkRun, type BenchmarkTransaction as SpacetimeBenchmarkTransaction } from '@/spacetime_module_bindings';
import type { BenchmarkRun, BenchmarkTransaction } from '@/types/benchmark';

const STORAGE_KEY_RUNS = 'stc-bench-runs';
const STORAGE_KEY_TXS = 'stc-bench-transactions';

export function useSpacetimeBenchmark() {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [runs, setRuns] = useState<BenchmarkRun[]>([]);
  const [transactions, setTransactions] = useState<BenchmarkTransaction[]>([]);
  const [useLocalStorage, setUseLocalStorage] = useState<boolean>(false);
  const connectionRef = useRef<DbConnection | null>(null);

  useEffect(() => {
    // Load from localStorage first
    const loadFromLocalStorage = (): void => {
      try {
        const storedRuns = localStorage.getItem(STORAGE_KEY_RUNS);
        const storedTxs = localStorage.getItem(STORAGE_KEY_TXS);
        
        if (storedRuns) {
          setRuns(JSON.parse(storedRuns));
        }
        if (storedTxs) {
          setTransactions(JSON.parse(storedTxs));
        }
      } catch (err) {
        console.error('Failed to load from localStorage:', err);
      }
    };

    loadFromLocalStorage();

    const connectToSpacetime = async (): Promise<void> => {
      if (connectionRef.current || isConnecting) return;

      setIsConnecting(true);
      setError(null);

      try {
        const spacetimeUrl = process.env.NEXT_PUBLIC_SPACETIME_URL;
        
        // If no SpacetimeDB URL configured, use localStorage
        if (!spacetimeUrl || spacetimeUrl === 'ws://localhost:3000') {
          console.log('SpacetimeDB not configured, using localStorage for persistence');
          setUseLocalStorage(true);
          setIsConnected(true);
          setIsConnecting(false);
          return;
        }

        const connection = await DbConnection.builder()
          .withUri(spacetimeUrl)
          .withModuleName(process.env.NEXT_PUBLIC_SPACETIME_MODULE || 'stc_bench')
          .build();

        connectionRef.current = connection;
        setUseLocalStorage(false);

        // Subscribe to benchmark runs table
        connection.db.benchmarkRun.onInsert((ctx, row) => {
          const mappedRun: BenchmarkRun = {
            run_id: row.runId,
            timestamp: row.timestamp,
            network: row.network,
            scenario: row.scenario,
            contract: row.contract,
            function_name: row.functionName,
            concurrency: row.concurrency,
            tx_per_user: row.txPerUser,
            tps_avg: row.tpsAvg,
            tps_peak: row.tpsPeak,
            p50_ms: row.p50Ms,
            p95_ms: row.p95Ms,
            success_rate: row.successRate,
            total_transactions: 0,
            total_duration_ms: 0
          };
          setRuns(prev => [...prev, mappedRun]);
        });

        // Subscribe to transactions table
        connection.db.benchmarkTransaction.onInsert((ctx, row) => {
          const mappedTx: BenchmarkTransaction = {
            run_id: row.runId,
            tx_hash: row.txHash,
            submitted_at: row.submittedAt,
            mined_at: row.minedAt,
            latency_ms: row.latencyMs,
            status: row.status,
            gas_used: row.gasUsed,
            gas_price_wei: row.gasPriceWei,
            block_number: row.blockNumber,
            function_name: row.functionName
          };
          setTransactions(prev => [...prev, mappedTx]);
        });

        // Load initial data from subscriptions
        const initialRuns: BenchmarkRun[] = [];
        for (const row of connection.db.benchmarkRun.iter()) {
          initialRuns.push({
            run_id: row.runId,
            timestamp: row.timestamp,
            network: row.network,
            scenario: row.scenario,
            contract: row.contract,
            function_name: row.functionName,
            concurrency: row.concurrency,
            tx_per_user: row.txPerUser,
            tps_avg: row.tpsAvg,
            tps_peak: row.tpsPeak,
            p50_ms: row.p50Ms,
            p95_ms: row.p95Ms,
            success_rate: row.successRate,
            total_transactions: 0,
            total_duration_ms: 0
          });
        }
        setRuns(initialRuns);

        const initialTxs: BenchmarkTransaction[] = [];
        for (const row of connection.db.benchmarkTransaction.iter()) {
          initialTxs.push({
            run_id: row.runId,
            tx_hash: row.txHash,
            submitted_at: row.submittedAt,
            mined_at: row.minedAt,
            latency_ms: row.latencyMs,
            status: row.status,
            gas_used: row.gasUsed,
            gas_price_wei: row.gasPriceWei,
            block_number: row.blockNumber,
            function_name: row.functionName
          });
        }
        setTransactions(initialTxs);

        setIsConnected(true);
        console.log('Connected to SpacetimeDB successfully');
      } catch (err) {
        console.error('Failed to connect to SpacetimeDB, falling back to localStorage:', err);
        setUseLocalStorage(true);
        setIsConnected(true);
        setError(null); // Don't show error, just use localStorage
      } finally {
        setIsConnecting(false);
      }
    };

    connectToSpacetime();

    return () => {
      if (connectionRef.current) {
        connectionRef.current.disconnect();
        connectionRef.current = null;
      }
    };
  }, []);

  const saveBenchmarkRun = async (run: BenchmarkRun): Promise<void> => {
    if (useLocalStorage) {
      // Save to localStorage
      const updatedRuns = [...runs, run];
      setRuns(updatedRuns);
      localStorage.setItem(STORAGE_KEY_RUNS, JSON.stringify(updatedRuns));
      console.log('Saved run to localStorage:', run.run_id);
      return;
    }

    if (!connectionRef.current) {
      throw new Error('Not connected to SpacetimeDB');
    }

    connectionRef.current.reducers.saveBenchmarkRun(
      run.run_id,
      run.timestamp,
      run.network,
      run.scenario,
      run.contract,
      run.function_name,
      run.concurrency,
      run.tx_per_user,
      run.tps_avg,
      run.tps_peak,
      run.p50_ms,
      run.p95_ms,
      run.success_rate
    );
  };

  const saveBenchmarkTransaction = async (tx: BenchmarkTransaction): Promise<void> => {
    if (useLocalStorage) {
      // Save to localStorage
      const updatedTxs = [...transactions, tx];
      setTransactions(updatedTxs);
      localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(updatedTxs));
      return;
    }

    if (!connectionRef.current) {
      throw new Error('Not connected to SpacetimeDB');
    }

    connectionRef.current.reducers.saveBenchmarkTransaction(
      tx.tx_hash,
      tx.run_id,
      tx.submitted_at,
      tx.mined_at,
      tx.latency_ms,
      tx.status,
      tx.gas_used,
      tx.gas_price_wei,
      tx.block_number,
      tx.function_name
    );
  };

  const deleteRun = async (runId: string): Promise<void> => {
    const updatedRuns = runs.filter(r => r.run_id !== runId);
    const updatedTxs = transactions.filter(tx => tx.run_id !== runId);
    
    setRuns(updatedRuns);
    setTransactions(updatedTxs);

    if (useLocalStorage) {
      // Update localStorage
      localStorage.setItem(STORAGE_KEY_RUNS, JSON.stringify(updatedRuns));
      localStorage.setItem(STORAGE_KEY_TXS, JSON.stringify(updatedTxs));
      return;
    }

    if (!connectionRef.current) {
      throw new Error('Not connected to SpacetimeDB');
    }

    connectionRef.current.reducers.deleteRun(runId);
  };

  return {
    isConnected,
    isConnecting,
    error,
    runs,
    transactions,
    saveBenchmarkRun,
    saveBenchmarkTransaction,
    deleteRun,
    useLocalStorage
  };
}
