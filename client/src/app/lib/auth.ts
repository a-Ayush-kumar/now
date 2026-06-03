import {
  signInWithPopup,
  signOut,
  signInAnonymously,
} from "firebase/auth"
import { auth, googleProvider } from "./firebase";

export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider)
}

export const loginAsGuest = async () => {
  return await signInAnonymously(auth)
}

export const logout = async () => {
  return await signOut(auth)
}