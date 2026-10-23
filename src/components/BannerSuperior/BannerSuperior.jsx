import "./BannerSuperior.css";

export default function BannerSuperior() {
  return (
    <div className="banner-promos-grid">
      {/* CAJA 1: PROMO APERTURA (CIAN) */}
      <div className="banner-promo-box box-apertura">
        <span className="banner-promo-icono">⚡</span>
        <p className="banner-promo-texto">
          <strong>PROMO APERTURA:</strong> Grabado láser personalizado por solo{" "}
          <span className="precio-resaltado">3,00 €</span>{" "}
          <span className="precio-anterior">(antes 5,00 €)</span> en productos
          seleccionados.
        </p>
      </div>

      {/* CAJA 2: CUPÓN GUARDIANES (ÁMBAR) */}
      <div className="banner-promo-box box-groot">
        <img
        src="/imagenes/icono_groot.png"
        alt="Icono Groot"
        className="banner-promo-icono-img"
        />
        <p className="banner-promo-texto">
          <strong>OFERTA GUARDIANES:</strong> 5% de descuento en tu comanda
          utilizando el cupón <span className="badge-cupon-groot">GROOT5</span>.
        </p>
      </div>
    </div>
  );
}