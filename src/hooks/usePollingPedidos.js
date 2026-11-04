import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom Hook para sincronización periódica (polling) en segundo plano.
 * Captura errores silenciosos de red y expone `isOffline: true` cuando el servidor deja de responder.
 * @param {Function} consultaFn - Función asíncrona que recibe (silencioso: boolean)
 * @param {number} intervaloMs - Tiempo entre peticiones en ms (por defecto 4000)
 */
export function usePollingPedidos(consultaFn, intervaloMs = 4000) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const fnRef = useRef(consultaFn);

  useEffect(() => {
    fnRef.current = consultaFn;
  }, [consultaFn]);

  const ejecutarConsulta = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) setError(null);
      await fnRef.current(silencioso);
      setIsOffline(false);
    } catch (err) {
      setIsOffline(true);
      if (!silencioso) {
        setError(err.message || 'Error de sincronización con el servidor central Stark');
      }
    } finally {
      if (!silencioso) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let montado = true;

    const iniciar = async () => {
      if (montado) {
        await ejecutarConsulta(false);
      }
    };

    iniciar();

    const intervalo = setInterval(() => {
      if (montado) {
        ejecutarConsulta(true);
      }
    }, intervaloMs);

    return () => {
      montado = false;
      clearInterval(intervalo);
    };
  }, [ejecutarConsulta, intervaloMs]);

  return {
    loading,
    error,
    isOffline,
    setError,
    recargar: (silencioso = false) => ejecutarConsulta(silencioso),
  };
}
