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
  if (!userId) {
    return (
      <div className="alert alert-danger text-center mt-5">
        Erreur : userId manquant. Veuillez revenir à l’étape 1.
      </div>
    );
  }

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="card p-4" style={{ width: '100%', maxWidth: '600px' }}>
          <h3 className="card-title mb-4 text-center">Inscription – Étape 2</h3>

          <form onSubmit={handleSubmit}>
            {/* Département */}
            <div className="mb-3">
              <label className="form-label">Département</label>
              <select className="form-select" value={departement} onChange={e => setDepartement(e.target.value)}>
                <option value="">-- Choisir un département --</option>
                {departements.map(d => (
                  <option key={d.id} value={d.id}>{d.nomDep}</option>
                ))}
              </select>
            </div>

            {/* Filière */}
            {filieres.length > 0 && (
              <div className="mb-3">
                <label className="form-label">Filière</label>
                <select className="form-select" value={filiere} onChange={e => setFiliere(e.target.value)}>
                  <option value="">-- Choisir une filière --</option>
                  {filieres.map(f => (
                    <option key={f.id} value={f.id}>{f.intitule}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Spécialité */}
            {specialites.length > 0 && (
              <div className="mb-3">
                <label className="form-label">Spécialité</label>
                <select className="form-select" value={specialiteId} onChange={e => setSpecialiteId(e.target.value)}>
                  <option value="">-- Choisir une spécialité --</option>
                  {specialites.map(s => (
                    <option key={s.id} value={s.id}>{s.libelle}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Infos personnelles */}
            <input type="date" className="form-control mb-3" value={dateNaissance} onChange={e => setDateNaissance(e.target.value)} required />
            <input type="text" className="form-control mb-3" placeholder="Lieu de naissance" value={lieuNaissance} onChange={e => setLieuNaissance(e.target.value)} required />

            <select className="form-select mb-3" value={sexe} onChange={e => setSexe(e.target.value)} required>
              <option value="">-- Sexe --</option>
              {Object.values(Sexe).map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <input type="text" className="form-control mb-3" placeholder="Nationalité" value={nationalite} onChange={e => setNationalite(e.target.value)} required />
            <input type="text" className="form-control mb-3" placeholder="Ville" value={ville} onChange={e => setVille(e.target.value)} required />

            <input type="text" className="form-control mb-3" placeholder="Nom du père" value={nomPere} onChange={e => setNomPere(e.target.value)} />
            <input type="text" className="form-control mb-3" placeholder="Téléphone du père" value={telephonePere} onChange={e => setTelephonePere(e.target.value)} />
            <input type="text" className="form-control mb-3" placeholder="Nom de la mère" value={nomMere} onChange={e => setNomMere(e.target.value)} />
            <input type="text" className="form-control mb-3" placeholder="Téléphone de la mère" value={telephoneMere} onChange={e => setTelephoneMere(e.target.value)} />

            <button type="submit" className="btn btn-primary w-100" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Continuer vers l’étape 3'}
            </button>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </form>
        </div>
      </div>

      <Footer />
    </>
  );
}
