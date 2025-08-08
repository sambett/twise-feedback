@echo off
title TWISE Database Setup & Verification
color 0B

echo.
echo ███████████████████████████████████████████████████████████████
echo █                                                             █
echo █        🗄️ TWISE DATABASE SETUP & VERIFICATION 🗄️          █
echo █                                                             █
echo ███████████████████████████████████████████████████████████████
echo.

REM Change to backend directory
cd /d "%~dp0backend"

echo 📋 Database Setup Menu:
echo.
echo    1. Test database connection
echo    2. Setup database and tables
echo    3. Generate demo data
echo    4. Full setup (setup + demo data)
echo    5. Exit
echo.
set /p choice="Select option (1-5): "

if "%choice%"=="1" goto test_connection
if "%choice%"=="2" goto setup_database
if "%choice%"=="3" goto generate_demo
if "%choice%"=="4" goto full_setup
if "%choice%"=="5" goto exit
goto invalid_choice

:test_connection
echo.
echo 🧪 Testing database connection...
node test-database.js
goto end

:setup_database
echo.
echo 🔧 Setting up database and tables...
node setup-database.js
if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ Database setup completed!
    echo 💡 You can now run: npm run dev
) else (
    echo.
    echo ❌ Database setup failed!
    echo 💡 Please check MySQL service and credentials
)
goto end

:generate_demo
echo.
echo 📝 Generating demo data...
node generate-demo-data.js
if %ERRORLEVEL% equ 0 (
    echo.
    echo ✅ Demo data generated!
    echo 🌐 Visit: http://localhost:3000/admin
) else (
    echo.
    echo ❌ Demo data generation failed!
    echo 💡 Make sure database is set up first
)
goto end

:full_setup
echo.
echo 🚀 Running full database setup...
echo.
echo Step 1: Setting up database...
node setup-database.js
if %ERRORLEVEL% neq 0 (
    echo ❌ Database setup failed!
    goto end
)

echo.
echo Step 2: Generating demo data...
node generate-demo-data.js
if %ERRORLEVEL% neq 0 (
    echo ❌ Demo data generation failed!
    goto end
)

echo.
echo ✅ Full setup completed successfully!
echo.
echo 🎯 Next steps:
echo    1. Start backend: npm run dev
echo    2. Start frontend: npm run dev (in main folder)
echo    3. Visit: http://localhost:3000/admin
goto end

:invalid_choice
echo.
echo ❌ Invalid choice. Please select 1-5.
pause
goto end

:exit
echo.
echo 👋 Goodbye!
goto end

:end
echo.
pause
