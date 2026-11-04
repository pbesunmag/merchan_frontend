import { requestBlob } from './api';

// GET /api/informes/ventas/completo?periodo={dia|mes|anio}
// Lanza un Error descriptivo si falla para que la vista lo muestre en su HUD.
export const descargarInformeCompleto = async (periodo = 'dia') => {
  const blob = await requestBlob(
    `/informes/ventas/completo?periodo=${encodeURIComponent(periodo)}`,
  );

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Avengers_Ventas_${periodo}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  a.remove();
};
