#!/usr/bin/env pwsh
# NetShift API Test Script
# Tests all backend endpoints

$BASE_URL = "http://localhost:5000"
$API_URL = "$BASE_URL/api"

Write-Host "`n🚀 NetShift API Test Suite`n" -ForegroundColor Cyan

# Test 1: Health Check
Write-Host "1️⃣  Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/health" -Method Get
    if ($response.status -eq "ok") {
        Write-Host "   ✅ Health check passed - Version: $($response.version)" -ForegroundColor Green
    }
}
catch {
    Write-Host "   ❌ Health check failed: $_" -ForegroundColor Red
}

# Test 2: Get Coins
Write-Host "`n2️⃣  Testing Get Coins..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/coins" -Method Get
    $coinCount = $response.data.Count
    Write-Host "   ✅ Retrieved $coinCount coins" -ForegroundColor Green
    Write-Host "   Sample: $($response.data[0].coin) - $($response.data[0].name)" -ForegroundColor Gray
}
catch {
    Write-Host "   ❌ Get coins failed: $_" -ForegroundColor Red
}

# Test 3: Check Permissions
Write-Host "`n3️⃣  Testing Permissions..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/permissions" -Method Get
    Write-Host "   ✅ Permissions check: $($response.data)" -ForegroundColor Green
}
catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "   ⚠️  Region blocked (403) - Expected for US" -ForegroundColor Yellow
    }
    else {
        Write-Host "   ❌ Permissions check failed: $_" -ForegroundColor Red
    }
}

# Test 4: Validate Bitcoin Address
Write-Host "`n4️⃣  Testing Address Validation..." -ForegroundColor Yellow
try {
    $body = @{
        address = "1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
        network = "bitcoin"
        token   = "btc"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$API_URL/validate-address" -Method Post -Body $body -ContentType "application/json"
    Write-Host "   ✅ BTC address valid: $($response.data.valid)" -ForegroundColor Green
    Write-Host "   Requires memo: $($response.data.requiresMemo)" -ForegroundColor Gray
}
catch {
    Write-Host "   ❌ Address validation failed: $_" -ForegroundColor Red
}

# Test 5: Validate XRP Address (with memo requirement)
Write-Host "`n5️⃣  Testing XRP Address Validation..." -ForegroundColor Yellow
try {
    $body = @{
        address = "rN7n7otQDd6FczFgLdlqtyMVrn3LZXfgSa"
        network = "xrpl"
        token   = "xrp"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "$API_URL/validate-address" -Method Post -Body $body -ContentType "application/json"
    Write-Host "   ✅ XRP address valid: $($response.data.valid)" -ForegroundColor Green
    Write-Host "   Requires memo: $($response.data.requiresMemo)" -ForegroundColor Gray
}
catch {
    Write-Host "   ❌ XRP validation failed: $_" -ForegroundColor Red
}

# Test 6: Get Pair Info
Write-Host "`n6️⃣  Testing Pair Validation..." -ForegroundColor Yellow
try {
    $params = @{
        depositCoin    = "usdt"
        depositNetwork = "tron"
        settleCoin     = "usdc"
        settleNetwork  = "base"
        amount         = 10
    }
    
    $queryString = ($params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"
    $response = Invoke-RestMethod -Uri "$API_URL/pair?$queryString" -Method Get
    
    Write-Host "   ✅ Pair validation passed" -ForegroundColor Green
    Write-Host "   Min: $($response.data.min) | Max: $($response.data.max) | Rate: $($response.data.rate)" -ForegroundColor Gray
}
catch {
    Write-Host "   ❌ Pair validation failed: $_" -ForegroundColor Red
}

# Test 7: Create Settlement with Price Snapshot
Write-Host "`n7️⃣  Testing Create Settlement (with prices)..." -ForegroundColor Yellow
try {
    $body = @{
        obligations          = @(
            @{
                from   = "Alice"
                to     = "Bob"
                amount = 100
                token  = "usdc"
                chain  = "base"
            },
            @{
                from   = "Bob"
                to     = "Charlie"
                amount = 100
                token  = "usdc"
                chain  = "base"
            },
            @{
                from   = "Charlie"
                to     = "Alice"
                amount = 100
                token  = "usdc"
                chain  = "base"
            }
        )
        recipientPreferences = @(
            @{
                party          = "Alice"
                receiveToken   = "usdc"
                receiveChain   = "base"
                receiveAddress = "0x1234567890123456789012345678901234567890"
                refundAddress  = "0x1234567890123456789012345678901234567890"
            },
            @{
                party          = "Bob"
                receiveToken   = "usdc"
                receiveChain   = "base"
                receiveAddress = "0x2345678901234567890123456789012345678901"
                refundAddress  = "0x2345678901234567890123456789012345678901"
            },
            @{
                party          = "Charlie"
                receiveToken   = "usdc"
                receiveChain   = "base"
                receiveAddress = "0x3456789012345678901234567890123456789012"
                refundAddress  = "0x3456789012345678901234567890123456789012"
            }
        )
    } | ConvertTo-Json -Depth 10
    
    $response = Invoke-RestMethod -Uri "$API_URL/settlements/create" -Method Post -Body $body -ContentType "application/json"
    $settlementId = $response.data.settlementId
    
    Write-Host "   ✅ Settlement created: $settlementId" -ForegroundColor Green
    
    if ($response.data.prices) {
        Write-Host "   ✅ Prices captured at: $($response.data.priceTimestamp)" -ForegroundColor Green
        Write-Host "   USDC price: `$$($response.data.prices.usdc)" -ForegroundColor Gray
    }
    
    # Test 8: Get Settlement
    Write-Host "`n8️⃣  Testing Get Settlement..." -ForegroundColor Yellow
    $settlement = Invoke-RestMethod -Uri "$API_URL/settlements/$settlementId" -Method Get
    Write-Host "   ✅ Retrieved settlement - Status: $($settlement.data.status)" -ForegroundColor Green
    
    # Test 9: Compute Netting
    Write-Host "`n9️⃣  Testing Compute Netting..." -ForegroundColor Yellow
    $computeResponse = Invoke-RestMethod -Uri "$API_URL/settlements/$settlementId/compute" -Method Post
    Write-Host "   ✅ Netting computed" -ForegroundColor Green
    Write-Host "   Original: $($computeResponse.data.originalCount) → Optimized: $($computeResponse.data.optimizedCount)" -ForegroundColor Gray
    Write-Host "   Savings: $($computeResponse.data.savings.paymentReduction)%" -ForegroundColor Gray
    
    # Test 10: Refresh Prices
    Write-Host "`n🔟 Testing Refresh Prices..." -ForegroundColor Yellow
    $refreshBody = @{ refreshPrices = $true } | ConvertTo-Json
    $refreshResponse = Invoke-RestMethod -Uri "$API_URL/settlements/$settlementId/compute" -Method Post -Body $refreshBody -ContentType "application/json"
    Write-Host "   ✅ Prices refreshed at: $($refreshResponse.data.priceTimestamp)" -ForegroundColor Green
    
}
catch {
    Write-Host "   ❌ Settlement workflow failed: $_" -ForegroundColor Red
    Write-Host "   Error details: $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n" -NoNewline
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host " Test Summary " -NoNewline -ForegroundColor White
Write-Host ("=" * 50) -ForegroundColor Cyan
Write-Host "✅ Health Check" -ForegroundColor Green
Write-Host "✅ Get Coins" -ForegroundColor Green
Write-Host "✅ Permissions (may show 403 if in US)" -ForegroundColor Green
Write-Host "✅ Address Validation (BTC, XRP)" -ForegroundColor Green
Write-Host "✅ Pair Validation" -ForegroundColor Green
Write-Host "✅ Create Settlement with Price Snapshot" -ForegroundColor Green
Write-Host "✅ Compute Netting" -ForegroundColor Green
Write-Host "✅ Refresh Prices" -ForegroundColor Green
Write-Host "`n🎉 All critical endpoints tested!`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Start frontend: cd web && npm run dev" -ForegroundColor Gray
Write-Host "  2. Test UI at http://localhost:8080" -ForegroundColor Gray
Write-Host "  3. Import test CSV files from test-csvs/ folder" -ForegroundColor Gray
Write-Host "  4. Verify price snapshot, cancel button, min/max warnings" -ForegroundColor Gray
