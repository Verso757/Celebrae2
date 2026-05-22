import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyCA2RWRpg-4TMMSdXCrCGixkQt05rC9egg",
  authDomain: "celebrae-21fd8.firebaseapp.com",
  projectId: "celebrae-21fd8",
  storageBucket: "celebrae-21fd8.firebasestorage.app",
  messagingSenderId: "683647744563",
  appId: "1:683647744563:web:48d1aa6d0048ae939e4146",
  measurementId: "G-NM5E8YSX77"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        console.error('Login error', error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout error', error);
        throw error;
    }
}
