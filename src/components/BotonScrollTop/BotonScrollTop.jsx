import { useState, useEffect } from 'react';
import './BotonScrollTop.css';

export default function BotonScrollTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const manejarScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', manejarScroll, { passive: true });
    manejarScroll();

    return () => {
      window.removeEventListener('scroll', manejarScroll);
    };
  }, []);

  const subirArriba = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      className={`btn-scroll-top-hud ${visible ? 'visible' : ''}`}
      onClick={subirArriba}
      aria-label="Volver arriba"
      title="Volver arriba"
    >
      ↑
    </button>
  );
}
