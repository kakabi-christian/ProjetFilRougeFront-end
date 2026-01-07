export const Concours = {
  id: '',
  code: '',
  intitule: '',
  montant: 0,
  anneeId: '',
  sessionId: '',
  // Nouveau : Tableau contenant les IDs des pièces requises
  // Utile pour la création/édition (DTO)
  pieceDossierIds: [], 
  // Contiendra les objets complets après récupération du Backend
  piecesDossier: [], 
  createdAt: '',
  updatedAt: '',
};