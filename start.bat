@echo off
echo ========================================
echo   PulseChat - Starting Development
echo ========================================
echo.

echo [1/3] Checking MongoDB...
where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: MongoDB not found in PATH
    echo Please make sure MongoDB is installed and running
    echo Or use MongoDB Atlas connection string in server/.env
    echo.
) else (
    echo MongoDB found!
)

echo [2/3] Starting Backend Server...
start "PulseChat Backend" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend...
start "PulseChat Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   PulseChat is starting!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Press any key to stop all servers...
pause >nul

echo Stopping servers...
taskkill /FI "WindowTitle eq PulseChat Backend*" /T /F >nul 2>nul
taskkill /FI "WindowTitle eq PulseChat Frontend*" /T /F >nul 2>nul
echo Done!
