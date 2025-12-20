import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BiBarChart, BiLogOut, BiStats, BiBuildings, BiCalendar,
  BiLayer, BiArchive, BiTask, BiChevronDown
} from "react-icons/bi";
import { AiOutlinePieChart, AiOutlineDashboard } from "react-icons/ai";
import {
  FaUserFriends, FaUniversity, FaSchool, FaBook, FaListUl, FaUser
} from "react-icons/fa";
import { MdOutlineClass, MdHistoryEdu } from "react-icons/md";

export default function Sidebar() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const [openGroups, setOpenGroups] = useState({
    gestion: true,
    structure: false,
    organisation: false,
    cadre: false,
    analyse: false
  });

  const toggleGroup = (group) => {
    setOpenGroups(prev => ({ ...prev, [group]: !prev[group] }));
  };

  const handleLogout = () => {
    setShowModal(false);
    navigate("/Login");
  };

  const linkStyle = ({ isActive }) => ({
    textDecoration: "none",
    borderRadius: "10px",
    margin: "4px 0",
    padding: "10px 15px",
    display: "flex",
    alignItems: "center",
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
        transition: "background 0.3s ease"
      }}
    >
      <div className="d-flex align-items-center">
        <div className="bg-white p-1 rounded me-2 shadow-sm">
          <Icon size={16} className="text-primary" />
        </div>
        <span className="text-uppercase fw-bold" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
          {title}
        </span>
      </div>
      <BiChevronDown
        size={18}
        style={{
          transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)",
          transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
        }}
      />
    </div>
  );

  const AnimatedGroup = ({ isOpen, children }) => (
    <div
      style={{
        display: "grid",
        gridTemplateRows: isOpen ? "1fr" : "0fr",
        transition: "grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease",
        opacity: isOpen ? 1 : 0,
        overflow: "hidden"
      }}
    >
      <div style={{ minHeight: 0 }}>
        <div className="ps-2 pt-1 pb-2">
          {children}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="sidebar bg-white border-end d-flex flex-column shadow-sm"
           style={{ width: "270px", height: "100vh", position: "sticky", top: 0 }}>

        {/* Logo */}
        <div className="p-4">
          <div className="bg-primary text-white p-3 rounded-4 d-flex align-items-center shadow-lg">
            <AiOutlineDashboard size={24} className="me-2" />
            <h4 className="fw-bold mb-0" style={{ fontSize: "1.2rem" }}>E-Concours</h4>
          </div>
        </div>

        <div className="flex-grow-1 px-3" style={{ overflowY: "auto", scrollbarWidth: "none" }}>
          <ul className="nav flex-column">
            
           

            {/* GESTION */}
            <GroupHeader title="Gestion des concours" groupId="gestion" isOpen={openGroups.gestion} icon={BiTask} />
            <AnimatedGroup isOpen={openGroups.gestion}>
              <NavLink to="/admin/candidats" className="nav-link" style={linkStyle}><FaUserFriends className="me-3" /> Candidats</NavLink>
              <NavLink to="/admin/concours" className="nav-link" style={linkStyle}><BiTask className="me-3" /> Concours</NavLink>
              <NavLink to="/admin/archive" className="nav-link" style={linkStyle}><BiArchive className="me-3" /> Archives</NavLink>
            </AnimatedGroup>

            {/* STRUCTURE */}
            <GroupHeader title="Structure académique" groupId="structure" isOpen={openGroups.structure} icon={BiBuildings} />
            <AnimatedGroup isOpen={openGroups.structure}>
              <NavLink to="/admin/departements" className="nav-link" style={linkStyle}><BiBuildings className="me-3" /> Départements</NavLink>
              <NavLink to="/admin/filieres" className="nav-link" style={linkStyle}><FaBook className="me-3" /> Filières</NavLink>
              <NavLink to="/admin/specialites" className="nav-link" style={linkStyle}><FaListUl className="me-3" /> Spécialités</NavLink>
            </AnimatedGroup>

            {/* CENTRES */}
            <GroupHeader title="Centres & sites" groupId="organisation" isOpen={openGroups.organisation} icon={FaUniversity} />
            <AnimatedGroup isOpen={openGroups.organisation}>
              <NavLink to="/admin/centre-depot" className="nav-link" style={linkStyle}><FaUniversity className="me-3" /> Centres de dépôt</NavLink>
              <NavLink to="/admin/centre-examen" className="nav-link" style={linkStyle}><FaSchool className="me-3" /> Centres d’examen</NavLink>
            </AnimatedGroup>

            {/* CADRE */}
            <GroupHeader title="Cadre académique" groupId="cadre" isOpen={openGroups.cadre} icon={BiCalendar} />
            <AnimatedGroup isOpen={openGroups.cadre}>
              <NavLink to="/admin/annees" className="nav-link" style={linkStyle}><BiCalendar className="me-3" /> Années</NavLink>
              <NavLink to="/admin/sessions" className="nav-link" style={linkStyle}><MdHistoryEdu className="me-3" /> Sessions</NavLink>
              <NavLink to="/admin/epreuves" className="nav-link" style={linkStyle}><MdOutlineClass className="me-3" /> Épreuves</NavLink>
              <NavLink to="/admin/niveaux" className="nav-link" style={linkStyle}><BiLayer className="me-3" /> Niveaux</NavLink>
            </AnimatedGroup>

            {/* ANALYSE */}
            <GroupHeader title="Analyses & rapports" groupId="analyse" isOpen={openGroups.analyse} icon={BiStats} />
            <AnimatedGroup isOpen={openGroups.analyse}>
              <NavLink to="/admin/statistiques" className="nav-link" style={linkStyle}><BiStats className="me-3" /> Statistiques</NavLink>
              <NavLink to="/admin/rapport" className="nav-link" style={linkStyle}><BiBarChart className="me-3" /> Rapports</NavLink>
              <NavLink to="/admin/graphiques" className="nav-link" style={linkStyle}><AiOutlinePieChart className="me-3" /> Graphiques</NavLink>
            </AnimatedGroup>
             {/* PROFIL (Ajouté ici) */}
            <li className="nav-item mb-2">
              <NavLink to="/admin/profile" className="nav-link" style={linkStyle}>
                <FaUser size={18} className="me-3" /> Mon Profil
              </NavLink>
            </li>

          </ul>
        </div>

        {/* LOGOUT */}
        <div className="p-4 border-top">
          <button className="btn btn-outline-danger w-100 fw-bold d-flex align-items-center justify-content-center shadow-sm" 
                  style={{ borderRadius: "10px", transition: "all 0.3s", padding: "10px" }}
                  onClick={() => setShowModal(true)}>
            <BiLogOut className="me-2" size={20} /> Déconnexion
          </button>
        </div>
      </div>

      {/* MODALE DE CONFIRMATION (Simple intégration Bootstrap) */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: "15px" }}>
              <div className="modal-body p-4 text-center">
                <div className="text-danger mb-3">
                  <BiLogOut size={50} />
                </div>
                <h5 className="fw-bold">Confirmation</h5>
                <p className="text-muted">Êtes-vous sûr de vouloir vous déconnecter ?</p>
                <div className="d-flex gap-2 mt-4">
                  <button className="btn btn-light w-100 fw-bold" onClick={() => setShowModal(false)} style={{ borderRadius: "10px" }}>Annuler</button>
                  <button className="btn btn-danger w-100 fw-bold" onClick={handleLogout} style={{ borderRadius: "10px" }}>Déconnexion</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}