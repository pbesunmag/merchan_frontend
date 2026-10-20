import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer-stark">
      <div className="footer-contenedor">
        {/* COLUMNA 1: INFORMACIÓN */}
        <div className="footer-columna">
          <h4 className="footer-titulo">INFORMACIÓN</h4>
          <ul className="footer-lista">
            <li><a href="#envios"><span className="chevron">‹</span> Nuestros Envíos Stark</a></li>
            <li><a href="#cambios"><span className="chevron">‹</span> Cambios y Devoluciones</a></li>
            <li><a href="#regalos"><span className="chevron">‹</span> Regalos Frikis & Promociones</a></li>
            <li><a href="#afiliacion"><span className="chevron">‹</span> Programa de Afiliación</a></li>
            <li><a href="#sorteos"><span className="chevron">‹</span> Ganadores de Sorteos</a></li>
            <li><a href="#aviso-legal"><span className="chevron">‹</span> Aviso Legal</a></li>
            <li><a href="#condiciones"><span className="chevron">‹</span> Condiciones de Compra</a></li>
            <li><a href="#privacidad"><span className="chevron">‹</span> Política de Privacidad</a></li>
            <li><a href="#cookies"><span className="chevron">‹</span> Política de Cookies</a></li>
            <li><a href="#sobre-nosotros"><span className="chevron">‹</span> Sobre Avengers Shop</a></li>
            <li><a href="#blog"><span className="chevron">‹</span> Blog Stark</a></li>
            <li><a href="#mapa"><span className="chevron">‹</span> Mapa del Sitio</a></li>
            <li><a href="#config-cookies"><span className="chevron">‹</span> Configuración de Cookies</a></li>
          </ul>
        </div>

        {/* COLUMNA 2: MI CUENTA */}
        <div className="footer-columna">
          <h4 className="footer-titulo">MI CUENTA</h4>
          <ul className="footer-lista">
            <li><a href="#compras"><span className="chevron">‹</span> Mis compras</a></li>
            <li><a href="#devoluciones"><span className="chevron">‹</span> Mis devoluciones</a></li>
            <li><a href="#facturas"><span className="chevron">‹</span> Mis facturas de devolución</a></li>
            <li><a href="#direcciones"><span className="chevron">‹</span> Mis direcciones</a></li>
            <li><a href="#datos"><span className="chevron">‹</span> Mis datos personales</a></li>
            <li><a href="#cupones"><span className="chevron">‹</span> Mis cupones descuento</a></li>
          </ul>
        </div>

        {/* COLUMNA 3: INFORMACIÓN DE LA TIENDA (DIRECCIÓN FICTICIA MARVEL) */}
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
              <a href="mailto:soporte@avengersshop.stark" className="tienda-link-contacto">Escríbenos</a>
              <span className="tienda-subtexto">soporte@avengersshop.stark</span>
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
  );
}