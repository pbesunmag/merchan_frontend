import { useState } from 'react';
import './FormularioSoporte.css';

export default function FormularioSoporte() {
  const [nombre, setNombre] = useState('');
  const [asunto, setAsunto] = useState('');
  const [numeroTicket, setNumeroTicket] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviado, setEnviado] = useState(false);

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!nombre.trim() || !asunto.trim() || !mensaje.trim()) return;
    setEnviado(true);
  };

  const reiniciarFormulario = () => {
    setNombre('');
    setAsunto('');
    setNumeroTicket('');
    setMensaje('');
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
          <form className="soporte-form" onSubmit={manejarEnvio}>
            <div className="soporte-grid-campos">
              <div className="soporte-campo">
                <label htmlFor="soporte-nombre">Nombre *</label>
                <input
                  id="soporte-nombre"
                  type="text"
                  required
                  placeholder="Tu nombre o alias de agente"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className="soporte-campo">
                <label htmlFor="soporte-asunto">Asunto *</label>
                <input
                  id="soporte-asunto"
                  type="text"
                  required
                  placeholder="Motivo de la consulta"
                  value={asunto}
                  onChange={(e) => setAsunto(e.target.value)}
                />
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
                required
                placeholder="Describe detalladamente tu duda o incidencia..."
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
              />
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
