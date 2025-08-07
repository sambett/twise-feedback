@echo off
cls
echo.
echo ===============================================================================
echo  📦 Universal Feedback Platform - Dependency Installation
echo ===============================================================================
echo.
echo  Installing all required dependencies for both frontend and backend
echo.
echo ===============================================================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed or not found in PATH
    echo    Please install Node.js from https://nodejs.org/
    echo    Recommended version: 20.x or higher
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version

REM Check if npm is available
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not available
    echo    npm should come with Node.js installation
    pause
    exit /b 1
)

echo ✅ npm found:
npm --version

echo.
echo 🔧 Installing dependencies...
echo.

echo 📱 Installing frontend dependencies...
npm install
if errorlevel 1 (
    echo ❌ Frontend dependency installation failed
    echo    Please check your internet connection and try again
    pause
    exit /b 1
)
echo ✅ Frontend dependencies installed successfully
echo.

echo 🔧 Installing backend dependencies...
cd backend
npm install
if errorlevel 1 (
    echo ❌ Backend dependency installation failed
    echo    Please check your internet connection and try again
    pause
    exit /b 1
)
cd ..
echo ✅ Backend dependencies installed successfully
echo.

echo 🔧 Setting up environment files...

REM Create frontend .env.local if it doesn't exist
if not exist ".env.local" (
    echo NEXT_PUBLIC_API_URL=http://localhost:3001 > .env.local
    echo ✅ Created frontend environment file (.env.local)
) else (
    echo ✅ Frontend environment file already exists
)

REM Check backend environment file
if not exist "backend\.env.local" (
    echo ⚠️  Backend environment file (backend/.env.local) not found
    echo    This file contains Firebase configuration and is required
    echo    Please ensure it exists before starting the servers
) else (
    echo ✅ Backend environment file found
)

echo.
echo ===============================================================================
echo  🎉 Installation Complete!
echo ===============================================================================
echo.
echo  ✅ Frontend dependencies installed
echo  ✅ Backend dependencies installed  
echo  ✅ Environment files configured
echo.
echo  Next steps:
echo.
echo  1. Ensure backend/.env.local exists with Firebase configuration
echo  2. Run the platform:
echo.
echo     🚀 Quick start:    run-all.bat
echo     📱 Frontend only:  npm run dev
echo     🔧 Backend only:   cd backend && npm run dev
echo.
echo  3. Access the platform:
echo     Admin Dashboard:   http://localhost:3000/admin
echo     API Documentation: http://localhost:3001/api
echo     Health Check:      http://localhost:3001/health
echo.
echo ===============================================================================
echo.

pause
