import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  BiBarChart,
  BiLogOut,
  BiStats,
  BiBuildings,
} from "react-icons/bi";
import { AiOutlinePieChart } from "react-icons/ai";
import {
  FaUserFriends,
  FaUser,
  FaUniversity,
  FaSchool,
  FaBook,
} from "react-icons/fa";
import { MdLocationCity } from "react-icons/md";

export default function Sidebar() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/Login");
  };

  const linkStyle = ({ isActive }) => ({
    textDecoration: "none",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    backgroundColor: isActive ? "#0d6efd" : "transparent",
    color: isActive ? "white" : "#495057",
  });

  return (
    <>
      <div
        className="sidebar bg-white border-end d-flex flex-column"
        style={{
          width: "260px",
          height: "100vh",
          position: "sticky",
          top: 0,
        }}
      >
        {/* Header */}
        <div className="sidebar-header p-4 border-bottom">
          <h3 className="text-primary fw-bold mb-0">
            Admin Panel
          </h3>
        </div>

        {/* Navigation (SCROLL ICI) */}
        <div
          className="flex-grow-1 px-3"
          style={{ overflowY: "auto" }}
        >
          <ul className="nav nav-pills flex-column py-3">
            <li className="nav-item mb-2">
              <NavLink to="/admin/statistiques" className="nav-link d-flex align-items-center p-3" style={linkStyle}>
                <BiStats size={22} className="me-3" />
                Statistiques
              </NavLink>
            </li>

            <li className="nav-item mb-2">
              <NavLink to="/admin/rapport" className="nav-link d-flex align-items-center p-3" style={linkStyle}>
                <BiBarChart size={22} className="me-3" />
                Rapports
              </NavLink>
            </li>

            <li className="nav-item mb-2">
              <NavLink to="/admin/graphiques" className="nav-link d-flex align-items-center p-3" style={linkStyle}>
                <AiOutlinePieChart size={22} className="me-3" />
                Graphiques
              </NavLink>
            </li>

            <li className="nav-item mb-2">
              <NavLink to="/admin/candidats" className="nav-link d-flex align-items-center p-3" style={linkStyle}>
                <FaUserFriends size={22} className="me-3" />
                Candidats
              </NavLink>
            </li>

            <li className="nav-item mb-2">
              <NavLink to="/admin/departements" className="nav-link d-flex align-items-center p-3" style={linkStyle}>
                <BiBuildings size={22} className="me-3" />
                Départements
              </NavLink>
            </li>

            <li className="nav-item mb-2">
              <NavLink to="/admin/profile" className="nav-link d-flex align-items-center p-3" style={linkStyle}>
                <FaUser size={22} className="me-3" />
                Profil
              </NavLink>
            </li>

            <li className="nav-item mb-2">
              <NavLink to="/admin/filieres" className="nav-link d-flex align-items-center p-3" style={linkStyle}>
                <FaBook size={22} className="me-3" />
                Filières
              </NavLink>
            </li>

            <li className="nav-item mb-2">
              <NavLink to="/admin/centre-depot" className="nav-link d-flex align-items-center p-3" style={linkStyle}>
                <FaUniversity size={22} className="me-3" />
                Centre de dépôt
              </NavLink>
            </li>

            <li className="nav-item mb-2">
              <NavLink to="/admin/centre-examen" className="nav-link d-flex align-items-center p-3" style={linkStyle}>
                <FaSchool size={22} className="me-3" />
                Centre d’examen
              </NavLink>
            </li>

            <li className="nav-item mb-2">
              <NavLink to="/admin/specialites" className="nav-link d-flex align-items-center p-3" style={linkStyle}>
                <MdLocationCity size={22} className="me-3" />
                Spécialités
              </NavLink>
            </li>
            <li className="nav-item mb-2">
              <NavLink to="/admin/concours" className="nav-link d-flex align-items-center p-3" style={linkStyle}>
                <MdLocationCity size={22} className="me-3" />
                Concours
              </NavLink>
            </li>
            <li className="nav-item mb-2">
              <NavLink to="/admin/annees" className="nav-link d-flex align-items-center p-3" style={linkStyle}>
                <MdLocationCity size={22} className="me-3" />
                Années
              </NavLink>
            </li>
            <li className="nav-item mb-2">
              <NavLink to="/admin/sessions" className="nav-link d-flex align-items-center p-3" style={linkStyle}>
                <MdLocationCity size={22} className="me-3" />
                Session
              </NavLink>
            </li>
          </ul>
        </div>

        {/* Déconnexion */}
        <div className="p-3 border-top">
          <button
            className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center"
            onClick={() => setShowModal(true)}
          >
            <BiLogOut size={20} className="me-2" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.6)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmation</h5>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body text-center">
                Voulez-vous vraiment vous déconnecter ?
              </div>
              <div className="modal-footer justify-content-center">
                <button className="btn btn-light" onClick={() => setShowModal(false)}>Annuler</button>
                <button className="btn btn-danger" onClick={handleLogout}>Oui</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
