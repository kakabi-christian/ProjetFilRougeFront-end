import React, { useEffect, useState } from 'react';
import { getCandidateInfo } from '../services/authService';

export default function CandidateInfo() {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 🔹 Récupération du candidateId depuis l'URL
  const searchParams = new URLSearchParams(window.location.search);
  const candidateId = searchParams.get('candidateId');

  useEffect(() => {
    const fetchCandidate = async () => {
      if (!candidateId) {
        setError('Candidate ID introuvable.');
        setCandidate(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getCandidateInfo(candidateId);
        setCandidate(data);
      } catch (err) {
        console.error(err);
        setCandidate(null);
        setError(err.response?.data?.message || 'Impossible de récupérer les informations du candidat.');
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [candidateId]);

  if (loading) return <div className="container mt-5">Chargement des informations...</div>;
  if (error) return <div className="container mt-5 alert alert-danger">{error}</div>;
  if (!candidate) return <div className="container mt-5">Aucune information disponible.</div>;

  return (
    <div className="container mt-5">
      <h2>Informations complètes du candidat</h2>
      <div className="card p-4 mt-3">
        <p><strong>Nom :</strong> {candidate.nom || 'Non renseigné'}</p>
        <p><strong>Prénom :</strong> {candidate.prenom || 'Non renseigné'}</p>
        <p><strong>Email :</strong> {candidate.email || 'Non renseigné'}</p>
        <p><strong>Téléphone :</strong> {candidate.telephone || 'Non renseigné'}</p>
        <p><strong>Région :</strong> {candidate.region || 'Non renseigné'}</p>

        <hr />

        <p><strong>Date de naissance :</strong> {candidate.dateNaissance ? new Date(candidate.dateNaissance).toLocaleDateString() : 'Non renseigné'}</p>
        <p><strong>Lieu de naissance :</strong> {candidate.lieuNaissance || 'Non renseigné'}</p>
        <p><strong>Sexe :</strong> {candidate.sexe || 'Non renseigné'}</p>
        <p><strong>Nationalité :</strong> {candidate.nationalite || 'Non renseigné'}</p>
        <p><strong>Ville :</strong> {candidate.ville || 'Non renseigné'}</p>

        <hr />

        <p><strong>Nom du père :</strong> {candidate.nomPere || 'Non renseigné'}</p>
        <p><strong>Téléphone du père :</strong> {candidate.telephonePere || 'Non renseigné'}</p>
        <p><strong>Nom de la mère :</strong> {candidate.nomMere || 'Non renseigné'}</p>
        <p><strong>Téléphone de la mère :</strong> {candidate.telephoneMere || 'Non renseigné'}</p>

        <hr />

        <p><strong>Spécialité :</strong> {candidate.specialite || 'Non renseigné'}</p>

        <hr />

        <p><strong>Numéro CNI :</strong> {candidate.numeroCni || 'Non renseigné'}</p>
        <p><strong>Type d’examen :</strong> {candidate.typeExamen || 'Non renseigné'}</p>
        <p><strong>Série :</strong> {candidate.serie || 'Non renseigné'}</p>
        <p><strong>Mention :</strong> {candidate.mention || 'Non renseigné'}</p>

        <hr />

        <p><strong>Centre de dépôt :</strong> {candidate.centreDepot || 'Non renseigné'}</p>
        <p><strong>Centre d’examen :</strong> {candidate.centreExamen || 'Non renseigné'}</p>
      </div>
    </div>
  );
}
