// src/Contents/PaiementContent.jsx
import React, { useState, useEffect } from 'react';
import { getConcours } from '../services/concoursService';
import { createPaiement } from '../services/paiementService';
import { generatePDF } from '../services/pdfService';
import LogoMTN from '../Assets/logo-mtn.jpg';
import LogoOrange from '../Assets/logo-orange.jpg';
import { Link } from 'react-router-dom';

export default function PaiementContent() {
  const [concours, setConcours] = useState([]);
  const [selectedConcours, setSelectedConcours] = useState('');
  const [nomComplet, setNomComplet] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [modePaiement, setModePaiement] = useState('');
  const [paiement, setPaiement] = useState(null);
  const [recu, setRecu] = useState(null);

  useEffect(() => {
    getConcours()
      .then((data) => setConcours(data))
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedConcours || !nomComplet || !prenom || !email || !telephone || !modePaiement) {
      alert('Veuillez remplir tous les champs');
      return;
    }

    const paiementData = {
      nomComplet,
      prenom, // cohérence avec backend
      email,
      telephone,
      concoursId: selectedConcours, // ID du concours sélectionné
      modePaiement,
    };

    try {
      const result = await createPaiement(paiementData);
      setPaiement(result.paiement);
      setRecu(result.recu);
    } catch (error) {
      console.error(error);
      alert('Erreur lors du paiement');
    }
  };

  return (
    <div className="container mt-5">
      <h2>Paiement des frais de concours</h2>

      {!recu ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Concours:</label>
            <select
              className="form-select"
              value={selectedConcours}
              onChange={(e) => setSelectedConcours(e.target.value)}
            >
              <option value="">-- Choisir un concours --</option>
              {concours.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.intitule} - {c.montant} FCFA
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label>Nom complet:</label>
            <input
              className="form-control"
              value={nomComplet}
              onChange={(e) => setNomComplet(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Prénom:</label>
            <input
              className="form-control"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Email:</label>
            <input
              className="form-control"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Téléphone:</label>
            <input
              className="form-control"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label>Mode de paiement:</label>
            <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="modePaiement"
                  value="MTN_MOMO"
                  checked={modePaiement === 'MTN_MOMO'}
                  onChange={(e) => setModePaiement(e.target.value)}
                />
                <img src={LogoMTN} alt="MTN Momo" width={100} />
              </label>
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="modePaiement"
                  value="ORANGE_MONEY"
                  checked={modePaiement === 'ORANGE_MONEY'}
                  onChange={(e) => setModePaiement(e.target.value)}
                />
                <img src={LogoOrange} alt="Orange Money" width={100} />
              </label>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2 mb-3">
            <button className="btn btn-success" type="submit">Payer</button>
            <Link to="/ForgotRecu" className="btn btn-danger">
              J'ai oublié mon numéro de reçu
            </Link>
          </div>
        </form>
      ) : (
        <div className="mt-4">
          <h3>Reçu généré !</h3>
          <p>Numéro de transaction: {paiement?.numeroTransaction}</p>
          <p>Numéro de reçu: {recu.numeroRecu}</p>
          <p>Montant: {recu.montant} FCFA</p>
          <p>Téléphone: {recu.telephone}</p>
          <p>Concours: {recu.concours}</p>
          {recu.qrCode && <img src={recu.qrCode} alt="QR Code" width={150} />}
          <div className="mt-3">
            <button
              className="btn btn-primary"
              onClick={() => generatePDF({ paiement, recu })}
            >
              Télécharger le PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
