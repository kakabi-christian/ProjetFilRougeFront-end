import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiCloudUpload, BiCheckCircle, BiSend,
  BiTimeFive, BiLoaderAlt, 
  BiLockAlt, BiRefresh, BiFile, BiShowAlt
} from 'react-icons/bi';
import { 
  getDossierByCandidate, 
  uploadDossierFile, 
  updateDossierStatus, 
  DOSSIER_STATUS, 
  getFileUrl 
} from '../services/DossierService';

const DossierCandidat = () => {
  const [dossier, setDossier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingField, setUploadingField] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const candidateId = user.id;

  const resolveUploadedPath = (code) => {
    if (!dossier || !code) return null;
    const searchCode = code.toLowerCase();
    const keys = Object.keys(dossier);

    const foundKey = keys.find(key => {
        const k = key.toLowerCase();
        return (
            k === searchCode || 
            k === `photo${searchCode}` || 
            `photo${k}` === searchCode || 
            (searchCode === 'photo' && k === 'photoprofil')
        );
    });
    return foundKey ? dossier[foundKey] : null;
  };

  const loadMyDossier = useCallback(async () => {
    if (!candidateId) return;
    setLoading(true);
    try {
      const response = await getDossierByCandidate(candidateId);
      setDossier(response);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  }, [candidateId]);

  useEffect(() => {
    loadMyDossier();
  }, [loadMyDossier]);

  const isDossierComplet = () => {
    if (!dossier || !dossier.piecesRequises) return false;
    return dossier.piecesRequises.every(piece => !!resolveUploadedPath(piece.code));
  };

  // VERROUILLAGE : Bloque les modifs si validé ou en attente
  const isLocked = dossier?.statut === DOSSIER_STATUS.VALIDATED || dossier?.statut === DOSSIER_STATUS.PENDING;
  
  // VERROUILLAGE STRICT : Bloque même le bouton de soumission si validé
  const isFullyValidated = dossier?.statut === DOSSIER_STATUS.VALIDATED;

  const handleFileUpload = async (e, fieldCode) => {
    if (isLocked) return;
    
    const file = e.target.files[0];
    if (!file) return;
    setUploadingField(fieldCode);
    try {
      await uploadDossierFile(candidateId, fieldCode, file);
      await loadMyDossier(); 
    } catch (error) {
      alert(`Erreur: ${error.response?.data?.message || "Erreur upload"}`);
    } finally {
      setUploadingField(null);
      if (e.target) e.target.value = null; 
    }
  };

  const handleFinalSubmit = async () => {
    if (isLocked) return;
    if (!isDossierComplet()) return alert("Dossier incomplet.");
    
    if (!window.confirm("Confirmer la soumission ? Vous ne pourrez plus modifier vos fichiers après cette action.")) return;
    
    setSubmitting(true);
    try {
      await updateDossierStatus(candidateId, { statut: 'PENDING', commentaire: "Soumission candidat" });
      await loadMyDossier();
    } catch (error) {
      alert("Erreur lors de la soumission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !dossier) return (
    <div className="d-flex justify-content-center align-items-center min-vh-100">
        <BiLoaderAlt className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}} />
    </div>
  );

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        {/* En-tête */}
        <div className="row mb-4 align-items-center">
          <div className="col-md-7">
            <h1 className="fw-bold h2 mb-1">Mon Dossier Officiel</h1>
            <p className="text-muted mb-0">Concours : <span className="text-primary fw-bold">{dossier?.concours?.intitule || 'Non défini'}</span></p>
          </div>
          <div className="col-md-5 text-md-end">
            <button onClick={loadMyDossier} className="btn btn-white shadow-sm me-2 rounded-pill border"><BiRefresh size={20}/></button>
            
            {isFullyValidated ? (
              <button disabled className="btn btn-lg btn-success rounded-pill px-4 shadow-sm fw-bold">
                <BiCheckCircle className="me-2"/> Dossier Validé
              </button>
            ) : (
              <button 
                onClick={handleFinalSubmit}
                disabled={!isDossierComplet() || submitting || isLocked}
                className={`btn btn-lg rounded-pill px-4 shadow-sm fw-bold ${isDossierComplet() && !isLocked ? 'btn-success' : 'btn-secondary opacity-50'}`}
              >
                {submitting ? <BiLoaderAlt className="spinner-border spinner-border-sm me-2"/> : <BiSend className="me-2"/>}
                {dossier?.statut === DOSSIER_STATUS.PENDING ? "Dossier en attente" : "Soumettre le dossier"}
              </button>
            )}
          </div>
        </div>

        {/* Barre de Statut simple */}
        <div className={`alert ${isLocked ? 'bg-white border-primary' : 'bg-white'} shadow-sm border-2 rounded-4 p-3 mb-4 d-flex align-items-center`}>
            <div className="me-3">
                {isFullyValidated ? <BiCheckCircle className="text-success" size={35}/> : <BiTimeFive className="text-warning" size={35}/>}
            </div>
            <div className="flex-grow-1">
                <span className="fw-bold d-block text-uppercase small text-muted">Statut de mon dossier</span>
                <span className={`h5 mb-0 fw-bold ${isFullyValidated ? 'text-success' : 'text-dark'}`}>
                  {dossier?.statut || 'BROUILLON'}
                </span>
            </div>
            {isLocked && (
              <div className="text-primary fw-bold small">
                <BiLockAlt className="me-1"/> DOSSIER VERROUILLÉ
              </div>
            )}
        </div>

        {/* Grille des pièces */}
        <div className="row g-4">
          {dossier?.piecesRequises?.map((piece) => {
            const filePath = resolveUploadedPath(piece.code);
            const isUploaded = !!filePath;
            const fullUrl = isUploaded ? getFileUrl(filePath) : null;
            const isImage = fullUrl?.match(/\.(jpeg|jpg|gif|png)$/i) != null;

            return (
              <div key={piece.id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm border-0 rounded-4 overflow-hidden">
                  
                  <div className={`d-flex align-items-center justify-content-center border-bottom ${isUploaded ? 'bg-white' : 'bg-light'}`} style={{height: '160px'}}>
                    {isUploaded ? (
                        isImage ? (
                            <img src={fullUrl} alt={piece.nom} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        ) : (
                            <div className="text-center text-primary">
                                <BiFile size={50} />
                                <div className="small fw-bold">DOCUMENT PDF</div>
                            </div>
                        )
                    ) : (
                        <div className="text-center text-muted opacity-50">
                            <BiCloudUpload size={40} />
                            <div className="small fw-bold">AUCUN FICHIER</div>
                        </div>
                    )}
                  </div>

                  <div className="card-body p-4 text-center">
                    <h6 className="fw-bold mb-1">{piece.nom}</h6>
                    <p className="text-muted small mb-3">Format : PDF ou Image</p>
                    
                    <div className="d-grid gap-2">
                      {isUploaded && (
                        <a href={fullUrl} target="_blank" rel="noreferrer" className="btn btn-primary rounded-3 py-2 fw-bold shadow-sm">
                          <BiShowAlt size={20} className="me-2"/> Visualiser
                        </a>
                      )}

                      {!isLocked ? (
                        <label className={`btn ${isUploaded ? 'btn-outline-secondary' : 'btn-outline-primary'} rounded-3 py-2 cursor-pointer`}>
                          {uploadingField === piece.code ? <BiLoaderAlt className="spinner-border spinner-border-sm me-2"/> : <BiCloudUpload size={20} className="me-2"/>}
                          {isUploaded ? "Modifier le fichier" : "Ajouter le fichier"}
                          <input type="file" hidden accept=".pdf,image/*" onChange={(e) => handleFileUpload(e, piece.code)} />
                        </label>
                      ) : (
                        <div className="text-center p-2 bg-light rounded-3 small text-muted border">
                          <BiLockAlt className="me-1"/> Modification désactivée
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <style>{`
        .cursor-pointer { cursor: pointer; }
        .card { transition: all 0.3s ease; }
        .card:hover { transform: translateY(-5px); }
        .btn-white { background: white; border: 1px solid #dee2e6; }
      `}</style>
    </div>
  );
};

export default DossierCandidat;