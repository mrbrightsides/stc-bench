import type { BenchmarkResult, BenchmarkRun, BenchmarkTransaction } from '@/types/benchmark';

export class DataExporter {
  static exportToJson(data: BenchmarkResult): string {
    return JSON.stringify(data, null, 2);
  }

  static exportToNdjson(data: BenchmarkResult): string {
    const lines: string[] = [];
    
    // Export runs as NDJSON
    for (const run of data.runs) {
      lines.push(JSON.stringify({ type: 'bench_run', ...run }));
    }
    
    // Export transactions as NDJSON
    for (const tx of data.transactions) {
      lines.push(JSON.stringify({ type: 'bench_tx', ...tx }));
    }
    
    return lines.join('\n');
  }

  static exportRunsToCsv(runs: BenchmarkRun[]): string {
    const headers = [
      'run_id',
      'timestamp',
      'network',
      'scenario',
      'contract',
      'function_name',
      'concurrency',
      'tx_per_user',
      'tps_avg',
      'tps_peak',
      'p50_ms',
      'p95_ms',
      'success_rate'
    ];

    const csvRows = [headers.join(',')];
    
    for (const run of runs) {
      const row = [
        run.run_id,
        run.timestamp,
        run.network,
        `"${run.scenario}"`,
        run.contract,
        run.function_name,
        run.concurrency.toString(),
        run.tx_per_user.toString(),
        run.tps_avg.toString(),
        run.tps_peak.toString(),
        run.p50_ms.toString(),
        run.p95_ms.toString(),
        run.success_rate.toString()
      ];
      csvRows.push(row.join(','));
    }
    
    return csvRows.join('\n');
  }

  static exportTransactionsToCsv(transactions: BenchmarkTransaction[]): string {
    const headers = [
      'run_id',
      'tx_hash',
      'submitted_at',
      'mined_at',
      'latency_ms',
      'status',
      'gas_used',
      'gas_price_wei',
      'block_number',
      'function_name'
    ];

    const csvRows = [headers.join(',')];
    
    for (const tx of transactions) {
      const row = [
        tx.run_id,
        tx.tx_hash,
        tx.submitted_at,
        tx.mined_at,
        tx.latency_ms.toString(),
        tx.status,
        tx.gas_used.toString(),
        tx.gas_price_wei,
        tx.block_number.toString(),
        tx.function_name
      ];
      csvRows.push(row.join(','));
    }
    
    return csvRows.join('\n');
  }

  static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static parseUploadedJson(jsonContent: string): BenchmarkResult {
    try {
      const data = JSON.parse(jsonContent);
      
      // Validate structure
      if (!data.runs || !data.transactions) {
        throw new Error('Invalid JSON structure: missing runs or transactions');
      }

      // Ensure arrays
      if (!Array.isArray(data.runs) || !Array.isArray(data.transactions)) {
        throw new Error('Invalid JSON structure: runs and transactions must be arrays');
      }

      // Generate summary if missing
      if (!data.summary) {
        data.summary = this.generateSummary(data.runs, data.transactions);
      }

      return data as BenchmarkResult;
    } catch (error) {
      throw new Error(`Failed to parse JSON: ${error}`);
    }
  }

  static parseNdjson(ndjsonContent: string): BenchmarkResult {
    const lines = ndjsonContent.trim().split('\n');
    const runs: BenchmarkRun[] = [];
    const transactions: BenchmarkTransaction[] = [];

    for (const line of lines) {
      if (!line.trim()) continue;
      
      try {
        const obj = JSON.parse(line);
        
        if (obj.type === 'bench_run') {
          const { type, ...run } = obj;
          runs.push(run as BenchmarkRun);
        } else if (obj.type === 'bench_tx') {
          const { type, ...tx } = obj;
          transactions.push(tx as BenchmarkTransaction);
        }
      } catch (error) {
        console.warn(`Skipping invalid NDJSON line: ${line}`);
      }
    }

    const summary = this.generateSummary(runs, transactions);

    return {
      runs,
      transactions,
      summary
    };
  }

  static parseCsv(csvContent: string): BenchmarkResult {
    const lines = csvContent.trim().split('\n');
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    
    // Detect CSV type based on headers
    if (headers.includes('run_id') && headers.includes('tps_avg')) {
      // This is a runs CSV
      return this.parseRunsCsv(csvContent);
    } else if (headers.includes('run_id') && headers.includes('tx_hash')) {
      // This is a transactions CSV
      return this.parseTransactionsCsv(csvContent);
    } else {
      throw new Error('Unrecognized CSV format. Expected runs CSV or transactions CSV.');
    }
  }

  static parseRunsCsv(csvContent: string): BenchmarkResult {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must contain headers and at least one data row');
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const runs: BenchmarkRun[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCsvLine(line);
      if (values.length !== headers.length) {
        console.warn(`Skipping malformed CSV line ${i + 1}: column count mismatch`);
        continue;
      }

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      try {
        const run: BenchmarkRun = {
          run_id: row['run_id'] || '',
          timestamp: row['timestamp'] || new Date().toISOString(),
          network: row['network'] || 'unknown',
          scenario: row['scenario'] || 'unknown',
          contract: row['contract'] || '',
          function_name: row['function_name'] || 'unknown',
          concurrency: parseInt(row['concurrency']) || 0,
          tx_per_user: parseInt(row['tx_per_user']) || 0,
          tps_avg: parseFloat(row['tps_avg']) || 0,
          tps_peak: parseFloat(row['tps_peak']) || 0,
          p50_ms: parseFloat(row['p50_ms']) || 0,
          p95_ms: parseFloat(row['p95_ms']) || 0,
          success_rate: parseFloat(row['success_rate']) || 0,
          total_transactions: parseInt(row['tx_per_user']) * parseInt(row['concurrency']) || 0,
          total_duration_ms: 0 // Not available in CSV
        };
        runs.push(run);
      } catch (error) {
        console.warn(`Skipping invalid CSV row ${i + 1}:`, error);
      }
    }

    if (runs.length === 0) {
      throw new Error('No valid benchmark runs found in CSV');
    }

    const summary = this.generateSummary(runs, []);

    return {
      runs,
      transactions: [],
      summary
    };
  }

  static parseTransactionsCsv(csvContent: string): BenchmarkResult {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must contain headers and at least one data row');
    }

    const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
    const transactions: BenchmarkTransaction[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCsvLine(line);
      if (values.length !== headers.length) {
        console.warn(`Skipping malformed CSV line ${i + 1}: column count mismatch`);
        continue;
      }

      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      try {
        const tx: BenchmarkTransaction = {
          run_id: row['run_id'] || '',
          tx_hash: row['tx_hash'] || '',
          submitted_at: row['submitted_at'] || new Date().toISOString(),
          mined_at: row['mined_at'] || new Date().toISOString(),
          latency_ms: parseFloat(row['latency_ms']) || 0,
          status: (row['status'] as 'success' | 'failed' | 'pending') || 'pending',
          gas_used: parseInt(row['gas_used']) || 0,
          gas_price_wei: row['gas_price_wei'] || '0',
          block_number: parseInt(row['block_number']) || 0,
          function_name: row['function_name'] || 'unknown'
        };
        transactions.push(tx);
      } catch (error) {
        console.warn(`Skipping invalid CSV row ${i + 1}:`, error);
      }
    }

    if (transactions.length === 0) {
      throw new Error('No valid transactions found in CSV');
    }

    const summary = this.generateSummary([], transactions);

    return {
      runs: [],
      transactions,
      summary
    };
  }

  private static parseCsvLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  }

  /**
   * Combines multiple BenchmarkResult objects into one.
   * Smart merging: if one has runs and another has transactions with matching run_id, merge them.
   */
  static combineResults(results: BenchmarkResult[]): BenchmarkResult {
    if (results.length === 0) {
      throw new Error('No results to combine');
    }

    if (results.length === 1) {
      return results[0];
    }

    // Merge all runs and transactions
    const allRuns: BenchmarkRun[] = [];
    const allTransactions: BenchmarkTransaction[] = [];
    const runIdMap: Map<string, BenchmarkRun> = new Map();

    // Collect all data
    for (const result of results) {
      for (const run of result.runs) {
        if (!runIdMap.has(run.run_id)) {
          runIdMap.set(run.run_id, run);
          allRuns.push(run);
        }
      }
      allTransactions.push(...result.transactions);
    }

    // Update run statistics based on actual transactions if available
    if (allTransactions.length > 0) {
      for (const run of allRuns) {
        const runTransactions = allTransactions.filter(tx => tx.run_id === run.run_id);
        if (runTransactions.length > 0) {
          // Recalculate metrics from actual transaction data
          const successfulTx = runTransactions.filter(tx => tx.status === 'success').length;
          run.success_rate = (successfulTx / runTransactions.length) * 100;
          run.total_transactions = runTransactions.length;

          // Calculate latency percentiles from actual transactions
          const latencies = runTransactions.map(tx => tx.latency_ms).sort((a, b) => a - b);
          if (latencies.length > 0) {
            const p50Index = Math.floor(latencies.length * 0.5);
            const p95Index = Math.floor(latencies.length * 0.95);
            run.p50_ms = latencies[p50Index];
            run.p95_ms = latencies[p95Index];
          }
        }
      }
    }

    const summary = this.generateSummary(allRuns, allTransactions);

    return {
      runs: allRuns,
      transactions: allTransactions,
      summary
    };
  }

  private static generateSummary(runs: BenchmarkRun[], transactions: BenchmarkTransaction[]) {
    const networks = [...new Set(runs.map(run => run.network))];
    const successfulTx = transactions.filter(tx => tx.status === 'success').length;
    const overallSuccessRate = transactions.length > 0 ? (successfulTx / transactions.length) * 100 : 0;
    const avgTps = runs.length > 0 ? runs.reduce((sum, run) => sum + run.tps_avg, 0) / runs.length : 0;

    return {
      total_runs: runs.length,
      total_transactions: transactions.length,
      overall_success_rate: Math.round(overallSuccessRate * 100) / 100,
      avg_tps: Math.round(avgTps * 100) / 100,
      networks
    };
  }
}