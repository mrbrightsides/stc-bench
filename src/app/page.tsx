'use client'
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Zap, Shield, Database, AlertCircle, BookOpen, BarChart3, History, GitCompare, Network } from 'lucide-react';
import { ContractInputComponent } from '@/components/contract-input';
import { ScenarioEditor } from '@/components/scenario-editor';
import { BenchmarkResults } from '@/components/benchmark-results';
import { FileUpload } from '@/components/file-upload';
import { RealtimeMonitor } from '@/components/real-time-monitor';
import { AboutApp } from '@/components/about-app';
import { NetworkSelector, SUPPORTED_NETWORKS, type NetworkConfig } from '@/components/network-selector';
import { HistoryView } from '@/components/history-view';
import { ComparisonView } from '@/components/comparison-view';
import type { ContractInput, ScenarioConfig, BenchmarkResult } from '@/types/benchmark';
import { parseScenarioYaml } from '@/lib/benchmark-runner';
import { DEFAULT_SCENARIO_YAML } from '@/types/benchmark';
import { useSpacetimeBenchmark } from '@/hooks/use-spacetime-benchmark';

import { sdk } from '@farcaster/miniapp-sdk'
import { useAddMiniApp } from "@/hooks/useAddMiniApp";
import { useQuickAuth } from "@/hooks/useQuickAuth";
import { useIsInFarcaster } from "@/hooks/useIsInFarcaster";

export default function STCBenchPage(): JSX.Element {
    const { addMiniApp } = useAddMiniApp();
    const isInFarcaster = useIsInFarcaster()
    useQuickAuth(isInFarcaster)
    useEffect(() => {
      const tryAddMiniApp = async () => {
        try {
          await addMiniApp()
        } catch (error) {
          console.error('Failed to add mini app:', error)
        }

      }

    

      tryAddMiniApp()
    }, [addMiniApp])
  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 100))
        
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            if (document.readyState === 'complete') {
              resolve(void 0)
            } else {
              window.addEventListener('load', () => resolve(void 0), { once: true })
            }
          })
        }
        
        await sdk.actions.ready()
        console.log('Farcaster SDK initialized successfully - app fully loaded')
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error)
        setTimeout(async () => {
          try {
            await sdk.actions.ready()
            console.log('Farcaster SDK initialized on retry')
          } catch (retryError) {
            console.error('Farcaster SDK retry failed:', retryError)
          }
        }, 1000)
      }
    }

    initializeFarcaster()
  }, [])
  // State management
  const [contractInput, setContractInput] = useState<ContractInput>({
    address: '',
    abi: ''
  });
  
  const [scenarioYaml, setScenarioYaml] = useState<string>(DEFAULT_SCENARIO_YAML);
  const [validScenario, setValidScenario] = useState<ScenarioConfig | null>(null);
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [selectedNetwork, setSelectedNetwork] = useState<NetworkConfig>(SUPPORTED_NETWORKS[0]);
  
  // SpacetimeDB integration
  const {
    isConnected: isDbConnected,
    isConnecting: isDbConnecting,
    error: dbError,
    runs: historicalRuns,
    transactions: historicalTransactions,
    saveBenchmarkRun,
    saveBenchmarkTransaction,
    deleteRun,
    useLocalStorage: isUsingLocalStorage
  } = useSpacetimeBenchmark();
  
  // Historical results for comparison
  const [allHistoricalResults, setAllHistoricalResults] = useState<BenchmarkResult[]>([]);

  // Validation
  const isValidAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const isValidAbi = (abi: string): boolean => {
    if (!abi.trim()) return false;
    try {
      const parsed = JSON.parse(abi);
      return Array.isArray(parsed);
    } catch {
      return false;
    }
  };

  const canRunBenchmark = (): boolean => {
    return (
      isValidAddress(contractInput.address) &&
      isValidAbi(contractInput.abi) &&
      validScenario !== null &&
      !isRunning
    );
  };

  // Benchmark execution
  const runBenchmark = async (): Promise<void> => {
    if (!canRunBenchmark() || !validScenario) return;

    setIsRunning(true);
    setError('');
    setBenchmarkResults(null);

    try {
      const response = await fetch('/api/benchmark/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario: validScenario,
          contractAddress: contractInput.address,
          contractAbi: contractInput.abi,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Benchmark failed');
      }

      const result: BenchmarkResult = await response.json();
      setBenchmarkResults(result);
      
      // Auto-save to SpacetimeDB
      if (isDbConnected && result.runs.length > 0) {
        try {
          for (const run of result.runs) {
            await saveBenchmarkRun(run);
          }
          for (const tx of result.transactions) {
            await saveBenchmarkTransaction(tx);
          }
          console.log('Benchmark results saved to SpacetimeDB');
          setSuccessMessage('✅ Benchmark results saved to history!');
        } catch (saveError) {
          console.error('Failed to save to SpacetimeDB:', saveError);
        }
      }
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  const handleDataLoaded = async (data: BenchmarkResult): Promise<void> => {
    setBenchmarkResults(data);
    setError('');
    
    // Auto-save uploaded data to SpacetimeDB
    if (isDbConnected && data.runs.length > 0) {
      try {
        for (const run of data.runs) {
          await saveBenchmarkRun(run);
        }
        for (const tx of data.transactions) {
          await saveBenchmarkTransaction(tx);
        }
        console.log('Uploaded benchmark data saved to SpacetimeDB history');
        setSuccessMessage('✅ Uploaded data saved to history! Check the History tab.');
      } catch (saveError) {
        console.error('Failed to save uploaded data to SpacetimeDB:', saveError);
      }
    }
  };
  
  const handleSelectHistoricalRun = (run: BenchmarkResult['runs'][0]): void => {
    // Create a BenchmarkResult from the historical run
    const historicalResult: BenchmarkResult = {
      runs: [run],
      transactions: historicalTransactions.filter(tx => tx.run_id === run.run_id),
      summary: {
        total_runs: 1,
        total_transactions: historicalTransactions.filter(tx => tx.run_id === run.run_id).length,
        overall_success_rate: run.success_rate,
        avg_tps: run.tps_avg,
        networks: [run.network]
      }
    };
    setBenchmarkResults(historicalResult);
  };
  
  // Update historical results when runs change
  useEffect(() => {
    if (historicalRuns.length > 0) {
      const groupedResults = historicalRuns.map(run => ({
        runs: [run],
        transactions: historicalTransactions.filter(tx => tx.run_id === run.run_id),
        summary: {
          total_runs: 1,
          total_transactions: historicalTransactions.filter(tx => tx.run_id === run.run_id).length,
          overall_success_rate: run.success_rate,
          avg_tps: run.tps_avg,
          networks: [run.network]
        }
      }));
      setAllHistoricalResults(groupedResults);
    }
  }, [historicalRuns, historicalTransactions]);

  return (
    <div className="min-h-screen bg-black text-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">STC Bench</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Ethereum Smart Contract Benchmarking Platform
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Test performance, analyze gas usage, and optimize your smart contracts on Sepolia testnet
          </p>
          
          {/* Feature badges */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Cloud Safe
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Database className="w-3 h-3" />
              STC Analytics
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Real-time Results
            </Badge>
          </div>
        </div>

        {/* SpacetimeDB Connection Status */}
        {isDbConnecting && (
          <Alert className="mb-6 bg-blue-900/20 border-blue-600">
            <Database className="w-4 h-4 text-blue-400" />
            <AlertDescription className="text-blue-300">
              Connecting to SpacetimeDB for persistent storage...
            </AlertDescription>
          </Alert>
        )}
        
        {isDbConnected && (
          <Alert className="mb-6 bg-green-900/20 border-green-600">
            <Database className="w-4 h-4 text-green-400" />
            <AlertDescription className="text-green-300">
              {isUsingLocalStorage 
                ? `Using Browser Storage • ${historicalRuns.length} benchmark runs stored (data persists locally)`
                : `Connected to SpacetimeDB • ${historicalRuns.length} benchmark runs stored`
              }
            </AlertDescription>
          </Alert>
        )}
        
        {dbError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              SpacetimeDB Error: {dbError} (Working in local mode)
            </AlertDescription>
          </Alert>
        )}

        {/* Main content with tabs */}
        <Tabs defaultValue="benchmark" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8 bg-gray-900 border border-gray-700">
            <TabsTrigger 
              value="benchmark" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4" />
              Benchmark
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
            <TabsTrigger 
              value="comparison" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <GitCompare className="w-4 h-4" />
              Compare
            </TabsTrigger>
            <TabsTrigger 
              value="network" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Network className="w-4 h-4" />
              Networks
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BookOpen className="w-4 h-4" />
              Tentang App
            </TabsTrigger>
          </TabsList>

          <TabsContent value="benchmark" className="space-y-8">
            {/* Configuration Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Contract Input */}
              <ContractInputComponent
                value={contractInput}
                onChange={setContractInput}
              />

              {/* Scenario Editor */}
              <ScenarioEditor
                value={scenarioYaml}
                onChange={setScenarioYaml}
                onValidScenario={setValidScenario}
              />
            </div>

            {/* Run Benchmark Section */}
            <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white">Run Benchmark</h3>
                  <p className="text-sm text-gray-400">
                    Execute your smart contract benchmark on Sepolia testnet
                  </p>
                </div>
                
                <Button
                  onClick={runBenchmark}
                  disabled={!canRunBenchmark()}
                  size="lg"
                  className="min-w-[140px]"
                >
                  {isRunning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Run Benchmark
                    </>
                  )}
                </Button>
              </div>
              
              {!canRunBenchmark() && !isRunning && (
                <Alert className="mt-4">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    Please provide a valid contract address, ABI, and scenario configuration to run the benchmark.
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {/* Success Message */}
            {successMessage && isDbConnected && (
              <Alert className="bg-green-900/20 border-green-600">
                <Database className="w-4 h-4 text-green-400" />
                <AlertDescription className="text-green-300">
                  {successMessage}
                </AlertDescription>
              </Alert>
            )}

            <Separator className="my-8" />

            {/* Real-time Monitor */}
            <RealtimeMonitor isActive={isRunning} scenario={validScenario} />

            <Separator className="my-8" />

            {/* File Upload Section */}
            <FileUpload onDataLoaded={handleDataLoaded} />

            <Separator className="my-8" />

            {/* Results Section */}
            <BenchmarkResults results={benchmarkResults} isLoading={isRunning} />
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <HistoryView 
              runs={historicalRuns}
              onDeleteRun={deleteRun}
              onSelectRun={handleSelectHistoricalRun}
            />
          </TabsContent>
          
          <TabsContent value="comparison" className="mt-0">
            <ComparisonView results={allHistoricalResults} />
          </TabsContent>
          
          <TabsContent value="network" className="mt-0">
            <NetworkSelector 
              selectedNetwork={selectedNetwork}
              onNetworkChange={setSelectedNetwork}
            />
            
            <div className="mt-6 p-4 bg-gray-800 border border-gray-700 rounded-lg">
              <h3 className="text-white font-semibold mb-2">Current Configuration</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Network:</span>
                  <span className="text-white">{selectedNetwork.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Chain ID:</span>
                  <span className="text-white">{selectedNetwork.chainId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">RPC URL:</span>
                  <span className="text-white font-mono text-xs truncate max-w-xs">{selectedNetwork.rpcUrl}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Block Time:</span>
                  <span className="text-white">{selectedNetwork.blockTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gas Estimate:</span>
                  <span className="text-white">{selectedNetwork.gasEstimate}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about" className="mt-0">
            <AboutApp />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-gray-700">
          <div className="text-center text-sm text-gray-400 space-y-2">
            <p>
              STC Bench - Smart Contract Testing & Performance Analysis
            </p>
            <p>
              Secure, cloud-ready benchmarking for Ethereum smart contracts
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <Badge variant="outline" className="bg-blue-900/30 border-blue-600 text-blue-300">Sepolia Testnet</Badge>
              <Badge variant="outline" className="bg-green-900/30 border-green-600 text-green-300">STC Analytics Format</Badge>
              <Badge variant="outline" className="bg-purple-900/30 border-purple-600 text-purple-300">JSON/NDJSON/CSV Export</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}