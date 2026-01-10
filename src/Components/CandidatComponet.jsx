import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiSearch, BiUser, BiLoaderAlt, BiArrowBack, BiCreditCard,
  BiBuilding, BiBook, BiGroup, BiCheckCircle, BiDownload, BiMap, BiFlag
} from 'react-icons/bi';

import candidatService from '../services/candidatService';

const InfoField = ({ label, value, icon: Icon }) => (
  <div className="col-lg-4 col-md-6 mb-4">
    <div className="p-3 border rounded h-100 shadow-sm" style={{ backgroundColor: '#f0f4f8', borderColor: '#d9e2ec' }}>
      <div className="d-flex align-items-center">
        <Icon className="me-3 text-primary fs-5" /> 
        <div>
          <small className="text-muted text-uppercase fw-bold d-block" style={{ fontSize: '0.7rem' }}>{label}</small>
          <p className="mb-0 fw-semibold text-dark text-break">
            {value || <span className="text-danger fst-italic">Non renseigné</span>}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const CandidatComponent = () => {
  const [candidates, setCandidates] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [centresExamen, setCentresExamen] = useState([]); 
  const [centresDepot, setCentresDepot] = useState([]);   
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, lastPage: 1 });
  const [filters, setFilters] = useState({ 
    search: '', filiereId: '', specialiteId: '', 
    centreExamenId: '', centreDepotId: '', 
    sexe: '', statut: '', page: 1, limit: 10 
  });
  const [selectedCandidat, setSelectedCandidat] = useState(null);

  // 1. CHARGEMENT INITIAL SÉCURISÉ
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [filieresRes, examRes, depotRes] = await Promise.all([
          candidatService.getFilieres(),
          candidatService.getCentresExamen(),
          candidatService.getCentresDepot()
        ]);
        
        // Sécurisation : on vérifie si la donnée est dans .data ou directement la réponse
        const extractArray = (res) => {
            if (Array.isArray(res)) return res;
            if (res && Array.isArray(res.data)) return res.data;
            return [];
        };

        setFilieres(extractArray(filieresRes));
        setCentresExamen(extractArray(examRes));
        setCentresDepot(extractArray(depotRes));

        console.log("DEBUG CENTRES:", extractArray(examRes)); // Pour vérifier dans ta console
      } catch (err) { 
        console.error("Erreur chargement données initiales:", err); 
      }
    };
    fetchInitialData();
  }, []);

  // 2. CHARGEMENT DES CANDIDATS
  const loadCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const result = await candidatService.getDetailedList(filters);
      if (result) {
        setCandidates(result.candidates || []);
        setPagination(result.pagination || {});
      }
    } catch (err) {
      console.error("Erreur chargement candidats:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => { if (!selectedCandidat) loadCandidates(); }, 400);
    return () => clearTimeout(timer);
  }, [loadCandidates, selectedCandidat]);

  const getStatusBadge = (statut) => {
    switch (statut) {
      case 'VALIDATED': return <span className="badge bg-success">Validé</span>;
      case 'REJECTED': return <span className="badge bg-danger">Rejeté</span>;
      case 'PENDING': return <span className="badge bg-warning text-dark">En attente</span>;
      default: return <span className="badge bg-secondary">en attente</span>;
    }
  };
const handlePageChange = (newPage) => {
  if (newPage >= 1 && newPage <= pagination.lastPage) {
    setFilters(prev => ({ ...prev, page: newPage }));
  }
};
  const handleFilterChange = async (e) => {
    const { name, value } = e.target;
    if (name === 'filiereId') {
      setFilters(prev => ({ ...prev, filiereId: value, specialiteId: '', page: 1 }));
      if (value) {
        const specs = await candidatService.getSpecialitesByFiliere(value);
        setSpecialites(Array.isArray(specs) ? specs : (specs?.data || []));
      } else {
        setSpecialites([]);
      }
    } else {
      setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    }
  };

  const generatePDF = async () => {
    setIsExporting(true);
    try {
      await candidatService.exportToPdf(filters);
    } catch (err) {
      alert("Erreur lors de la génération du PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  if (selectedCandidat) {
    return (
      <div className="container-fluid p-4 bg-light min-vh-100">
        <button className="btn btn-outline-primary mb-4 shadow-sm rounded-pill px-4" onClick={() => setSelectedCandidat(null)}>
          <BiArrowBack className="me-2" /> Retour à la liste
        </button>
        <div className="card shadow border-0 p-4 rounded-4">
            <h3 className="fw-bold mb-4 text-primary">Détails du Candidat</h3>
            <div className="row">
                <InfoField label="Nom complet" value={`${selectedCandidat.nom} ${selectedCandidat.prenom}`} icon={BiUser} />
                <InfoField label="Matricule" value={selectedCandidat.matricule} icon={BiCreditCard} />
                <InfoField label="Filière" value={selectedCandidat.filiere} icon={BiBuilding} />
                <InfoField label="Spécialité" value={selectedCandidat.specialite} icon={BiBook} />
                <InfoField label="Centre d'Examen" value={selectedCandidat.centreExamen} icon={BiMap} />
                <InfoField label="Centre de Dépôt" value={selectedCandidat.centreDepot} icon={BiFlag} />
                <InfoField label="Sexe" value={selectedCandidat.sexe} icon={BiGroup} />
                <InfoField label="Statut Dossier" value={selectedCandidat.dossier?.statut} icon={BiCheckCircle} />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Portail Gestion Candidats</h2>
          <p className="text-muted mb-0">Recherche avancée et filtrage par centres</p>
        </div>
        <button className="btn btn-danger rounded-pill px-4 shadow-sm fw-bold" onClick={generatePDF} disabled={isExporting}>
          {isExporting ? <BiLoaderAlt className="spinner-border spinner-border-sm me-2" /> : <BiDownload className="me-2" />}
          Exporter Liste PDF
        </button>
      </div>

      {/* ZONE DE FILTRES */}
      <div className="card shadow-sm border-0 mb-4 p-3 rounded-4">
        <div className="row g-3">
          {/* Recherche */}
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0 text-primary"><BiSearch /></span>
              <input type="text" name="search" className="form-control border-start-0 shadow-none" placeholder="Nom, matricule..." value={filters.search} onChange={handleFilterChange} />
            </div>
          </div>

          {/* Filtre Filière */}
          <div className="col-md-3">
            <select className="form-select shadow-none border-primary" name="filiereId" value={filters.filiereId} onChange={handleFilterChange}>
              <option value="">-- Toutes les filières --</option>
              {filieres.map(f => <option key={f.id} value={f.id}>{f.intitule || f.libelle}</option>)}
            </select>
          </div>
          
          {/* Filtre Spécialité */}
          <div className="col-md-3">
            <select className={`form-select shadow-none ${!filters.filiereId ? 'bg-light' : 'border-success'}`} name="specialiteId" value={filters.specialiteId} onChange={handleFilterChange} disabled={!filters.filiereId}>
              <option value="">{filters.filiereId ? '-- Toutes les spécialités --' : 'Sélectionnez une filière'}</option>
              {specialites.map(s => <option key={s.id} value={s.id}>{s.libelle || s.intitule}</option>)}
            </select>
          </div>

          {/* Filtre Centre Examen */}
          <div className="col-md-3">
            <select className="form-select shadow-none border-info" name="centreExamenId" value={filters.centreExamenId} onChange={handleFilterChange}>
              <option value="">-- Tous les centres d'examen --</option>
              {centresExamen.map(c => (
                <option key={c.id} value={c.id}>{c.intitule || c.nom}</option>
              ))}
            </select>
          </div>

          {/* Filtre Centre Dépôt */}
          <div className="col-md-3">
            <select className="form-select shadow-none" name="centreDepotId" value={filters.centreDepotId} onChange={handleFilterChange}>
              <option value="">-- Tous les centres de dépôt --</option>
              {centresDepot.map(c => (
                <option key={c.id} value={c.id}>{c.intitule || c.nom}</option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <select className="form-select shadow-none" name="sexe" value={filters.sexe} onChange={handleFilterChange}>
              <option value="">Tous les sexes</option>
              <option value="MASCULIN">Masculin</option>
              <option value="FEMININ">Féminin</option>
            </select>
          </div>

          <div className="col-md-2">
            <select className="form-select shadow-none fw-bold text-primary" name="statut" value={filters.statut} onChange={handleFilterChange}>
              <option value="">Tous les statuts</option>
              <option value="PENDING">EN ATTENTE</option>
              <option value="VALIDATED">VALIDÉ</option>
              <option value="REJECTED">REJETÉ</option>
            </select>
          </div>

          <div className="col-md-2 d-flex align-items-center">
            {loading && <><BiLoaderAlt className="spinner-border spinner-border-sm text-primary me-2" /> <small className="text-primary">Actualisation...</small></>}
          </div>
        </div>
      </div>

      {/* TABLEAU */}
      <div className="card shadow-sm border-0 rounded-4 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3 border-0">CANDIDAT / MATRICULE</th>
                <th className="py-3 border-0">CENTRE D'EXAMEN</th>
                <th className="py-3 border-0 text-center">STATUT</th>
                <th className="py-3 border-0">FILIÈRE / SPÉCIALITÉ</th>
                <th className="text-end px-4 py-3 border-0">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length > 0 ? (
                candidates.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-primary-subtle rounded-circle p-2 me-3 text-primary"><BiUser size={20} /></div>
                        <div>
                          <div className="fw-bold">{c.nom} {c.prenom}</div>
                          <small className="text-muted">{c.matricule}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <BiMap className="text-info me-1" />
                        <span className="small fw-semibold">{c.centreExamen || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="text-center">{getStatusBadge(c.dossier?.statut)}</td>
                    <td>
                      <div className="small text-dark fw-bold">{c.filiere}</div>
                      <div className="x-small text-primary" style={{fontSize: '0.8rem'}}>{c.specialite}</div>
                    </td>
                    <td className="text-end px-4">
                      <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => setSelectedCandidat(c)}>Profil</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted">Aucun candidat ne correspond à ces critères.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* AJOUTER CECI JUSTE APRÈS LA TABLE */}
<div className="card-footer bg-white border-0 py-3">
  <div className="d-flex justify-content-between align-items-center flex-wrap">
    <div className="text-muted small">
      Affichage de {candidates.length} sur {pagination.total} candidats
    </div>
    
    <nav>
      <ul className="pagination pagination-sm mb-0">
        {/* Bouton Précédent */}
        <li className={`page-item ${filters.page === 1 ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(filters.page - 1)}>
            Précédent
          </button>
        </li>

        {/* Génération dynamique des numéros de page */}
        {[...Array(pagination.lastPage)].map((_, index) => (
          <li key={index + 1} className={`page-item ${filters.page === index + 1 ? 'active' : ''}`}>
            <button className="page-link shadow-none" onClick={() => handlePageChange(index + 1)}>
              {index + 1}
            </button>
          </li>
        ))}

        {/* Bouton Suivant */}
        <li className={`page-item ${filters.page === pagination.lastPage ? 'disabled' : ''}`}>
          <button className="page-link" onClick={() => handlePageChange(filters.page + 1)}>
            Suivant
          </button>
        </li>
      </ul>
    </nav>
  </div>
</div>
    </div>
  );
};

export default CandidatComponent;