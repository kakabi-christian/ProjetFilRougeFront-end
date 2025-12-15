import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllCentreDepot, getAllCentreExamen, registerCandidateStep4 } from '../services/authService';
import Header from './Header';
import Footer from './Footer';

// Importez les composants Header et Footer si vous les utilisez (ajusté pour coller au design des étapes précédentes)
// import Header from './Header'; 
// import Footer from './Footer'; 

export default function Step4Register() {
  const [centreDepotList, setCentreDepotList] = useState([]);
  const [centreExamenList, setCentreExamenList] = useState([]);
  const [centreDepotId, setCentreDepotId] = useState('');
  const [centreExamenId, setCentreExamenId] = useState('');
  // Utilisation de 'loading' pour l'animation
  const [loading, setLoading] = useState(false); 
  const [message, setMessage] = useState('');

  const candidateId = localStorage.getItem('candidateId');
  const navigate = useNavigate();

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

    setLoading(true); // Démarre l'animation
    setMessage('');
    try {
      // Simulation d'un délai de 2 secondes
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await registerCandidateStep4({
        candidateId,
        centreDepotId,
        centreExamenId,
      });
      console.log('Étape 4 réussie:', response);

      // Supprime les IDs stockés après succès
      localStorage.removeItem('userId');
      localStorage.removeItem('candidateId'); 

      // 🔹 Redirection vers CandidateInfo
      navigate(`/CandidateInfo?candidateId=${candidateId}`);
    } catch (error) {
      console.error('Erreur inscription étape 4:', error);
      setMessage(error.response?.data?.message || 'Erreur lors de l’inscription');
    } finally {
      setLoading(false); // Arrête l'animation en cas d'erreur
    }
  };

  // --- Rendu de l'état de traitement (Animation) ---
  if (loading) {
    return (
      <div className="container mt-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="card shadow-lg p-5">
          <h2 className='mb-4 text-primary'>Finalisation de l'inscription en cours...</h2>
          {/* Animation de chargement Bootstrap */}
          <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
            <span className="visually-hidden">Finalisation...</span>
          </div>
          <p className="mt-4 lead text-muted">Veuillez patienter pendant l'enregistrement de vos choix de centres.</p>
        </div>
      </div>
    );
  }

  // --- Rendu Principal ---
  return (
    <>
      <Header />

       <div className="step4-register container d-flex justify-content-center align-items-center my-5" style={{ minHeight: '80vh' }}>
      <div className="card p-4 shadow-lg border-0" style={{ width: '100%', maxWidth: '550px' }}>
        <h2 className="mb-4 text-center text-primary fw-bold">
          <i className="bi bi-geo-alt-fill me-2"></i> Étape 4/4 : Sélection des centres
        </h2>

        {message && (
          <div className={`alert ${message.includes('réussie') ? 'alert-success' : 'alert-danger'} mt-3 text-center`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Centre de dépôt */}
          <div className="mb-4">
            <label className="form-label fw-medium"><i className="bi bi-pin-map-fill me-2"></i> Centre de dépôt :</label>
            <select
              className="form-select form-select-lg"
              value={centreDepotId}
              onChange={(e) => setCentreDepotId(e.target.value)}
              required
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

          {/* Centre d’examen */}
          <div className="mb-4">
            <label className="form-label fw-medium"><i className="bi bi-house-door-fill me-2"></i> Centre d’examen :</label>
            <select
              className="form-select form-select-lg"
              value={centreExamenId}
              onChange={(e) => setCentreExamenId(e.target.value)}
              required
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

          <button 
            type="submit" 
            className="btn btn-primary w-100 btn-lg" 
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Finalisation...
              </>
            ) : (
              'Valider l’Inscription'
            )}
          </button>
        </form>
      </div>
    </div>
    <Footer />
    </>
   
  );
}