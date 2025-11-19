// src/services/userService.js
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
  setDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { getAuth } from 'firebase/auth';

class UserService {
  /**
   * Obtener perfil completo del usuario
   * @param {string} uid
   * @returns {Promise<Object>}
   */
  async getUserProfile(uid) {
    try {
      const docRef = doc(firestore, 'users', uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        throw new Error('Perfil de usuario no encontrado');
      }
      
      return {
        uid: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      throw error;
    }
  }

  /**
   * Actualizar perfil básico del usuario
   * @param {string} uid
   * @param {Object} perfilData
   * @returns {Promise<void>}
   */
  async updateUserProfile(uid, perfilData) {
    try {
      const docRef = doc(firestore, 'users', uid);
      
      await updateDoc(docRef, {
        perfil: {
          ...perfilData
        },
        ultimaActualizacion: serverTimestamp()
      });
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  }

  /**
   * Completar onboarding del usuario
   * @param {string} uid
   * @param {Object} onboardingData
   * @returns {Promise<void>}
   */
  async completeOnboarding(uid, onboardingData) {
    try {
      const {
        objetivo,
        nivelExperiencia,
        diasPorSemana,
        duracionSesion,
        peso,
        altura,
        edad,
        genero
      } = onboardingData;

      // Calcular requisitos nutricionales (IMC y metabolismo basal simplificado)
      const imc = peso / ((altura / 100) ** 2);
      const metabolismoBasal = this._calcularMetabolismoBasal(peso, altura, edad, genero);
      
      // Factor multiplicador por actividad
      const factorActividad = {
        'Principiante': 1.2,
        'Intermedio': 1.55,
        'Avanzado': 1.75
      };

      const calorasDiarias = Math.round(metabolismoBasal * (factorActividad[nivelExperiencia] || 1.5));

      // Distribución de macronutrientes
      const proteinas = Math.round((peso * 1.6)); // 1.6g por kg de peso
      const grasas = Math.round((calorasDiarias * 0.25) / 9); // 25% de calorías
      const carbohidratos = Math.round(((calorasDiarias - (proteinas * 4 + grasas * 9)) / 4));

      const docRef = doc(firestore, 'users', uid);
      
      await updateDoc(docRef, {
        perfil: {
          objetivo,
          nivelExperiencia,
          diasPorSemana,
          duracionSesion,
          peso,
          altura,
          edad,
          genero,
          imc: parseFloat(imc.toFixed(1))
        },
        requisitosNutricionales: {
          calorias: calorasDiarias,
          proteinas,
          carbohidratos,
          grasas,
          agua: peso * 0.03 // 30ml por kg
        },
        'plan-reto': {
          retoDias: 45,
          diaActual: 1,
          fechaInicio: serverTimestamp(),
          diasCompletados: [],
          estado: 'En progreso',
          logrosDesbloqueados: []
        },
        ultimaActualizacion: serverTimestamp()
      });

      // Inicializar progreso del día 1
      await this._crearRegistroProgresoDelDia(uid);

    } catch (error) {
      console.error('Error al completar onboarding:', error);
      throw error;
    }
  }

  /**
   * Registrar progreso diario
   * @param {string} uid
   * @param {string} fecha (YYYY-MM-DD)
   * @param {Object} datosDia
   * @returns {Promise<void>}
   */
  async registrarProgresoDelDia(uid, fecha, datosDia) {
    try {
      const docRef = doc(firestore, 'users', uid, 'progreso', fecha);
      
      await setDoc(docRef, {
        ...datosDia,
        timestamp: serverTimestamp()
      }, { merge: true });

    } catch (error) {
      console.error('Error al registrar progreso:', error);
      throw error;
    }
  }

  /**
   * Obtener progreso de los últimos 30 días
   * @param {string} uid
   * @returns {Promise<Array>}
   */
  async getProgresoUltimos30Dias(uid) {
    try {
      const fecha30DiasAtras = new Date();
      fecha30DiasAtras.setDate(fecha30DiasAtras.getDate() - 30);

      const q = query(
        collection(firestore, 'users', uid, 'progreso'),
        where('timestamp', '>=', fecha30DiasAtras),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        fecha: doc.id,
        ...doc.data()
      }));

    } catch (error) {
      console.error('Error al obtener progreso:', error);
      throw error;
    }
  }

  /**
   * Actualizar peso usuario
   * @param {string} uid
   * @param {number} nuevoPeso
   * @returns {Promise<void>}
   */
  async actualizarPeso(uid, nuevoPeso) {
    try {
      const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      // Actualizar peso en perfil
      await updateDoc(doc(firestore, 'users', uid), {
        'perfil.peso': nuevoPeso,
        ultimaActualizacion: serverTimestamp()
      });

      // Registrar en progreso
      await this.registrarProgresoDelDia(uid, fecha, {
        pesoActual: nuevoPeso
      });

    } catch (error) {
      console.error('Error al actualizar peso:', error);
      throw error;
    }
  }

  /**
   * Calculo simplificado de metabolismo basal (Harris-Benedict)
   * @private
   */
  _calcularMetabolismoBasal(peso, altura, edad, genero) {
    let teb;
    
    if (genero === 'M') {
      teb = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * edad);
    } else {
      teb = 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * edad);
    }
    
    return Math.round(teb);
  }

  /**
   * Crear registro de progreso inicial
   * @private
   */
  async _crearRegistroProgresoDelDia(uid) {
    try {
      const hoy = new Date().toISOString().split('T')[0];
      const docRef = doc(firestore, 'users', uid, 'progreso', hoy);
      
      await setDoc(docRef, {
        pesoActual: null,
        calorasConsumidas: 0,
        caloriasBajadas: 0,
        tiempoEntrenamiento: 0,
        ejerciciosCompletados: 0,
        agua: 0,
        energia: 5,
        sueno: 0,
        timestamp: serverTimestamp()
      }, { merge: true });

    } catch (error) {
      console.error('Error al crear registro de progreso:', error);
      throw error;
    }
  }
}

export default new UserService();
