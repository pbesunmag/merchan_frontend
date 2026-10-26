import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom Hook para sincronización periódica (polling) en segundo plano.
 * @param {Function} consultaFn - Función asíncrona que recibe (silencioso: boolean)
 * @param {number} intervaloMs - Tiempo entre peticiones en ms (por defecto 4000)
 */
export function usePollingPedidos(consultaFn, intervaloMs = 4000) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fnRef = useRef(consultaFn);

  useEffect(() => {
    fnRef.current = consultaFn;
  }, [consultaFn]);

  const ejecutarConsulta = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) setError(null);
      await fnRef.current(silencioso);
    } catch (err) {
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
    setError,
    recargar: (silencioso = false) => ejecutarConsulta(silencioso),
  };
}
