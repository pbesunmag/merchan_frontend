import { formatearMoneda } from "../../../utils/formatoUtils";

// Cesta lateral de la comanda: líneas, ticket digital opcional, total y botón de checkout.
export default function ComandaSidebar({
  carrito,
  avisoStockId,
  errorVisible,
  totalFormateado,
  esPersonalizable,
  calcularPrecioUnidad,
  mostrarAlertaTopeStock,
  actualizarCantidad,
  actualizarTextoPersonalizado,
  eliminarDelCarrito,
  vaciarCarrito,
  cerrarError,
  alCerrar,
  alFinalizar,
  ticket,
}) {
  const {
    deseaTicketCorreo,
    setDeseaTicketCorreo,
    deseaTicketTelefono,
    setDeseaTicketTelefono,
    emailTicket,
    setEmailTicket,
    telefonoTicket,
    setTelefonoTicket,
    ticketConfirmado,
    errorTicket,
    setErrorTicket,
    manejarEnvioTicketManual,
    cancelarTicketConfirmado,
  } = ticket;

  return (
    <div
      className="carrito-overlay"
      onClick={() => alCerrar()}
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
                onClick={() => {
                  vaciarCarrito();
                  cancelarTicketConfirmado();
                }}
                title="Vaciar todos los artículos"
              >
                🗑️ Vaciar
              </button>
            )}
            <button
              type="button"
              className="btn-cerrar"
              onClick={() => alCerrar()}
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
                      <input
                        type="text"
                        placeholder="Grabado / texto personalizado (incluido)..."
                        value={item.textoPersonalizado}
                        onChange={(e) =>
                          actualizarTextoPersonalizado(
                            item.idUnico,
                            e.target.value,
                          )
                        }
                        className="comanda-custom-input"
                      />
                    ) : (
                      <small className="aviso-no-personalizable">
                        🚫 Este artículo no admite grabado personalizado
                      </small>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* SECCIÓN DE ENVÍO DE TICKET DIGITAL POR CORREO O TELÉFONO */}
            <div className="ticket-digital-contenedor">
              {!ticketConfirmado ? (
                <>
                  <span className="ticket-digital-titulo">
                    📩 ¿Deseas recibir tu ticket de compra?
                  </span>
                  <small
                    className="aviso-no-personalizable"
                    style={{ display: "block", marginBottom: "0.4rem" }}
                  >
                    ⚡ Simulación de servicio Stark Dispatch (sin envío real)
                  </small>
                  <div className="ticket-digital-checks">
                    <label className="ticket-check-label">
                      <input
                        type="checkbox"
                        checked={deseaTicketCorreo}
                        onChange={(e) => {
                          setDeseaTicketCorreo(e.target.checked);
                          setErrorTicket("");
                        }}
                      />
                      <span>📧 Correo electrónico</span>
                    </label>

                    <label className="ticket-check-label">
                      <input
                        type="checkbox"
                        checked={deseaTicketTelefono}
                        onChange={(e) => {
                          setDeseaTicketTelefono(e.target.checked);
                          setErrorTicket("");
                        }}
                      />
                      <span>📱 Número telefónico</span>
                    </label>
                  </div>

                  {(deseaTicketCorreo || deseaTicketTelefono) && (
                    <form
                      onSubmit={manejarEnvioTicketManual}
                      noValidate
                      className="ticket-digital-inputs"
                    >
                      {deseaTicketCorreo && (
                        <input
                          type="text"
                          placeholder="ejemplo@starkindustries.com"
                          value={emailTicket}
                          onChange={(e) => {
                            setEmailTicket(e.target.value);
                            if (errorTicket) setErrorTicket("");
                          }}
                          className="comanda-custom-input ticket-input-field"
                        />
                      )}

                      {deseaTicketTelefono && (
                        <input
                          type="text"
                          placeholder="Ej: +34 600 123 456"
                          value={telefonoTicket}
                          onChange={(e) => {
                            setTelefonoTicket(e.target.value);
                            if (errorTicket) setErrorTicket("");
                          }}
                          className="comanda-custom-input ticket-input-field"
                        />
                      )}

                      <button type="submit" className="btn-enviar-ticket">
                        📨 Solicitar envío de ticket
                      </button>
                    </form>
                  )}

                  {errorTicket && (
                    <div className="stark-error-ticket-hud">
                      <span>⚠️ {errorTicket}</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="ticket-confirmado-bloque">
                  <div className="ticket-confirmado-cabecera">
                    <span className="ticket-confirmado-badge">
                      ✅ Ticket solicitado (Simulación de servicio Stark Dispatch)
                    </span>
                    <button
                      type="button"
                      onClick={cancelarTicketConfirmado}
                      className="btn-quitar-cupon"
                      title="Modificar datos de envío"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="ticket-confirmado-datos">
                    {deseaTicketCorreo && emailTicket.trim() && (
                      <div className="ticket-dato-fijo">
                        <span>📧 Correo:</span>{" "}
                        <strong>{emailTicket.trim()}</strong>
                      </div>
                    )}
                    {deseaTicketTelefono && telefonoTicket.trim() && (
                      <div className="ticket-dato-fijo">
                        <span>📱 Teléfono:</span>{" "}
                        <strong>{telefonoTicket.trim()}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="comanda-total-container">
              <span className="comanda-total-label">Total a abonar</span>
              <div className="comanda-total-valores">
                <span className="comanda-total-monto">
                  {totalFormateado}&nbsp;€
                </span>
              </div>
            </div>

            <button
              className="btn-finalizar"
              onClick={alFinalizar}
            >
              ⚡ Confirmar Suministros
            </button>
          </>
        )}
      </aside>
    </div>
  );
}
