import { useState, useEffect } from "react";
import "./BannerSuperior.css";
import { cuponService } from "../../services/cuponService";

export default function BannerSuperior({ cupon: cuponProp }) {
  const [cuponApi, setCuponApi] = useState(null);

  // Consulta exclusivamente el cupón destacado vigente al montar el componente si no se pasa por prop
  useEffect(() => {
    if (cuponProp !== undefined) return;

    let montado = true;
    const cargarCupon = async () => {
      try {
        const data = await cuponService.obtenerCuponDestacado();
        if (montado) {
          setCuponApi(data || null);
        }
      } catch {
        if (montado) {
          setCuponApi(null);
        }
      }
    };

    cargarCupon();

    return () => {
      montado = false;
    };
  }, [cuponProp]);

  const cupon = cuponProp !== undefined ? cuponProp : cuponApi;
  const tieneCuponActivo = Boolean(
    cupon &&
      cupon.activo !== false &&
      cupon.codigo
  );

  return (
    <div className="banner-promos-grid">
      {/* CAJA 1: SERVICIO STARK (CIAN) */}
      <div className="banner-promo-box box-apertura">
        <span className="banner-promo-icono">⚡</span>
        <p className="banner-promo-texto">
          <strong>SERVICIO STARK:</strong> Grabado láser personalizado{" "}
          <span className="precio-resaltado">incluido sin sobrecoste</span> en
          todos los productos personalizables del catálogo.
        </p>
      </div>

      {/* CAJA 2: CUPÓN DESTACADO O RECOGIDA EN MOSTRADOR (ÁMBAR CON GROOT) */}
      <div className="banner-promo-box box-groot">
        <img
          src="/imagenes/icono_groot.png"
          alt="Icono Groot"
          className="banner-promo-icono-img"
        />
        {tieneCuponActivo ? (
          <p className="banner-promo-texto">
            <strong>CUPÓN ACTIVO:</strong> Introduce el código{" "}
            <span className="badge-cupon-groot">{cupon.codigo}</span> en tu
            carrito para obtener un -{cupon.porcentajeDescuento}% de descuento.
          </p>
        ) : (
          <p className="banner-promo-texto">
            <strong>ENTREGA EN TIENDA:</strong> Sigue el estado de tu código{" "}
            <span className="badge-cupon-groot">AV-XXXX</span> en tiempo real en
            la Pantalla de Recogida.
          </p>
        )}
      </div>
    </div>
  );
}
