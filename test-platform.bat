@echo off
cls
echo.
echo ==========================================
echo   ENHANCED PLATFORM TEST SCRIPT
echo ==========================================
echo.
echo Testing your Universal Feedback Platform...
echo.

:: Check if server is running
echo [1/4] Checking if server is running...
curl -s http://localhost:3000 > nul 2>&1
if errorlevel 1 (
    echo ❌ Server not running. Please start with: launch-platform.bat
    pause
    exit /b 1
) else (
    echo ✅ Server is running
)

:: Test admin page
echo [2/4] Testing admin dashboard...
curl -s http://localhost:3000/admin > nul 2>&1
if errorlevel 1 (
    echo ❌ Admin dashboard not accessible
) else (
    echo ✅ Admin dashboard accessible
)

:: Test static event
echo [3/4] Testing static event (TWISE Night)...
curl -s http://localhost:3000/event/twise-night > nul 2>&1
if errorlevel 1 (
    echo ❌ Static events not working
) else (
    echo ✅ Static events working
)

:: Test Firebase connection
echo [4/4] Testing Firebase connection...
curl -s "https://twise-feedback-default-rtdb.europe-west1.firebasedatabase.app/events.json" > nul 2>&1
if errorlevel 1 (
    echo ❌ Firebase connection failed
) else (
    echo ✅ Firebase connection working
)

echo.
echo ==========================================
echo   TEST COMPLETE
echo ==========================================
echo.
echo Your platform is ready! Key URLs:
echo.
echo 📊 Admin Dashboard: http://localhost:3000/admin
echo 📝 TWISE Night Form: http://localhost:3000/event/twise-night
echo 💒 Wedding Form: http://localhost:3000/event/sam-wedding
echo 🏢 Product Demo: http://localhost:3000/event/techflow-demo
echo.
echo Next steps:
echo 1. Update Firebase rules (see ENHANCED-SETUP.md)
echo 2. Create a test event using "Create New Event"
echo 3. Practice your 3-minute demo
echo.
echo 🚀 You're ready to win!
echo.
pause
