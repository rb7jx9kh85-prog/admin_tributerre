import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Wine, WineInput } from '../types/wine'

const winesCollection = collection(db, 'wines')

export function subscribeToWines(callback: (wines: Wine[]) => void) {
  const q = query(winesCollection, orderBy('order', 'asc'))
  return onSnapshot(q, (snapshot) => {
    const wines = snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as WineInput),
    }))
    callback(wines)
  })
}

export function createWine(data: WineInput) {
  return addDoc(winesCollection, data)
}

export function updateWine(id: string, data: Partial<WineInput>) {
  return updateDoc(doc(db, 'wines', id), data)
}

export function deleteWine(id: string) {
  return deleteDoc(doc(db, 'wines', id))
}
