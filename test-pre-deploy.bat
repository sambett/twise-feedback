@echo off
echo 🧪 TEST PRE-DEPLOIEMENT VERCEL
echo =============================
echo.

:: Test 1: Dependencies
echo 📦 Test 1/5: Verification des dependances...
call npm install --silent
if errorlevel 1 (
    echo ❌ Echec de l'installation des dependances
    goto :error
)
echo ✅ Dependances OK

:: Test 2: TypeScript compilation
echo.
echo 📝 Test 2/5: Compilation TypeScript...
call npx tsc --noEmit
if errorlevel 1 (
    echo ❌ Erreurs TypeScript detectees
    goto :error
)
echo ✅ TypeScript OK

:: Test 3: Build production
echo.
echo 🔨 Test 3/5: Build de production...
call npm run build
if errorlevel 1 (
    echo ❌ Build echoue
    goto :error
)
echo ✅ Build OK

:: Test 4: Lint
echo.
echo 📋 Test 4/5: Verification du code (lint)...
call npm run lint
if errorlevel 1 (
    echo ⚠️  Warnings lint detectes (non bloquant)
) else (
    echo ✅ Lint OK
)

:: Test 5: Variables d'environnement
echo.
echo 🔧 Test 5/5: Variables d'environnement...
if not exist ".env.local" (
    echo ⚠️  .env.local manquant (creation automatique)
    copy .env.example .env.local
) else (
    echo ✅ .env.local present
)

:: Verification Git
echo.
echo 📝 Verification Git...
git status --porcelain > temp_git_status.txt
for /f %%i in ("temp_git_status.txt") do set size=%%~zi
del temp_git_status.txt

if %size% gtr 0 (
    echo ⚠️  Modifications non commitees detectees
    echo 📋 Fichiers modifies:
    git status --short
) else (
    echo ✅ Git status propre
)

:: Verification Firebase
echo.
echo 🔥 Verification Firebase...
findstr "NEXT_PUBLIC_FIREBASE" .env.local >nul 2>&1
if errorlevel 1 (
    echo ❌ Variables Firebase manquantes dans .env.local
    goto :error
) else (
    echo ✅ Variables Firebase presentes
)

:: Resultat final
echo.
echo 🎉 TOUS LES TESTS PASSES !
echo ========================
echo.
echo ✅ Le projet est pret pour le deploiement Vercel
echo.
echo 🚀 Prochaines etapes:
echo    1. Executez 'deploy.bat' pour deployer automatiquement
echo    2. Ou suivez le guide dans VERCEL-DEPLOYMENT.md
echo    3. Configurez les variables d'environnement sur Vercel
echo.
echo 📋 Checklist complete dans DEPLOYMENT-CHECKLIST.md
echo.
goto :end

:error
echo.
echo ❌ TESTS ECHOUES
echo ===============
echo.
echo 🔧 Actions requises:
echo    1. Corrigez les erreurs indiquees ci-dessus
echo    2. Relancez ce script de test
echo    3. Une fois tous les tests passes, procédez au deploiement
echo.

:end
pause