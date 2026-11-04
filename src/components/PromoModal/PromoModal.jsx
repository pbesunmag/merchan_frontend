import { useState } from 'react';
import './PromoModal.css';

export default function PromoModal({ alCerrar }) {
  const [email, setEmail] = useState('');
  const [suscrito, setSuscrito] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!email || email.trim().length === 0) {
      setErrorEmail('⚠️ Por favor, introduce tu correo electrónico para suscribirte.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setErrorEmail('⚠️ Por favor, introduce un correo electrónico válido (ejemplo@dominio.com).');
      return;
    }

    setErrorEmail('');
    setSuscrito(true);
  };

  return (
    <div className="promo-overlay" onClick={alCerrar}>
      <div className="promo-modal newsletter-modal" onClick={(e) => e.stopPropagation()}>
        <button className="btn-cerrar-modal" onClick={alCerrar} title="Cerrar ventana">
          ✕
        </button>

        {!suscrito ? (
          <>
            <div className="promo-badge">ÚNETE A LA ALIANZA STARK</div>
            <h2>⚡ BOLETÍN STARK DISPATCH ⚡</h2>
            <p className="promo-subtitulo">
              Suscríbete a nuestra newsletter para recibir alertas de reposición y novedades de equipamiento oficial Marvel
            </p>

            <form onSubmit={manejarEnvio} className="newsletter-form" noValidate>
              <input
                type="email"
                placeholder="introduce_tu_email@stark.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errorEmail) setErrorEmail('');
                }}
                className="newsletter-input"
              />

              {errorEmail && <div className="newsletter-error-mensaje">{errorEmail}</div>}

              <button type="submit" className="btn-newsletter">
                ¡UNIRME A LA ALIANZA!
              </button>
            </form>

            <p className="newsletter-disclaimer">
              Simulación de servicio Stark Dispatch. Al suscribirte aceptas recibir novedades sobre nuestros productos.
            </p>
          </>
        ) : (
          <div className="newsletter-exito">
            <h2>¡BIENVENIDO A LA ALIANZA! 🎉</h2>
            <p className="promo-subtitulo">
              [Simulación de servicio Stark Dispatch] Tu correo ha quedado registrado en las comunicaciones prioritarias:
            </p>
            <div className="codigo-promo-destacado">{email.trim()}</div>
            <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Explora nuestro catálogo oficial con grabado láser incluido sin sobrecoste en artículos personalizables.
            </p>
            <button className="btn-newsletter" onClick={alCerrar}>
              EXPLORAR CATÁLOGO
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
