# NetShift CSV Test Suite Guide

## Quick Start

All test CSV files are in the `test-csvs/` directory. Each tests a specific feature.

---

## Test A: Simple 3-Party Cycle

**File**: `A-simple-cycle.csv`

**Scenario**:

- Alice owes Bob 100 USDC
- Bob owes Charlie 100 USDC
- Charlie owes Alice 100 USDC

**Expected Result**:

- ✅ Original obligations: 3
- ✅ Optimized payments: 0 (complete cycle cancellation)
- ✅ Savings: 100% payment reduction
- ✅ No net payments required

**How to Test**:

1. Import `A-simple-cycle.csv`
2. Add any receive addresses for Alice, Bob, Charlie
3. Click Compute
4. Verify: "0 optimized payments" and "100% savings"

---

## Test B: Partial Cycle + Aggregation

**File**: `B-partial-cycle.csv`

**Scenario**:

- Alice owes Bob 120 USDC
- Bob owes Charlie 75 USDC
- Charlie owes Alice 50 USDC
- Diana owes Alice 20 USDC

**Expected Result**:

- ✅ Original obligations: 4
- ✅ Optimized payments: 2 (or fewer with smart aggregation)
- ✅ Cycle cancels 50 USDC
- ✅ Remaining debts consolidated

**How to Test**:

1. Import `B-partial-cycle.csv`
2. Add receive addresses for all 4 parties
3. Click Compute
4. Verify reduced payment count
5. Check netting graph shows cycle elimination

---

## Test C: Cross-Chain Consolidation

**File**: `C-cross-chain.csv`

**Scenario**:

- Ops owes Dev 250 USDT (Tron)
- Dev owes Design 250 USDT (Tron)
- Design owes Ops 200 USDC (Ethereum)

**Expected Result**:

- ✅ Tokens normalized to USD equivalent
- ✅ Cross-chain debts netted using real prices
- ✅ Optimal settlement path calculated
- ✅ Price timestamp shown

**How to Test**:

1. Import `C-cross-chain.csv`
2. Note: Different tokens (USDT vs USDC) and chains
3. Add receive addresses
4. Click Compute
5. Verify: Price conversion applied, cycle detected
6. Check "Live Prices" panel shows both USDT and USDC rates

---

## Test D: XRP Memo Required

**File**: `D-xrp-memo.csv`

**Scenario**:

- Client1 owes Vendor1 150 XRP
- Client2 owes Vendor1 75 XRP

**Expected Result**:

- ✅ "Destination Tag Required" badge appears for Vendor1
- ✅ Memo field shown (numeric only)
- ✅ Placeholder shows "123456 (numeric only)"
- ✅ Submit button disabled until memo provided
- ✅ Address validation works for XRP format

**How to Test**:

1. Import `D-xrp-memo.csv`
2. In Recipients step, see Vendor1's section
3. Verify RED badge: "Destination Tag Required"
4. Enter XRP address (e.g., `rN7n7otQDd6FczFgLdlqtyMVrn3LZXfgSa`)
5. Enter memo: `123456`
6. Verify Submit button becomes enabled
7. Create settlement and execute

**Valid XRP Test Addresses**:

- `rN7n7otQDd6FczFgLdlqtyMVrn3LZXfgSa`
- `rU6K7V3Po4snVhBBaU29sesqs2qTQJWDw1`

---

## Test E: Below-Min Amount Guard

**File**: `E-below-min.csv`

**Scenario**:

- Tiny owes Ops 0.1 USDT (Ethereum)

**Expected Result**:

- ✅ Settlement creates successfully
- ✅ Compute works
- ❌ Execute should fail with min amount warning
- ✅ Error message: "Below minimum for USDT-ETH → USDC-base pair"

**How to Test**:

1. Import `E-below-min.csv`
2. Add Ops receive address
3. Click Compute (should succeed)
4. Click Execute
5. Verify error about minimum amount
6. Check backend logs for pair validation failure

**Note**: This tests the backend validation that already exists. Frontend UI warning (task #6) is not yet implemented.

---

## Test F: BTC Address Validation

**File**: `F-btc-validation.csv`

**Scenario**:

- Treasury owes Auditor 0.002 BTC

**Expected Result**:

- ✅ Client-side validation shows green checkmark for valid BTC address
- ✅ Red border + error for invalid address
- ❌ Submit blocked if address invalid
- ✅ Server-side validation double-checks before Execute

**How to Test**:

1. Import `F-btc-validation.csv`
2. In Recipients, enter INVALID address: `1234567890`
3. Verify: Red border appears, error message shown
4. Change to VALID address: `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`
5. Verify: Green border, checkmark appears
6. Complete settlement creation
7. Execute → should succeed (or fail with SideShift error, not validation error)

**Valid BTC Test Addresses**:

- `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa` (Genesis block)
- `bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4` (Bech32)
- `3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy` (P2SH)

---

## Running All Tests

### Automated Testing

```bash
# Backend tests (if you add Jest tests)
cd backend
npm test

# Frontend tests
cd web
npm test
```

### Manual Testing Checklist

- [ ] Test A: Simple cycle → 0 payments
- [ ] Test B: Partial cycle → reduced payments
- [ ] Test C: Cross-chain → price conversion
- [ ] Test D: XRP memo → Required badge shown
- [ ] Test E: Below-min → error on execute
- [ ] Test F: BTC validation → address format checked

---

## Expected Results Summary

| Test | Obligations | Expected Net | Key Feature                  |
| ---- | ----------- | ------------ | ---------------------------- |
| A    | 3           | 0            | Complete cycle cancellation  |
| B    | 4           | 2            | Partial cycle + aggregation  |
| C    | 3           | ~2           | Cross-chain price conversion |
| D    | 2           | 1-2          | XRP memo requirement         |
| E    | 1           | 1            | Min amount validation        |
| F    | 1           | 1            | BTC address validation       |

---

## Troubleshooting

### "Prices not showing"

- Check: Settlement created after today's changes?
- Verify: `nettingResult.prices` exists in database
- Solution: Create new settlement (old ones don't have prices field)

### "Memo field not appearing"

- Check: Token is XRP, XLM, EOS, or ATOM?
- Verify: Chain name matches exactly (xrpl, stellar, eos, cosmos)
- Solution: Use lowercase chain names in CSV

### "Address validation not working"

- Check: Address format matches network
- Verify: Green/red borders appear on input
- Console: Look for validation errors
- Solution: Use test addresses provided above

### "Execute fails with 403"

- Check: Are you in a restricted region (US)?
- Verify: PermissionsGate shows red banner
- Solution: This is expected - compute/proof still work

### "Execute fails with min amount error"

- This is expected for Test E
- Check: Error message mentions minimum
- Solution: Increase amount or change pair

---

## Reporting Results

After running tests, document:

1. Test case (A-F)
2. CSV imported successfully? (Yes/No)
3. Recipients configured? (Yes/No)
4. Compute result (obligations → net payments)
5. Savings percentage
6. UI features working? (memo badges, validation, prices)
7. Execute result (success/error)
8. Screenshots (optional)

**Example Report**:

```
Test A - Simple Cycle
- CSV Import: ✅ Success
- Obligations: 3 (Alice→Bob, Bob→Charlie, Charlie→Alice)
- Compute Result: 0 net payments
- Savings: 100% reduction
- Price Snapshot: ✅ Shown with timestamp
- Execute: Skipped (0 payments)
- Status: PASS ✅
```

---

## Demo Video Script Using Test B

**Best test for demo**: Test B (Partial Cycle) - shows real netting with savings

1. **0-15s**: Show landing page, explain NetShift
2. **15-30s**: Drag `B-partial-cycle.csv`, show 4 obligations parsed
3. **30-45s**: Add recipient addresses, show price snapshot panel
4. **45-60s**: Click Compute, see 4→2 reduction (50% savings)
5. **60-75s**: Click Refresh Prices (optional), then Execute
6. **75-90s**: Show orders created, QR code, public proof page

---

## Next Steps After Testing

1. ✅ Run all 6 tests manually
2. ✅ Document results
3. ⏸️ Create OpenAPI spec
4. ⏸️ Build Postman collection
5. ⏸️ Record demo video
6. ⏸️ Deploy to production
7. ⏸️ Submit Wave 2

**Good luck! 🚀**
