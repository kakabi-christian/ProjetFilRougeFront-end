import api from './api.js';

// ==================== ANNEES ====================
export const getAnnees = async () => {
  console.log('📡 [API] Appel : GET /annees');
  try {
    const response = await api.get('/annees');
    console.log('✅ [API] Années reçues :', response.data);
    return response;
  } catch (error) {
    console.error('❌ [API] Erreur getAnnees :', error);
    throw error;
  }
};

// ==================== DEPARTEMENTS ====================
export const getDepartements = async () => {
  console.log('📡 [API] Appel : GET /departements');
  try {
    const response = await api.get('/departements');
    console.log('✅ [API] Départements reçus :', response.data);
    return response;
  } catch (error) {
    console.error('❌ [API] Erreur getDepartements :', error);
    throw error;
  }
};

// ==================== FILIERES ====================
export const getFilieresByDepartement = async (id) => {
  console.log('📡 [API] Appel : GET /filieres/departement/', id);
  if (!id) {
    console.warn('⚠️ [API] ID département manquant');
  }

  try {
    const response = await api.get(`/filieres/departement/${id}`);
    console.log(
      `✅ [API] Filières reçues pour le département ${id} :`,
      response.data
    );
    return response;
  } catch (error) {
    console.error(
      `❌ [API] Erreur getFilieresByDepartement (id=${id}) :`,
      error
    );
    throw error;
  }
};

// ==================== EPREUVES PAR SPECIALITE ====================
export const getEpreuvesBySpecialite = async (specialiteId) => {
  console.log('📡 [API] Appel : GET /epreuves/specialite/', specialiteId);
  if (!specialiteId) {
    console.warn('⚠️ [API] ID spécialité manquant');
  }

  try {
    const response = await api.get(`/epreuves/specialite/${specialiteId}`);
    console.log(
      `✅ [API] Épreuves reçues pour la spécialité ${specialiteId} :`,
      response.data
    );
    return response;
  } catch (error) {
    console.error(
      `❌ [API] Erreur getEpreuvesBySpecialite (id=${specialiteId}) :`,
      error
    );
    throw error;
  }
};

// ==================== ARCHIVES ====================
export const getArchivesByEpreuve = async (id) => {
  console.log('📡 [API] Appel : GET /archives/epreuve/', id);
  if (!id) {
    console.warn('⚠️ [API] ID épreuve manquant');
  }

  try {
    const response = await api.get(`/archives/epreuve/${id}`);
    console.log(
      `✅ [API] Archives reçues pour l’épreuve ${id} :`,
      response.data
    );
    return response;
  } catch (error) {
    console.error(
      `❌ [API] Erreur getArchivesByEpreuve (id=${id}) :`,
      error
    );
    throw error;
  }
};
