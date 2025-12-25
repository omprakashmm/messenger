@echo off
echo ========================================
echo   PulseChat - Quick Environment Setup
echo ========================================
echo.

REM Check if .env.local exists in root
if not exist ".env.local" (
    echo Creating .env.local in root...
    echo NEXT_PUBLIC_API_URL=http://localhost:5000 > .env.local
    echo ✓ Created .env.local
) else (
    echo ✓ .env.local already exists
)

REM Check if server/.env exists
if not exist "server\.env" (
    echo Creating server/.env...
    (
        echo PORT=5000
        echo NODE_ENV=development
        echo CLIENT_URL=http://localhost:3000
        echo MONGODB_URI=mongodb://localhost:27017/pulsechat
        echo JWT_SECRET=pulsechat-super-secret-jwt-key-2024-change-in-production
        echo JWT_REFRESH_SECRET=pulsechat-refresh-secret-key-2024-change-in-production
    ) > server\.env
    echo ✓ Created server/.env
) else (
    echo ✓ server/.env already exists
)

echo.
echo ========================================
echo   Environment files ready!
echo ========================================
echo.
echo Next steps:
echo 1. Setup MongoDB (local or Atlas)
echo 2. Run: start.bat
echo.
pause
