import { useState, useEffect } from 'react';
import { productService } from '../../../services/productService';
import ReactorLoader from '../../ReactorLoader';
import PromoModal from '../../PromoModal/PromoModal';
import DetalleProductoModal from '../../DetalleProductoModal/DetalleProductoModal';
import BannerSuperior from '../../BannerSuperior/BannerSuperior';
import './VistaTerminal.css';

export default function VistaTerminal() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pedidoFinalizado, setPedidoFinalizado] = useState(null);
  const [error, setError] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

  const [codigoCupon, setCodigoCupon] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState(null);
  const [errorCupon, setErrorCupon] = useState('');

  // Control para mostrar el popup solo 1 vez por sesión (Paso 4)
  const [mostrarPromo, setMostrarPromo] = useState(() => {
    return !sessionStorage.getItem('promo_mostrada');
  });

  const cerrarPromo = () => {
    sessionStorage.setItem('promo_mostrada', 'true');
    setMostrarPromo(false);
  };

  // Control de paginación / visualización inicial (8 productos = 2 filas)
  const LIMITE_INICIAL = 8;
  const [mostrarTodos, setMostrarTodos] = useState(false);

  // Precio rebajado del grabado
  const PRECIO_GRABADO_REBAJADO = 3.00;

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

    return () => {
      montado = false;
    };
  }, []);

  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => [
      ...prev,
      {
        ...producto,
        idUnico: `${producto.id}_item_${prev.length + 1}_${Date.now()}`,
        textoPersonalizado: '',
      },
    ]);
  };

  const actualizarTextoPersonalizado = (idUnico, texto) => {
    setCarrito((prev) =>
      prev.map((item) =>
        item.idUnico === idUnico ? { ...item, textoPersonalizado: texto } : item
      )
    );
  };

  const eliminarDelCarrito = (idUnico) => {
    setCarrito((prev) => prev.filter((item) => item.idUnico !== idUnico));
  };

  const esPersonalizable = (item) => {
    const categoria = item.nombreCategoria || item.categoriaNombre || item.categoria || '';
    const nombre = item.nombre || '';

    if (
      categoria.toLowerCase().includes('figura') ||
      nombre.toLowerCase().includes('figura')
    ) {
      return false;
    }
    return true;
  };

  const calcularPrecioUnidad = (item) => {
    const precioBase = Number(item.precio) || 0;
    const tieneGrabado = esPersonalizable(item) && item.textoPersonalizado?.trim().length > 0;
    return precioBase + (tieneGrabado ? PRECIO_GRABADO_REBAJADO : 0);
  };

  const subtotalSinCupon = carrito.reduce((acc, item) => acc + calcularPrecioUnidad(item), 0);
  const montoDescuento = cuponAplicado ? subtotalSinCupon * (cuponAplicado.porcentaje / 100) : 0;
  const totalConDescuento = (subtotalSinCupon - montoDescuento).toFixed(2);

  const aplicarCupon = (e) => {
    e.preventDefault();
    if (codigoCupon.trim().toUpperCase() === 'STARK10') {
      setCuponAplicado({ codigo: 'STARK10', porcentaje: 10 });
      setErrorCupon('');
    } else {
      setErrorCupon('⚠️ Código no válido o caducado');
    }
  };

  const totalUnidades = carrito.length;

  const finalizarPedido = async () => {
    if (carrito.length === 0) return;

    try {
      setLoading(true);
      const nuevoPedido = await productService.crearPedido(1);

      for (const item of carrito) {
        await productService.agregarProductoAPedido(nuevoPedido.id, {
          productoId: item.id,
          cantidad: 1,
          textoPersonalizado: esPersonalizable(item) ? item.textoPersonalizado : null,
        });
      }

      setPedidoFinalizado(nuevoPedido?.codigo || `AV-${nuevoPedido?.id || 1}`);
      setCarrito([]);
      setCuponAplicado(null);
      setCodigoCupon('');
      setMostrarCarrito(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ReactorLoader size={150} text="Iniciando enlace con Stark Industries..." />;
  }

  if (pedidoFinalizado) {
    return (
      <div style={{ padding: '4rem 1rem', maxWidth: '650px', margin: '0 auto' }}>
        <div className="modal-exito">
          <h2>⭐ Transmisión Completada ⭐</h2>
          <p style={{ color: '#cbd5e1' }}>
            Tu solicitud de equipamiento ha sido enviada al área de preparación:
          </p>
          <div className="codigo-destacado">{pedidoFinalizado}</div>
          <button
            className="btn-agregar"
            style={{ maxWidth: '280px', margin: '1rem auto 0 auto' }}
            onClick={() => setPedidoFinalizado(null)}
          >
            Realizar nuevo pedido
          </button>
        </div>
      </div>
    );
  }

  // Lista calculada según el estado del botón
  const productosVisibles = mostrarTodos ? productos : productos.slice(0, LIMITE_INICIAL);

  return (
    <div className="terminal-layout">
      <BannerSuperior />
      {/* Modal Promocional Especial Apertura con control de visibilidad */}
      {mostrarPromo && <PromoModal alCerrar={cerrarPromo} />}

      {/* Botón Flotante para Abrir Carrito */}
      <button 
        className="btn-carrito-flotante" 
        onClick={() => setMostrarCarrito(!mostrarCarrito)}
      >
        🛒
        {totalUnidades > 0 && <span className="badge-carrito">{totalUnidades}</span>}
      </button>

      {/* Catálogo de Productos */}
      <section className="catalogo-section">
        <div className="catalogo-header-bar">
          <h2>Catálogo de Equipamiento</h2>
          <span className="contador-suministros">
            Mostrando {productosVisibles.length} de {productos.length} suministros
          </span>
        </div>

        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        <div className="productos-grid">
          {productosVisibles.map((prod) => {
            const rutaCruda = prod.imagenUrl || prod.imagen_url;
            const rutaFoto = rutaCruda && rutaCruda.trim() !== '' 
              ? (rutaCruda.startsWith('/') ? rutaCruda : `/${rutaCruda}`) 
              : '/imagenes/camisetas/avengers.jpg';

            return (
              <article key={prod.id} className="producto-card">
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
                      e.currentTarget.src = '/imagenes/camisetas/avengers.jpg';
                    }}
                  />
                </div>

                <div>
                  <h3>{prod.nombre}</h3>
                  <p>{prod.descripcion}</p>
                </div>

                <div>
                  <div className="producto-precio">
                    {(Number(prod.precio) || 0).toFixed(2)} €
                  </div>
                  <button
                    className="btn-agregar"
                    onClick={() => agregarAlCarrito(prod)}
                  >
                    Añadir a la Cesta
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {/* Botón Mostrar Todo / Reducir */}
        {productos.length > LIMITE_INICIAL && (
          <div className="ver-mas-container">
            <button
              className="btn-ver-todo-stark"
              onClick={() => setMostrarTodos(!mostrarTodos)}
            >
              {mostrarTodos ? (
                <>▲ Reducir Catálogo</>
              ) : (
                <>▼ Desplegar Catálogo Completo ({productos.length - LIMITE_INICIAL} restantes)</>
              )}
            </button>
          </div>
        )}
      </section>

      {/* Desplegable Lateral del Carrito */}
      {mostrarCarrito && (
        <div className="carrito-overlay" onClick={() => setMostrarCarrito(false)}>
          <aside className="carrito-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="carrito-header">
              <h2>Comanda Activa</h2>
              <button className="btn-cerrar" onClick={() => setMostrarCarrito(false)}>✕</button>
            </div>

            {carrito.length === 0 ? (
              <p className="carrito-vacio">No has seleccionado suministros.</p>
            ) : (
              <>
                <ul className="comanda-items">
                  {carrito.map((item, index) => (
                    <li key={item.idUnico} className="comanda-item">
                      <div className="comanda-item-header">
                        <span>
                          <strong className="comanda-item-cant">Unidad #{index + 1}: </strong>
                          {item.nombre}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className="comanda-item-subtotal">
                            {calcularPrecioUnidad(item).toFixed(2)} €
                          </span>
                          <button 
                            onClick={() => eliminarDelCarrito(item.idUnico)}
                            style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                            title="Eliminar esta unidad"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      
                      {esPersonalizable(item) ? (
                        <>
                          <input
                            type="text"
                            placeholder="Grabado / texto para esta unidad..."
                            value={item.textoPersonalizado}
                            onChange={(e) => actualizarTextoPersonalizado(item.idUnico, e.target.value)}
                            className="comanda-custom-input"
                          />

                          {item.textoPersonalizado?.trim().length > 0 && (
                            <div className="aviso-descuento-grabado">
                              ⚡ Grabado Especial Apertura: <strong>+3.00 €</strong> <span className="precio-tachado">5.00 €</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <small style={{ color: '#64748b', fontSize: '0.78rem', fontStyle: 'italic', marginTop: '0.2rem' }}>
                          🚫 Este artículo no admite grabado personalizado
                        </small>
                      )}
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: '1rem', borderTop: '1px dashed #334155', paddingTop: '0.8rem' }}>
                  {!cuponAplicado ? (
                    <form onSubmit={aplicarCupon} style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        type="text"
                        placeholder="Introduce tu código..."
                        value={codigoCupon}
                        onChange={(e) => {
                          setCodigoCupon(e.target.value);
                          if (errorCupon) setErrorCupon('');
                        }}
                        className="comanda-custom-input"
                        style={{ flex: 1 }}
                      />
                      <button 
                        type="submit" 
                        style={{ background: '#0284c7', color: '#fff', border: 'none', borderRadius: '4px', padding: '0.4rem 0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        Aplicar
                      </button>
                    </form>
                  ) : (
                    <div className="aviso-descuento-grabado" style={{ justifyContent: 'space-between' }}>
                      <span>🎉 Cupón <strong>{cuponAplicado.codigo}</strong> aplicado (-10%)</span>
                      <button 
                        onClick={() => setCuponAplicado(null)} 
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  {errorCupon && <small style={{ color: '#f87171', display: 'block', marginTop: '0.3rem', fontSize: '0.78rem' }}>{errorCupon}</small>}
                </div>

                <div className="comanda-total-container">
                  <span className="comanda-total-label">Total a abonار</span>
                  <div style={{ textAlign: 'right' }}>
                    {cuponAplicado && (
                      <div style={{ textDecoration: 'line-through', color: '#94a3b8', fontSize: '0.9rem' }}>
                        {subtotalSinCupon.toFixed(2)} €
                      </div>
                    )}
                    <span className="comanda-total-monto">{totalConDescuento} €</span>
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

      {/* Modal Detalle / Galería Estilo Amazon */}
      <DetalleProductoModal
        producto={productoSeleccionado}
        alCerrar={() => setProductoSeleccionado(null)}
        alAgregar={agregarAlCarrito}
      />
    </div>
  );
}