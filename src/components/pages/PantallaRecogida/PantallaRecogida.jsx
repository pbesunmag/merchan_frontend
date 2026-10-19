import { useState, useEffect } from 'react';
import { pedidoService } from '../../../services/pedidoService';
import ReactorLoader from '../../ReactorLoader';
import './PantallaRecogida.css';

export default function PantallaRecogida() {
  const [pedidosListos, setPedidosListos] = useState([]);
  const [pedidosEnProceso, setPedidosEnProceso] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let montado = true;

    const consultarPedidos = async () => {
      try {
        const [listosRes, procesoRes] = await Promise.all([
          pedidoService.obtenerPorEstado('PEDIDO_LISTO'),
          pedidoService.obtenerPorEstado('EN_PREPARACION'),
        ]);

        if (montado) {
          setPedidosListos(listosRes?.content || listosRes || []);
          setPedidosEnProceso(procesoRes?.content || procesoRes || []);
        }
      } catch (err) {
        console.error('Error al consultar pantalla de recogida:', err);
      } finally {
        if (montado) {
          setLoading(false);
        }
      }
    };

    consultarPedidos();
    const intervalo = setInterval(consultarPedidos, 4000);

    return () => {
      montado = false;
      clearInterval(intervalo);
    };
  }, []);

  if (loading) {
    return <ReactorLoader size={140} text="Conectando pantalla de recogida..." />;
  }

  return (
    <div className="pantalla-container">
      <header className="pantalla-header">
        <h1>Estado de Pedidos</h1>
        <p>Por favor, acércate al mostrador cuando aparezca tu número</p>
      </header>

      <div className="pantalla-grid">
        <section className="seccion-listos">
          <div className="seccion-titulo">
            <span>Listo para recoger</span>
            <span>{pedidosListos.length}</span>
          </div>

          {pedidosListos.length === 0 ? (
            <p className="sin-pedidos">No hay pedidos listos en este momento</p>
          ) : (
            <div className="codigos-grid">
              {pedidosListos.map((pedido) => (
                <div key={pedido.id} className="codigo-card-listo">
                  {pedido.codigo || `AV-${pedido.id}`}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="seccion-proceso">
          <div className="seccion-titulo">
            <span>En preparación</span>
            <span>{pedidosEnProceso.length}</span>
          </div>

          {pedidosEnProceso.length === 0 ? (
            <p className="sin-pedidos">Sin pedidos en cola</p>
          ) : (
            <div className="codigos-grid">
              {pedidosEnProceso.map((pedido) => (
                <div key={pedido.id} className="codigo-card-proceso">
                  {pedido.codigo || `AV-${pedido.id}`}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}