import { useState, useEffect } from 'react'
import {
  collection, addDoc, deleteDoc, doc,
  query, where, orderBy, onSnapshot, serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'

export function useNotes(userId) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const q = query(
      collection(db, 'notes'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setNotes(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [userId])

  const addNote = async (note) => {
    await addDoc(collection(db, 'notes'), {
      ...note,
      userId,
      createdAt: serverTimestamp()
    })
  }

  const deleteNote = async (id) => {
    await deleteDoc(doc(db, 'notes', id))
  }

  return { notes, loading, addNote, deleteNote }
}
