import { useState } from 'react';
import './FormularioSoporte.css';

export default function FormularioSoporte() {
  const [nombre, setNombre] = useState('');
  const [asunto, setAsunto] = useState('');
  const [numeroTicket, setNumeroTicket] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [errores, setErrores] = useState({});

  const manejarEnvio = (e) => {
    e.preventDefault();
    const nuevosErrores = {};

    if (!nombre.trim()) {
      nuevosErrores.nombre = '⚠️ Identificación requerida: introduce tu nombre o alias.';
    }
    if (!asunto.trim()) {
      nuevosErrores.asunto = '⚠️ Especifica el motivo de la transmisión.';
    }
    if (!mensaje.trim()) {
      nuevosErrores.mensaje = '⚠️ El cuerpo del mensaje no puede estar vacío.';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});
    setEnviado(true);
  };

  const reiniciarFormulario = () => {
    setNombre('');
    setAsunto('');
    setNumeroTicket('');
    setMensaje('');
    setErrores({});
    setEnviado(false);
  };

  return (
    <section id="soporte" className="soporte-section formulario-soporte-container">
      <div className="soporte-box-hud">
        <div className="soporte-header">
          <span className="soporte-tag">CANAL DIRECTO J.A.R.V.I.S.</span>
          <h2>Centro de Soporte y Consultas</h2>
          <p>Envía tu consulta o incidencia directamente a nuestra central sin salir de la terminal.</p>
        </div>

        {enviado ? (
          <div className="soporte-confirmacion">
            <div className="soporte-check-icono">✅</div>
            <h3>¡Transmisión recibida en la central Stark!</h3>
            <p>
              Hemos registrado tu consulta correctamente{numeroTicket.trim() ? ` asociada al ticket ${numeroTicket.trim()}` : ''}. Nuestro equipo de soporte te responderá a la mayor brevedad.
            </p>
            <button
              type="button"
              className="btn-nueva-consulta"
              onClick={reiniciarFormulario}
            >
              Enviar otra consulta
            </button>
          </div>
        ) : (
          <form className="soporte-form" onSubmit={manejarEnvio} noValidate>
            <div className="soporte-grid-campos">
              <div className="soporte-campo">
                <label htmlFor="soporte-nombre">Nombre *</label>
                <input
                  id="soporte-nombre"
                  type="text"
                  className={errores.nombre ? 'input-error-hud' : ''}
                  placeholder="Tu nombre o alias de agente"
                  value={nombre}
                  onChange={(e) => {
                    setNombre(e.target.value);
                    if (errores.nombre) setErrores({ ...errores, nombre: null });
                  }}
                />
                {errores.nombre && (
                  <span className="soporte-error-msg">{errores.nombre}</span>
                )}
              </div>

              <div className="soporte-campo">
                <label htmlFor="soporte-asunto">Asunto *</label>
                <input
                  id="soporte-asunto"
                  type="text"
                  className={errores.asunto ? 'input-error-hud' : ''}
                  placeholder="Motivo de la consulta"
                  value={asunto}
                  onChange={(e) => {
                    setAsunto(e.target.value);
                    if (errores.asunto) setErrores({ ...errores, asunto: null });
                  }}
                />
                {errores.asunto && (
                  <span className="soporte-error-msg">{errores.asunto}</span>
                )}
              </div>
            </div>

            <div className="soporte-campo">
              <label htmlFor="soporte-ticket">Número de ticket / pedido (Opcional)</label>
              <input
                id="soporte-ticket"
                type="text"
                placeholder="Ej. AV-1024 / Solo si aplica a una incidencia"
                value={numeroTicket}
                onChange={(e) => setNumeroTicket(e.target.value)}
              />
            </div>

            <div className="soporte-campo">
              <label htmlFor="soporte-mensaje">Mensaje / Consulta *</label>
              <textarea
                id="soporte-mensaje"
                rows="4"
                className={errores.mensaje ? 'input-error-hud' : ''}
                placeholder="Describe detalladamente tu duda o incidencia..."
                value={mensaje}
                onChange={(e) => {
                  setMensaje(e.target.value);
                  if (errores.mensaje) setErrores({ ...errores, mensaje: null });
                }}
              />
              {errores.mensaje && (
                <span className="soporte-error-msg">{errores.mensaje}</span>
              )}
            </div>

            <button type="submit" className="btn-enviar-transmision">
              ⚡ Enviar Transmisión
            </button>
          </form>
        )}
      </div>
    </section>
  );
}