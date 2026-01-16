import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../services/authService';

export default function LoginContent() {
  const [codeAdmin, setCodeAdmin] = useState('');
  const [password, setPassword] = useState('');
  const [numeroRecu, setNumeroRecu] = useState('');
  const [userType, setUserType] = useState('CANDIDATE'); 
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState(''); // Nouveau : pour le message de redirection
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      // 1. Préparation du payload
      let payload = { userType, password };

      if (userType === 'ADMIN' || userType === 'SUPERADMIN') {
        payload.codeAdmin = codeAdmin;
      } else if (userType === 'CANDIDATE') {
        payload.numeroRecu = numeroRecu;
      }

      // 2. Appel au service de connexion
      const data = await loginUser(payload);
      
      // 3. Sauvegarde du Token et des infos essentielles
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.user?.candidateId) {
          localStorage.setItem('candidateId', data.user.candidateId);
        }
      }

      // 4. Logique de redirection intelligente
      const role = data.user.userType;

      if (role === 'ADMIN' || role === 'SUPERADMIN') {
        navigate('/admin/statistiques');
      } 
      else if (role === 'CANDIDATE') {
        const step = data.registrationStep;

        if (step === 0) {
          // Tout est ok
          navigate('/candidat/home');
        } else {
          // --- LOGIQUE DE REDIRECTION AVEC MESSAGE (3s) ---
          setInfoMessage(`Inscription incomplète. Redirection vers l'étape ${step} dans 3 secondes...`);
          
          const stepRoutes = {
            2: '/Step2Register',
            3: '/Step3Register',
            4: '/Step4Register'
          };

          // On attend 3 secondes avant de naviguer
          setTimeout(() => {
            navigate(stepRoutes[step] || '/Step2Register');
          }, 3000);
        }
      }

    } catch (err) {
      console.error(err);
      setError(err.message || 'Identifiants invalides ou accès refusé.');
      setLoading(false); // On arrête le chargement seulement en cas d'erreur ici
    }
    // Note: setLoading(false) n'est pas mis dans finally car en cas de redirection réussie, 
    // on veut garder l'état visuel "occupé" pendant les 3s.
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="card p-5 shadow-lg border-0" style={{ width: '100%', maxWidth: '450px' }}>
        <h2 className="card-title text-center mb-4 text-primary fw-bold">
          <i className="bi bi-person-circle me-2"></i> Connexion
        </h2>

        {/* --- ALERTES : ERREUR OU INFO --- */}
        {error && (
          <div className="alert alert-danger text-center mb-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {infoMessage && (
          <div className="alert alert-info text-center mb-3" role="alert">
            <div className="spinner-border spinner-border-sm me-2" role="status"></div>
            {infoMessage}
          </div>
        )}

        <form onSubmit={handleLogin}>
          {/* Sélecteur de rôle */}
          <div className="mb-3">
            <label className="form-label fw-medium"><i className="bi bi-person-badge-fill me-2"></i> Rôle</label>
            <select
              className="form-select"
              value={userType}
              onChange={(e) => { setUserType(e.target.value); setError(''); setInfoMessage(''); }}
              disabled={loading}
            >
              <option value="CANDIDATE">Candidat</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          {/* Champs STAFF */}
          {(userType === 'ADMIN' || userType === 'SUPERADMIN') && (
            <>
              <div className="mb-3">
                <label className="form-label fw-medium">Code Admin</label>
                <input
                  type="text"
                  className="form-control"
                  value={codeAdmin}
                  onChange={(e) => setCodeAdmin(e.target.value)}
                  placeholder="Ex: ADMIN-2025-XXXX"
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-medium">Mot de passe</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          {/* Champs Candidat */}
          {userType === 'CANDIDATE' && (
            <>
              <div className="mb-3">
                <label className="form-label fw-medium">Numéro de reçu</label>
                <input
                  type="text"
                  className="form-control"
                  value={numeroRecu}
                  onChange={(e) => setNumeroRecu(e.target.value)}
                  placeholder="Numéro de reçu"
                  required
                  disabled={loading}
                />
              </div>
              <div className="mb-4">
                <label className="form-label fw-medium">Mot de passe</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary w-100 btn-lg" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Traitement...
              </>
            ) : (
              'Se connecter'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}