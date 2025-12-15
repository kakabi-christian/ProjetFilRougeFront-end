import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { TypeBac, TypeMention } from '../models/documents';
import { registerCandidateStep3 } from '../services/authService';

export default function Step3Register() {
  const location = useLocation();
  const navigate = useNavigate();

  const [candidateId, setCandidateId] = useState(location.state?.candidateId || '');
  const [numeroCni, setNumeroCni] = useState('');
  const [typeExamen, setTypeExamen] = useState('');
  const [serie, setSerie] = useState('');
  const [mention, setMention] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🔹 Récupération sécurisée du candidateId depuis localStorage
  useEffect(() => {
    if (!candidateId) {
      const storedId = localStorage.getItem('candidateId');
      if (storedId) setCandidateId(storedId);
    }
  }, [candidateId]);

  if (!candidateId) {
    return (
      <div className="alert alert-danger text-center mt-5">
        Accès refusé. Veuillez reprendre l’inscription depuis l’étape 1.
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!typeExamen || !mention) {
      setError('Veuillez remplir tous les champs obligatoires.');
      setLoading(false);
      return;
    }

    // 🔹 Préparer le payload
    const step3Data = {
      candidateId,
      numeroCni: numeroCni || undefined,
      typeExamen,
      serie: serie || undefined,
      Mention: mention,
    };

    try {
      await registerCandidateStep3(step3Data);

      // 🔹 Stocker candidateId pour l'étape suivante
      localStorage.setItem('candidateId', candidateId);

      // 🔹 Navigation vers Step4
      navigate('/Step4Register', { state: { candidateId } });

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de l’enregistrement des documents.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="card p-4" style={{ width: '100%', maxWidth: '500px' }}>
          <h3 className="text-center mb-4">Inscription – Étape 3 (Documents)</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Numéro CNI</label>
              <input type="text" className="form-control" value={numeroCni} onChange={e => setNumeroCni(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Type de BAC *</label>
              <select className="form-select" value={typeExamen} onChange={e => setTypeExamen(e.target.value)} required>
                <option value="">-- Choisir --</option>
                {Object.values(TypeBac).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Série (optionnel)</label>
              <input type="text" className="form-control" placeholder="Ex : C, D, A, E" value={serie} onChange={e => setSerie(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Mention *</label>
              <select className="form-select" value={mention} onChange={e => setMention(e.target.value)} required>
                <option value="">-- Choisir --</option>
                {Object.values(TypeMention).map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Continuer'}
            </button>
            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
