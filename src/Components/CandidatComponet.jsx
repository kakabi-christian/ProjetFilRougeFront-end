import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiSearch, BiChevronLeft, BiChevronRight, 
  BiUser, BiLoaderAlt, BiFilterAlt, BiErrorCircle,
  BiArrowBack, BiEnvelope, BiPhone, BiFlag, BiCreditCard,
  BiCalendar, BiMap, BiBuilding, BiBook, BiAward,
  BiGroup, BiCheckCircle, BiFile, BiXCircle, BiDownload
} from 'react-icons/bi';

import candidatService from '../services/candidatService';
import { getPiecesDossier } from '../services/PiecesDossierService';

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
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [pagination, setPagination] = useState({ total: 0, page: 1, lastPage: 1, hasNextPage: false, hasPreviousPage: false });
  const [filters, setFilters] = useState({ search: '', filiereId: '', specialiteId: '', sexe: '', statut: '', page: 1, limit: 10 });
  const [selectedCandidat, setSelectedCandidat] = useState(null);

  // 1. CHARGEMENT INITIAL DES FILIÈRES
  useEffect(() => {
    const fetchFilieres = async () => {
      try {
        const data = await candidatService.getFilieres();
        const filieresArray = Array.isArray(data) ? data : (data.data || []);
        setFilieres(filieresArray);
      } catch (err) { 
        console.error("Erreur chargement filières:", err); 
      }
    };
    fetchFilieres();
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
      default: return <span className="badge bg-secondary">Inconnu</span>;
    }
  };

  // 3. GESTION DU FILTRAGE EN CASCADE
  const handleFilterChange = async (e) => {
    const { name, value } = e.target;
    if (name === 'filiereId') {
      setFilters(prev => ({ ...prev, filiereId: value, specialiteId: '', page: 1 }));
      if (value) {
        const specs = await candidatService.getSpecialitesByFiliere(value);
        setSpecialites(Array.isArray(specs) ? specs : []);
      } else {
        setSpecialites([]);
      }
    } else {
      setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    }
  };

  // --- NOUVELLE LOGIQUE PDF (APPEL BACKEND) ---
  const generatePDF = async () => {
    setIsExporting(true);
    try {
      // On envoie les filtres actuels au service qui gère le téléchargement Blob
      await candidatService.exportToPdf(filters);
    } catch (err) {
      alert("Erreur lors de la génération du PDF par le serveur.");
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  if (selectedCandidat) {
    return (
      <div className="container-fluid p-4 bg-light min-vh-100">
        <button className="btn btn-outline-primary mb-4" onClick={() => setSelectedCandidat(null)}>
          <BiArrowBack className="me-2" /> Retour à la liste
        </button>
        <div className="card shadow border-0 p-4">
            <h3 className="fw-bold mb-4">Détails du Candidat</h3>
            <div className="row">
                <InfoField label="Nom complet" value={`${selectedCandidat.nom} ${selectedCandidat.prenom}`} icon={BiUser} />
                <InfoField label="Matricule" value={selectedCandidat.matricule} icon={BiCreditCard} />
                <InfoField label="Filière" value={selectedCandidat.filiere} icon={BiBuilding} />
                <InfoField label="Spécialité" value={selectedCandidat.specialite} icon={BiBook} />
                <InfoField label="Sexe" value={selectedCandidat.sexe} icon={BiGroup} />
                <InfoField label="Statut" value={selectedCandidat.dossier?.statut} icon={BiCheckCircle} />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Portail Candidats</h2>
          <p className="text-muted mb-0">Gestion et filtrage des dossiers</p>
        </div>
        <button 
          className="btn btn-danger rounded-pill px-4 shadow-sm" 
          onClick={generatePDF} 
          disabled={isExporting}
        >
          {isExporting ? (
            <><BiLoaderAlt className="spinner-border spinner-border-sm me-2" /> Génération...</>
          ) : (
            <><BiDownload className="me-2" /> Exporter PDF</>
          )}
        </button>
      </div>

      {/* ZONE DE FILTRES */}
      <div className="card shadow-sm border-0 mb-4 p-3">
        <div className="row g-3">
          <div className="col-md-3">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0"><BiSearch /></span>
              <input type="text" name="search" className="form-control border-start-0 shadow-none" placeholder="Rechercher..." value={filters.search} onChange={handleFilterChange} />
            </div>
          </div>

          <div className="col-md-3">
            <select className="form-select shadow-none border-primary" name="filiereId" value={filters.filiereId} onChange={handleFilterChange}>
              <option value="">-- Toutes les filières --</option>
              {filieres.map(f => (
                <option key={f.id} value={f.id}>{f.intitule || f.libelle}</option>
              ))}
            </select>
          </div>
          
          <div className="col-md-3">
            <select 
              className={`form-select shadow-none ${!filters.filiereId ? 'bg-light' : 'border-success'}`}
              name="specialiteId" 
              value={filters.specialiteId} 
              onChange={handleFilterChange}
              disabled={!filters.filiereId}
            >
              <option value="">{filters.filiereId ? '-- Toutes les spécialités --' : 'Sélectionnez une filière'}</option>
              {specialites.map(s => (
                <option key={s.id} value={s.id}>{s.libelle || s.intitule}</option>
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
            <select className="form-select shadow-none" name="statut" value={filters.statut} onChange={handleFilterChange}>
              <option value="">Tous les statuts</option>
              <option value="PENDING">PENDING</option>
              <option value="VALIDATED">VALIDATED</option>
              <option value="REJECTED">REJECTED</option>
            </select>
          </div>

          <div className="col-md-1 d-flex align-items-center justify-content-center">
            {loading && <BiLoaderAlt className="spinner-border text-primary border-0" style={{width: '1.2rem', height: '1.2rem'}} />}
          </div>
        </div>
      </div>

      {/* TABLEAU DES RÉSULTATS */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3 border-0">CANDIDAT</th>
                <th className="py-3 border-0">FILIÈRE</th>
                <th className="py-3 border-0">SPÉCIALITÉ</th>
                <th className="py-3 border-0 text-center">STATUT</th>
                <th className="py-3 border-0 text-center">SEXE</th>
                <th className="text-end px-4 py-3 border-0">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {candidates.length > 0 ? (
                candidates.map((c) => (
                  <tr key={c.id}>
                    <td className="px-4">
                      <div className="d-flex align-items-center">
                        <div className="bg-light rounded-circle p-2 me-3 text-primary"><BiUser size={20} /></div>
                        <div>
                          <div className="fw-bold">{c.nom} {c.prenom}</div>
                          <small className="text-muted">{c.matricule}</small>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge bg-light text-dark border">{c.filiere}</span></td>
                    <td><small className="text-primary fw-medium">{c.specialite}</small></td>
                    <td className="text-center">{getStatusBadge(c.dossier?.statut)}</td>
                    <td className="text-center">
                      <span className={`badge rounded-pill ${c.sexe === 'MASCULIN' ? 'bg-info text-dark' : 'bg-danger text-white'} px-3`}>{c.sexe}</span>
                    </td>
                    <td className="text-end px-4">
                      <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => setSelectedCandidat(c)}>Voir profil</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center py-5 text-muted">Aucun candidat ne correspond à ces critères.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CandidatComponent;