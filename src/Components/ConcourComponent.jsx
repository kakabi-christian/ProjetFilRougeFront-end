import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiSearch, BiChevronLeft, BiPlus, BiEditAlt, 
  BiTrash, BiLoaderAlt, BiCheck, BiErrorCircle,
  BiWallet, BiCalendar, BiLayer
} from 'react-icons/bi';
import { 
  getConcours, 
  createConcours, 
  updateConcours, 
  deleteConcours 
} from '../services/concoursService';
import anneeService from '../services/anneeService';
import sessionService from '../services/sessionService';

const ConcoursComponent = () => {
  // --- ÉTATS ---
  const [items, setItems] = useState([]); // Contiendra le tableau final
  const [annees, setAnnees] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.userType === 'ADMIN';

  // États Formulaire
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({ 
    code: '', 
    intitule: '', 
    montant: '',
    anneeId: '',
    sessionId: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Notifications et Suppression
  const [notification, setNotification] = useState({ show: false, title: '', message: '', type: 'error' });
  const [confirmDelete, setConfirmDelete] = useState({ show: false, id: null });

  // Pagination et Filtres
  const [pagination, setPagination] = useState({ total: 0, page: 1, lastPage: 1 });
  const [filters, setFilters] = useState({ search: '', page: 1, limit: 10 });

  // --- CHARGEMENT ---
  const loadOptions = async () => {
    try {
      const [resAnnee, resSession] = await Promise.all([
        anneeService.getAll(),
        sessionService.getAll()
      ]);
      
      // Sécurisation pour les options aussi (si elles sont paginées)
      const dataAnnees = resAnnee.data?.data || resAnnee.data || [];
      const dataSessions = resSession.data?.data || resSession.data || [];
      
      setAnnees(dataAnnees);
      setSessions(dataSessions);
    } catch (err) {
      console.error("Erreur chargement options", err);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getConcours(filters);
      
      // CORRECTION ICI : On extrait le tableau 'data' de l'objet de réponse paginé
      const dataArray = response.data?.data || response.data || [];
      setItems(dataArray);
      
      // Mise à jour de la pagination
      if (response.data?.pagination) {
        setPagination(response.data.pagination);
      }
    } catch (err) {
      showNotify("Erreur", "Impossible de charger les concours.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 400);
    return () => clearTimeout(timer);
  }, [loadData]);

  // --- ACTIONS ---
  const showNotify = (title, message, type = 'error') => {
    setNotification({ show: true, title, message, type });
  };

  const openModal = (concours = null) => {
    if (!isAdmin) return;
    if (concours) {
      setIsEditing(true);
      setCurrentId(concours.id);
      setFormData({ 
        code: concours.code, 
        intitule: concours.intitule, 
        montant: concours.montant || '',
        anneeId: concours.anneeId || '',
        sessionId: concours.sessionId || ''
      });
    } else {
      setIsEditing(false);
      setFormData({ code: '', intitule: '', montant: '', anneeId: '', sessionId: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const dataToSend = { ...formData, montant: parseFloat(formData.montant) };
      if (isEditing) {
        await updateConcours(currentId, dataToSend);
      } else {
        await createConcours(dataToSend);
      }
      setShowModal(false);
      loadData();
      showNotify("Succès", "Le concours a été enregistré.", "success");
    } catch (err) {
      showNotify("Erreur", "Échec de l'enregistrement (Vérifiez l'unicité du code).", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const executeDelete = async () => {
    try {
      await deleteConcours(confirmDelete.id);
      setConfirmDelete({ show: false, id: null });
      loadData();
      showNotify("Supprimé", "Concours supprimé avec succès.", "success");
    } catch (err) {
      showNotify("Erreur", "Suppression impossible.", "error");
    }
  };

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Gestion des Concours</h2>
          <p className="text-muted small">Configurez les types de concours et frais associés</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary d-flex align-items-center shadow-sm px-4" onClick={() => openModal()}>
            <BiPlus className="me-2" /> Nouveau Concours
          </button>
        )}
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="card shadow-sm border-0 mb-4 p-3">
        <div className="input-group w-50">
          <span className="input-group-text bg-white border-end-0"><BiSearch /></span>
          <input 
            type="text" className="form-control border-start-0 shadow-none" 
            placeholder="Rechercher par code ou intitulé..." 
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
          />
        </div>
      </div>

      {/* TABLEAU */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3">CODE</th>
                <th className="py-3">INTITULÉ</th>
                <th className="py-3">FRAIS (FCFA)</th>
                <th className="py-3">ANNÉE / SESSION</th>
                {isAdmin && <th className="text-end px-4">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><BiLoaderAlt className="spinner-border text-primary" /></td></tr>
              ) : !Array.isArray(items) || items.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5 text-muted">Aucun concours trouvé</td></tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4"><span className="fw-bold text-primary">{item.code}</span></td>
                    <td><div className="text-dark fw-semibold">{item.intitule}</div></td>
                    <td>
                      <div className="text-dark fw-medium">
                        <BiWallet className="me-2 text-muted"/>
                        {item.montant ? item.montant.toLocaleString() : 0} <small className="text-muted">FCFA</small>
                      </div>
                    </td>
                    <td>
                      <div className="small text-muted">
                        <BiCalendar className="me-1"/> {item.annee?.libelle || 'N/A'} <br/>
                        <BiLayer className="me-1"/> {item.session?.nom || 'N/A'}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="text-end px-4">
                        <button className="btn btn-sm btn-light border me-2" onClick={() => openModal(item)}>
                          <BiEditAlt className="text-warning" />
                        </button>
                        <button className="btn btn-sm btn-light border" onClick={() => setConfirmDelete({ show: true, id: item.id })}>
                          <BiTrash className="text-danger" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center">
          <small className="text-muted">Page {pagination.page} / {pagination.lastPage}</small>
          <div className="btn-group">
            <button 
                className="btn btn-sm btn-outline-secondary" 
                disabled={pagination.page <= 1} 
                onClick={() => setFilters(f => ({...f, page: f.page - 1}))}
            >
                <BiChevronLeft/>
            </button>
            <button 
                className="btn btn-sm btn-primary px-3" 
                disabled={pagination.page >= pagination.lastPage} 
                onClick={() => setFilters(f => ({...f, page: f.page + 1}))}
            >
                Suivant
            </button>
          </div>
        </div>
      </div>

      {/* MODAL FORMULAIRE */}
      {showModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg">
              <form onSubmit={handleSubmit}>
                <div className="modal-header bg-dark text-white border-0">
                  <h5 className="modal-title">{isEditing ? 'Modifier' : 'Nouveau'} Concours</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-bold">CODE</label>
                      <input type="text" className="form-control" required value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                    </div>
                    <div className="col-md-8">
                      <label className="form-label small fw-bold">INTITULÉ</label>
                      <input type="text" className="form-control" required value={formData.intitule} onChange={(e) => setFormData({...formData, intitule: e.target.value})} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-bold">MONTANT DES FRAIS</label>
                      <div className="input-group">
                        <input type="number" className="form-control" required value={formData.montant} onChange={(e) => setFormData({...formData, montant: e.target.value})} />
                        <span className="input-group-text">FCFA</span>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">ANNÉE ACADÉMIQUE</label>
                      <select className="form-select" required value={formData.anneeId} onChange={(e) => setFormData({...formData, anneeId: e.target.value})}>
                        <option value="">Choisir...</option>
                        {Array.isArray(annees) && annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">SESSION</label>
                      <select className="form-select" value={formData.sessionId} onChange={(e) => setFormData({...formData, sessionId: e.target.value})}>
                        <option value="">Optionnelle...</option>
                        {Array.isArray(sessions) && sessions.map(s => <option key={s.id} value={s.id}>{s.nom}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Annuler</button>
                  <button type="submit" className="btn btn-primary px-4" disabled={submitting}>
                    {submitting ? <BiLoaderAlt className="spinner-border spinner-border-sm me-2"/> : <BiCheck className="me-1"/>} Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL NOTIFICATION */}
      {notification.show && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1060 }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg text-center p-4">
                {notification.type === 'error' ? <BiErrorCircle className="text-danger mb-3" size={50} /> : <BiCheck className="text-success mb-3" size={50} />}
                <h5 className="fw-bold">{notification.title}</h5>
                <p className="text-muted small">{notification.message}</p>
                <button className="btn btn-dark w-100 mt-3" onClick={() => setNotification({ ...notification, show: false })}>Ok</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMATION SUPPRESSION */}
      {confirmDelete.show && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 1060 }}>
          <div className="modal-dialog modal-sm modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg p-4 text-center">
                <BiTrash className="text-danger mb-3" size={50} />
                <h5 className="fw-bold">Confirmer ?</h5>
                <p className="text-muted small">Voulez-vous supprimer ce concours ?</p>
                <div className="d-flex gap-2 mt-4">
                  <button className="btn btn-light border flex-grow-1" onClick={() => setConfirmDelete({ show: false, id: null })}>Non</button>
                  <button className="btn btn-danger flex-grow-1" onClick={executeDelete}>Oui, Supprimer</button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConcoursComponent;