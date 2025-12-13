// src/Components/ForgotRecu.jsx
import React, { useState } from 'react';
import { findRecuByEmail } from '../services/paiementService';
import jsPDF from 'jspdf';

export default function ForgotRecu() {
  const [email, setEmail] = useState('');
  const [recu, setRecu] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setRecu(null);

    try {
      const data = await findRecuByEmail(email);
      // Simuler un chargement de 4 secondes
      setTimeout(() => {
        setRecu(data);
        setLoading(false);
      }, 4000);
    } catch (err) {
      setTimeout(() => {
        setError('Aucun reçu trouvé pour cet email.');
        setLoading(false);
      }, 4000);
    }
  };

  const handleDownloadPDF = () => {
    if (!recu) return;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reçu de Paiement', 20, 20);
    doc.setFontSize(12);
    doc.text(`Numéro du reçu: ${recu.numeroRecu}`, 20, 40);
    doc.text(`Nom: ${recu.paiement.nomComplet}`, 20, 50);
    doc.text(`Email: ${recu.paiement.email}`, 20, 60);
    doc.text(`Téléphone: ${recu.paiement.telephone}`, 20, 70);
    doc.text(`Concours: ${recu.concours}`, 20, 80);
    doc.text(`Montant: ${recu.montant}`, 20, 90);

    if (recu.qrCode) {
      doc.addImage(recu.qrCode, 'PNG', 20, 100, 60, 60); // QR Code en base64
    }

    doc.save(`${recu.numeroRecu}.pdf`);
  };

  return (
    <div className="container mt-5 mb-5">
      <h2>Retrouver votre reçu</h2>
      <div className="mb-3">
        <label htmlFor="email" className="form-label">Email :</label>
        <input
          type="email"
          id="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '500px' }}
        />
      </div>
      <button className="btn btn-primary" onClick={handleSearch} disabled={loading}>
        {loading ? (
          <>
            <span className="spinner-border spinner-border-sm me-2" role="status" />
            Recherche en cours...
          </>
        ) : 'Rechercher le reçu'}
      </button>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {recu && (
        <div className="mt-4 card p-3">
          <h5>Reçu trouvé :</h5>
          <p><strong>Numéro du reçu :</strong> {recu.numeroRecu}</p>
          <p><strong>Nom :</strong> {recu.paiement.nomComplet}</p>
          <p><strong>Email :</strong> {recu.paiement.email}</p>
          <p><strong>Téléphone :</strong> {recu.paiement.telephone}</p>
          <p><strong>Concours :</strong> {recu.concours}</p>
          <p><strong>Montant :</strong> {recu.montant}</p>
          {recu.qrCode && (
            <img src={recu.qrCode} alt="QR Code" style={{ width: 150, height: 150 }} />
          )}
          <button className="btn btn-success mt-3" onClick={handleDownloadPDF}>
            Télécharger le PDF
          </button>
        </div>
      )}
    </div>
  );
}
