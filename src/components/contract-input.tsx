'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, Check, AlertCircle, ExternalLink } from 'lucide-react';
import type { ContractInput } from '@/types/benchmark';
import { SAMPLE_ABI } from '@/types/benchmark';

interface ContractInputProps {
  value: ContractInput;
  onChange: (input: ContractInput) => void;
}

export function ContractInputComponent({ value, onChange }: ContractInputProps): JSX.Element {
  const [copied, setCopied] = useState<boolean>(false);
  const [abiError, setAbiError] = useState<string>('');

  const handleAddressChange = (address: string): void => {
    onChange({ ...value, address });
  };

  const handleAbiChange = (abi: string): void => {
    setAbiError('');
    
    // Validate ABI JSON
    if (abi.trim()) {
      try {
        JSON.parse(abi);
      } catch (error) {
        setAbiError('Invalid JSON format');
      }
    }
    
    onChange({ ...value, abi });
  };

  const loadSampleAbi = (): void => {
    onChange({ ...value, abi: SAMPLE_ABI });
    setAbiError('');
  };

  const copyToClipboard = async (text: string): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const isValidAddress = (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const openInEtherscan = (): void => {
    if (isValidAddress(value.address)) {
      window.open(`https://sepolia.etherscan.io/address/${value.address}`, '_blank');
    }
  };

  return (
    <Card className="w-full bg-gray-900 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-white">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          Contract Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="contract-address" className="text-sm font-medium text-gray-200">
            Contract Address
          </Label>
          <div className="flex gap-2">
            <Input
              id="contract-address"
              placeholder="0x..."
              value={value.address}
              onChange={(e) => handleAddressChange(e.target.value)}
              className={`font-mono bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 
                focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200
                ${!value.address || isValidAddress(value.address) 
                  ? '' : 'border-red-400 focus:border-red-500 focus:ring-red-500/20'}`}
            />
            {value.address && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(value.address)}
                  className="shrink-0 border-gray-600 bg-gray-800 hover:bg-gray-700 text-white"
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </Button>
                {isValidAddress(value.address) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openInEtherscan}
                    className="shrink-0 border-gray-600 bg-gray-800 hover:bg-gray-700 text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </>
            )}
          </div>
          {value.address && !isValidAddress(value.address) && (
            <Alert variant="destructive" className="py-2 bg-red-900/20 border-red-800 text-red-200">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-sm">
                Please enter a valid Ethereum address (0x followed by 40 hexadecimal characters)
              </AlertDescription>
            </Alert>
          )}
          {value.address && isValidAddress(value.address) && (
            <div className="flex items-center gap-2 text-xs text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Valid Ethereum address detected
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="contract-abi" className="text-sm font-medium text-gray-200">
              Contract ABI (JSON)
            </Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadSampleAbi}
              className="text-xs text-blue-400 hover:text-blue-300 hover:bg-gray-800"
            >
              Load Sample ABI
            </Button>
          </div>
          <Textarea
            id="contract-abi"
            placeholder="Paste your contract ABI JSON here..."
            value={value.abi}
            onChange={(e) => handleAbiChange(e.target.value)}
            className={`min-h-[200px] font-mono text-xs bg-gray-800 border-gray-600 text-white 
              placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500/20
              transition-all duration-200 ${abiError ? 'border-red-400 focus:border-red-500' : ''}`}
          />
          {abiError && (
            <Alert variant="destructive" className="py-2 bg-red-900/20 border-red-800 text-red-200">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-sm">
                {abiError}
              </AlertDescription>
            </Alert>
          )}
          {value.abi && !abiError && (
            <div className="flex items-center gap-2 text-xs text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              Valid ABI JSON detected ({JSON.parse(value.abi).length} functions)
            </div>
          )}
          <p className="text-xs text-gray-400">
            Paste the ABI JSON array for your smart contract. This defines the functions that can be benchmarked.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}