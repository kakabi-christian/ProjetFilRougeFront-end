import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiPlus, BiEditAlt, BiTrash, BiSearch, 
  BiChevronLeft, BiCheck, BiLoaderAlt, 
  BiErrorCircle, BiBookBookmark, BiFilterAlt, BiInfoCircle
} from 'react-icons/bi';
import epreuveService from '../services/epreuveService';
import filiereService from '../services/filiereService';
import niveauService from '../services/niveauService';

const EpreuveContent = () => {
  // --- ÉTATS ---
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filieres, setFilieres] = useState([]);
  const [niveaux, setNiveaux] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.userType === 'ADMIN';

  // Pagination & Filtres
  const [pagination, setPagination] = useState({ total: 0, page: 1, lastPage: 1 });
  const [filters, setFilters] = useState({ search: '', filiereId: '', page: 1, limit: 10 });

  // Formulaire
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    nomEpreuve: '',
    nonEliminatoire: false,
    filiereId: '',
    niveauId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Modals UI
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'error' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  // --- CHARGEMENT DES DONNÉES ---
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await epreuveService.getAll(filters);
      setItems(response.data || []);
      setPagination(response.pagination);
    } catch (err) {
      showNotify("Erreur", "Impossible de charger les épreuves.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadDependencies = async () => {
    try {
      const [fRes, nRes] = await Promise.all([
        filiereService.getAll({ limit: 100 }),
        niveauService.getAll({ limit: 100 })
      ]);
      // Note: on utilise .intitule car c'est le nom dans vos modèles Prisma
      setFilieres(fRes.data || []);
      setNiveaux(nRes.data || []);
    } catch (err) {
      console.error("Erreur dépendances", err);
    }
  };

  useEffect(() => {
    loadDependencies();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 400);
    return () => clearTimeout(timer);
  }, [loadData]);

  // --- ACTIONS ---
  const showNotify = (title, message, type = 'error') => {
    setNotification({ show: true, title, message, type });
  };

  const openModal = (epreuve = null) => {
    if (!isAdmin) return;
    if (epreuve) {
      setIsEditing(true);
      setCurrentId(epreuve.id);
      setFormData({
        nomEpreuve: epreuve.nomEpreuve,
        nonEliminatoire: epreuve.nonEliminatoire || false,
        filiereId: epreuve.filiereId || '',
        niveauId: epreuve.niveauId || ''
      });
    } else {
      setIsEditing(false);
      setFormData({ nomEpreuve: '', nonEliminatoire: false, filiereId: '', niveauId: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await epreuveService.update(currentId, formData);
      } else {
        await epreuveService.create(formData);
      }
      setShowModal(false);
      loadData();
      showNotify("Succès", "Épreuve enregistrée.", "success");
    } catch (err) {
      showNotify("Erreur", "Vérifiez les informations saisies.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await epreuveService.delete(confirmDelete.id);
      setConfirmDelete({ show: false, id: null });
      loadData();
      showNotify("Supprimé", "L'épreuve a été retirée.", "success");
    } catch (err) {
      showNotify("Erreur", "Impossible de supprimer cet élément.", "error");
      setConfirmDelete({ show: false, id: null });
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* HEADER PRINCIPAL */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Banque d'Épreuves</h2>
          <p className="text-muted small">Configuration des matières par filière et niveau</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary d-flex align-items-center shadow-sm px-4" onClick={() => openModal()}>
            <BiPlus className="me-2" /> Ajouter une épreuve
          </button>
        )}
      </div>

      {/* BARRE DE RECHERCHE ET FILTRE */}
      <div className="card shadow-sm border-0 mb-4 p-3">
        <div className="row g-3">
          <div className="col-md-6">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted"><BiSearch /></span>
              <input 
                type="text" className="form-control border-start-0 shadow-none" 
                placeholder="Rechercher une épreuve..." 
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
              />
            </div>
          </div>
          <div className="col-md-4">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-muted"><BiFilterAlt /></span>
              <select 
                className="form-select border-start-0 shadow-none text-muted"
                value={filters.filiereId}
                onChange={(e) => setFilters(f => ({ ...f, filiereId: e.target.value, page: 1 }))}
              >
                <option value="">Toutes les filières</option>
                {filieres.map(f => <option key={f.id} value={f.id}>{f.intitule}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* TABLEAU DES ÉPREUVES */}
      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-primary text-white"> {/* Le "TH en bleu" demandé */}
              <tr>
                <th className="px-4 py-3 border-0">NOM DE L'ÉPREUVE</th>
                <th className="py-3 border-0">FILIÈRE</th>
                <th className="py-3 border-0 text-center">NIVEAU</th>
                <th className="py-3 border-0 text-center">CARACTÈRE</th>
                {isAdmin && <th className="text-end px-4 border-0">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><BiLoaderAlt className="spinner-border text-primary" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5 text-muted">Aucune donnée trouvée</td></tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="border-bottom">
                    <td className="px-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary-subtle p-2 rounded me-3 text-primary"><BiBookBookmark size={18}/></div>
                        <span className="fw-semibold text-dark">{item.nomEpreuve}</span>
                      </div>
                    </td>
                    <td>
                      <span className="badge bg-light text-primary border border-primary-subtle px-3 py-2 fw-normal">
                        {item.filiere?.intitule || 'N/A'}
                      </span>
                    </td>
                    <td className="text-center text-secondary fw-medium">
                      {item.niveau?.intitule || 'Tous'}
                    </td>
                    <td className="text-center">
                      {item.nonEliminatoire ? (
                        <span className="badge bg-success-subtle text-success border border-success px-2 py-1">Bonus</span>
                      ) : (
                        <span className="badge bg-danger-subtle text-danger border border-danger px-2 py-1">Éliminatoire</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="text-end px-4">
                        <button className="btn btn-sm btn-outline-warning border-0 me-1" onClick={() => openModal(item)} title="Modifier"><BiEditAlt size={18}/></button>
                        <button className="btn btn-sm btn-outline-danger border-0" onClick={() => setConfirmDelete({ show: true, id: item.id })} title="Supprimer"><BiTrash size={18}/></button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PIED DE TABLEAU / PAGINATION */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
          <small className="text-muted fw-medium">Total : {pagination.total} épreuve(s)</small>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-sm btn-outline-secondary border-0" disabled={pagination.page <= 1} onClick={() => setFilters(f => ({...f, page: f.page - 1}))}>
              <BiChevronLeft size={20}/> Précédent
            </button>
            <span className="badge bg-primary px-3 py-2">{pagination.page} / {pagination.lastPage}</span>
            <button className="btn btn-sm btn-primary shadow-sm px-3" disabled={pagination.page >= pagination.lastPage} onClick={() => setFilters(f => ({...f, page: f.page + 1}))}>
              Suivant
            </button>
          </div>
        </div>
      </div>

      {/* MODAL : AJOUT / MODIFICATION */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-primary text-white border-0">
                  <h5 className="modal-title fw-bold">{isEditing ? 'Modifier l\'épreuve' : 'Nouvelle Épreuve'}</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label fw-bold small text-uppercase">Nom complet</label>
                    <input type="text" className="form-control" required placeholder="ex: Mathématiques Générales" value={formData.nomEpreuve} onChange={e => setFormData({...formData, nomEpreuve: e.target.value})} />
                  </div>
                  
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-uppercase">Filière</label>
                      <select className="form-select" required value={formData.filiereId} onChange={e => setFormData({...formData, filiereId: e.target.value})}>
                        <option value="">Sélectionner...</option>
                        {filieres.map(f => <option key={f.id} value={f.id}>{f.intitule}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-uppercase">Niveau (Optionnel)</label>
                      <select className="form-select" value={formData.niveauId} onChange={e => setFormData({...formData, niveauId: e.target.value})}>
                        <option value="">Tous les niveaux</option>
                        {niveaux.map(n => <option key={n.id} value={n.id}>{n.intitule}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="p-3 bg-light rounded border border-dashed">
                    <div className="form-check form-switch">
                      <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="nonEliminatoire" 
                        checked={formData.nonEliminatoire}
                        onChange={e => setFormData({...formData, nonEliminatoire: e.target.checked})}
                      />
                      <label className="form-check-label fw-bold text-dark" htmlFor="nonEliminatoire">
                        Épreuve non-éliminatoire
                      </label>
                    </div>
                    <p className="text-muted small mb-0 mt-1">Si activé, une note inférieure à 5/20 ne disqualifie pas d'office le candidat.</p>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light px-4" onClick={() => setShowModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary px-4 shadow-sm" disabled={submitting}>
                    {submitting ? <BiLoaderAlt className="spinner-border spinner-border-sm me-2"/> : <BiCheck className="me-1"/>} Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL : NOTIFICATION */}
      {notification.show && (
        <div className="position-fixed top-0 start-50 translate-middle-x mt-4" style={{ zIndex: 2000 }}>
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-danger'} shadow-lg d-flex align-items-center`}>
            {notification.type === 'success' ? <BiCheck className="me-2" size={24}/> : <BiErrorCircle className="me-2" size={24}/>}
            <div>
              <strong className="d-block">{notification.title}</strong>
              <small>{notification.message}</small>
            </div>
            <button className="btn-close ms-3" onClick={() => setNotification({...notification, show: false})}></button>
          </div>
        </div>
      )}

      {/* MODAL : CONFIRMATION SUPPRESSION */}
      {confirmDelete.show && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1060 }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4 text-center">
              <div className="text-danger mb-3"><BiTrash size={48}/></div>
              <h6 className="fw-bold">Supprimer l'épreuve ?</h6>
              <p className="small text-muted mb-4">Cette action est irréversible et pourrait affecter les archives liées.</p>
              <div className="d-flex gap-2">
                <button className="btn btn-light btn-sm flex-grow-1 border" onClick={() => setConfirmDelete({show: false, id: null})}>Annuler</button>
                <button className="btn btn-danger btn-sm flex-grow-1 shadow-sm" onClick={handleDelete}>Confirmer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EpreuveContent;