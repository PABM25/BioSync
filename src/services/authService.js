// src/services/authService.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  updateEmail,
  updatePassword,
  getAuth
} from 'firebase/auth';
import { auth, firestore } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

class AuthService {
  /**
   * Registrar nuevo usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña (mín 8 caracteres)
   * @param {string} displayName - Nombre completo
   * @returns {Promise<Object>} Usuario autenticado
   */
  async register(email, password, displayName) {
    try {
      // Crear usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Actualizar displayName
      await updateProfile(user, { displayName });

      // Crear documento de usuario en Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        perfil: {
          objetivo: null, // Se completa en onboarding
          nivelExperiencia: null,
          diasPorSemana: null,
          duracionSesion: null,
          peso: null,
          altura: null,
          edad: null,
          genero: null,
          avatarURL: null
        },
        requisitosNutricionales: {
          calorias: 2000,
          proteinas: 50,
          carbohidratos: 250,
          grasas: 65,
          agua: 2
        },
        fechaRegistro: serverTimestamp(),
        ultimaActualizacion: serverTimestamp()
      });

      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      };
    } catch (error) {
      console.error('Error en registro:', error);
      throw this._handleAuthError(error);
    }
  }

  /**
   * Iniciar sesión
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} Usuario autenticado
   */
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName
      };
    } catch (error) {
      console.error('Error en login:', error);
      throw this._handleAuthError(error);
    }
  }

  /**
   * Cerrar sesión
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  }

  /**
   * Listener de cambios de autenticación
   * @param {Function} callback - Función a ejecutar con el estado del usuario
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Obtener datos completos del usuario desde Firestore
        const userDoc = await getDoc(doc(firestore, 'users', user.uid));
        callback({
          ...user,
          ...userDoc.data()
        });
      } else {
        callback(null);
      }
    });
  }

  /**
   * Enviar email de recuperación de contraseña
   * @param {string} email
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw this._handleAuthError(error);
    }
  }

  /**
   * Actualizar email
   * @param {string} newEmail
   * @returns {Promise<void>}
   */
  async updateUserEmail(newEmail) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No hay usuario autenticado');
      
      await updateEmail(user, newEmail);
      await updateDoc(doc(firestore, 'users', user.uid), {
        email: newEmail,
        ultimaActualizacion: serverTimestamp()
      });
    } catch (error) {
      throw this._handleAuthError(error);
    }
  }

  /**
   * Actualizar contraseña
   * @param {string} newPassword
   * @returns {Promise<void>}
   */
  async updateUserPassword(newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No hay usuario autenticado');
      
      await updatePassword(user, newPassword);
    } catch (error) {
      throw this._handleAuthError(error);
    }
  }

  /**
   * Obtener usuario actual
   * @returns {Object|null}
   */
  getCurrentUser() {
    return auth.currentUser;
  }

  /**
   * Manejo centralizado de errores de autenticación
   * @private
   */
  _handleAuthError(error) {
    const errorMessages = {
      'auth/email-already-in-use': 'Este email ya está registrado',
      'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres',
      'auth/invalid-email': 'Email inválido',
      'auth/user-not-found': 'Usuario no encontrado',
      'auth/wrong-password': 'Contraseña incorrecta',
      'auth/user-disabled': 'Esta cuenta ha sido deshabilitada',
      'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      'auth/account-exists-with-different-credential': 'Una cuenta existe con diferentes credenciales'
    };
    
    const message = errorMessages[error.code] || error.message;
    const err = new Error(message);
    err.code = error.code;
    return err;
  }
}

export default new AuthService();
