import { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { productService } from "../../../services/productService";
import { estadisticaService } from "../../../services/estadisticaService";
import useCarrito from "../../../hooks/useCarrito";
import { formatearMoneda } from "../../../utils/formatoUtils";
import { obtenerCategoriaProducto } from "../../../utils/categoriaUtils";
import ReactorLoader from "../../ReactorLoader";
import PromoModal from "../../PromoModal/PromoModal";
import DetalleProductoModal from "../../DetalleProductoModal/DetalleProductoModal";
import BannerSuperior from "../../BannerSuperior/BannerSuperior";
import "./VistaTerminal.css";
import BannerSlider from "../../BannerSlider/BannerSlider";
import FormularioSoporte from "../../FormularioSoporte/FormularioSoporte";

export default function VistaTerminal() {
  const {
    carrito,
    mostrarCarrito,
    setMostrarCarrito,
    avisoStockId,
    codigoCupon,
    setCodigoCupon,
    cuponAplicado,
    errorCupon,
    setErrorCupon,
    procesandoPedido,
    pedidoFinalizado,
    errorPedido,
    setErrorPedido,
    totalUnidades,
    subtotalSinCupon,
    totalConDescuento,
    esPersonalizable,
    calcularPrecioUnidad,
    mostrarAlertaTopeStock,
    agregarAlCarrito,
    actualizarCantidad,
    actualizarTextoPersonalizado,
    eliminarDelCarrito,
    vaciarCarrito,
    aplicarCupon,
    quitarCupon,
    finalizarPedido,
    limpiarPedidoFinalizado,
  } = useCarrito();

  useEffect(() => {
    if (pedidoFinalizado) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pedidoFinalizado]);

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [productoMasVendido, setProductoMasVendido] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("TODOS");

  const [mostrarPromo, setMostrarPromo] = useState(() => {
    return !sessionStorage.getItem("promo_mostrada");
  });

  const cerrarPromo = () => {
    sessionStorage.setItem("promo_mostrada", "true");
    setMostrarPromo(false);
  };

  const LIMITE_INICIAL = 8;
  const [mostrarTodos, setMostrarTodos] = useState(false);

  const cargarCatalogo = async () => {
    try {
      setError(null);
      const data = await productService.obtenerProductos();
      const lista = data?.content || data || [];
      setProductos(lista);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let montado = true;

    const initCatalogo = async () => {
      try {
        const data = await productService.obtenerProductos();
        if (montado) {
          const lista = data?.content || data || [];
          setProductos(lista);
        }
      } catch (err) {
        if (montado) setError(err.message);
      } finally {
        if (montado) setLoading(false);
      }
    };

    initCatalogo();

    // La estadística es decorativa: si falla, el catálogo sigue funcionando sin destacado.
    const initMasVendido = async () => {
      try {
        const data = await estadisticaService.obtenerProductoMasVendido();
        if (montado) setProductoMasVendido(data || null);
      } catch (err) {
        console.warn("No se pudo obtener el producto más vendido:", err);
      }
    };

    initMasVendido();

    const stompClient = new Client({
      webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
      reconnectDelay: 5000,
      onConnect: () => {
        stompClient.subscribe("/topic/productos-stock", (mensaje) => {
          if (!montado || !mensaje.body) return;
          try {
            const productoActualizado = JSON.parse(mensaje.body);
            setProductos((prevProductos) => {
              const existe = prevProductos.some(
                (p) => p.id === productoActualizado.id,
              );
              if (existe) {
                return prevProductos.map((p) =>
                  p.id === productoActualizado.id
                    ? { ...p, ...productoActualizado }
                    : p,
                );
              }
              return [...prevProductos, productoActualizado];
            });

            setProductoSeleccionado((prevSel) =>
              prevSel && prevSel.id === productoActualizado.id
                ? { ...prevSel, ...productoActualizado }
                : prevSel,
            );
          } catch (err) {
            console.error(
              "Error al procesar actualización de stock por WebSocket:",
              err,
            );
          }
        });
      },
    });

    stompClient.activate();

    return () => {
      montado = false;
      stompClient.deactivate();
    };
  }, []);

  const errorVisible = error || errorPedido;
  const cerrarError = () => {
    setError(null);
    setErrorPedido(null);
  };

  const finalizarPedidoYRecargar = () => finalizarPedido(cargarCatalogo);

  if (loading || procesandoPedido) {
    return (
      <ReactorLoader
        size={150}
        text={
          procesandoPedido
            ? "Registrando solicitud de suministros en Stark Industries..."
            : "Iniciando enlace con Stark Industries..."
        }
      />
    );
  }

  if (pedidoFinalizado) {
    return (
      <div className="terminal-exito-wrapper">
        <div className="modal-exito">
          <h2>⭐ Transmisión Completada ⭐</h2>
          <p className="terminal-exito-subtexto">
            Tu solicitud de equipamiento ha sido enviada al área de preparación:
          </p>
          <div className="codigo-destacado">{pedidoFinalizado}</div>
          <button
            className="btn-agregar btn-nuevo-pedido-exito"
            onClick={limpiarPedidoFinalizado}
          >
            Realizar nuevo pedido
          </button>
        </div>
      </div>
    );
  }

  const normalizarTexto = (texto) => {
    if (!texto) return "";
    return texto
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  };

  const categoriasBase = [
    ...new Set(
      productos.map((p) => {
        const cat = obtenerCategoriaProducto(p);
        return cat.trim().toUpperCase();
      }),
    ),
  ].filter((c) => c && c !== "TODOS" && c !== "PERSONALIZABLES");

  const categoriasUnicas = ["TODOS", ...categoriasBase, "PERSONALIZABLES"];

  const productosFiltrados = productos.filter((prod) => {
    const categoriaProd = normalizarTexto(obtenerCategoriaProducto(prod));
    const categoriaSeleccionadaNorm = normalizarTexto(categoriaSeleccionada);

    const coincideCategoria =
      categoriaSeleccionada === "TODOS"
        ? true
        : categoriaSeleccionada === "PERSONALIZABLES"
          ? esPersonalizable(prod)
          : categoriaProd === categoriaSeleccionadaNorm;

    const textoBusquedaNormalizado = normalizarTexto(busqueda);
    const nombreNormalizado = normalizarTexto(prod.nombre);
    const descripcionNormalizada = normalizarTexto(prod.descripcion);

    const coincideTexto =
      nombreNormalizado.includes(textoBusquedaNormalizado) ||
      descripcionNormalizada.includes(textoBusquedaNormalizado) ||
      categoriaProd.includes(textoBusquedaNormalizado);

    return coincideCategoria && coincideTexto;
  });

  const productosVisibles = mostrarTodos
    ? productosFiltrados
    : productosFiltrados.slice(0, LIMITE_INICIAL);

  const handleFiltroDesdeBanner = (cat) => {
    if (!cat) return;
    if (Array.isArray(cat)) {
      setCategoriaSeleccionada(cat[0].toUpperCase());
    } else {
      setCategoriaSeleccionada(cat.toUpperCase());
    }
  };

  return (
    <div className="terminal-layout">
      <BannerSuperior />
      {mostrarPromo && <PromoModal alCerrar={cerrarPromo} />}

      <BannerSlider
        alFiltrarCategoria={handleFiltroDesdeBanner}
        onSeleccionarCategoria={handleFiltroDesdeBanner}
      />

      <button
        className="btn-carrito-flotante"
        onClick={() => setMostrarCarrito(!mostrarCarrito)}
      >
        🛒
        {totalUnidades > 0 && (
          <span className="badge-carrito">{totalUnidades}</span>
        )}
      </button>

      <section className="catalogo-section catalogo-container">
        <div className="catalogo-header-bar">
          <h2>Catálogo de Equipamiento</h2>
          <span className="contador-suministros">
            Mostrando {productosVisibles.length} de {productosFiltrados.length}{" "}
            suministros
          </span>
        </div>

        <div className="buscador-filtros-container">
          <input
            type="text"
            placeholder="Buscar por nombre, personaje, descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="comanda-custom-input buscador-input"
          />

          <div className="categorias-botones-grid">
            {categoriasUnicas.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`btn-categoria ${normalizarTexto(categoriaSeleccionada) === normalizarTexto(cat) ? "activo" : ""} ${cat === "PERSONALIZABLES" ? "btn-filtro-personalizables" : ""}`}
              >
                {cat === "PERSONALIZABLES" ? "⚡ PERSONALIZABLES" : cat}
              </button>
            ))}
          </div>
        </div>

        {errorVisible && (
          <div className="terminal-error-banner">
            <span>⚠️ {errorVisible}</span>
            <button type="button" onClick={cerrarError}>
              ✕
            </button>
          </div>
        )}

        <div className="productos-grid">
          {productosVisibles.map((prod) => {
            const rutaCruda = prod.imagenUrl || prod.imagen_url;
            const rutaFoto =
              rutaCruda && rutaCruda.trim() !== ""
                ? rutaCruda.startsWith("/")
                  ? rutaCruda
                  : `/${rutaCruda}`
                : "/imagenes/camisetas/avengers.jpg";

            const nombreProd = (prod.nombre || "").trim();
            const esGroot = nombreProd === "Figura Groot Guardianes";
            const esThor = nombreProd === "Figura Thor Dios del Trueno";
            const precioNum = Number(prod.precio) || 0;

            let precioFinalProd = precioNum;
            if (esGroot) precioFinalProd = precioNum * 0.75;
            if (esThor) precioFinalProd = precioNum * 0.9;

            const tieneDto = esGroot || esThor;
            const esCamisetaCatalogo =
              obtenerCategoriaProducto(prod) === "Camisetas" || prod.id <= 5;

            const unidadesEnCesta = carrito
              .filter((item) => item.id === prod.id)
              .reduce((total, item) => total + (Number(item.cantidad) || 0), 0);

            const stockBaseProd = Number(
              prod.stockMax ?? prod.stock ?? (prod.activo === false ? 0 : 10),
            );
            const stockEfectivo = Math.max(0, stockBaseProd - unidadesEnCesta);

            const estaAgotado = stockEfectivo === 0;
            const pocoStock = stockEfectivo > 0 && stockEfectivo <= 3;

            return (
              <article key={prod.id} className="producto-card">
                {productoMasVendido &&
                  productoMasVendido.productoId === prod.id && (
                    <span
                      className="badge-top-ventas"
                      title={`Producto estrella: ${productoMasVendido.totalUnidadesVendidas} unidades vendidas`}
                    >
                      ⭐ TOP VENTAS
                    </span>
                  )}
                {tieneDto && (
                  <span className="product-badge gold">
                    {esGroot ? "-25% DTO" : "-10% DTO"}
                  </span>
                )}
                <div
                  className="producto-img-container"
                  onClick={() => setProductoSeleccionado(prod)}
                  title="Haz clic para ver la galería completa"
                >
                  <img
                    src={rutaFoto}
                    alt={prod.nombre}
                    className="producto-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/imagenes/camisetas/avengers.jpg";
                    }}
                  />
                </div>

                <div>
                  <h3>{prod.nombre}</h3>
                  <p>{prod.descripcion}</p>
                </div>

                <div>
                  <div className="producto-precio producto-precios-contenedor">
                    {tieneDto ? (
                      <>
                        <span className="producto-precio-tachado precio-anterior-card">
                          {formatearMoneda(precioNum)}
                        </span>
                        <span className="producto-precio-actual precio-nuevo">
                          {formatearMoneda(precioFinalProd)}
                        </span>
                      </>
                    ) : (
                      <span className="producto-precio-actual">
                        {formatearMoneda(precioNum)}
                      </span>
                    )}
                  </div>

                  <div
                    className={`producto-stock-estado ${
                      estaAgotado
                        ? "stock-agotado"
                        : pocoStock
                          ? "stock-bajo"
                          : "stock-disponible"
                    }`}
                  >
                    {estaAgotado ? (
                      <>
                        <span>🚫 Agotado</span>
                        <span className="producto-stock-unidades">
                          en almacén
                        </span>
                      </>
                    ) : pocoStock ? (
                      <>
                        <span>⚠️¡Últimas unidades!</span>
                        <span className="producto-stock-unidades">
                          {stockEfectivo === 1
                            ? "(Solo queda 1 ud)"
                            : `(Solo quedan ${stockEfectivo} ud)`}
                        </span>
                      </>
                    ) : (
                      <>
                        <span>✓ En stock</span>
                        <span className="producto-stock-unidades">
                          ({stockEfectivo}&nbsp;disponibles)
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    className={`btn-agregar ${
                      !esCamisetaCatalogo && estaAgotado
                        ? "btn-agregar-agotado"
                        : ""
                    }`}
                    disabled={!esCamisetaCatalogo && estaAgotado}
                    onClick={() => {
                      if (esCamisetaCatalogo) {
                        setProductoSeleccionado(prod);
                      } else {
                        agregarAlCarrito({
                          ...prod,
                          stockMax: stockBaseProd,
                        });
                      }
                    }}
                  >
                    {esCamisetaCatalogo
                      ? "Elegir Talla"
                      : estaAgotado
                        ? "🚫 Agotado"
                        : "Añadir a la Cesta"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {productosFiltrados.length > LIMITE_INICIAL && (
          <div className="ver-mas-container">
            <button
              className="btn-ver-todo-stark"
              onClick={() => setMostrarTodos(!mostrarTodos)}
            >
              {mostrarTodos ? (
                <>▲ Reducir Catálogo</>
              ) : (
                <>
                  ▼ Desplegar Catálogo Completo (
                  {productosFiltrados.length - LIMITE_INICIAL} restantes)
                </>
              )}
            </button>
          </div>
        )}
      </section>

      <FormularioSoporte />

      {mostrarCarrito && (
        <div
          className="carrito-overlay"
          onClick={() => setMostrarCarrito(false)}
        >
          <aside
            className="carrito-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="carrito-header">
              <h2>Comanda Activa</h2>
              <div className="carrito-header-acciones">
                {carrito.length > 0 && (
                  <button
                    type="button"
                    className="btn-vaciar-carrito"
                    onClick={vaciarCarrito}
                    title="Vaciar todos los artículos"
                  >
                    🗑️ Vaciar
                  </button>
                )}
                <button
                  type="button"
                  className="btn-cerrar"
                  onClick={() => setMostrarCarrito(false)}
                  title="Cerrar carrito"
                >
                  ✕
                </button>
              </div>
            </div>

            {errorVisible && (
              <div className="terminal-error-banner">
                <span>⚠️ {errorVisible}</span>
                <button type="button" onClick={cerrarError}>
                  ✕
                </button>
              </div>
            )}

            {carrito.length === 0 ? (
              <p className="carrito-vacio">No has seleccionado suministros.</p>
            ) : (
              <>
                <ul className="comanda-items">
                  {carrito.map((item) => {
                    const nombreItem = (item.nombre || "").trim();
                    const esGrootItem = nombreItem.includes(
                      "Figura Groot Guardianes",
                    );
                    const esThorItem = nombreItem.includes(
                      "Figura Thor Dios del Trueno",
                    );
                    const tieneDtoItem = esGrootItem || esThorItem;
                    const cantActual = Number(item.cantidad) || 1;
                    const maxDisponible = Number(
                      item.stockMax ?? item.stock ?? 99,
                    );
                    const enTopeStock = cantActual >= maxDisponible;
                    const subtotalItem =
                      calcularPrecioUnidad(item) * cantActual;

                    return (
                      <li key={item.idUnico} className="comanda-item">
                        <div className="comanda-item-header">
                          <div className="comanda-item-info">
                            <span className="comanda-item-titulo">
                              {item.nombre}
                              {item.talla && (
                                <strong className="comanda-talla-tag">
                                  ({item.talla})
                                </strong>
                              )}
                            </span>
                            {tieneDtoItem && (
                              <span className="comanda-item-badge-pill">
                                ⚡ {esGrootItem ? "-25% DTO" : "-10% DTO"}
                              </span>
                            )}
                          </div>

                          <div className="comanda-item-acciones-precio">
                            <span className="comanda-item-subtotal">
                              {formatearMoneda(subtotalItem)}
                            </span>
                            <button
                              type="button"
                              onClick={() => eliminarDelCarrito(item.idUnico)}
                              className="btn-eliminar-item-comanda"
                              title="Eliminar este artículo"
                            >
                              ✕
                            </button>
                          </div>
                        </div>

                        <div className="comanda-cantidad-fila">
                          <span className="comanda-cantidad-label">
                            Unidades{" "}
                            <small className="texto-max-stock">
                              (máx. {maxDisponible})
                            </small>
                            :
                          </span>
                          <div className="selector-cantidad-stark">
                            <button
                              type="button"
                              className="btn-cant-control"
                              onClick={() =>
                                actualizarCantidad(item.idUnico, cantActual - 1)
                              }
                              disabled={cantActual <= 1}
                              aria-label="Disminuir cantidad"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              max={maxDisponible}
                              value={cantActual}
                              onChange={(e) =>
                                actualizarCantidad(item.idUnico, e.target.value)
                              }
                              className="input-cant-numero"
                              aria-label="Cantidad de unidades"
                            />
                            <button
                              type="button"
                              className="btn-cant-control"
                              onClick={() => {
                                if (enTopeStock) {
                                  mostrarAlertaTopeStock(item.idUnico);
                                } else {
                                  actualizarCantidad(
                                    item.idUnico,
                                    cantActual + 1,
                                  );
                                }
                              }}
                              disabled={enTopeStock}
                              title={
                                enTopeStock
                                  ? `Límite de stock alcanzado (${maxDisponible} ud.)`
                                  : "Aumentar cantidad"
                              }
                              aria-label="Aumentar cantidad"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {(enTopeStock || avisoStockId === item.idUnico) && (
                          <small className="aviso-tope-stock">
                            ⚠️ Límite de stock disponible alcanzado (
                            {maxDisponible}{" "}
                            {maxDisponible === 1 ? "unidad" : "unidades"}).
                          </small>
                        )}

                        {esPersonalizable(item) ? (
                          <>
                            <input
                              type="text"
                              placeholder="Grabado / texto personalizado..."
                              value={item.textoPersonalizado}
                              onChange={(e) =>
                                actualizarTextoPersonalizado(
                                  item.idUnico,
                                  e.target.value,
                                )
                              }
                              className="comanda-custom-input"
                            />

                            {item.textoPersonalizado?.trim().length > 0 && (
                              <div className="aviso-descuento-grabado">
                                ⚡ Grabado Especial Apertura:{" "}
                                <strong>+3.00 € / ud.</strong>{" "}
                                <span className="precio-tachado">5.00 €</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <small className="aviso-no-personalizable">
                            🚫 Este artículo no admite grabado personalizado
                          </small>
                        )}
                      </li>
                    );
                  })}
                </ul>

                <div className="cupon-seccion-contenedor">
                  {!cuponAplicado ? (
                    <form onSubmit={aplicarCupon} className="cupon-form">
                      <input
                        type="text"
                        placeholder="Introduce tu código..."
                        value={codigoCupon}
                        onChange={(e) => {
                          setCodigoCupon(e.target.value);
                          if (errorCupon) setErrorCupon("");
                        }}
                        className="comanda-custom-input cupon-input"
                      />
                      <button type="submit" className="btn-aplicar-cupon">
                        Aplicar
                      </button>
                    </form>
                  ) : (
                    <div className="aviso-descuento-grabado cupon-aplicado-fila">
                      <span>
                        🎉 Cupón <strong>{cuponAplicado.codigo}</strong>{" "}
                        aplicado (-{cuponAplicado.porcentaje}%)
                      </span>
                      <button
                        type="button"
                        onClick={quitarCupon}
                        className="btn-quitar-cupon"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {errorCupon && (
                    <small className="error-cupon-texto">{errorCupon}</small>
                  )}
                </div>

                <div className="comanda-total-container">
                  <span className="comanda-total-label">Total a abonar</span>
                  <div className="comanda-total-valores">
                    {cuponAplicado && (
                      <div className="comanda-total-tachado">
                        {formatearMoneda(subtotalSinCupon)}
                      </div>
                    )}
                    <span className="comanda-total-monto">
                      {totalConDescuento}&nbsp;€
                    </span>
                  </div>
                </div>

                <button className="btn-finalizar" onClick={finalizarPedidoYRecargar}>
                  ⚡ Confirmar Suministros
                </button>
              </>
            )}
          </aside>
        </div>
      )}

      <DetalleProductoModal
        producto={productoSeleccionado}
        carrito={carrito}
        alCerrar={() => setProductoSeleccionado(null)}
        alAgregar={agregarAlCarrito}
      />
    </div>
  );
}
