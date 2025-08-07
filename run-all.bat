@echo off
cls
echo.
echo ===============================================================================
echo  🚀 Universal Feedback Platform - Full Stack Startup
echo ===============================================================================
echo.
echo  Starting both Frontend (Next.js) and Backend (Express + AI)
echo  This will run both servers concurrently for development
echo.
echo ===============================================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not found in PATH
    echo    Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found

REM Check if both directories exist
if not exist "backend" (
    echo ❌ Backend directory not found
    echo    Make sure you're running this from the project root
    pause
    exit /b 1
)

if not exist "package.json" (
    echo ❌ Frontend package.json not found
    echo    Make sure you're running this from the project root
    pause
    exit /b 1
)

echo ✅ Project structure verified

REM Install dependencies if node_modules don't exist
echo.
echo 📦 Checking dependencies...

if not exist "node_modules" (
    echo Installing frontend dependencies...
    npm install
    if errorlevel 1 (
        echo ❌ Frontend dependency installation failed
        pause
        exit /b 1
    )
    echo ✅ Frontend dependencies installed
) else (
    echo ✅ Frontend dependencies found
)

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    npm install
    if errorlevel 1 (
        echo ❌ Backend dependency installation failed
        pause
        exit /b 1
    )
    cd ..
    echo ✅ Backend dependencies installed
) else (
    echo ✅ Backend dependencies found
)

REM Create .env files if they don't exist
echo.
echo 🔧 Checking configuration files...

if not exist ".env.local" (
    echo Creating frontend .env.local...
    echo NEXT_PUBLIC_API_URL=http://localhost:3001 > .env.local
    echo ✅ Frontend environment file created
) else (
    echo ✅ Frontend environment file exists
)

if not exist "backend\.env.local" (
    echo ❌ Backend .env.local not found
    echo    Please ensure backend/.env.local exists with Firebase configuration
    echo    See backend/.env.example for reference
    pause
    exit /b 1
) else (
    echo ✅ Backend environment file found
)

echo.
echo ===============================================================================
echo  🎯 Starting Universal Feedback Platform
echo ===============================================================================
echo.
echo  Frontend (Next.js): http://localhost:3000
echo  Backend (API + AI):  http://localhost:3001
echo  Admin Dashboard:     http://localhost:3000/admin
echo  API Documentation:   http://localhost:3001/api
echo  Health Check:        http://localhost:3001/health
echo.
echo  Press Ctrl+C to stop both servers
echo.
echo ===============================================================================
echo.

REM Start both servers using npm run script from package.json
echo 🚀 Launching both servers...
echo.

npm run full:dev

REM If the above command doesn't exist, start manually
if errorlevel 1 (
    echo.
    echo ⚠️  Full dev script not found, starting servers manually...
    echo.
    
    REM Start backend in background
    start "Backend Server" cmd /c "cd backend && npm run dev"
    
    REM Wait a moment for backend to start
    timeout /t 3 >nul
    
    REM Start frontend
    echo Starting frontend server...
    npm run dev
)

echo.
echo 👋 Servers stopped. Thank you for using Universal Feedback Platform!
pause
