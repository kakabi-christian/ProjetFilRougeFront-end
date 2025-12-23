import React, { useState, useEffect } from 'react';
import { Calendar, Clock, BookOpen, CheckCircle, AlertCircle, Award } from 'lucide-react'; // Si tu as lucide-react, sinon remplace par des emojis
import candidatService from '../services/candidatService';

const colorGreen = '#25963F';
const colorBlue = '#1E90FF';

export default function CandidatHomeContent() {
  const [concoursInfo, setConcoursInfo] = useState({ intitule: '' });
  const [targetDate, setTargetDate] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem('user'));
  const userName = user?.nom || 'Candidat';
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;
    const fetchDashboardData = async () => {
      try {
        const info = await candidatService.getDashboardConcoursInfo(userId);
        setConcoursInfo(info);
        const countdownData = await candidatService.getDashboardCountdown(userId);
        if (countdownData?.dateTarget) {
          setTargetDate(new Date(countdownData.dateTarget));
        }
        setLoading(false);
      } catch (error) {
        console.error("Erreur chargement dashboard", error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [userId]);

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
                  Bienvenue sur votre espace de préparation pour le <span className="fw-bold" style={{ color: colorGreen }}>{concoursInfo.intitule || 'Concours'}</span>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* 2. SECTION COMPTE À REBOURS (GAUCHE) */}
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
                  La date officielle est fixée au : <span className="text-primary">{targetDate ? targetDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'À définir'}</span>
                </small>
              </div>
            </div>
          </div>

          {/* 3. CONSEILS DE PRÉPARATION */}
          <div className="card border-0 shadow-sm rounded-4" style={{width:'1140px'}}>
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h5 className="fw-bold d-flex align-items-center">
                <BookOpen className="me-2" size={20} color={colorGreen} />
                CONSEILS POUR RÉUSSIR
              </h5>
            </div>
            <div className="card-body px-4 pb-4">
              <div className="row g-3">
                <TipItem 
                  title="Organisation" 
                  text="Prévoyez au moins 2h de révision par jour. La régularité est la clé du succès." 
                />
                <TipItem 
                  title="Documents" 
                  text="Assurez-vous que votre dossier est complet avant la fermeture des inscriptions." 
                />
                <TipItem 
                  title="Repos" 
                  text="Ne négligez pas votre sommeil. Un cerveau reposé mémorise beaucoup mieux." 
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. SIDEBAR (DROITE) : ÉTAT DU DOSSIER */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 text-white mb-4" style={{ backgroundColor: colorGreen }}>
            <div className="card-body p-4 text-center">
              <CheckCircle size={50} className="mb-3" />
              <h4 className="fw-bold">Dossier Actif</h4>
              <p className="opacity-75">Votre candidature est en cours de traitement par l'administration.</p>
              <hr />
              <button className="btn btn-light w-100 fw-bold rounded-pill shadow-sm" style={{ color: colorGreen }}>
                Voir mes documents
              </button>
            </div>
          </div>

          
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
      <div className="small fw-bold text-uppercase mt-2 d-md-none" style={{ fontSize: '0.6rem', color: '#636e72' }}>{label}</div>
      <div className="small fw-bold text-uppercase mt-2 d-none d-md-block text-muted">{label}</div>
    </div>
  );
}

function TipItem({ title, text }) {
  return (
    <div className="col-md-4">
      <div className="h-100 p-3 rounded-3 border">
        <h6 className="fw-bold text-dark">{title}</h6>
        <p className="small text-muted mb-0">{text}</p>
      </div>
    </div>
  );
}

function StepItem({ text, done, last }) {
  return (
    <li className={`d-flex align-items-center ${!last ? 'mb-3' : ''}`}>
      <div 
        className={`rounded-circle d-flex align-items-center justify-content-center me-3`} 
        style={{ 
          width: '24px', 
          height: '24px', 
          backgroundColor: done ? `${colorGreen}20` : '#f1f2f6',
          border: `1px solid ${done ? colorGreen : '#dfe6e9'}`
        }}
      >
        {done && <CheckCircle size={14} color={colorGreen} />}
      </div>
      <span className={done ? 'text-dark' : 'text-muted'}>{text}</span>
    </li>
  );
}