import { useState, useEffect, useCallback } from 'react';
import { cajaService } from '../../services/cajaService';
import { descargarInformeCompleto } from '../../services/informeService';
import { formatearMoneda } from '../../utils/formatoUtils';
import './PanelMetricas.css';

const SALDO_INICIAL_CAJA = 500;

const PERIODOS = [
  { id: 'HOY', etiqueta: 'HOY', informe: 'dia' },
  { id: 'MES', etiqueta: 'ESTE MES', informe: 'mes' },
  { id: 'ANIO', etiqueta: 'ESTE AÑO', informe: 'anio' },
];

export default function PanelMetricas({ alCerrar }) {
  const [periodo, setPeriodo] = useState('HOY');
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState(null);

  const cargar = useCallback(async () => {
    try {
      const datos = await cajaService.obtenerMetricas(periodo);
      setError(null);
      setMetricas(datos);
    } catch (err) {
      setMetricas(null);
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }, [periodo]);

  useEffect(() => {
    const id = setTimeout(cargar, 0);
    return () => clearTimeout(id);
  }, [cargar]);

  const exportarCSV = async () => {
    setExportando(true);
    setError(null);
    try {
      await descargarInformeCompleto(PERIODOS.find((p) => p.id === periodo)?.informe);
    } catch (err) {
      setError(err.message);
    } finally {
      setExportando(false);
    }
  };

  const ingresos = Number(metricas?.totalIngresosVentas ?? metricas?.ingresos ?? metricas?.ingresosVentas) || 0;
  const reembolsos = Number(metricas?.totalReembolsos ?? metricas?.reembolsos) || 0;
  const beneficio = Number(metricas?.beneficioNeto ?? metricas?.beneficio ?? ingresos - reembolsos);
  const balance = Number(metricas?.balance ?? metricas?.balanceCaja ?? beneficio);
  const saldoCaja =
    metricas?.saldoActualCaja != null
      ? Number(metricas.saldoActualCaja)
      : SALDO_INICIAL_CAJA + balance;

  const tarjetas = [
    { icono: '💰', titulo: 'Saldo de Caja', valor: saldoCaja, clase: 'saldo' },
    { icono: '📈', titulo: 'Ingresos por ventas', valor: ingresos, clase: 'ingresos' },
    { icono: '📉', titulo: 'Reembolsos emitidos', valor: reembolsos, clase: 'reembolsos' },
    { icono: '⚡', titulo: 'Beneficio Neto', valor: beneficio, clase: 'beneficio' },
  ];

  return (
    <div className="metricas-overlay" onClick={alCerrar}>
      <div className="metricas-panel" onClick={(e) => e.stopPropagation()}>
        <div className="metricas-header">
          <h3>🔒 Métricas de Control</h3>
          <button type="button" className="metricas-cerrar" onClick={alCerrar} title="Cerrar">
            ✕
          </button>
        </div>

        <div className="metricas-tabs">
          {PERIODOS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`metricas-tab ${periodo === p.id ? 'activo' : ''}`}
              onClick={() => {
                setCargando(true);
                setPeriodo(p.id);
              }}
            >
              {p.etiqueta}
            </button>
          ))}
        </div>

        {error && <div className="metricas-error">{error}</div>}

        <div className={`metricas-grid ${cargando ? 'cargando' : ''}`}>
          {tarjetas.map((t) => (
            <div key={t.titulo} className={`metricas-card ${t.clase}`}>
              <span className="metricas-card-icono">{t.icono}</span>
              <span className="metricas-card-titulo">{t.titulo}</span>
              <strong className="metricas-card-valor">
                {cargando ? '...' : formatearMoneda(t.valor)}
              </strong>
            </div>
          ))}
        </div>

        <p className="metricas-nota">
          Saldo = {formatearMoneda(SALDO_INICIAL_CAJA)} iniciales + balance del periodo.
        </p>

        <button
          type="button"
          className="metricas-exportar"
          onClick={exportarCSV}
          disabled={exportando}
        >
          {exportando ? 'Generando...' : '📥 Exportar Informe CSV'}
        </button>
      </div>
    </div>
  );
}
