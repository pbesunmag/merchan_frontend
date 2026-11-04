import { Link } from 'react-router-dom';
import './NotFoundStark.css';

export default function NotFoundStark() {
  return (
    <section className="notfound-stark-wrapper">
      <div className="notfound-stark-hud-card">
        <span className="notfound-stark-badge">
          ⚠️ STARK TELEMETRY // ERROR DE COORDENADAS
        </span>
        <h1 className="notfound-stark-code">404</h1>
        <h2 className="notfound-stark-title">SECTOR NO LOCALIZADO EN LA RED STARK</h2>
        <p className="notfound-stark-desc">
          J.A.R.V.I.S. no ha encontrado suministros ni módulos operativos en la ruta solicitada.
          Verifica la dirección o regresa a la terminal central.
        </p>
        <Link to="/terminal" className="notfound-stark-btn">
          ⚡ Retornar a la Terminal (/terminal)
        </Link>
      </div>
    </section>
  );
}
