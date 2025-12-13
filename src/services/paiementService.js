// src/services/paiementService.js
import api from './api.js';

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
 * 🔐 ÉTAPE 1 : Demander un code OTP pour récupérer le reçu
 * @param {string} email
 */
export const requestOtp = async (email) => {
  console.log('[requestOtp] Demande d\'OTP pour email :', email);

  try {
    const response = await api.post('/paiement/recu/request-otp', { email });
    console.log('[requestOtp] Réponse reçue :', response.data);
    return response.data; // { message, email }
  } catch (error) {
    console.error('[requestOtp] Erreur lors de la demande d\'OTP :', error);
    if (error.response) {
      console.error('[requestOtp] Détails de la réponse erreur :', error.response.data);
      console.error('[requestOtp] Status code :', error.response.status);
    }
    throw error;
  } finally {
    console.log('[requestOtp] Fin de la fonction requestOtp.');
  }
};

/**
 * 🔐 ÉTAPE 2 : Vérifier l'OTP et récupérer le reçu
 * @param {string} email
 * @param {string} code - Code OTP à 6 chiffres
 */
export const verifyOtpAndGetRecu = async (email, code) => {
  console.log('[verifyOtpAndGetRecu] Vérification OTP pour email :', email);
  console.log('[verifyOtpAndGetRecu] Code saisi :', code);

  try {
    const response = await api.post('/paiement/recu/verify-otp', { email, code });
    console.log('[verifyOtpAndGetRecu] Réponse reçue :', response.data);
    return response.data; // reçu complet avec QR Code
  } catch (error) {
    console.error('[verifyOtpAndGetRecu] Erreur lors de la vérification :', error);
    if (error.response) {
      console.error('[verifyOtpAndGetRecu] Détails de la réponse erreur :', error.response.data);
      console.error('[verifyOtpAndGetRecu] Status code :', error.response.status);
    }
    throw error;
  } finally {
    console.log('[verifyOtpAndGetRecu] Fin de la fonction verifyOtpAndGetRecu.');
  }
};

/**
 * ⚠️ DEPRECATED : Ancienne méthode sans OTP (à conserver pour compatibilité)
 * Récupérer un reçu par email (fonction "j'ai oublié mon numéro de reçu")
 * @param {string} email
 */
export const findRecuByEmail = async (email) => {
  console.warn('[findRecuByEmail] ⚠️ Cette méthode est dépréciée. Utilisez requestOtp() et verifyOtpAndGetRecu() à la place.');
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


export const verifyRecuForRegistration = async (numeroRecu) => {
  console.log('[verifyRecuForRegistration] Vérification du reçu:', numeroRecu);

  try {
    const response = await api.post('/paiement/inscription/verify-recu', { numeroRecu });
    console.log('[verifyRecuForRegistration] Réponse reçue :', response.data);
    return response.data; // { message, numeroRecu, paiement: {...} }
  } catch (error) {
    console.error('[verifyRecuForRegistration] Erreur:', error);
    if (error.response) {
      console.error('[verifyRecuForRegistration] Détails erreur:', error.response.data);
    }
    throw error;
  }
}