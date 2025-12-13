import api from './api.js';

// Récupérer la liste des années
export const getAnnees = () => api.get('/annees');

// Récupérer la liste des départements
export const getDepartements = () => api.get('/departements');

// Récupérer les filières d’un département
export const getFilieresByDepartement = (id) =>
  api.get(`/filieres/departement/${id}`);

// Récupérer les épreuves d’une filière
export const getEpreuvesByFiliere = (id) =>
  api.get(`/epreuves/filiere/${id}`);

// Récupérer les archives d’une épreuve
export const getArchivesByEpreuve = (id) =>
  api.get(`/archives/epreuve/${id}`);
