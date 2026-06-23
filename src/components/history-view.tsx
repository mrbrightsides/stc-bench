'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { History, Trash2, Search, Network, TrendingUp, Clock, Target } from 'lucide-react';
import type { BenchmarkRun } from '@/types/benchmark';

interface HistoryViewProps {
  runs: BenchmarkRun[];
  onDeleteRun: (runId: string) => void;
  onSelectRun: (run: BenchmarkRun) => void;
}

export function HistoryView({ runs, onDeleteRun, onSelectRun }: HistoryViewProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [networkFilter, setNetworkFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'tps' | 'success_rate'>('timestamp');

  const uniqueNetworks = Array.from(new Set(runs.map(r => r.network)));

  const filteredRuns = runs
    .filter(run => {
      const matchesSearch = 
        run.scenario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.function_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        run.contract.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesNetwork = networkFilter === 'all' || run.network === networkFilter;
      return matchesSearch && matchesNetwork;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'timestamp':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        case 'tps':
          return b.tps_avg - a.tps_avg;
        case 'success_rate':
          return b.success_rate - a.success_rate;
        default:
          return 0;
      }
    });

  const formatDate = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (runs.length === 0) {
    return (
      <Card className="w-full bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <History className="w-5 h-5 text-blue-400" />
            Benchmark History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <History className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-lg mb-2">No benchmark history yet</p>
            <p className="text-sm">Run your first benchmark to start building history</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <History className="w-5 h-5 text-blue-400" />
          Benchmark History
        </CardTitle>
        <p className="text-sm text-gray-400 mt-1">
          {filteredRuns.length} benchmark runs stored • Persistent across sessions
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex-1 min-w-[200px]">
            <Label className="text-sm text-gray-300 mb-2">Search</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search scenario, function, or contract..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm text-gray-300 mb-2">Network</Label>
            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:border-blue-500"
            >
              <option value="all">All Networks</option>
              {uniqueNetworks.map(network => (
                <option key={network} value={network}>{network}</option>
              ))}
            </select>
          </div>

          <div>
            <Label className="text-sm text-gray-300 mb-2">Sort By</Label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 bg-gray-700 border border-gray-600 text-white rounded-md focus:border-blue-500"
            >
              <option value="timestamp">Latest First</option>
              <option value="tps">Highest TPS</option>
              <option value="success_rate">Best Success Rate</option>
            </select>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <History className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">Total Runs</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{runs.length}</div>
          </div>

          <div className="bg-purple-900/20 border border-purple-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Network className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300">Networks</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">{uniqueNetworks.length}</div>
          </div>

          <div className="bg-green-900/20 border border-green-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-300">Avg TPS</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {(runs.reduce((sum, r) => sum + r.tps_avg, 0) / runs.length).toFixed(1)}
            </div>
          </div>

          <div className="bg-orange-900/20 border border-orange-700 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-orange-300">Avg Success</span>
            </div>
            <div className="text-2xl font-bold text-orange-400">
              {(runs.reduce((sum, r) => sum + r.success_rate, 0) / runs.length).toFixed(1)}%
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-700 hover:bg-gray-800">
                <TableHead className="text-gray-300">Timestamp</TableHead>
                <TableHead className="text-gray-300">Scenario</TableHead>
                <TableHead className="text-gray-300">Network</TableHead>
                <TableHead className="text-gray-300">Function</TableHead>
                <TableHead className="text-gray-300">TPS Avg</TableHead>
                <TableHead className="text-gray-300">Success Rate</TableHead>
                <TableHead className="text-gray-300">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRuns.length === 0 ? (
                <TableRow className="border-gray-700">
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">
                    No runs match your filters
                  </TableCell>
                </TableRow>
              ) : (
                filteredRuns.map((run) => (
                  <TableRow 
                    key={run.run_id} 
                    className="border-gray-700 hover:bg-gray-800 cursor-pointer"
                  >
                    <TableCell className="text-gray-300 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        {formatDate(run.timestamp)}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-white">
                      {run.scenario}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-gray-600 text-gray-300">
                        {run.network}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-gray-300">
                      {run.function_name}
                    </TableCell>
                    <TableCell className="text-blue-400 font-semibold">
                      {run.tps_avg.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={
                          run.success_rate >= 95 
                            ? 'bg-green-900 text-green-200 border-green-700' 
                            : run.success_rate >= 80 
                            ? 'bg-yellow-900 text-yellow-200 border-yellow-700' 
                            : 'bg-red-900 text-red-200 border-red-700'
                        }
                      >
                        {run.success_rate.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRun(run);
                          }}
                          className="hover:bg-blue-900/30 text-blue-400 hover:text-blue-300"
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Are you sure you want to delete this benchmark run?')) {
                              onDeleteRun(run.run_id);
                            }
                          }}
                          className="hover:bg-red-900/30 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
