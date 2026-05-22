import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyA232FKk0GCLZRBSAZCyVKhYOlpDJZb9nY",
  authDomain: "organizador-pendientes.firebaseapp.com",
  projectId: "organizador-pendientes",
  storageBucket: "organizador-pendientes.firebasestorage.app",
  messagingSenderId: "1092307840247",
  appId: "1:1092307840247:web:16332870e22e25703f77f2"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app)
