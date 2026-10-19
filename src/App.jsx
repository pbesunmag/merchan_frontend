import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import VistaPreparacion from './components/pages/VistaPreparacion/VistaPreparacion';
import VistaTerminal from './components/pages/VistaTerminal/VistaTerminal';
import PantallaRecogida from './components/pages/PantallaRecogida/PantallaRecogida';

export default function App() {
  const getNavClass = ({ isActive }) =>
    isActive
      ? { color: '#00e5ff', borderBottom: '2px solid #00e5ff', textShadow: '0 0 10px #00e5ff' }
      : { color: '#94a3b8' };

  return (
    <BrowserRouter>
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 3rem',
        background: 'linear-gradient(90deg, #090d16 0%, #18181b 100%)',
        borderBottom: '2px solid #b91c1c',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ fontSize: '1.6rem', color: '#dc2626' }}>✪</span>
          <span style={{ fontWeight: 900, letterSpacing: '0.15em', color: '#ffffff', textTransform: 'uppercase' }}>
            AVENGERS <span style={{ color: '#00e5ff' }}>SHOP</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '2rem' }}>
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

      <main style={{ minHeight: 'calc(100vh - 70px)', background: '#090a0f' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/terminal" replace />} />
          <Route path="/terminal" element={<VistaTerminal />} />
          <Route path="/preparacion" element={<VistaPreparacion />} />
          <Route path="/pantalla" element={<PantallaRecogida />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}