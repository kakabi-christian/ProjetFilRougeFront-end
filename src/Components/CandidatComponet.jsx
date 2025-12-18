import React, { useState, useEffect, useCallback } from 'react';
import { 
  BiSearch, BiChevronLeft, BiChevronRight, 
  BiUser, BiLoaderAlt, BiFilterAlt, BiErrorCircle,
  BiArrowBack, BiEnvelope, BiPhone, BiFlag, BiCreditCard,
  BiCalendar, BiMap, BiBuilding, BiBook, BiAward,
  BiGroup, BiCheckCircle, BiFile, BiXCircle, BiDownload
} from 'react-icons/bi';

// Importation corrigée pour éviter l'erreur "doc.autoTable is not a function"
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Importez vos services
import candidatService from '../services/candidatService';
import { getPiecesDossier } from '../services/PiecesDossierService';

// Composant réutilisable pour les champs d'information du profil
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
  // États de la Liste
  const [candidates, setCandidates] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, lastPage: 1, hasNextPage: false, hasPreviousPage: false });
  const [filters, setFilters] = useState({ search: '', filiereId: '', sexe: '', page: 1, limit: 10 });

  // États du Profil Sélectionné
  const [selectedCandidat, setSelectedCandidat] = useState(null);
  const [pieces, setPieces] = useState([]);
  const [checkedPieces, setCheckedPieces] = useState({});
  const [isTerminating, setIsTerminating] = useState(false);

  // --- LOGIQUE EXPORT PDF CORRIGÉE ---
  const generatePDF = async () => {
    setIsExporting(true);
    try {
      // On récupère une liste plus large pour l'export (ex: 500 max pour éviter le timeout)
      const response = await candidatService.getDetailedList({ ...filters, limit: 500, page: 1 });
      const dataToExport = response.candidates || [];

      if (dataToExport.length === 0) {
        alert("Aucune donnée à exporter.");
        return;
      }

      const doc = new jsPDF();
      
      // En-tête
      doc.setFontSize(18);
      doc.text("LISTE DES CANDIDATS", 14, 20);
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Généré le : ${new Date().toLocaleString()}`, 14, 28);
      doc.text(`Nombre total : ${dataToExport.length}`, 14, 33);

      // Données du tableau
      const tableColumn = ["Matricule", "Nom & Prénom", "Sexe", "Filière", "Centre"];
      const tableRows = dataToExport.map(c => [
        c.matricule,
        `${c.nom} ${c.prenom}`,
        c.sexe,
        c.filiere,
        c.centreExamen
      ]);

      // Appel corrigé de autoTable (on passe 'doc' en premier paramètre)
      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'striped',
        headStyles: { fillColor: [13, 110, 253] },
        styles: { fontSize: 8 },
        didDrawPage: (data) => {
          // Bas de page
          doc.setFontSize(8);
          doc.text(`Page ${data.pageNumber}`, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10);
        }
      });

      doc.save(`Liste_Candidats_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error("Erreur PDF détaillée:", err);
      alert("Erreur lors de la génération du PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  // 1. Charger les filières au montage
  useEffect(() => {
    const fetchFilieres = async () => {
      try {
        const data = await candidatService.getFilieres();
        setFilieres(Array.isArray(data) ? data : []);
      } catch (err) { console.error("Erreur filières:", err); }
    };
    fetchFilieres();
  }, []);

  // 2. Charger les candidats (Liste)
  const loadCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const result = await candidatService.getDetailedList(filters);
      if (result && result.candidates) {
        setCandidates(result.candidates);
        setPagination(result.pagination);
      }
    } catch (err) {
      setError("Erreur de connexion au serveur.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => { if (!selectedCandidat) loadCandidates(); }, 400);
    return () => clearTimeout(timer);
  }, [loadCandidates, selectedCandidat]);

  // 3. Charger les pièces lorsqu'un candidat est sélectionné
  useEffect(() => {
    if (selectedCandidat) {
      const fetchPieces = async () => {
        try {
          const piecesData = await getPiecesDossier();
          setPieces(piecesData);
          const initialChecked = {};
          piecesData.forEach(p => initialChecked[p.id] = false);
          setCheckedPieces(initialChecked);
        } catch (err) { console.error("Erreur pièces:", err); }
      };
      fetchPieces();
      window.scrollTo(0, 0);
    }
  }, [selectedCandidat]);

  // Handlers
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  const handleCheckboxChange = (pieceId) => {
    setCheckedPieces(prev => ({ ...prev, [pieceId]: !prev[pieceId] }));
  };

  const areAllPiecesChecked = pieces.length > 0 && pieces.every(p => checkedPieces[p.id]);

  const handleTerminate = () => {
    setIsTerminating(true);
    setTimeout(() => {
      setIsTerminating(false);
      setSelectedCandidat(null);
    }, 2500);
  };

  // --- RENDU VUE PROFIL DÉTAILLÉ ---
  if (selectedCandidat) {
    if (isTerminating) {
      return (
        <div className="container mt-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ height: '70vh' }}>
          <div className="spinner-grow text-success" style={{ width: '4rem', height: '4rem' }} role="status"></div>
          <h2 className='mt-4 text-success'>Validation du Dossier en cours...</h2>
          <p className="text-muted">Enregistrement des modifications et retour à la liste.</p>
        </div>
      );
    }

    return (
      <div className="container my-4 animate__animated animate__fadeIn">
        <button className="btn btn-light border mb-4 shadow-sm rounded-pill px-4" onClick={() => setSelectedCandidat(null)}>
          <BiArrowBack className="me-2" /> Retour à la liste
        </button>

        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
          <h2 className="text-dark fw-light">
            Dossier Candidat: <span className='fw-bold text-primary'>{selectedCandidat.nom} {selectedCandidat.prenom}</span>
          </h2>
          <span className="badge bg-primary px-3 py-2">{selectedCandidat.matricule}</span>
        </div>

        <div className="row">
          <h5 className="mb-3 text-primary fw-bold"><BiUser className="me-2"/> Identité & Contact</h5>
          <InfoField label="Nom Complet" value={`${selectedCandidat.nom} ${selectedCandidat.prenom}`} icon={BiUser} />
          <InfoField label="Email" value={selectedCandidat.email || "Non fourni"} icon={BiEnvelope} />
          <InfoField label="Téléphone" value={selectedCandidat.telephone} icon={BiPhone} />
          <InfoField label="Nationalité" value={selectedCandidat.nationalite} icon={BiFlag} />
          <InfoField label="Numéro CNI" value={selectedCandidat.numeroCni} icon={BiCreditCard} />
          <InfoField label="Sexe" value={selectedCandidat.sexe} icon={BiUser} />
          
          <h5 className="mt-4 mb-3 text-primary fw-bold"><BiMap className="me-2"/> Localisation & Naissance</h5>
          <InfoField label="Date de naissance" value={selectedCandidat.dateNaissance} icon={BiCalendar} />
          <InfoField label="Lieu de naissance" value={selectedCandidat.lieuNaissance} icon={BiMap} />
          <InfoField label="Région / Ville" value={`${selectedCandidat.region || ''} - ${selectedCandidat.ville || ''}`} icon={BiBuilding} />

          <h5 className="mt-4 mb-3 text-primary fw-bold"><BiGroup className="me-2"/> Informations Parentales</h5>
          <InfoField label="Père" value={selectedCandidat.nomPere} icon={BiUser} />
          <InfoField label="Téléphone Père" value={selectedCandidat.telephonePere} icon={BiPhone} />
          <InfoField label="Mère" value={selectedCandidat.nomMere} icon={BiUser} />
          <InfoField label="Téléphone Mère" value={selectedCandidat.telephoneMere} icon={BiPhone} />

          <h5 className="mt-4 mb-3 text-primary fw-bold"><BiBook className="me-2"/> Dossier Examen</h5>
          <InfoField label="Filière" value={selectedCandidat.filiere} icon={BiBook} />
          <InfoField label="Centre d'Examen" value={selectedCandidat.centreExamen} icon={BiBuilding} />
          <InfoField label="Numéro Reçu" value={selectedCandidat.numeroRecu} icon={BiAward} />
        </div>

        <div className="card shadow-lg mt-5 border-0 overflow-hidden">
          <div className="card-header bg-dark text-white py-3">
            <h5 className="mb-0"><BiFile className="me-2"/> Vérification des Pièces du Dossier</h5>
          </div>
          <div className="card-body p-4 bg-light">
            <div className="row g-3">
              {pieces.map(piece => (
                <div key={piece.id} className="col-md-6 col-lg-4">
                  <div 
                    className={`p-3 border rounded shadow-sm d-flex align-items-center ${checkedPieces[piece.id] ? 'border-success bg-white' : 'bg-white text-muted'}`}
                    style={{ cursor: 'pointer', transition: '0.2s' }}
                    onClick={() => handleCheckboxChange(piece.id)}
                  >
                    <div className="fs-3 me-3">
                      {checkedPieces[piece.id] ? <BiCheckCircle className="text-success" /> : <BiXCircle className="text-light" />}
                    </div>
                    <span className="fw-medium">{piece.nom || piece.description}</span>
                  </div>
                </div>
              ))}
            </div>

            {areAllPiecesChecked ? (
              <button className="btn btn-success btn-lg mt-5 w-100 shadow" onClick={handleTerminate}>
                Confirmer et Valider le Dossier
              </button>
            ) : (
              <div className="alert alert-warning mt-5 text-center">
                Veuillez cocher toutes les pièces pour valider le dossier.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- RENDU VUE LISTE (DÉFAUT) ---
  return (
    <div className="container-fluid p-4 bg-light min-vh-100">
      <div className="d-flex justify-content-between align-items-end mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Portail Candidats</h2>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item text-primary" style={{cursor:'pointer'}}>Tableau de bord</li>
              <li className="breadcrumb-item active">Liste des candidats</li>
            </ol>
          </nav>
        </div>
        <div className="text-end d-flex gap-2">
          <button 
            className="btn btn-danger shadow-sm d-flex align-items-center rounded-pill px-3"
            onClick={generatePDF}
            disabled={isExporting || candidates.length === 0}
          >
            {isExporting ? <BiLoaderAlt className="spinner-border border-0 me-2" style={{width: '1rem', height: '1rem'}} /> : <BiDownload className="me-2" />}
            {isExporting ? 'Génération...' : 'Exporter PDF'}
          </button>

          <span className="badge bg-white text-dark border shadow-sm p-2 px-3 d-flex align-items-center">
            <span className="text-primary fw-bold me-1">{pagination.total}</span> Candidats enregistrés
          </span>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4 p-3">
        <div className="row g-3 align-items-center">
          <div className="col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-white border-end-0"><BiSearch /></span>
              <input type="text" name="search" className="form-control border-start-0 shadow-none" placeholder="Rechercher..." value={filters.search} onChange={handleFilterChange} />
            </div>
          </div>
          <div className="col-md-3">
            <select className="form-select shadow-none" name="filiereId" value={filters.filiereId} onChange={handleFilterChange}>
              <option value="">Toutes les filières</option>
              {filieres.map(f => <option key={f.id} value={f.id}>{f.intitule}</option>)}
            </select>
          </div>
          <div className="col-md-3">
            <select className="form-select shadow-none" name="sexe" value={filters.sexe} onChange={handleFilterChange}>
              <option value="">Tous les sexes</option>
              <option value="MASCULIN">Masculin</option>
              <option value="FEMININ">Féminin</option>
            </select>
          </div>
          <div className="col-md-1 text-center">
            {loading && <BiLoaderAlt className="spinner-border text-primary border-0" style={{width: '1.2rem', height: '1.2rem'}} />}
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-primary text-white">
              <tr>
                <th className="px-4 py-3 border-0">CANDIDAT / MATRICULE</th>
                <th className="py-3 border-0 text-center">SEXE</th>
                <th className="py-3 border-0">FILIÈRE</th>
                <th className="py-3 border-0">CENTRE</th>
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
                          <small className="text-muted font-monospace">{c.matricule}</small>
                        </div>
                      </div>
                    </td>
                    <td className="text-center">
                      <span className={`badge rounded-pill ${c.sexe === 'MASCULIN' ? 'bg-info text-dark' : 'bg-danger text-white'} bg-opacity-10 px-3`}>{c.sexe}</span>
                    </td>
                    <td>{c.filiere}</td>
                    <td><small className="text-muted">{c.centreExamen}</small></td>
                    <td className="text-end px-4">
                      <button 
                        className="btn btn-primary btn-sm rounded-pill px-4 shadow-none"
                        onClick={() => setSelectedCandidat(c)}
                      >
                        Voir profil
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="text-center py-5 text-muted">Aucun candidat trouvé.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer bg-white border-top p-3 d-flex justify-content-between align-items-center">
          <small className="text-muted">Page {pagination.page} sur {pagination.lastPage}</small>
          <div className="btn-group">
            <button className="btn btn-outline-light btn-sm text-dark border" disabled={!pagination.hasPreviousPage} onClick={() => setFilters(f => ({...f, page: f.page - 1}))}><BiChevronLeft/></button>
            <button className="btn btn-primary btn-sm px-3" disabled={!pagination.hasNextPage} onClick={() => setFilters(f => ({...f, page: f.page + 1}))}>Suivant <BiChevronRight/></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidatComponent;