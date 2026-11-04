import "./BannerSuperior.css";

export default function BannerSuperior() {
  return (
    <div className="banner-promos-grid">
      {/* CAJA 1: GRABADO LÁSER INCLUIDO (CIAN) */}
      <div className="banner-promo-box box-apertura">
        <span className="banner-promo-icono">⚡</span>
        <p className="banner-promo-texto">
          <strong>SERVICIO STARK:</strong> Grabado láser personalizado{" "}
          <span className="precio-resaltado">incluido sin sobrecoste</span> en
          todos los productos personalizables del catálogo.
        </p>
      </div>

      {/* CAJA 2: RECOGIDA EN MOSTRADOR (ÁMBAR) */}
      <div className="banner-promo-box box-groot">
        <img
          src="/imagenes/icono_groot.png"
          alt="Icono Groot"
          className="banner-promo-icono-img"
        />
        <p className="banner-promo-texto">
          <strong>ENTREGA EN TIENDA:</strong> Sigue el estado de tu código{" "}
          <span className="badge-cupon-groot">AV-XXXX</span> en tiempo real en
          la Pantalla de Recogida.
        </p>
      </div>
    </div>
  );
}
