# PulseChat Development Startup Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PulseChat - Starting Development" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Checking MongoDB..." -ForegroundColor Yellow
$mongoExists = Get-Command mongod -ErrorAction SilentlyContinue
if (-not $mongoExists) {
    Write-Host "WARNING: MongoDB not found in PATH" -ForegroundColor Red
    Write-Host "Please make sure MongoDB is installed and running" -ForegroundColor Yellow
    Write-Host "Or use MongoDB Atlas connection string in server/.env" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "MongoDB found!" -ForegroundColor Green
}

Write-Host "[2/3] Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 3

Write-Host "[3/3] Starting Frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   PulseChat is starting!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:  http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C in each window to stop the servers" -ForegroundColor Yellow
