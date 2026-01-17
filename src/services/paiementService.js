import api from './api.js';

/**
 * Créer un paiement et générer le reçu
 * @param {Object} paiementData
 */
/**
 * 1. INITIALISER LE PAIEMENT
 * Envoie la demande de paiement (Push OTP Campay)
 * @returns { externalReference, message }
 */
export const createPaiement = async (paiementData) => {
  console.log('[createPaiement] Initialisation du paiement Campay...');
  try {
    const response = await api.post('/paiement', paiementData);
    // On reçoit maintenant { message, externalReference, paiementId }
    console.log('[createPaiement] Demande envoyée avec référence :', response.data.externalReference);
    return response.data;
  } catch (error) {
    console.error('[createPaiement] Erreur :', error.response?.data || error.message);
    throw error;
  }
};
/**
 * 2. VÉRIFIER LE STATUT (POLLING)
 * À appeler régulièrement pour savoir si le reçu est enfin prêt
 * @param {string} externalReference 
 */
export const checkPaiementStatus = async (externalReference) => {
  try {
    // On appelle la nouvelle route du controller
    const response = await api.get(`/paiement/check-status/${externalReference}`);
    
    // Si status est 'SUCCESSFUL', response.data contiendra le reçu
    return response.data; 
  } catch (error) {
    console.error('[checkStatus] Erreur lors de la vérification :', error);
    throw error;
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
 * Récupérer un reçu par email
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

/**
 * Vérifier un reçu pour l’inscription
 * @param {string} numeroRecu
 */
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
};

/**
 * 🔹 Nouvelle méthode : récupérer les infos d’un paiement par numéro de reçu
 * @param {string} numeroRecu
 */
export const getPaiementInfoByRecu = async (numeroRecu) => {
  console.log('[getPaiementInfoByRecu] Récupération des infos pour le reçu:', numeroRecu);

  try {
    const response = await api.get(`/paiement/recu/${numeroRecu}/info`);
    console.log('[getPaiementInfoByRecu] Réponse reçue :', response.data);
    return response.data; // { nom, prenom, email, telephone, concours, montant }
  } catch (error) {
    console.error('[getPaiementInfoByRecu] Erreur lors de la récupération :', error);
    if (error.response) {
      console.error('[getPaiementInfoByRecu] Détails erreur :', error.response.data);
      console.error('[getPaiementInfoByRecu] Status code :', error.response.status);
    }
    throw error;
  }
};
