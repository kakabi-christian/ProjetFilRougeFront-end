import api from './api.js';

/**
 * Récupérer tous les concours avec pagination et recherche
 */
export const getConcours = async (params = {}) => {
  console.log('[getConcours] Début avec paramètres :', params);
  try {
    const response = await api.get('/concours', { params });
    console.log('[getConcours] Réponse API reçue :', response.data);
    return response.data;
  } catch (error) {
    console.error('[getConcours] Erreur :', error);
    throw error;
  }
};

/**
 * Récupérer un concours par ID
 */
export const getConcoursById = async (id) => {
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
 * @param {Object} data - { code, intitule, montant, anneeId, sessionId, pieceDossierIds }
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

/**
 * --- MÉTHODES UTILES POUR LE FORMULAIRE DE CRÉATION ---
 */

/**
 * Récupérer les données nécessaires pour remplir le formulaire (Années, Sessions, Pièces)
 * On utilise Promise.all pour charger les 3 listes en parallèle
 */
export const getFormDataRequired = async () => {
  try {
    const [annees, sessions, pieces] = await Promise.all([
      api.get('/annee-academique'),
      api.get('/session'),
      api.get('/pieces-dossier')
    ]);

    return {
      annees: annees.data.data || annees.data, // Gère si le backend renvoie {data: []} ou []
      sessions: sessions.data.data || sessions.data,
      pieces: pieces.data
    };
  } catch (error) {
    console.error('[getFormDataRequired] Erreur de chargement des dépendances :', error);
    throw error;
  }
};