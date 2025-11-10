# NetShift Backend

Multi-party crypto payment netting platform backend with SideShift.ai integration.

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your MongoDB URI (keep SIMULATION_MODE=true for testing)

# Start development server
npm run dev
```

The server will start on `http://localhost:5000` (or your configured PORT).

## Mock Mode (Default)

By default, the backend runs in **SIMULATION_MODE** where:

- No real SideShift.ai API calls are made
- All shift operations return simulated data
- Shift status progressively updates based on elapsed time
- Perfect for development without API keys

To enable real API calls:

1. Get API key from SideShift.ai
2. Set `SIMULATION_MODE=false` in `.env`
3. Add your `SIDESHIFT_API_KEY`

## Available Scripts

- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server
- `npm test` - Run test suite
- `npm run seed` - Seed database with sample data
- `npm run dev-test` - Run manual flow testing
- `npm run dev-smoke` - Run real SideShift smoke test (no deposits)

---

## Real SideShift Integration (v2)

This backend now uses **SideShift v2 endpoints only**. You must set `SIDESHIFT_SECRET` and `AFFILIATE_ID` in `.env`.

- Quotes and shift creation require forwarding the end user's IP via `x-user-ip` if you call the API from the server
- Some jurisdictions are not allowed; check `/api/permissions` before creating a shift
- See [SideShift API Docs](https://docs.sideshift.ai)

### Local Test (No Deposits Required)

1. **Set environment variables** in `backend/.env`:

   ```bash
   SIDESHIFT_SECRET=your_secret
   AFFILIATE_ID=your_affiliate_id
   FORCE_USER_IP=your_public_ipv4  # For localhost testing
   ```

2. **Start server**:

   ```bash
   npm run dev
   ```

3. **Create a settlement** via `POST /api/settlements/create` with `recipientPreferences` including `receiveAddress`

4. **Compute netting**: `POST /api/settlements/:id/compute`

5. **Execute (fixed quotes)**: `POST /api/settlements/:id/execute`

   - You will receive **one shift per recipient** with:
     - `depositAddress` - unique deposit address for each recipient
     - `depositAmount` - exact amount to deposit
     - `depositToken` / `depositNetwork` - which token/chain to send
     - `qrCode` - QR code data URL for the deposit address
   - **No funds are moved until you deposit**

6. **Poll status**: `GET /api/settlements/:id/status`

7. **Optional cancel** (after 5 minutes): `POST /api/shifts/{shiftId}/cancel`
   - Uses `/v2/cancel-order` endpoint
   - See [Cancel Order Docs](https://docs.sideshift.ai/api/cancel-order)

**Note**: SideShift does not support webhooks; status must be polled via `/v2/shifts/{id}`. See [Shift Status Docs](https://docs.sideshift.ai/api/shift-status).

## API Endpoints

### Settlements

- `POST /api/settlements/create` - Create new settlement
- `POST /api/settlements/:id/compute` - Compute netting solution
- `POST /api/settlements/:id/execute` - Execute shifts via SideShift
- `GET /api/settlements/:id/status` - Get settlement status
- `GET /api/settlements/:id/export?format=csv|json` - Export settlement data

### Public

- `GET /api/proof/:settlementId` - Public proof of settlement

### Webhooks

- `POST /api/webhooks/sideshift` - SideShift webhook handler

## Architecture

- **ES Modules**: Native `import/export` syntax
- **Mock-First**: Everything works without API keys
- **Rate Limiting**: Bottleneck for SideShift API compliance
- **Validation**: Joi schemas for all inputs
- **Logging**: Winston with file rotation
- **Database**: MongoDB with Mongoose

## Project Structure

```
backend/
├── src/
│   ├── api/          # SideShift client & routes
│   ├── netting/      # Netting algorithm & optimization
│   ├── database/     # Mongoose models & queries
│   ├── utils/        # Validation, security, logging
│   └── config/       # Constants & configuration
├── tests/            # Unit & integration tests
├── mock/             # Sample data for testing
├── scripts/          # Utility scripts
└── docs/             # Deployment & troubleshooting
```

## Deployment

See `docs/DEPLOYMENT.md` for Render.com deployment instructions.

## License

MIT
