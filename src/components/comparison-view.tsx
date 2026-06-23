'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown, Minus, TrendingUp, TrendingDown, Zap, Target, Clock, DollarSign, GitCompare } from 'lucide-react';
import type { BenchmarkResult, BenchmarkRun } from '@/types/benchmark';

interface ComparisonViewProps {
  results: BenchmarkResult[];
}

export function ComparisonView({ results }: ComparisonViewProps): JSX.Element {
  const [selectedRunIds, setSelectedRunIds] = useState<string[]>([]);

  const toggleRunSelection = (runId: string): void => {
    setSelectedRunIds(prev => {
      if (prev.includes(runId)) {
        return prev.filter(id => id !== runId);
      }
      if (prev.length >= 2) {
        return [prev[1], runId]; // Keep last one and add new one
      }
      return [...prev, runId];
    });
  };

  const allRuns = results.flatMap(r => r.runs);
  const selectedRuns = selectedRunIds.map(id => allRuns.find(r => r.run_id === id)).filter(Boolean) as BenchmarkRun[];

  const calculateDelta = (val1: number, val2: number): { value: number; percentage: number; isPositive: boolean } => {
    const delta = val1 - val2;
    const percentage = val2 !== 0 ? (delta / val2) * 100 : 0;
    return {
      value: delta,
      percentage,
      isPositive: delta > 0
    };
  };

  const getDeltaIcon = (isPositive: boolean, isInverted: boolean = false): JSX.Element => {
    const shouldShowUp = isInverted ? !isPositive : isPositive;
    if (shouldShowUp) {
      return <ArrowUp className="w-4 h-4 text-green-400" />;
    }
    return <ArrowDown className="w-4 h-4 text-red-400" />;
  };

  const getDeltaColor = (isPositive: boolean, isInverted: boolean = false): string => {
    const shouldBeGreen = isInverted ? !isPositive : isPositive;
    return shouldBeGreen ? 'text-green-400' : 'text-red-400';
  };

  if (results.length === 0) {
    return (
      <Card className="w-full bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <GitCompare className="w-5 h-5 text-blue-400" />
            Comparison View
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <GitCompare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-lg mb-2">No benchmark history available</p>
            <p className="text-sm">Run some benchmarks to compare performance</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <GitCompare className="w-5 h-5 text-blue-400" />
          Comparison View
        </CardTitle>
        <p className="text-sm text-gray-400 mt-1">
          Select 2 benchmark runs to compare their performance metrics
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Run Selection */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Select Runs to Compare</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {allRuns.map((run) => (
              <button
                key={run.run_id}
                onClick={() => toggleRunSelection(run.run_id)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedRunIds.includes(run.run_id)
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">{run.scenario}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(run.timestamp).toLocaleString()} • {run.network} • {run.function_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="border-gray-600 text-gray-300">
                      TPS: {run.tps_avg}
                    </Badge>
                    {selectedRunIds.includes(run.run_id) && (
                      <Badge className="bg-blue-600 text-white">
                        {selectedRunIds.indexOf(run.run_id) === 0 ? 'Run A' : 'Run B'}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedRuns.length === 2 ? (
          <div className="space-y-6">
            {/* Comparison Header */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-blue-900/20 border-blue-700">
                <CardContent className="pt-6">
                  <Badge className="mb-2 bg-blue-600 text-white">Run A (Baseline)</Badge>
                  <h3 className="text-white font-semibold">{selectedRuns[0].scenario}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(selectedRuns[0].timestamp).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {selectedRuns[0].network} • {selectedRuns[0].function_name}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-green-900/20 border-green-700">
                <CardContent className="pt-6">
                  <Badge className="mb-2 bg-green-600 text-white">Run B (Comparison)</Badge>
                  <h3 className="text-white font-semibold">{selectedRuns[1].scenario}</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(selectedRuns[1].timestamp).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {selectedRuns[1].network} • {selectedRuns[1].function_name}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Metrics Comparison */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Performance Metrics Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Metric</TableHead>
                      <TableHead className="text-blue-300">Run A</TableHead>
                      <TableHead className="text-green-300">Run B</TableHead>
                      <TableHead className="text-gray-300">Delta</TableHead>
                      <TableHead className="text-gray-300">Change %</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* TPS Average */}
                    <TableRow className="border-gray-700">
                      <TableCell className="text-white font-medium">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-orange-400" />
                          TPS Average
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-300 font-semibold">{selectedRuns[0].tps_avg}</TableCell>
                      <TableCell className="text-green-300 font-semibold">{selectedRuns[1].tps_avg}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getDeltaIcon(calculateDelta(selectedRuns[1].tps_avg, selectedRuns[0].tps_avg).isPositive, false)}
                          <span className={getDeltaColor(calculateDelta(selectedRuns[1].tps_avg, selectedRuns[0].tps_avg).isPositive, false)}>
                            {Math.abs(calculateDelta(selectedRuns[1].tps_avg, selectedRuns[0].tps_avg).value).toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getDeltaColor(calculateDelta(selectedRuns[1].tps_avg, selectedRuns[0].tps_avg).isPositive, false)}>
                          {calculateDelta(selectedRuns[1].tps_avg, selectedRuns[0].tps_avg).percentage > 0 ? '+' : ''}
                          {calculateDelta(selectedRuns[1].tps_avg, selectedRuns[0].tps_avg).percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* TPS Peak */}
                    <TableRow className="border-gray-700">
                      <TableCell className="text-white font-medium">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          TPS Peak
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-300 font-semibold">{selectedRuns[0].tps_peak}</TableCell>
                      <TableCell className="text-green-300 font-semibold">{selectedRuns[1].tps_peak}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getDeltaIcon(calculateDelta(selectedRuns[1].tps_peak, selectedRuns[0].tps_peak).isPositive, false)}
                          <span className={getDeltaColor(calculateDelta(selectedRuns[1].tps_peak, selectedRuns[0].tps_peak).isPositive, false)}>
                            {Math.abs(calculateDelta(selectedRuns[1].tps_peak, selectedRuns[0].tps_peak).value).toFixed(2)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getDeltaColor(calculateDelta(selectedRuns[1].tps_peak, selectedRuns[0].tps_peak).isPositive, false)}>
                          {calculateDelta(selectedRuns[1].tps_peak, selectedRuns[0].tps_peak).percentage > 0 ? '+' : ''}
                          {calculateDelta(selectedRuns[1].tps_peak, selectedRuns[0].tps_peak).percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* P50 Latency */}
                    <TableRow className="border-gray-700">
                      <TableCell className="text-white font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-400" />
                          P50 Latency
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-300 font-semibold">{selectedRuns[0].p50_ms}ms</TableCell>
                      <TableCell className="text-green-300 font-semibold">{selectedRuns[1].p50_ms}ms</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getDeltaIcon(calculateDelta(selectedRuns[1].p50_ms, selectedRuns[0].p50_ms).isPositive, true)}
                          <span className={getDeltaColor(calculateDelta(selectedRuns[1].p50_ms, selectedRuns[0].p50_ms).isPositive, true)}>
                            {Math.abs(calculateDelta(selectedRuns[1].p50_ms, selectedRuns[0].p50_ms).value).toFixed(0)}ms
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getDeltaColor(calculateDelta(selectedRuns[1].p50_ms, selectedRuns[0].p50_ms).isPositive, true)}>
                          {calculateDelta(selectedRuns[1].p50_ms, selectedRuns[0].p50_ms).percentage > 0 ? '+' : ''}
                          {calculateDelta(selectedRuns[1].p50_ms, selectedRuns[0].p50_ms).percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* P95 Latency */}
                    <TableRow className="border-gray-700">
                      <TableCell className="text-white font-medium">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-purple-400" />
                          P95 Latency
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-300 font-semibold">{selectedRuns[0].p95_ms}ms</TableCell>
                      <TableCell className="text-green-300 font-semibold">{selectedRuns[1].p95_ms}ms</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getDeltaIcon(calculateDelta(selectedRuns[1].p95_ms, selectedRuns[0].p95_ms).isPositive, true)}
                          <span className={getDeltaColor(calculateDelta(selectedRuns[1].p95_ms, selectedRuns[0].p95_ms).isPositive, true)}>
                            {Math.abs(calculateDelta(selectedRuns[1].p95_ms, selectedRuns[0].p95_ms).value).toFixed(0)}ms
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getDeltaColor(calculateDelta(selectedRuns[1].p95_ms, selectedRuns[0].p95_ms).isPositive, true)}>
                          {calculateDelta(selectedRuns[1].p95_ms, selectedRuns[0].p95_ms).percentage > 0 ? '+' : ''}
                          {calculateDelta(selectedRuns[1].p95_ms, selectedRuns[0].p95_ms).percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* Success Rate */}
                    <TableRow className="border-gray-700">
                      <TableCell className="text-white font-medium">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-purple-400" />
                          Success Rate
                        </div>
                      </TableCell>
                      <TableCell className="text-blue-300 font-semibold">{selectedRuns[0].success_rate}%</TableCell>
                      <TableCell className="text-green-300 font-semibold">{selectedRuns[1].success_rate}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {getDeltaIcon(calculateDelta(selectedRuns[1].success_rate, selectedRuns[0].success_rate).isPositive, false)}
                          <span className={getDeltaColor(calculateDelta(selectedRuns[1].success_rate, selectedRuns[0].success_rate).isPositive, false)}>
                            {Math.abs(calculateDelta(selectedRuns[1].success_rate, selectedRuns[0].success_rate).value).toFixed(2)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getDeltaColor(calculateDelta(selectedRuns[1].success_rate, selectedRuns[0].success_rate).isPositive, false)}>
                          {calculateDelta(selectedRuns[1].success_rate, selectedRuns[0].success_rate).percentage > 0 ? '+' : ''}
                          {calculateDelta(selectedRuns[1].success_rate, selectedRuns[0].success_rate).percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>

                    {/* Concurrency */}
                    <TableRow className="border-gray-700">
                      <TableCell className="text-white font-medium">Concurrency</TableCell>
                      <TableCell className="text-blue-300">{selectedRuns[0].concurrency}</TableCell>
                      <TableCell className="text-green-300">{selectedRuns[1].concurrency}</TableCell>
                      <TableCell className="text-gray-400">
                        {selectedRuns[1].concurrency - selectedRuns[0].concurrency}
                      </TableCell>
                      <TableCell className="text-gray-400">-</TableCell>
                    </TableRow>

                    {/* TX Per User */}
                    <TableRow className="border-gray-700">
                      <TableCell className="text-white font-medium">TX per User</TableCell>
                      <TableCell className="text-blue-300">{selectedRuns[0].tx_per_user}</TableCell>
                      <TableCell className="text-green-300">{selectedRuns[1].tx_per_user}</TableCell>
                      <TableCell className="text-gray-400">
                        {selectedRuns[1].tx_per_user - selectedRuns[0].tx_per_user}
                      </TableCell>
                      <TableCell className="text-gray-400">-</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Summary Insights */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">Comparison Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {calculateDelta(selectedRuns[1].tps_avg, selectedRuns[0].tps_avg).isPositive ? (
                  <div className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-700 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-green-300 font-semibold">Performance Improved</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Run B shows a {Math.abs(calculateDelta(selectedRuns[1].tps_avg, selectedRuns[0].tps_avg).percentage).toFixed(1)}% 
                        improvement in TPS compared to Run A
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-red-900/20 border border-red-700 rounded-lg">
                    <TrendingDown className="w-5 h-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-red-300 font-semibold">Performance Regression</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Run B shows a {Math.abs(calculateDelta(selectedRuns[1].tps_avg, selectedRuns[0].tps_avg).percentage).toFixed(1)}% 
                        decrease in TPS compared to Run A
                      </p>
                    </div>
                  </div>
                )}

                {calculateDelta(selectedRuns[1].p95_ms, selectedRuns[0].p95_ms).isPositive ? (
                  <div className="flex items-start gap-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                    <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-yellow-300 font-semibold">Increased Latency</p>
                      <p className="text-sm text-gray-400 mt-1">
                        P95 latency increased by {Math.abs(calculateDelta(selectedRuns[1].p95_ms, selectedRuns[0].p95_ms).value).toFixed(0)}ms 
                        ({Math.abs(calculateDelta(selectedRuns[1].p95_ms, selectedRuns[0].p95_ms).percentage).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-green-900/20 border border-green-700 rounded-lg">
                    <Clock className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <p className="text-green-300 font-semibold">Improved Latency</p>
                      <p className="text-sm text-gray-400 mt-1">
                        P95 latency decreased by {Math.abs(calculateDelta(selectedRuns[1].p95_ms, selectedRuns[0].p95_ms).value).toFixed(0)}ms 
                        ({Math.abs(calculateDelta(selectedRuns[1].p95_ms, selectedRuns[0].p95_ms).percentage).toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <p>Select {2 - selectedRuns.length} more run{2 - selectedRuns.length > 1 ? 's' : ''} to start comparing</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
