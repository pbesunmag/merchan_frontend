import { useState } from 'react';

export default function Miniatura({ src, alt }) {
  const [fallo, setFallo] = useState(false);
  if (!src || fallo) {
    return (
      <span className="postventa-miniatura postventa-miniatura-icono" aria-hidden="true">
        🛍️
      </span>
    );
  }
  return (
    <img
      className="postventa-miniatura"
      src={src}
      alt={alt}
      onError={() => setFallo(true)}
    />
  );
}
