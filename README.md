# Tributerre — Gestion des stocks

Application d'administration pour gérer le stock et la disponibilité des vins
affichés sur le site de commande (tributerre26.vercel.app). Ce dépôt est
indépendant du site : il communique uniquement avec le projet Firebase
`tributerre-gestion` (Auth + Firestore).

## Stack

- React + TypeScript + Vite
- React Router
- Firebase Authentication (email / mot de passe)
- Firestore (collection `wines`)

## Configuration

1. Copiez `.env.example` vers `.env` et renseignez les valeurs de votre
   configuration Firebase (Project settings > General > Your apps).
2. Dans la console Firebase, activez **Authentication > Sign-in method >
   Email/Password**.
3. Créez au moins un utilisateur admin dans **Authentication > Users**
   (ou via la console) — c'est ce compte qui se connectera à l'app.

## Règles Firestore recommandées

Seuls les utilisateurs authentifiés peuvent lire/écrire la collection `wines` :

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /wines/{wineId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

Si le site public (tributerre26.vercel.app) doit aussi lire le stock/la
disponibilité en direct depuis la même base, adaptez la règle pour autoriser
la lecture publique et restreindre l'écriture aux utilisateurs authentifiés :

```
match /wines/{wineId} {
  allow read: if true;
  allow write: if request.auth != null;
}
```

## Démarrer en local

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Fonctionnalités

- Connexion sécurisée par e-mail / mot de passe (Firebase Auth)
- Route protégée : redirection vers `/login` si non authentifié
- Liste des vins en temps réel (Firestore `onSnapshot`)
- Ajout / suppression d'un vin
- Ajustement du stock (+ / −)
- Bascule de la disponibilité (affichée ou non sur le site de commande)
