import { useState } from 'react';
import './PromoModal.css';

export default function PromoModal({ alCerrar }) {
  const [email, setEmail] = useState('');
  const [suscrito, setSuscrito] = useState(false);
  const [errorEmail, setErrorEmail] = useState('');

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!email || email.trim().length === 0) {
      setErrorEmail('⚠️ Por favor, introduce tu correo electrónico para recibir el descuento.');
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
            <h2>⚡ 10% DE DESCUENTO ⚡</h2>
            <p className="promo-subtitulo">
              Suscríbete a nuestra newsletter para recibir ofertas exclusivas y novedades de equipamiento Marvel
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
                ¡OBTENER MI DESCUENTO!
              </button>
            </form>

            <p className="newsletter-disclaimer">
              Al suscribirte aceptas recibir novedades sobre nuestros productos. Puedes darte de baja en cualquier momento.
            </p>
          </>
        ) : (
          <div className="newsletter-exito">
            <h2>¡BIENVENIDO A LA ALIANZA! 🎉</h2>
            <p className="promo-subtitulo">Tu código promocional de apertura es:</p>
            <div className="codigo-promo-destacado">STARK10</div>
            <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              Aplica este código en tu próxima compra para obtener un 10% de descuento adicional.
            </p>
            <button className="btn-newsletter" onClick={alCerrar}>
              ENTENDIDO
            </button>
          </div>
        )}
      </div>
    </div>
  );
}