import { formatearMoneda } from '../../utils/formatoUtils';

// Resumen contable del cambio: crédito de lo entregado, total nuevo y diferencia en caja.
export default function ResumenContableCambio({
  cambioValido,
  nuevoProducto,
  requiereTalla,
  tallaElegida,
  diferenciaTotalCent,
  diferenciaTotal,
  totalNuevo,
  totalAntiguo,
}) {
  return (
          <div className="postventa-diferencia">
            {!cambioValido ? (
              nuevoProducto && requiereTalla && !tallaElegida
                ? 'Selecciona una talla con stock disponible'
                : 'Selecciona uno o varios productos para ver la diferencia'
            ) : diferenciaTotalCent === 0 ? (
              <strong className="postventa-importe">
                Cambio sin impacto económico en caja ({formatearMoneda(0)})
              </strong>
            ) : diferenciaTotalCent > 0 ? (
              <>
                Diferencia a abonar en caja:{' '}
                <strong className="postventa-importe">{formatearMoneda(diferenciaTotal)}</strong> (
                Nuevos: {formatearMoneda(totalNuevo)} − Entregados: {formatearMoneda(totalAntiguo)})
              </>
            ) : (
              <>
                Diferencia a reembolsar al cliente:{' '}
                <strong className="postventa-importe">
                  -{formatearMoneda(Math.abs(diferenciaTotal))}
                </strong>{' '}
                (Nuevos: {formatearMoneda(totalNuevo)} − Entregados: {formatearMoneda(totalAntiguo)})
              </>
            )}
          </div>
  );
}
