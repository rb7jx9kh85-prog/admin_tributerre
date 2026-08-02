// Seed script: creates the initial wine catalogue in Firestore.
//
// Usage:
//   SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD=yourpassword npm run seed
//
// Requires an existing Firebase Auth user (email/password) since the
// Firestore rules only allow authenticated writes. It signs in as that
// user, then upserts one document per wine (matched by name) so it's safe
// to run more than once.

import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
} from 'firebase/firestore'
import 'dotenv/config'

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const email = process.env.SEED_ADMIN_EMAIL
const password = process.env.SEED_ADMIN_PASSWORD

if (!email || !password) {
  console.error(
    'Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD env vars (an existing Firebase Auth user).',
  )
  process.exit(1)
}

const wines = [
  { name: 'Terre Rouge', category: 'Assemblage', vintage: 'MMXXII', volume: '75 cl', price: 25, stock: 12, available: true, order: 0 },
  { name: 'Terre N° 13', category: 'Merlot', vintage: 'VDP 2023', volume: '75 cl', price: 21, stock: 12, available: true, order: 1 },
  { name: 'Vieilles Vignes Gamay', category: 'AOC Leytron', vintage: '2025', volume: '75 cl', price: 18, stock: 12, available: true, order: 2 },
  { name: "Terre d'Automne", category: 'Assemblage', vintage: 'Vin de table', volume: '75 cl', price: 16, stock: 12, available: true, order: 3 },
  { name: 'Merlot Prestige', category: 'Prestige', vintage: '2022', volume: '75 cl', price: 32, stock: 12, available: true, order: 4 },
  { name: 'Terre de Rosée', category: 'Rosé', vintage: 'VPD 2024', volume: '50 cl', price: 15, stock: 12, available: true, order: 5 },
  { name: 'Terre Blanche', category: 'Assemblage blanc', vintage: 'MMXXII', volume: '75 cl', price: 19, stock: 12, available: true, order: 6 },
  { name: "L'Ardoisière", category: 'Blanc', vintage: 'Vin de pays', volume: '75 cl', price: 17, stock: 12, available: true, order: 7 },
  { name: 'Fendant', category: 'AOC', vintage: '2025', volume: '75 cl', price: 14, stock: 12, available: true, order: 8 },
  { name: 'Orange 2.4', category: 'Nature', vintage: 'Macération', volume: '50 cl', price: 24, stock: 12, available: true, order: 9 },
]

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)

await signInWithEmailAndPassword(auth, email, password)
console.log(`Signed in as ${email}`)

const winesCollection = collection(db, 'wines')

for (const wine of wines) {
  const existing = await getDocs(
    query(winesCollection, where('name', '==', wine.name)),
  )
  if (existing.empty) {
    await addDoc(winesCollection, wine)
    console.log(`Created: ${wine.name}`)
  } else {
    await updateDoc(existing.docs[0].ref, wine)
    console.log(`Updated: ${wine.name}`)
  }
}

console.log('Done.')
process.exit(0)
