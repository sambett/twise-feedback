@echo off
cls
echo.
echo ============================================
echo   ENHANCED UNIVERSAL FEEDBACK PLATFORM
echo ============================================
echo.
echo Starting your clean, competition-ready platform...
echo.

:: Check if Node.js is installed
node --version > nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please make sure you're running this script from the project root directory
    pause
    exit /b 1
)

:: Install dependencies if node_modules doesn't exist
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
echo.
echo Starting Next.js development server...
echo.
start /b npm run dev

:: Wait for server to start
echo Waiting for server to start...
timeout /t 12 /nobreak > nul

:: Open essential URLs
echo.
echo Opening Enhanced Universal Feedback Platform...
echo.

:: Master Admin Dashboard
echo Opening Master Admin Dashboard...
start http://localhost:3000/admin

:: Wait between opens
timeout /t 3 /nobreak > nul

:: Core Events
echo Opening core event dashboards...
start http://localhost:3000/admin/twise-night
timeout /t 2 /nobreak > nul
start http://localhost:3000/admin/sam-wedding
timeout /t 2 /nobreak > nul
start http://localhost:3000/admin/techflow-demo

timeout /t 3 /nobreak > nul

:: Sample Feedback Forms
echo Opening sample feedback forms...
start http://localhost:3000/event/twise-night
timeout /t 2 /nobreak > nul
start http://localhost:3000/event/sam-wedding

echo.
echo ============================================
echo   ENHANCED PLATFORM RUNNING!
echo ============================================
echo.
echo Your Enhanced Universal Feedback Platform is ready!
echo.
echo 🎯 CORE FUNCTIONALITY:
echo   ✅ Master Admin:    http://localhost:3000/admin
echo   ✅ CREATE EVENTS:   Click "Create New Event" button
echo   ✅ MANAGE EVENTS:   Edit, delete, duplicate events
echo   ✅ AI ANALYSIS:     Real-time sentiment analysis
echo.
echo 📊 DASHBOARDS:
echo   TWISE Night:        http://localhost:3000/admin/twise-night
echo   Wedding:            http://localhost:3000/admin/sam-wedding
echo   TechFlow Demo:      http://localhost:3000/admin/techflow-demo
echo.
echo 📝 FEEDBACK FORMS:
echo   TWISE Night:        http://localhost:3000/event/twise-night
echo   Wedding:            http://localhost:3000/event/sam-wedding
echo   TechFlow Demo:      http://localhost:3000/event/techflow-demo
echo.
echo 🎯 COMPETITION DEMO FLOW:
echo 1. Show Master Admin (universal concept)
echo 2. Click "Create New Event" (live creation)
echo 3. Create event for judges (instant deployment)
echo 4. Submit feedback (real-time AI analysis)
echo 5. View dashboard (instant analytics)
echo.
echo 🚀 You're ready to win! Clean, scalable, impressive!
echo.
echo Press Ctrl+C to stop the server when done.
echo.
pause