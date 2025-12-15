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
    setLoading(true);
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
      telephone,
      region,
    };

    try {
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
        'Erreur lors de l’inscription'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div
        className="container d-flex justify-content-center align-items-center"
        style={{ minHeight: '80vh' }}
      >
        <div className="card p-4" style={{ width: '100%', maxWidth: '500px' }}>
          <h3 className="card-title mb-4 text-center">
            Inscription – Étape 1
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nom</label>
              <input
                type="text"
                className="form-control"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Prénom</label>
              <input
                type="text"
                className="form-control"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Téléphone</label>
              <input
                type="text"
                className="form-control"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Région</label>
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
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? 'Inscription...' : 'Suivant →'}
            </button>

            {error && (
              <div className="alert alert-danger mt-3">
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
