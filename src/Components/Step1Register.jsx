// src/Components/Step1Register.jsx
import React, { useState } from 'react';
import { registerCandidate } from '../services/authService';
import { Region } from '../models/user'; // Enum des régions
import Header from './Header';
import Footer from './Footer';

export default function Step1Register({ numeroRecu, onRegistrationSuccess }) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Vérification des champs
    if (!nom || !prenom || !email || !telephone || !region) {
      setError('Veuillez remplir tous les champs.');
      setLoading(false);
      return;
    }

    const userData = {
      numeroRecu, // reçu validé par VerifyRecu.jsx
      nom,
      prenom,
      email,
      telephone,
      region,
    };

    try {
      const result = await registerCandidate(userData);
      console.log('[Step1Register] Inscription réussie :', result);
      if (onRegistrationSuccess) onRegistrationSuccess(result.user);
    } catch (err) {
      console.error('[Step1Register] Erreur :', err);
      setError(err.response?.data?.message || 'Erreur lors de l’inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="card p-4" style={{ width: '100%', maxWidth: '500px' }}>
          <h3 className="card-title mb-4 text-center">Inscription - Étape 1</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nom :</label>
              <input
                type="text"
                className="form-control"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Prénom :</label>
              <input
                type="text"
                className="form-control"
                value={prenom}
                onChange={(e) => setPrenom(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email :</label>
              <input
                type="email"
                className="form-control"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Téléphone :</label>
              <input
                type="text"
                className="form-control"
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Région :</label>
              <select
                className="form-select"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
              >
                <option value="">-- Choisir une région --</option>
                {Object.values(Region).map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Inscription...' : 'Valider'}
            </button>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
