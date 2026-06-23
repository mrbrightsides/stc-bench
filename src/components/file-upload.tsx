'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle, Trash2, Database, TrendingUp, X } from 'lucide-react';
import type { BenchmarkResult } from '@/types/benchmark';
import { DataExporter } from '@/lib/data-export';

interface FileUploadProps {
  onDataLoaded: (data: BenchmarkResult) => void;
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
  detectedType?: 'runs' | 'transactions' | 'full';
}

export function FileUpload({ onDataLoaded }: FileUploadProps): JSX.Element {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [uploadedData, setUploadedData] = useState<BenchmarkResult | null>(null);
  const [fileInfos, setFileInfos] = useState<FileInfo[]>([]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const detectFileType = (data: BenchmarkResult): 'runs' | 'transactions' | 'full' => {
    if (data.runs.length > 0 && data.transactions.length > 0) return 'full';
    if (data.runs.length > 0) return 'runs';
    return 'transactions';
  };

  const handleFiles = useCallback(async (files: FileList | null): Promise<void> => {
    if (!files || files.length === 0) return;

    // Limit to 2 files maximum
    const filesToProcess = Array.from(files).slice(0, 2);

    setLoading(true);
    setError('');
    setSuccess('');
    setLoadingProgress(0);

    const newFileInfos: FileInfo[] = filesToProcess.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type || 'unknown'
    }));
    setFileInfos(newFileInfos);

    try {
      // Simulate loading progress
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 20;
        });
      }, 100);

      // Parse all files
      const parsedResults: BenchmarkResult[] = [];

      for (const file of filesToProcess) {
        const text = await file.text();
        let data: BenchmarkResult;

        if (file.name.endsWith('.json')) {
          data = DataExporter.parseUploadedJson(text);
        } else if (file.name.endsWith('.ndjson')) {
          data = DataExporter.parseNdjson(text);
        } else if (file.name.endsWith('.csv')) {
          data = DataExporter.parseCsv(text);
        } else {
          throw new Error('Unsupported file type. Please upload JSON, NDJSON, or CSV files.');
        }

        parsedResults.push(data);
      }

      // Update file infos with detected types
      const updatedFileInfos = newFileInfos.map((info, index) => ({
        ...info,
        detectedType: detectFileType(parsedResults[index])
      }));
      setFileInfos(updatedFileInfos);

      // Combine results if multiple files
      const combinedData = parsedResults.length > 1 
        ? DataExporter.combineResults(parsedResults)
        : parsedResults[0];

      clearInterval(progressInterval);
      setLoadingProgress(100);

      setUploadedData(combinedData);
      
      // Generate smart success message
      if (parsedResults.length === 2) {
        const hasRuns = parsedResults.some(r => r.runs.length > 0);
        const hasTx = parsedResults.some(r => r.transactions.length > 0);
        
        if (hasRuns && hasTx) {
          setSuccess(`🎉 Successfully combined 2 files! Loaded ${combinedData.runs.length} runs and ${combinedData.transactions.length.toLocaleString()} transactions. Complete data with metrics + transaction details!`);
        } else {
          setSuccess(`Successfully loaded ${combinedData.runs.length} runs and ${combinedData.transactions.length.toLocaleString()} transactions from ${parsedResults.length} files.`);
        }
      } else {
        setSuccess(`Successfully loaded ${combinedData.runs.length} runs and ${combinedData.transactions.length.toLocaleString()} transactions from ${filesToProcess[0].name}`);
      }
      
      onDataLoaded(combinedData);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to parse file(s)');
      setUploadedData(null);
      setFileInfos([]);
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingProgress(0), 1000);
    }
  }, [onDataLoaded]);

  const handleDrag = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    handleFiles(e.target.files);
  }, [handleFiles]);

  const clearUploadedData = (): void => {
    setUploadedData(null);
    setSuccess('');
    setError('');
    setFileInfos([]);
  };

  const getFileTypeBadgeColor = (type?: 'runs' | 'transactions' | 'full'): string => {
    switch (type) {
      case 'runs': return 'bg-blue-500/20 border-blue-500 text-blue-300';
      case 'transactions': return 'bg-green-500/20 border-green-500 text-green-300';
      case 'full': return 'bg-purple-500/20 border-purple-500 text-purple-300';
      default: return 'bg-gray-500/20 border-gray-500 text-gray-300';
    }
  };

  const getFileTypeLabel = (type?: 'runs' | 'transactions' | 'full'): string => {
    switch (type) {
      case 'runs': return 'Runs CSV';
      case 'transactions': return 'Transactions CSV';
      case 'full': return 'Complete Data';
      default: return 'Processing...';
    }
  };

  return (
    <Card className="w-full bg-gray-900 border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Database className="w-5 h-5 text-purple-400" />
          Upload & Analyze Previous Results
        </CardTitle>
        <p className="text-sm text-gray-400 mt-1">
          Upload JSON/NDJSON/CSV files from previous benchmark runs • <strong className="text-purple-300">Upload 2 files at once</strong> (e.g., runs.csv + transactions.csv) for complete data!
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            dragActive
              ? 'border-blue-400 bg-blue-900/20 scale-[1.02]'
              : loading
              ? 'border-purple-400 bg-purple-900/10'
              : 'border-gray-600 hover:border-gray-500 hover:bg-gray-800/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".json,.ndjson,.csv"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
            multiple
          />
          
          <div className="space-y-4">
            <FileText className={`w-16 h-16 mx-auto transition-all duration-300 ${
              loading ? 'animate-bounce text-purple-400' : 
              dragActive ? 'text-blue-400 scale-110' : 'text-gray-400'
            }`} />
            
            <div>
              <h3 className={`text-lg font-medium transition-colors ${
                loading ? 'text-purple-300' :
                dragActive ? 'text-blue-300' : 'text-white'
              }`}>
                {loading ? 'Processing benchmark data...' : 
                 dragActive ? 'Drop your files here!' :
                 'Upload Previous Benchmark Results'}
              </h3>
              <p className={`text-sm mt-2 transition-colors ${
                loading ? 'text-purple-200' :
                dragActive ? 'text-blue-200' : 'text-gray-400'
              }`}>
                {loading ? 'Parsing and validating benchmark data' :
                 'Drop up to 2 files here or click to browse • Supports JSON, NDJSON, and CSV formats'}
              </p>
              {!loading && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <Badge variant="outline" className="bg-purple-500/20 border-purple-500 text-purple-300 text-xs">
                    💡 Pro Tip
                  </Badge>
                  <span className="text-xs text-gray-400">
                    Upload runs.csv + transactions.csv together for complete charts!
                  </span>
                </div>
              )}
            </div>

            {loading && (
              <div className="space-y-2">
                <Progress value={loadingProgress} className="w-full bg-gray-800" />
                {fileInfos.length > 0 && (
                  <div className="text-xs text-purple-300 space-y-1">
                    {fileInfos.map((info, index) => (
                      <div key={index} className="flex items-center justify-center gap-2">
                        <span>📁 {info.name} ({formatFileSize(info.size)})</span>
                        {info.detectedType && (
                          <Badge variant="outline" className={`text-xs ${getFileTypeBadgeColor(info.detectedType)}`}>
                            {getFileTypeLabel(info.detectedType)}
                          </Badge>
                        )}
                      </div>
                    ))}
                    <p>🔄 {loadingProgress < 100 ? `Loading... ${Math.round(loadingProgress)}%` : 'Finalizing...'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-900/20 border-red-800 text-red-200">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="bg-green-900/20 border-green-800 text-green-200">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {uploadedData && (
          <div className="border border-gray-700 rounded-lg p-6 bg-gray-800/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Loaded Data Analysis
              </h4>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearUploadedData}
                className="hover:bg-gray-700 text-gray-400 hover:text-white"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
            
            {/* File info badges */}
            {fileInfos.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {fileInfos.map((info, index) => (
                  <div key={index} className="flex items-center gap-2 bg-gray-700/50 rounded-lg px-3 py-2 border border-gray-600">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-300">{info.name}</span>
                    {info.detectedType && (
                      <Badge variant="outline" className={`text-xs ${getFileTypeBadgeColor(info.detectedType)}`}>
                        {getFileTypeLabel(info.detectedType)}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="bg-blue-900/20 border border-blue-800 p-3 rounded-lg">
                <span className="text-xs text-blue-200 block">Benchmark Runs</span>
                <div className="text-xl font-bold text-blue-400">{uploadedData.runs.length}</div>
              </div>
              <div className="bg-green-900/20 border border-green-800 p-3 rounded-lg">
                <span className="text-xs text-green-200 block">Total Transactions</span>
                <div className="text-xl font-bold text-green-400">{uploadedData.transactions.length.toLocaleString()}</div>
              </div>
              <div className="bg-purple-900/20 border border-purple-800 p-3 rounded-lg">
                <span className="text-xs text-purple-200 block">Success Rate</span>
                <div className="text-xl font-bold text-purple-400">{uploadedData.summary.overall_success_rate}%</div>
              </div>
              <div className="bg-orange-900/20 border border-orange-800 p-3 rounded-lg">
                <span className="text-xs text-orange-200 block">Avg TPS</span>
                <div className="text-xl font-bold text-orange-400">{uploadedData.summary.avg_tps}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Networks Used:</span>
                <div className="flex gap-1 flex-wrap">
                  {uploadedData.summary.networks.map((network) => (
                    <Badge key={network} variant="outline" className="border-gray-600 text-gray-300 text-xs">
                      {network}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {fileInfos.length > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Files Loaded:</span>
                  <div className="text-sm text-gray-300">
                    {fileInfos.length} file{fileInfos.length > 1 ? 's' : ''} • {fileInfos.reduce((sum, info) => sum + info.size, 0) / 1024 > 1024 ? `${(fileInfos.reduce((sum, info) => sum + info.size, 0) / (1024 * 1024)).toFixed(2)} MB` : `${(fileInfos.reduce((sum, info) => sum + info.size, 0) / 1024).toFixed(2)} KB`}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
              <p className="text-sm text-gray-300">
                ✅ Data successfully loaded and validated • {fileInfos.length > 1 ? '🔗 Files intelligently combined' : 'Single file processed'} • View detailed analysis in the results section below
              </p>
            </div>
          </div>
        )}

        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
          <h4 className="text-sm font-medium text-gray-200 mb-3">📋 Supported Formats & Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>JSON files from STC Bench exports</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>NDJSON streaming benchmark data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                <span>CSV files (runs or transactions)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span>Multi-file upload (max 2 files)</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                <span>STC Analytics format compatibility</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span>Automatic data validation & parsing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                <span>Smart CSV type detection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                <span>Intelligent data combining</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
