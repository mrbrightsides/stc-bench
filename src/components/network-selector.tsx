'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Network, Zap, DollarSign, Clock } from 'lucide-react';

export interface NetworkConfig {
  id: string;
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  type: 'testnet' | 'mainnet' | 'l2';
  gasEstimate: string;
  blockTime: string;
  description: string;
}

export const SUPPORTED_NETWORKS: NetworkConfig[] = [
  {
    id: 'sepolia',
    name: 'Sepolia',
    chainId: 11155111,
    rpcUrl: 'https://rpc.sepolia.org',
    explorerUrl: 'https://sepolia.etherscan.io',
    type: 'testnet',
    gasEstimate: 'Free (Testnet)',
    blockTime: '~12s',
    description: 'Ethereum testnet - recommended for testing'
  },
  {
    id: 'goerli',
    name: 'Goerli',
    chainId: 5,
    rpcUrl: 'https://rpc.goerli.eth.aragon.network',
    explorerUrl: 'https://goerli.etherscan.io',
    type: 'testnet',
    gasEstimate: 'Free (Testnet)',
    blockTime: '~15s',
    description: 'Ethereum testnet - legacy support'
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    chainId: 80001,
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    explorerUrl: 'https://mumbai.polygonscan.com',
    type: 'testnet',
    gasEstimate: 'Free (Testnet)',
    blockTime: '~2s',
    description: 'Polygon testnet - fast and cheap'
  },
  {
    id: 'arbitrum-sepolia',
    name: 'Arbitrum Sepolia',
    chainId: 421614,
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    explorerUrl: 'https://sepolia.arbiscan.io',
    type: 'testnet',
    gasEstimate: 'Free (Testnet)',
    blockTime: '~0.3s',
    description: 'Arbitrum L2 testnet - ultra fast'
  },
  {
    id: 'optimism-sepolia',
    name: 'Optimism Sepolia',
    chainId: 11155420,
    rpcUrl: 'https://sepolia.optimism.io',
    explorerUrl: 'https://sepolia-optimism.etherscan.io',
    type: 'testnet',
    gasEstimate: 'Free (Testnet)',
    blockTime: '~2s',
    description: 'Optimism L2 testnet - optimistic rollup'
  },
  {
    id: 'base-sepolia',
    name: 'Base Sepolia',
    chainId: 84532,
    rpcUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    type: 'testnet',
    gasEstimate: 'Free (Testnet)',
    blockTime: '~2s',
    description: 'Base L2 testnet - Coinbase L2'
  },
  {
    id: 'bsc-testnet',
    name: 'BSC Testnet',
    chainId: 97,
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    explorerUrl: 'https://testnet.bscscan.com',
    type: 'testnet',
    gasEstimate: 'Free (Testnet)',
    blockTime: '~3s',
    description: 'Binance Smart Chain testnet'
  },
  {
    id: 'ethereum',
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    explorerUrl: 'https://etherscan.io',
    type: 'mainnet',
    gasEstimate: '20-100 Gwei',
    blockTime: '~12s',
    description: 'Ethereum mainnet - simulation only'
  }
];

interface NetworkSelectorProps {
  selectedNetwork: NetworkConfig;
  onNetworkChange: (network: NetworkConfig) => void;
}

export function NetworkSelector({ selectedNetwork, onNetworkChange }: NetworkSelectorProps): JSX.Element {
  const [filterType, setFilterType] = useState<'all' | 'testnet' | 'mainnet' | 'l2'>('all');

  const filteredNetworks = SUPPORTED_NETWORKS.filter(network => 
    filterType === 'all' || network.type === filterType
  );

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'testnet': return 'bg-blue-900/30 text-blue-300 border-blue-700';
      case 'mainnet': return 'bg-orange-900/30 text-orange-300 border-orange-700';
      case 'l2': return 'bg-purple-900/30 text-purple-300 border-purple-700';
      default: return 'bg-gray-900/30 text-gray-300 border-gray-700';
    }
  };

  return (
    <Card className="w-full bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Network className="w-5 h-5 text-blue-400" />
          Network Selection
        </CardTitle>
        <p className="text-sm text-gray-400 mt-1">
          Choose the blockchain network for benchmarking
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              filterType === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All Networks
          </button>
          <button
            onClick={() => setFilterType('testnet')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              filterType === 'testnet' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Testnets
          </button>
          <button
            onClick={() => setFilterType('l2')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              filterType === 'l2' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Layer 2
          </button>
          <button
            onClick={() => setFilterType('mainnet')}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              filterType === 'mainnet' 
                ? 'bg-orange-600 text-white' 
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Mainnet
          </button>
        </div>

        {/* Network Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredNetworks.map((network) => (
            <button
              key={network.id}
              onClick={() => onNetworkChange(network)}
              className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-lg ${
                selectedNetwork.id === network.id
                  ? 'border-blue-500 bg-blue-900/20 shadow-blue-500/20'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-white">{network.name}</h3>
                  <p className="text-xs text-gray-400 mt-1">{network.description}</p>
                </div>
                <Badge className={getTypeColor(network.type)}>
                  {network.type}
                </Badge>
              </div>
              
              <div className="mt-3 space-y-1">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span>Chain ID: {network.chainId}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="w-3 h-3 text-blue-400" />
                  <span>Block Time: {network.blockTime}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <DollarSign className="w-3 h-3 text-green-400" />
                  <span>Gas: {network.gasEstimate}</span>
                </div>
              </div>

              {selectedNetwork.id === network.id && (
                <div className="mt-3 pt-3 border-t border-blue-700">
                  <Badge className="bg-blue-600 text-white text-xs">
                    ✓ Selected
                  </Badge>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Selected Network Info */}
        <div className="mt-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <Label className="text-sm text-gray-300 mb-2">Current Network</Label>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">{selectedNetwork.name}</p>
              <p className="text-xs text-gray-400 mt-1">Chain ID: {selectedNetwork.chainId}</p>
            </div>
            <Badge className={getTypeColor(selectedNetwork.type)}>
              {selectedNetwork.type}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
