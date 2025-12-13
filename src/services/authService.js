// src/services/authService.js
import api from './api.js';

/**
 * 🔹 Inscription d'un candidat (Step 2)
 * @param {Object} userData - Données du candidat
 */
export const registerCandidate = async (userData) => {
  try {
    const response = await api.post('/auth/register-candidate-step2', userData);
    console.log('[registerCandidate] Réponse API:', response.data);
    return response.data;
  } catch (error) {
    console.error('[registerCandidate] Erreur:', error);
    if (error.response) {
      console.error('Détails de l’erreur:', error.response.data);
    }
    throw error;
  }
};

/**
 * 🔹 Connexion (Admin ou Candidat)
 * @param {string} email
 * @param {string} password
 * @param {'ADMIN'|'CANDIDATE'} userType
 */
export const loginUser = async (email, password, userType) => {
  try {
    const response = await api.post('/auth/login', { email, password, userType });
    console.log('[loginUser] Réponse API:', response.data);
    return response.data; // { access_token, permissions, user }
  } catch (error) {
    console.error('[loginUser] Erreur:', error);
    if (error.response) {
      console.error('Détails de l’erreur:', error.response.data);
    }
    throw error;
  }
};

/**
 * 🔹 Inscription d’un Admin
 * @param {Object} adminData
 */
export const registerAdminUser = async (adminData) => {
  try {
    const response = await api.post('/auth/register-admin', adminData);
    console.log('[registerAdminUser] Réponse API:', response.data);
    return response.data;
  } catch (error) {
    console.error('[registerAdminUser] Erreur:', error);
    if (error.response) {
      console.error('Détails de l’erreur:', error.response.data);
    }
    throw error;
  }
};
