// src/services/api.js
import axios from 'axios';

// Instance Axios centrale pour tout ton projet
const api = axios.create({
  baseURL: 'http://localhost:3000', // <-- ton backend Nest.js
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tu peux ajouter ici des interceptors si besoin (auth, erreurs, etc.)
// Exemple d'interceptor pour logger toutes les requêtes
api.interceptors.request.use((config) => {
  console.log('Envoi de la requête vers:', config.url);
  return config;
});

export default api;
