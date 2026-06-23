'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Zap, Clock, Target, TrendingUp, Wifi, Database } from 'lucide-react';

interface RealtimeMonitorProps {
  isActive: boolean;
  scenario?: {
    name: string;
    concurrency: number;
    tx_per_user: number;
    duration_seconds: number;
  };
}

interface LiveMetrics {
  currentTps: number;
  peakTps: number;
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  avgLatency: number;
  elapsedTime: number;
  estimatedCompletion: number;
  activeWorkers: number;
}

export function RealtimeMonitor({ isActive, scenario }: RealtimeMonitorProps): JSX.Element {
  const [metrics, setMetrics] = useState<LiveMetrics>({
    currentTps: 0,
    peakTps: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    avgLatency: 0,
    elapsedTime: 0,
    estimatedCompletion: 0,
    activeWorkers: 0,
  });

  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Simulate real-time metrics when benchmark is active
  useEffect(() => {
    if (!isActive) {
      setConnectionStatus('disconnected');
      setMetrics({
        currentTps: 0,
        peakTps: 0,
        totalTransactions: 0,
        successfulTransactions: 0,
        failedTransactions: 0,
        avgLatency: 0,
        elapsedTime: 0,
        estimatedCompletion: 0,
        activeWorkers: 0,
      });
      return;
    }

    setConnectionStatus('connecting');
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const maxDuration = scenario?.duration_seconds || 120;
      const maxTx = scenario ? scenario.concurrency * scenario.tx_per_user : 100;
      
      if (elapsed > maxDuration) {
        clearInterval(interval);
        setConnectionStatus('disconnected');
        return;
      }

      // Simulate realistic metrics
      const progress = Math.min(elapsed / maxDuration, 1);
      const baseRate = Math.min(elapsed * 0.5, 15); // Ramp up
      const variance = Math.random() * 5 - 2.5; // ±2.5 variance
      const currentTps = Math.max(0, baseRate + variance);
      
      setMetrics(prev => ({
        currentTps: Math.round(currentTps * 10) / 10,
        peakTps: Math.max(prev.peakTps, currentTps),
        totalTransactions: Math.floor(progress * maxTx * 0.8) + Math.floor(Math.random() * 20),
        successfulTransactions: Math.floor(prev.totalTransactions * 0.92),
        failedTransactions: Math.floor(prev.totalTransactions * 0.08),
        avgLatency: 150 + Math.random() * 200,
        elapsedTime: elapsed,
        estimatedCompletion: maxDuration - elapsed,
        activeWorkers: scenario?.concurrency || 5,
      }));
      
      setConnectionStatus('connected');
      setRefreshKey(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, scenario]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'connecting': return 'text-yellow-400';
      case 'disconnected': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string): JSX.Element => {
    switch (status) {
      case 'connected': return <Wifi className="w-4 h-4 text-green-400" />;
      case 'connecting': return <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'disconnected': return <Database className="w-4 h-4 text-gray-400" />;
      default: return <Database className="w-4 h-4 text-gray-400" />;
    }
  };

  const successRate = metrics.totalTransactions > 0 
    ? Math.round((metrics.successfulTransactions / metrics.totalTransactions) * 100)
    : 0;

  const completionPercentage = scenario?.duration_seconds 
    ? Math.min((metrics.elapsedTime / scenario.duration_seconds) * 100, 100)
    : 0;

  return (
    <Card className={`w-full transition-all duration-500 ${
      isActive 
        ? 'bg-gray-900 border-green-500/50 shadow-lg shadow-green-500/10' 
        : 'bg-gray-900/50 border-gray-700'
    }`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Activity className={`w-5 h-5 transition-colors ${
              isActive ? 'text-green-400' : 'text-gray-400'
            }`} />
            Real-time Monitor
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(connectionStatus)}
            <Badge variant="outline" className={`border-gray-600 text-xs ${getStatusColor(connectionStatus)}`}>
              {connectionStatus}
            </Badge>
          </div>
        </CardTitle>
        {scenario && isActive && (
          <p className="text-sm text-gray-400">
            Monitoring: {scenario.name} • {scenario.concurrency} workers • {scenario.tx_per_user} tx/worker
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        {isActive ? (
          <>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Benchmark Progress</span>
                <span className="text-white font-mono">{Math.round(completionPercentage)}%</span>
              </div>
              <Progress value={completionPercentage} className="w-full bg-gray-800" />
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{metrics.elapsedTime}s elapsed</span>
                <span>{metrics.estimatedCompletion}s remaining</span>
              </div>
            </div>

            {/* Live Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-blue-900/20 border border-blue-800 p-3 rounded-lg">
                <div className="flex items-center gap-1 mb-1">
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span className="text-xs text-blue-200">Current TPS</span>
                </div>
                <div className="text-xl font-bold text-blue-400">{metrics.currentTps}</div>
                <div className="text-xs text-blue-200/60">Peak: {Math.round(metrics.peakTps * 10) / 10}</div>
              </div>

              <div className="bg-green-900/20 border border-green-800 p-3 rounded-lg">
                <div className="flex items-center gap-1 mb-1">
                  <Target className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-200">Success Rate</span>
                </div>
                <div className="text-xl font-bold text-green-400">{successRate}%</div>
                <div className="text-xs text-green-200/60">{metrics.successfulTransactions} / {metrics.totalTransactions}</div>
              </div>

              <div className="bg-purple-900/20 border border-purple-800 p-3 rounded-lg">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-purple-400" />
                  <span className="text-xs text-purple-200">Avg Latency</span>
                </div>
                <div className="text-xl font-bold text-purple-400">{Math.round(metrics.avgLatency)}</div>
                <div className="text-xs text-purple-200/60">milliseconds</div>
              </div>

              <div className="bg-orange-900/20 border border-orange-800 p-3 rounded-lg">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3 h-3 text-orange-400" />
                  <span className="text-xs text-orange-200">Active Workers</span>
                </div>
                <div className="text-xl font-bold text-orange-400">{metrics.activeWorkers}</div>
                <div className="text-xs text-orange-200/60">concurrent</div>
              </div>
            </div>

            {/* Transaction Stats */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-200 mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Transaction Statistics
              </h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{metrics.totalTransactions}</div>
                  <div className="text-xs text-gray-400">Total TX</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-400">{metrics.successfulTransactions}</div>
                  <div className="text-xs text-green-200/60">Successful</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-400">{metrics.failedTransactions}</div>
                  <div className="text-xs text-red-200/60">Failed</div>
                </div>
              </div>
            </div>

            {/* Live Status */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Live updates • Last refresh: {new Date().toLocaleTimeString()}</span>
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-gray-800 flex items-center justify-center">
              <Activity className="w-8 h-8 text-gray-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-400">Monitor Ready</p>
              <p className="text-sm text-gray-500 mt-1">
                Real-time metrics will appear here when a benchmark is running
              </p>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>• Live TPS monitoring</p>
              <p>• Success rate tracking</p>
              <p>• Latency analysis</p>
              <p>• Worker status updates</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}