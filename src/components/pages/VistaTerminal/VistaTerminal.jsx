import { useState, useEffect } from 'react';
import { productService } from '../../../services/productService';
import ReactorLoader from '../../ReactorLoader';
import PromoModal from '../../PromoModal/PromoModal';
import DetalleProductoModal from '../../DetalleProductoModal/DetalleProductoModal';
import './VistaTerminal.css';

export default function VistaTerminal() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pedidoFinalizado, setPedidoFinalizado] = useState(null);
  const [error, setError] = useState(null);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);

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

  const calcularTotal = () => {
    return carrito
      .reduce((acc, item) => acc + calcularPrecioUnidad(item), 0)
      .toFixed(2);
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
      {/* Modal Promocional Especial Apertura */}
      <PromoModal />

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
            const rutaFoto = prod.imagenUrl || prod.imagen_url || '/imagenes/camisetas/avengers.jpg';

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

                <div className="comanda-total-container">
                  <span className="comanda-total-label">Total a abonar</span>
                  <span className="comanda-total-monto">{calcularTotal()} €</span>
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