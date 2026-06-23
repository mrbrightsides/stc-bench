'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Download, BarChart3, Activity, Clock, CheckCircle, XCircle, TrendingUp, Search, Filter, Zap, Users, Target, DollarSign, LineChart, Brain } from 'lucide-react';
import type { BenchmarkResult } from '@/types/benchmark';
import { DataExporter } from '@/lib/data-export';
import { PerformanceCharts } from '@/components/performance-charts';
import { SmartInsights } from '@/components/smart-insights';

interface BenchmarkResultsProps {
  results: BenchmarkResult | null;
  isLoading: boolean;
}

export function BenchmarkResults({ results, isLoading }: BenchmarkResultsProps): JSX.Element {
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(50);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Auto-refresh for live updates
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setRefreshKey(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleDownload = (format: 'json' | 'ndjson' | 'csv-runs' | 'csv-transactions'): void => {
    if (!results) return;

    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (format) {
      case 'json':
        DataExporter.downloadFile(
          DataExporter.exportToJson(results),
          `stc-bench-${timestamp}.json`,
          'application/json'
        );
        break;
      case 'ndjson':
        DataExporter.downloadFile(
          DataExporter.exportToNdjson(results),
          `stc-bench-${timestamp}.ndjson`,
          'application/x-ndjson'
        );
        break;
      case 'csv-runs':
        DataExporter.downloadFile(
          DataExporter.exportRunsToCsv(results.runs),
          `stc-bench-runs-${timestamp}.csv`,
          'text/csv'
        );
        break;
      case 'csv-transactions':
        DataExporter.downloadFile(
          DataExporter.exportTransactionsToCsv(results.transactions),
          `stc-bench-transactions-${timestamp}.csv`,
          'text/csv'
        );
        break;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'success': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'pending': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const formatCurrency = (wei: string): string => {
    const eth = Number(wei) / 1e18;
    return `${eth.toFixed(6)} ETH`;
  };

  // Filter transactions
  const filteredTransactions = results?.transactions.filter(tx => {
    const matchesRun = selectedRunId ? tx.run_id === selectedRunId : true;
    const matchesSearch = searchTerm ? 
      tx.tx_hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.function_name.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    const matchesStatus = statusFilter === 'all' ? true : tx.status === statusFilter;
    
    return matchesRun && matchesSearch && matchesStatus;
  }) || [];

  // Paginate transactions
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  if (isLoading) {
    return (
      <Card className="w-full bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="w-5 h-5 animate-pulse text-blue-400" />
            Running Benchmark...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={undefined} className="w-full bg-gray-800" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">
                Executing scenario and processing transactions...
              </span>
              <span className="text-blue-400 animate-pulse">
                Live updating • {new Date().toLocaleTimeString()}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gray-700 rounded"></div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gray-700 rounded"></div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 animate-pulse">
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-8 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!results) {
    return (
      <Card className="w-full bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Benchmark Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-lg mb-2">Ready to run your first benchmark</p>
            <p className="text-sm">Configure your contract and scenario above, then click "Run Benchmark" to see results here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate additional metrics
  const avgGasUsed = results.transactions.reduce((sum, tx) => sum + tx.gas_used, 0) / results.transactions.length;
  const totalGasCost = results.transactions.reduce((sum, tx) => 
    sum + (tx.gas_used * Number(tx.gas_price_wei)), 0);

  return (
    <Card className="w-full bg-gray-900 border-gray-700 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="w-5 h-5 text-green-400" />
            Benchmark Results
          </CardTitle>
          <p className="text-sm text-gray-400 mt-1">
            Analysis completed • {results.transactions.length} transactions processed
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDownload('json')}
            className="border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200"
          >
            <Download className="w-4 h-4 mr-2" />
            JSON
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDownload('ndjson')}
            className="border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200"
          >
            <Download className="w-4 h-4 mr-2" />
            NDJSON
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDownload('csv-runs')}
            className="border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV (Runs)
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleDownload('csv-transactions')}
            className="border-gray-600 bg-gray-800 hover:bg-gray-700 text-gray-200"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV (TX)
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="smart-analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800 border-gray-700">
            <TabsTrigger 
              value="smart-analysis" 
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300 flex items-center gap-1"
            >
              <Brain className="w-4 h-4" />
              Smart Analysis
            </TabsTrigger>
            <TabsTrigger 
              value="visualizations" 
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300 flex items-center gap-1"
            >
              <LineChart className="w-4 h-4" />
              Charts
            </TabsTrigger>
            <TabsTrigger 
              value="summary" 
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
            >
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="runs" 
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
            >
              Runs ({results.runs.length})
            </TabsTrigger>
            <TabsTrigger 
              value="transactions" 
              className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300"
            >
              TX ({filteredTransactions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="smart-analysis" className="space-y-6">
            <SmartInsights results={results} />
          </TabsContent>

          <TabsContent value="visualizations" className="space-y-6">
            <PerformanceCharts results={results} />
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-900/20 border border-blue-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-medium text-blue-300">Total Runs</span>
                </div>
                <div className="text-3xl font-bold text-blue-400">{results.summary.total_runs}</div>
                <p className="text-xs text-blue-200/60 mt-1">Benchmark executions</p>
              </div>
              
              <div className="bg-green-900/20 border border-green-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium text-green-300">Transactions</span>
                </div>
                <div className="text-3xl font-bold text-green-400">{results.summary.total_transactions.toLocaleString()}</div>
                <p className="text-xs text-green-200/60 mt-1">On-chain operations</p>
              </div>
              
              <div className="bg-purple-900/20 border border-purple-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-medium text-purple-300">Success Rate</span>
                </div>
                <div className="text-3xl font-bold text-purple-400">{results.summary.overall_success_rate}%</div>
                <p className="text-xs text-purple-200/60 mt-1">Successful transactions</p>
              </div>
              
              <div className="bg-orange-900/20 border border-orange-800 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-orange-400" />
                  <span className="text-sm font-medium text-orange-300">Avg TPS</span>
                </div>
                <div className="text-3xl font-bold text-orange-400">{results.summary.avg_tps}</div>
                <p className="text-xs text-orange-200/60 mt-1">Transactions per second</p>
              </div>
            </div>

            {/* Advanced Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                  Gas Analytics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Gas Used:</span>
                    <span className="text-white font-mono">{Math.round(avgGasUsed).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Gas Cost:</span>
                    <span className="text-yellow-400 font-mono">{formatCurrency(totalGasCost.toString())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg Cost per TX:</span>
                    <span className="text-yellow-400 font-mono">
                      {formatCurrency((totalGasCost / results.transactions.length).toString())}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  Performance Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Networks Used:</span>
                    <div className="flex gap-1">
                      {results.summary.networks.map((network) => (
                        <Badge key={network} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                          {network}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Peak TPS:</span>
                    <span className="text-blue-400 font-semibold">
                      {Math.max(...results.runs.map(run => run.tps_peak))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Avg P95 Latency:</span>
                    <span className="text-blue-400 font-semibold">
                      {Math.round(results.runs.reduce((sum, run) => sum + run.p95_ms, 0) / results.runs.length)}ms
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="runs" className="space-y-4">
            {results.runs.length === 0 ? (
              <Alert className="bg-gray-800 border-gray-700 text-gray-200">
                <AlertDescription>No benchmark runs found.</AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-800">
                      <TableHead className="text-gray-300">Scenario</TableHead>
                      <TableHead className="text-gray-300">Network</TableHead>
                      <TableHead className="text-gray-300">Function</TableHead>
                      <TableHead className="text-gray-300">Concurrency</TableHead>
                      <TableHead className="text-gray-300">TX Count</TableHead>
                      <TableHead className="text-gray-300">TPS Avg</TableHead>
                      <TableHead className="text-gray-300">TPS Peak</TableHead>
                      <TableHead className="text-gray-300">P50</TableHead>
                      <TableHead className="text-gray-300">P95</TableHead>
                      <TableHead className="text-gray-300">Success Rate</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.runs.map((run) => (
                      <TableRow key={run.run_id} className="border-gray-700 hover:bg-gray-800">
                        <TableCell className="font-medium text-white">{run.scenario}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {run.network}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-gray-300">{run.function_name}</TableCell>
                        <TableCell className="text-gray-300">{run.concurrency}</TableCell>
                        <TableCell className="text-gray-300">{(run.concurrency * run.tx_per_user).toLocaleString()}</TableCell>
                        <TableCell className="text-blue-400 font-semibold">{run.tps_avg}</TableCell>
                        <TableCell className="text-green-400 font-semibold">{run.tps_peak}</TableCell>
                        <TableCell className="text-gray-300">{run.p50_ms}ms</TableCell>
                        <TableCell className="text-gray-300">{run.p95_ms}ms</TableCell>
                        <TableCell>
                          <Badge 
                            className={run.success_rate >= 95 ? 'bg-green-900 text-green-200 border-green-700' : 
                                     run.success_rate >= 80 ? 'bg-yellow-900 text-yellow-200 border-yellow-700' : 
                                     'bg-red-900 text-red-200 border-red-700'}
                          >
                            {run.success_rate}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRunId(run.run_id)}
                            className="hover:bg-gray-700 text-blue-400 hover:text-blue-300"
                          >
                            View TX
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            {/* Transaction Filters */}
            <div className="flex flex-wrap gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
              <div className="flex-1 min-w-[200px]">
                <Label className="text-sm text-gray-300 mb-2">Search Transactions</Label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by hash or function..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm text-gray-300 mb-2">Status Filter</Label>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="success">Success</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {selectedRunId && (
              <div className="flex items-center gap-2 p-3 bg-blue-900/20 rounded-lg border border-blue-800">
                <span className="text-sm text-blue-200">Filtering by run:</span>
                <Badge variant="outline" className="border-blue-600 text-blue-300">
                  {selectedRunId.split('-')[0]}...
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedRunId(null)}
                  className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/30"
                >
                  Show All
                </Button>
              </div>
            )}
            
            {filteredTransactions.length === 0 ? (
              <Alert className="bg-gray-800 border-gray-700 text-gray-200">
                <AlertDescription>
                  {selectedRunId ? 'No transactions found for the selected run.' : 
                   searchTerm || statusFilter !== 'all' ? 'No transactions match your filters.' :
                   'No transactions found. Select a run from the Runs tab to view its transactions.'}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700 hover:bg-gray-800">
                      <TableHead className="text-gray-300">TX Hash</TableHead>
                      <TableHead className="text-gray-300">Function</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Latency</TableHead>
                      <TableHead className="text-gray-300">Gas Used</TableHead>
                      <TableHead className="text-gray-300">Gas Price</TableHead>
                      <TableHead className="text-gray-300">Block</TableHead>
                      <TableHead className="text-gray-300">Submitted At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedTransactions.map((tx) => (
                      <TableRow key={tx.tx_hash} className="border-gray-700 hover:bg-gray-800">
                        <TableCell className="font-mono text-xs text-gray-300">
                          <a 
                            href={`https://sepolia.etherscan.io/tx/${tx.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-blue-400 transition-colors"
                          >
                            {tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-8)}
                          </a>
                        </TableCell>
                        <TableCell className="font-mono text-sm text-gray-300">{tx.function_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(tx.status)}
                            <span className={`text-sm ${getStatusColor(tx.status)}`}>
                              {tx.status}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-300">{formatDuration(tx.latency_ms)}</TableCell>
                        <TableCell className="text-gray-300">{tx.gas_used.toLocaleString()}</TableCell>
                        <TableCell className="font-mono text-xs text-gray-300">
                          {(BigInt(tx.gas_price_wei) / BigInt(1e9)).toString()} Gwei
                        </TableCell>
                        <TableCell className="text-gray-300">{tx.block_number.toLocaleString()}</TableCell>
                        <TableCell className="text-xs text-gray-400">
                          {new Date(tx.submitted_at).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="text-sm text-gray-400">
                      Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} transactions
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200"
                      >
                        Previous
                      </Button>
                      <span className="px-3 py-2 text-sm text-gray-300">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-200"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}