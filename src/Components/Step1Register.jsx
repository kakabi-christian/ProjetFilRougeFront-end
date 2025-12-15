import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Region } from '../models/user';
import { registerCandidateStep1 } from '../services/authService';

import Header from './Header';
import Footer from './Footer';

export default function Step1Register() {
  const location = useLocation();
  const navigate = useNavigate();

  const { numeroRecu, paiementInfo } = location.state || {};

  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [region, setRegion] = useState('');
  const [password, setPassword] = useState('');
  // L'état 'loading' est utilisé pour l'animation pleine page
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);

  // 🔹 Pré-remplir avec les infos du paiement
  useEffect(() => {
    if (paiementInfo) {
      setNom(paiementInfo.nom || '');
      setPrenom(paiementInfo.prenom || '');
      setEmail(paiementInfo.email || '');
      setTelephone(paiementInfo.telephone || '');
    }
  }, [paiementInfo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Démarre l'animation de chargement
    setError(null);

    if (!nom || !prenom || !email || !telephone || !region) {
      setError('Veuillez remplir tous les champs.');
      setLoading(false);
      return;
    }

    const userData = {
      nom,
      prenom,
     
      email,
      password,
      telephone,
      region,
    };

    try {
      // Simulation d'un délai de 2 secondes avant l'appel API
      await new Promise(resolve => setTimeout(resolve, 2000)); 
      
      const result = await registerCandidateStep1(userData);
      console.log('[Step1Register] Succès :', result);

      // 🔹 Stocker le userId pour l'étape 2
      localStorage.setItem('userId', result.user.id);

      // 🔥 REDIRECTION VERS STEP 2
      navigate('/Step2Register', {
        state: {
          userId: result.user.id,
        },
      });

    } catch (err) {
      console.error('[Step1Register] Erreur :', err);
      setError(
        err.response?.data?.message ||
        'Erreur lors de l’inscription. Veuillez vérifier l\'email.'
      );
    } finally {
      // Le loading est coupé après la redirection, ou après l'erreur
      // S'il y a erreur, on le coupe ici. S'il y a succès, la navigation gère la fin du rendu.
      if (!error) setLoading(false); 
    }
  };
  
  // --- Rendu de l'état de traitement (Animation) ---
  if (loading) {
    return (
      <div className="container mt-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
        <div className="card shadow-lg p-5">
            <h2 className='mb-4 text-primary'>Enregistrement de l'Étape 1 en cours...</h2>
            {/* Animation de chargement Bootstrap */}
            <div className="spinner-border text-primary" style={{ width: '4rem', height: '4rem' }} role="status">
            <span className="visually-hidden">Enregistrement...</span>
            </div>
            <p className="mt-4 lead text-muted">Préparation de la prochaine étape du formulaire.</p>
        </div>
      </div>
    );
  }

  // --- Rendu Principal ---
  return (
    <>
      <Header />

      <div
        className="container d-flex justify-content-center align-items-center my-5"
        style={{ minHeight: '80vh' }}
      >
        <div className="card p-4 shadow-lg border-0" style={{ width: '100%', maxWidth: '550px' }}>
          <h3 className="card-title mb-4 text-center text-primary fw-bold">
            <i className="bi bi-file-earmark-person me-2"></i> Inscription – Étape 1/4
          </h3>

          <form onSubmit={handleSubmit}>
            {/* Nom */}
            <div className="mb-3">
              <label className="form-label fw-medium"><i className="bi bi-person-fill me-2"></i> Nom</label>
              <input
                type="text"
                className="form-control"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>

            {/* Prénom */}
            <div className="mb-3">
              <label className="form-label fw-medium"><i className="bi bi-person-fill me-2"></i> Prénom</label>
              <input
                type="text"
                className="form-control"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label fw-medium"><i className="bi bi-envelope-fill me-2"></i> Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {/* Password */}
            <div className="mb-3">
              <label className="form-label fw-medium"><i className="bi bi-lock-fill me-2"></i> Mot de passe</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Téléphone */}
            <div className="mb-3">
              <label className="form-label fw-medium"><i className="bi bi-phone-fill me-2"></i> Téléphone</label>
              <input
                type="text"
                className="form-control"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                required
              />
            </div>

            {/* Région */}
            <div className="mb-4">
              <label className="form-label fw-medium"><i className="bi bi-map-fill me-2"></i> Région</label>
              <select
                className="form-select"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
              >
                <option value="">-- Choisir une région --</option>
                {Object.values(Region).map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
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
                  Enregistrement...
                </>
              ) : (
                'Suivant →'
              )}
            </button>

            {error && (
              <div className="alert alert-danger mt-3 text-center">
                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                {error}
              </div>
            )}
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}