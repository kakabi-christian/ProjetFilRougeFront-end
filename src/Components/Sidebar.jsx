import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
// Import du service pour le compteur
import DossierService from "../services/DossierService";
import { FaBuilding, FaDoorOpen } from "react-icons/fa";

import {
  BiBarChart,
  BiLogOut,
  BiStats,
  BiBuildings,
  BiCalendar,
  BiLayer,
  BiArchive,
  BiTask,
  BiChevronDown,
  BiShieldQuarter,
  BiUserCircle,
  BiFile,
  BiFolderOpen,
  BiCog,
} from "react-icons/bi";
import { AiOutlinePieChart, AiOutlineDashboard } from "react-icons/ai";
import {
  FaUserFriends,
  FaUniversity,
  FaSchool,
  FaBook,
  FaListUl,
  FaUserShield,
  FaUserCog,
} from "react-icons/fa";
import { MdOutlineClass, MdHistoryEdu } from "react-icons/md";
import { RiListSettingsFill } from "react-icons/ri";

export default function Sidebar() {
  const [showModal, setShowModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0); // État pour stocker le nombre de dossiers
  const navigate = useNavigate();

  const [openGroups, setOpenGroups] = useState({
    gestion: true,
    structure: false,
    organisation: false,
    cadre: false,
    securite: false,
    dossiers: false,
    analyse: false,
  });

  // --- RÉCUPÉRATION DU COMPTEUR ---
  // ... dans ton fichier Sidebar.jsx, modifie le useEffect :

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await DossierService.getPendingCount();
        setPendingCount(data.pendingCount);
      } catch (error) {
        console.error("[Sidebar] Erreur compteur:", error);
      }
    };

    fetchCount();

    // --- AJOUT ICI : Écouteur d'événement ---
    window.addEventListener("dossierStatusUpdated", fetchCount);

    // Nettoyage de l'intervalle et de l'écouteur
    const interval = setInterval(fetchCount, 60000);
    return () => {
      clearInterval(interval);
      window.removeEventListener("dossierStatusUpdated", fetchCount);
    };
  }, []);

  const toggleGroup = (group) => {
    setOpenGroups((prev) => ({ ...prev, [group]: !prev[group] }));
  };

  const handleLogout = () => {
    setShowModal(false);
    localStorage.removeItem("access_token");
    navigate("/Login");
  };

  const linkStyle = ({ isActive }) => ({
    textDecoration: "none",
    borderRadius: "10px",
    margin: "4px 0",
    padding: "10px 15px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between", // Permet de pousser le badge à l'extrémité droite
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    backgroundColor: isActive ? "#eef4ff" : "transparent",
    color: isActive ? "#0d6efd" : "#6c757d",
    fontWeight: isActive ? "600" : "500",
    borderLeft: isActive ? "4px solid #0d6efd" : "4px solid transparent",
    transform: isActive ? "translateX(5px)" : "translateX(0)",
  });

  const GroupHeader = ({ title, groupId, isOpen, icon: Icon }) => (
    <div
      onClick={() => toggleGroup(groupId)}
      className="d-flex justify-content-between align-items-center mt-3 px-2 py-2 rounded shadow-sm"
      style={{
        cursor: "pointer",
        background: isOpen ? "#f1f3f5" : "#f8f9fa",
        transition: "background 0.3s ease",
      }}
    >
      <div className="d-flex align-items-center">
        <div className="bg-white p-1 rounded me-2 shadow-sm">
          <Icon size={16} className="text-primary" />
        </div>
        <span
          className="text-uppercase fw-bold"
          style={{ fontSize: "0.72rem", letterSpacing: "0.5px" }}
        >
          {title}
        </span>
      </div>
      <BiChevronDown
        size={18}
        style={{
          transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </div>
  );

  const AnimatedGroup = ({ isOpen, children }) => (
    <div
      style={{
        display: "grid",
        gridTemplateRows: isOpen ? "1fr" : "0fr",
        transition:
          "grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
        opacity: isOpen ? 1 : 0,
        overflow: "hidden",
      }}
    >
      <div style={{ minHeight: 0 }}>
        <div className="ps-2 pt-1 pb-1">{children}</div>
      </div>
    </div>
  );

  return (
    <>
      <div
        className="sidebar bg-white border-end d-flex flex-column shadow-sm"
        style={{ width: "270px", height: "100vh", position: "sticky", top: 0 }}
      >
        {/* Logo Section */}
        <div className="p-4">
          <div className="bg-primary text-white p-3 rounded-4 d-flex align-items-center shadow-lg">
            <AiOutlineDashboard size={24} className="me-2" />
            <h4 className="fw-bold mb-0" style={{ fontSize: "1.2rem" }}>
              E-Concours
            </h4>
          </div>
        </div>

        {/* Navigation Content */}
        <div
          className="flex-grow-1 px-3"
          style={{ overflowY: "auto", scrollbarWidth: "none" }}
        >
          <ul className="nav flex-column">
            {/* 1. GESTION OPÉRATIONNELLE */}
            <GroupHeader
              title="Gestion des flux"
              groupId="gestion"
              isOpen={openGroups.gestion}
              icon={BiTask}
            />
            <AnimatedGroup isOpen={openGroups.gestion}>
              <NavLink
                to="/admin/candidats"
                className="nav-link"
                style={linkStyle}
              >
                <span>
                  <FaUserFriends className="me-3" /> Candidats
                </span>
              </NavLink>
              <NavLink
                to="/admin/concours"
                className="nav-link"
                style={linkStyle}
              >
                <span>
                  <BiTask className="me-3" /> Concours
                </span>
              </NavLink>
              <NavLink
                to="/admin/archive"
                className="nav-link"
                style={linkStyle}
              >
                <span>
                  <BiArchive className="me-3" /> Archives
                </span>
              </NavLink>
            </AnimatedGroup>

            {/* 2. CONFIGURATION DES PIÈCES */}
            <GroupHeader
              title="Paramétrage Dossiers"
              groupId="dossiers"
              isOpen={openGroups.dossiers}
              icon={BiCog}
            />
            <AnimatedGroup isOpen={openGroups.dossiers}>
              <NavLink
                to="/admin/piece-dossier"
                className="nav-link"
                style={linkStyle}
              >
                <span>
                  <BiFile className="me-3" /> Types de pièces
                </span>
              </NavLink>

              <NavLink
                to="/admin/dossier"
                className="nav-link"
                style={linkStyle}
              >
                <div className="d-flex align-items-center">
                  <BiFolderOpen className="me-3" />
                  Validation Dossiers
                </div>
                {/* Badge du compteur */}
                {pendingCount > 0 && (
                  <span
                    className="badge rounded-pill bg-danger animate-pulse"
                    style={{ fontSize: "0.65rem", padding: "5px 8px" }}
                  >
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            </AnimatedGroup>

            {/* 3. STRUCTURE ACADÉMIQUE */}
            <GroupHeader
              title="Structure académique"
              groupId="structure"
              isOpen={openGroups.structure}
              icon={BiBuildings}
            />
            <AnimatedGroup isOpen={openGroups.structure}>
              <NavLink
                to="/admin/departements"
                className="nav-link"
                style={linkStyle}
              >
                <span>
                  <BiBuildings className="me-3" /> Départements
                </span>
              </NavLink>
              <NavLink
                to="/admin/filieres"
                className="nav-link"
                style={linkStyle}
              >
                <span>
                  <FaBook className="me-3" /> Filières
                </span>
              </NavLink>
              <NavLink
                to="/admin/specialites"
                className="nav-link"
                style={linkStyle}
              >
                <span>
                  <RiListSettingsFill className="me-3" /> Spécialités
                </span>
              </NavLink>
              <NavLink
                to="/admin/batiment"
                className="nav-link"
                style={linkStyle}
              >
                <span>
                  <FaBuilding className="me-3" /> Bâtiments
                </span>
              </NavLink>

              <NavLink to="/admin/salle" className="nav-link" style={linkStyle}>
                <span>
                  <FaDoorOpen className="me-3" /> Salles
                </span>
              </NavLink>
            </AnimatedGroup>

            {/* 4. CADRE TEMPOREL & ÉVALUATION */}
            <GroupHeader
              title="Calendrier & Épreuves"
              groupId="cadre"
              isOpen={openGroups.cadre}
              icon={BiCalendar}
            />
            <AnimatedGroup isOpen={openGroups.cadre}>
              <NavLink
                to="/admin/annees"
                className="nav-link"
                style={linkStyle}
              >
                <span>
                  <BiCalendar className="me-3" /> Années académiques
                </span>
              </NavLink>
              <NavLink
                to="/admin/sessions"
                className="nav-link"
                style={linkStyle}
              >
                <span>
                  <MdHistoryEdu className="me-3" /> Sessions
                </span>
              </NavLink>
              <NavLink
                to="/admin/epreuves"
                className="nav-link"
                style={linkStyle}
              >
                <span>
                  <MdOutlineClass className="me-3" /> Épreuves
                </span>
              </NavLink>
              <NavLink
                to="/admin/niveaux"
                className="nav-link"
                style={linkStyle}
              >
                <span>
                  <BiLayer className="me-3" /> Niveaux
                </span>
              </NavLink>
            </AnimatedGroup>

            {/* 5. LOGISTIQUE */}
            <GroupHeader
              title="Centres & Logistique"
              groupId="organisation"
              isOpen={openGroups.organisation}
              icon={FaUniversity}
            />
            <AnimatedGroup isOpen={openGroups.organisation}>
              <NavLink
                to="/admin/centre-depot"
                className="nav-link"
                style={linkStyle}
              >
                <span>
                  <FaUniversity className="me-3" /> Centres de dépôt
                </span>
              </NavLink>
              <NavLink
                to="/admin/centre-examen"
                className="nav-link"
                style={linkStyle}
              >
                <span>
                  <FaSchool className="me-3" /> Centres d’examen
                </span>
              </NavLink>
            </AnimatedGroup>

            {/* 6. SÉCURITÉ & ACCÈS */}
            <GroupHeader
              title="Sécurité & Accès"
              groupId="securite"
              isOpen={openGroups.securite}
              icon={BiShieldQuarter}
            />
            <AnimatedGroup isOpen={openGroups.securite}>
              <NavLink to="/admin/admin" className="nav-link" style={linkStyle}>
                <span>
                  <FaUserShield className="me-3" /> Administrateurs
                </span>
              </NavLink>
              <NavLink to="/admin/roles" className="nav-link" style={linkStyle}>
                <span>
                  <FaUserCog className="me-3" /> Rôles & Permissions
                </span>
              </NavLink>
            </AnimatedGroup>

            {/* 7. ANALYSE */}
            <GroupHeader
              title="Analyses & rapports"
              groupId="analyse"
              isOpen={openGroups.analyse}
              icon={BiStats}
            />
            <AnimatedGroup isOpen={openGroups.analyse}>
              <NavLink
                to="/admin/statistiques"
                className="nav-link"
                style={linkStyle}
              >
                <span>
                  <BiStats className="me-3" /> Statistiques
                </span>
              </NavLink>
              <NavLink
                to="/admin/rapport"
                className="nav-link"
                style={linkStyle}
              >
                <span>
                  <BiBarChart className="me-3" /> Rapports
                </span>
              </NavLink>
              <NavLink
                to="/admin/graphiques"
                className="nav-link"
                style={linkStyle}
              >
                <span>
                  <AiOutlinePieChart className="me-3" /> Graphiques
                </span>
              </NavLink>
            </AnimatedGroup>

            {/* PROFIL PERSO */}
            <div className="mt-4 pt-3 border-top">
              <NavLink
                to="/admin/profile"
                className="nav-link"
                style={linkStyle}
              >
                <div className="d-flex align-items-center">
                  <BiUserCircle size={20} className="me-3 text-secondary" />
                  <span className="text-secondary">Mon Profil</span>
                </div>
              </NavLink>
            </div>
            <div className="mt-4 pt-3 border-top">
              <NavLink
                to="/admin/message"
                className="nav-link"
                style={linkStyle}
              >
                <div className="d-flex align-items-center">
                  <BiUserCircle size={20} className="me-3 text-secondary" />
                  <span className="text-secondary">Messages</span>
                </div>
              </NavLink>
            </div>
          </ul>
        </div>

        {/* LOGOUT */}
        <div className="p-4 border-top bg-light">
          <button
            className="btn btn-outline-danger w-100 fw-bold d-flex align-items-center justify-content-center shadow-sm"
            style={{
              borderRadius: "12px",
              transition: "all 0.3s",
              padding: "10px",
            }}
            onClick={() => setShowModal(true)}
          >
            <BiLogOut className="me-2" size={20} /> Déconnexion
          </button>
        </div>
      </div>

      {/* MODALE DE CONFIRMATION */}
      {showModal && (
        <div
          className="modal fade show d-block"
          style={{
            backgroundColor: "rgba(15, 23, 42, 0.5)",
            backdropFilter: "blur(6px)",
            zIndex: 1100,
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div
              className="modal-content border-0 shadow-lg"
              style={{ borderRadius: "20px" }}
            >
              <div className="modal-body p-5 text-center">
                <div className="text-danger mb-4">
                  <div className="bg-danger bg-opacity-10 d-inline-block p-3 rounded-circle">
                    <BiLogOut size={40} />
                  </div>
                </div>
                <h4 className="fw-bold text-dark">Déconnexion</h4>
                <p className="text-muted">
                  Souhaitez-vous vraiment quitter votre session de gestion ?
                </p>
                <div className="d-flex gap-3 mt-4">
                  <button
                    className="btn btn-light w-100 fw-bold py-2"
                    onClick={() => setShowModal(false)}
                    style={{ borderRadius: "10px" }}
                  >
                    Rester
                  </button>
                  <button
                    className="btn btn-danger w-100 fw-bold py-2 shadow-sm"
                    onClick={handleLogout}
                    style={{ borderRadius: "10px" }}
                  >
                    Quitter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
