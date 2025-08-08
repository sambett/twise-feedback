@echo off
echo ========================================
echo   TWISE BACKEND STARTUP SCRIPT
echo ========================================
echo.

REM Change to backend directory
cd /d "%~dp0"

REM Check if .env.local exists
if not exist ".env.local" (
    echo ❌ .env.local file not found!
    echo 💡 Create .env.local with MySQL credentials
    pause
    exit /b 1
)

echo 📋 Loading environment variables...
REM Load environment variables (Windows doesn't natively support .env files)
for /f "usebackq tokens=1,2 delims==" %%a in (".env.local") do (
    set "%%a=%%b"
)

echo 📊 Configuration:
echo    Database: %DB_HOST%:%DB_PORT%/%DB_NAME%
echo    User: %DB_USER%
echo.

echo 🧪 Testing database connection...
node test-database.js
if %ERRORLEVEL% neq 0 (
    echo.
    echo ❌ Database connection failed!
    echo 💡 Fix the database connection before starting server
    echo.
    echo 🔧 Common solutions:
    echo    1. Start MySQL service: net start MySQL91
    echo    2. Check password in .env.local
    echo    3. Run setup: npm run setup-db
    echo.
    pause
    exit /b 1
)

echo.
echo ✅ Database connection successful!
echo.

echo 🚀 Starting TWISE backend server...
echo 📍 Server will be available at: http://localhost:%PORT%
echo 📊 Health check: http://localhost:%PORT%/health
echo 📚 API docs: http://localhost:%PORT%/api
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
npm run dev

echo.
echo 👋 Backend server stopped
pause
