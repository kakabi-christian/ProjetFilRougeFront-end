import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';

export default function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [numeroRecu, setNumeroRecu] = useState('');
  const [userType, setUserType] = useState('CANDIDATE'); 
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulation d'un petit délai pour le UX
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      let payload = { userType };

      if (userType === 'ADMIN') {
        payload.email = email;
        payload.password = password;
      } else if (userType === 'CANDIDATE') {
        payload.numeroRecu = numeroRecu;
        payload.password = password; 
      }

      const data = await loginUser(payload);
      console.log('Login réussi :', data);

      // ============================================================
      // ✅ MISE À JOUR : SAUVEGARDE DU TOKEN ET DE L'UTILISATEUR
      // ============================================================
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        // On stocke aussi l'objet user pour l'utiliser dans le header/profil
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      // ============================================================

      // 🔹 Redirection selon le rôle
      if (data.user.userType === 'ADMIN') {
        navigate('/admin/statistiques');
      } else if (data.user.userType === 'CANDIDATE') {
        navigate('/CandidateInfo');
      }

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Identifiants invalides ou reçu incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="card p-5 shadow-lg border-0" style={{ width: '100%', maxWidth: '450px' }}>
        <h2 className="card-title text-center mb-4 text-primary fw-bold">
          <i className="bi bi-person-circle me-2"></i> Connexion
        </h2>

        <form onSubmit={handleLogin}>
          {/* Sélecteur de rôle */}
          <div className="mb-3">
            <label className="form-label fw-medium"><i className="bi bi-person-badge-fill me-2"></i> Rôle</label>
            <select
              className="form-select"
              value={userType}
              onChange={(e) => { setUserType(e.target.value); setError(''); }}
            >
              <option value="CANDIDATE">Candidat</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          {/* Champs admin */}
          {userType === 'ADMIN' && (
            <>
              <div className="mb-3">
                <label className="form-label fw-medium"><i className="bi bi-envelope-fill me-2"></i> Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.com"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-medium"><i className="bi bi-lock-fill me-2"></i> Mot de passe</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {/* Champs candidat */}
          {userType === 'CANDIDATE' && (
            <div className="mb-4">
              <label className="form-label fw-medium"><i className="bi bi-receipt-cutoff me-2"></i> Numéro de reçu</label>
              <input
                type="text"
                className="form-control"
                value={numeroRecu}
                onChange={(e) => setNumeroRecu(e.target.value)}
                placeholder="Entrez votre numéro de reçu"
                required
              />
              <label className="form-label fw-medium mt-3"><i className="bi bi-lock-fill me-2"></i> Mot de passe</label>
              <input
                type="password"
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Votre mot de passe"
                required
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Connexion...
              </>
            ) : (
              'Se connecter'
            )}
          </button>

          {error && (
            <div className="alert alert-danger mt-3 text-center" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}