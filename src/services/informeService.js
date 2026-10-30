import { API_BASE_URL } from './api';

export const descargarInformeCompleto = async (periodo = 'dia') => {
  try {
    const response = await fetch(`${API_BASE_URL}/informes/ventas/completo?periodo=${periodo}`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Error al generar el informe');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Avengers_Ventas_${periodo}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  } catch (error) {
    console.error("Error descargando el informe:", error);
    alert("No se pudo descargar el informe de ventas.");
  }
};
