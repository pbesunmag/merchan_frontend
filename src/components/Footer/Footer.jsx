import { useState } from 'react';
import { Link } from 'react-router-dom';
import ModalInformacion from '../ModalInformacion/ModalInformacion';
import './Footer.css';

export default function Footer() {
  const [seccionActiva, setSeccionActiva] = useState(null);

  const abrirModal = (e, id) => {
    e.preventDefault();
    setSeccionActiva(id);
  };

  return (
    <>
      <footer className="footer-stark">
        <div className="footer-contenedor">
          {/* COLUMNA 1: INFORMACIÓN */}
          <div className="footer-columna">
            <h4 className="footer-titulo">INFORMACIÓN</h4>
            <ul className="footer-lista">
              <li>
                <a href="#envios" onClick={(e) => abrirModal(e, 'envios')}>
                  <span className="chevron">‹</span> Nuestros Envíos Stark
                </a>
              </li>
              <li>
                <a href="#cambios" onClick={(e) => abrirModal(e, 'cambios')}>
                  <span className="chevron">‹</span> Cambios y Devoluciones
                </a>
              </li>
              <li>
                <a href="#regalos" onClick={(e) => abrirModal(e, 'regalos')}>
                  <span className="chevron">‹</span> Regalos Frikis & Promociones
                </a>
              </li>
              <li>
                <a href="#afiliacion" onClick={(e) => abrirModal(e, 'afiliacion')}>
                  <span className="chevron">‹</span> Programa de Afiliación
                </a>
              </li>
              <li>
                <Link
                  to="/sorteos"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <span className="chevron">‹</span> Ganadores de Sorteos
                </Link>
              </li>
              <li>
                <a href="#aviso-legal" onClick={(e) => abrirModal(e, 'aviso-legal')}>
                  <span className="chevron">‹</span> Aviso Legal
                </a>
              </li>
              <li>
                <a href="#condiciones" onClick={(e) => abrirModal(e, 'condiciones')}>
                  <span className="chevron">‹</span> Condiciones de Compra
                </a>
              </li>
              <li>
                <a href="#privacidad" onClick={(e) => abrirModal(e, 'privacidad')}>
                  <span className="chevron">‹</span> Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#cookies" onClick={(e) => abrirModal(e, 'cookies')}>
                  <span className="chevron">‹</span> Política de Cookies
                </a>
              </li>
              <li>
                <a href="#sobre-nosotros" onClick={(e) => abrirModal(e, 'sobre-nosotros')}>
                  <span className="chevron">‹</span> Sobre Avengers Shop
                </a>
              </li>
              <li>
                <a href="#config-cookies" onClick={(e) => abrirModal(e, 'config-cookies')}>
                  <span className="chevron">‹</span> Configuración de Cookies
                </a>
              </li>
            </ul>
          </div>

          {/* COLUMNA 2: INFORMACIÓN DE LA TIENDA (DIRECCIÓN FICTICIA MARVEL) */}
          <div className="footer-columna footer-tienda-col">
            <h4 className="footer-titulo">INFORMACIÓN DE LA TIENDA</h4>
            <div className="tienda-dato">
              <span className="tienda-icono">📍</span>
              <div className="tienda-texto">
                <strong>Torre Stark • Complejo Vengadores</strong>
                <p>Av. Tony Stark, 10880 (Sector Malibú)</p>
                <p>08242 Manresa, Barcelona • España</p>
              </div>
            </div>

            <div className="tienda-dato">
              <span className="tienda-icono">📞</span>
              <div className="tienda-texto">
                <a href="tel:+349387003000" className="tienda-link-contacto">+34 938 700 3000</a>
                <span className="tienda-subtexto">Línea directa J.A.R.V.I.S. (L-V 9:00 - 19:00)</span>
              </div>
            </div>

            <div className="tienda-dato">
              <span className="tienda-icono">✉️</span>
              <div className="tienda-texto">
                <a href="/terminal#soporte" className="tienda-link-contacto">Escríbenos</a>
                <span className="tienda-subtexto">Formulario directo en la web</span>
              </div>
            </div>
          </div>
        </div>

        {/* BARRA INFERIOR / COPYRIGHT */}
        <div className="footer-bottom">
          <div className="footer-bottom-contenido">
            <p>© 2026 Avengers Shop • Merchandising Oficial Stark Industries</p>
            <div className="footer-pasarelas">
              <span className="badge-pago">seQura</span>
              <span className="badge-pago">STARK-PAY</span>
              <span className="badge-pago">VISA</span>
              <span className="badge-pago">MASTERCARD</span>
            </div>
          </div>
        </div>
      </footer>

      <ModalInformacion
        seccionId={seccionActiva}
        alCerrar={() => setSeccionActiva(null)}
      />
    </>
  );
}
