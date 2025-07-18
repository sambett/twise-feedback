@echo off
cls
echo.
echo ========================================
echo   DEMO LAUNCHER - UNIVERSAL FEEDBACK PLATFORM
echo ========================================
echo.
echo This opens the KEY URLs for presentations
echo.

:: Check if server is running by testing localhost:3000
curl -s http://localhost:3000 > nul 2>&1
if errorlevel 1 (
    echo ERROR: Development server is not running!
    echo.
    echo Please start the server first:
    echo   npm run dev
    echo.
    echo Then run this demo script again.
    echo.
    pause
    exit /b 1
)

echo Opening demo URLs...
echo.

:: 1. Master Admin Overview (Most Important)
echo [1/5] Opening Master Admin Overview...
start http://localhost:3000/admin
timeout /t 3 /nobreak > nul

:: 2. Wedding Feedback Form (Shows Different Theme)
echo [2/5] Opening Wedding Feedback Form (Elegant Theme)...
start http://localhost:3000/event/sam-wedding
timeout /t 3 /nobreak > nul

:: 3. Wedding Dashboard (Shows Real-time Analytics)
echo [3/5] Opening Wedding Dashboard...
start http://localhost:3000/admin/sam-wedding
timeout /t 3 /nobreak > nul

:: 4. Product Demo Form (Shows Corporate Theme)
echo [4/5] Opening Product Demo Form (Corporate Theme)...
start http://localhost:3000/event/techflow-demo
timeout /t 3 /nobreak > nul

:: 5. TWISE Night Dashboard (Original)
echo [5/5] Opening TWISE Night Dashboard (Research Theme)...
start http://localhost:3000/admin/twise-night

echo.
echo ========================================
echo   DEMO READY FOR PRESENTATION!
echo ========================================
echo.
echo Perfect for presentations! You now have:
echo   ✓ Master Admin Overview (All Events)
echo   ✓ Wedding Form (Elegant Theme)
echo   ✓ Wedding Dashboard (Real-time)
echo   ✓ Product Demo Form (Corporate Theme)
echo   ✓ TWISE Dashboard (Research Theme)
echo.
echo 🎯 DEMO FLOW SUGGESTION:
echo   1. Start with Master Admin Overview
echo   2. Click on "Wedding" to show themed dashboard
echo   3. Go to Wedding Form and submit feedback
echo   4. Return to Wedding Dashboard to see real-time update
echo   5. Show Product Demo to prove universality
echo.
pause