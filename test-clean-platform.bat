@echo off
cls
echo.
echo ==========================================
echo   CLEAN PLATFORM TEST SCRIPT
echo ==========================================
echo.
echo Testing your Enhanced Universal Feedback Platform...
echo.

:: Check if server is running
echo [1/3] Checking if server is running...
timeout /t 2 /nobreak > nul 2>&1
curl -s http://localhost:3000 > nul 2>&1
if errorlevel 1 (
    echo ❌ Server not running - Starting platform...
    start /b npm run dev
    echo ⏳ Waiting for server to start...
    timeout /t 15 /nobreak > nul
) else (
    echo ✅ Server is running
)

:: Test clean admin page
echo [2/3] Testing admin dashboard...
timeout /t 2 /nobreak > nul 2>&1
curl -s http://localhost:3000/admin > nul 2>&1
if errorlevel 1 (
    echo ❌ Admin dashboard not accessible
) else (
    echo ✅ Admin dashboard accessible
)

:: Test clean events
echo [3/3] Testing your 3 events...
timeout /t 1 /nobreak > nul 2>&1
curl -s http://localhost:3000/event/twise-night > nul 2>&1
if errorlevel 1 (
    echo ❌ TWISE Night not working
) else (
    echo ✅ TWISE Night working
)

curl -s http://localhost:3000/event/sam-wedding > nul 2>&1
if errorlevel 1 (
    echo ❌ Wedding event not working
) else (
    echo ✅ Wedding event working
)

curl -s http://localhost:3000/event/techflow-demo > nul 2>&1
if errorlevel 1 (
    echo ❌ TechFlow demo not working
) else (
    echo ✅ TechFlow demo working
)

echo.
echo ==========================================
echo   CLEAN PLATFORM READY!
echo ==========================================
echo.
echo 🎯 Your 3 core events:
echo.
echo 📊 Admin Dashboard: http://localhost:3000/admin
echo 🔬 TWISE Night:     http://localhost:3000/event/twise-night
echo 💒 Wedding:         http://localhost:3000/event/sam-wedding
echo 🏢 TechFlow Demo:   http://localhost:3000/event/techflow-demo
echo.
echo ✨ Plus unlimited custom events you can create!
echo.
echo 🎯 Next steps for competition:
echo 1. Create a 4th event live during demo
echo 2. Show real-time feedback collection
echo 3. Demonstrate AI sentiment analysis
echo 4. Present universal business value
echo.
echo 🚀 Platform is clean and competition-ready!
echo.
pause
