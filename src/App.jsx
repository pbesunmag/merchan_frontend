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
  // 1. Asigna el logo de assets como favicon de la pestaña
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

  const getNavClass = ({ isActive }) =>
    isActive
      ? { color: '#00e5ff', borderBottom: '2px solid #00e5ff', textShadow: '0 0 10px #00e5ff' }
      : { color: '#94a3b8' };

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#090a0f' }}>
        <nav className="app-navbar" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.8rem 3rem',
          background: 'linear-gradient(90deg, #090d16 0%, #18181b 100%)',
          borderBottom: '2px solid #b91c1c',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)'
        }}>
          {/* 2. Logo integrado junto al nombre de la tienda */}
          <div className="app-navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img
              src={Logo}
              alt="Avengers Shop Logo"
              className="app-navbar-logo img-logo-tienda"
              style={{
                height: '118px',
                width: 'auto',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 8px rgba(0, 229, 255, 0.35))'
              }}
            />
            <span className="app-navbar-title" style={{ fontWeight: 900, letterSpacing: '0.15em', color: '#ffffff', textTransform: 'uppercase', fontSize: '1.25rem' }}>
              AVENGERS <span style={{ color: '#00e5ff' }}>SHOP</span>
            </span>
          </div>

          <div className="app-navbar-links" style={{ display: 'flex', gap: '2rem' }}>
            <NavLink to="/terminal" style={({ isActive }) => ({
              ...getNavClass({ isActive }),
              textDecoration: 'none',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              paddingBottom: '0.3rem'
            })}>
              Terminal
            </NavLink>
            <NavLink to="/preparacion" style={({ isActive }) => ({
              ...getNavClass({ isActive }),
              textDecoration: 'none',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              paddingBottom: '0.3rem'
            })}>
              Preparación
            </NavLink>
            <NavLink to="/pantalla" style={({ isActive }) => ({
              ...getNavClass({ isActive }),
              textDecoration: 'none',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              paddingBottom: '0.3rem'
            })}>
              Pantalla Recogida
            </NavLink>
          </div>
        </nav>

        <main style={{ flex: 1, background: '#090a0f' }}>
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
