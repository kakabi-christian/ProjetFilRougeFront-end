import React, { useState, useEffect } from 'react';
import { Star, Send, CheckCircle, Smartphone, X } from 'lucide-react';

const colorBlue = '#1E90FF';
const colorGreen = '#25963F';

export default function FeedBackContent() {
  const user = { id: 123 }; // Simulation
  const userId = user?.id;

  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleSubmit = () => {
    if (!userId) return;

    setLoading(true);
    
    // Simulation d'envoi
    setTimeout(() => {
      setShowAlert(true);
      setRating(5);
      setComment('');
      setLoading(false);
      
      // Disparition après 3 secondes
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    }, 800);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* ALERT CUSTOM EN HAUT DE L'ÉCRAN */}
      <CustomAlert 
        show={showAlert} 
        onClose={() => setShowAlert(false)}
      />

      {/* CONTENU PRINCIPAL */}
      <div className="d-flex justify-content-center align-items-center p-3 pt-0">
        <div className="card border-0 shadow-lg rounded-4 w-100" style={{ maxWidth: '500px', marginTop: showAlert ? '80px' : '50px', transition: 'margin-top 0.3s ease' }}>
          <div className="card-body p-5">
            <div className="text-center mb-4">
              <div 
                className="rounded-circle d-inline-flex p-4 mb-3 position-relative"
                style={{ 
                  background: `linear-gradient(135deg, ${colorBlue}20 0%, ${colorGreen}20 100%)`,
                  border: `3px solid ${colorBlue}`
                }}
              >
                <Smartphone size={40} style={{ color: colorBlue }} />
              </div>
              <h4 className="fw-bold mb-2" style={{ color: '#2d3436' }}>
                Notez votre expérience
              </h4>
              <p className="text-muted mb-0">
                Votre avis nous aide à améliorer l'application
              </p>
            </div>

            <div>
              {/* ÉTOILES */}
              <div className="text-center mb-4">
                <div className="d-flex justify-content-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="btn p-0 border-0"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHover(star)}
                      onMouseLeave={() => setHover(0)}
                      style={{
                        transform: (hover || rating) >= star ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.2s ease'
                      }}
                    >
                      <Star
                        size={40}
                        fill={(hover || rating) >= star ? "#FFD700" : "none"}
                        color={(hover || rating) >= star ? "#FFD700" : "#dee2e6"}
                        style={{ 
                          transition: 'all 0.2s ease',
                          filter: (hover || rating) >= star ? 'drop-shadow(0 2px 4px rgba(255,215,0,0.3))' : 'none'
                        }}
                      />
                    </button>
                  ))}
                </div>
                <div className="text-muted small">
                  {rating === 1 && "😞 Très insatisfait"}
                  {rating === 2 && "😕 Insatisfait"}
                  {rating === 3 && "😐 Neutre"}
                  {rating === 4 && "😊 Satisfait"}
                  {rating === 5 && "🤩 Très satisfait"}
                </div>
              </div>

              {/* COMMENTAIRE */}
              <div className="mb-4">
                <label className="form-label fw-semibold text-dark small">
                  Votre commentaire (optionnel)
                </label>
                <textarea
                  className="form-control border-2 rounded-3 p-3"
                  rows="4"
                  placeholder="Partagez votre expérience avec nous..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ 
                    resize: 'none', 
                    fontSize: '0.95rem',
                    borderColor: '#e9ecef',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.target.style.borderColor = colorBlue}
                  onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
                ></textarea>
              </div>

              {/* BOUTON ENVOI */}
              <button
                type="button"
                disabled={loading}
                onClick={handleSubmit}
                className="btn w-100 py-3 fw-bold text-white rounded-3 shadow-lg d-flex align-items-center justify-content-center gap-2"
                style={{ 
                  background: loading ? '#95a5a6' : `linear-gradient(135deg, ${colorBlue} 100%, ${colorGreen} 0%)`,
                  border: 'none',
                  fontSize: '1rem',
                  transition: 'all 0.3s ease',
                  transform: 'translateY(0)'
                }}
              
               
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Envoi en cours...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Envoyer mon avis</span>
                  </>
                )}
              </button>
            </div>

            {/* FOOTER */}
            <div className="text-center mt-4">
              <small className="text-muted">
                🔒 Vos données sont sécurisées et confidentielles
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// COMPOSANT ALERT PERSONNALISÉ
function CustomAlert({ show, onClose }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      setIsLeaving(false);
    } else if (isVisible) {
      setIsLeaving(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsLeaving(false);
      }, 300);
    }
  }, [show, isVisible]);

  if (!isVisible && !isLeaving) return null;

  return (
    <div 
      className="position-fixed w-100 d-flex justify-content-center px-3"
      style={{ 
        top: '20px', 
        left: 0,
        zIndex: 9999,
        animation: isLeaving ? 'slideUp 0.3s ease-out' : 'slideDown 0.3s ease-out',
        pointerEvents: 'none'
      }}
    >
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-100%);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes slideUp {
            from {
              opacity: 1;
              transform: translateY(0);
            }
            to {
              opacity: 0;
              transform: translateY(-100%);
            }
          }
          
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.1);
            }
          }
        `}
      </style>
      
      <div 
        className="shadow-lg rounded-4 d-flex align-items-center justify-content-between p-4"
        style={{ 
          background: `linear-gradient(135deg, ${colorGreen} 0%, ${colorGreen}dd 100%)`,
          maxWidth: '500px',
          width: '100%',
          pointerEvents: 'all'
        }}
      >
        <div className="d-flex align-items-center gap-3 flex-grow-1">
          <div 
            className="bg-white rounded-circle d-flex align-items-center justify-content-center"
            style={{ 
              width: '50px', 
              height: '50px',
              animation: 'pulse 0.6s ease-out'
            }}
          >
            <CheckCircle size={30} color={colorGreen} />
          </div>
          <div className="text-white">
            <h6 className="fw-bold mb-1 fs-5">Merci pour votre avis !</h6>
            <p className="mb-0 small opacity-90">
              Votre feedback a bien été enregistré
            </p>
          </div>
        </div>
        
        <button
          onClick={onClose}
          className="btn btn-link text-white p-0 ms-3"
          style={{ 
            textDecoration: 'none',
            opacity: 0.8,
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.target.style.opacity = 1}
          onMouseLeave={(e) => e.target.style.opacity = 0.8}
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
}   