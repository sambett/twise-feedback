@echo off
echo ====================================================
echo  Universal Feedback Platform - Quick Start
echo ====================================================
echo.

echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Setting up environment...
if not exist .env.local (
    copy .env.example .env.local
    echo Created .env.local from template
) else (
    echo .env.local already exists
)

echo.
echo [3/3] Starting server...
echo.
echo ====================================================
echo  Server starting on http://localhost:3001
echo  Press Ctrl+C to stop
echo ====================================================
echo.

npm run dev

pause
