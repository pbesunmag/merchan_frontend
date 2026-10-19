import { useState, useEffect } from 'react';
import { productService } from '../../../services/productService';
import ReactorLoader from '../../ReactorLoader';
import './VistaTerminal.css';

export default function VistaTerminal() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pedidoFinalizado, setPedidoFinalizado] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let montado = true;

    const cargarCatalogo = async () => {
      try {
        const data = await productService.obtenerProductos();
        if (montado) {
          setProductos(data?.content || data || []);
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
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      return [...prev, { ...producto, cantidad: 1, textoPersonalizado: '' }];
    });
  };

  const actualizarTextoPersonalizado = (productoId, texto) => {
    setCarrito((prev) =>
      prev.map((item) =>
        item.id === productoId ? { ...item, textoPersonalizado: texto } : item
      )
    );
  };

  const calcularTotal = () => {
    return carrito
      .reduce((acc, item) => acc + (Number(item.precio) || 0) * item.cantidad, 0)
      .toFixed(2);
  };

  const finalizarPedido = async () => {
    if (carrito.length === 0) return;

    try {
      setLoading(true);
      const nuevoPedido = await productService.crearPedido(1);

      for (const item of carrito) {
        await productService.agregarProductoAPedido(nuevoPedido.id, {
          productoId: item.id,
          cantidad: item.cantidad,
          textoPersonalizado: item.textoPersonalizado,
        });
      }

      setPedidoFinalizado(nuevoPedido?.codigo || `AV-${nuevoPedido?.id || 1}`);
      setCarrito([]);
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

  return (
    <div className="terminal-layout">
      {/* Catálogo de Productos */}
      <section className="catalogo-section">
        <h2>Catálogo de Equipamiento</h2>
        {error && <p style={{ color: '#ef4444' }}>{error}</p>}

        <div className="productos-grid">
          {productos.map((prod) => (
            <article key={prod.id} className="producto-card">
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
          ))}
        </div>
      </section>

      {/* Comanda Lateral */}
      <aside className="carrito-section">
        <h2>Comanda Activa</h2>
        {carrito.length === 0 ? (
          <p className="carrito-vacio">No has seleccionado suministros.</p>
        ) : (
          <>
            <ul className="comanda-items">
              {carrito.map((item) => (
                <li key={item.id} className="comanda-item">
                  <div className="comanda-item-header">
                    <span>
                      <strong className="comanda-item-cant">{item.cantidad}x</strong>
                      {item.nombre}
                    </span>
                    <span className="comanda-item-subtotal">
                      {((Number(item.precio) || 0) * item.cantidad).toFixed(2)} €
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Grabado / texto personalizado..."
                    value={item.textoPersonalizado}
                    onChange={(e) => actualizarTextoPersonalizado(item.id, e.target.value)}
                    className="comanda-custom-input"
                  />
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
  );
}