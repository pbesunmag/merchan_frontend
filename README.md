# ⚡ Avengers Shop — Frontend HUD 🛡️

[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React Router](https://img.shields.io/badge/React_Router-7-CA4245.svg?style=for-the-badge&logo=react-router&logoColor=white)](https://reactrouter.com/)
[![Spring Boot API](https://img.shields.io/badge/Backend_API-Spring_Boot_3-brightgreen.svg?style=for-the-badge&logo=springboot)](http://localhost:8080/doc/swagger-ui.html)

Frontend de **Avengers Shop** (*Stark Logistics HUD*): interfaz React para el backend `merchan_backend` (Spring Boot 3). Cubre la terminal de venta, la preparación de comandas, la pantalla de recogida y la postventa.

---

## 📋 1. Vistas

La navegación SPA usa `react-router-dom` v7 (`src/App.jsx`):

| Ruta | Vista | Descripción |
| :--- | :--- | :--- |
| `/terminal` | `VistaTerminal` | Catálogo, detalle de producto (variante, talla), cesta y checkout atómico. |
| `/preparacion` | `VistaPreparacion` | Tablero Kanban: nuevos → en proceso → listos. Pago, entrega, postventa y métricas de caja. |
| `/pantalla` | `PantallaRecogida` | Monitor público con pedidos en preparación y listos. |
| `/sorteos` | `VistaSorteos` | Sección promocional. |

### 🛒 Terminal (`/terminal`)
* Catálogo activo con stock en tiempo real (WebSocket) e insignia ⭐ TOP VENTAS.
* **Variante elegida** (color, modelo, héroe…) y talla en `DetalleProductoModal`. La variante viaja con la línea hasta preparación.
* Cesta persistida en `localStorage` (`stark_carrito_activo`), con grabado personalizado y ticket digital simulado.
* Checkout atómico: una sola llamada crea el pedido completo.

### 📦 Preparación (`/preparacion`)
* Polling cada 4 s (`usePollingPedidos`).
* Cada tarjeta muestra badges (grabado, unidades), **variante**, talla y texto de grabado, para que el operario sepa qué modelo preparar.
* `💳 Pago Aceptado` pasa el pedido a `PAGO_ACEPTADO`. **Es en ese momento cuando el backend asienta la venta en caja.**
* `↩ Revertir` desde "En proceso" llama directamente a `CREADO` (el backend anula la venta asentada).
* Postventa (devoluciones y cambios), métricas de caja y descarga de informe CSV.

---

## 🧩 2. Arquitectura modular

Los componentes grandes se dividen en subcomponentes dentro de su carpeta:

```text
src/
├── components/
│   ├── DetalleProductoModal/
│   │   ├── DetalleProductoModal.jsx    # Contenedor: estado, stock y alta en cesta
│   │   ├── GaleriaImagenes.jsx         # Visor, miniaturas y lightbox
│   │   ├── SelectorTallaGrabado.jsx    # Selector de variante y talla
│   │   └── variantesCatalogo.js        # Variantes/galerías por slug (no por ID de BD)
│   ├── ModalPostventa/
│   │   ├── ModalPostventa.jsx          # Contenedor y lógica de devolución/cambio
│   │   ├── DesgloseComanda.jsx         # Paso 1: líneas de la comanda
│   │   ├── ConfirmarDevolucion.jsx     # Confirmación de reembolso
│   │   ├── CestaCambio.jsx             # Cesta de artículos de sustitución
│   │   ├── ResumenContableCambio.jsx   # Crédito, total nuevo y diferencia en caja
│   │   ├── SelectorTallaCambio.jsx
│   │   ├── Miniatura.jsx
│   │   └── postventaUtils.js
│   ├── PanelMetricas/                  # Saldo y métricas (datos del backend)
│   └── pages/
│       ├── VistaTerminal/
│       │   ├── VistaTerminal.jsx
│       │   ├── CatalogoGrid.jsx        # Tarjetas de producto
│       │   └── ComandaSidebar.jsx      # Cesta lateral y botón de checkout
│       ├── VistaPreparacion/
│       │   ├── VistaPreparacion.jsx
│       │   ├── ColumnaKanban.jsx       # Columna por estado
│       │   ├── PedidoCard.jsx          # Tarjeta, badges, variante y transiciones
│       │   └── pedidoUtils.js
│       ├── PantallaRecogida/
│       ├── VistaSorteos/
│       └── NotFoundStark/
├── hooks/                              # useCarrito, usePollingPedidos
├── services/                           # api, pedido, producto, caja, estadistica, informe
└── utils/                              # categoriaUtils, formatoUtils
```

### Variantes por slug
`variantesCatalogo.js` indexa variantes y galerías por slug (`camiseta-spiderman`, `taza-vengadores`…). Se resuelven con `producto.slug` si la API lo envía, o con el nombre normalizado del producto. Así no dependen de IDs de base de datos.

---

## 🔄 3. Checkout atómico y flujo contable

1. `useCarrito.finalizarPedido` envía **una única petición** `POST /api/pedidos/checkout`:
   ```json
   { "terminalId": 1, "lineas": [{ "productoId": 7, "cantidad": 1, "talla": null, "textoPersonalizado": null, "variante": "Puño de Hulk" }] }
   ```
2. El backend valida stock y crea pedido + líneas en una transacción. El pedido queda en `CREADO` y **no** mueve caja.
3. Al confirmar el pago (`PAGO_ACEPTADO`) el backend registra el movimiento `VENTA` en caja.
4. Cancelar o revertir a `CREADO` anula esa venta en caja.

El `terminalId` sale de `VITE_DEFAULT_TERMINAL_ID` (por defecto `1`).

```text
CREADO → (CONFIRMACION_DE_PAGO) → PAGO_ACEPTADO → EN_PREPARACION → PEDIDO_LISTO → (ENVIADO) → ENTREGADO → DEVUELTO
   ↑___________ revertir ____________|                |
   Cualquier estado activo previo a la entrega → CANCELADO
```

---

## 🔌 4. WebSocket

`VistaTerminal` abre una conexión **WebSocket nativa** con `@stomp/stompjs` (`brokerURL` = `VITE_WS_URL`, sin SockJS) y se suscribe a `/topic/productos-stock`. Cada mensaje actualiza el stock o retira productos desactivados, sin recargar. Reconexión automática cada 5 s.

---

## 📌 5. Endpoints consumidos

La base se toma de `VITE_API_BASE_URL` (`src/services/api.js`, `fetch` nativo).

| Método | Endpoint | Servicio |
| :--- | :--- | :--- |
| GET | `/api/productos?activos=true&size=100` | `productService.obtenerProductos()` |
| GET | `/api/productos/{id}/tallas` | `productService.obtenerTallas(id)` |
| POST | `/api/pedidos/checkout` | `pedidoService.checkout(terminalId, lineas)` |
| GET | `/api/pedidos?estado={estado}&size=50` | `pedidoService.obtenerPorEstado(estado)` |
| GET | `/api/pedidos?estado={estado}&size={n}&sort=fechaActualizacion,desc` | `pedidoService.obtenerPedidosPorEstado(estado, n)` |
| PATCH | `/api/pedidos/{id}/estado` | `pedidoService.actualizarEstado(id, estado)` |
| POST | `/api/pedidos/{id}/devolucion` | `cajaService.solicitarDevolucion(id)` |
| POST | `/api/pedidos/{id}/devolucion-linea` | `cajaService.solicitarDevolucionLinea(id, dto)` |
| POST | `/api/pedidos/{id}/cambio-producto` | `cajaService.solicitarCambio(id, dto)` |
| GET | `/api/caja/metricas?periodo={HOY\|MES\|ANIO}` | `cajaService.obtenerMetricas(periodo)` |
| GET | `/api/estadisticas/producto-mas-vendido` | `estadisticaService.obtenerProductoMasVendido()` |
| GET | `/api/informes/ventas/completo?periodo={dia\|mes\|anio}` | `informeService.descargarInformeCompleto(periodo)` |
| WS | `/ws` → `/topic/productos-stock` | `@stomp/stompjs` |

El saldo de caja del panel de métricas viene de `saldoActualCaja` en `/api/caja/metricas`. El frontend no guarda ningún saldo inicial.

---

## 🛠️ 6. Tecnologías

Versiones reales de `package.json`:

* **React 19** y **React DOM 19**
* **Vite 8** con `@vitejs/plugin-react`
* **React Router DOM 7**
* **@stomp/stompjs 7** (WebSocket nativo)
* **ESLint 10** (con `eslint-plugin-react-hooks` y `eslint-plugin-react-refresh`)
* CSS modular por componente (sin frameworks CSS)

---

## 🔐 7. Variables de entorno

Copia `.env.example` a `.env` (el `.env` **no se versiona**, está en `.gitignore`):

```bash
cp .env.example .env
```

| Variable | Ejemplo | Uso |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `http://localhost:8080/api` | Base de la API REST |
| `VITE_WS_URL` | `ws://localhost:8080/ws` | Endpoint WebSocket |
| `VITE_DEFAULT_TERMINAL_ID` | `1` | Terminal usada en el checkout |

> Si `.env` estuvo indexado antes, desindéxalo sin borrarlo del disco: `git rm --cached .env`.

---

## ⚙️ 8. Cómo ejecutar

Requisitos: Node.js 18+ y el backend (`merchan_backend`) en `http://localhost:8080`.

```bash
npm install
npm run dev      # desarrollo en http://localhost:5173
npm run build    # bundle de producción en dist/
npm run lint
```

---

## 🔍 9. Suposiciones y limitaciones

* Sin autenticación ni roles: todas las vistas son accesibles.
* Las acciones de postventa usan el `id` numérico del pedido, no el código `AV-XXXX`.
* Los servicios aceptan respuestas paginadas (`content`) y arrays planos.
* Las claves del catálogo de variantes se asocian por palabras del nombre del producto. Si renombras productos, ajusta `REGLAS_SLUG` en `variantesCatalogo.js` o expón `slug` en la API.

---

## 👥 Autores y Créditos

* **Linneth Rodrigues** 🚀
* **Pol Bastida Gonzalez** ⚡
