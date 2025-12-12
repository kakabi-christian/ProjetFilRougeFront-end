// src/services/concoursService.js
import api from './api.js';

/**
 * Récupérer tous les concours
 */
export const getConcours = async () => {
  console.log('[getConcours] Début de la récupération des concours...');
  try {
    console.log('[getConcours] Appel de l\'API /concours...');
    const response = await api.get('/concours');
    console.log('[getConcours] Réponse reçue de l\'API :', response);
    console.log('[getConcours] Données extraites :', response.data);
    return response.data;
  } catch (error) {
    console.error('[getConcours] Erreur lors de la récupération des concours :', error);
    if (error.response) {
      console.error('[getConcours] Détails de la réponse erreur :', error.response.data);
      console.error('[getConcours] Status code :', error.response.status);
    }
    throw error;
  } finally {
    console.log('[getConcours] Fin de la fonction getConcours.');
  }
};

/**
 * Récupérer un concours par ID
 * @param {string} id - ID du concours
 */
export const getConcoursById = async (id) => {
  console.log(`[getConcoursById] Début de la récupération du concours avec ID : ${id}`);
  try {
    console.log(`[getConcoursById] Appel de l'API /concours/${id}...`);
    const response = await api.get(`/concours/${id}`);
    console.log(`[getConcoursById] Réponse reçue de l'API :`, response);
    console.log(`[getConcoursById] Données extraites :`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[getConcoursById] Erreur lors de la récupération du concours ${id} :`, error);
    if (error.response) {
      console.error(`[getConcoursById] Détails de la réponse erreur :`, error.response.data);
      console.error(`[getConcoursById] Status code :`, error.response.status);
    }
    throw error;
  } finally {
    console.log(`[getConcoursById] Fin de la fonction getConcoursById pour ID : ${id}`);
  }
};
