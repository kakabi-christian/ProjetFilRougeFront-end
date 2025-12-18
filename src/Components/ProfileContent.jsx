import React from 'react';
import { 
  BiUserCircle, BiEnvelope, BiShieldAlt, 
  BiCalendar, BiEditAlt, BiLockAlt, 
  BiLogOutCircle, BiPhone, BiIdCard
} from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';

const ProfileContent = () => {
  const navigate = useNavigate();
  
  // Récupération des données utilisateur enrichies
  const user = JSON.parse(localStorage.getItem('user') || '{}');



  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Mon Profil</h2>
        <p className="text-muted small">Consultez vos informations personnelles et votre statut de compte.</p>
      </div>

      <div className="row g-4">
        {/* COLONNE GAUCHE : CARTE D'IDENTITÉ VISUELLE */}
        <div className="col-12 col-xl-4">
          <div className="card shadow-sm border-0 text-center p-4 h-100">
            <div className="d-flex justify-content-center mb-3">
              <div className="bg-primary bg-opacity-10 p-3 rounded-circle shadow-sm">
                <BiUserCircle size={80} className="text-primary" />
              </div>
            </div>
            
            <h4 className="fw-bold mb-1 text-capitalize">
              {user.prenom || ''} {user.nom || user.username}
            </h4>
            
            <div className="d-flex justify-content-center gap-2 mt-2">
              <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary px-3 py-2">
                <BiShieldAlt className="me-1" /> 
                {user.userType || 'CANDIDATE'}
              </span>
            </div>
            
            <hr className="my-4 text-muted opacity-25" />
            
            <div className="text-start">
              

              <div className="mb-3">
                <label className="text-muted small d-block mb-1">Téléphone</label>
                <div className="d-flex align-items-center fw-medium text-dark">
                   <BiPhone className="me-2 text-primary" /> {user.telephone || 'Non renseigné'}
                </div>
              </div>

              <div className="mb-3">
                <label className="text-muted small d-block mb-1">Inscription</label>
                <div className="d-flex align-items-center fw-medium text-muted">
                   <BiCalendar className="me-2 text-primary" /> 
                   {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Récemment'}
                </div>
              </div>
            </div>

            
          </div>
        </div>

        {/* COLONNE DROITE : DÉTAILS ET PARAMÈTRES */}
        <div className="col-12 col-xl-8">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-header bg-white py-3 border-0">
              <h5 className="fw-bold mb-0">Détails du compte</h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-4 mb-4">
                <div className="col-md-6">
                   <div className="p-3 bg-light rounded-3 border-start border-primary border-4">
                      <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '10px' }}>Email</small>
                      <div className="d-flex align-items-center mt-1">
                        <BiEnvelope className="me-2 text-primary" />
                        <span className="fw-bold text-dark">{user.email || 'Non renseigné'}</span>
                      </div>
                   </div>
                </div>

                <div className="col-md-6">
                   <div className="p-3 bg-light rounded-3 border-start border-success border-4">
                      <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: '10px' }}>Statut</small>
                      <div className="d-flex align-items-center mt-1 text-success">
                        <span className="fw-bold text-capitalize">{user.userType?.toLowerCase() || 'candidate'} actif</span>
                      </div>
                   </div>
                </div>
              </div>

              <h6 className="fw-bold mb-3 mt-4">Actions de gestion</h6>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="p-3 border rounded-3 hover-shadow transition-all bg-white" style={{cursor: 'pointer'}}>
                    <div className="d-flex align-items-center">
                      <div className="bg-primary bg-opacity-10 p-2 rounded-2 me-3 text-primary">
                        <BiEditAlt size={22} />
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0 small">Modifier mes informations</h6>
                        <p className="text-muted mb-0" style={{fontSize: '11px'}}>Mettre à jour le nom ou le téléphone.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 border rounded-3 hover-shadow transition-all bg-white" style={{cursor: 'pointer'}}>
                    <div className="d-flex align-items-center">
                      <div className="bg-warning bg-opacity-10 p-2 rounded-2 me-3 text-warning">
                        <BiLockAlt size={22} />
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0 small">Mot de passe</h6>
                        <p className="text-muted mb-0" style={{fontSize: '11px'}}>Renforcer la sécurité de l'accès.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="alert alert-secondary border-0 shadow-sm d-flex align-items-start p-3 bg-white border-start border-primary border-4">
                  <BiShieldAlt size={24} className="text-primary me-3 mt-1" />
                  <div>
                    <h6 className="fw-bold mb-1">Permissions du compte</h6>
                    <p className="text-muted small mb-0">
                        Votre rôle est défini sur <strong>{user.userType || 'CANDIDATE'}</strong>. 
                        {user.userType === 'ADMIN' 
                          ? " Vous avez un accès total à l'administration du système." 
                          : " Vous avez un accès standard aux services de l'application."}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;