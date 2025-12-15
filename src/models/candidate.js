// src/models/candidate.js

// Enum Sexe (doit correspondre exactement à Prisma)
export const Sexe = {
  MASCULIN: 'MASCULIN',
  FEMININ: 'FEMININ',
};

/**
 * Modèle Candidat — STEP 2
 * Utilisé après la création du User (Step 1)
 */
export class CandidateStep2 {
  constructor({
    userId = '',           // 🔹 Ajouter userId
    dateNaissance = '',
    lieuNaissance = '',
    sexe = '',
    nationalite = '',
    ville = '',
    nomPere = '',
    telephonePere = '',
    nomMere = '',
    telephoneMere = '',
    specialiteId = '',
  } = {}) {
    this.userId = userId;          // 🔹 Associer à l'utilisateur
    this.dateNaissance = dateNaissance;
    this.lieuNaissance = lieuNaissance;
    this.sexe = sexe;
    this.nationalite = nationalite;
    this.ville = ville;
    this.nomPere = nomPere;
    this.telephonePere = telephonePere;
    this.nomMere = nomMere;
    this.telephoneMere = telephoneMere;
    this.specialiteId = specialiteId;
  }
}
