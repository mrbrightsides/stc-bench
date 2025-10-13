# STC Bench ⚡

**Smart Contract Testing & Benchmarking Platform**

Platform profesional untuk benchmarking dan analisis performa smart contract Ethereum dengan visualisasi real-time, AI-powered insights, dan persistent storage menggunakan SpacetimeDB.
Tujuannya: mengeksekusi skenario uji, mencatat detail transaksi, lalu men-translate hasilnya ke format standar (CSV/NDJSON) yang siap divisualisasikan di STC Analytics.

[![Next.js](https://img.shields.io/badge/Next.js-15.3-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.1-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![SpacetimeDB](https://img.shields.io/badge/SpacetimeDB-1.5-purple)](https://spacetimedb.com/)
[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-purple)](https://ethereum.org/)

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi](#%EF%B8%8F-teknologi-stack)
- [Quick Start](#-quick-start)
- [Cara Penggunaan](#-cara-penggunaan)
- [Arsitektur](#-arsitektur)
- [Format Data](#-format-data-stc-analytics)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## ✨ Fitur Utama

### 1. 🎯 **Benchmarking Performa**
- **TPS (Transactions Per Second)**: Ukur throughput smart contract
- **Latency Analysis**: P50 dan P95 percentiles untuk response time
- **Success Rate Tracking**: Monitor reliability dan failure rate
- **Concurrency Testing**: Test parallel transaction execution
- **Load Testing**: Simulasi berbagai skenario beban

### 2. 📊 **Advanced Visualizations**
- **TPS Performance Chart**: Line chart untuk tracking TPS over time
- **Gas Usage Bar Chart**: Analisis gas consumption per function
- **Latency Distribution**: Histogram untuk latency buckets
- **Transaction Timeline**: Area chart untuk transaction flow
- **Status Pie Chart**: Visualisasi success/failure distribution

### 3. 🧠 **Smart Analysis & AI Insights**
- **Performance Scoring**: 0-100 score untuk overall performance
- **Automated Insights**: AI-powered recommendations
- **Bottleneck Detection**: Identifikasi performance issues
- **Cost Analysis**: Gas usage dan ETH cost projections
- **Production Readiness**: Assessment untuk mainnet deployment

### 4. 💾 **Persistent Storage (SpacetimeDB)**
- **Real-time Sync**: Live updates across all connected clients
- **Historical Data**: Browse benchmark history dengan search & filter
- **Auto-save**: Results automatically saved after each run
- **Cross-session**: Data persists bahkan setelah browser close
- **Collaboration**: Team members can see same data real-time

### 5. 🔄 **Comparison Tools**
- **Side-by-Side Comparison**: Compare 2 benchmark runs
- **Delta Analysis**: Automatic calculation of performance deltas
- **Regression Detection**: Identify performance degradation
- **Visual Indicators**: Color-coded improvements/regressions
- **Smart Insights**: Contextual recommendations based on comparison

### 6. 🌐 **Multi-Network Support**
- **8 Supported Networks**:
  - Ethereum Sepolia (Testnet)
  - Goerli (Testnet)
  - Mumbai (Polygon Testnet)
  - Arbitrum Sepolia (L2 Testnet)
  - Optimism Sepolia (L2 Testnet)
  - Base Sepolia (L2 Testnet)
  - BSC Testnet
  - Ethereum Mainnet (Simulation Only)

### 7. 📤 **Multi-Format Export**
- **JSON**: Complete benchmark data dengan full structure
- **NDJSON**: Streaming format untuk big data processing
- **CSV (Runs)**: Spreadsheet-friendly format untuk run-level metrics
- **CSV (Transactions)**: Transaction-level data untuk detailed analysis
- **STC Analytics Compatible**: Industry-standard format

### 8. 🔒 **Cloud-Safe Security**
- **No Hardcoded Keys**: Zero private keys atau sensitive data
- **Simulation Mode**: Safe testing tanpa real funds
- **Production Ready**: Deployment-ready untuk Streamlit Cloud
- **Secure API**: Proper validation dan error handling

### 9. ⚡ **Real-time Monitoring**
- **Live TPS Tracking**: Monitor throughput in real-time
- **Progress Indicators**: Visual feedback dengan estimated completion
- **Success Rate Updates**: Live tracking of transaction success
- **Worker Status**: Monitor concurrent worker execution
- **Connection Status**: Visual indicators untuk database connection

---

## 🛠️ Teknologi Stack

### Frontend
- **Next.js 15.3**: React framework dengan server-side rendering
- **React 19.1**: Latest React dengan concurrent features
- **TypeScript 5.8**: Type-safe development
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **Recharts 2.15**: Data visualization library
- **Lucide React**: Beautiful icon library

### Backend & Data
- **SpacetimeDB 1.5**: Real-time database dengan WASM modules
- **Next.js API Routes**: Serverless API endpoints
- **Ethers.js 6.15**: Ethereum library untuk Web3 interactions

### Analytics & Insights
- **Custom Algorithms**: Performance scoring system
- **Smart Insights Engine**: AI-powered recommendation system
- **Data Export Utilities**: Multi-format export support

---

## 🚀 Quick Start

### Prerequisites

```bash
- Node.js 18+ 
- npm atau yarn
- Git
- SpacetimeDB CLI (optional, untuk local development)
```

### Installation

1. **Clone Repository**
```bash
git clone <repository-url>
cd stc-bench
```

2. **Install Dependencies**
```bash
npm install
# atau
yarn install
```

3. **Setup Environment Variables** (Optional)
```bash
cp .env.example .env.local

# Edit .env.local:
NEXT_PUBLIC_SPACETIME_URL=ws://localhost:3000  # SpacetimeDB URL
NEXT_PUBLIC_SPACETIME_MODULE=stc_bench        # Module name
```

4. **Run Development Server**
```bash
npm run dev
# atau
yarn dev
```

5. **Open Browser**
```
http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

---

## 📖 Cara Penggunaan

### 1. **Setup Contract**

#### A. Input Contract Address
- Paste alamat smart contract yang sudah di-deploy
- Contoh: `0x742d35Cc69AEBD3C9fa5D8e8e1d3b9678F0B7F6f`
- System akan validasi format address

#### B. Input ABI
- Paste ABI JSON array dari contract
- Bisa didapat dari:
  - Etherscan (Contract → Code → Contract ABI)
  - Hardhat compile output
  - Remix IDE
- Atau klik **"Load Sample ABI"** untuk testing

### 2. **Configure Scenario**

#### A. Pilih Template
- **Transfer Template**: ERC-20 token transfer testing
- **Mint Template**: NFT minting performance testing
- **Synthetic Template**: High-load stress testing

#### B. Edit YAML Configuration
```yaml
name: "My Benchmark Test"
type: "transfer"                    # transfer | mint | synthetic
contract_address: "0x..."
function_name: "transfer"           # Function to benchmark
concurrency: 5                      # Parallel workers
tx_per_user: 10                     # Transactions per worker
duration_seconds: 60                # Max duration
gas_limit: 65000                    # Gas limit per tx
gas_price_gwei: 20                  # Gas price
parameters:
  to: "0x742d35Cc69AEBD3C9fa5D8e8e1d3b9678F0B7F6f"
  value: "1000000000000000000"      # 1 ETH in wei
```

#### C. Validate & Preview
- System auto-validates YAML syntax
- Preview tab shows:
  - Estimated total transactions
  - Performance projections
  - Gas cost estimates
  - Load level analysis

### 3. **Run Benchmark**

1. Klik **"Run Benchmark"** button
2. Monitor real-time dashboard:
   - Live TPS tracking
   - Success rate updates
   - Latency metrics
   - Progress bar dengan estimated completion
3. Wait for completion (atau cancel jika needed)

### 4. **Analyze Results**

#### A. Smart Analysis Tab 🧠
- **Performance Score**: Overall score 0-100
  - Throughput Score
  - Reliability Score
  - Efficiency Score
  - Latency Score
- **Actionable Insights**: AI-powered recommendations
  - High/Medium/Low impact categorization
  - Specific optimization suggestions
  - Production readiness assessment

#### B. Charts Tab 📊
- **TPS Performance**: Line chart showing throughput over time
- **Gas Usage**: Bar chart per function
- **Latency Distribution**: Histogram of response times
- **Transaction Timeline**: Area chart showing tx flow
- **Status Distribution**: Pie chart of success/failure

#### C. Dashboard Tab 📈
- Summary metrics cards
- Gas analytics
- Performance metrics
- Network information

#### D. Runs Tab 🏃
- Table of all benchmark runs
- Sortable columns
- Filter by network
- Select run to view transactions

#### E. TX Tab 📋
- Detailed transaction list
- Search by hash atau function
- Filter by status
- Pagination support
- Etherscan links untuk each transaction

### 5. **Export Data**

Klik download buttons untuk export:
- **JSON**: Complete data structure
- **NDJSON**: Streaming format
- **CSV (Runs)**: Run-level metrics
- **CSV (Transactions)**: Transaction-level data

Format CSV mengikuti **STC Analytics standard**.

### 6. **Browse History**

#### History Tab
- Search scenarios, functions, contracts
- Filter by network
- Sort by timestamp, TPS, success rate
- View historical run details
- Delete unwanted runs

### 7. **Compare Runs**

#### Comparison Tab
1. Select 2 runs to compare
2. View side-by-side metrics:
   - TPS Average & Peak
   - P50 & P95 Latency
   - Success Rate
   - Concurrency & TX counts
3. See delta calculations:
   - Absolute differences
   - Percentage changes
   - Color-coded improvements/regressions
4. Read smart insights:
   - Performance improved/regressed
   - Latency changes
   - Recommendations

### 8. **Select Network**

#### Networks Tab
- Browse 8 supported networks
- Filter by type (Testnet/L2/Mainnet)
- View network details:
  - Chain ID
  - Block time
  - Gas estimates
  - RPC URLs
- Select network untuk benchmarking

---

## 🏗 Arsitektur

### High-Level Architecture

```
┌─────────────────────────────────────────────────────┐
│                   STC Bench UI                       │
│  (Next.js 15 + React 19 + TypeScript + Tailwind)   │
└──────────────┬──────────────────────────────────────┘
               │
               ├─── 📊 Components Layer
               │    ├── Contract Input
               │    ├── Scenario Editor
               │    ├── Real-time Monitor
               │    ├── Results Dashboard
               │    ├── Performance Charts
               │    ├── Smart Insights
               │    ├── History View
               │    ├── Comparison View
               │    └── Network Selector
               │
               ├─── 🔄 State Management
               │    ├── React useState/useEffect
               │    ├── SpacetimeDB Subscriptions
               │    └── Real-time Updates
               │
               ├─── 🌐 API Layer
               │    ├── POST /api/benchmark/run
               │    └── Benchmark Runner Service
               │
               ├─── 💾 Data Persistence
               │    ├── SpacetimeDB Tables
               │    │   ├── benchmark_run
               │    │   └── benchmark_transaction
               │    └── SpacetimeDB Reducers
               │        ├── saveBenchmarkRun
               │        ├── saveBenchmarkTransaction
               │        ├── deleteRun
               │        └── getRunsByNetwork
               │
               └─── 📈 Analytics Engine
                    ├── Performance Scoring
                    ├── Insight Generation
                    ├── Delta Calculations
                    └── Data Export Utilities
```

### Data Flow

```
User Input → Contract + Scenario Configuration
     ↓
API Request → POST /api/benchmark/run
     ↓
Benchmark Runner → Execute Synthetic/Web3 Workers
     ↓
Results Generation → Run + Transactions
     ↓
SpacetimeDB Storage → Persistent Database
     ↓
Real-time Subscription → Live Updates to UI
     ↓
Analysis Engine → Smart Insights + Charts
     ↓
Export → JSON/NDJSON/CSV Downloads
```

### Component Hierarchy

```
page.tsx (Main Container)
├── Tabs Navigation
│   ├── Benchmark Tab
│   │   ├── ContractInput
│   │   ├── ScenarioEditor
│   │   ├── Run Button
│   │   ├── RealtimeMonitor
│   │   ├── FileUpload
│   │   └── BenchmarkResults
│   │       ├── SmartInsights
│   │       ├── PerformanceCharts
│   │       ├── Dashboard (Summary)
│   │       ├── Runs Table
│   │       └── Transactions Table
│   ├── History Tab
│   │   └── HistoryView
│   ├── Comparison Tab
│   │   └── ComparisonView
│   ├── Networks Tab
│   │   └── NetworkSelector
│   └── Tentang App Tab
│       └── AboutApp
└── Footer
```

---

## 📊 Format Data (STC Analytics)

### Runs CSV Format
```csv
run_id,timestamp,network,scenario,contract,function_name,concurrency,tx_per_user,tps_avg,tps_peak,p50_ms,p95_ms,success_rate
abc-123,2024-01-15T10:30:00Z,Sepolia,"Transfer Test",0x742d...,transfer,5,10,25.5,32.1,1250,2800,98.5
```

### Transactions CSV Format
```csv
run_id,tx_hash,submitted_at,mined_at,latency_ms,status,gas_used,gas_price_wei,block_number,function_name
abc-123,0x5a3b...,2024-01-15T10:30:01Z,2024-01-15T10:30:03Z,1250,success,65000,20000000000,18500000,transfer
```

### JSON Format
```json
{
  "runs": [
    {
      "run_id": "abc-123",
      "timestamp": "2024-01-15T10:30:00Z",
      "network": "Sepolia",
      "scenario": "Transfer Test",
      "contract": "0x742d35Cc69AEBD3C9fa5D8e8e1d3b9678F0B7F6f",
      "function_name": "transfer",
      "concurrency": 5,
      "tx_per_user": 10,
      "tps_avg": 25.5,
      "tps_peak": 32.1,
      "p50_ms": 1250,
      "p95_ms": 2800,
      "success_rate": 98.5,
      "total_transactions": 50,
      "total_duration_ms": 1960
    }
  ],
  "transactions": [
    {
      "run_id": "abc-123",
      "tx_hash": "0x5a3b...",
      "submitted_at": "2024-01-15T10:30:01Z",
      "mined_at": "2024-01-15T10:30:03Z",
      "latency_ms": 1250,
      "status": "success",
      "gas_used": 65000,
      "gas_price_wei": "20000000000",
      "block_number": 18500000,
      "function_name": "transfer"
    }
  ],
  "summary": {
    "total_runs": 1,
    "total_transactions": 50,
    "overall_success_rate": 98.5,
    "avg_tps": 25.5,
    "networks": ["Sepolia"]
  }
}
```

### NDJSON Format
```ndjson
{"type":"bench_run","run_id":"abc-123","timestamp":"2024-01-15T10:30:00Z",...}
{"type":"bench_tx","run_id":"abc-123","tx_hash":"0x5a3b...",...}
```

### Format Output

bench_runs.csv
| run\_id | timestamp | network | scenario | contract | function\_name | concurrency | tx\_per\_user | tps\_avg | tps\_peak | p50\_ms | p95\_ms | success\_rate |
| ------- | --------- | ------- | -------- | -------- | -------------- | ----------- | ------------- | -------- | --------- | ------- | ------- | ------------- |

bench_tx.csv
| run\_id | tx\_hash | submitted\_at | mined\_at | latency\_ms | status | gas\_used | gas\_price\_wei | block\_number | function\_name |
| ------- | -------- | ------------- | --------- | ----------- | ------ | --------- | --------------- | ------------- | -------------- |

---

## 🔌 API Reference

### POST /api/benchmark/run

Execute a benchmark scenario.

**Request Body:**
```json
{
  "scenario": {
    "name": "Transfer Test",
    "type": "transfer",
    "contract_address": "0x...",
    "function_name": "transfer",
    "concurrency": 5,
    "tx_per_user": 10,
    "duration_seconds": 60,
    "gas_limit": 65000,
    "gas_price_gwei": 20,
    "parameters": {
      "to": "0x...",
      "value": "1000000000000000000"
    }
  },
  "contractAddress": "0x742d35Cc69AEBD3C9fa5D8e8e1d3b9678F0B7F6f",
  "contractAbi": "[{\"inputs\":[...],\"name\":\"transfer\",...}]"
}
```

**Response (200 OK):**
```json
{
  "runs": [...],
  "transactions": [...],
  "summary": {...}
}
```

**Error Response (400/500):**
```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

### GET /api/benchmark/run

Get API information.

**Response (200 OK):**
```json
{
  "message": "STC Bench API - Use POST to run benchmarks",
  "version": "1.0.0",
  "supported_formats": ["json", "ndjson"],
  "supported_types": ["transfer", "mint", "synthetic"],
  "networks": ["Sepolia"]
}
```

---

## 🚢 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your repository
- Configure environment variables (if needed):
  ```
  NEXT_PUBLIC_SPACETIME_URL=<your-spacetime-url>
  NEXT_PUBLIC_SPACETIME_MODULE=stc_bench
  ```
- Click Deploy

3. **Access Your App**
- Your app will be available at: `https://your-app.vercel.app`

### Manual Deployment

```bash
# Build production bundle
npm run build

# Start production server
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t stc-bench .
docker run -p 3000:3000 stc-bench
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. SpacetimeDB Connection Failed
**Problem**: "Failed to connect to SpacetimeDB"

**Solutions**:
- Check SpacetimeDB server is running
- Verify `NEXT_PUBLIC_SPACETIME_URL` environment variable
- Ensure module name is correct
- App will still work in "local mode" without SpacetimeDB

#### 2. Build Errors
**Problem**: TypeScript compilation errors

**Solutions**:
```bash
# Clear cache
rm -rf .next node_modules
npm install
npm run build
```

#### 3. Chart Not Rendering
**Problem**: Charts showing blank

**Solutions**:
- Ensure benchmark has been run successfully
- Check browser console for errors
- Verify data format is correct
- Try refreshing the page

#### 4. Export Not Working
**Problem**: Download buttons not working

**Solutions**:
- Check browser allows downloads
- Verify benchmark data exists
- Check browser console for errors
- Try different export format

#### 5. Real-time Monitor Not Updating
**Problem**: Monitor shows stale data

**Solutions**:
- Ensure benchmark is running
- Check browser tab is active
- Refresh the page
- Check network connection

### Debug Mode

Enable debug logging:
```bash
# In browser console
localStorage.setItem('debug', 'stc-bench:*')
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Reporting Issues

1. Check existing issues first
2. Provide detailed description
3. Include steps to reproduce
4. Add screenshots if relevant
5. Mention your environment (OS, browser, etc.)

### Pull Requests

1. Fork the repository
2. Create feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. Make your changes
4. Test thoroughly
5. Commit with clear message
   ```bash
   git commit -m "Add amazing feature"
   ```
6. Push to branch
   ```bash
   git push origin feature/amazing-feature
   ```
7. Open Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use existing code style
- Add comments for complex logic
- Test all new features
- Update documentation
- Keep commits atomic

---

## 📄 License

MIT License - feel free to use in your projects!

---

## 🙏 Acknowledgments

- **Next.js Team**: Amazing React framework
- **SpacetimeDB**: Revolutionary real-time database
- **shadcn/ui**: Beautiful component library
- **Recharts**: Powerful charting library
- **Ethereum Community**: Blockchain ecosystem

---

## 📞 Support

Need help? Reach out:

- 📧 Email: support@elpeef.com

---

## 🎯 Roadmap

### Coming Soon
- [ ] Real wallet integration (MetaMask)
- [ ] More network support (Avalanche, Fantom)
- [ ] Advanced filtering & search
- [ ] PDF report generation
- [ ] CI/CD integration (GitHub Actions)
- [ ] REST API for automation
- [ ] Team collaboration features
- [ ] Advanced chaos engineering tests

### Future Plans
- [ ] Machine learning predictions
- [ ] Contract optimization suggestions
- [ ] Cost optimization calculator
- [ ] Multi-contract scenarios
- [ ] Historical trend analysis
- [ ] Slack/Discord notifications
- [ ] Custom metric definitions

---

**Built with ❤️ for the Ethereum community**

*Benchmark smarter, deploy faster, optimize better.* 🚀
