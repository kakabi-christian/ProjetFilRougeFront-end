import React from 'react';
import { Link, useLocation } from "react-router-dom";
import '../Styles/Header.css';
import logo from '../Assets/logo app.png';

const colorGreen = '#25963F';
const colorBlue = '#1E90FF';

export default function Header() {

  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="Container">

      {/* Header bleu */}
      <div className="Blue"></div>

      {/* NAVBAR BOOTSTRAP */}
      <nav className="navbar navbar-expand-lg bg-white shadow-sm">

        <div className="container">

          {/* Logo */}
          <div className="d-flex align-items-center gap-3">
            <img src={logo} alt="logo-app" className="logo-img" />
            <p className="fw-bold" style={{ color: colorGreen, fontSize: '18px', paddingTop: '13px' }}>ESTLC</p>
          </div>

          {/* Button Burger Mobile */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Links */}
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav mx-auto d-flex gap-3">

              {/* ACCUEIL */}
              <li className="nav-item">
                <Link
                  className={`nav-link fw-bold ${isActive("/") ? "active-link" : ""}`}
                  to="/"
                >
                  Accueil
                </Link>
              </li>

              {/* SITES */}
              <li className="nav-item">
                <Link
                  className={`nav-link fw-bold ${isActive("/Site") ? "active-link" : ""}`}
                  to="/Site"
                >
                  Nos sites
                </Link>
              </li>

              {/* ARCHIVES */}
              <li className="nav-item">
                <Link
                  className={`nav-link fw-bold ${isActive("/Archives") ? "active-link" : ""}`}
                  to="/Archives"
                >
                  Nos archives
                </Link>
              </li>

              {/* PAIEMENT */}
              <li className="nav-item">
                <Link
                  className={`nav-link fw-bold ${isActive("/Paiement") ? "active-link" : ""}`}
                  to="/Paiement"
                >
                  Paiement
                </Link>
              </li>
            </ul>

            {/* Login + Register avec background bleu + icônes */}
            <div className="d-flex gap-3">

              <Link
                className="btn fw-bold d-flex align-items-center gap-2"
                style={{
                  backgroundColor: colorBlue,
                  color: "white",
                  borderRadius: "8px",
                }}
                to="/Login"
              >
                <i className="fas fa-sign-in-alt"></i>
                Connexion
              </Link>

              <Link
                className="btn fw-bold d-flex align-items-center gap-2"
                style={{
                  backgroundColor: colorBlue,
                  color: "white",
                  borderRadius: "8px",
                }}
                to="/Register"
              >
                <i className="fas fa-user-plus"></i>
                Inscription
              </Link>

            </div>

          </div>
        </div>
      </nav>

    </div>
  );
}
