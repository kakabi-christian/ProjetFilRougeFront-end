import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyRecuForRegistration, getPaiementInfoByRecu } from '../services/paiementService';

export default function VerifyRecu() {
  const [numeroRecu, setNumeroRecu] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Vérifie le reçu
      const recuData = await verifyRecuForRegistration(numeroRecu);
      console.log('[VerifyRecu] Reçu validé :', recuData);

      // Récupère les infos du paiement pour pré-remplir Step1Register
      const paiementInfo = await getPaiementInfoByRecu(numeroRecu);
      console.log('[VerifyRecu] Infos paiement :', paiementInfo);

      // Redirection vers Step1Register avec les infos
      navigate('/Step1Register', {
        state: { numeroRecu, paiementInfo },
      });

    } catch (err) {
      console.error('[VerifyRecu] Erreur :', err);
      setError(err.response?.data?.message || 'Erreur lors de la vérification du reçu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card p-4" style={{ width: '100%', maxWidth: '400px', marginBottom: '5rem' }}>
        <h3 className="card-title mb-4 text-center">Vérification du Reçu</h3>
        <form onSubmit={handleVerify}>
          <div className="mb-2">
            <label htmlFor="numeroRecu" className="form-label">Numéro de reçu :</label>
            <input
              type="text"
              className="form-control"
              id="numeroRecu"
              value={numeroRecu}
              onChange={(e) => setNumeroRecu(e.target.value)}
              placeholder="Entrez le numéro de reçu"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? 'Vérification...' : 'Vérifier'}
          </button>
        </form>
        {error && <div className="alert alert-danger mt-5">{error}</div>}
      </div>
    </div>
  );
}
