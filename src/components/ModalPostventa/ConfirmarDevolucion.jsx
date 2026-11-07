import { formatearMoneda, obtenerCodigoPedido } from '../../utils/formatoUtils';

// Diálogo de confirmación de reembolso (comanda completa o una línea).
export default function ConfirmarDevolucion({ devolucion, importe, procesando, alVolver, alConfirmar }) {
  return (
    <div className="modal-overlay postventa-overlay-confirmar" onClick={(e) => e.stopPropagation()}>
      <div className="modal-content">
        <h3>↩️ Confirmar Devolución</h3>
        <p>
          Pedido <strong>{obtenerCodigoPedido(devolucion.pedido)}</strong>.
          <br />
          {devolucion.linea ? (
            <>
              Devolver {devolucion.cantidad}x{' '}
              {devolucion.linea.productoNombre || `Producto #${devolucion.linea.productoId}`}
              {devolucion.linea.talla ? ` (Talla ${devolucion.linea.talla})` : ''}.
              <br />
            </>
          ) : null}
          Importe a reintegrar al cliente:{' '}
          <strong className="postventa-importe">{formatearMoneda(importe)}</strong>
        </p>
        <div className="modal-acciones">
          <button
            type="button"
            className="btn-modal btn-modal-secundario"
            onClick={alVolver}
            disabled={procesando}
          >
            Volver
          </button>
          <button
            type="button"
            className="btn-modal btn-modal-peligro"
            onClick={alConfirmar}
            disabled={procesando}
          >
            {procesando ? 'Procesando...' : 'Confirmar reembolso'}
          </button>
        </div>
      </div>
    </div>
  );
}
