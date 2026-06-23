'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Zap, DollarSign, Clock, Activity, PieChartIcon } from 'lucide-react';
import type { BenchmarkResult } from '@/types/benchmark';

interface PerformanceChartsProps {
  results: BenchmarkResult;
}

export function PerformanceCharts({ results }: PerformanceChartsProps): JSX.Element {
  // Prepare TPS over time data
  const tpsData = results.runs.map((run, index) => ({
    name: `Run ${index + 1}`,
    timestamp: new Date(run.timestamp).toLocaleTimeString(),
    'TPS Avg': run.tps_avg,
    'TPS Peak': run.tps_peak,
    runId: run.run_id,
  }));

  // Prepare gas usage by function
  const gasDataMap = new Map<string, { totalGas: number; count: number }>();
  results.transactions.forEach((tx) => {
    const existing = gasDataMap.get(tx.function_name) || { totalGas: 0, count: 0 };
    gasDataMap.set(tx.function_name, {
      totalGas: existing.totalGas + tx.gas_used,
      count: existing.count + 1,
    });
  });

  const gasData = Array.from(gasDataMap.entries()).map(([functionName, data]) => ({
    name: functionName,
    'Avg Gas': Math.round(data.totalGas / data.count),
    'Total Gas': data.totalGas,
    count: data.count,
  }));

  // Prepare latency distribution (histogram)
  const latencyBuckets = [
    { range: '0-500ms', min: 0, max: 500, count: 0 },
    { range: '500ms-1s', min: 500, max: 1000, count: 0 },
    { range: '1-2s', min: 1000, max: 2000, count: 0 },
    { range: '2-5s', min: 2000, max: 5000, count: 0 },
    { range: '5s+', min: 5000, max: Infinity, count: 0 },
  ];

  results.transactions.forEach((tx) => {
    const bucket = latencyBuckets.find(
      (b) => tx.latency_ms >= b.min && tx.latency_ms < b.max
    );
    if (bucket) bucket.count++;
  });

  const latencyData = latencyBuckets.map((bucket) => ({
    name: bucket.range,
    'Transactions': bucket.count,
    percentage: ((bucket.count / results.transactions.length) * 100).toFixed(1),
  }));

  // Prepare success rate pie chart
  const statusCounts = {
    success: results.transactions.filter((tx) => tx.status === 'success').length,
    failed: results.transactions.filter((tx) => tx.status === 'failed').length,
    pending: results.transactions.filter((tx) => tx.status === 'pending').length,
  };

  const statusData = [
    { name: 'Success', value: statusCounts.success, color: '#22c55e' },
    { name: 'Failed', value: statusCounts.failed, color: '#ef4444' },
    { name: 'Pending', value: statusCounts.pending, color: '#eab308' },
  ].filter((item) => item.value > 0);

  // Prepare transaction timeline (transactions per time bucket)
  const timelineBuckets = 10;
  const transactions = [...results.transactions].sort(
    (a, b) => new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime()
  );
  
  if (transactions.length > 0) {
    const firstTime = new Date(transactions[0].submitted_at).getTime();
    const lastTime = new Date(transactions[transactions.length - 1].submitted_at).getTime();
    const bucketSize = (lastTime - firstTime) / timelineBuckets;

    const timelineData = Array.from({ length: timelineBuckets }, (_, i) => {
      const bucketStart = firstTime + i * bucketSize;
      const bucketEnd = bucketStart + bucketSize;
      const txInBucket = transactions.filter((tx) => {
        const time = new Date(tx.submitted_at).getTime();
        return time >= bucketStart && time < bucketEnd;
      });

      return {
        name: `T+${Math.round((bucketStart - firstTime) / 1000)}s`,
        'TX Count': txInBucket.length,
        'Success': txInBucket.filter((tx) => tx.status === 'success').length,
        'Failed': txInBucket.filter((tx) => tx.status === 'failed').length,
      };
    });

    var timelineDataVar = timelineData;
  } else {
    var timelineDataVar = [];
  }

  // Custom tooltip styles
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg shadow-lg">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* TPS Over Time Chart */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            TPS Performance Over Time
            <Badge className="ml-auto bg-blue-900/30 text-blue-300 border-blue-700">
              Throughput Analysis
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tpsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#9ca3af" 
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af" 
                style={{ fontSize: '12px' }}
                label={{ value: 'TPS', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="line"
              />
              <Line 
                type="monotone" 
                dataKey="TPS Avg" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 7 }}
              />
              <Line 
                type="monotone" 
                dataKey="TPS Peak" 
                stroke="#22c55e" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#22c55e', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="bg-blue-900/20 border border-blue-800 p-3 rounded-lg">
              <p className="text-xs text-blue-300 mb-1">Average TPS Across All Runs</p>
              <p className="text-2xl font-bold text-blue-400">
                {(tpsData.reduce((sum, d) => sum + d['TPS Avg'], 0) / tpsData.length).toFixed(2)}
              </p>
            </div>
            <div className="bg-green-900/20 border border-green-800 p-3 rounded-lg">
              <p className="text-xs text-green-300 mb-1">Highest Peak TPS</p>
              <p className="text-2xl font-bold text-green-400">
                {Math.max(...tpsData.map((d) => d['TPS Peak'])).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gas Usage by Function */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <DollarSign className="w-5 h-5 text-yellow-400" />
            Gas Usage by Function
            <Badge className="ml-auto bg-yellow-900/30 text-yellow-300 border-yellow-700">
              Cost Analysis
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={gasData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af" 
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af" 
                style={{ fontSize: '12px' }}
                label={{ value: 'Gas Units', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar 
                dataKey="Avg Gas" 
                fill="#eab308" 
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 bg-yellow-900/20 border border-yellow-800 p-3 rounded-lg">
            <p className="text-xs text-yellow-300 mb-1">Total Gas Consumed</p>
            <p className="text-2xl font-bold text-yellow-400">
              {gasData.reduce((sum, d) => sum + d['Total Gas'], 0).toLocaleString()} gas units
            </p>
            <p className="text-xs text-yellow-200/60 mt-1">
              Across {gasData.reduce((sum, d) => sum + d.count, 0)} transactions
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Latency Distribution & Success Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latency Distribution */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Clock className="w-5 h-5 text-purple-400" />
              Latency Distribution
              <Badge className="ml-auto bg-purple-900/30 text-purple-300 border-purple-700">
                Response Time
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={latencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  style={{ fontSize: '11px' }}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  style={{ fontSize: '12px' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="Transactions" 
                  fill="#a855f7" 
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
              <p className="text-xs text-purple-300">
                Most transactions fall within{' '}
                <span className="font-bold">
                  {latencyData.reduce((max, d) => 
                    d.Transactions > max.count ? { name: d.name, count: d.Transactions } : max, 
                    { name: '', count: 0 }
                  ).name}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Success Rate Pie Chart */}
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <PieChartIcon className="w-5 h-5 text-green-400" />
              Transaction Status
              <Badge className="ml-auto bg-green-900/30 text-green-300 border-green-700">
                Success Rate
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {statusData.map((item) => (
                <div key={item.name} className="p-2 rounded-lg border border-gray-700">
                  <p className="text-xs text-gray-400">{item.name}</p>
                  <p className="text-lg font-bold" style={{ color: item.color }}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Timeline */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Activity className="w-5 h-5 text-cyan-400" />
            Transaction Timeline
            <Badge className="ml-auto bg-cyan-900/30 text-cyan-300 border-cyan-700">
              Time Series
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timelineDataVar}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af" 
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#9ca3af" 
                style={{ fontSize: '12px' }}
                label={{ value: 'TX Count', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Area 
                type="monotone" 
                dataKey="Success" 
                stackId="1"
                stroke="#22c55e" 
                fill="#22c55e"
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="Failed" 
                stackId="1"
                stroke="#ef4444" 
                fill="#ef4444"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center text-sm text-gray-400">
            <p>Transaction distribution across time buckets showing success/failure patterns</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
