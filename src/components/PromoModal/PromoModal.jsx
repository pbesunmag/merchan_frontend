import { useState } from 'react';
import './PromoModal.css';

export default function PromoModal() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="promo-overlay">
      <div className="promo-modal">
        <button className="btn-cerrar-modal" onClick={() => setVisible(false)}>
          ✕
        </button>
        <div className="promo-badge">¡OFERTA ESPECIAL!</div>
        <h2>⭐ ESPECIAL APERTURA ⭐</h2>
        <p className="promo-subtitulo">
          Descuento exclusivo en personalización para tu equipamiento
        </p>
        <div className="promo-detalles">
          <p>
            Al solicitar grabado personalizado en productos de las categorías:
          </p>
          <div className="promo-categorias">
            <span>☕ Tazas</span>
            <span>👕 Camisetas</span>
            <span>🧢 Gorras</span>
          </div>
          <p className="promo-destacado">
            ¡Obtén un <strong>precio rebajado especial por nuestra apertura</strong> en tu grabado!
          </p>
        </div>
        <button className="btn-entendido" onClick={() => setVisible(false)}>
          ¡ENTENDIDO, IR A LA TIENDA!
        </button>
      </div>
    </div>
  );
}