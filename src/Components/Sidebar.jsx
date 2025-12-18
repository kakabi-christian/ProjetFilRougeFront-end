// src/Components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { BiBarChart } from 'react-icons/bi'; // Icône pour statistiques
import { AiOutlinePieChart } from 'react-icons/ai'; // Icône pour graphiques

export default function Sidebar() {
  return (
    <div className="sidebar bg-light border-end" style={{ width: '250px', minHeight: '100vh' }}>
      <div className="sidebar-header p-3">
        <h3 className="text-primary">Dashboard</h3>
      </div>

      <ul className="list-unstyled ps-0">
        {/* Onglet Statistiques */}
        <li className="mb-1">
          <NavLink
            to="/admin/statistiques"
            className={({ isActive }) =>
              `d-flex align-items-center p-3 text-decoration-none ${isActive ? 'bg-primary text-white' : 'text-dark'}`
            }
          >
            <BiBarChart size={24} className="me-2" />
            Statistiques
          </NavLink>
        </li>
        <li className="mb-1">
          <NavLink
            to="/admin/rapport"
            className={({ isActive }) =>
              `d-flex align-items-center p-3 text-decoration-none ${isActive ? 'bg-primary text-white' : 'text-dark'}`
            }
          >
            <BiBarChart size={24} className="me-2" />
            Rapport 
          </NavLink>
        </li>

        {/* Onglet Graphiques */}
        <li className="mb-1">
          <NavLink
            to="/admin/graphiques"
            className={({ isActive }) =>
              `d-flex align-items-center p-3 text-decoration-none ${isActive ? 'bg-primary text-white' : 'text-dark'}`
            }
          >
            <AiOutlinePieChart size={24} className="me-2" />
            Graphiques
          </NavLink>
        </li>

        {/* Tu pourras ajouter d'autres onglets ici */}
      </ul>
    </div>
  );
}
