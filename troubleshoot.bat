@echo off
cls
echo.
echo ========================================
echo   TROUBLESHOOTING & RESET SCRIPT
echo ========================================
echo.
echo This script helps fix common issues
echo.

:menu
echo Choose an option:
echo.
echo [1] Kill all Node.js processes (if port 3000 is stuck)
echo [2] Clean install (delete node_modules and reinstall)
echo [3] Test server connection
echo [4] Open only essential URLs
echo [5] Show current running processes
echo [6] Exit
echo.
set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto kill_processes
if "%choice%"=="2" goto clean_install
if "%choice%"=="3" goto test_connection
if "%choice%"=="4" goto open_essentials
if "%choice%"=="5" goto show_processes
if "%choice%"=="6" goto exit
goto menu

:kill_processes
echo.
echo Killing all Node.js processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul
echo.
echo ✓ All Node.js processes terminated
echo You can now run launch-platform.bat again
echo.
pause
goto menu

:clean_install
echo.
echo Performing clean installation...
if exist "node_modules" (
    echo Removing node_modules...
    rmdir /s /q node_modules
)
if exist "package-lock.json" (
    echo Removing package-lock.json...
    del package-lock.json
)
echo.
echo Installing fresh dependencies...
npm install
if errorlevel 1 (
    echo ERROR: Installation failed
    pause
    goto menu
)
echo.
echo ✓ Clean installation completed
echo.
pause
goto menu

:test_connection
echo.
echo Testing server connection...
curl -s http://localhost:3000 > nul 2>&1
if errorlevel 1 (
    echo ❌ Server is NOT running
    echo Please run launch-platform.bat first
) else (
    echo ✅ Server is running correctly
    echo You can access the platform at http://localhost:3000
)
echo.
pause
goto menu

:open_essentials
echo.
echo Testing server first...
curl -s http://localhost:3000 > nul 2>&1
if errorlevel 1 (
    echo ❌ Server is not running!
    echo Please run launch-platform.bat first
    pause
    goto menu
)
echo.
echo Opening essential URLs only...
start http://localhost:3000/admin
timeout /t 2 /nobreak > nul
start http://localhost:3000/event/sam-wedding
echo.
echo ✓ Essential URLs opened
echo.
pause
goto menu

:show_processes
echo.
echo Current Node.js processes:
echo.
tasklist /fi "imagename eq node.exe" 2>nul
echo.
echo Current processes using port 3000:
netstat -ano | findstr :3000 2>nul
echo.
pause
goto menu

:exit
echo.
echo Goodbye!
exit /b 0