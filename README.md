# 🚀 NetShift

**Multi-Party Crypto Payment Netting Platform**

[![Live Demo](https://img.shields.io/badge/Demo-Live-success)](https://netshift.vercel.app)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

> Transform complex multi-party payment obligations into optimized settlements. Reduce 17 payments to 4 using graph-based netting algorithms with cross-chain execution via SideShift.

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | https://netshift.vercel.app |
| **Backend API** | https://netshift.onrender.com |
| **GitHub** | https://github.com/Mr-Ben-dev/Netshift |

---

## 📖 What is NetShift?

NetShift is a **multi-party payment netting platform** that solves the problem of complex debt relationships between multiple parties.

### The Problem

When multiple parties owe each other money, the traditional approach requires many individual payments:

```
Without NetShift (17 payments):
├── Alice → Bob: $100
├── Bob → Charlie: $80  
├── Charlie → Dave: $60
├── Dave → Alice: $40
├── Alice → Charlie: $30
├── Bob → Dave: $25
├── Charlie → Alice: $20
├── Dave → Bob: $15
├── Alice → Dave: $50
├── Bob → Alice: $35
├── Charlie → Bob: $45
├── Dave → Charlie: $55
├── Alice → Bob: $70 (another)
├── Bob → Charlie: $40 (another)
├── Charlie → Dave: $30 (another)
├── Dave → Alice: $25 (another)
└── Alice → Charlie: $60 (another)

Total: 17 separate transactions
Fees: 17 × gas fees
Time: Hours of coordination
```

### The Solution

NetShift uses **graph-based netting algorithms** to find optimal settlement paths:

```
With NetShift (4 payments):
├── Alice → Charlie: $85 (net)
├── Bob → Dave: $45 (net)
├── Charlie → Bob: $30 (net)
└── Dave → Alice: $20 (net)

Total: 4 transactions (76% reduction!)
Fees: Only 4 × gas fees
Time: Minutes with automation
```

---

## ✨ Key Features

### Core Features

| Feature | Description |
|---------|-------------|
| **Multi-Party Netting** | Graph algorithm detects circular debts and computes optimal net payments |
| **Cross-Chain Settlement** | Support for 200+ crypto assets across 40+ blockchain networks |
| **CSV Import** | Bulk upload obligations from spreadsheets |
| **Real-Time Tracking** | Live status updates with 5-second polling |
| **QR Code Deposits** | Mobile-friendly deposit addresses |
| **Fixed-Rate Quotes** | Lock in exchange rates for 15 minutes with zero slippage |

### Supported Assets

NetShift supports **200+ cryptocurrencies** including:

- **Major**: BTC, ETH, USDT, USDC, BNB, SOL, ADA, DOT, XRP
- **Networks**: Ethereum, Bitcoin, Solana, Polygon, Arbitrum, Optimism, Base, BSC, Avalanche, and 30+ more
- **Stablecoins**: USDT, USDC, DAI, BUSD across multiple chains

---

## 🔧 How It Works

### Step 1: Import Obligations

Upload a CSV file or manually enter payment obligations:

```csv
from,to,amount,token,network,receiveAddress,refundAddress
Alice,Bob,100,usdc,base,0x1234...,0xABC...
Bob,Charlie,80,eth,ethereum,0x5678...,0xDEF...
Charlie,Alice,60,usdc,polygon,0x9ABC...,0x123...
```

### Step 2: Compute Netting

The algorithm analyzes the payment graph and:
1. Detects all circular debt relationships
2. Cancels out offsetting obligations
3. Computes minimum required net transfers
4. Calculates optimal settlement amounts

### Step 3: Execute Settlement

For each required payment:
1. NetShift creates a SideShift order
2. Sender receives deposit address + QR code
3. Sender deposits crypto to the address
4. SideShift converts and delivers to recipient
5. Real-time status tracking until complete

### Step 4: Track & Verify

- **Live Status**: Pending → Deposited → Confirming → Settled
- **On-Chain Proof**: Transaction hashes for verification
- **Settlement ID**: Unique reference for the entire batch

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                  │
│                   React + TypeScript + Vite                      │
│  ┌──────────┬──────────┬──────────┬──────────┬──────────┐      │
│  │  Import  │ Preview  │ Execute  │  Track   │Analytics │      │
│  │   Page   │   Page   │   Page   │   Page   │   Page   │      │
│  └────┬─────┴────┬─────┴────┬─────┴────┬─────┴────┬─────┘      │
│       └──────────┴──────────┴──────────┴──────────┘             │
│                            │                                     │
│                   Axios + React Query                            │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌────────────────────────────────────────────────────────────────┐
│                        BACKEND                                  │
│                   Node.js + Express                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    API Routes                            │   │
│  │  /api/coins     - List supported assets                  │   │
│  │  /api/pairs     - Get exchange pairs                     │   │
│  │  /api/quote     - Get fixed-rate quote                   │   │
│  │  /api/shift     - Create SideShift order                 │   │
│  │  /api/status    - Check order status                     │   │
│  │  /api/settlements - CRUD settlements                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                            │                                    │
│  ┌─────────────┐   ┌───────┴───────┐   ┌─────────────┐        │
│  │  Netting    │   │   MongoDB     │   │  SideShift  │        │
│  │  Algorithm  │   │    Atlas      │   │    API v2   │        │
│  └─────────────┘   └───────────────┘   └─────────────┘        │
└────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| TailwindCSS | Styling |
| Framer Motion | Animations |
| React Query | Data Fetching |
| React Router | Navigation |
| Radix UI | Components |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express | Web Framework |
| MongoDB Atlas | Database |
| Axios | HTTP Client |
| LRU Cache | Performance |

### External Services
| Service | Purpose |
|---------|---------|
| SideShift.ai | Cross-chain swaps |
| Vercel | Frontend hosting |
| Render | Backend hosting |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (free tier works)
- SideShift affiliate ID (optional)

### 1. Clone Repository

```bash
git clone https://github.com/Mr-Ben-dev/Netshift.git
cd Netshift
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/netshift
SIDESHIFT_AFFILIATE_ID=your_affiliate_id
NODE_ENV=development
```

Start the server:
```bash
npm run dev
```

Backend runs at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd web
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000
```

Start the dev server:
```bash
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## 📡 API Reference

### Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://netshift.onrender.com`

### Endpoints

#### Get Supported Coins
```http
GET /api/coins
```
Returns list of 200+ supported cryptocurrencies.

#### Get Trading Pair
```http
GET /api/pair?depositCoin=usdc&depositNetwork=base&settleCoin=eth&settleNetwork=ethereum&amount=100
```
Returns exchange rate and min/max amounts.

#### Create Shift Order
```http
POST /api/shift
Content-Type: application/json

{
  "depositCoin": "usdc",
  "depositNetwork": "base", 
  "settleCoin": "eth",
  "settleNetwork": "ethereum",
  "settleAddress": "0x...",
  "refundAddress": "0x...",
  "depositAmount": "100"
}
```
Returns deposit address, QR code, and shift ID.

#### Check Shift Status
```http
GET /api/shift/:shiftId
```
Returns current status: `pending`, `deposited`, `confirming`, `settled`, `failed`.

#### Create Settlement
```http
POST /api/settlements
Content-Type: application/json

{
  "obligations": [
    {
      "from": "Alice",
      "to": "Bob", 
      "amount": 100,
      "token": "usdc",
      "network": "base",
      "receiveAddress": "0x...",
      "refundAddress": "0x..."
    }
  ]
}
```
Creates settlement and computes netting.

#### Get Settlement
```http
GET /api/settlements/:id
```
Returns settlement details with netting results.

---

## 📁 Project Structure

```
NetShift/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express server entry
│   │   ├── api/
│   │   │   ├── routes.js      # API route definitions
│   │   │   └── sideshift.v2.js # SideShift API client
│   │   ├── database/
│   │   │   ├── models.js      # MongoDB schemas
│   │   │   └── queries.js     # Database operations
│   │   ├── netting/
│   │   │   ├── algorithm.js   # Graph netting logic
│   │   │   └── optimizer.js   # Payment optimization
│   │   └── utils/
│   │       ├── validation.js  # Input validation
│   │       └── logger.js      # Logging utility
│   └── package.json
│
├── web/
│   ├── src/
│   │   ├── main.tsx           # React entry point
│   │   ├── App.tsx            # Root component
│   │   ├── components/
│   │   │   ├── GraphVisualization.tsx  # Animated netting viz
│   │   │   ├── AssetSelect.tsx         # Coin selector
│   │   │   ├── OrderCard.tsx           # Shift status card
│   │   │   └── layout/
│   │   │       ├── Navbar.tsx
│   │   │       └── Footer.tsx
│   │   ├── pages/
│   │   │   ├── Landing.tsx    # Home page
│   │   │   ├── Import.tsx     # CSV upload
│   │   │   ├── Preview.tsx    # Review obligations
│   │   │   ├── Settlement.tsx # Execute & track
│   │   │   ├── Analytics.tsx  # Stats dashboard
│   │   │   └── HowItWorks.tsx # Documentation
│   │   ├── services/
│   │   │   └── api.ts         # API client
│   │   └── hooks/
│   │       └── useApi.ts      # React Query hooks
│   ├── public/
│   │   └── logo.png
│   └── package.json
│
├── test-csvs/                  # Sample CSV files
│   ├── A-simple-cycle.csv
│   ├── B-partial-cycle.csv
│   └── C-cross-chain.csv
│
└── README.md
```

---

## 🧮 Netting Algorithm

The core algorithm uses graph theory to minimize payments:

### Input
```javascript
obligations = [
  { from: "A", to: "B", amount: 100 },
  { from: "B", to: "C", amount: 80 },
  { from: "C", to: "A", amount: 60 },
]
```

### Process
1. **Build Graph**: Create directed graph with parties as nodes
2. **Compute Net Balances**: Sum inflows and outflows per party
3. **Detect Cycles**: Find circular debt relationships
4. **Cancel Cycles**: Remove offsetting obligations
5. **Minimize Transfers**: Compute minimum spanning payment tree

### Output
```javascript
netPayments = [
  { from: "A", to: "B", amount: 40 },  // 100 - 60 = 40 net
  { from: "B", to: "C", amount: 20 },  // 80 - 60 = 20 net
]
// Reduced from 3 payments to 2 (33% reduction)
// In complex cases, reduction can be 70-90%
```

---

## 🔐 Security

- **Non-Custodial**: NetShift never holds user funds
- **No Private Keys**: Users control their own wallets
- **Backend-Only API Calls**: SideShift API credentials stay on server
- **HTTPS Everywhere**: All communications encrypted
- **Input Validation**: All user inputs sanitized

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

---

## 🔗 Links

- **Live App**: https://netshift.vercel.app
- **API**: https://netshift.onrender.com
- **GitHub**: https://github.com/Mr-Ben-dev/Netshift
- **SideShift**: https://sideshift.ai

---

<div align="center">

**NetShift** - Simplify Multi-Party Settlements

</div>
