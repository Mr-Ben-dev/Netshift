#!/usr/bin/env pwsh
# Quick test for settlement creation with prices

$BASE_URL = "http://localhost:5000"

Write-Host "`n🧪 Testing Settlement Creation with Price Snapshot`n" -ForegroundColor Cyan

$body = @{
    obligations          = @(
        @{
            from   = "Alice"
            to     = "Bob"
            amount = 120
            token  = "usdc"
            chain  = "base"
        },
        @{
            from   = "Bob"
            to     = "Charlie"
            amount = 75
            token  = "usdc"
            chain  = "base"
        },
        @{
            from   = "Charlie"
            to     = "Alice"
            amount = 50
            token  = "usdc"
            chain  = "base"
        },
        @{
            from   = "Diana"
            to     = "Alice"
            amount = 20
            token  = "usdc"
            chain  = "base"
        }
    )
    recipientPreferences = @(
        @{
            party          = "Alice"
            receiveToken   = "usdc"
            receiveChain   = "base"
            receiveAddress = "0x1111111111111111111111111111111111111111"
            refundAddress  = "0x1111111111111111111111111111111111111111"
        },
        @{
            party          = "Bob"
            receiveToken   = "usdc"
            receiveChain   = "base"
            receiveAddress = "0x2222222222222222222222222222222222222222"
            refundAddress  = "0x2222222222222222222222222222222222222222"
        },
        @{
            party          = "Charlie"
            receiveToken   = "usdc"
            receiveChain   = "base"
            receiveAddress = "0x3333333333333333333333333333333333333333"
            refundAddress  = "0x3333333333333333333333333333333333333333"
        },
        @{
            party          = "Diana"
            receiveToken   = "usdc"
            receiveChain   = "base"
            receiveAddress = "0x4444444444444444444444444444444444444444"
            refundAddress  = "0x4444444444444444444444444444444444444444"
        }
    )
} | ConvertTo-Json -Depth 10

try {
    Write-Host "📤 Sending request..." -ForegroundColor Yellow
    $response = Invoke-RestMethod -Uri "$BASE_URL/api/settlements/create" -Method Post -Body $body -ContentType "application/json" -Verbose
    
    Write-Host "`n✅ Settlement Created!" -ForegroundColor Green
    Write-Host "   Settlement ID: $($response.data.settlementId)" -ForegroundColor White
    Write-Host "   Status: $($response.data.status)" -ForegroundColor White
    
    if ($response.data.prices) {
        Write-Host "`n💰 Prices Captured:" -ForegroundColor Green
        Write-Host "   Timestamp: $($response.data.priceTimestamp)" -ForegroundColor White
        foreach ($key in $response.data.prices.PSObject.Properties.Name) {
            $price = $response.data.prices.$key
            Write-Host "   $($key.ToUpper()): `$$price" -ForegroundColor Cyan
        }
    }
    else {
        Write-Host "`n⚠️  NO PRICES IN RESPONSE!" -ForegroundColor Red
        Write-Host "   Response data:" -ForegroundColor Yellow
        $response.data | ConvertTo-Json -Depth 5 | Write-Host
    }
    
}
catch {
    Write-Host "`n❌ Error: $_" -ForegroundColor Red
    Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    if ($_.ErrorDetails) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n"
