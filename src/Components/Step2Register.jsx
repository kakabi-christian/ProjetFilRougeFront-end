import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sexe } from '../models/candidate';
import { registerCandidateStep2 } from '../services/authService';
import { getDepartements, getFilieresByDepartement } from '../services/archiveService';
import Header from './Header';
import Footer from './Footer';

export default function Step2Register() {
  const location = useLocation();
  const navigate = useNavigate();

  const [userId, setUserId] = useState(location.state?.userId || '');
  const [departements, setDepartements] = useState([]);
  const [departement, setDepartement] = useState('');
  const [filieres, setFilieres] = useState([]);
  const [filiere, setFiliere] = useState('');
  const [specialites, setSpecialites] = useState([]);
  const [specialiteId, setSpecialiteId] = useState('');

  const [dateNaissance, setDateNaissance] = useState('');
  const [lieuNaissance, setLieuNaissance] = useState('');
  const [sexe, setSexe] = useState('');
  const [nationalite, setNationalite] = useState('');
  const [ville, setVille] = useState('');
  const [nomPere, setNomPere] = useState('');
  const [telephonePere, setTelephonePere] = useState('');
  const [nomMere, setNomMere] = useState('');
  const [telephoneMere, setTelephoneMere] = useState('');

  // Utilisation de 'loading' pour l'animation
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);

  // 🔹 Récupérer userId depuis localStorage si absent
  useEffect(() => {
    if (!userId) {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) setUserId(storedUserId);
    }
  }, [userId]);

  // 🔹 Charger les départements
  useEffect(() => {
    getDepartements()
      .then(res => setDepartements(res.data))
      .catch(err => console.error(err));
  }, []);

  // 🔹 Charger filières quand département change
  useEffect(() => {
    if (!departement) {
      setFilieres([]);
      setFiliere('');
      setSpecialites([]);
      setSpecialiteId('');
      return;
    }

    getFilieresByDepartement(departement).then(res => {
      setFilieres(res.data);
      setFiliere('');
      setSpecialites([]);
      setSpecialiteId('');
    });
  }, [departement]);

  // 🔹 Charger spécialités quand filière change
  useEffect(() => {
    if (!filiere) {
      setSpecialites([]);
      setSpecialiteId('');
      return;
    }

    const fil = filieres.find(f => f.id === filiere);
    setSpecialites(fil?.specialites || []);
    setSpecialiteId('');
  }, [filiere, filieres]);

  // 🔴 Sécurité
  if (!userId && !loading) {
    return (
      <div className="alert alert-danger text-center mt-5">
        Erreur : userId manquant. Veuillez revenir à l’étape 1.
      </div>
    );
  }

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Démarre l'animation
    setError(null);

    if (!dateNaissance || !lieuNaissance || !sexe || !nationalite || !ville || !specialiteId) {
      setError('Veuillez remplir tous les champs obligatoires.');
      setLoading(false);
      return;
    }

    const data = {
      dateNaissance,
      lieuNaissance,
      sexe,
      nationalite,
      ville,
      nomPere,
      telephonePere,
      nomMere,
      telephoneMere,
      specialiteId,
    };

    try {
      // Simulation d'un délai de 2 secondes
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 🔹 Enregistrement Step2 et récupération du candidateId
      const response = await registerCandidateStep2({ userId, data });

      const candidateId = response.candidate?.id;
      if (!candidateId) {
        throw new Error('Impossible de récupérer l’ID du candidat après l’enregistrement.');
      }

      // 🔹 Stocker candidateId dans localStorage pour Step3
      localStorage.setItem('candidateId', candidateId);

      // ✅ Navigation vers Step3 avec candidateId
      navigate('/Step3Register', {
        state: { candidateId },
      });

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de l’enregistrement.');
    } finally {
      // Le loading est coupé après la redirection, ou après l'erreur
      setLoading(false);
    }
  };

  // --- Rendu de l'état de traitement (Animation) ---
  if (loading) {
    return (
      <div className="container mt-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="card shadow-lg p-5">
          <h2 className='mb-4 text-success'>Enregistrement de l'Étape 2 en cours...</h2>
          {/* Animation de chargement Bootstrap */}
          <div className="spinner-border text-success" style={{ width: '4rem', height: '4rem' }} role="status">
            <span className="visually-hidden">Enregistrement...</span>
          </div>
          <p className="mt-4 lead text-muted">Veuillez patienter pendant l'enregistrement de vos informations.</p>
        </div>
      </div>
    );
  }

  // --- Rendu Principal ---
  return (
    <>
      <Header />

      <div className="container d-flex justify-content-center align-items-center my-5" style={{ minHeight: '80vh' }}>
        <div className="card p-4 shadow-lg border-0" style={{ width: '100%', maxWidth: '700px' }}>
          <h3 className="card-title mb-4 text-center text-primary fw-bold">
            <i className="bi bi-mortarboard-fill me-2"></i> Inscription – Étape 2/3
          </h3>

          <form onSubmit={handleSubmit}>
            <h5 className="mb-3 text-secondary">Choix de la filière et spécialité</h5>
            <div className='row'>
              {/* Département */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-medium"><i className="bi bi-bookmark-fill me-2"></i> Département</label>
                <select className="form-select" value={departement} onChange={e => setDepartement(e.target.value)} required>
                  <option value="">-- Choisir un département --</option>
                  {departements.map(d => (
                    <option key={d.id} value={d.id}>{d.nomDep}</option>
                  ))}
                </select>
              </div>

              {/* Filière */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-medium"><i className="bi bi-book-fill me-2"></i> Filière</label>
                <select 
                  className="form-select" 
                  value={filiere} 
                  onChange={e => setFiliere(e.target.value)}
                  disabled={filieres.length === 0}
                  required={departement !== ''}
                >
                  <option value="">-- Choisir une filière --</option>
                  {filieres.map(f => (
                    <option key={f.id} value={f.id}>{f.intitule}</option>
                  ))}
                </select>
              </div>

              {/* Spécialité */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-medium"><i className="bi bi-tags-fill me-2"></i> Spécialité</label>
                <select 
                  className="form-select" 
                  value={specialiteId} 
                  onChange={e => setSpecialiteId(e.target.value)}
                  disabled={specialites.length === 0}
                  required={filiere !== ''}
                >
                  <option value="">-- Choisir une spécialité --</option>
                  {specialites.map(s => (
                    <option key={s.id} value={s.id}>{s.libelle}</option>
                  ))}
                </select>
              </div>
            </div>

            <hr className="my-4"/>

            <h5 className="mb-3 text-secondary">Informations Personnelles</h5>
            <div className='row'>
              {/* Date Naissance */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-medium"><i className="bi bi-calendar-date-fill me-2"></i> Date de naissance</label>
                <input type="date" className="form-control" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} required />
              </div>

              {/* Lieu Naissance */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-medium"><i className="bi bi-pin-map-fill me-2"></i> Lieu de naissance</label>
                <input type="text" className="form-control" placeholder="Lieu de naissance" value={lieuNaissance} onChange={e => setLieuNaissance(e.target.value)} required />
              </div>
            </div>

            <div className='row'>
              {/* Sexe */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-medium"><i className="bi bi-gender-ambiguous me-2"></i> Sexe</label>
                <select className="form-select" value={sexe} onChange={e => setSexe(e.target.value)} required>
                  <option value="">-- Sexe --</option>
                  {Object.values(Sexe).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              
              {/* Nationalité */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-medium"><i className="bi bi-flag-fill me-2"></i> Nationalité</label>
                <input type="text" className="form-control" placeholder="Nationalité" value={nationalite} onChange={e => setNationalite(e.target.value)} required />
              </div>
              
              {/* Ville */}
              <div className="col-md-4 mb-3">
                <label className="form-label fw-medium"><i className="bi bi-geo-alt-fill me-2"></i> Ville de résidence</label>
                <input type="text" className="form-control" placeholder="Ville" value={ville} onChange={e => setVille(e.target.value)} required />
              </div>
            </div>
            
            <hr className="my-4"/>

            <h5 className="mb-3 text-secondary">Informations des Parents (Facultatif)</h5>
            <div className='row'>
              {/* Nom Père */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-medium"><i className="bi bi-person-badge-fill me-2"></i> Nom du père</label>
                <input type="text" className="form-control" placeholder="Nom du père" value={nomPere} onChange={e => setNomPere(e.target.value)} />
              </div>
              
              {/* Téléphone Père */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-medium"><i className="bi bi-telephone-fill me-2"></i> Téléphone du père</label>
                <input type="text" className="form-control" placeholder="Téléphone du père" value={telephonePere} onChange={e => setTelephonePere(e.target.value)} />
              </div>
            </div>

            <div className='row'>
              {/* Nom Mère */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-medium"><i className="bi bi-person-badge-fill me-2"></i> Nom de la mère</label>
                <input type="text" className="form-control" placeholder="Nom de la mère" value={nomMere} onChange={e => setNomMere(e.target.value)} />
              </div>
              
              {/* Téléphone Mère */}
              <div className="col-md-6 mb-4">
                <label className="form-label fw-medium"><i className="bi bi-telephone-fill me-2"></i> Téléphone de la mère</label>
                <input type="text" className="form-control" placeholder="Téléphone de la mère" value={telephoneMere} onChange={e => setTelephoneMere(e.target.value)} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Enregistrement...
                </>
              ) : (
                'Continuer vers l’étape 3 →'
              )}
            </button>

            {error && <div className="alert alert-danger mt-3 text-center">{error}</div>}
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}