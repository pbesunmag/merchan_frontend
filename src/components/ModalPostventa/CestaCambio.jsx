import { formatearMoneda } from '../../utils/formatoUtils';

// Cesta de sustitución: artículos que recibirá el cliente a cambio de los devueltos.
export default function CestaCambio({ cestaCambio, alQuitar }) {
  if (cestaCambio.length === 0) return null;

  return (
      <div
        style={{
          background: '#0f172a',
          border: '1px solid #334155',
          borderRadius: '6px',
          padding: '0.6rem',
          marginBottom: '0.75rem',
        }}
      >
        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 600 }}>
          🛒 Cesta de artículos de cambio ({cestaCambio.length}):
        </div>
        {cestaCambio.map((item, idx) => (
          <div
            key={`${item.productoId}-${item.talla || 'U'}-${idx}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.85rem',
              padding: '0.25rem 0',
              borderBottom: idx < cestaCambio.length - 1 ? '1px solid #1e293b' : 'none',
            }}
          >
            <span>
              <strong>{item.cantidad}x</strong> {item.nombre}
              {item.talla ? ` (Talla ${item.talla})` : ''} · {formatearMoneda(item.precio)}/ud.
            </span>
            <button
              type="button"
              onClick={() => alQuitar(idx)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                fontWeight: 'bold',
              }}
              title="Quitar artículo"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
  );
}
