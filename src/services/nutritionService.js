// src/services/nutritionService.js
import {
  doc,
  setDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

class NutritionService {
  /**
   * Agregar comida a un horario específico del día
   * @param {string} uid
   * @param {string} fecha (YYYY-MM-DD)
   * @param {string} horario ("desayuno", "almuerzo", "merienda", "cena")
   * @param {Object} comida
   * @returns {Promise<Object>}
   */
  async agregarComida(uid, fecha, horario, comida) {
    try {
      const docRef = doc(firestore, 'users', uid, 'comidas', fecha);
      
      // Obtener comidas actuales del día
      const comidasDoc = await getDocs(query(
        collection(firestore, 'users', uid, 'comidas'),
        where('fecha', '==', fecha)
      ));

      let comidasDelDia = {};
      if (comidasDoc.docs.length > 0) {
        comidasDelDia = comidasDoc.docs[0].data();
      }

      // Agregar nueva comida
      if (!comidasDelDia[horario]) {
        comidasDelDia[horario] = [];
      }

      const comidasHorario = comidasDelDia[horario];
      const comidaConId = {
        id: Date.now().toString(),
        ...comida,
        horaRegistrada: new Date().toISOString()
      };

      comidasHorario.push(comidaConId);

      // Guardar en Firestore
      await setDoc(docRef, comidasDelDia, { merge: true });

      // Actualizar totales nutricionales del día
      await this._actualizarTotalesNutricionales(uid, fecha);

      return comidaConId;

    } catch (error) {
      console.error('Error al agregar comida:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las comidas de un día
   * @param {string} uid
   * @param {string} fecha (YYYY-MM-DD)
   * @returns {Promise<Object>}
   */
  async obtenerComidasDelDia(uid, fecha) {
    try {
      const docRef = doc(firestore, 'users', uid, 'comidas', fecha);
      const docSnap = await getDocs(query(
        collection(firestore, 'users', uid, 'comidas'),
        where('fecha', '==', fecha)
      ));

      if (docSnap.docs.length > 0) {
        return docSnap.docs[0].data();
      }

      return {
        desayuno: [],
        almuerzo: [],
        merienda: [],
        cena: []
      };

    } catch (error) {
      console.error('Error al obtener comidas:', error);
      throw error;
    }
  }

  /**
   * Eliminar comida específica
   * @param {string} uid
   * @param {string} fecha
   * @param {string} horario
   * @param {string} idComida
   * @returns {Promise<void>}
   */
  async eliminarComida(uid, fecha, horario, idComida) {
    try {
      const docRef = doc(firestore, 'users', uid, 'comidas', fecha);
      
      // Obtener comidas actuales
      const comidasSnap = await getDocs(query(
        collection(firestore, 'users', uid, 'comidas'),
        where('fecha', '==', fecha)
      ));

      if (comidasSnap.docs.length > 0) {
        const comidasDelDia = comidasSnap.docs[0].data();
        
        // Filtrar la comida a eliminar
        comidasDelDia[horario] = comidasDelDia[horario].filter(c => c.id !== idComida);
        
        // Guardar cambios
        await setDoc(docRef, comidasDelDia, { merge: true });
        
        // Actualizar totales
        await this._actualizarTotalesNutricionales(uid, fecha);
      }

    } catch (error) {
      console.error('Error al eliminar comida:', error);
      throw error;
    }
  }

  /**
   * Calcular y actualizar totales nutricionales del día
   * @private
   */
  async _actualizarTotalesNutricionales(uid, fecha) {
    try {
      const comidasSnap = await getDocs(query(
        collection(firestore, 'users', uid, 'comidas'),
        where('fecha', '==', fecha)
      ));

      if (comidasSnap.docs.length === 0) return;

      const comidasDelDia = comidasSnap.docs[0].data();

      let totalCalorias = 0;
      let totalProteinas = 0;
      let totalCarbohidratos = 0;
      let totalGrasas = 0;

      // Iterar por todos los horarios
      ['desayuno', 'almuerzo', 'merienda', 'cena'].forEach(horario => {
        const comidas = comidasDelDia[horario] || [];
        
        comidas.forEach(comida => {
          totalCalorias += comida.calorias || 0;
          totalProteinas += comida.proteinas || 0;
          totalCarbohidratos += comida.carbohidratos || 0;
          totalGrasas += comida.grasas || 0;
        });
      });

      // Actualizar en progreso del día
      await updateDoc(doc(firestore, 'users', uid, 'progreso', fecha), {
        calorasConsumidas: totalCalorias,
        totalesNutricionales: {
          proteinas: Math.round(totalProteinas),
          carbohidratos: Math.round(totalCarbohidratos),
          grasas: Math.round(totalGrasas)
        },
        ultimaActualizacion: serverTimestamp()
      });

    } catch (error) {
      console.error('Error al actualizar totales nutricionales:', error);
    }
  }

  /**
   * Obtener banco de alimentos
   * @returns {Promise<Array>}
   */
  async obtenerAlimentos() {
    try {
      const snapshot = await getDocs(collection(firestore, 'alimentos'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error al obtener alimentos:', error);
      throw error;
    }
  }

  /**
   * Buscar alimentos por término
   * @param {string} termino
   * @returns {Promise<Array>}
   */
  async buscarAlimentos(termino) {
    try {
      const snapshot = await getDocs(collection(firestore, 'alimentos'));
      
      const alimentos = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(alimento => 
          alimento.nombre.toLowerCase().includes(termino.toLowerCase())
        );

      return alimentos;
    } catch (error) {
      console.error('Error al buscar alimentos:', error);
      throw error;
    }
  }
}

export default new NutritionService();
