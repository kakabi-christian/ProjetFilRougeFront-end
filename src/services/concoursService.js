import api from './api.js';

/**
 * Récupérer tous les concours avec pagination et recherche
 * @param {Object} params - { page, limit, search }
 */
export const getConcours = async (params = {}) => {
  console.log('[getConcours] Début avec paramètres :', params);
  try {
    // L'objet params est passé ici pour générer l'URL : /concours?page=1&limit=10...
    const response = await api.get('/concours', { params });
    console.log('[getConcours] Réponse API reçue :', response.data);
    return response.data;
  } catch (error) {
    console.error('[getConcours] Erreur :', error);
    throw error;
  } finally {
    console.log('[getConcours] Fin de l\'appel.');
  }
};

/**
 * Récupérer un concours par ID
 */
export const getConcoursById = async (id) => {
  console.log(`[getConcoursById] ID demandé : ${id}`);
  try {
    const response = await api.get(`/concours/${id}`);
    return response.data;
  } catch (error) {
    console.error(`[getConcoursById] Erreur ID ${id} :`, error);
    throw error;
  }
};

/**
 * Créer un concours
 */
export const createConcours = async (data) => {
  try {
    const response = await api.post('/concours', data);
    return response.data;
  } catch (error) {
    console.error('[createConcours] Erreur :', error);
    throw error;
  }
};

/**
 * Mettre à jour un concours
 */
export const updateConcours = async (id, data) => {
  try {
    const response = await api.patch(`/concours/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('[updateConcours] Erreur :', error);
    throw error;
  }
};

/**
 * Supprimer un concours
 */
export const deleteConcours = async (id) => {
  try {
    const response = await api.delete(`/concours/${id}`);
    return response.data;
  } catch (error) {
    console.error('[deleteConcours] Erreur :', error);
    throw error;
  }
};