import { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import VistaPreparacion from './components/pages/VistaPreparacion/VistaPreparacion';
import VistaTerminal from './components/pages/VistaTerminal/VistaTerminal';
import PantallaRecogida from './components/pages/PantallaRecogida/PantallaRecogida';
import VistaSorteos from './components/pages/VistaSorteos/VistaSorteos';
import Footer from './components/Footer/Footer';
import BotonScrollTop from './components/BotonScrollTop/BotonScrollTop';
import Logo from './assets/logo_tienda.png';

export default function App() {
  useEffect(() => {
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = Logo;
  }, []);

  return (
    <BrowserRouter>
      <div className="app-main-wrapper">
        <nav className="app-navbar">
          <div className="app-navbar-brand">
            <img
              src={Logo}
              alt="Avengers Shop Logo"
              className="app-navbar-logo img-logo-tienda"
            />
            <span className="app-navbar-title">
              AVENGERS <span className="app-title-highlight">SHOP</span>
            </span>
          </div>

          <div className="app-navbar-links">
            <NavLink to="/terminal" className={({ isActive }) => `app-nav-link ${isActive ? 'activo' : ''}`}>
              Terminal
            </NavLink>
            <NavLink to="/preparacion" className={({ isActive }) => `app-nav-link ${isActive ? 'activo' : ''}`}>
              Preparación
            </NavLink>
            <NavLink to="/pantalla" className={({ isActive }) => `app-nav-link ${isActive ? 'activo' : ''}`}>
              Pantalla Recogida
            </NavLink>
          </div>
        </nav>

        <main className="app-content-container">
          <Routes>
            <Route path="/" element={<Navigate to="/terminal" replace />} />
            <Route path="/terminal" element={<VistaTerminal />} />
            <Route path="/preparacion" element={<VistaPreparacion />} />
            <Route path="/pantalla" element={<PantallaRecogida />} />
            <Route path="/sorteos" element={<VistaSorteos />} />
          </Routes>
        </main>

        <Footer />
        <BotonScrollTop />
      </div>
    </BrowserRouter>
  );
}