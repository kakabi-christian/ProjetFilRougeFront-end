import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, CheckCircle, AlertCircle, Award, QrCode, FileText } from 'lucide-react';
import candidatService from '../services/candidatService';
import DossierService from '../services/DossierService'; // Import du service Dossier

const colorGreen = '#25963F';
const colorBlue = '#1E90FF';

export default function CandidatHomeContent() {
  const [concoursInfo, setConcoursInfo] = useState({ intitule: '' });
  const [targetDate, setTargetDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState(null); // État pour le QR Code

  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user?.nom || 'Candidat';
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    const fetchDashboardData = async () => {
      try {
        // 1. Infos Concours
        const info = await candidatService.getDashboardConcoursInfo(userId);
        setConcoursInfo(info);

        // 2. Compte à rebours
        const countdownData = await candidatService.getDashboardCountdown(userId);
        if (countdownData?.dateTarget) {
          setTargetDate(new Date(countdownData.dateTarget));
        }

        // 3. Récupération du QR Code (si dossier validé)
        try {
          const qrData = await DossierService.getCandidateQrCode(userId);
          if (qrData?.qrCode) setQrCode(qrData.qrCode);
        } catch (e) {
          console.log("QR Code non encore disponible");
        }

        setLoading(false);
      } catch (error) {
        console.error("Erreur chargement dashboard", error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [userId]);

  // Logique du timer (inchangée)
  useEffect(() => {
    if (!targetDate) return;
    const updateCountdown = () => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return false;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        mins: Math.floor((difference / 1000 / 60) % 60),
        secs: Math.floor((difference / 1000) % 60),
      });
      return true;
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const handleDownloadReceipt = () => {
    // Redirection vers l'endpoint PDF de ton backend
    window.open(`http://localhost:3000/dossiers/verify/${userId}`, '_blank');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <div className="spinner-border" style={{ color: colorBlue }} role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4 animate__animated animate__fadeIn" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      
      {/* 1. HEADER DE BIENVENUE */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="bg-white p-4 rounded-4 shadow-sm border-bottom border-4" style={{ borderColor: colorBlue }}>
            <div className="d-flex align-items-center">
              <div className="me-4 d-none d-md-block">
                <div className="rounded-circle p-3" style={{ backgroundColor: `${colorBlue}20` }}>
                  <Award size={40} color={colorBlue} />
                </div>
              </div>
              <div>
                <h2 className="fw-bold mb-1" style={{ color: '#2d3436' }}>
                  Bonjour, <span style={{ color: colorBlue }}>{userName}</span> !
                </h2>
                <p className="text-muted mb-0 fs-5">
                  Bienvenue sur votre espace pour le <span className="fw-bold" style={{ color: colorGreen }}>{concoursInfo.intitule || 'Concours'}</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* 2. SECTION COMPTE À REBOURS & CONSEILS */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h5 className="fw-bold d-flex align-items-center">
                <Clock className="me-2" size={20} color={colorBlue} />
                TEMPS RESTANT AVANT L'ÉPREUVE
              </h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3 text-center">
                <CountdownItem value={timeLeft.days} label="Jours" color={colorBlue} />
                <CountdownItem value={timeLeft.hours} label="Heures" color={colorGreen} />
                <CountdownItem value={timeLeft.mins} label="Minutes" color="#34495e" />
                <CountdownItem value={timeLeft.secs} label="Secondes" color="#e74c3c" />
              </div>
              <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: '#eef2f7', borderLeft: `4px solid ${colorBlue}` }}>
                <small className="text-dark fw-medium">
                  <AlertCircle size={16} className="me-2" />
                  Date du concours : <span className="text-primary">{targetDate ? targetDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'À définir'}</span>
                </small>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h5 className="fw-bold d-flex align-items-center">
                <BookOpen className="me-2" size={20} color={colorGreen} />
                CONSEILS POUR RÉUSSIR
              </h5>
            </div>
            <div className="card-body px-4 pb-4">
              <div className="row g-3">
                <TipItem title="Organisation" text="Prévoyez au moins 2h de révision par jour. La régularité est la clé du succès." />
                <TipItem title="Documents" text="Imprimez votre récépissé final dès que votre dossier est validé." />
                <TipItem title="Repos" text="Ne négligez pas votre sommeil. Un cerveau reposé mémorise beaucoup mieux." />
              </div>
            </div>
          </div>
        </div>

        {/* 3. SIDEBAR : ÉTAT & QR CODE */}
        <div className="col-lg-4">
          {/* Status Card */}
          <div className="card border-0 shadow-sm rounded-4 text-white mb-4" style={{ backgroundColor: qrCode ? colorGreen : '#636e72' }}>
            <div className="card-body p-4 text-center">
              <CheckCircle size={50} className="mb-3" />
              <h4 className="fw-bold">{qrCode ? 'Dossier Validé' : 'Dossier en cours'}</h4>
              <p className="opacity-75 small">
                {qrCode 
                  ? 'Votre candidature est prête. Téléchargez vos documents officiels.' 
                  : 'L\'administration vérifie actuellement vos pièces justificatives.'}
              </p>
            </div>
          </div>

          {/* QR Code Card (S'affiche uniquement si qrCode existe) */}
          {qrCode && (
            <div className="card border-0 shadow-sm rounded-4 mb-4 animate__animated animate__zoomIn">
              <div className="card-body p-4 text-center">
                <div className="d-flex align-items-center justify-content-center mb-3">
                  <QrCode size={20} className="me-2 text-primary" />
                  <span className="fw-bold text-dark">VOTRE PASSE D'EXAMEN</span>
                </div>
                <div className="p-3 bg-light rounded-3 d-inline-block border">
                  <img src={qrCode} alt="QR Code Examen" style={{ width: '160px', height: '160px' }} />
                </div>
                <p className="text-muted small mt-3">
                  Présentez ce QR code à l'entrée de la salle d'examen.
                </p>
                <button 
                  onClick={handleDownloadReceipt}
                  className="btn btn-primary w-100 fw-bold rounded-pill shadow-sm d-flex align-items-center justify-content-center py-2"
                >
                  <FileText size={18} className="me-2" />
                  Télécharger le Récépissé
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- SOUS-COMPOSANTS ---
function CountdownItem({ value, label, color }) {
  return (
    <div className="col-3 col-md-3">
      <div className="rounded-4 p-3 shadow-sm text-white" style={{ backgroundColor: color }}>
        <div className="h2 fw-bold mb-0">{value.toString().padStart(2, '0')}</div>
        <div className="small text-uppercase opacity-75 d-none d-md-block" style={{ fontSize: '0.7rem' }}>{label}</div>
      </div>
      <div className="small fw-bold text-uppercase mt-2 d-none d-md-block text-muted">{label}</div>
    </div>
  );
}

function TipItem({ title, text }) {
  return (
    <div className="col-md-4">
      <div className="h-100 p-3 rounded-3 border bg-white">
        <h6 className="fw-bold text-dark">{title}</h6>
        <p className="small text-muted mb-0">{text}</p>
      </div>
    </div>
  );
}