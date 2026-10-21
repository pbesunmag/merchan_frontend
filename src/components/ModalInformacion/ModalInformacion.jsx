import { useState, useEffect, useRef } from 'react';
import './ModalInformacion.css';

const SECCIONES_INFO = {
  envios: {
    etiqueta: 'LOGÍSTICA STARK',
    titulo: 'Protocolo de Logística y Despliegue Stark',
    items: [
      {
        subtitulo: 'Transporte Quinjet Express (24-48h):',
        texto: 'Entrega estándar en la península mediante nuestra flota de suministro rápido por 4.95 € (gratuito en pedidos superiores a 70.00 €).'
      },
      {
        subtitulo: 'Seguimiento por Satélite Stark:',
        texto: 'Cada paquete incluye un localizador encriptado que permite rastrear la cápsula de suministros en tiempo real desde la salida del Complejo de Vengadores hasta tu base.'
      },
      {
        subtitulo: 'Empaquetado Blindado:',
        texto: 'Todos los suministros (figuras coleccionables, textiles y reactores) se envían en cajas reforzadas con sellos de seguridad térmicos a prueba de impactos.'
      }
    ]
  },
  cambios: {
    etiqueta: 'GARANTÍA J.A.R.V.I.S.',
    titulo: 'Garantía y Retorno de Equipamiento',
    items: [
      {
        subtitulo: 'Plazo de Retorno:',
        texto: 'Dispones de 30 días terrestres desde la recepción del cargamento para solicitar el cambio o devolución de cualquier artículo en su estado y embalaje original.'
      },
      {
        subtitulo: 'Piezas Personalizadas:',
        texto: 'Debido a la calibración láser única de nombres o insignias, los artículos con grabado personalizado solo admiten reemplazo en caso de defecto técnico de fábrica verificado por J.A.R.V.I.S.'
      },
      {
        subtitulo: 'Proceso Simplificado:',
        texto: 'Solicita la recogida a través de nuestro formulario de soporte indicando tu código de suministro (ej. AV-XXXX). Nuestro equipo logístico gestionará la etiqueta prepagada sin costes adicionales.'
      }
    ]
  },
  regalos: {
    etiqueta: 'RECOMPENSAS ACTIVAS',
    titulo: 'Protocolo de Recompensas y Cupones Activos',
    items: [
      {
        subtitulo: 'Cupón de Bienvenida:',
        texto: 'Código STARK10 para un 10% de descuento directo en cualquier pedido de equipamiento inicial.'
      },
      {
        subtitulo: 'Incentivo Guardián:',
        texto: 'Código GROOT5 aplicable para un 5% de descuento en la sección de figuras y réplicas.'
      },
      {
        subtitulo: 'Obsequio por Apertura:',
        texto: 'Todas las compras superiores a 50.00 € incluyen un pin metálico conmemorativo de Industrias Stark hasta agotar existencias de inventario.'
      }
    ]
  },
  afiliacion: {
    etiqueta: 'INICIATIVA VENGADORES',
    titulo: 'Red de Aliados e Iniciativa Vengadores',
    items: [
      {
        subtitulo: 'Únete a la Red:',
        texto: 'Si eres creador de contenido, divulgador del universo cósmico o gestionas una comunidad friki, puedes solicitar tu enlace de telemetría Stark.'
      },
      {
        subtitulo: 'Comisiones del 8% al 12%:',
        texto: 'Gana créditos por cada suministro confirmado a través de tus transmisiones o redes sociales.'
      },
      {
        subtitulo: 'Acceso Anticipado:',
        texto: 'Los miembros de la división Alpha reciben prototipos exclusivos y figuras coleccionables antes de su lanzamiento al catálogo general.'
      }
    ]
  },
  'aviso-legal': {
    etiqueta: 'NORMATIVA INTERGALÁCTICA',
    titulo: 'Marco Legal y Titularidad de la Plataforma',
    items: [
      {
        subtitulo: 'Titular del Servicio:',
        texto: 'Stark Industries Merchandising S.L., con NIF B-08242000 y sede operativa fijada en Av. Tony Stark 10880, Complejo Vengadores (Sector Malibú / Manresa).'
      },
      {
        subtitulo: 'Propiedad Intelectual:',
        texto: 'Los logotipos, armaduras, nombres y marcas registradas de personajes pertenecen a sus respectivos creadores y titulares de licencia. Avengers Shop opera como distribuidor autorizado de réplicas y merchandising oficial bajo normativa comunitaria.'
      }
    ]
  },
  condiciones: {
    etiqueta: 'CONTRATACIÓN STARK',
    titulo: 'Términos de Contratación y Suministro',
    items: [
      {
        subtitulo: 'Formalización del Pedido:',
        texto: 'La adquisición de equipamiento se formaliza en el momento en que se genera el código de transmisión en terminal (ej. AV-XXXX).'
      },
      {
        subtitulo: 'Métodos de Pago Aceptados:',
        texto: 'Tarjetas de crédito/débito internacionales, pasarelas encriptadas de alta seguridad StarkPay y transferencia bancaria directa.'
      },
      {
        subtitulo: 'Precios e Impuestos:',
        texto: 'Todos los precios expuestos en el catálogo incluyen el Impuesto sobre el Valor Añadido (IVA) vigente en territorio peninsular.'
      }
    ]
  },
  privacidad: {
    etiqueta: 'PROTOCOLO SHA-256',
    titulo: 'Tratamiento y Blindaje de Datos Personales',
    items: [
      {
        subtitulo: 'Protección de Datos:',
        texto: 'Cumplimiento estricto del RGPD europeo. Tus datos biométricos, credenciales y direcciones postales se almacenan en servidores aislados y encriptados bajo protocolo SHA-256.'
      },
      {
        subtitulo: 'Finalidad del Tratamiento:',
        texto: 'La información recabada se destina exclusivamente a la tramitación de pedidos, despacho de paquetes y comunicaciones del estado del suministro solicitadas por el usuario.'
      },
      {
        subtitulo: 'Derechos ARCO:',
        texto: 'Puedes solicitar el acceso, rectificación o eliminación total de tus registros contactando con el soporte en cualquier momento.'
      }
    ]
  },
  cookies: {
    etiqueta: 'TELEMETRÍA LOCAL',
    titulo: 'Protocolo de Balizas y Almacenamiento Local',
    items: [
      {
        subtitulo: 'Finalidad Técnica:',
        texto: 'Empleamos cookies técnicas esenciales y almacenamiento de sesión (sessionStorage) para mantener la memoria del carrito de compras, los cupones introducidos y evitar avisos emergentes repetitivos durante la navegación.'
      },
      {
        subtitulo: 'Analítica Interna:',
        texto: 'No comercializamos datos de navegación con corporaciones externas ni utilizamos rastreadores de telemetría de terceros.'
      }
    ]
  },
  'sobre-nosotros': {
    etiqueta: 'ARCHIVOS STARK',
    titulo: 'Nuestra Misión en el Complejo Vengadores',
    items: [
      {
        subtitulo: 'Nacimiento del Proyecto:',
        texto: 'Avengers Shop nace como la armería y tienda de coleccionismo definitiva para los fans del multiverso, creada con el propósito de acercar réplicas exactas, textiles de primera calidad y coleccionismo artesanal a los defensores de la Tierra.'
      },
      {
        subtitulo: 'Compromiso de Calidad:',
        texto: 'Cada pieza es sometida a estrictos controles de acabado, garantizando fidelidad estética, pintura detallada y durabilidad de exhibición.'
      }
    ]
  },
  'config-cookies': {
    etiqueta: 'PREFERENCIAS DE TERMINAL',
    titulo: 'Panel de Preferencias de Sesión',
    esConfigCookies: true,
    items: [
      {
        subtitulo: 'Cookies Técnicas y de Carrito:',
        texto: 'Obligatorias para el funcionamiento del terminal, cálculo de descuentos y retención de pedidos en curso.'
      },
      {
        subtitulo: 'Cookies de Personalización:',
        texto: 'Permiten guardar preferencias de tema visual y filtros predeterminados.'
      }
    ]
  }
};

export default function ModalInformacion({ seccionId, alCerrar }) {
  const [preferenciasInterfaz, setPreferenciasInterfaz] = useState(true);
  const [configGuardada, setConfigGuardada] = useState(false);
  const cuerpoRef = useRef(null);

  useEffect(() => {
    setConfigGuardada(false);
    if (cuerpoRef.current) {
      cuerpoRef.current.scrollTop = 0;
    }
  }, [seccionId]);

  if (!seccionId || !SECCIONES_INFO[seccionId]) return null;

  const info = SECCIONES_INFO[seccionId];

  const guardarConfigCookies = () => {
    setConfigGuardada(true);
  };

  return (
    <div className="modal-info-overlay" onClick={alCerrar}>
      <div className="modal-info-hud" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="modal-info-cerrar"
          onClick={alCerrar}
          aria-label="Cerrar ventana de información"
        >
          ✕
        </button>

        <div className="modal-info-header">
          <span className="modal-info-badge">{info.etiqueta}</span>
          <h2 className="modal-info-titulo">{info.titulo}</h2>
        </div>

        <div className="modal-info-cuerpo" ref={cuerpoRef}>
          <ul className="modal-info-lista">
            {info.items.map((item, idx) => (
              <li key={idx} className="modal-info-item">
                <strong className="modal-info-subtitulo">◈ {item.subtitulo}</strong>
                <p className="modal-info-texto">{item.texto}</p>
              </li>
            ))}
          </ul>

          {info.esConfigCookies && (
            <div className="cookies-panel-interactivo">
              <div className="cookie-toggle-row">
                <div className="cookie-toggle-info">
                  <strong>Esenciales: Siempre activas</strong>
                  <span>Requeridas para el carrito y sesión Stark</span>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="stark-checkbox-disabled"
                />
              </div>

              <div className="cookie-toggle-row">
                <div className="cookie-toggle-info">
                  <strong>
                    Preferencias de Interfaz: {preferenciasInterfaz ? 'Activadas' : 'Desactivadas'}
                  </strong>
                  <span>Recuerda filtros y ajustes visuales del HUD</span>
                </div>
                <button
                  type="button"
                  className={`stark-switch ${preferenciasInterfaz ? 'activo' : ''}`}
                  onClick={() => {
                    setPreferenciasInterfaz(!preferenciasInterfaz);
                    setConfigGuardada(false);
                  }}
                >
                  <span className="stark-switch-thumb" />
                </button>
              </div>

              <button
                type="button"
                className="btn-guardar-cookies"
                onClick={guardarConfigCookies}
              >
                ⚡ Guardar Configuración Stark
              </button>

              {configGuardada && (
                <div className="cookies-confirmacion">
                  ✅ Configuración de sesión actualizada y encriptada en la terminal.
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-info-footer">
          <button type="button" className="btn-entendido-stark" onClick={alCerrar}>
            Cerrar Transmisión
          </button>
        </div>
      </div>
    </div>
  );
}
