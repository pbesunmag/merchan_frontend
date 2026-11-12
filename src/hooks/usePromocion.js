import { useState, useEffect } from 'react';
import { obtenerPromocionActiva } from '../services/promocionService';

export default function usePromocion(promocionInicial) {
  const [promocionApi, setPromocionApi] = useState(null);
  const [loading, setLoading] = useState(!promocionInicial);

  useEffect(() => {
    if (promocionInicial) {
      return;
    }

    let montado = true;

    const cargarPromocion = async () => {
      try {
        setLoading(true);
        const data = await obtenerPromocionActiva();
        if (montado) {
          setPromocionApi(data || null);
        }
      } catch {
        if (montado) {
          setPromocionApi(null);
        }
      } finally {
        if (montado) {
          setLoading(false);
        }
      }
    };

    cargarPromocion();

    return () => {
      montado = false;
    };
  }, [promocionInicial]);

  const promocion = promocionInicial || promocionApi;

  return {
    promocion,
    loading,
    tieneDescuento: Boolean(
      promocion && promocion.activo !== false && Number(promocion.porcentajeDescuento) > 0
    ),
  };
}
