import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle, Info, AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import NotificationService from '../services/NotificationService';
import { NotificationType } from '../models/Notification';

export default function NotificationContent() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Récupération de l'utilisateur depuis le localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const response = await NotificationService.getByUserId(user.id);
      setNotifications(response.data || []);
      
      // Une fois les notifications affichées, on les marque comme lues
      await NotificationService.markAllAsRead(user.id);
      
      // On prévient la Sidebar de remettre le compteur à 0
      window.dispatchEvent(new Event("notificationsRead"));
    } catch (error) {
      console.error("Erreur chargement notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fonction pour obtenir l'icône selon le type
  const getIcon = (type) => {
    switch (type) {
      case NotificationType.SUCCESS: return <CheckCircle className="text-success" size={24} />;
      case NotificationType.WARNING: return <AlertTriangle className="text-warning" size={24} />;
      case NotificationType.ERROR: return <XCircle className="text-danger" size={24} />;
      default: return <Info className="text-info" size={24} />;
    }
  };

  return (
    <div className="container-fluid p-0 bg-light" style={{ minHeight: '100vh' }}>
      {/* HEADER STYLE MOBILE */}
      <div className="bg-white p-3 shadow-sm sticky-top border-bottom">
        <div className="d-flex align-items-center justify-content-between">
          <h5 className="fw-bold mb-0 d-flex align-items-center">
            <Bell className="me-2 text-primary" size={20} />
            Notifications
          </h5>
          <span className="badge bg-primary-subtle text-primary rounded-pill px-3">
            {notifications.length} au total
          </span>
        </div>
      </div>

      {/* LISTE DES NOTIFICATIONS */}
      <div className="p-2">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Mise à jour...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="d-flex flex-column gap-2">
            {notifications.map((notif) => (
              <div 
                key={notif.id} 
                className={`card border-0 shadow-sm rounded-4 overflow-hidden transition-all ${!notif.isRead ? 'border-start border-primary border-4' : ''}`}
                style={{ cursor: 'pointer' }}
              >
                <div className="card-body p-3">
                  <div className="d-flex align-items-start gap-3">
                    <div className="bg-light p-2 rounded-circle">
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <span className="fw-bold small text-uppercase text-muted" style={{ fontSize: '0.7rem' }}>
                          {notif.type}
                        </span>
                        <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                          {new Date(notif.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </small>
                      </div>
                      <p className="mb-0 text-dark" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                        {notif.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ÉTAT VIDE */
          <div className="text-center py-5 px-4 mt-5">
            <div className="bg-white d-inline-block p-4 rounded-circle shadow-sm mb-3">
              <Bell size={48} className="text-muted opacity-25" />
            </div>
            <h5 className="fw-bold">Tout est à jour !</h5>
            <p className="text-muted small">Vous n'avez pas de nouvelles notifications pour le moment.</p>
          </div>
        )}
      </div>

      {/* BOUTON SUPPRIMER TOUT (Optionnel) */}
      {notifications.length > 0 && (
        <div className="p-4 text-center">
          <button 
            className="btn btn-sm btn-outline-secondary rounded-pill px-4 border-0"
            onClick={async () => {
              if(window.confirm("Tout supprimer ?")) {
                await NotificationService.deleteAll(user.id);
                setNotifications([]);
              }
            }}
          >
            <Trash2 size={14} className="me-1" /> Effacer l'historique
          </button>
        </div>
      )}
    </div>
  );
}