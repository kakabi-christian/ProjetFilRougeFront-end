import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import StatistiqueService from '../services/StatistiqueService'; // Assurez-vous que ce chemin est correct

// =========================================================================
// CODES COULEURS UTILISÉS DANS L'APPLICATION (Mise à jour avec vos couleurs)
// =========================================================================
const COLORS = {
    // Couleurs fournies par l'utilisateur
    GREEN: '#25963F', // Utilisé pour le Succès / Montant Total
    BLUE: '#1E90FF', // Utilisé pour les Candidats / Primaire

    // Couleurs existantes adaptées
    PRIMARY: '#667eea', 
    SECONDARY: '#ec4899', // Filières / Mentions
    SUCCESS: '#10b981', 
    WARNING: '#f59e0b', // Paiements En Attente
    DANGER: '#ef4444', // Échecs / Féminin
    INFO: '#06b6d4', // Mentions
    NEUTRAL: '#764ba2', // Dégradé
};

// Couleurs spécifiques pour les Pie Charts
const PIE_COLORS_SEXE = [COLORS.BLUE, COLORS.DANGER]; // Masculin / Féminin
const PIE_COLORS_PAIEMENT = [COLORS.GREEN, COLORS.WARNING, COLORS.DANGER]; // SUCCESS, PENDING, FAILED

// Fonction pour formater l'axe Y des montants
const formatYAxis = (tick) => {
    if (tick >= 1000000) return (tick / 1000000).toFixed(1) + 'M';
    if (tick >= 1000) return (tick / 1000).toFixed(0) + 'K';
    return tick;
};

// Fonction pour obtenir la couleur du statut de paiement
const getPaiementColor = (name) => {
    switch (name) {
        case 'SUCCESS':
            return COLORS.GREEN;
        case 'PENDING':
            return COLORS.WARNING;
        case 'FAILED':
            return COLORS.DANGER;
        default:
            return COLORS.NEUTRAL;
    }
}

export default function GrapheContent() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const fetchAllStats = async () => {
            try {
                setLoading(true);

                // Récupération de TOUTES les données complexes pour les graphiques
                const [
                    totalCandidats, sexeCandidats, candidatsParSpecialite, candidatsParFiliere,
                    candidatsParConcours, nombrePaiementsStatut, totalPaiements, candidatsParSession,
                    candidatsParMention
                ] = await Promise.all([
                    StatistiqueService.totalCandidats(),
                    StatistiqueService.sexeCandidats(),
                    StatistiqueService.candidatsParSpecialite(),
                    StatistiqueService.candidatsParFiliere(),
                    StatistiqueService.candidatsParConcours(),
                    StatistiqueService.nombrePaiementsStatut(),
                    StatistiqueService.totalPaiements(),
                    StatistiqueService.candidatsParSession(),
                    StatistiqueService.candidatsParMention(),
                ]);

                setStats({
                    totalCandidats,
                    sexeCandidats,
                    candidatsParSpecialite,
                    candidatsParFiliere,
                    candidatsParConcours,
                    nombrePaiementsStatut,
                    totalPaiements,
                    candidatsParSession,
                    candidatsParMention,
                });

            } catch (err) {
                console.error(err);
                setError('Erreur lors du chargement des statistiques. Vérifiez la connexion au service.');
            } finally {
                setLoading(false);
            }
        };

        fetchAllStats();
    }, []);

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '80vh', background: `linear-gradient(135deg, ${COLORS.BLUE} 0%, ${COLORS.NEUTRAL} 100%)` }}>
                <div className="spinner-border text-white mb-4" role="status" style={{ width: '4rem', height: '4rem', borderWidth: '0.4rem' }}>
                    <span className="visually-hidden">Chargement...</span>
                </div>
                <h4 className="text-white fw-bold mb-2">Chargement des graphiques...</h4>
                <p className="text-white-50">Préparation des visualisations de données</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger shadow-lg border-0 rounded-4" role="alert">
                    <div className="d-flex align-items-center">
                        <i className="bi bi-exclamation-triangle-fill fs-2 me-3"></i>
                        <div>
                            <h5 className="alert-heading mb-1">Erreur de chargement</h5>
                            <p className="mb-0">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // =========================================================================
    // TRANSFORMATION DES DONNÉES POUR RECHARTS
    // =========================================================================

    // 1. Données Sexe (pour Pie Chart)
    const sexeData = [
        { name: 'Garçons', value: stats.sexeCandidats?.masculins || 0 }, // J'ai corrigé 'male' en 'masculins'
        { name: 'Filles', value: stats.sexeCandidats?.feminins || 0 }, // J'ai corrigé 'female' en 'feminins'
    ].filter(d => d.value > 0); 

    // 2. Données Paiements Statut (pour Pie Chart)
    const paiementStatutData = stats.nombrePaiementsStatut?.map(s => ({
        name: s.statut,
        value: s.nombre, // 'nombre' est le nom de la clé dans le service mis à jour
    })) || [];
    
    // 3. Données Spécialités (pour Bar Chart)
    const specialiteData = Object.entries(stats.candidatsParSpecialite || {}).map(([name, details]) => ({
        name,
        'Garçons': details.garçons,
        'Filles': details.filles,
    }));

    // 4. Données Concours Montants (pour Combined Chart)
    const concoursData = stats.candidatsParConcours?.map(c => ({
        name: c.concours,
        'Candidats': c.nbCandidats,
        'Montant Total (XOF)': c.montantTotal,
    })) || [];

    // 5. Données Filières (pour Bar Chart)
    const filiereData = stats.candidatsParFiliere?.map(f => ({
        name: f.filiere,
        'Total Candidats': f.total,
    })) || [];
    
    // 6. Données Mentions (pour Bar Chart)
    const mentionData = stats.candidatsParMention?.map(m => ({
        name: m.mention, // J'ai corrigé 'Mention' en 'mention'
        'Nombre': m.total, // J'ai corrigé '_count.id' en 'total'
    })) || [];


    // =========================================================================
    // RENDU DES GRAPHIQUES
    // =========================================================================
    return (
        <div className="container-fluid py-5" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
            <div className="text-center mb-5 pb-4">
                <div className="d-inline-block px-4 py-2 rounded-pill mb-3" style={{ background: `linear-gradient(135deg, ${COLORS.BLUE} 0%, ${COLORS.NEUTRAL} 100%)` }}>
                    <i className="bi bi-bar-chart-fill text-white fs-4"></i>
                </div>
                <h1 className="display-5 fw-bold mb-2" style={{ background: `linear-gradient(135deg, ${COLORS.BLUE} 0%, ${COLORS.NEUTRAL} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Visualisations des Statistiques
                </h1>
                <p className="text-muted fs-5">Rapport graphique des données clés</p>
            </div>

            <div className="row g-5">
                
                {/* GRAPHIQUE 1: Répartition par Sexe (Pie Chart) */}
                <div className="col-lg-6"> {/* 6/12 pour occuper la moitié de la ligne */}
                    <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
                        <div className="card-header border-0 py-3 px-4" style={{ background: `linear-gradient(90deg, ${COLORS.BLUE} 0%, ${COLORS.NEUTRAL} 100%)`, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                            <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                                <i className="bi bi-gender-ambiguous me-2"></i> Répartition des Candidats par Sexe
                            </h5>
                        </div>
                        <div className="card-body p-4 text-center">
                            {stats.totalCandidats > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={sexeData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60} // Ajout d'un rayon intérieur pour un Donut Chart
                                            outerRadius={100}
                                            fill="#8884d8"
                                            labelLine={false}
                                            label={({ percent, name }) => `${name} : ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {sexeData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={PIE_COLORS_SEXE[index % PIE_COLORS_SEXE.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="alert alert-info">Aucun candidat pour le graphique de sexe.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* GRAPHIQUE 2: Paiements par Statut (Pie Chart / Cercle) */}
                <div className="col-lg-6"> {/* 6/12 pour occuper la moitié de la ligne */}
                    <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
                        <div className="card-header border-0 py-3 px-4" style={{ background: `linear-gradient(90deg, ${COLORS.GREEN} 0%, ${COLORS.WARNING} 100%)`, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                            <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                                <i className="bi bi-currency-dollar me-2"></i> Répartition des Paiements par Statut
                            </h5>
                        </div>
                        <div className="card-body p-4 text-center">
                            {paiementStatutData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={paiementStatutData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60} // Donut Chart pour la consistance
                                            outerRadius={100}
                                            fill="#8884d8"
                                            labelLine={false}
                                            label={({ percent, name, value }) => `${name} : ${value} (${(percent * 100).toFixed(0)}%)`}
                                        >
                                            {paiementStatutData.map((entry, index) => (
                                                // Utilisation de la fonction pour déterminer la couleur par statut
                                                <Cell key={`cell-${index}`} fill={getPaiementColor(entry.name)} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="alert alert-info">Aucune donnée de paiement à afficher.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* GRAPHIQUE 3: Candidats par Spécialité et Sexe (Bar Chart Stacked) */}
                <div className="col-lg-12">
                    <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
                        <div className="card-header border-0 py-3 px-4" style={{ background: `linear-gradient(90deg, ${COLORS.SECONDARY} 0%, ${COLORS.DANGER} 100%)`, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                            <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                                <i className="bi bi-diagram-3-fill me-2"></i> Candidats par Spécialité (Répartition Hommes/Femmes)
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            {specialiteData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={specialiteData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                                        <XAxis dataKey="name" stroke={COLORS.SECONDARY} interval={0} angle={-15} textAnchor="end" height={60} />
                                        <YAxis stroke={COLORS.SECONDARY} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="Garçons" stackId="a" fill={COLORS.BLUE} />
                                        <Bar dataKey="Filles" stackId="a" fill={COLORS.DANGER} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="alert alert-info">Aucune donnée de spécialité à afficher.</div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* GRAPHIQUE 4: Candidats par Filière (Bar Chart Horizontal) */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
                        <div className="card-header border-0 py-3 px-4" style={{ background: `linear-gradient(90deg, ${COLORS.INFO} 0%, ${COLORS.SECONDARY} 100%)`, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                            <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                                <i className="bi bi-tag-fill me-2"></i> Candidats par Filière
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            {filiereData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={filiereData.length * 50 > 300 ? filiereData.length * 50 : 300}>
                                    <BarChart data={filiereData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                                        <XAxis type="number" stroke={COLORS.INFO} />
                                        <YAxis dataKey="name" type="category" stroke={COLORS.INFO} width={100} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="Total Candidats" fill={COLORS.INFO} radius={[10, 10, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="alert alert-info">Aucune donnée de filière à afficher.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* GRAPHIQUE 5: Candidats par Mention (Bar Chart Simple) */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
                        <div className="card-header border-0 py-3 px-4" style={{ background: `linear-gradient(90deg, ${COLORS.PRIMARY} 0%, ${COLORS.INFO} 100%)`, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                            <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                                <i className="bi bi-trophy-fill me-2"></i> Répartition par Mention
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            {mentionData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={mentionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                                        <XAxis dataKey="name" stroke={COLORS.PRIMARY} />
                                        <YAxis stroke={COLORS.PRIMARY} />
                                        <Tooltip cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }} />
                                        <Bar dataKey="Nombre" fill={COLORS.PRIMARY} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="alert alert-info">Aucune donnée de mention à afficher.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* GRAPHIQUE 6: Montants Totaux des Concours vs Nombre de Candidats (Combined Chart) */}
                <div className="col-lg-12">
                    <div className="card border-0 shadow-lg h-100" style={{ borderRadius: '20px' }}>
                        <div className="card-header border-0 py-3 px-4" style={{ background: `linear-gradient(90deg, ${COLORS.BLUE} 0%, ${COLORS.GREEN} 100%)`, borderTopLeftRadius: '20px', borderTopRightRadius: '20px' }}>
                            <h5 className="mb-0 text-white fw-bold d-flex align-items-center">
                                <i className="bi bi-bar-chart-line-fill me-2"></i> Performance Financière par Concours
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            {concoursData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={350}>
                                    <BarChart data={concoursData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#c3dafe" />
                                        <XAxis dataKey="name" stroke={COLORS.BLUE} interval={0} angle={-15} textAnchor="end" height={60} />
                                        <YAxis yAxisId="left" orientation="left" stroke={COLORS.BLUE} label={{ value: 'Candidats', angle: -90, position: 'insideLeft' }} />
                                        <YAxis yAxisId="right" orientation="right" stroke={COLORS.GREEN} tickFormatter={formatYAxis} label={{ value: 'Montant (FCFA)', angle: 90, position: 'insideRight' }} />
                                        <Tooltip formatter={(value, name) => [name.includes('Montant') ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(value).replace('XOF', 'FCFA') : value, name]} />
                                        <Legend />
                                        
                                        <Bar yAxisId="left" dataKey="Candidats" fill={COLORS.BLUE} name="Nombre de Candidats" opacity={0.7} />
                                        <Line yAxisId="right" dataKey="Montant Total (XOF)" stroke={COLORS.GREEN} type="monotone" strokeWidth={3} dot={{ stroke: COLORS.GREEN, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="alert alert-info">Aucune donnée de concours à afficher.</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            
        </div>
    );
}