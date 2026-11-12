import { useState, useEffect } from "react";
import { productService } from "../../services/productService";
import { cuponService } from "../../services/cuponService";
import { promocionService } from "../../services/promocionService";
import { formatearMoneda } from "../../utils/formatoUtils";
import "./PanelDescuentos.css";

export default function PanelDescuentos({ alCerrar, alNotificar }) {
  const [pestana, setPestana] = useState("PRODUCTOS");
  const [productos, setProductos] = useState([]);
  const [cupones, setCupones] = useState([]);
  const [promociones, setPromociones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Estado para edición de descuento por producto
  const [busquedaProd, setBusquedaProd] = useState("");
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState("");
  const [porcentajeProducto, setPorcentajeProducto] = useState(15);
  const [activoFijoProducto, setActivoFijoProducto] = useState(true);
  const [guardandoProd, setGuardandoProd] = useState(false);

  // Estado para creación rápida de cupón
  const [nuevoCodigoCupon, setNuevoCodigoCupon] = useState("");
  const [nuevoPorcentajeCupon, setNuevoPorcentajeCupon] = useState(15);
  const [creandoCupon, setCreandoCupon] = useState(false);

  useEffect(() => {
    let montado = true;
    Promise.all([
      productService.obtenerProductos().catch(() => []),
      cuponService.listarCupones().catch(() => []),
      promocionService.listarTodas().catch(() => []),
    ])
      .then(([prodData, cupData, promoData]) => {
        if (!montado) return;
        const listaProds = Array.isArray(prodData?.content)
          ? prodData.content
          : Array.isArray(prodData)
            ? prodData
            : [];
        setProductos(listaProds);
        setCupones(Array.isArray(cupData) ? cupData : []);
        setPromociones(Array.isArray(promoData) ? promoData : []);
        setCargando(false);
      })
      .catch((err) => {
        if (montado) {
          setError(err.message);
          setCargando(false);
        }
      });

    return () => {
      montado = false;
    };
  }, []);

  const seleccionarProducto = (prod) => {
    if (!prod) return;
    setProductoSeleccionadoId(String(prod.id));
    setPorcentajeProducto(Number(prod.porcentajeDescuento) || 15);
    setActivoFijoProducto(
      prod.tieneDescuentoFijo !== undefined ? Boolean(prod.tieneDescuentoFijo) : true,
    );
  };

  const guardarDescuentoProducto = async (e) => {
    e.preventDefault();
    if (!productoSeleccionadoId) {
      setError("Selecciona un artículo del catálogo.");
      return;
    }

    try {
      setGuardandoProd(true);
      setError(null);
      const pct = activoFijoProducto ? Number(porcentajeProducto) || 0 : 0;
      const actualizado = await productService.actualizarDescuento(
        Number(productoSeleccionadoId),
        pct,
        activoFijoProducto && pct > 0,
      );
      setProductos((prev) =>
        prev.map((p) => (p.id === actualizado.id ? actualizado : p)),
      );
      if (alNotificar) {
        alNotificar(
          `🏷️ Descuento actualizado para ${actualizado.nombre}: ${actualizado.tieneDescuentoFijo ? `-${actualizado.porcentajeDescuento}% OFF` : "Sin descuento"}`,
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardandoProd(false);
    }
  };

  const quitarDescuentoDirecto = async (prod) => {
    try {
      setError(null);
      const actualizado = await productService.actualizarDescuento(
        prod.id,
        0,
        false,
      );
      setProductos((prev) =>
        prev.map((p) => (p.id === actualizado.id ? actualizado : p)),
      );
      if (alNotificar) {
        alNotificar(`🏷️ Descuento retirado de ${actualizado.nombre}`);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const crearNuevoCupon = async (e) => {
    e.preventDefault();
    const codigo = nuevoCodigoCupon.trim().toUpperCase();
    if (!codigo) {
      setError("Introduce un código para el cupón.");
      return;
    }

    try {
      setCreandoCupon(true);
      setError(null);
      const creado = await cuponService.crearCupon({
        codigo,
        porcentajeDescuento: Number(nuevoPorcentajeCupon) || 10,
        activo: true,
      });
      setCupones((prev) => [creado, ...prev]);
      setNuevoCodigoCupon("");
      if (alNotificar) {
        alNotificar(
          `🎟️ Cupón ${creado.codigo} (-${creado.porcentajeDescuento}%) creado`,
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCreandoCupon(false);
    }
  };

  const alternarEstadoCupon = async (cupon) => {
    try {
      setError(null);
      const actualizado = await cuponService.toggleActivo(cupon.id);
      setCupones((prev) =>
        prev.map((c) => (c.id === actualizado.id ? actualizado : c)),
      );
      if (alNotificar) {
        alNotificar(
          `🎟️ Cupón ${actualizado.codigo} ${actualizado.activo ? "activado" : "desactivado"}`,
        );
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const alternarEstadoPromocion = async (promo) => {
    try {
      setError(null);
      await promocionService.toggleActivo(promo.id);
      setPromociones((prev) =>
        prev.map((p) => (p.id === promo.id ? { ...p, activo: !p.activo } : p)),
      );
      if (alNotificar) {
        alNotificar(
          `🎉 Campaña ${promo.codigo} ${!promo.activo ? "activada" : "desactivada"}`,
        );
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const productosFiltrados = productos.filter((p) => {
    const q = busquedaProd.trim().toLowerCase();
    if (!q) return true;
    return (
      String(p.nombre || "")
        .toLowerCase()
        .includes(q) ||
      String(p.personaje || "")
        .toLowerCase()
        .includes(q) ||
      String(p.nombreCategoria || "")
        .toLowerCase()
        .includes(q)
    );
  });

  return (
    <div className="descuentos-overlay" onClick={alCerrar}>
      <div
        className="descuentos-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="descuentos-header">
          <h3>🏷️ Control de Descuentos y Promociones</h3>
          <button
            type="button"
            className="descuentos-cerrar"
            onClick={alCerrar}
            title="Cerrar panel"
          >
            ✕
          </button>
        </div>

        <div className="descuentos-tabs">
          <button
            type="button"
            className={`descuentos-tab ${pestana === "PRODUCTOS" ? "activo" : ""}`}
            onClick={() => setPestana("PRODUCTOS")}
          >
            📦 Descuentos por Producto
          </button>
          <button
            type="button"
            className={`descuentos-tab ${pestana === "CUPONES" ? "activo" : ""}`}
            onClick={() => setPestana("CUPONES")}
          >
            🎟️ Gestor de Cupones ({cupones.length})
          </button>
          <button
            type="button"
            className={`descuentos-tab ${pestana === "CAMPANAS" ? "activo" : ""}`}
            onClick={() => setPestana("CAMPANAS")}
          >
            🎉 Campañas Estacionales ({promociones.length})
          </button>
        </div>

        {error && <div className="descuentos-error">⚠️ {error}</div>}

        {cargando ? (
          <p className="descuentos-cargando">
            Sincronizando datos con Stark Industries...
          </p>
        ) : pestana === "PRODUCTOS" ? (
          <div className="descuentos-seccion">
            <form
              className="descuentos-form-inline"
              onSubmit={guardarDescuentoProducto}
            >
              <div className="descuentos-campo">
                <label>Artículo del catálogo</label>
                <select
                  value={productoSeleccionadoId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setProductoSeleccionadoId(id);
                    const encontrado = productos.find(
                      (p) => String(p.id) === id,
                    );
                    if (encontrado) seleccionarProducto(encontrado);
                  }}
                  className="descuentos-select"
                >
                  <option value="">-- Seleccionar producto --</option>
                  {productos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({formatearMoneda(p.precio)})
                      {p.tieneDescuentoFijo
                        ? ` [-${p.porcentajeDescuento}%]`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="descuentos-campo descuentos-campo-corto">
                <label>% Descuento</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={porcentajeProducto}
                  onChange={(e) => setPorcentajeProducto(e.target.value)}
                  className="descuentos-input"
                />
              </div>

              <label className="descuentos-check">
                <input
                  type="checkbox"
                  checked={activoFijoProducto}
                  onChange={(e) => setActivoFijoProducto(e.target.checked)}
                />
                <span>Descuento fijo activo</span>
              </label>

              <button
                type="submit"
                className="btn-descuentos-guardar"
                disabled={guardandoProd}
              >
                {guardandoProd ? "Guardando..." : "💾 Guardar Descuento"}
              </button>
            </form>

            <input
              type="text"
              placeholder="🔍 Filtrar productos por nombre o personaje (ej. Groot, Thor)..."
              value={busquedaProd}
              onChange={(e) => setBusquedaProd(e.target.value)}
              className="descuentos-buscador"
            />

            <div className="descuentos-lista-productos">
              {productosFiltrados.map((prod) => {
                const tieneFijo =
                  prod.tieneDescuentoFijo &&
                  Number(prod.porcentajeDescuento) > 0;
                const precioBase = Number(prod.precio) || 0;
                const precioNeto = tieneFijo
                  ? (precioBase * (100 - Number(prod.porcentajeDescuento))) /
                    100
                  : precioBase;

                return (
                  <div
                    key={prod.id}
                    className={`descuentos-item-row ${tieneFijo ? "con-descuento" : ""}`}
                  >
                    <div className="descuentos-item-info">
                      <strong>{prod.nombre}</strong>
                      <span className="descuentos-item-meta">
                        Base: {formatearMoneda(precioBase)}
                        {tieneFijo && (
                          <>
                            {" "}
                            →{" "}
                            <strong className="texto-precio-bonificado">
                              {formatearMoneda(precioNeto)} (-
                              {prod.porcentajeDescuento}% OFF)
                            </strong>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="descuentos-item-acciones">
                      <button
                        type="button"
                        className="btn-descuento-rapido"
                        onClick={() => seleccionarProducto(prod)}
                      >
                        ✏️ Configurar
                      </button>
                      {tieneFijo && (
                        <button
                          type="button"
                          className="btn-descuento-quitar"
                          onClick={() => quitarDescuentoDirecto(prod)}
                        >
                          ✕ Quitar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : pestana === "CUPONES" ? (
          <div className="descuentos-seccion">
            <form className="descuentos-form-inline" onSubmit={crearNuevoCupon}>
              <div className="descuentos-campo">
                <label>Código del Cupón</label>
                <input
                  type="text"
                  placeholder="Ej: STARK25, THOR20..."
                  value={nuevoCodigoCupon}
                  onChange={(e) =>
                    setNuevoCodigoCupon(e.target.value.toUpperCase())
                  }
                  className="descuentos-input"
                />
              </div>

              <div className="descuentos-campo descuentos-campo-corto">
                <label>% Rebaja (1-100)</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={nuevoPorcentajeCupon}
                  onChange={(e) => setNuevoPorcentajeCupon(e.target.value)}
                  className="descuentos-input"
                />
              </div>

              <button
                type="submit"
                className="btn-descuentos-guardar"
                disabled={creandoCupon}
              >
                {creandoCupon ? "Creando..." : "➕ Crear Cupón"}
              </button>
            </form>

            <div className="descuentos-lista-productos">
              {cupones.map((cup) => (
                <div
                  key={cup.id}
                  className={`descuentos-item-row ${cup.activo ? "con-descuento" : ""}`}
                >
                  <div className="descuentos-item-info">
                    <strong>
                      🎟️ {cup.codigo}{" "}
                      <span className="badge-pct-mini">
                        -{cup.porcentajeDescuento}%
                      </span>
                    </strong>
                    <span className="descuentos-item-meta">
                      Estado:{" "}
                      <strong
                        style={{ color: cup.activo ? "#10b981" : "#ef4444" }}
                      >
                        {cup.activo ? "ACTIVO" : "INACTIVO"}
                      </strong>{" "}
                      · Usos registrados: {cup.usosActuales ?? 0}
                      {cup.usosMaximos ? ` / ${cup.usosMaximos}` : ""}
                    </span>
                  </div>

                  <div className="descuentos-item-acciones">
                    <button
                      type="button"
                      className={
                        cup.activo
                          ? "btn-descuento-quitar"
                          : "btn-descuento-rapido"
                      }
                      onClick={() => alternarEstadoCupon(cup)}
                    >
                      {cup.activo ? "⏸ Desactivar" : "▶ Activar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="descuentos-seccion">
            <div className="descuentos-lista-productos">
              {promociones.map((promo) => (
                <div
                  key={promo.id}
                  className={`descuentos-item-row ${promo.activo ? "con-descuento" : ""}`}
                >
                  <div className="descuentos-item-info">
                    <strong>
                      🎉 {promo.nombre} ({promo.codigo}){" "}
                      <span className="badge-pct-mini">
                        -{promo.porcentajeDescuento}%
                      </span>
                    </strong>
                    <span className="descuentos-item-meta">
                      {promo.descripcion}
                    </span>
                  </div>
                  <div className="descuentos-item-acciones">
                    <button
                      type="button"
                      className={
                        promo.activo
                          ? "btn-descuento-quitar"
                          : "btn-descuento-rapido"
                      }
                      onClick={() => alternarEstadoPromocion(promo)}
                    >
                      {promo.activo ? "⏸ Desactivar" : "▶ Activar"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
