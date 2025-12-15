import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCentreDepot, getAllCentreExamen, registerCandidateStep4 } from '../services/authService';

export default function Step4Register() {
  const [centreDepotList, setCentreDepotList] = useState([]);
  const [centreExamenList, setCentreExamenList] = useState([]);
  const [centreDepotId, setCentreDepotId] = useState('');
  const [centreExamenId, setCentreExamenId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const candidateId = localStorage.getItem('candidateId');
  const navigate = useNavigate(); // 🔹 Hook pour redirection

  useEffect(() => {
    const fetchCentres = async () => {
      try {
        const depots = await getAllCentreDepot();
        const examens = await getAllCentreExamen();
        setCentreDepotList(depots);
        setCentreExamenList(examens);
      } catch (error) {
        console.error('Erreur récupération centres:', error);
        setMessage('Impossible de récupérer les centres pour le moment.');
      }
    };

    fetchCentres();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!candidateId) {
      setMessage('Candidate ID introuvable. Veuillez recommencer l’inscription depuis l’étape 1.');
      return;
    }

    if (!centreDepotId || !centreExamenId) {
      setMessage('Veuillez sélectionner les deux centres.');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const response = await registerCandidateStep4({
        candidateId,
        centreDepotId,
        centreExamenId,
      });
      console.log('Étape 4 réussie:', response);
      setMessage('Inscription étape 4 réussie !');

      // 🔹 Redirection vers CandidateInfo pour afficher toutes les infos
      navigate(`/CandidateInfo?candidateId=${candidateId}`);
    } catch (error) {
      console.error('Erreur inscription étape 4:', error);
      setMessage(error.response?.data?.message || 'Erreur lors de l’inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="step4-register container mt-5">
      <h2 className="mb-4">Étape 4 : Sélection des centres</h2>
      {message && <div className="alert alert-info">{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Centre de dépôt :</label>
          <select
            className="form-select"
            value={centreDepotId}
            onChange={(e) => setCentreDepotId(e.target.value)}
          >
            <option value="">-- Sélectionnez un centre de dépôt --</option>
            {centreDepotList.length > 0 ? (
              centreDepotList.map((centre) => (
                <option key={centre.id} value={centre.id}>
                  {centre.intitule} - {centre.lieuDepot}
                </option>
              ))
            ) : (
              <option disabled>Aucun centre de dépôt disponible</option>
            )}
          </select>
        </div>

        <div className="mb-3">
          <label>Centre d’examen :</label>
          <select
            className="form-select"
            value={centreExamenId}
            onChange={(e) => setCentreExamenId(e.target.value)}
          >
            <option value="">-- Sélectionnez un centre d’examen --</option>
            {centreExamenList.length > 0 ? (
              centreExamenList.map((centre) => (
                <option key={centre.id} value={centre.id}>
                  {centre.intitule} {centre.lieuCentre ? `- ${centre.lieuCentre}` : ''}
                </option>
              ))
            ) : (
              <option disabled>Aucun centre d’examen disponible</option>
            )}
          </select>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Enregistrement...' : 'Valider les centres'}
        </button>
      </form>
    </div>
  );
}
