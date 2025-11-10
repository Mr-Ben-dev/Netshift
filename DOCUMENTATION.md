# NetShift Documentation

**Multi-Party Settlement Optimization Platform**

---

## 🚀 Quick Links

- **Live Demo**: https://netshift.vercel.app
- **Video Demo**: https://youtu.be/461uzdU5o4w
- **GitHub**: https://github.com/Mr-Ben-dev/Netshift
- **Backend API**: https://netshift.onrender.com

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [User Flow](#user-flow)
5. [API Integration](#api-integration)
6. [Technology Stack](#technology-stack)
7. [Getting Started](#getting-started)
8. [API Documentation](#api-documentation)

---

## 🎯 Overview

NetShift reduces crypto payment complexity by 70-90% through intelligent netting algorithms combined with SideShift.ai's multi-asset swap capabilities.

### The Problem

In traditional multi-party payment scenarios:

- Alice owes Bob $100
- Bob owes Charlie $100
- Charlie owes Alice $100

This requires **3 separate blockchain transactions** with associated gas fees and time delays.

### The Solution

NetShift's netting algorithm detects this circular debt and **eliminates all 3 payments** - everyone's obligations are settled without any transfers needed.

For non-circular scenarios, we optimize by reducing payment count and using SideShift.ai for automatic cross-chain conversions (e.g., USDC → SOL, BTC → ETH).

---

## ✨ Features

### Core Functionality

- **CSV Import**: Upload bulk payment obligations with automatic parsing
- **Real-Time Validation**: Multi-chain address validation for 15+ networks
- **Netting Algorithm**: Graph-based cycle detection (O(V+E) complexity)
- **SideShift Integration**: Live quotes for 200+ assets across 40+ networks
- **Visual Analytics**: Interactive payment flow graphs before/after optimization
- **Order Tracking**: Real-time status updates with QR codes for deposits
- **Cross-Chain Support**: Automatic token conversions via SideShift API

### Production Features

- **Rate Limiting**: 300ms between SideShift API calls
- **Quote Management**: 15-minute fixed-rate locks
- **Error Handling**: Comprehensive retry logic with exponential backoff
- **Security**: CORS protection, Helmet headers, IP forwarding
- **Persistent Storage**: MongoDB Atlas with 0.0.0.0/0 network access
- **Cold Start Handling**: 60-second timeout for Render free tier

---

## 🏗️ Architecture

### Frontend (Vercel)

```
React 19 + TypeScript + Vite
├── Pages: Landing, Import, Settlement, Proof, Dashboard, Analytics
├── Components: 50+ shadcn/ui components + custom OrderCard, SettlementGraph
├── State: TanStack Query for data fetching
└── Styling: Tailwind CSS with custom animations
```

### Backend (Render)

```
Node.js + Express
├── API Routes: 15 endpoints for settlements, SideShift, analytics
├── Database: MongoDB Atlas (Mongoose ODM)
├── External APIs: SideShift v2 (8 endpoints integrated)
└── Utils: Address validation, QR generation, rate limiting
```

### Database Schema

```javascript
Settlement {
  settlementId: String (unique),
  status: String (draft, ready, executing, completed),
  obligations: [{ from, to, amount, token }],
  recipientPreferences: [{ party, receiveToken, receiveChain, receiveAddress }],
  nettingResult: {
    netPayments: [{ payer, recipient, payAmount, receiveAmount, receiveAddress }],
    rates: Object,
    savings: Object
  },
  sideshiftOrders: [{ orderId, depositAddress, qrCode, status, ... }]
}
```

---

## 📱 User Flow

### 1. Import (CSV or Manual)

- Upload CSV with columns: from, to, amount, token
- System validates addresses for target blockchains
- Set recipient preferences (preferred token/chain/address)

### 2. Compute

- Click "Compute Netting" button
- Algorithm runs DFS to detect cycles
- Fetches real-time SideShift rates
- Shows before/after payment visualization
- Displays percentage reduction (typically 70-90%)

### 3. Execute

- Click "Execute Settlement" button
- Creates SideShift fixed-rate orders (15-min expiry)
- Generates QR codes for deposit addresses
- Returns order IDs and deposit instructions

### 4. Track & Complete

- View Orders tab with live status polling (5s intervals)
- See QR codes, countdown timers, copy buttons
- Monitor: waiting → confirming → exchanging → completed
- After completion, view Proof page with settlement summary

---

## 🔌 API Integration

### SideShift.ai v2 Integration

We integrate **8 SideShift API endpoints**:

1. **GET /v2/coins**: List 200+ supported assets
2. **GET /v2/permissions**: Check user geo-restrictions
3. **GET /v2/pair/:from/:to**: Get min/max amounts and rates
4. **POST /v2/quotes**: Create fixed-rate quote (15-min lock)
5. **POST /v2/shifts/fixed**: Create order with quoteId
6. **GET /v2/shifts/:id**: Poll order status
7. **POST /v2/shifts/:id/cancel**: Cancel order after 5 minutes
8. **GET /v2/coins/icon/:coin**: Fetch token logos

### Rate Limiting

- **300ms minimum** between SideShift API calls (Bottleneck.js)
- Retry logic with exponential backoff on failures
- Caches coin list and icons for 24 hours

### Commission Structure

- 2% commission rate on all swaps
- Affiliate ID: `EKN8DnZ9w`
- Commission calculated server-side

---

## 🛠️ Technology Stack

### Frontend

- **React 19** - Latest React features
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **TanStack Query** - Data fetching & caching
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **Recharts** - Data visualization

### Backend

- **Node.js 20** - Runtime
- **Express** - Web framework
- **MongoDB Atlas** - Database (M0 free tier)
- **Mongoose** - ODM
- **QRCode** - QR generation
- **Bottleneck** - Rate limiting
- **Helmet** - Security headers
- **async-retry** - Retry logic

### DevOps

- **Vercel** - Frontend hosting (automatic deploys from GitHub)
- **Render** - Backend hosting (free tier with cold starts)
- **GitHub Actions** - CI/CD (optional)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- MongoDB database
- SideShift affiliate account

### Installation

1. **Clone repository**

```bash
git clone https://github.com/Mr-Ben-dev/Netshift.git
cd Netshift
```

2. **Backend setup**

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

3. **Frontend setup**

```bash
cd web
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

### Environment Variables

**Backend (.env)**

```env
PORT=5000
MONGODB_URI=mongodb+srv://...
NODE_ENV=development
SIDESHIFT_SECRET=your_sideshift_secret
AFFILIATE_ID=your_affiliate_id
COMMISSION_RATE=0.02
CORS_ORIGIN=http://localhost:5173
```

**Frontend (.env)**

```env
VITE_API_BASE_URL=http://localhost:5000
```

### Running Tests

```bash
# Backend unit tests
cd backend
npm test

# Backend smoke tests (requires live API)
npm run smoke-test
```

---

## 📚 API Documentation

### Settlement Endpoints

#### POST /api/settlements/create

Create a new settlement with obligations.

**Request:**

```json
{
  "obligations": [
    { "from": "Alice", "to": "Bob", "amount": "100", "token": "USDC" }
  ],
  "recipientPreferences": [
    {
      "party": "Bob",
      "receiveToken": "sol",
      "receiveChain": "solana",
      "receiveAddress": "7EcDhSYGxXyscszYEp35KHN8vvw3svAuLKTzXwCFLtV"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "settlementId": "st_abc123",
    "status": "draft"
  }
}
```

#### GET /api/settlements

List all settlements (for dashboard/analytics).

**Query Params:**

- `limit` (default: 50)
- `status` (optional filter)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "settlementId": "st_abc123",
      "status": "completed",
      "createdAt": "2025-11-10T18:00:00Z",
      "obligations": [...],
      "nettingResult": {...}
    }
  ]
}
```

#### GET /api/settlements/:id

Get settlement details by ID.

#### POST /api/settlements/:id/compute

Run netting algorithm and fetch SideShift rates.

#### POST /api/settlements/:id/execute

Create SideShift orders for net payments.

#### GET /api/settlements/:id/status

Poll order statuses (includes QR codes).

### SideShift Proxy Endpoints

#### GET /api/coins

List supported coins and networks.

#### GET /api/pair/:from/:to

Get rate quote for a trading pair.

#### POST /api/permissions

Check if user IP is allowed (geo-blocking).

---

## 📊 Real Data vs Demo

### What's Real

✅ SideShift API integration (no mocks)
✅ MongoDB storage (persistent)
✅ Address validation (15+ chains)
✅ QR code generation
✅ Rate limiting and retries
✅ Analytics from database
✅ Order status polling

### Demo/Placeholder

⚠️ Orders created in "test mode" (no real blockchain txs)
⚠️ Quotes expire after 15 minutes
⚠️ Render cold starts (30s delay on first request)

### Test Flow

To test the full flow:

1. Import sample CSV from `backend/demo/`
2. Set real blockchain addresses for recipients
3. Compute netting → Execute → View orders
4. QR codes and countdown timers will appear
5. Orders expire after 15 min without deposits

---

## 🎥 Video Demo

Watch the complete walkthrough: https://youtu.be/461uzdU5o4w

**Demonstrates:**

- CSV import with 17 obligations
- Netting computation (76% reduction)
- Real SideShift rate quotes
- Order execution with QR codes
- Dashboard and analytics views

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - See LICENSE file for details

---

## 👥 Team

Built for SideShift Wave 2 Buildathon

**Contact**: GitHub Issues or hello@netshift.app

---

## 🔗 Links

- **Live App**: https://netshift.vercel.app
- **GitHub**: https://github.com/Mr-Ben-dev/Netshift
- **SideShift.ai**: https://sideshift.ai
- **Documentation**: This file

---

_Last Updated: November 10, 2025_
