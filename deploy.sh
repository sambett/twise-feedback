#!/bin/bash

echo "🚀 DÉPLOIEMENT AUTOMATIQUE VERCEL"
echo "================================="

# Vérification des prérequis
echo "📋 Vérification des prérequis..."

# Vérifier si Git est installé
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé"
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

echo "✅ Prérequis OK"

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# Test du build local
echo "🔨 Test du build..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build échoué. Corrigez les erreurs avant de déployer."
    exit 1
fi

echo "✅ Build réussi"

# Vérification du statut Git
echo "📝 Vérification des modifications Git..."
if [[ -n $(git status --porcelain) ]]; then
    echo "📤 Modifications détectées. Commit en cours..."
    
    # Demander un message de commit
    read -p "Message de commit (par défaut: 'Deploy to Vercel'): " commit_message
    commit_message=${commit_message:-"Deploy to Vercel"}
    
    git add .
    git commit -m "$commit_message"
    
    echo "✅ Commit créé"
else
    echo "✅ Aucune modification à commiter"
fi

# Push vers GitHub
echo "⬆️ Push vers GitHub..."
git push origin main

if [ $? -ne 0 ]; then
    echo "❌ Push échoué. Vérifiez votre configuration Git."
    exit 1
fi

echo "✅ Push réussi"

# Information finale
echo ""
echo "🎉 DÉPLOIEMENT LANCÉ !"
echo "================================="
echo "📍 Votre app sera disponible sur :"
echo "   https://twise-feedback.vercel.app"
echo ""
echo "📊 Admin panel :"
echo "   https://twise-feedback.vercel.app/admin"
echo ""
echo "⏱️ Le déploiement prend généralement 2-3 minutes"
echo "🔗 Suivez le progrès sur : https://vercel.com/dashboard"
echo ""
echo "✨ Déploiement automatique configuré !"
echo "   Chaque push sur 'main' déclenchera un nouveau déploiement"