@echo off
echo.
echo 🚀 UNIVERSAL FEEDBACK PLATFORM - QUICK START
echo ============================================
echo.

:: Check if Node.js is installed
node --version > nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:: Check if dependencies are installed
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

:: Start the development server
echo Starting development server...
echo.
npm run dev

pause