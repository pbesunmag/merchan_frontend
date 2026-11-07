import { obtenerCodigoPedido } from "../../../utils/formatoUtils";
import {
  obtenerLineasPedido,
  tieneGrabadoPersonalizado,
  calcularTotalUnidades,
  estaPagoAceptado,
} from "./pedidoUtils";

// Línea de producto con talla, variante elegida y grabado, para que el operario sepa qué preparar.
function LineaPedido({ linea, checklist, completada, alAlternar }) {
  const contenido = (
    <>
      <div className="linea-principal">
        <span>
          {checklist && (
            <span className="check-icono">{completada ? "✅" : "⬜"}</span>
          )}
          <strong>{linea.cantidad}x</strong>{" "}
          {linea.productoNombre || `Producto #${linea.productoId}`}
        </span>
        {linea.variante && (
          <span
            className="badge-variante-prep"
            title="Variante elegida por el cliente"
          >
            🎨 {linea.variante}
          </span>
        )}
        {linea.talla && (
          <span className="badge-talla-prep">Talla {linea.talla}</span>
        )}
      </div>
      {linea.textoPersonalizado && (
        <div className="linea-personalizado">
          ✏️ "{linea.textoPersonalizado}"
        </div>
      )}
    </>
  );

  if (!checklist) {
    return <li className="linea-item">{contenido}</li>;
  }

  return (
    <li
      className={`linea-item linea-checklist ${completada ? "completada" : ""}`}
      onClick={alAlternar}
      title="Haz clic para marcar como preparado"
    >
      {contenido}
    </li>
  );
}

// Tarjeta individual de pedido: cabecera con badges, líneas y botones de transición de estado.
// `tipo` indica la columna: "creados" | "proceso" | "listos".
export default function PedidoCard({
  pedido,
  tipo,
  lineasCompletadas,
  alAlternarLinea,
  alCancelar,
  alPedirPago,
  alCambiarEstado,
  alRevertirACreado,
  alRevertirAEnProceso,
  alEntregar,
}) {
  const totalUds = calcularTotalUnidades(pedido);
  const esPersonalizado = tieneGrabadoPersonalizado(pedido);
  const pagoAceptado = estaPagoAceptado(pedido);
  const codigoPedido = obtenerCodigoPedido(pedido);
  const esProceso = tipo === "proceso";

  return (
    <article className="pedido-card">
      <div className="pedido-card-header">
        <span className="pedido-codigo">{codigoPedido}</span>
        <div className="pedido-header-badges">
          {esPersonalizado && (
            <span
              className="badge-grabado-alerta"
              title="Este pedido incluye artículos personalizados"
            >
              ⚡ REQUIERE GRABADO
            </span>
          )}
          <span className="badge-unidades" title="Total de artículos">
            📦 {totalUds} {totalUds === 1 ? "ud." : "uds."}
          </span>
          <button
            type="button"
            className="btn-cancelar-pedido"
            onClick={() => alCancelar(pedido)}
            title="Cancelar pedido"
          >
            ✕
          </button>
        </div>
      </div>

      <ul className="lineas-list">
        {obtenerLineasPedido(pedido).map((linea, idx) => (
          <LineaPedido
            key={linea.id || idx}
            linea={linea}
            checklist={esProceso}
            completada={!!lineasCompletadas?.[`${pedido.id}-${idx}`]}
            alAlternar={() => alAlternarLinea?.(pedido.id, idx)}
          />
        ))}
      </ul>

      <div className="pedido-acciones-fila">
        {tipo === "creados" && (
          <>
            <button
              type="button"
              className={`btn-accion ${pagoAceptado ? "btn-pago-aceptado" : "btn-pago-ok"}`}
              onClick={() => !pagoAceptado && alPedirPago(pedido)}
              disabled={pagoAceptado}
              title={
                pagoAceptado
                  ? "El pago ya ha sido verificado"
                  : "Verificar estado del pago"
              }
            >
              {pagoAceptado ? "✓ Pago ya aceptado" : "💳 Pago Aceptado"}
            </button>
            <button
              type="button"
              className={`btn-accion btn-iniciar ${!pagoAceptado ? "btn-deshabilitado" : ""}`}
              onClick={() =>
                pagoAceptado &&
                alCambiarEstado(
                  pedido.id,
                  "EN_PREPARACION",
                  `🚀 Pedido ${codigoPedido} en preparación`,
                )
              }
              disabled={!pagoAceptado}
              title={
                !pagoAceptado
                  ? "Debe aceptar el pago antes de iniciar la preparación"
                  : "Iniciar preparación"
              }
            >
              Iniciar Preparación
            </button>
          </>
        )}

        {tipo === "proceso" && (
          <>
            <button
              type="button"
              className="btn-accion btn-revertir"
              onClick={() => alRevertirACreado(pedido.id, codigoPedido)}
              title="Devolver pedido a Nuevos pedidos"
            >
              ↩ Revertir
            </button>
            <button
              type="button"
              className="btn-accion btn-completar"
              onClick={() =>
                alCambiarEstado(
                  pedido.id,
                  "PEDIDO_LISTO",
                  `✨ Pedido ${codigoPedido} marcado como listo`,
                )
              }
            >
              Marcar como Listo
            </button>
          </>
        )}

        {tipo === "listos" && (
          <>
            <button
              type="button"
              className="btn-accion btn-revertir"
              onClick={() => alRevertirAEnProceso(pedido.id, codigoPedido)}
              title="Devolver pedido a En proceso"
            >
              ↩ Revertir
            </button>
            <button
              type="button"
              className="btn-accion btn-entregar"
              onClick={() => alEntregar(pedido)}
              title="Entregar pedido al cliente"
            >
              ✓ Entregado al Cliente
            </button>
          </>
        )}
      </div>
    </article>
  );
}
