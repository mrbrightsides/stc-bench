'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Lightbulb, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  Zap, 
  DollarSign, 
  Target,
  Activity,
  Brain,
  Shield,
  Rocket
} from 'lucide-react';
import type { BenchmarkResult } from '@/types/benchmark';

interface SmartInsightsProps {
  results: BenchmarkResult;
}

interface Insight {
  type: 'success' | 'warning' | 'error' | 'info';
  category: string;
  title: string;
  description: string;
  recommendation?: string;
  impact: 'high' | 'medium' | 'low';
}

interface PerformanceScore {
  overall: number;
  throughput: number;
  reliability: number;
  efficiency: number;
  latency: number;
}

export function SmartInsights({ results }: SmartInsightsProps): JSX.Element {
  // Calculate performance scores
  const calculatePerformanceScore = (): PerformanceScore => {
    const avgTps = results.summary.avg_tps;
    const successRate = results.summary.overall_success_rate;
    const avgLatency = results.runs.reduce((sum, run) => sum + run.p50_ms, 0) / results.runs.length;
    const avgGasUsed = results.transactions.reduce((sum, tx) => sum + tx.gas_used, 0) / results.transactions.length;

    // Score calculations (0-100)
    const throughput = Math.min((avgTps / 50) * 100, 100); // 50 TPS = perfect score
    const reliability = successRate;
    const latency = Math.max(100 - (avgLatency / 50), 0); // Lower latency = higher score
    const efficiency = Math.max(100 - ((avgGasUsed - 21000) / 1000), 0); // Lower gas = higher score

    const overall = (throughput + reliability + efficiency + latency) / 4;

    return {
      overall: Math.round(overall),
      throughput: Math.round(throughput),
      reliability: Math.round(reliability),
      efficiency: Math.round(efficiency),
      latency: Math.round(latency),
    };
  };

  // Generate insights based on benchmark data
  const generateInsights = (): Insight[] => {
    const insights: Insight[] = [];
    const score = calculatePerformanceScore();
    const avgTps = results.summary.avg_tps;
    const successRate = results.summary.overall_success_rate;
    const avgLatency = results.runs.reduce((sum, run) => sum + run.p50_ms, 0) / results.runs.length;
    const avgGasUsed = results.transactions.reduce((sum, tx) => sum + tx.gas_used, 0) / results.transactions.length;
    const peakTps = Math.max(...results.runs.map(run => run.tps_peak));
    const failedTxCount = results.transactions.filter(tx => tx.status === 'failed').length;

    // TPS Analysis
    if (avgTps < 10) {
      insights.push({
        type: 'warning',
        category: 'Throughput',
        title: 'Low Transaction Throughput',
        description: `Average TPS of ${avgTps.toFixed(2)} is below optimal range (10-50 TPS).`,
        recommendation: 'Consider optimizing contract logic, increasing concurrency, or reviewing gas limits.',
        impact: 'high',
      });
    } else if (avgTps >= 30) {
      insights.push({
        type: 'success',
        category: 'Throughput',
        title: 'Excellent Throughput Performance',
        description: `Achieving ${avgTps.toFixed(2)} TPS indicates strong performance capacity.`,
        recommendation: 'Maintain current optimization strategies and monitor for consistency.',
        impact: 'low',
      });
    } else {
      insights.push({
        type: 'info',
        category: 'Throughput',
        title: 'Moderate Throughput',
        description: `Current TPS of ${avgTps.toFixed(2)} is acceptable but has room for improvement.`,
        recommendation: 'Test with higher concurrency levels to identify maximum capacity.',
        impact: 'medium',
      });
    }

    // Success Rate Analysis
    if (successRate < 80) {
      insights.push({
        type: 'error',
        category: 'Reliability',
        title: 'Critical: High Failure Rate',
        description: `Success rate of ${successRate}% indicates significant reliability issues.`,
        recommendation: 'Urgent: Review failed transactions for error patterns. Check gas limits, contract logic, and network conditions.',
        impact: 'high',
      });
    } else if (successRate < 95) {
      insights.push({
        type: 'warning',
        category: 'Reliability',
        title: 'Moderate Failure Rate Detected',
        description: `Success rate of ${successRate}% could impact production readiness.`,
        recommendation: 'Investigate ${failedTxCount} failed transactions and address common error patterns.',
        impact: 'medium',
      });
    } else {
      insights.push({
        type: 'success',
        category: 'Reliability',
        title: 'High Reliability',
        description: `Success rate of ${successRate}% demonstrates excellent contract stability.`,
        impact: 'low',
      });
    }

    // Latency Analysis
    if (avgLatency > 5000) {
      insights.push({
        type: 'warning',
        category: 'Performance',
        title: 'High Latency Detected',
        description: `Average latency of ${Math.round(avgLatency)}ms may impact user experience.`,
        recommendation: 'Review network conditions, optimize RPC endpoints, or consider L2 solutions.',
        impact: 'high',
      });
    } else if (avgLatency < 1000) {
      insights.push({
        type: 'success',
        category: 'Performance',
        title: 'Excellent Response Time',
        description: `Average latency of ${Math.round(avgLatency)}ms provides great user experience.`,
        impact: 'low',
      });
    }

    // Gas Usage Analysis
    if (avgGasUsed > 200000) {
      insights.push({
        type: 'warning',
        category: 'Cost Efficiency',
        title: 'High Gas Consumption',
        description: `Average gas usage of ${Math.round(avgGasUsed).toLocaleString()} is significantly high.`,
        recommendation: 'Optimize contract code, reduce storage operations, and use efficient data structures.',
        impact: 'high',
      });
    } else if (avgGasUsed < 50000) {
      insights.push({
        type: 'success',
        category: 'Cost Efficiency',
        title: 'Optimized Gas Usage',
        description: `Average gas of ${Math.round(avgGasUsed).toLocaleString()} demonstrates excellent efficiency.`,
        impact: 'low',
      });
    }

    // TPS Variance Analysis
    const tpsVariance = peakTps - avgTps;
    if (tpsVariance > avgTps * 0.5) {
      insights.push({
        type: 'info',
        category: 'Consistency',
        title: 'High TPS Variance',
        description: `Peak TPS (${peakTps.toFixed(2)}) significantly exceeds average, indicating inconsistent performance.`,
        recommendation: 'Run longer benchmarks to understand sustained performance capabilities.',
        impact: 'medium',
      });
    }

    // Overall Performance Assessment
    if (score.overall >= 80) {
      insights.push({
        type: 'success',
        category: 'Overall',
        title: 'Production Ready',
        description: `Overall performance score of ${score.overall}/100 indicates readiness for mainnet deployment.`,
        recommendation: 'Continue monitoring performance metrics and maintain optimization practices.',
        impact: 'low',
      });
    } else if (score.overall >= 60) {
      insights.push({
        type: 'warning',
        category: 'Overall',
        title: 'Optimization Recommended',
        description: `Performance score of ${score.overall}/100 suggests improvements needed before production.`,
        recommendation: 'Focus on high-impact issues identified above before mainnet launch.',
        impact: 'medium',
      });
    } else {
      insights.push({
        type: 'error',
        category: 'Overall',
        title: 'Significant Optimization Required',
        description: `Performance score of ${score.overall}/100 indicates contract needs substantial improvements.`,
        recommendation: 'Address critical issues before considering production deployment.',
        impact: 'high',
      });
    }

    // Cost Projection
    const totalGasCost = results.transactions.reduce((sum, tx) => 
      sum + (tx.gas_used * Number(tx.gas_price_wei)), 0);
    const avgCostPerTx = totalGasCost / results.transactions.length;
    const costInEth = avgCostPerTx / 1e18;
    
    if (costInEth > 0.001) {
      insights.push({
        type: 'warning',
        category: 'Cost',
        title: 'High Transaction Costs',
        description: `Average cost per transaction is ${costInEth.toFixed(6)} ETH.`,
        recommendation: 'Consider gas optimizations or L2 deployment to reduce costs for users.',
        impact: 'high',
      });
    }

    return insights;
  };

  const score = calculatePerformanceScore();
  const insights = generateInsights();

  // Sort insights by impact
  const sortedInsights = insights.sort((a, b) => {
    const impactOrder = { high: 0, medium: 1, low: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  });

  const getInsightIcon = (type: string): JSX.Element => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Lightbulb className="w-5 h-5 text-blue-400" />;
    }
  };

  const getInsightColor = (type: string): string => {
    switch (type) {
      case 'success':
        return 'border-green-700 bg-green-900/20';
      case 'warning':
        return 'border-yellow-700 bg-yellow-900/20';
      case 'error':
        return 'border-red-700 bg-red-900/20';
      default:
        return 'border-blue-700 bg-blue-900/20';
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreGradient = (score: number): string => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  return (
    <div className="space-y-6">
      {/* Performance Score Dashboard */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Brain className="w-5 h-5 text-purple-400" />
            Smart Performance Analysis
            <Badge className="ml-auto bg-purple-900/30 text-purple-300 border-purple-700">
              AI-Powered Insights
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className="inline-flex flex-col items-center p-6 rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700">
                <p className="text-sm text-gray-400 mb-2">Overall Performance Score</p>
                <div className={`text-6xl font-bold ${getScoreColor(score.overall)} mb-2`}>
                  {score.overall}
                  <span className="text-2xl">/100</span>
                </div>
                <div className={`px-4 py-1 rounded-full bg-gradient-to-r ${getScoreGradient(score.overall)} text-white text-sm font-medium`}>
                  {score.overall >= 80 ? '🚀 Excellent' : score.overall >= 60 ? '⚠️ Good' : '❌ Needs Work'}
                </div>
              </div>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-300">Throughput</span>
                </div>
                <div className="space-y-2">
                  <div className={`text-2xl font-bold ${getScoreColor(score.throughput)}`}>
                    {score.throughput}
                  </div>
                  <Progress 
                    value={score.throughput} 
                    className="h-2 bg-gray-700"
                  />
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">Reliability</span>
                </div>
                <div className="space-y-2">
                  <div className={`text-2xl font-bold ${getScoreColor(score.reliability)}`}>
                    {score.reliability}
                  </div>
                  <Progress 
                    value={score.reliability} 
                    className="h-2 bg-gray-700"
                  />
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm text-gray-300">Efficiency</span>
                </div>
                <div className="space-y-2">
                  <div className={`text-2xl font-bold ${getScoreColor(score.efficiency)}`}>
                    {score.efficiency}
                  </div>
                  <Progress 
                    value={score.efficiency} 
                    className="h-2 bg-gray-700"
                  />
                </div>
              </div>

              <div className="bg-gray-800 border border-gray-700 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-300">Latency</span>
                </div>
                <div className="space-y-2">
                  <div className={`text-2xl font-bold ${getScoreColor(score.latency)}`}>
                    {score.latency}
                  </div>
                  <Progress 
                    value={score.latency} 
                    className="h-2 bg-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Insights */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Actionable Insights & Recommendations
            <Badge className="ml-auto bg-yellow-900/30 text-yellow-300 border-yellow-700">
              {sortedInsights.length} Insights
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedInsights.map((insight, index) => (
              <Alert 
                key={index} 
                className={`${getInsightColor(insight.type)} border`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getInsightIcon(insight.type)}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <AlertDescription className="text-white font-semibold text-base">
                        {insight.title}
                      </AlertDescription>
                      <Badge 
                        variant="outline" 
                        className={`
                          ${insight.impact === 'high' ? 'border-red-600 text-red-300' : 
                            insight.impact === 'medium' ? 'border-yellow-600 text-yellow-300' : 
                            'border-gray-600 text-gray-300'}
                        `}
                      >
                        {insight.impact.toUpperCase()} IMPACT
                      </Badge>
                    </div>
                    <AlertDescription className="text-gray-300 text-sm">
                      {insight.description}
                    </AlertDescription>
                    {insight.recommendation && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="flex items-start gap-2">
                          <Rocket className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-300">
                            <span className="font-semibold">Recommendation:</span> {insight.recommendation}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                      <Target className="w-3 h-3" />
                      <span>Category: {insight.category}</span>
                    </div>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <TrendingUp className="w-6 h-6 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{results.summary.avg_tps}</p>
              <p className="text-xs text-gray-400">Avg TPS</p>
            </div>
            <div className="text-center">
              <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{results.summary.overall_success_rate}%</p>
              <p className="text-xs text-gray-400">Success Rate</p>
            </div>
            <div className="text-center">
              <Activity className="w-6 h-6 text-purple-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {Math.round(results.runs.reduce((sum, run) => sum + run.p50_ms, 0) / results.runs.length)}ms
              </p>
              <p className="text-xs text-gray-400">P50 Latency</p>
            </div>
            <div className="text-center">
              <DollarSign className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">
                {Math.round(results.transactions.reduce((sum, tx) => sum + tx.gas_used, 0) / results.transactions.length).toLocaleString()}
              </p>
              <p className="text-xs text-gray-400">Avg Gas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
