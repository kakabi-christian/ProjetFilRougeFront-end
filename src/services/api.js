// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// INTERCEPTOR : Ajoute automatiquement le token à chaque appel
api.interceptors.request.use(
  (config) => {
    // On récupère le token stocké lors du login
    // Vérifiez bien si vous l'avez nommé 'access_token' ou 'token' lors du stockage
    const token = localStorage.getItem('access_token'); 

    if (token) {
      // On l'ajoute dans le header Authorization
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`[API] Token injecté pour: ${config.url}`);
    } else {
      console.warn(`[API] Aucun token trouvé pour: ${config.url}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;