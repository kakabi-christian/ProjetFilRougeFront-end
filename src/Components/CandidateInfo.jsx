import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCandidateInfo } from '../services/authService';
// NOUVEAUX IMPORTS pour la gestion des pièces du dossier
import { getPiecesDossier, validatePieces } from '../services/PiecesDossierService'; 
// NOTE: validatePieces est conservé dans les imports mais n'est plus utilisé par le bouton "Terminer"

// Composant pour afficher un champ d'information (sorti pour plus de clarté)
const InfoField = ({ label, value, iconClass }) => (
  <div className="col-lg-4 col-md-6 mb-4">
    <div className="p-3 border rounded h-100 shadow-sm" style={{ backgroundColor: '#f0f4f8', borderColor: '#d9e2ec' }}>
      <div className="d-flex align-items-center">
        <i className={`${iconClass} me-3 text-primary fs-5`}></i> 
        <div>
          <small className="text-muted text-uppercase fw-bold d-block">{label}</small>
          <p className="mb-0 fw-semibold text-dark text-break">
            {value || <span className="text-danger fst-italic">Non renseigné</span>}
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Fonction pour formater la date
const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
};


export default function CandidateInfo() {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // NOUVEAUX ÉTATS pour la gestion des pièces
  const [pieces, setPieces] = useState([]);
  const [checkedPieces, setCheckedPieces] = useState({});
  const [isConfirming, setIsConfirming] = useState(false); // Gardé pour cohérence
  const [isTerminating, setIsTerminating] = useState(false); // <--- NOUVEL ÉTAT pour la barre de chargement

  const navigate = useNavigate();

  // Récupération de l'ID du candidat depuis l'URL
  const searchParams = new URLSearchParams(window.location.search);
  const candidateId = searchParams.get('candidateId');

  useEffect(() => {
    const fetchData = async () => {
      if (!candidateId) {
        setError('ID du candidat introuvable. Veuillez vérifier l\'URL.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Récupérer les informations du candidat
        const data = await getCandidateInfo(candidateId); 
        setCandidate(data);

        // 2. Récupérer les pièces du dossier
        const piecesData = await getPiecesDossier();
        setPieces(piecesData);

        // 3. Initialiser l'état des checkbox à false
        const initialChecked = {};
        piecesData.forEach(piece => {
          initialChecked[piece.id] = false;
        });
        setCheckedPieces(initialChecked);

      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setCandidate(null);
        setPieces([]);
        setError(err.response?.data?.message || 'Impossible de récupérer les informations du candidat ou des pièces. Le serveur n\'a peut-être pas répondu.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [candidateId]);
  
  // Gestion des changements sur les checkbox
  const handleCheckboxChange = (pieceId) => {
    setCheckedPieces(prev => ({
      ...prev,
      [pieceId]: !prev[pieceId]
    }));
  };
  
  // Vérifie si TOUTES les pièces sont cochées
  const areAllPiecesChecked = pieces.length > 0 && 
                              pieces.every(piece => checkedPieces[piece.id]);

  /**
   * Fonction pour le bouton "Terminer" avec une barre de chargement simulée.
   */
  const handleTerminate = () => {
    if (!areAllPiecesChecked) return; // Sécurité

    setIsTerminating(true); // Active la barre de chargement

    // Simule un traitement de 3 secondes avant la redirection
    setTimeout(() => {
      setIsTerminating(false); // Désactive l'état (bien que la page soit changée)
      navigate('/Login'); // Redirection vers la page de Login
    }, 3000); // Délai de 3 secondes
  };


  // --- Affichage des états (Loading, Error, No Data, Terminating) ---

  // Rendu de l'état de chargement initial
  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
        <p className="mt-2">Chargement des informations...</p>
      </div>
    );
  }

  // Rendu de l'état de redirection (Terminating)
  if (isTerminating) {
    return (
      <div className="container mt-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ height: '70vh' }}>
        <h2 className='mb-4 text-success'>Validation et Enregistrement du Dossier en cours...</h2>
        {/* Grande barre de chargement avec animation */}
        <div className="spinner-grow text-success" style={{ width: '4rem', height: '4rem' }} role="status">
          <span className="visually-hidden">Terminaison...</span>
        </div>
        <p className="mt-4 lead text-muted">Veuillez patienter quelques secondes. Vous serez redirigé(e) automatiquement.</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">❌ Erreur !</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }
  
  if (!candidate) {
    return (
      <div className="container mt-5 text-center">
        <div className="alert alert-info" role="alert">
          Aucune information disponible pour ce candidat.
        </div>
      </div>
    );
  }

  // --- Rendu Final ---

  return (
    <div className="container my-5">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <h1 className="text-dark fw-light">
          <i className="bi bi-person-badge me-2 text-primary"></i> 
          Dossier Candidat: <span className='fw-bold'>{candidate.prenom} {candidate.nom}</span>
        </h1>
      </div>

      <div className="row g-4">
        {/* Section Informations Personnelles */}
        <div className="col-12">
          <h4 className="mb-3 text-primary border-bottom border-primary pb-2"><i className="bi bi-person-fill me-2"></i> Identité & Contact</h4>
          <div className="row">
            <InfoField label="Nom Complet" value={`${candidate.prenom} ${candidate.nom}`} iconClass="bi bi-person-vcard" />
            <InfoField label="Email" value={candidate.email} iconClass="bi bi-envelope-fill" />
            <InfoField label="Téléphone" value={candidate.telephone} iconClass="bi bi-phone-fill" />
            <InfoField label="Nationalité" value={candidate.nationalite} iconClass="bi bi-flag-fill" />
            <InfoField label="Numéro CNI" value={candidate.numeroCni} iconClass="bi bi-credit-card-2-front-fill" />
            <InfoField label="Sexe" value={candidate.sexe} iconClass="bi bi-gender-ambiguous" />
          </div>
        </div>

        {/* Section Démographie */}
        <div className="col-12 mt-4">
          <h4 className="mb-3 text-primary border-bottom border-primary pb-2"><i className="bi bi-geo-alt-fill me-2"></i> Localisation & Naissance</h4>
          <div className="row">
            <InfoField label="Date de naissance" value={formatDate(candidate.dateNaissance)} iconClass="bi bi-calendar-date-fill" />
            <InfoField label="Lieu de naissance" value={candidate.lieuNaissance} iconClass="bi bi-pin-map-fill" />
            <InfoField label="Ville" value={candidate.ville} iconClass="bi bi-building-fill" />
            <InfoField label="Région" value={candidate.region} iconClass="bi bi-globe-americas" />
          </div>
        </div>
        
        {/* Section Parents */}
        <div className="col-12 mt-4">
          <h4 className="mb-3 text-primary border-bottom border-primary pb-2"><i className="bi bi-people-fill me-2"></i> Informations Parentales</h4>
          <div className="row">
            <InfoField label="Nom du père" value={candidate.nomPere} iconClass="bi bi-person-square" />
            <InfoField label="Téléphone du père" value={candidate.telephonePere} iconClass="bi bi-telephone-fill" />
            <InfoField label="Nom de la mère" value={candidate.nomMere} iconClass="bi bi-person-square" />
            <InfoField label="Téléphone de la mère" value={candidate.telephoneMere} iconClass="bi bi-telephone-fill" />
          </div>
        </div>

        {/* Section Examen */}
        <div className="col-12 mt-4">
          <h4 className="mb-3 text-primary border-bottom border-primary pb-2"><i className="bi bi-book-fill me-2"></i> Dossier Examen</h4>
          <div className="row">
            <InfoField label="Type d’examen" value={candidate.typeExamen} iconClass="bi bi-file-earmark-check-fill" />
            <InfoField label="Spécialité" value={candidate.specialite} iconClass="bi bi-lightbulb-fill" />
            <InfoField label="Série" value={candidate.serie} iconClass="bi bi-list-ol" />
            <InfoField label="Mention" value={candidate.mention} iconClass="bi bi-award-fill" />
            <InfoField label="Centre d’examen" value={candidate.centreExamen} iconClass="bi bi-building-up" />
            <InfoField label="Centre de dépôt" value={candidate.centreDepot} iconClass="bi bi-box-fill" />
          </div>
        </div>
      </div>
      
      {/* ========================================================= */}
      {/* Section Pièces du dossier (Validation par Checkbox) */}
      {/* ========================================================= */}
      <div className="card shadow-lg mt-5 border-0">
        <div className="card-header bg-success text-white py-3">
          <h4 className="mb-0">
            <i className="bi bi-folder-check me-2"></i> Pièces du Dossier à remettre au centre de dépôt
          </h4>
        </div>
        <div className="card-body p-4">
          <p className="lead text-muted mb-4">
            <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i> 
            Veuillez cocher **toutes** les pièces une fois qu'elles sont physiquement présentes pour valider l'intégralité du dossier.
          </p>
          
          <div className="row g-3">
            {pieces.length === 0 && (
              <div className="col-12"><div className="alert alert-warning">Aucune liste de pièces à vérifier n'est disponible.</div></div>
            )}
            {pieces.map(piece => (
              <div key={piece.id} className="col-md-6 col-lg-4">
                <div 
                  className={`p-3 border rounded shadow-sm transition-all ${checkedPieces[piece.id] ? 'border-success bg-success-subtle' : 'bg-light border-secondary'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleCheckboxChange(piece.id)} // Rend toute la carte cliquable
                >
                  <div className="form-check m-0">
                    <input
                      type="checkbox"
                      className="form-check-input flex-shrink-0 mt-1"
                      id={`piece-${piece.id}`}
                      checked={checkedPieces[piece.id] || false}
                      onChange={() => {}} // L'onChange est géré par le onClick du div parent
                    />
                    <label className="form-check-label fw-medium ms-2 user-select-none" htmlFor={`piece-${piece.id}`}>
                      {checkedPieces[piece.id] ? (
                        <i className="bi bi-check-circle-fill text-success me-2"></i>
                      ) : (
                        <i className="bi bi-file-earmark-text-fill text-secondary me-2"></i>
                      )}
                      {piece.nom || piece.description || `Pièce ID ${piece.id}`}
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bouton de terminaison / Alerte d'attente */}
          {areAllPiecesChecked ? (
            <button
              className="btn btn-success btn-lg mt-5 w-100 shadow-lg"
              onClick={handleTerminate}
              disabled={isTerminating}
            >
              <i className="bi bi-box-arrow-right me-2"></i> 
              Confirmer l'intégralité du dossier et Terminer
            </button>
          ) : (
            <div className="alert alert-info mt-5 text-center p-3 border-start border-5 border-info">
              <i className="bi bi-info-circle-fill me-2"></i>
              Veuillez cocher **toutes** les pièces (manque **{pieces.length - Object.values(checkedPieces).filter(Boolean).length}** pièce(s)) pour débloquer le bouton de Terminaison.
            </div>
          )}
        </div>
      </div>
      
      <hr className="my-5" />
      <div className="text-center text-muted">
        <small>Dernière mise à jour de l'affichage: {new Date().toLocaleDateString()}</small>
      </div>
    </div>
  );
}