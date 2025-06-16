# ✅ CHECKLIST DÉPLOIEMENT VERCEL

## 🔧 AVANT LE DÉPLOIEMENT

### Code
- [x] Build local réussi (`npm run build`)
- [x] Test local fonctionnel (`npm run dev`)
- [x] Toutes les erreurs TypeScript corrigées
- [x] API routes fonctionnelles
- [x] Variables d'environnement configurées

### Configuration
- [x] `vercel.json` créé
- [x] `next.config.ts` optimisé pour Vercel
- [x] `.env.local` configuré pour le développement
- [x] `.env.example` documenté
- [x] `.gitignore` à jour

### Firebase
- [x] Firebase Database Rules configurées
- [x] Variables d'environnement Firebase prêtes
- [x] Configuration Firebase utilise les env vars

## 🚀 DÉPLOIEMENT

### 1. Préparation
```bash
# Test final
npm run build
npm run start  # Tester en mode production
```

### 2. Git
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 3. Vercel Setup
1. Connecter le repo GitHub à Vercel
2. Configurer les variables d'environnement
3. Déployer

### 4. Variables Vercel (IMPORTANT!)
```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCeYDk4JYffPpwJXWD-edYqn9CjCpXtpUE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=twise-feedback.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://twise-feedback-default-rtdb.europe-west1.firebasedatabase.app
NEXT_PUBLIC_FIREBASE_PROJECT_ID=twise-feedback
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=twise-feedback.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=349226192684
NEXT_PUBLIC_FIREBASE_APP_ID=1:349226192684:web:1fa691d13cfbe6c8aee689
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-5YVC4K1SQ4
```

## 🧪 APRÈS LE DÉPLOIEMENT

### Tests de fonctionnalité
- [ ] Page d'accueil charge
- [ ] Admin panel accessible (`/admin`)
- [ ] Création d'événement fonctionne
- [ ] QR codes se génèrent
- [ ] Formulaires de feedback fonctionnent
- [ ] Firebase Database se met à jour
- [ ] API sentiment analysis fonctionne

### URLs à tester
- [ ] `https://twise-feedback.vercel.app/`
- [ ] `https://twise-feedback.vercel.app/admin`
- [ ] `https://twise-feedback.vercel.app/event/twise-night`
- [ ] `https://twise-feedback.vercel.app/api/analyze` (POST)

### Optimisations post-déploiement
- [ ] Configurer domaine custom (optionnel)
- [ ] Optimiser Firebase Security Rules
- [ ] Monitoring des performances
- [ ] Analytics (optionnel)

## 🛠️ COMMANDES RAPIDES

### Déploiement automatique
```bash
# Windows
deploy.bat

# Linux/Mac
chmod +x deploy.sh
./deploy.sh
```

### Debug
```bash
# Build local
npm run build

# Analyser le bundle
npm install -g @next/bundle-analyzer
ANALYZE=true npm run build
```

### Logs Vercel
```bash
# Installer Vercel CLI
npm i -g vercel

# Voir les logs
vercel logs
```

## 🎯 URLS FINALES

### Production
- **App**: https://twise-feedback.vercel.app
- **Admin**: https://twise-feedback.vercel.app/admin
- **TWISE Event**: https://twise-feedback.vercel.app/event/twise-night

### Développement
- **App**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **Backend**: http://localhost:5000 (si Python backend actif)

## 📞 SUPPORT

### En cas de problème
1. Vérifier les logs Vercel
2. Tester en local d'abord
3. Vérifier les variables d'environnement
4. Consulter la documentation Vercel

### Ressources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Console](https://console.firebase.google.com/)