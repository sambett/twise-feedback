@echo off
REM ===================================================================
REM Universal Feedback Platform - Master Startup Script
REM Starts both AI backend and frontend with proper dependency checking
REM ===================================================================

setlocal enabledelayedexpansion

echo.
echo ██████████████████████████████████████████████████████████████████
echo █                                                              █
echo █  🚀 UNIVERSAL FEEDBACK PLATFORM STARTUP 🤖                  █
echo █                                                              █
echo █  Starting AI-powered multilingual sentiment analysis        █
echo █  Frontend: http://localhost:3000                            █
echo █  AI Backend: http://localhost:3001                          █
echo █                                                              █
echo ██████████████████████████████████████████████████████████████████
echo.

REM Check if Node.js is installed
echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js is not installed!
    echo Please install Node.js 20+ from https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js is available

REM Check if backend directory exists
echo.
echo [2/6] Checking backend setup...
if not exist "backend" (
    echo ❌ Backend directory not found!
    echo Please ensure the backend folder exists in the current directory.
    pause
    exit /b 1
)
echo ✅ Backend directory found

REM Install frontend dependencies if needed
echo.
echo [3/6] Checking frontend dependencies...
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if !ERRORLEVEL! neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
)
echo ✅ Frontend dependencies ready

REM Install backend dependencies if needed
echo.
echo [4/6] Checking backend dependencies...
cd backend
if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    if !ERRORLEVEL! neq 0 (
        echo ❌ Failed to install backend dependencies
        cd ..
        pause
        exit /b 1
    )
)
cd ..
echo ✅ Backend dependencies ready

REM Check configuration files
echo.
echo [5/6] Validating configuration...
if not exist ".env.local" (
    echo ❌ Frontend .env.local not found!
    echo Please ensure .env.local exists with NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
    pause
    exit /b 1
)

if not exist "backend\.env.local" (
    echo ❌ Backend .env.local not found!
    echo Please run the backend setup: cd backend && npm run setup
    pause
    exit /b 1
)
echo ✅ Configuration files validated

REM Start both servers
echo.
echo [6/6] Starting servers...
echo.
echo ========================================
echo   SERVERS STARTING...
echo ========================================
echo 🤖 AI Backend: http://localhost:3001
echo 🌐 Frontend: http://localhost:3000
echo 📊 Admin Dashboard: http://localhost:3000/admin
echo 🔍 Backend Health: http://localhost:3001/health
echo.
echo Press Ctrl+C to stop all servers
echo ========================================
echo.

REM Start backend in background and frontend in foreground
echo Starting AI Backend...
start "TWISE AI Backend" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

echo Starting Frontend...
echo.
npm run dev

REM If we get here, the frontend stopped, so cleanup
echo.
echo 🛑 Shutting down servers...
taskkill /f /fi "WindowTitle eq TWISE AI Backend*" >nul 2>&1
echo ✅ All servers stopped
echo.
pause
