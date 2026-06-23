'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  Target, 
  Users, 
  FileText, 
  BarChart3, 
  Shield, 
  Database, 
  Clock,
  CheckCircle,
  ArrowRight,
  Lightbulb,
  Cpu,
  Globe,
  Settings
} from 'lucide-react';

export function AboutApp(): JSX.Element {
  const features = [
    {
      icon: Target,
      title: 'Benchmarking Performa',
      description: 'Ukur kecepatan transaksi (TPS), latensi, dan throughput smart contract Anda'
    },
    {
      icon: BarChart3,
      title: 'Analisis Gas',
      description: 'Analisis mendalam penggunaan gas, biaya transaksi, dan optimasi efisiensi'
    },
    {
      icon: Clock,
      title: 'Monitor Real-time',
      description: 'Pantau progress benchmark secara langsung dengan visualisasi live data'
    },
    {
      icon: Database,
      title: 'Export Multi-format',
      description: 'Ekspor hasil dalam format JSON, NDJSON, CSV untuk analisis lanjutan'
    },
    {
      icon: Shield,
      title: 'Cloud-safe',
      description: 'Aman digunakan di cloud tanpa hardcode private key atau wallet'
    },
    {
      icon: Cpu,
      title: 'Load Testing',
      description: 'Test berbagai skenario beban untuk memastikan contract siap produksi'
    }
  ];

  const useCases = [
    {
      user: 'Developer Smart Contract',
      description: 'Optimize gas usage dan test performa sebelum deploy ke mainnet',
      badge: 'Primary'
    },
    {
      user: 'Blockchain Auditor', 
      description: 'Analisis performa dan keamanan smart contract untuk audit',
      badge: 'Secondary'
    },
    {
      user: 'DeFi Protocol Team',
      description: 'Load testing untuk memastikan protocol dapat handle traffic tinggi',
      badge: 'Primary'
    },
    {
      user: 'Research & Academia',
      description: 'Riset performa blockchain dan analisis efisiensi algoritma',
      badge: 'Secondary'
    }
  ];

  const steps = [
    {
      number: 1,
      title: 'Input Contract',
      description: 'Masukkan address contract Ethereum dan ABI (Application Binary Interface)',
      details: 'Pastikan contract sudah deploy di Sepolia testnet dan ABI dalam format JSON yang valid'
    },
    {
      number: 2, 
      title: 'Konfigurasi Scenario',
      description: 'Edit atau pilih template scenario YAML (Transfer, Mint, atau Custom)',
      details: 'Atur parameter seperti concurrency, transactions per user, dan function calls'
    },
    {
      number: 3,
      title: 'Run Benchmark',
      description: 'Jalankan benchmark dan monitor progress secara real-time',
      details: 'Sistem akan eksekusi multiple workers dan simulate real-world usage patterns'
    },
    {
      number: 4,
      title: 'Analisis Hasil',
      description: 'Review metrics, export data, atau upload hasil benchmark sebelumnya',
      details: 'Dapatkan insights tentang TPS, latency, success rate, dan gas optimization'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Intro Section */}
      <Card className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-blue-600/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Apa itu STC Bench?</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-lg leading-relaxed">
            <strong>STC Bench</strong> adalah platform benchmarking khusus untuk menguji performa smart contract Ethereum. 
            Aplikasi ini membantu developer, auditor, dan tim blockchain untuk menganalisis kecepatan, efisiensi gas, 
            dan reliability smart contract sebelum deploy ke production.
          </p>
          <p className="text-gray-400">
            Dengan antarmuka yang user-friendly, STC Bench memungkinkan Anda melakukan load testing yang komprehensif 
            tanpa perlu setup infrastructure yang rumit atau pengetahuan DevOps mendalam.
          </p>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary" className="bg-blue-900/30 border-blue-600 text-blue-300">
              Ethereum Sepolia
            </Badge>
            <Badge variant="secondary" className="bg-green-900/30 border-green-600 text-green-300">
              Load Testing
            </Badge>
            <Badge variant="secondary" className="bg-purple-900/30 border-purple-600 text-purple-300">
              Gas Optimization
            </Badge>
            <Badge variant="secondary" className="bg-orange-900/30 border-orange-600 text-orange-300">
              Real-time Analytics
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Purpose Section */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6 text-green-400" />
            <CardTitle className="text-xl text-white">Mengapa Perlu Benchmarking Smart Contract?</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Optimasi Gas Fees
              </h4>
              <p className="text-sm text-gray-400">
                Identifikasi fungsi yang boros gas dan optimize untuk mengurangi biaya transaksi di mainnet.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Load Testing
              </h4>
              <p className="text-sm text-gray-400">
                Pastikan contract dapat handle traffic tinggi tanpa bottleneck atau failure.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Performance Metrics
              </h4>
              <p className="text-sm text-gray-400">
                Dapatkan data akurat tentang TPS, latency, dan success rate untuk berbagai skenario.
              </p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                Risk Mitigation
              </h4>
              <p className="text-sm text-gray-400">
                Deteksi potential issues sebelum deploy ke mainnet dan hindari costly mistakes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-400" />
            <CardTitle className="text-xl text-white">Fitur Utama STC Bench</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="p-4 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-750 transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-600/20 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-semibold text-white text-sm">{feature.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step by Step Guide */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-400" />
            <CardTitle className="text-xl text-white">Cara Menggunakan STC Bench</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {step.number}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-white">{step.title}</h4>
                  <p className="text-gray-300">{step.description}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.details}</p>
                  {index < steps.length - 1 && (
                    <div className="flex items-center gap-2 mt-3 text-gray-500">
                      <ArrowRight className="w-4 h-4" />
                      <span className="text-xs">Lanjut ke step berikutnya</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Use Cases */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-green-400" />
            <CardTitle className="text-xl text-white">Siapa Yang Menggunakan STC Bench?</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useCases.map((useCase, index) => (
              <div key={index} className="p-4 bg-gray-800 border border-gray-600 rounded-lg hover:bg-gray-750 transition-all duration-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">{useCase.user}</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{useCase.description}</p>
                  </div>
                  <Badge variant="outline" className={
                    useCase.badge === 'Primary' 
                      ? 'bg-blue-900/30 border-blue-600 text-blue-300' 
                      : 'bg-gray-700/50 border-gray-600 text-gray-300'
                  }>
                    {useCase.badge === 'Primary' ? 'Core User' : 'Extended Use'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technical Specs */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-orange-400" />
            <CardTitle className="text-xl text-white">Spesifikasi Teknis</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-white">Blockchain Support</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Network</span>
                  <Badge variant="outline" className="bg-blue-900/30 border-blue-600 text-blue-300">
                    Ethereum Sepolia
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Protocol</span>
                  <span className="text-white">Web3 / ethers.js</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gas Tracking</span>
                  <Badge variant="outline" className="bg-green-900/30 border-green-600 text-green-300">
                    Real-time
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-white">Export Formats</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Data Format</span>
                  <span className="text-white">JSON, NDJSON, CSV</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Analytics</span>
                  <Badge variant="outline" className="bg-purple-900/30 border-purple-600 text-purple-300">
                    STC Compatible
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Storage</span>
                  <span className="text-white">Cloud-native</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips Section */}
      <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-600/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Lightbulb className="w-6 h-6 text-yellow-400" />
            <CardTitle className="text-xl text-white">Tips & Best Practices</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-white text-sm">🎯 Scenario Testing</h4>
              <p className="text-gray-400 text-sm">
                Mulai dengan load rendah, kemudian tingkatkan gradually untuk memahami breaking point contract Anda.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-white text-sm">⛽ Gas Optimization</h4>
              <p className="text-gray-400 text-sm">
                Focus pada fungsi dengan gas usage tinggi - optimasi 10% saja bisa save significant cost di mainnet.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-white text-sm">📊 Data Analysis</h4>
              <p className="text-gray-400 text-sm">
                Export hasil ke CSV untuk analisis mendalam dengan tools seperti Excel, Python, atau R.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-white text-sm">🔄 Iterative Testing</h4>
              <p className="text-gray-400 text-sm">
                Lakukan benchmark berkala setiap update contract untuk maintain optimal performance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Footer CTA */}
      <div className="text-center p-6 bg-gray-900 border border-gray-700 rounded-lg">
        <h3 className="text-lg font-semibold text-white mb-2">Siap Mulai Benchmarking?</h3>
        <p className="text-gray-400 mb-4">
          Kembali ke tab <strong>Benchmark</strong> dan mulai testing smart contract Anda sekarang!
        </p>
        <Badge variant="outline" className="bg-blue-900/30 border-blue-600 text-blue-300">
          Free & Open Source
        </Badge>
      </div>
    </div>
  );
}