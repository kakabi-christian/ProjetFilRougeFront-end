// src/services/paiementService.js
import api from './api.js'; // Assure-toi que le chemin et l'extension sont corrects

/**
 * Créer un paiement et générer le reçu
 * @param {Object} paiementData
 */
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

/**
 * Récupérer un reçu par email (fonction "j'ai oublié mon numéro de reçu")
 * @param {string} email
 */
export const findRecuByEmail = async (email) => {
  console.log('[findRecuByEmail] Recherche du reçu pour email :', email);

  try {
    const response = await api.post('/paiement/recu/forgot', { email });
    console.log('[findRecuByEmail] Réponse reçue :', response.data);
    return response.data; // reçu complet avec QR Code
  } catch (error) {
    console.error('[findRecuByEmail] Erreur lors de la recherche du reçu :', error);
    if (error.response) {
      console.error('[findRecuByEmail] Détails de la réponse erreur :', error.response.data);
      console.error('[findRecuByEmail] Status code :', error.response.status);
    }
    throw error;
  } finally {
    console.log('[findRecuByEmail] Fin de la fonction findRecuByEmail.');
  }
};
