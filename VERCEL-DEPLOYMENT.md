# 🚀 DÉPLOIEMENT VERCEL - GUIDE COMPLET

## 🔧 PRÉREQUIS

1. **Compte Vercel** : [https://vercel.com](https://vercel.com)
2. **Compte GitHub** : Repository du projet sur GitHub
3. **Firebase configuré** : Base de données Firebase active

## 📦 ÉTAPES DE DÉPLOIEMENT

### 1. Préparation du code

```bash
# Assurez-vous que tout fonctionne localement
npm run build
npm run start
```

### 2. Pousser vers GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 3. Connexion à Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub
3. Cliquez sur **"Import Project"**
4. Sélectionnez votre repository `twise`

### 4. Configuration des variables d'environnement

Dans les paramètres Vercel, ajoutez ces variables :

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

### 5. Configuration du build

Vercel détectera automatiquement Next.js. Configuration par défaut :
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 6. Déploiement

1. Cliquez sur **"Deploy"**
2. Attendez le build (2-3 minutes)
3. Votre app sera disponible sur `https://twise-feedback.vercel.app`

## 🔄 DÉPLOIEMENT AUTOMATIQUE

Chaque push sur la branche `main` déclenchera automatiquement un nouveau déploiement.

## 🛠️ TROUBLESHOOTING

### Erreur de build
```bash
# Testez localement d'abord
npm run build
```

### Variables d'environnement manquantes
- Vérifiez dans Settings > Environment Variables sur Vercel
- Assurez-vous que tous les noms commencent par `NEXT_PUBLIC_`

### Firebase Database Rules
Mettez à jour vos règles Firebase pour autoriser votre domaine Vercel :

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

## 📱 URLS DE PRODUCTION

- **App principale** : `https://twise-feedback.vercel.app`
- **Admin** : `https://twise-feedback.vercel.app/admin`
- **Event TWISE** : `https://twise-feedback.vercel.app/event/twise-night`

## 🎯 QR CODES POUR PRODUCTION

Après déploiement, vos QR codes pointeront automatiquement vers :
- `https://twise-feedback.vercel.app/event/[eventId]`

## ⚡ COMMANDES RAPIDES

```bash
# Installation des dépendances
npm install

# Build de production
npm run build

# Démarrage local
npm run dev

# Lint du code
npm run lint
```

## 🔗 LIENS UTILES

- [Documentation Vercel](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)