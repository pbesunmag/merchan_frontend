import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VistaSorteos.css';

export default function VistaSorteos() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const volverATerminal = () => {
    navigate('/terminal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="sorteos-stark-layout">
      <div className="sorteos-hud-box">
        <div className="sorteos-badge">SISTEMA J.A.R.V.I.S. • EVENTOS STARK</div>
        <div className="sorteos-icono-radar">🛰️</div>
        <h1 className="sorteos-titulo">SORTEOS Y RECOMPENSAS</h1>
        <p className="sorteos-mensaje-principal">
          Actualmente no hay sorteos activos en la red Stark.
        </p>
        <p className="sorteos-subtexto">
          Permanece atento a las frecuencias oficiales para próximas misiones comunitarias y recompensas exclusivas.
        </p>
        <button
          type="button"
          className="btn-volver-terminal"
          onClick={volverATerminal}
        >
          ← Volver a la Terminal
        </button>
      </div>
    </div>
  );
}
