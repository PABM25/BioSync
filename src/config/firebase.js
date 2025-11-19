// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ REEMPLAZAR CON TUS CREDENCIALES DE FIREBASE
// Obtener en: Firebase Console → Configuración del Proyecto → Aplicaciones Web
const firebaseConfig = {
  apiKey: "AIzaSyDfp8GR667Dilvj_DcXEz9Snv1kg5FUNcA",
  authDomain: "bio-sync-47237.firebaseapp.com",
  projectId: "bio-sync-47237",
  storageBucket: "bio-sync-47237.firebasestorage.app",
  messagingSenderId: "629850559608",
  appId: "1:629850559608:web:341d52e01acf3321e0098d",
  measurementId: "G-RHFD8DBZQP"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Autenticación con persistencia en React Native
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Firestore Database
const firestore = getFirestore(app);

// Storage para imágenes
const storage = getStorage(app);

export { app, auth, firestore, storage };
