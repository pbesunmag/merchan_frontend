# ⚡ Avengers Shop — Frontend HUD 🛡️

[![React](https://img.shields.io/badge/React-18.x-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-6.x-CA4245.svg?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Spring Boot API](https://img.shields.io/badge/Backend_API-Spring_Boot_3-brightgreen.svg?style=for-the-badge&logo=springboot)](http://localhost:8080/doc/swagger-ui.html)

¡Hola y bienvenid@ al Frontend de **Avengers Shop**!  
Esta aplicación web actúa como la capa de presentación e interfaz interactiva (*Stark Logistics HUD*) para el motor backend desarrollado en el **Proyecto I (`merchan_backend`)**. Ha sido construida con **React + JavaScript**, cuidando al máximo la experiencia de usuario, la reactividad en tiempo real y el diseño inspirado en las interfaces holográficas (*Heads-Up Display*) de Stark Industries.

---

## 📋 1. Descripción del Frontend

El frontend tiene como objetivo consumir la API REST expuesta por el backend de **Avengers Shop**, ofreciendo interfaces específicas para los distintos roles implícitos del sistema de tienda y comandas:
* **Terminal de Venta (Cliente):** Exploración del catálogo de merchandising, personalización de productos y emisión de pedidos.
* **Área de Preparación / Cocina (Operario de almacén):** Recepción de comandas, verificación de pago, empaquetado mediante *checklist* y gestión del flujo de estados (`EstadoPedido`).
* **Pantalla de Recogida (Monitor público del local):** Visualización en vivo de los códigos de pedido en preparación y listos para retirar en mostrador.

Siguiendo una estricta **separación de responsabilidades** entre cliente y servidor, el frontend delega la lógica de negocio y la persistencia de datos (gestionada en **MySQL / MySQL Workbench** a través del backend) y se comunica exclusivamente consumiendo los endpoints y DTOs (`Page<ProductoDTO>`, `Page<PedidoDTO>`) expuestos por la API REST mediante llamadas HTTP (`fetch`) y canales WebSocket.

---

## 🖥️ 2. Vistas Implementadas

La navegación SPA (*Single Page Application*) se articula mediante `react-router-dom` en las siguientes vistas:

### 🛒 2.1. Vista Terminal (`/terminal`)
Orientada al cliente final en el punto de venta para la creación de pedidos:
* **Catálogo conectado a `Page<ProductoDTO>`:** Muestra los artículos activos con imagen, descripción, precio unitario y estado de stock sincronizado en tiempo real vía WebSocket (`En stock`, `¡Últimas unidades!`, `Agotado`).
* **Buscador y filtros dinámicos:** Filtrado instantáneo por coincidencia de texto (nombre, personaje o descripción) y por categorías (`TODOS`, `CAMISETAS`, `TAZAS`, `GORRAS`, `FIGURAS`, `⚡ PERSONALIZABLES`).
* **Selección de tallas y galería (`DetalleProductoModal`):** Modal interactivo para visualizar el producto al detalle, comprobar stock por talla en vivo consultando al backend y elegir talla (`S`, `M`, `L`, `XL`) en artículos textiles.
* **Drawer de Comanda Activa (Carrito):**
  * Añadir, modificar unidades (respetando el tope máximo de stock disponible) y eliminar productos o vaciar la cesta.
  * Inclusión de **texto personalizado (grabado)** en los artículos que lo admiten (`personalizable = "Sí"` / `true`), aplicando la promoción de apertura.
  * Soporte para códigos promocionales de sesión (`STARK10`, `GROOT5`) y visualización desglosada del total del pedido.
* **Holograma de Confirmación:** Al finalizar la compra, muestra en grande el **código único autogenerado** por el backend (ej. `AV-1014`) para que el cliente pueda hacer seguimiento en la pantalla de recogida.

### 📦 2.2. Vista Preparación / Cocina (`/preparacion`)
Tablero Kanban de **3 columnas** para la gestión operativa de comandas con sincronización automática cada 4 segundos:
1. **Nuevos pedidos (`CREADO`):** Lista los pedidos entrantes con su código, total de unidades (`uds.`), desglose de líneas (`PedidoProducto`), talla seleccionada, texto de grabado e insignia de alerta `⚡ REQUIERE GRABADO`. Incorpora validación de pago (`💳 Pago Aceptado`) como requisito previo antes de iniciar la preparación.
2. **En proceso (`EN_PREPARACION`):** Incluye un **checklist interactivo** por cada línea de producto (que permite tachar y marcar con `✅` cada artículo conforme se empaqueta), botón para revertir a `CREADO` o avanzar a `PEDIDO_LISTO`.
3. **Listos en mostrador (`PEDIDO_LISTO`):** Comandas terminadas listas para entregar. Permite revertir a `EN_PREPARACION` o registrar la entrega definitiva al cliente (`ENTREGADO`).
* **Controles adicionales:** Buscador multicriterio (por código, nombre de producto, talla o texto de grabado), filtro exclusivo `⚡ Solo con grabado`, modal de seguridad para cancelar pedidos (`CANCELADO`) y notificaciones flotantes (*Stark Toasts*) en cada transición.

### 📢 2.3. Vista Pantalla de Recogida (`/pantalla`)
Monitor público de sala diseñado con estética HUD de alto contraste:
* **Columna En Preparación (`EN_PREPARACION`):** Muestra los códigos de pedidos que están siendo ensamblados en almacén.
* **Columna Listo para Recoger (`PEDIDO_LISTO`):** Destaca únicamente el **código del pedido** para que el cliente se acerque al mostrador.
* **Funcionalidades de monitor:** Reloj central en tiempo real, botón de **Pantalla Completa** (`Fullscreen API`), buscador de código con limpieza rápida mediante tecla `Esc` y barra inferior (*Ticker*) con el historial de las últimas 5 entregas realizadas en la sesión.

### 🎁 2.4. Vista Sorteos (`/sorteos`)
Sección promocional complementaria integrada en el enrutador de la tienda.

---

## 📌 3. Endpoints Consumidos

La comunicación HTTP se centraliza en `src/services/api.js` (`http://localhost:8080/api`) utilizando `fetch` nativo y se organiza en `productService.js` y `pedidoService.js`:

| Método | Endpoint | Servicio Frontend | Descripción y Alineación con Backend |
| :--- | :--- | :--- | :--- |
| **`GET`** | `/api/productos?size=20` | `productService.obtenerProductos()` | Obtiene la página de productos disponibles (`Page<ProductoDTO>`) para poblar el catálogo de la Terminal. |
| **`POST`** | `/api/pedidos` | `productService.crearPedido(terminalId)` | Inicia un nuevo pedido asociado a la entidad `Terminal` (`{ terminalId: 1 }`) y devuelve el `Pedido` con su código autogenerado. |
| **`POST`** | `/api/pedidos/{pedidoId}/productos` | `productService.agregarProductoAPedido(pedidoId, datos)` | Registra cada línea en `PedidoProducto` enviando `{ productoId, cantidad, textoPersonalizado, talla }`. |
| **`GET`** | `/api/pedidos?estado={estado}&size=50` | `pedidoService.obtenerPorEstado(estado)` | Consulta los pedidos según su `EstadoPedido` (`CREADO`, `EN_PREPARACION`, `PEDIDO_LISTO`) para las vistas de Preparación y Recogida. |
| **`PATCH`** | `/api/pedidos/{pedidoId}/estado` | `pedidoService.actualizarEstado(pedidoId, nuevoEstado)` | Actualiza el estado del pedido enviando `{ estadoPedido: nuevoEstado }` (`EN_PREPARACION`, `PEDIDO_LISTO`, `ENTREGADO`, `CANCELADO`). |
| **`WS`** | `http://localhost:8080/ws` (`/topic/productos-stock`) | `@stomp/stompjs` + `SockJS` | Suscripción WebSocket en `VistaTerminal.jsx` para actualizar en tiempo real el stock de productos cuando se producen cambios en el inventario. |

---

## 🔄 4. Flujo de Usuario y Estados (`EstadoPedido`)

El flujo de extremo a extremo entre las tres pantallas principales sigue fielmente las reglas de negocio del Backend:

1. **Creación en Terminal (`/terminal`):**
   * El cliente añade productos al carrito (seleccionando talla o grabado personalizado si aplica) y pulsa **"⚡ Confirmar Suministros"**.
   * El frontend ejecuta `POST /api/pedidos` seguido de `POST /api/pedidos/{id}/productos` por cada línea y muestra el código generado (ej. `AV-1015`). El pedido nace en estado **`CREADO`**.
2. **Recepción y Preparación en Almacén (`/preparacion`):**
   * El pedido aparece automáticamente en la columna **"Nuevos pedidos"** (`CREADO`).
   * El operario confirma el cobro (`💳 Pago Aceptado`) y pulsa **"Iniciar Preparación"** (`PATCH` a **`EN_PREPARACION`**).
   * En ese instante, el código del pedido aparece en la columna **"EN PREPARACIÓN"** de la **Pantalla de Recogida (`/pantalla`)**.
3. **Empaquetado y Puesta en Mostrador (`/preparacion` ➔ `/pantalla`):**
   * El operario marca los productos en el *checklist* interactivo y pulsa **"Marcar como Listo"** (`PATCH` a **`PEDIDO_LISTO`**).
   * La tarjeta pasa inmediatamente a la columna **"✅ LISTO PARA RECOGER"** en la **Pantalla de Recogida**.
4. **Entrega Final (`/preparacion`):**
   * Cuando el cliente retira sus artículos, el operario pulsa **"✓ Entregado al Cliente"** (`PATCH` a **`ENTREGADO`**).
   * El pedido sale de las columnas activas y se registra con su hora exacta en el *Ticker* inferior de **"ENTREGAS RECIENTES"** de la Pantalla de Recogida.

---

## 🛠️ 5. Tecnologías Utilizadas

* **React 18** (con **Vite**) — Biblioteca principal para la construcción de la interfaz de usuario basada en componentes funcionales.
* **JavaScript (ES6+)** — Asincronía con `async/await`, `Promise.all` y manipulación inmutable de estados.
* **React Hooks** — `useState`, `useEffect`, `useCallback`, `useMemo` y `useRef`.
* **React Router DOM (`react-router-dom`)** — Gestión de rutas (`BrowserRouter`, `Routes`, `Route`, `NavLink`, `Navigate`).
* **Fetch API nativa** — Cliente HTTP centralizado para consumir la API REST.
* **Librerías `@stomp/stompjs` y `sockjs-client`** — Dependencias integradas en `VistaTerminal.jsx` para escuchar eventos WebSocket del backend y actualizar el stock en vivo sin recargar la página.
* **CSS3 Modular (Stark HUD Design)** — Diseño responsive *Mobile-First*, variables CSS, *Flexbox*, *CSS Grid* y animaciones *Keyframes* propias sin dependencia de frameworks CSS externos.

---

## 🏗️ 6. Estructura del Proyecto

El código está organizado por responsabilidades dentro de `merchan_frontend/` para facilitar su mantenimiento y escalabilidad:

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
│   │   │   └── miles_morales.jpg
│   │   ├── figuras/
│   │   │   ├── doctor_doom/
│   │   │   ├── groot/
│   │   │   ├── guantelete_ironman/
│   │   │   ├── thanos/
│   │   │   └── thor/
│   │   ├── gorras/
│   │   │   ├── america/
│   │   │   ├── marvel/
│   │   │   ├── personalizable/
│   │   │   ├── punisher/
│   │   │   └── set_gorra_gafas/
│   │   └── tazas/
│   │       ├── taza_personalizable/
│   │       ├── tazas_vengadores/
│   │       ├── taza_deadpool.jpg
│   │       ├── taza_loki.jpg
│   │       └── taza_marvel_695.jpg
│   ├── icono_groot.png
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/                          # Recursos gráficos e iconos de código
│   │   ├── funko_logo.jpg
│   │   ├── hero.png
│   │   ├── loader7.svg
│   │   ├── logo_tienda.png
│   │   ├── react.svg
│   │   ├── sorteo.jpg
│   │   └── vite.svg
│   ├── components/                      # Componentes reutilizables y vistas
│   │   ├── BannerSlider/
│   │   ├── BannerSuperior/
│   │   ├── BotonScrollTop/
│   │   ├── DetalleProductoModal/
│   │   ├── Footer/
│   │   ├── FormularioSoporte/
│   │   ├── ModalInformacion/
│   │   ├── PromoModal/
│   │   ├── ReactorLoader/
│   │   └── pages/                       # Vistas principales asociadas a las rutas
│       ├── PantallaRecogida/
│       ├── VistaPreparacion/
│       ├── VistaSorteos/
│       └── VistaTerminal/
│   ├── services/                        # Capa de servicios HTTP desacoplada de la UI
│   │   ├── api.js                       # Configuración base de fetch y captura de errores
│   │   ├── pedidoService.js             # Peticiones REST sobre /api/pedidos
│   │   └── productService.js            # Peticiones REST sobre /api/productos y creación de pedidos
│   ├── App.css                          # Estilos globales de layout y barra de navegación
│   ├── App.jsx                          # Enrutador principal y estructura base
│   ├── index.css                        # Estilos base y reseteo general
│   └── main.jsx                         # Punto de montaje de React DOM y configuración de favicon
├── eslint.config.js
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

---

## 🛡️ 7. Manejo de Errores

El frontend se integra directamente con el `GlobalExceptionHandler` (`@RestControllerAdvice`) del Backend:

* **Captura centralizada en `api.js`:** Cuando el backend responde con un código `400 Bad Request`, `404 Not Found`, `405 Method Not Allowed`, `409 Conflict` o `500 Internal Server Error`, el cliente `fetch` intercepta el JSON de respuesta y extrae automáticamente el mensaje de error enviado por el servidor (`message`, `mensaje`, `error`, `detail` o validaciones de `@Valid`), lanzando un `Error` con el texto exacto del backend.
* **Detección de caída del servidor:** Si el backend en el puerto `8080` no está disponible, captura la excepción de red y muestra un aviso claro al usuario indicando que compruebe la conexión con el servidor backend.
* **Protección transaccional del Carrito en UI:** En `VistaTerminal`, la cesta del cliente no se vacía hasta que el backend confirma con éxito tanto la creación del pedido como la inserción de todas sus líneas, mostrando un banner de alerta dentro del propio carrito si alguna validación falla.
* **Tolerancia a fallos en Polling:** En `VistaPreparacion` y `PantallaRecogida`, los errores iniciales presentan un banner con botón de **"Reintentar"**, mientras que las sincronizaciones periódicas en segundo plano (`silencioso = true`) no interrumpen el trabajo del operario.

---

## ⚙️ 8. Cómo Ejecutar la Aplicación

### Requisitos Previos
1. **Descargar y arrancar el Backend (`merchan_backend`):**  
   Este repositorio del frontend depende al 100% de la API REST. Para clonarlo y levantarlo en tu equipo local, ejecuta:
   ```bash
   git clone git@github.com:pbesunmag/merchan_backend.git
   cd merchan_backend
   ```
   Sigue las instrucciones de su propio README asegurándote de tener activo el servicio de **MySQL 8.0+** (vía **MySQL Workbench** o **XAMPP**) en el puerto `3306`. El backend debe estar corriendo en `http://localhost:8080` antes de arrancar el frontend.
2. Tener instalado **Node.js** (v18+ recomendado) y **npm** en tu equipo.

### Pasos de Instalación y Ejecución

1. **Clonar el repositorio del frontend:**
   ```bash
   git clone git@github.com:pbesunmag/merchan_frontend.git
   cd merchan_frontend
   ```

2. **Instalar las dependencias:**
   ```bash
   npm install
   ```

3. **Arrancar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

4. **Abrir la aplicación en el navegador:**  
   Accede a `http://localhost:5173` (o el puerto indicado en consola) y navega por las vistas desde el menú superior:
   * 🖥️ **Terminal:** `http://localhost:5173/terminal`
   * 📦 **Preparación:** `http://localhost:5173/preparacion`
   * 📢 **Pantalla Recogida:** `http://localhost:5173/pantalla`

---

## 🔍 9. Suposiciones y Limitaciones

* **Sin autenticación de usuarios:** Siguiendo las especificaciones del proyecto, no se implementa login ni bloqueo por roles; todas las vistas son accesibles desde la barra de navegación superior para facilitar las pruebas integrales del flujo.
* **Asociación a Terminal por defecto:** La Vista Terminal emite los pedidos asociados por defecto a `terminalId = 1` (asegúrate de tener creada al menos la terminal con ID `1` en la base de datos o mediante la petición `crearTerminal1` de la colección de Postman).
* **Adaptación flexible a DTOs paginados o listas:** Los servicios del frontend soportan de forma transparente tanto objetos paginados de Spring (`response.content`) como arrays directos (`response`).
* **Estados auxiliares de sesión:** El checklist de empaquetado y la confirmación local de pago en `VistaPreparacion` se mantienen en memoria durante la sesión de trabajo de la pestaña, mientras que el historial de las últimas 5 entregas se comparte entre pestañas mediante `localStorage`.
* **Arquitectura extensible:** Gracias al desacoplamiento de la capa `src/services/` y al uso parametrizado de `pedidoService.obtenerPorEstado(estado)` y `pedidoService.actualizarEstado(id, nuevoEstado)`, el frontend permite incorporar fácilmente nuevas vistas o estados adicionales definidos en el enum `EstadoPedido` del backend (como `CONFIRMACION_DE_PAGO`, `PAGO_ACEPTADO` o `ENVIADO`) sin necesidad de modificar la lógica de conexión HTTP.

---

## 👥 Autores y Créditos

Proyecto desarrollado en equipo con dedicación y cuidado por los detalles:

* **Linneth Rodrigues** 🚀
* **Pol Bastida Gonzalez** ⚡