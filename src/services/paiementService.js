// src/services/paiementService.js
import api from './api';

export const createPaiement = async (paiementData) => {
  console.log('[createPaiement] Début de la création du paiement...');
  console.log('[createPaiement] Données envoyées :', paiementData);

  try {
    console.log('[createPaiement] Appel de l\'API /paiement...');
    const response = await api.post('/paiement', paiementData);
    console.log('[createPaiement] Réponse reçue de l\'API :', response);
    console.log('[createPaiement] Données extraites :', response.data); // { paiement, recu }
    return response.data;
  } catch (error) {
    console.error('[createPaiement] Erreur lors du paiement :', error);
    if (error.response) {
      console.error('[createPaiement] Détails de la réponse erreur :', error.response.data);
      console.error('[createPaiement] Status code :', error.response.status);
    }
    throw error;
  } finally {
    console.log('[createPaiement] Fin de la fonction createPaiement.');
  }
};
