@echo off
echo 🚀 DEPLOIEMENT AUTOMATIQUE VERCEL
echo =================================
echo.

echo 📋 Verification des prerequis...

:: Vérifier si npm est installé
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm n'est pas installe
    pause
    exit /b 1
)

:: Vérifier si git est installé
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ git n'est pas installe
    pause
    exit /b 1
)

echo ✅ Prerequis OK
echo.

echo 📦 Installation des dependances...
call npm install

echo.
echo 🔨 Test du build...
call npm run build

if errorlevel 1 (
    echo ❌ Build echoue. Corrigez les erreurs avant de deployer.
    pause
    exit /b 1
)

echo ✅ Build reussi
echo.

echo 📝 Verification des modifications Git...

:: Vérifier s'il y a des modifications
git status --porcelain > temp_status.txt
for /f %%i in ("temp_status.txt") do set size=%%~zi
del temp_status.txt

if %size% gtr 0 (
    echo 📤 Modifications detectees. Commit en cours...
    
    set /p commit_message="Message de commit (par defaut: Deploy to Vercel): "
    if "%commit_message%"=="" set commit_message=Deploy to Vercel
    
    git add .
    git commit -m "%commit_message%"
    
    echo ✅ Commit cree
) else (
    echo ✅ Aucune modification a commiter
)

echo.
echo ⬆️ Push vers GitHub...
git push origin main

if errorlevel 1 (
    echo ❌ Push echoue. Verifiez votre configuration Git.
    pause
    exit /b 1
)

echo ✅ Push reussi
echo.

echo.
echo 🎉 DEPLOIEMENT LANCE !
echo =================================
echo 📍 Votre app sera disponible sur :
echo    https://twise-feedback.vercel.app
echo.
echo 📊 Admin panel :
echo    https://twise-feedback.vercel.app/admin
echo.
echo ⏱️ Le deploiement prend generalement 2-3 minutes
echo 🔗 Suivez le progres sur : https://vercel.com/dashboard
echo.
echo ✨ Deploiement automatique configure !
echo    Chaque push sur 'main' declenchera un nouveau deploiement
echo.
pause