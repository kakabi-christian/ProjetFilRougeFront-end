import React, { useState } from 'react';
import { loginUser } from '../services/authService';

export default function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [numeroRecu, setNumeroRecu] = useState('');
  const [userType, setUserType] = useState('CANDIDATE'); // rôle par défaut
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Simulation d'un délai pour l'animation (ex: 1.5 secondes)
      await new Promise(resolve => setTimeout(resolve, 1500)); 

      let payload = { email, userType };

      if (userType === 'ADMIN') {
        payload.password = password;
      } else if (userType === 'CANDIDATE') {
        payload.numeroRecu = numeroRecu;
      }

      const data = await loginUser(payload);
      console.log('Login réussi :', data);
      alert(`Bienvenue ${data.user.nom}`);
      
      // Ici, vous ajouteriez la navigation vers le tableau de bord
      // Exemple: navigate('/dashboard');

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Identifiants invalides ou reçu incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="container d-flex justify-content-center align-items-center" 
      style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}
    >
      <div 
        className="card p-5 shadow-lg border-0" 
        style={{ width: '100%', maxWidth: '450px' }}
      >
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
              onChange={(e) => {
                setUserType(e.target.value);
                setError(''); // Effacer l'erreur en cas de changement de rôle
              }}
            >
              <option value="CANDIDATE">Candidat</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>

          {/* Email */}
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

          {/* Champs spécifiques au rôle */}
          
          {/* Mot de passe pour admin */}
          {userType === 'ADMIN' && (
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
          )}

          {/* Numéro de reçu pour candidat */}
          {userType === 'CANDIDATE' && (
            <div className="mb-4">
              <label className="form-label fw-medium"><i className="bi bi-receipt-cutoff me-2"></i> Numéro de reçu</label>
              <input
                type="text"
                className="form-control"
                value={numeroRecu}
                onChange={(e) => setNumeroRecu(e.target.value)}
                placeholder="Entrez votre numéro de reçu de paiement"
                required
              />
            </div>
          )}

          {/* Bouton de connexion */}
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

          {/* Affichage des erreurs */}
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