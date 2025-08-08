@echo off
title TWISE Universal Feedback Platform - Full Stack Launcher
color 0A

echo.
echo ███████████████████████████████████████████████████████████████
echo █                                                             █
echo █        🚀 TWISE UNIVERSAL FEEDBACK PLATFORM 🚀            █
echo █                                                             █
echo █     Full Stack Application Launcher (Frontend + Backend)   █
echo █                                                             █
echo ███████████████████████████████████████████████████████████████
echo.

REM Change to project root directory
cd /d "%~dp0"

echo 📋 Checking project structure...
if not exist "backend" (
    echo ❌ Backend folder not found!
    pause
    exit /b 1
)

if not exist "app" (
    echo ❌ Frontend app folder not found!
    pause
    exit /b 1
)

if not exist "backend\.env.local" (
    echo ❌ Backend .env.local file not found!
    echo 💡 Please configure MySQL credentials in backend\.env.local
    pause
    exit /b 1
)

echo ✅ Project structure OK
echo.

echo 🧪 Testing MySQL database connection...
cd backend
node test-database.js
if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ Database connection failed!
    echo.
    echo 🔧 Please fix database connection first:
    echo    1. Start MySQL service: net start MySQL91 ^(as Administrator^)
    echo    2. Verify credentials in backend\.env.local
    echo    3. Run database setup: cd backend ^&^& npm run setup-db
    echo.
    pause
    exit /b 1
)

cd ..
echo ✅ Database connection successful!
echo.

echo 📦 Checking dependencies...
cd backend
if not exist "node_modules" (
    echo ⏳ Installing backend dependencies...
    npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ Failed to install backend dependencies
        pause
        exit /b 1
    )
)

cd ..
if not exist "node_modules" (
    echo ⏳ Installing frontend dependencies...
    npm install
    if %ERRORLEVEL% neq 0 (
        echo ❌ Failed to install frontend dependencies
        pause
        exit /b 1
    )
)

echo ✅ Dependencies ready
echo.

echo 🚀 Starting applications...
echo.
echo 📍 Application URLs:
echo    🌐 Frontend:  http://localhost:3000
echo    🔧 Backend:   http://localhost:3001  
echo    📊 Admin:     http://localhost:3000/admin
echo    ❤️ Health:    http://localhost:3001/health
echo    📚 API Docs:  http://localhost:3001/api
echo.
echo ⚡ Starting both servers...
echo 💡 Use Ctrl+C to stop both servers
echo.

REM Start both frontend and backend using concurrently
npm run full:dev

echo.
echo 👋 Both servers stopped
echo.
pause
