// src/Contents/ArchiveContent.jsx
import React, { useState, useEffect } from 'react';
import {
  getAnnees,
  getDepartements,
  getFilieresByDepartement,
  getEpreuvesByFiliere,
  getArchivesByEpreuve,
} from '../services/archiveService';

export default function ArchiveContent() {
  const [annees, setAnnees] = useState([]);
  const [departements, setDepartements] = useState([]);
  const [filieres, setFilieres] = useState([]);
  const [epreuves, setEpreuves] = useState([]);
  const [archives, setArchives] = useState([]);

  const [selectedAnnee, setSelectedAnnee] = useState('');
  const [selectedDepartement, setSelectedDepartement] = useState('');
  const [selectedFiliere, setSelectedFiliere] = useState('');
  const [selectedEpreuve, setSelectedEpreuve] = useState('');

  // 🔹 URL de base de votre backend NestJS
  const API_BASE_URL = 'http://localhost:3000';

  // Charger les années et départements
  useEffect(() => {
    getAnnees().then(res => setAnnees(res.data));
    getDepartements().then(res => setDepartements(res.data));
  }, []);

  // Charger les filières quand un département est sélectionné
  useEffect(() => {
    if (selectedDepartement) {
      getFilieresByDepartement(selectedDepartement).then(res => setFilieres(res.data));
      setEpreuves([]);
      setArchives([]);
      setSelectedFiliere('');
      setSelectedEpreuve('');
    }
  }, [selectedDepartement]);

  // Charger les épreuves quand une filière est sélectionnée
  useEffect(() => {
    if (selectedFiliere) {
      getEpreuvesByFiliere(selectedFiliere).then(res => setEpreuves(res.data));
      setArchives([]);
      setSelectedEpreuve('');
    }
  }, [selectedFiliere]);

  // Charger les archives quand une épreuve est sélectionnée
  useEffect(() => {
    if (selectedEpreuve) {
      getArchivesByEpreuve(selectedEpreuve).then(res => {
        // ✅ Construire l'URL complète avec l'URL du backend
        const dataWithFullUrl = res.data.map(a => ({
          ...a,
          // Si fileUrl commence par '/', on ajoute l'URL du backend
          fileUrl: a.fileUrl?.startsWith('http') 
            ? a.fileUrl 
            : `${API_BASE_URL}${a.fileUrl}`,
        }));
        setArchives(dataWithFullUrl);
      });
    }
  }, [selectedEpreuve]);

  return (
    <div className="container mt-5">
      <h2>Archives des épreuves</h2>

      {/* Sélection de l'année */}
      <div className="mb-3">
        <label>Année:</label>
        <select
          className="form-select"
          value={selectedAnnee}
          onChange={e => setSelectedAnnee(e.target.value)}
        >
          <option value="">-- Sélectionner une année --</option>
          {annees.map(a => (
            <option key={a.id} value={a.id}>
              {a.libelle}
            </option>
          ))}
        </select>
      </div>

      {/* Sélection du département */}
      <div className="mb-3">
        <label>Département:</label>
        <select
          className="form-select"
          value={selectedDepartement}
          onChange={e => setSelectedDepartement(e.target.value)}
        >
          <option value="">-- Sélectionner un département --</option>
          {departements.map(d => (
            <option key={d.id} value={d.id}>
              {d.nomDep}
            </option>
          ))}
        </select>
      </div>

      {/* Sélection de la filière */}
      {filieres.length > 0 && (
        <div className="mb-3">
          <label>Filière:</label>
          <select
            className="form-select"
            value={selectedFiliere}
            onChange={e => setSelectedFiliere(e.target.value)}
          >
            <option value="">-- Sélectionner une filière --</option>
            {filieres.map(f => (
              <option key={f.id} value={f.id}>
                {f.intitule}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sélection de l'épreuve */}
      {epreuves.length > 0 && (
        <div className="mb-3">
          <label>Épreuve:</label>
          <select
            className="form-select"
            value={selectedEpreuve}
            onChange={e => setSelectedEpreuve(e.target.value)}
          >
            <option value="">-- Sélectionner une épreuve --</option>
            {epreuves.map(ep => (
              <option key={ep.id} value={ep.id}>
                {ep.nomEpreuve}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Affichage des archives */}
      {archives.length > 0 && (
        <div className="mt-4">
          <h4>Archives disponibles:</h4>
          <ul className="list-group">
            {archives.map(a => (
              <li key={a.id} className="list-group-item">
                {a.fileUrl?.endsWith('.pdf') ? (
                  <a href={a.fileUrl} target="_blank" rel="noopener noreferrer">
                    📄 Voir le PDF
                  </a>
                ) : (
                  <div>
                    <img
                      src={a.fileUrl}
                      alt="Archive"
                      style={{ 
                        maxWidth: '400px', 
                        maxHeight: '400px', 
                        objectFit: 'contain',
                        display: 'block',
                        margin: '10px 0'
                      }}
                      onError={(e) => {
                        console.error('Erreur de chargement image:', a.fileUrl);
                        e.target.style.display = 'none';
                      }}
                    />
                    <small className="text-muted">URL: {a.fileUrl}</small>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Message si aucune archive */}
      {selectedEpreuve && archives.length === 0 && (
        <div className="alert alert-info mt-4">
          Aucune archive disponible pour cette épreuve.
        </div>
      )}
    </div>
  );
}