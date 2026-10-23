import { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { productService } from "../../../services/productService";
import ReactorLoader from "../../ReactorLoader";
import PromoModal from "../../PromoModal/PromoModal";
import DetalleProductoModal from "../../DetalleProductoModal/DetalleProductoModal";
import BannerSuperior from "../../BannerSuperior/BannerSuperior";
import "./VistaTerminal.css";
import BannerSlider from "../../BannerSlider/BannerSlider";
import FormularioSoporte from "../../FormularioSoporte/FormularioSoporte";

export default function VistaTerminal() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pedidoFinalizado, setPedidoFinalizado] = useState(null);
  const [error, setError] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [avisoStockId, setAvisoStockId] = useState(null);

  const [codigoCupon, setCodigoCupon] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [errorCupon, setErrorCupon] = useState("");

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

  const PRECIO_GRABADO_REBAJADO = 3.0;

  useEffect(() => {
    let montado = true;

    const cargarCatalogo = async () => {
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

    cargarCatalogo();

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

  const mostrarAlertaTopeStock = (idUnico) => {
    setAvisoStockId(idUnico);
  };

  const agregarAlCarrito = (producto) => {
    const topeStock = Number(producto.stockMax ?? producto.stock ?? 99);
    if (topeStock <= 0) return;

    // Se incluye la talla en la clave única para permitir diferentes tallas de un mismo producto
    const tallaArticulo = producto.talla || "";
    const claveArticulo = `${producto.id}_${producto.nombre || ""}_${tallaArticulo}`;

    setCarrito((prev) => {
      const unidadesYaEnCesta = prev
        .filter((item) =>
          tallaArticulo
            ? item.id === producto.id && item.talla === tallaArticulo
            : item.id === producto.id,
        )
        .reduce((acc, item) => acc + (Number(item.cantidad) || 0), 0);

      if (unidadesYaEnCesta >= topeStock) {
        const itemExistente = prev.find(
          (item) => item.idUnico === claveArticulo,
        );
        if (itemExistente) mostrarAlertaTopeStock(claveArticulo);
        return prev;
      }

      const existe = prev.find((item) => item.idUnico === claveArticulo);
      if (existe) {
        const cantActual = Number(existe.cantidad) || 1;
        const maxPermitido = Number(existe.stockMax ?? topeStock);
        if (cantActual >= maxPermitido) {
          mostrarAlertaTopeStock(claveArticulo);
          return prev;
        }
        return prev.map((item) =>
          item.idUnico === claveArticulo
            ? { ...item, cantidad: cantActual + 1, stockMax: maxPermitido }
            : item,
        );
      }
      return [
        ...prev,
        {
          ...producto,
          idUnico: claveArticulo,
          talla: producto.talla || null,
          cantidad: 1,
          stockMax: topeStock,
          textoPersonalizado: "",
        },
      ];
    });
  };

  const actualizarCantidad = (idUnico, nuevaCantidad) => {
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.idUnico !== idUnico) return item;

        const maxStock = Number(item.stockMax ?? item.stock ?? 99);
        const valorParseado = parseInt(nuevaCantidad, 10);
        const cantidadBase = Number.isNaN(valorParseado)
          ? 1
          : Math.max(1, valorParseado);

        if (cantidadBase > maxStock) {
          mostrarAlertaTopeStock(idUnico);
          return { ...item, cantidad: maxStock };
        }

        if (avisoStockId === idUnico) {
          setAvisoStockId(null);
        }

        return { ...item, cantidad: cantidadBase };
      }),
    );
  };

  const actualizarTextoPersonalizado = (idUnico, texto) => {
    setCarrito((prev) =>
      prev.map((item) =>
        item.idUnico === idUnico
          ? { ...item, textoPersonalizado: texto }
          : item,
      ),
    );
  };

  const eliminarDelCarrito = (idUnico) => {
    setCarrito((prev) => prev.filter((item) => item.idUnico !== idUnico));
    if (avisoStockId === idUnico) setAvisoStockId(null);
  };

  const vaciarCarrito = () => {
    setCarrito([]);
    setCuponAplicado(null);
    setCodigoCupon("");
    setAvisoStockId(null);
  };

  const obtenerCategoriaProducto = (prod) => {
    const nombre = (prod.nombre || "").toLowerCase();
    const catOriginal =
      prod.nombreCategoria || prod.categoriaNombre || prod.categoria || "";

    if (nombre.includes("taza")) return "Tazas";
    if (nombre.includes("gorra")) return "Gorras";
    if (nombre.includes("figura")) return "Figuras";
    if (nombre.includes("camiseta") || nombre.includes("remera"))
      return "Camisetas";

    return catOriginal || "Otros";
  };

  const esPersonalizable = (item) => {
    if (!item) return false;
    if (
      item.personalizable === true ||
      item.personalizable === 1 ||
      item.personalizable === "Sí" ||
      item.personalizable === "true"
    ) {
      return true;
    }
    if (
      item.personalizable === "No" ||
      item.personalizable === false ||
      item.personalizable === 0
    ) {
      return false;
    }

    const categoria = obtenerCategoriaProducto(item);
    if (categoria.toLowerCase().includes("figura")) {
      return false;
    }
    return true;
  };

  const calcularPrecioUnidad = (item) => {
    const precioBase = Number(item.precio) || 0;
    const nombre = (item.nombre || "").trim();

    let precioConDescuentoFigura = precioBase;
    if (nombre.includes("Figura Groot Guardianes")) {
      if (precioBase > 30) {
        precioConDescuentoFigura = precioBase * 0.75;
      }
    } else if (nombre.includes("Figura Thor Dios del Trueno")) {
      if (precioBase > 40) {
        precioConDescuentoFigura = precioBase * 0.9;
      }
    }

    const tieneGrabado =
      esPersonalizable(item) && item.textoPersonalizado?.trim().length > 0;
    return (
      precioConDescuentoFigura + (tieneGrabado ? PRECIO_GRABADO_REBAJADO : 0)
    );
  };

  const subtotalSinCupon = carrito.reduce(
    (acc, item) =>
      acc + calcularPrecioUnidad(item) * (Number(item.cantidad) || 1),
    0,
  );

  const montoDescuento = cuponAplicado
    ? subtotalSinCupon * (cuponAplicado.porcentaje / 100)
    : 0;
  const totalConDescuento = (subtotalSinCupon - montoDescuento).toFixed(2);

  const aplicarCupon = (e) => {
    e.preventDefault();
    const codigoLimpio = codigoCupon.trim().toUpperCase();

    const cuponesUsadosSesion = JSON.parse(
      sessionStorage.getItem("cupones_usados_sesion") || "[]",
    );
    if (cuponesUsadosSesion.includes(codigoLimpio)) {
      setErrorCupon(
        "✨ Este código ya fue utilizado anteriormente en esta sesión.",
      );
      return;
    }

    if (codigoLimpio === "STARK10") {
      setCuponAplicado({ codigo: "STARK10", porcentaje: 10 });
      setErrorCupon("");
    } else if (codigoLimpio === "GROOT5") {
      setCuponAplicado({ codigo: "GROOT5", porcentaje: 5 });
      setErrorCupon("");
    } else {
      setErrorCupon("⚠️ Código no válido o caducado");
    }
  };

  const totalUnidades = carrito.reduce(
    (acc, item) => acc + (Number(item.cantidad) || 1),
    0,
  );

  const finalizarPedido = async () => {
    if (carrito.length === 0) return;

    try {
      const itemsAProcesar = [...carrito];
      const cuponActual = cuponAplicado;

      if (cuponActual) {
        const cuponesUsadosSesion = JSON.parse(
          sessionStorage.getItem("cupones_usados_sesion") || "[]",
        );
        if (!cuponesUsadosSesion.includes(cuponActual.codigo)) {
          cuponesUsadosSesion.push(cuponActual.codigo);
          sessionStorage.setItem(
            "cupones_usados_sesion",
            JSON.stringify(cuponesUsadosSesion),
          );
        }
      }

      setMostrarCarrito(false);
      setCarrito([]);
      setCuponAplicado(null);
      setCodigoCupon("");
      setLoading(true);

      const nuevoPedido = await productService.crearPedido(1);

      for (const item of itemsAProcesar) {
        await productService.agregarProductoAPedido(nuevoPedido.id, {
          productoId: item.id,
          cantidad: Number(item.cantidad) || 1,
          textoPersonalizado: esPersonalizable(item)
            ? item.textoPersonalizado
            : null,
          talla: item.talla || null, // Se envía la talla seleccionada al backend
        });
      }

      setPedidoFinalizado(nuevoPedido?.codigo || `AV-${nuevoPedido?.id || 1}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ReactorLoader
        size={150}
        text="Iniciando enlace con Stark Industries..."
      />
    );
  }

  if (pedidoFinalizado) {
    return (
      <div
        style={{ padding: "4rem 1rem", maxWidth: "650px", margin: "0 auto" }}
      >
        <div className="modal-exito">
          <h2>⭐ Transmisión Completada ⭐</h2>
          <p style={{ color: "#cbd5e1" }}>
            Tu solicitud de equipamiento ha sido enviada al área de preparación:
          </p>
          <div className="codigo-destacado">{pedidoFinalizado}</div>
          <button
            className="btn-agregar"
            style={{ maxWidth: "280px", margin: "1rem auto 0 auto" }}
            onClick={() => setPedidoFinalizado(null)}
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

        {error && <p style={{ color: "#ef4444" }}>{error}</p>}

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

            // 1. Unidades ya presentes en la cesta para este producto
            const unidadesEnCesta = carrito
              .filter((item) => item.id === prod.id)
              .reduce((total, item) => total + (Number(item.cantidad) || 0), 0);

            // 2. Stock efectivo remanente en tiempo real
            const stockBaseProd = Number(
              prod.stockMax ?? prod.stock ?? (prod.activo === false ? 0 : 10),
            );
            const stockEfectivo = Math.max(0, stockBaseProd - unidadesEnCesta);

            const estaAgotado = stockEfectivo === 0;
            const pocoStock = stockEfectivo > 0 && stockEfectivo <= 2;

            return (
              <article key={prod.id} className="producto-card">
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
                          {precioNum.toFixed(2)}&nbsp;€
                        </span>
                        <span className="producto-precio-actual precio-nuevo">
                          {precioFinalProd.toFixed(2)}&nbsp;€
                        </span>
                      </>
                    ) : (
                      <span className="producto-precio-actual">
                        {precioNum.toFixed(2)}&nbsp;€
                      </span>
                    )}
                  </div>

                  {/* Aviso de stock sincronizado en tiempo real */}
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
                        <span>⚠️ ¡Pocas unidades!</span>
                        <span className="producto-stock-unidades">
                          (Solo quedan {stockEfectivo} ud)
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
                                <strong
                                  style={{
                                    color: "#00e5ff",
                                    marginLeft: "0.4rem",
                                  }}
                                >
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
                              {subtotalItem.toFixed(2)}&nbsp;€
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
                            <small style={{ color: "#64748b" }}>
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
                          <small
                            style={{
                              color: "#fbbf24",
                              fontFamily: "'Consolas', monospace",
                              fontSize: "0.75rem",
                              display: "block",
                            }}
                          >
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
                          <small
                            style={{
                              color: "#64748b",
                              fontSize: "0.78rem",
                              fontStyle: "italic",
                              marginTop: "0.2rem",
                            }}
                          >
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
                    <div
                      className="aviso-descuento-grabado"
                      style={{ justifyContent: "space-between" }}
                    >
                      <span>
                        🎉 Cupón <strong>{cuponAplicado.codigo}</strong>{" "}
                        aplicado (-{cuponAplicado.porcentaje}%)
                      </span>
                      <button
                        onClick={() => setCuponAplicado(null)}
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#ef4444",
                          fontWeight: "bold",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {errorCupon && (
                    <small
                      style={{
                        color: "#f87171",
                        display: "block",
                        marginTop: "0.3rem",
                        fontSize: "0.78rem",
                      }}
                    >
                      {errorCupon}
                    </small>
                  )}
                </div>

                <div className="comanda-total-container">
                  <span className="comanda-total-label">Total a abonar</span>
                  <div className="comanda-total-valores">
                    {cuponAplicado && (
                      <div className="comanda-total-tachado">
                        {subtotalSinCupon.toFixed(2)}&nbsp;€
                      </div>
                    )}
                    <span className="comanda-total-monto">
                      {totalConDescuento}&nbsp;€
                    </span>
                  </div>
                </div>

                <button className="btn-finalizar" onClick={finalizarPedido}>
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
