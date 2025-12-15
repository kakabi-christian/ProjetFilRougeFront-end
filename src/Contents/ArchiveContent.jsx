// src/components/ArchiveContent.jsx
import React, { useState, useEffect } from 'react';
import {
  getAnnees,
  getDepartements,
  getFilieresByDepartement,
  getEpreuvesBySpecialite,
  getArchivesByEpreuve,
} from '../services/archiveService';

export default function ArchiveContent() {
  const [annees, setAnnees] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [specialites, setSpecialites] = useState([]);
  const [epreuves, setEpreuves] = useState([]);
  const [archives, setArchives] = useState([]);

  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedDepartement, setSelectedDepartement] = useState('');
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [selectedSpecialite, setSelectedSpecialite] = useState('');
  const [selectedEpreuve, setSelectedEpreuve] = useState('');

  const API_BASE_URL = 'http://localhost:3000';

  // Charger les années et départements
  useEffect(() => {
    getAnnees().then(res => setAnnees(res.data));
    getDepartements().then(res => setDepartements(res.data));
  }, []);

  // Charger les filières
  useEffect(() => {
    if (selectedDepartement) {
      getFilieresByDepartement(selectedDepartement).then(res => setFilieres(res.data));
      setSpecialites([]);
      setEpreuves([]);
      setArchives([]);
      setSelectedFiliere('');
      setSelectedSpecialite('');
      setSelectedEpreuve('');
    } else {
      setFilieres([]);
    }
  }, [selectedDepartement]);

  // Charger les spécialités
  useEffect(() => {
    if (selectedFiliere) {
      const filiere = filieres.find(f => f.id === selectedFiliere);
      setSpecialites(filiere?.specialites || []);
      setEpreuves([]);
      setArchives([]);
      setSelectedSpecialite('');
      setSelectedEpreuve('');
    } else {
      setSpecialites([]);
    }
  }, [selectedFiliere, filieres]);

  // Charger les épreuves
  useEffect(() => {
    if (selectedSpecialite) {
      getEpreuvesBySpecialite(selectedSpecialite).then(res => setEpreuves(res.data));
      setArchives([]);
      setSelectedEpreuve('');
    } else {
      setEpreuves([]);
    }
  }, [selectedSpecialite]);

  // Charger les archives
  useEffect(() => {
    if (selectedEpreuve) {
      getArchivesByEpreuve(selectedEpreuve).then(res => {
        const dataWithFullUrl = res.data.map(a => ({
          ...a,
          fileUrl: a.fileUrl?.startsWith('http') ? a.fileUrl : `${API_BASE_URL}${a.fileUrl}`,
        }));
        setArchives(dataWithFullUrl);
      });
    } else {
      setArchives([]);
    }
  }, [selectedEpreuve]);

  return (
    <div className="container mt-5 mb-5">
      <div className="card p-4 shadow">
        <h2 className="text-center mb-4">Archives des épreuves</h2>

        {/* Année */}
        <div className="mb-3">
          <label className="form-label">Année :</label>
          <select className="form-select" value={selectedAnnee} onChange={e => setSelectedAnnee(e.target.value)}>
            <option value="">-- Sélectionner une année --</option>
            {annees.map(a => <option key={a.id} value={a.id}>{a.libelle}</option>)}
          </select>
          {!annees.length && <small className="text-muted">Aucune année disponible.</small>}
        </div>

        {/* Département */}
        <div className="mb-3">
          <label className="form-label">Département :</label>
          <select className="form-select" value={selectedDepartement} onChange={e => setSelectedDepartement(e.target.value)}>
            <option value="">-- Sélectionner un département --</option>
            {departements.map(d => <option key={d.id} value={d.id}>{d.nomDep}</option>)}
          </select>
          {selectedDepartement && filieres.length === 0 && <small className="text-muted">Aucune filière disponible.</small>}
        </div>

        {/* Filière */}
        {filieres.length > 0 && (
          <div className="mb-3">
            <label className="form-label">Filière :</label>
            <select className="form-select" value={selectedFiliere} onChange={e => setSelectedFiliere(e.target.value)}>
              <option value="">-- Sélectionner une filière --</option>
              {filieres.map(f => <option key={f.id} value={f.id}>{f.intitule}</option>)}
            </select>
          </div>
        )}
        {selectedFiliere && specialites.length === 0 && <small className="text-muted">Aucune spécialité disponible.</small>}

        {/* Spécialité */}
        {specialites.length > 0 && (
          <div className="mb-3">
            <label className="form-label">Spécialité :</label>
            <select className="form-select" value={selectedSpecialite} onChange={e => setSelectedSpecialite(e.target.value)}>
              <option value="">-- Sélectionner une spécialité --</option>
              {specialites.map(s => <option key={s.id} value={s.id}>{s.libelle}</option>)}
            </select>
          </div>
        )}

        {selectedSpecialite && epreuves.length === 0 && <small className="text-muted">Aucune épreuve disponible.</small>}

        {/* Épreuve */}
        {epreuves.length > 0 && (
          <div className="mb-3">
            <label className="form-label">Épreuve :</label>
            <select className="form-select" value={selectedEpreuve} onChange={e => setSelectedEpreuve(e.target.value)}>
              <option value="">-- Sélectionner une épreuve --</option>
              {epreuves.map(ep => <option key={ep.id} value={ep.id}>{ep.nomEpreuve}</option>)}
            </select>
          </div>
        )}

        {/* Archives */}
        {archives.length > 0 ? (
          <div className="mt-4">
            <h4>Archives disponibles :</h4>
            <ul className="list-group">
              {archives.map(a => (
                <li key={a.id} className="list-group-item">
                  {a.fileUrl?.endsWith('.pdf') ? (
                    <a href={a.fileUrl} target="_blank" rel="noopener noreferrer">📄 Voir le PDF</a>
                  ) : (
                    <div>
                      <img
                        src={a.fileUrl}
                        alt="Archive"
                        className="img-fluid my-2"
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                      <small className="text-muted">URL: {a.fileUrl}</small>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : selectedEpreuve ? (
          <div className="alert alert-info mt-4">Aucune archive disponible pour cette épreuve.</div>
        ) : null}
      </div>
    </div>
  );
}
