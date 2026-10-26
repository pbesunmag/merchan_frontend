# ⚡ Avengers Shop — Frontend HUD 🛡️

¡Hola y bienvenid@ al Frontend de **Avengers Shop**!  
Esta aplicación web actúa como la capa de presentación e interfaz interactiva (**Stark Logistics HUD**) para el motor backend desarrollado en el Proyecto I (`merchan_backend`). Ha sido construida con **React + JavaScript**, cuidando al máximo la experiencia de usuario, la reactividad en tiempo real y el diseño inspirado en las interfaces holográficas (*Heads-Up Display*) de Stark Industries.

---

## 📋 1. Descripción del Frontend

El frontend tiene como objetivo consumir la API REST expuesta por el backend de Avengers Shop, ofreciendo interfaces específicas para los distintos roles implícitos del sistema de tienda y comandas:

* **Terminal de Venta (Cliente):** Exploración del catálogo de merchandising, detección analítica del producto estrella, personalización de productos y emisión de pedidos.
* **Área de Preparación / Cocina (Operario de almacén):** Recepción de comandas, persistencia real del pago, empaquetado mediante checklist interactivo y gestión del flujo estricto de estados (`EstadoPedido`).
* **Pantalla de Recogida (Monitor público del local):** Visualización en vivo de los códigos de pedido en preparación y listos para retirar en mostrador con histórico de entregas.

Siguiendo una estricta separación de responsabilidades entre cliente y servidor, el frontend delega la lógica de negocio y la persistencia de datos (gestionada en MySQL / MySQL Workbench a través del backend) y se comunica exclusivamente consumiendo los endpoints y DTOs (`Page<ProductoDTO>`, `Page<PedidoDTO>`, `ProductoMasVendidoDTO`) expuestos por la API REST mediante llamadas HTTP (`fetch`) y canales WebSocket.

---

## 🖥️ 2. Vistas Implementadas

La navegación SPA (*Single Page Application*) se articula mediante `react-router-dom` en las siguientes vistas:

### 🛒 2.1. Vista Terminal (`/terminal`)
Orientada al cliente final en el punto de venta para la creación de pedidos:
* **Catálogo conectado a `Page<ProductoDTO>`:** Muestra los artículos activos con imagen, descripción, precio unitario y estado de stock sincronizado en tiempo real vía WebSocket (*En stock*, *¡Últimas unidades!*, *Agotado*).
* **Insignia Holográfica `⭐ TOP VENTAS`:** Integración analítica directa con el backend para identificar el artículo con mayor volumen acumulado de unidades vendidas y destacarlo automáticamente en el catálogo con un pulso dorado Stark.
* **Buscador y filtros dinámicos:** Filtrado instantáneo por coincidencia de texto (nombre, personaje o descripción) y por categorías (`TODOS`, `CAMISETAS`, `TAZAS`, `GORRAS`, `FIGURAS`, `⚡ PERSONALIZABLES`).
* **Selección de tallas, galería y Guía Stark (`DetalleProductoModal`):**
  * Modal interactivo para visualizar el producto al detalle, comprobar stock por talla en vivo consultando al backend y elegir talla (`S`, `M`, `L`, `XL`) en artículos textiles.
  * **Botón interactivo "📏 Guía Stark":** Acceso directo en el selector de tallas que abre la ficha técnica `tallas.jpg` (ubicada en la galería de camisetas) en una nueva pestaña/ventana independiente del navegador.
* **Drawer de Comanda Activa (Carrito):**
  * Añadir, modificar unidades (respetando el tope máximo de stock disponible) y eliminar productos o vaciar la cesta.
  * Inclusión de texto personalizado (grabado) en los artículos que lo admiten (`personalizable = "Sí"` / `true`), aplicando la promoción de apertura.
  * Soporte para códigos promocionales de sesión (`STARK10`, `GROOT5`) y visualización desglosada del total del pedido.
* **Holograma de Confirmación con Auto-Scroll:** Al pulsar *"⚡ Confirmar Suministros"*, la interfaz realiza un desplazamiento superior suave automático (`window.scrollTo({ top: 0, behavior: 'smooth' })`) y proyecta el código único autogenerado por el backend (ej. `AV-1014`) para el seguimiento inmediato en mostrador.

### 📦 2.2. Vista Preparación / Cocina (`/preparacion`)
Tablero Kanban para la gestión operativa de comandas con sincronización periódica automática (polling cada 4 segundos):
1. **Nuevos pedidos (`CREADO`):** Lista los pedidos entrantes con su código, total de unidades (uds.), desglose de líneas (`PedidoProducto`), talla seleccionada, texto de grabado e insignia de alerta `⚡ REQUIERE GRABADO`. 
   * **Persistencia Real de Pago:** La acción `💳 Pago Aceptado` emite un `PATCH` real hacia el backend persistiendo la transición al estado `PAGO_ACEPTADO` antes de iniciar la manufactura.
2. **En proceso (`EN_PREPARACION`):** Incluye un checklist interactivo por cada línea de producto (permite tachar y marcar con ✅ cada artículo conforme se empaqueta), botón para revertir operativamente a `CREADO` o avanzar a `PEDIDO_LISTO`.
3. **Listos en mostrador (`PEDIDO_LISTO`):** Comandas terminadas listas para entrega. Permite revertir a `EN_PREPARACION` o registrar la entrega definitiva al cliente (`ENTREGADO`).
* **Blindaje de la Máquina de Estados:** Validación bidireccional coordinada con el backend; si se intenta un salto no autorizado, el sistema captura el código HTTP `400 Bad Request` y preserva la consistencia visual.
* **Controles adicionales:** Buscador multicriterio (por código, nombre de producto, talla o texto de grabado), filtro exclusivo `⚡ Solo con grabado`, modal de seguridad para cancelar pedidos (`CANCELADO`) y notificaciones flotantes (*Stark Toasts*) en cada transición.

### 📢 2.3. Vista Pantalla de Recogida (`/pantalla`)
Monitor público de sala diseñado con estética HUD de alto contraste:
* **Columna En Preparación (`EN_PREPARACION`):** Muestra los códigos de pedidos que están siendo ensamblados en taller/almacén.
* **Columna Listo para Recoger (`PEDIDO_LISTO`):** Destaca el código de pedido con tipografía de gran formato para que el cliente acuda a ventanilla.
* **Funcionalidades de monitor:** Reloj central en tiempo real, botón de Pantalla Completa (*Fullscreen API*), buscador de código con limpieza rápida mediante tecla `Esc` y barra inferior (*Ticker*) con el historial persistido de las últimas 5 entregas realizadas.

### 🎁 2.4. Vista Sorteos (`/sorteos`)
Sección promocional complementaria integrada en el enrutador de la tienda.

---

## 📌 3. Endpoints Consumidos

La comunicación HTTP se centraliza en `src/services/api.js` (`http://localhost:8080/api`) utilizando `fetch` nativo con captura centralizada de excepciones y se organiza por dominios en `productService.js`, `pedidoService.js` y `estadisticaService.js`:

| Método | Endpoint | Servicio Frontend | Descripción y Alineación con Backend |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/productos?size=20` | `productService.obtenerProductos()` | Obtiene la página de productos disponibles (`Page<ProductoDTO>`) para poblar el catálogo de la Terminal. |
| `GET` | `/api/productos/{id}/tallas` | `productService.obtenerTallas(id)` | Consulta en vivo el stock desglosado por talla (`S`, `M`, `L`, `XL`) en prendas textiles. |
| `POST` | `/api/pedidos` | `productService.crearPedido(terminalId)` | Inicia un nuevo pedido asociado a la entidad Terminal (`{ terminalId: 1 }`) devolviendo el Pedido en estado `CREADO` con su código autogenerado. |
| `POST` | `/api/pedidos/{pedidoId}/productos` | `productService.agregarProductoAPedido(...)` | Registra cada línea en `PedidoProducto` enviando `{ productoId, cantidad, textoPersonalizado, talla }`. |
| `GET` | `/api/pedidos?estado={estado}&size=50` | `pedidoService.obtenerPorEstado(estado)` | Consulta los pedidos según su `EstadoPedido` (`CREADO`, `EN_PREPARACION`, `PEDIDO_LISTO`) para Preparación y Recogida. |
| `PATCH` | `/api/pedidos/{pedidoId}/estado` | `pedidoService.actualizarEstado(id, estado)` | Actualiza el estado enviando `{ estadoPedido: nuevoEstado }` (`PAGO_ACEPTADO`, `EN_PREPARACION`, `PEDIDO_LISTO`, `ENTREGADO`, `CANCELADO`). |
| `GET` | `/api/estadisticas/producto-mas-vendido` | `estadisticaService.obtenerProductoMasVendido()` | Obtiene el `ProductoMasVendidoDTO` (ID, nombre y total de unidades) para activar la insignia `⭐ TOP VENTAS`. |
| `GET` | `/api/estadisticas/terminal-mas-utilizada` | `estadisticaService.obtenerTerminalMasUtilizada()` | Consulta analítica del punto de venta con mayor índice histórico de pedidos. |
| `WS` | `ws://localhost:8080/ws` (`/topic/productos-stock`) | `@stomp/stompjs` | Suscripción WebSocket nativa en `VistaTerminal.jsx` para refrescar el stock sin recargar la página ante variaciones de inventario. |

---

## 🔄 4. Flujo de Usuario y Estados (EstadoPedido)

El flujo de extremo a extremo entre las tres pantallas principales sigue fielmente las reglas de la máquina de estados blindada en el Backend:

```text
       [ CREADO ] -----------------------------------------------> [ CANCELADO ]
           │                                                               ▲
           ▼                                                               │
 [ CONFIRMACION_DE_PAGO ] ──► [ PAGO_ACEPTADO ]                            │
           │                          │                                    │
           └──────────────────────────┴─► [ EN_PREPARACION ] ──────────────┤
                                                │   ▲                      │
                                                ▼   │ (Revertir taller)    │
                                          [ PEDIDO_LISTO ] ────────────────┘
                                                │   ▲
                                                ▼   │ (Revertir mostrador)
                                          [ ENTREGADO / ENVIADO ]
```

1. **Creación en Terminal (`/terminal`):**
   * El cliente añade productos al carrito (seleccionando talla, consultando la "Guía Stark" si tiene dudas, o configurando el texto grabado).
   * Pulsa *"⚡ Confirmar Suministros"*; se ejecuta `POST /api/pedidos` seguido de `POST /api/pedidos/{id}/productos` por cada línea. La vista ejecuta un auto-scroll superior instantáneo y proyecta el código generado (ej. `AV-1015`). El pedido nace en estado `CREADO`.
2. **Recepción y Validación de Pago (`/preparacion`):**
   * El pedido aparece de inmediato en la columna *"Nuevos pedidos"* (`CREADO`).
   * El operario pulsa `💳 Pago Aceptado`, enviando una petición `PATCH` que persiste el estado `PAGO_ACEPTADO`.
   * A continuación, pulsa *"Iniciar Preparación"* (`PATCH` a `EN_PREPARACION`); en ese milisegundo el código del pedido ingresa en la columna *"EN PREPARACIÓN"* de la Pantalla de Recogida (`/pantalla`).
3. **Empaquetado y Puesta en Mostrador (`/preparacion` ➔ `/pantalla`):**
   * El operario verifica los artículos mediante el checklist interactivo y pulsa *"Marcar como Listo"* (`PATCH` a `PEDIDO_LISTO`).
   * La tarjeta pasa instantáneamente a la columna *"✅ LISTO PARA RECOGER"* de la Pantalla de Recogida.
4. **Entrega Final (`/preparacion`):**
   * Al entregar los artículos al cliente, el operario pulsa *"✓ Entregado al Cliente"* (`PATCH` a `ENTREGADO`).
   * El pedido sale de las columnas activas y se registra con su marca de tiempo en el Ticker inferior de *"ENTREGAS RECIENTES"*.

---

## 🛠️ 5. Tecnologías Utilizadas

* **React 18 (con Vite):** Biblioteca principal para la construcción de interfaces declarativas basadas en componentes funcionales.
* **JavaScript (ES6+):** Asincronía con `async/await`, `Promise.all` y gestión inmutable de estados.
* **React Hooks:** `useState`, `useEffect`, `useCallback`, `useMemo` y `useRef`.
* **React Router DOM (`react-router-dom`):** Enrutamiento SPA dinámico (`BrowserRouter`, `Routes`, `Route`, `NavLink`, `Navigate`).
* **Fetch API nativa:** Cliente HTTP centralizado para el consumo estricto de la API REST.
* **Librería `@stomp/stompjs`:** Conexión por WebSocket nativo (`ws://localhost:8080/ws`) suscrita a `/topic/productos-stock` para actualizaciones de inventario en tiempo real.
* **CSS3 Modular (Stark HUD Design):** Enfoque Mobile-First, variables CSS, Flexbox, CSS Grid y animaciones de resplandor (*keyframes glow*) sin dependencias de frameworks CSS externos.

---

## 🏗️ 6. Estructura del Proyecto

```text
merchan_frontend/
├── public/                              # Archivos estáticos globales e imágenes del catálogo
│   ├── imagenes/
│   │   ├── camisetas/
│   │   │   ├── spiderman/
│   │   │   │   ├── azul.jpg
│   │   │   │   └── roja.jpg
│   │   │   ├── america.jpg
│   │   │   ├── avengers.jpg
│   │   │   ├── marvel.jpg
│   │   │   ├── miles_morales.jpg
│   │   │   └── tallas.jpg               # Ficha técnica visual consumida por la Guía Stark
│   │   ├── figuras/
│   │   ├── gorras/
│   │   └── tazas/
│   ├── icono_groot.png
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                          # Logotipos y recursos vectoriales
│   ├── components/                      # Componentes desacoplados de UI y vistas
│   │   ├── layout/                      # Navbar, Footer, BannerSuperior, BannerSlider
│   │   ├── DetalleProductoModal/        # Selector de talla, grabado y botón Guía Stark
│   │   ├── pages/                       # Vistas principales asociadas a rutas
│   │   │   ├── PantallaRecogida/
│   │   │   ├── VistaPreparacion/
│   │   │   ├── VistaSorteos/
│   │   │   └── VistaTerminal/           # Catálogo, insignia TOP VENTAS y carrito
│   │   └── ui/                          # BotonScrollTop, ModalInformacion, ReactorLoader
│   ├── services/                        # Capa de comunicación REST desacoplada
│   │   ├── api.js                       # Cliente fetch base y captura centralizada de errores
│   │   ├── estadisticaService.js        # Consumo de analítica de ventas y ranking
│   │   ├── pedidoService.js             # Gestión de pedidos y máquina de estados
│   │   └── productService.js            # Consulta de catálogo, stock y checkout
│   ├── App.css                          # Estilos globales y HUD layout
│   ├── App.jsx                          # Enrutador principal de la aplicación
│   ├── index.css                        # Estilos de reseteo general
│   └── main.jsx                         # Entrada raíz de montaje de React DOM
├── package.json
├── README.md
└── vite.config.js
```

---

## 🛡️ 7. Manejo de Errores

El frontend se acopla de manera resiliente al `GlobalExceptionHandler` (`@RestControllerAdvice`) del Backend:
* **Captura centralizada en `api.js`:** Intercepta cualquier código de error HTTP (`400 Bad Request`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`). Extrae el mensaje estructurado enviado por el servidor (`message`, `mensaje`, `error` o campos validados por `@Valid`) y lanza un `Error` descriptivo.
* **Control de Integridad Referencial (`IntegridadReferencialException` - 409):** Si se intenta eliminar o alterar una entidad con claves foráneas dependientes activas en base de datos, el cliente captura el mensaje amigable evitando bloqueos silenciosos.
* **Detección de servidor no disponible:** Si el backend en el puerto `8080` no responde, el frontend informa al usuario que compruebe la disponibilidad del servicio.
* **Protección transaccional de la cesta en UI:** En `VistaTerminal`, la comanda no se limpia hasta que el backend confirma satisfactoriamente la creación del pedido y la inserción de todas sus líneas de detalle.
* **Resiliencia en analítica:** Si `/api/estadisticas/producto-mas-vendido` responde `204 No Content` (al no haber ventas previas en base de datos), la terminal renderiza el catálogo con total normalidad sin romper la interfaz.

---

## ⚙️ 8. Cómo Ejecutar la Aplicación

### Requisitos Previos

1. **Clonar e iniciar el Backend (`merchan_backend`):**  
   Este frontend depende de la API REST de Spring Boot. Asegúrate de tener corriendo el backend en `http://localhost:8080`:
   ```bash
   git clone git@github.com:pbesunmag/merchan_backend.git
   cd merchan_backend
   ./mvnw spring-boot:run
   ```
2. **Puesta a punto de la Base de Datos (MySQL 8.0+):**  
   Para evitar errores de claves foráneas y activar de inmediato la insignia holográfica `⭐ TOP VENTAS` en el catálogo, ejecuta este script en MySQL Workbench sobre el esquema `merchan_backend`:

   ```sql
   -- =============================================================================
   -- AVENGERS SHOP - SCRIPT AUTOSUFICIENTE DE PUESTA A PUNTO Y VENTAS
   -- Motor: MySQL 8.0+ | Esquema: merchan_backend
   -- =============================================================================
   USE merchan_backend;

   -- 1. Desactivar temporalmente el modo seguro para permitir limpieza inicial
   SET SQL_SAFE_UPDATES = 0;

   -- 2. Asegurar que existe la terminal física 1 (evita error de FK en pedidos)
   INSERT INTO terminales (id, nombre)
   VALUES (1, 'Terminal Principal Mostrador')
   ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

   -- 3. Asegurar que existe al menos un pedido entregado
   INSERT INTO pedidos (id, codigo, estado, terminal_id, fecha_creacion, fecha_actualizacion)
   VALUES (1001, 'AV-1001', 'ENTREGADO', 1, NOW(), NOW())
   ON DUPLICATE KEY UPDATE estado = VALUES(estado);

   -- 4. Vaciar líneas de prueba anteriores
   DELETE FROM pedido_producto;

   -- 5. Reactivar el modo seguro
   SET SQL_SAFE_UPDATES = 1;

   -- 6. Insertar 25 unidades vendidas para el producto estrella
   INSERT INTO pedido_producto (pedido_id, producto_id, cantidad, precio_unitario, talla, texto_personalizado)
   SELECT 
       (SELECT id FROM pedidos WHERE estado != 'CANCELADO' ORDER BY id ASC LIMIT 1),
       (SELECT id FROM productos ORDER BY id ASC LIMIT 1),
       25,
       (SELECT precio FROM productos ORDER BY id ASC LIMIT 1),
       'L',
       NULL;

   -- 7. Verificación del cálculo de analítica
   SELECT 
       pp.producto_id,
       p.nombre AS nombre_producto,
       SUM(pp.cantidad) AS total_unidades_vendidas
   FROM pedido_producto pp
   JOIN productos p ON pp.producto_id = p.id
   JOIN pedidos ped ON pp.pedido_id = ped.id
   WHERE ped.estado != 'CANCELADO'
   GROUP BY pp.producto_id, p.nombre
   ORDER BY total_unidades_vendidas DESC;
   ```

3. **Entorno Node.js:** Contar con Node.js (v18+ recomendado) y `npm`.

### Pasos de Instalación y Ejecución del Frontend

1. **Clonar el repositorio:**
   ```bash
   git clone git@github.com:pbesunmag/merchan_frontend.git
   cd merchan_frontend
   ```
2. **Instalar dependencias:**
   ```bash
   npm install
   ```
3. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
4. **Abrir en el navegador:**  
   Accede a `http://localhost:5173` y navega por los distintos módulos:
   * 🖥️ **Terminal de Venta:** `http://localhost:5173/terminal` *(comprueba la insignia `⭐ TOP VENTAS` y el botón `Guía Stark`)*
   * 📦 **Área de Preparación:** `http://localhost:5173/preparacion` *(comprueba la confirmación `💳 Pago Aceptado`)*
   * 📢 **Pantalla de Recogida:** `http://localhost:5173/pantalla`
   * 🎁 **Zona de Sorteos:** `http://localhost:5173/sorteos`

---

## 🔍 9. Suposiciones y Limitaciones

* **Sin autenticación de usuarios:** Siguiendo las directrices del proyecto, no se implementa login ni control por roles; todas las vistas son accesibles desde el menú superior para facilitar las pruebas continuas de extremo a extremo.
* **Terminal por Defecto:** La Terminal emite pedidos asociados a `terminalId = 1`. El script SQL provisto garantiza que dicho registro siempre esté presente en la base de datos.
* **Adaptación a DTOs paginados y directos:** Los servicios del frontend procesan con flexibilidad tanto respuestas envueltas en `Page<T>` de Spring (`response.content`) como arreglos planos (`response`).
* **Protocolo WebSocket Nativo:** Se prioriza el transporte directo por WebSocket nativo (`ws://...`) a través de `@stomp/stompjs` para evitar advertencias de compatibilidad de directivas (`Permissions-Policy: unload`) asociadas al emulador SockJS en versiones recientes de Chromium.
* **Arquitectura Extensible:** Gracias a la modularización de `estadisticaService.js`, `pedidoService.js` y `productService.js`, el frontend está preparado para expandir nuevas métricas comerciales o admitir transiciones de estado suplementarias sin modificar la capa visual.

---

## 👥 Autores y Créditos

Proyecto desarrollado en equipo con dedicación, ingeniería de software y pasión por los detalles:
* **Linneth Rodrigues** 🚀
* **Pol Bastida Gonzalez** ⚡