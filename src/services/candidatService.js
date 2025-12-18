import api from './api';

/**
 * Service pour gérer les opérations liées aux candidats
 */
const candidatService = {

  /**
   * Récupère la liste détaillée des candidats avec filtres et pagination
   */
  getDetailedList: async (params = {}) => {
    console.log('📥 [candidatService] getDetailedList() appelé');
    console.debug('🔍 Paramètres reçus:', params);

    const finalParams = {
      search: params.search || undefined,
      filiereId: params.filiereId || undefined,
      sexe: params.sexe || undefined,
      page: params.page || 1,
      limit: params.limit || 10
    };

    console.debug('🧩 Paramètres envoyés à l’API:', finalParams);

    try {
      console.log('🚀 Requête GET /candidates/list-detailed en cours...');

      const response = await api.get('/candidates/list-detailed', {
        params: finalParams
      });

      console.log('✅ Réponse API reçue');
      console.debug('📦 Status HTTP:', response.status);
      console.debug('📦 Données reçues:', response.data);

      return response.data;

    } catch (error) {
      console.error('❌ Erreur getDetailedList');

      if (error.response) {
        console.error('📛 Status:', error.response.status);
        console.error('📛 Data:', error.response.data);
      } else if (error.request) {
        console.error('📡 Aucune réponse du serveur:', error.request);
      } else {
        console.error('⚠️ Erreur inconnue:', error.message);
      }

      throw error;
    }
  },

  /**
   * Récupère toutes les filières
   */
  getFilieres: async () => {
    console.log('📥 [candidatService] getFilieres() appelé');

    try {
      console.log('🚀 Requête GET /filieres');

      const response = await api.get('/filieres');

      console.log('✅ Filières récupérées');
      console.debug('📦 Nombre de filières:', response.data?.length);
      console.debug('📦 Données:', response.data);

      return response.data;

    } catch (error) {
      console.error('❌ Erreur getFilieres');

      if (error.response) {
        console.error('📛 Status:', error.response.status);
        console.error('📛 Data:', error.response.data);
      } else {
        console.error('⚠️ Erreur:', error.message);
      }

      throw error;
    }
  },

  /**
   * Récupère les centres d'examen
   */
  getCentresExamen: async () => {
    console.log('📥 [candidatService] getCentresExamen() appelé');

    try {
      console.log('🚀 Requête GET /centre-examen');

      const response = await api.get('/centre-examen');

      console.log('✅ Centres d’examen récupérés');
      console.debug('📦 Nombre de centres:', response.data?.length);
      console.debug('📦 Données:', response.data);

      return response.data;

    } catch (error) {
      console.error('❌ Erreur getCentresExamen');

      if (error.response) {
        console.error('📛 Status:', error.response.status);
        console.error('📛 Data:', error.response.data);
      } else {
        console.error('⚠️ Erreur:', error.message);
      }

      throw error;
    }
  }
};

export default candidatService;
