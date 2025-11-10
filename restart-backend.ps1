#!/usr/bin/env pwsh
# Quick script to restart the backend

Write-Host "`n🔄 Restarting Backend Server...`n" -ForegroundColor Cyan

# Kill any existing node processes running on port 5000
Write-Host "🛑 Stopping existing backend processes..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($pid in $processes) {
    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Stopped process $pid" -ForegroundColor Green
}

Start-Sleep -Seconds 1

# Start the backend
Write-Host "`n🚀 Starting backend server..." -ForegroundColor Cyan
Set-Location "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host "`n✅ Backend restarting in new window!" -ForegroundColor Green
Write-Host "   Check the new PowerShell window for logs" -ForegroundColor Gray
