'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, Play, AlertCircle, CheckCircle, Zap, Clock, Users } from 'lucide-react';
import { parseScenarioYaml } from '@/lib/benchmark-runner';
import type { ScenarioConfig } from '@/types/benchmark';
import { DEFAULT_SCENARIO_YAML } from '@/types/benchmark';

interface ScenarioEditorProps {
  value: string;
  onChange: (yaml: string) => void;
  onValidScenario: (scenario: ScenarioConfig | null) => void;
}

export function ScenarioEditor({ value, onChange, onValidScenario }: ScenarioEditorProps): JSX.Element {
  const [validationError, setValidationError] = useState<string>('');
  const [parsedScenario, setParsedScenario] = useState<ScenarioConfig | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const validateYaml = useCallback(async (yamlContent: string): Promise<void> => {
    if (!yamlContent.trim()) {
      setValidationError('');
      setParsedScenario(null);
      onValidScenario(null);
      setIsValidating(false);
      return;
    }

    setIsValidating(true);
    
    // Add slight delay to show validation progress
    await new Promise(resolve => setTimeout(resolve, 300));

    try {
      const scenario = parseScenarioYaml(yamlContent);
      setParsedScenario(scenario);
      setValidationError('');
      onValidScenario(scenario);
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Invalid YAML format');
      setParsedScenario(null);
      onValidScenario(null);
    }
    
    setIsValidating(false);
  }, [onValidScenario]);

  const handleYamlChange = (newValue: string): void => {
    onChange(newValue);
    validateYaml(newValue);
  };

  const loadTemplate = (template: string): void => {
    setActiveTemplate(template);
    let templateContent = '';
    
    switch (template) {
      case 'transfer':
        templateContent = `# ERC-20 Transfer Benchmark
name: "ERC-20 Transfer Test"
type: "transfer"
contract_address: "0x..."
function_name: "transfer"
concurrency: 5
tx_per_user: 10
duration_seconds: 60
gas_limit: 65000
gas_price_gwei: 20
parameters:
  to: "0x742d35Cc69AEBD3C9fa5D8e8e1d3b9678F0B7F6f"
  value: "1000000000000000000"  # 1 ETH in wei
`;
        break;
      case 'mint':
        templateContent = `# NFT Minting Benchmark
name: "NFT Mint Test"
type: "mint"
contract_address: "0x..."
function_name: "mint"
concurrency: 3
tx_per_user: 5
duration_seconds: 120
gas_limit: 100000
gas_price_gwei: 25
parameters:
  to: "0x742d35Cc69AEBD3C9fa5D8e8e1d3b9678F0B7F6f"
  tokenId: "1"
`;
        break;
      case 'synthetic':
        templateContent = `# Synthetic Load Test
name: "High Load Synthetic Test"
type: "synthetic"
contract_address: "0x..."
function_name: "complexOperation"
concurrency: 20
tx_per_user: 50
duration_seconds: 180
gas_limit: 200000
gas_price_gwei: 30
parameters:
  data: "0x1234567890abcdef"
  amount: "100000000000000000000"
`;
        break;
      default:
        templateContent = DEFAULT_SCENARIO_YAML;
        setActiveTemplate('default');
    }
    
    handleYamlChange(templateContent);
  };

  const getScenarioTypeColor = (type: string): string => {
    switch (type) {
      case 'transfer': return 'bg-blue-900 text-blue-200 border-blue-700';
      case 'mint': return 'bg-green-900 text-green-200 border-green-700';
      case 'synthetic': return 'bg-purple-900 text-purple-200 border-purple-700';
      default: return 'bg-gray-700 text-gray-200 border-gray-600';
    }
  };

  const estimatedTotalTx = parsedScenario ? parsedScenario.concurrency * parsedScenario.tx_per_user : 0;
  const estimatedDuration = parsedScenario?.duration_seconds || 0;

  return (
    <Card className="w-full bg-gray-900 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="w-5 h-5 text-blue-400" />
          Scenario Configuration
          {isValidating && (
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin ml-2" />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
            <TabsTrigger value="editor" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300">
              YAML Editor
            </TabsTrigger>
            <TabsTrigger value="preview" className="data-[state=active]:bg-gray-700 data-[state=active]:text-white text-gray-300">
              Preview & Analytics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-sm font-medium text-gray-200">
                Scenario YAML Configuration
              </Label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeTemplate === 'transfer' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => loadTemplate('transfer')}
                  className="text-xs bg-blue-600 hover:bg-blue-700"
                >
                  Transfer Template
                </Button>
                <Button
                  variant={activeTemplate === 'mint' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => loadTemplate('mint')}
                  className="text-xs bg-green-600 hover:bg-green-700"
                >
                  Mint Template
                </Button>
                <Button
                  variant={activeTemplate === 'synthetic' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => loadTemplate('synthetic')}
                  className="text-xs bg-purple-600 hover:bg-purple-700"
                >
                  Synthetic Template
                </Button>
              </div>
            </div>
            
            <Textarea
              value={value}
              onChange={(e) => handleYamlChange(e.target.value)}
              className="min-h-[300px] font-mono text-sm bg-gray-800 border-gray-600 text-white 
                placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20 
                transition-all duration-200"
              placeholder="Enter your scenario YAML configuration..."
            />
            
            {validationError && (
              <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-200">
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  {validationError}
                </AlertDescription>
              </Alert>
            )}
            
            {parsedScenario && !validationError && !isValidating && (
              <Alert className="bg-green-900/20 border-green-800 text-green-200">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <AlertDescription className="flex items-center gap-2">
                  Configuration is valid and ready to run
                  <Badge className="bg-green-800 text-green-200 text-xs">
                    {estimatedTotalTx.toLocaleString()} total TX
                  </Badge>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-6">
            {parsedScenario ? (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{parsedScenario.name}</h3>
                  <Badge className={getScenarioTypeColor(parsedScenario.type)}>
                    {parsedScenario.type}
                  </Badge>
                </div>
                
                {/* Performance Estimates */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-blue-400" />
                      <span className="text-sm font-medium text-gray-300">Concurrency</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-400">{parsedScenario.concurrency}</div>
                    <p className="text-xs text-gray-400">Parallel workers</p>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium text-gray-300">Total TX</span>
                    </div>
                    <div className="text-2xl font-bold text-green-400">{estimatedTotalTx.toLocaleString()}</div>
                    <p className="text-xs text-gray-400">Transactions to execute</p>
                  </div>
                  
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-gray-300">Duration</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-400">{estimatedDuration}s</div>
                    <p className="text-xs text-gray-400">Max runtime</p>
                  </div>
                </div>
                
                {/* Configuration Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-200 border-b border-gray-700 pb-1">Contract Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Function:</span>
                        <span className="text-white font-mono">{parsedScenario.function_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Contract:</span>
                        <span className="text-white font-mono text-xs">
                          {parsedScenario.contract_address.slice(0, 8)}...
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">TX per User:</span>
                        <span className="text-white">{parsedScenario.tx_per_user}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-200 border-b border-gray-700 pb-1">Gas Settings</h4>
                    <div className="space-y-2">
                      {parsedScenario.gas_limit && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Gas Limit:</span>
                          <span className="text-white">{parsedScenario.gas_limit.toLocaleString()}</span>
                        </div>
                      )}
                      {parsedScenario.gas_price_gwei && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Gas Price:</span>
                          <span className="text-white">{parsedScenario.gas_price_gwei} Gwei</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">Est. Gas Cost:</span>
                        <span className="text-green-400">
                          {parsedScenario.gas_limit && parsedScenario.gas_price_gwei ? 
                            `~${((parsedScenario.gas_limit * parsedScenario.gas_price_gwei * estimatedTotalTx) / 1e9).toFixed(4)} ETH`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {parsedScenario.parameters && Object.keys(parsedScenario.parameters).length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-200 border-b border-gray-700 pb-1">Function Parameters</h4>
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 font-mono text-xs">
                      <pre className="text-gray-300 whitespace-pre-wrap">
                        {JSON.stringify(parsedScenario.parameters, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Performance Projection */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-200 border-b border-gray-700 pb-1">Performance Projection</h4>
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Est. TPS:</span>
                        <div className="text-lg font-semibold text-blue-400">
                          {estimatedDuration > 0 ? Math.round(estimatedTotalTx / estimatedDuration) : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Load Level:</span>
                        <div className="text-lg font-semibold text-yellow-400">
                          {parsedScenario.concurrency <= 5 ? 'Light' : 
                           parsedScenario.concurrency <= 15 ? 'Medium' : 'Heavy'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Complexity:</span>
                        <div className="text-lg font-semibold text-purple-400">
                          {parsedScenario.type === 'transfer' ? 'Low' :
                           parsedScenario.type === 'mint' ? 'Medium' : 'High'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-lg mb-2">Enter a valid YAML configuration</p>
                <p className="text-sm">Use the templates or write your own scenario to see the preview and analytics</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}