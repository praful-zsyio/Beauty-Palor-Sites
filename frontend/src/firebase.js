// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile as updateFirebaseProfile
} from "firebase/auth";

// Your web app's Firebase configuration
export const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAYHnsNfXkYwP-JLvXAxN2kcXOuEgnp7Ds",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "beauty-paloir.firebaseapp.com",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "beauty-paloir",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "beauty-paloir.firebasestorage.app",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "411515441199",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:411515441199:web:914247551bbd69031776da",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-4RZC5JZQ45"
};

// VAPID Web Push Key
export const FIREBASE_VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BF0f9rGlXdMqwa0NbNZfxpOcyGVK7m0ojb-9DCYkIAlF6bOJIqmPQyMs0v-7rEipTorYSMq8aoXV187_eiz6i3k";

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Analytics safely
let analyticsInstance = null;
if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
        if (supported) {
            analyticsInstance = getAnalytics(app);
        }
    }).catch(() => {
        // Analytics not supported in this environment
    });
}
export const analytics = analyticsInstance;

// Initialize Firebase Auth & Google Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Request standard profile & email scopes
googleProvider.setCustomParameters({ prompt: 'select_account' });

// 1-Click Google Sign-In (Primary Authentication)
export const firebaseLoginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const token = await result.user.getIdToken();
    return { user: result.user, token };
};

// Email & Password Auth Helpers
export const firebaseRegisterUser = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && userCredential.user) {
        await updateFirebaseProfile(userCredential.user, { displayName });
    }
    const token = await userCredential.user.getIdToken();
    return { user: userCredential.user, token };
};

export const firebaseLoginUser = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    return { user: userCredential.user, token };
};

export const firebaseLogout = async () => {
    return await signOut(auth);
};

export default app;
