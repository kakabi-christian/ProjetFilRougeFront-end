// src/Contents/PaiementContent.jsx
import React, { useState, useEffect } from 'react';
import { getConcours } from '../services/concoursService';
import { createPaiement } from '../services/paiementService';
import { generatePDF } from '../services/pdfService';
import LogoMTN from '../Assets/logo-mtn.jpg';
import LogoOrange from '../Assets/logo-orange.jpg';
import { Link } from 'react-router-dom';

// Vos codes couleurs
const colorGreen = "#25963F";
const colorBlue = "#1E90FF";

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
  const [isProcessing, setIsProcessing] = useState(false);

  // ÉTATS POUR LA MODALE DE CODE SECRET
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState('');

  useEffect(() => {
    getConcours()
      .then((response) => {
        const dataArray = response.data?.data || response.data || [];
        setConcours(Array.isArray(dataArray) ? dataArray : []);
      })
      .catch(err => {
        console.error("Erreur lors de la récupération des concours:", err);
        setConcours([]);
      });
  }, []);

  // Étape 1 : Ouvrir la modale
  const handleOpenPinModal = (e) => {
    e.preventDefault();
    if (!selectedConcours || !nomComplet || !prenom || !email || !telephone || !modePaiement) {
      alert('Veuillez remplir tous les champs');
      return;
    }
    setShowPinModal(true);
  };

  // Étape 2 : Traitement final (Validation manuelle par bouton)
  const handleFinalSubmit = async () => {
    // Vérification simple : au moins 4 chiffres pour tout le monde
    if (pinCode.length < 4) {
        alert("Veuillez saisir votre code secret à 4 chiffres.");
        return;
    }

    setShowPinModal(false);
    setIsProcessing(true);

    const paiementData = {
      nomComplet,
      prenom,
      email,
      telephone,
      concoursId: selectedConcours,
      modePaiement,
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulation délai
      const result = await createPaiement(paiementData);
      setPaiement(result.paiement);
      setRecu(result.recu);
    } catch (error) {
      console.error(error);
      alert('Erreur lors du paiement. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
      setPinCode('');
    }
  };

  if (isProcessing) {
    return (
      <div className="container mt-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ height: '70vh' }}>
        <h2 className='mb-4 fw-bold' style={{ color: colorGreen }}>Transaction en cours de traitement...</h2>
        <div className="spinner-border" style={{ width: '4rem', height: '4rem', color: colorGreen }} role="status">
          <span className="visually-hidden">Traitement...</span>
        </div>
        <p className="mt-4 lead text-muted">Veuillez ne pas rafraîchir la page.</p>
        <p className='text-danger fw-bold'>**NE PAS FERMER CETTE FENÊTRE**</p>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Paiement des frais de concours</h2>

      {!recu ? (
        <form onSubmit={handleOpenPinModal} className="shadow-sm p-4 border rounded bg-white">
          <div className="mb-3">
            <label className="form-label fw-bold">Concours:</label>
            <select className="form-select" value={selectedConcours} onChange={(e) => setSelectedConcours(e.target.value)} required>
              <option value="">-- Choisir un concours --</option>
              {Array.isArray(concours) && concours.map((c) => (
                <option key={c.id} value={c.id}>{c.intitule} - {c.montant?.toLocaleString()} FCFA</option>
              ))}
            </select>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Nom complet:</label>
              <input className="form-control" value={nomComplet} onChange={(e) => setNomComplet(e.target.value)} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Prénom:</label>
              <input className="form-control" value={prenom} onChange={(e) => setPrenom(e.target.value)} required />
            </div>
          </div>

          <div className="row">
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Email:</label>
              <input className="form-control" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="col-md-6 mb-3">
              <label className="form-label fw-bold">Téléphone:</label>
              <input className="form-control" value={telephone} onChange={(e) => setTelephone(e.target.value)} required placeholder="Ex: 6XXXXXXXX" />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-bold">Mode de paiement:</label>
            <div className="d-flex gap-4 mt-2">
              <label className="d-flex flex-column align-items-center" style={{ cursor: 'pointer' }}>
                <input type="radio" name="modePaiement" value="MTN_MOMO" checked={modePaiement === 'MTN_MOMO'} onChange={(e) => setModePaiement(e.target.value)} required className="mb-2" />
                <img src={LogoMTN} alt="MTN Momo" width={80} className="rounded shadow-sm" />
              </label>
              <label className="d-flex flex-column align-items-center" style={{ cursor: 'pointer' }}>
                <input type="radio" name="modePaiement" value="ORANGE_MONEY" checked={modePaiement === 'ORANGE_MONEY'} onChange={(e) => setModePaiement(e.target.value)} required className="mb-2" />
                <img src={LogoOrange} alt="Orange Money" width={80} className="rounded shadow-sm" />
              </label>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <button className="btn text-white px-5 py-2 fw-bold shadow-sm" style={{ backgroundColor: colorGreen }} type="submit">
              Payer maintenant
            </button>
            <Link to="/ForgotRecu" className="btn btn-outline-danger shadow-sm">J'ai oublié mon numéro de reçu</Link>
          </div>
        </form>
      ) : (
        <div className="mt-4 card p-4 shadow" style={{ borderTop: `4px solid ${colorGreen}` }}>
            <h3 className="mb-4 text-center fw-bold" style={{ color: colorGreen }}>Paiement Terminé !</h3>
            <div className="row align-items-center text-center text-md-start">
              <div className="col-md-8 border-end">
                <p><strong>ID Transaction:</strong> {paiement?.numeroTransaction}</p>
                <p><strong>N° de reçu:</strong> <span className="fw-bold" style={{ color: colorBlue }}>{recu.numeroRecu}</span></p>
                <p><strong>Montant payé:</strong> {recu.montant?.toLocaleString()} FCFA</p>
                <p><strong>Candidat:</strong> {nomComplet} {prenom}</p>
              </div>
              <div className="col-md-4 text-center">
                {recu.qrCode && <img src={recu.qrCode} alt="QR Code" width={140} className="border p-1 bg-white shadow-sm" />}
              </div>
            </div>
            <div className="text-center mt-4">
              <button className="btn btn-lg px-5 shadow text-white" style={{ backgroundColor: colorBlue }} onClick={() => generatePDF({ paiement, recu })}>
                Télécharger le Reçu PDF
              </button>
            </div>
        </div>
      )}

      {/* MODALE DE SAISIE DU CODE PIN (Fixé à 4 chiffres pour tous) */}
      {showPinModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered modal-sm">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header border-0 text-white justify-content-center" style={{ backgroundColor: modePaiement === 'ORANGE_MONEY' ? '#FF6600' : colorBlue }}>
                <h5 className="modal-title fw-bold">
                   {modePaiement === 'ORANGE_MONEY' ? 'ORANGE MONEY' : 'MTN MOMO'}
                </h5>
              </div>
              <div className="modal-body p-4 text-center">
                <p className="mb-3 fw-bold">Saisissez votre code secret</p>
                <input 
                  type="password" 
                  className="form-control form-control-lg text-center fw-bold mb-4" 
                  style={{ letterSpacing: '12px', fontSize: '28px', borderColor: colorBlue, borderSize: '2px' }}
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  autoFocus
                />
                
                <div className="d-grid gap-2">
                    <button className="btn text-white fw-bold py-2 shadow-sm" style={{ backgroundColor: colorBlue }} onClick={handleFinalSubmit}>
                        CONFIRMER LE PAIEMENT
                    </button>
                    <button className="btn btn-link text-decoration-none text-muted" onClick={() => {setShowPinModal(false); setPinCode('');}}>
                        Annuler la transaction
                    </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}