⚡ Avengers Shop — Frontend HUD 🛡️

¡Hola y bienvenid@ al Frontend de Avengers Shop!

Esta aplicación web actúa como la capa de presentación e interfaz interactiva (Stark Logistics HUD) para el motor backend desarrollado en el Proyecto I (merchan_backend). Ha sido construida con React + JavaScript, cuidando al máximo la experiencia de usuario, la reactividad en tiempo real y el diseño inspirado en las interfaces holográficas (Heads-Up Display) de Stark Industries.

📋 1. Descripción del Frontend

El frontend tiene como objetivo consumir la API REST expuesta por el backend de Avengers Shop, ofreciendo interfaces específicas para los distintos roles implícitos del sistema de tienda y comandas:

Terminal de Venta (Cliente): Exploración del catálogo de merchandising, personalización de productos y emisión de pedidos.

Área de Preparación / Cocina (Operario de almacén): Recepción de comandas, verificación de pago, empaquetado mediante checklist y gestión del flujo de estados (EstadoPedido).

Pantalla de Recogida (Monitor público del local): Visualización en vivo de los códigos de pedido en preparación y listos para retirar en mostrador.

Siguiendo una estricta separación de responsabilidades entre cliente y servidor, el frontend delega la lógica de negocio y la persistencia de datos (gestionada en MySQL / MySQL Workbench a través del backend) y se comunica exclusivamente consumiendo los endpoints y DTOs (Page<ProductoDTO>, Page<PedidoDTO>) expuestos por la API REST mediante llamadas HTTP (fetch) y canales WebSocket.

🖥️ 2. Vistas Implementadas

La navegación SPA (Single Page Application) se articula mediante react-router-dom en las siguientes vistas:

🛒 2.1. Vista Terminal (/terminal)

Orientada al cliente final en el punto de venta para la creación de pedidos:

Catálogo conectado a Page<ProductoDTO>: Muestra los artículos activos con imagen, descripción, precio unitario y estado de stock sincronizado en tiempo real vía WebSocket (En stock, ¡Últimas unidades!, Agotado).

Buscador y filtros dinámicos: Filtrado instantáneo por coincidencia de texto (nombre, personaje o descripción) y por categorías (TODOS, CAMISETAS, TAZAS, GORRAS, FIGURAS, ⚡ PERSONALIZABLES), apoyado en funciones puras auxiliares (categoriaUtils.js).

Selección de tallas y galería (DetalleProductoModal): Modal interactivo para visualizar el producto al detalle, comprobar stock por talla en vivo consultando al backend y elegir talla (XS, S, M, L, XL, XXL) en artículos textiles.

Drawer de Comanda Activa (Carrito):

Lógica extraída y gestionada íntegramente mediante el custom hook useCarrito.

Añadir, modificar unidades (respetando el tope máximo de stock disponible) y eliminar productos o vaciar la cesta.

Inclusión de texto personalizado (grabado) en los artículos que lo admiten (personalizable = "Sí" / true), aplicando la promoción de apertura.

Soporte para códigos promocionales de sesión (STARK10, GROOT5) y visualización desglosada del total del pedido.

Holograma de Confirmación: Al finalizar la compra, muestra en grande el código único autogenerado por el backend (ej. AV-1014) para que el cliente pueda hacer seguimiento en la pantalla de recogida.

📦 2.2. Vista Preparación / Cocina (/preparacion)

Tablero Kanban de 3 columnas para la gestión operativa de comandas con sincronización automática mediante el hook usePollingPedidos:

Nuevos pedidos (CREADO): Lista los pedidos entrantes con su código, total de unidades (uds.), desglose de líneas (PedidoProducto), talla seleccionada, texto de grabado e insignia de alerta ⚡ REQUIERE GRABADO. Incorpora validación de pago (💳 Pago Aceptado) como requisito previo antes de iniciar la preparación.

En proceso (EN_PREPARACION): Incluye un checklist interactivo por cada línea de producto (que permite tachar y marcar con ✅ cada artículo conforme se empaqueta), botón para revertir a CREADO o avanzar a PEDIDO_LISTO.

Listos en mostrador (PEDIDO_LISTO): Comandas terminadas listas para entregar. Permite revertir a EN_PREPARACION o registrar la entrega definitiva al cliente (ENTREGADO).

Controles adicionales: Buscador multicriterio (por código, nombre de producto, talla o texto de grabado), filtro exclusivo ⚡ Solo con grabado, modal de seguridad para cancelar pedidos (CANCELADO) y notificaciones flotantes (Stark Toasts) en cada transición.

📢 2.3. Vista Pantalla de Recogida (/pantalla)

Monitor público de sala diseñado con estética HUD de alto contraste con refresco no bloqueante gestionado por usePollingPedidos:

Columna En Preparación (EN_PREPARACION): Muestra los códigos de pedidos que están siendo ensamblados en almacén.

Columna Listo para Recoger (PEDIDO_LISTO): Destaca únicamente el código del pedido para que el cliente se acerque al mostrador.

Funcionalidades de monitor: Reloj central en tiempo real, botón de Pantalla Completa (Fullscreen API), buscador de código con limpieza rápida mediante tecla Esc y barra inferior (Ticker) con el historial de las últimas 5 entregas realizadas en la sesión.

🎁 2.4. Vista Sorteos (/sorteos)

Sección promocional complementaria integrada en el enrutador de la tienda.

📌 3. Endpoints Consumidos

La comunicación HTTP se centraliza en src/services/api.js (http://localhost:8080/api) utilizando fetch nativo y se organiza en productService.js y pedidoService.js:

Método

Endpoint

Servicio Frontend

Descripción y Alineación con Backend

GET

/api/productos?size=20

productService.obtenerProductos()

Obtiene la página de productos disponibles (Page<ProductoDTO>) para poblar el catálogo de la Terminal.

POST

/api/pedidos

productService.crearPedido(terminalId)

Inicia un nuevo pedido asociado a la entidad Terminal ({ terminalId: 1 }) y devuelve el Pedido con su código autogenerado.

POST

/api/pedidos/{pedidoId}/productos

productService.agregarProductoAPedido(pedidoId, datos)

Registra cada línea en PedidoProducto enviando { productoId, cantidad, textoPersonalizado, talla }.

GET

/api/pedidos?estado={estado}&size=50

pedidoService.obtenerPorEstado(estado)

Consulta los pedidos según su EstadoPedido (CREADO, EN_PREPARACION, PEDIDO_LISTO) para las vistas de Preparación y Recogida.

PATCH

/api/pedidos/{pedidoId}/estado

pedidoService.actualizarEstado(pedidoId, nuevoEstado)

Actualiza el estado del pedido enviando { estadoPedido: nuevoEstado } (EN_PREPARACION, PEDIDO_LISTO, ENTREGADO, CANCELADO).

WS

http://localhost:8080/ws (/topic/productos-stock)

@stomp/stompjs + SockJS

Suscripción WebSocket en VistaTerminal.jsx para actualizar en tiempo real el stock de productos cuando se producen cambios en el inventario.

🔄 4. Flujo de Usuario y Estados (EstadoPedido)

El flujo de extremo a extremo entre las tres pantallas principales sigue fielmente las reglas de negocio del Backend:

Creación en Terminal (/terminal):

El cliente añade productos al carrito (seleccionando talla o grabado personalizado si aplica) y pulsa "⚡ Confirmar Suministros".

El frontend ejecuta POST /api/pedidos seguido de POST /api/pedidos/{id}/productos por cada línea y muestra el código generado (ej. AV-1015). El pedido nace en estado CREADO.

Recepción y Preparación en Almacén (/preparacion):

El pedido aparece automáticamente en la columna "Nuevos pedidos" (CREADO).

El operario confirma el cobro (💳 Pago Aceptado) y pulsa "Iniciar Preparación" (PATCH a EN_PREPARACION).

En ese instante, el código del pedido aparece en la columna "EN PREPARACIÓN" de la Pantalla de Recogida (/pantalla).

Empaquetado y Puesta en Mostrador (/preparacion ➔ /pantalla):

El operario marca los productos en el checklist interactivo y pulsa "Marcar como Listo" (PATCH a PEDIDO_LISTO).

La tarjeta pasa inmediatamente a la columna "✅ LISTO PARA RECOGER" en la Pantalla de Recogida.

Entrega Final (/preparacion):

Cuando el cliente retira sus artículos, el operario pulsa "✓ Entregado al Cliente" (PATCH a ENTREGADO).

El pedido sale de las columnas activas y se registra con su hora exacta en el Ticker inferior de "ENTREGAS RECIENTES" de la Pantalla de Recogida.

🛠️ 5. Tecnologías Utilizadas

React 18 (con Vite) — Biblioteca principal para la construcción de la interfaz de usuario basada en componentes funcionales.

JavaScript (ES6+) — Asincronía con async/await, Promise.all y manipulación inmutable de estados.

Custom Hooks Propios (Clean Architecture):

useCarrito: Desacopla toda la gestión de la cesta de la compra, cálculo dinámico de subtotales, recargo de grabado láser, cupones promocionales, validaciones de tope de stock por variante y confirmación transaccional con la API.

usePollingPedidos: Hook genérico para la sincronización periódica en segundo plano (polling a 4000 ms), gestionando estados de carga inicial, manejo silencioso de errores y limpieza garantizada de temporizadores en el desmontaje.

React Hooks Nativos: useState, useEffect, useCallback, useMemo y useRef.

Módulos de Utilidades Puras (utils/):

categoriaUtils.js: Funciones desacopladas para normalización de caracteres/tildes, clasificación categórica e identificación de personalización.

formatoUtils.js: Centralización del formateo de moneda (XX.XX €), resolución segura de códigos de pedido (AV-XXXX) y formateo estético de personajes.

React Router DOM (react-router-dom) — Gestión de rutas (BrowserRouter, Routes, Route, NavLink, Navigate).

Fetch API nativa — Cliente HTTP centralizado para consumir la API REST con extracción automática de mensajes DTO.

Librerías @stomp/stompjs y sockjs-client — Comunicación WebSocket bidireccional para recepción de eventos de stock en tiempo real.

CSS3 Modular (Stark HUD Design) — Diseño responsive Mobile-First, variables CSS de tema, Flexbox, CSS Grid y animaciones Keyframes propias sin dependencias de frameworks pesados.

🏗️ 6. Estructura del Proyecto

El código está estructurado modularmente en merchan_frontend/ siguiendo los principios de alta cohesión y bajo acoplamiento:

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
│   │       ├── PantallaRecogida/
│   │       ├── VistaPreparacion/
│   │       ├── VistaSorteos/
│   │       └── VistaTerminal/
│   ├── hooks/                           # Custom Hooks reutilizables
│   │   ├── useCarrito.js                # Lógica desacoplada de la comanda y compras
│   │   └── usePollingPedidos.js         # Sincronización periódica en segundo plano
│   ├── services/                        # Capa de servicios HTTP desacoplada de la UI
│   │   ├── api.js                       # Configuración base de fetch y captura de errores
│   │   ├── pedidoService.js             # Peticiones REST sobre /api/pedidos
│   │   └── productService.js            # Peticiones REST sobre /api/productos y creación de pedidos
│   ├── utils/                           # Funciones puras auxiliares
│   │   ├── categoriaUtils.js            # Normalización y clasificación de catálogo
│   │   └── formatoUtils.js              # Centralización de formateo de moneda y pedidos
│   ├── App.css                          # Estilos globales de layout y barra de navegación
│   ├── App.jsx                          # Enrutador principal y estructura base
│   ├── index.css                        # Variables Stark HUD y reseteo general
│   └── main.jsx                         # Punto de montaje de React DOM y favicon
├── saneamiento_avengers_shop.sql        # Script SQL de inicialización y saneamiento de BD
├── eslint.config.js
├── index.html
├── package.json
├── README.md
└── vite.config.js


🛡️ 7. Manejo de Errores

El frontend se integra directamente con el GlobalExceptionHandler (@RestControllerAdvice) del Backend:

Captura centralizada en api.js: Cuando el backend responde con un código de error HTTP (400 Bad Request, 404 Not Found, 405 Method Not Allowed, 409 Conflict o 500 Internal Server Error), el cliente fetch intercepta la carga útil y extrae automáticamente el mensaje de error provisto por el servidor (message, mensaje, error, detail o validaciones de @Valid), propagando un Error descriptivo.

Detección de caída del servidor: Si el backend en el puerto 8080 no responde, captura la excepción de red y muestra un aviso visual intuitivo al usuario para que verifique que el servicio Spring Boot se encuentra activo.

Protección transaccional del Carrito en UI: En useCarrito, la cesta del cliente no se vacía hasta que el backend confirma satisfactoriamente la creación del pedido y el guardado de cada una de sus líneas, alertando al usuario en caso de conflicto sin perder su selección.

Tolerancia a fallos en Polling (usePollingPedidos): La carga inicial informa de anomalías críticas permitiendo el reintento bajo demanda, mientras que las consultas periódicas de fondo se realizan en modo silencioso para evitar parpadeos o molestias en pantalla si se produce una desconexión transitoria.

🗄️ 8. Configuración y Uso Adecuado de la Base de Datos (MySQL)

Durante las primeras fases de integración con el frontend, se detectaron desajustes en el estado del esquema que comprometían la integridad relacional de la aplicación:

Ausencia de registros en la tabla terminal: El frontend envía por defecto terminalId: 1. Si la clave foránea no existía en la base de datos, las peticiones POST /api/pedidos fallaban con error de integridad relacional (Foreign Key Constraint Violation).

Productos con campos inconsistentes: Algunos artículos contaban con stock nulo o nombres de categorías dispares (TEXTIL en lugar de CAMISETAS), provocando que los filtros y badges de stock no respondieran fielmente.

Artículos personalizables no marcados: Ciertas tazas y gorras carecían del indicador booleano personalizable = 1, impidiendo al cliente solicitar grabado láser.

8.1. Script SQL de Inicialización y Saneamiento

Para corregir y blindar estos registros, se incluye en la raíz del proyecto el archivo ejecutable saneamiento_avengers_shop.sql, cuyas sentencias comentadas se detallan a continuación:

-- =============================================================================
-- AVENGERS SHOP - SCRIPT DE SANEAMIENTO Y SINCRONIZACIÓN DE BASE DE DATOS
-- Motor: MySQL 8.0+ | Base de datos: merchan_db (o la base de datos de tu proyecto)
-- =============================================================================

USE merchan_db;

-- -----------------------------------------------------------------------------
-- 1. TERMINAL POR DEFECTO (REQUISITO CRÍTICO DE CLAVE FORÁNEA)
-- El frontend envía por defecto `terminalId: 1` al ejecutar POST /api/pedidos.
-- Si la tabla `terminal` está vacía o no existe el ID 1, las compras fallarán con error 500/400.
-- -----------------------------------------------------------------------------
INSERT INTO terminal (id, nombre, ubicacion, activo)
VALUES (1, 'Terminal Principal Mostrador', 'Planta Baja - Sector Malibú', 1)
ON DUPLICATE KEY UPDATE 
    nombre = VALUES(nombre),
    activo = 1;


-- -----------------------------------------------------------------------------
-- 2. HOMOGENEIZACIÓN DE CATEGORÍAS
-- Alinea los nombres de categoría con los filtros del catálogo:
-- ('CAMISETAS', 'TAZAS', 'GORRAS', 'FIGURAS')
-- -----------------------------------------------------------------------------
UPDATE producto 
SET categoria = 'CAMISETAS' 
WHERE LOWER(nombre) LIKE '%camiseta%' OR LOWER(categoria) LIKE '%textil%';

UPDATE producto 
SET categoria = 'TAZAS' 
WHERE LOWER(nombre) LIKE '%taza%';

UPDATE producto 
SET categoria = 'GORRAS' 
WHERE LOWER(nombre) LIKE '%gorra%';

UPDATE producto 
SET categoria = 'FIGURAS' 
WHERE LOWER(nombre) LIKE '%figura%' OR LOWER(nombre) LIKE '%réplica%' OR LOWER(nombre) LIKE '%estatua%';


-- -----------------------------------------------------------------------------
-- 3. HABILITACIÓN DE PERSONALIZACIÓN (GRABADO LÁSER)
-- Tazas y gorras oficiales deben admitir grabado en terminal (+3.00 €).
-- Las figuras de colección deben tener el grabado deshabilitado (personalizable = 0).
-- -----------------------------------------------------------------------------
-- Habilitar en tazas y gorras
UPDATE producto 
SET personalizable = 1 
WHERE categoria IN ('TAZAS', 'GORRAS') 
   OR LOWER(nombre) LIKE '%personaliz%';

-- Deshabilitar estrictamente en figuras coleccionables
UPDATE producto 
SET personalizable = 0 
WHERE categoria = 'FIGURAS' 
   OR LOWER(nombre) LIKE '%figura%';


-- -----------------------------------------------------------------------------
-- 4. STOCK BASE DE SEGURIDAD Y ACTIVACIÓN
-- Evita que los artículos arranquen con valores NULL o en 0, garantizando
-- que el frontend muestre 'En stock' y permita agregar al carrito.
-- -----------------------------------------------------------------------------
UPDATE producto 
SET stock = 10, activo = 1 
WHERE stock IS NULL OR stock <= 0;


-- -----------------------------------------------------------------------------
-- 5. STOCK ESPECÍFICO PARA DEMOSTRACIÓN DE ESTADOS
-- Configura productos concretos para probar todos los badges del catálogo:
-- -----------------------------------------------------------------------------
-- A) Caso '¡Solo quedan 2 ud!' (Stock bajo 1-3 unidades):
UPDATE producto 
SET stock = 2 
WHERE LOWER(nombre) LIKE '%groot%';

-- B) Caso '¡Solo queda 1 ud!' (Stock singular):
UPDATE producto 
SET stock = 1 
WHERE LOWER(nombre) LIKE '%thanos%';

-- C) Caso 'En stock' (> 3 unidades):
UPDATE producto 
SET stock = 8 
WHERE LOWER(nombre) LIKE '%guantelete%';


-- -----------------------------------------------------------------------------
-- 6. PEDIDOS DE EJEMPLO PARA PRUEBAS (OPCIONAL)
-- Genera comandas en los estados del flujo para poblar de inmediato
-- la Vista de Preparación (/preparacion) y la Pantalla de Recogida (/pantalla).
-- -----------------------------------------------------------------------------

-- Pedido A: Entrante en NUEVOS PEDIDOS (CREADO)
INSERT INTO pedido (id, codigo, estado_pedido, terminal_id, fecha_creacion, total)
VALUES (1001, 'AV-1001', 'CREADO', 1, NOW(), 34.50)
ON DUPLICATE KEY UPDATE estado_pedido = 'CREADO';

-- Pedido B: En cola de montaje en EN PROCESO (EN_PREPARACION)
INSERT INTO pedido (id, codigo, estado_pedido, terminal_id, fecha_creacion, total)
VALUES (1002, 'AV-1002', 'EN_PREPARACION', 1, NOW(), 25.88)
ON DUPLICATE KEY UPDATE estado_pedido = 'EN_PREPARACION';

-- Pedido C: Listo para retirar en LISTOS EN MOSTRADOR (PEDIDO_LISTO)
INSERT INTO pedido (id, codigo, estado_pedido, terminal_id, fecha_creacion, total)
VALUES (1003, 'AV-1003', 'PEDIDO_LISTO', 1, NOW(), 19.99)
ON DUPLICATE KEY UPDATE estado_pedido = 'PEDIDO_LISTO';


-- -----------------------------------------------------------------------------
-- 7. COMPROBACIÓN FINAL DE INTEGRIDAD
-- -----------------------------------------------------------------------------
SELECT 'TERMINALES ACTIVAS' AS Diagnostico, COUNT(*) AS Total FROM terminal WHERE activo = 1;
SELECT categoria, COUNT(*) AS TotalProductos, SUM(personalizable) AS ConGrabado FROM producto GROUP BY categoria;
SELECT estado_pedido, COUNT(*) AS TotalPedidos FROM pedido GROUP BY estado_pedido;


8.2. Buenas Prácticas de Persistencia

No forzar eliminaciones físicas en cascada: Para cancelar pedidos, utilice el endpoint PATCH /api/pedidos/{id}/estado con valor CANCELADO en lugar de ejecutar sentencias DELETE FROM pedido.

Consistencia de la tabla asociativa: Las líneas de pedido residen en pedido_producto. Al insertar líneas de comanda manualmente desde SQL, asegúrese de enlazar con un producto_id y un pedido_id existentes.

⚙️ 9. Cómo Ejecutar la Aplicación

Requisitos Previos

Arrancar el Backend (merchan_backend):

Este repositorio del frontend depende de la API REST del Proyecto I. Para ejecutarlo en local:

git clone git@github.com:pbesunmag/merchan_backend.git
cd merchan_backend


Asegúrate de tener en ejecución el servicio de base de datos MySQL 8.0+ en el puerto 3306 y haber aplicado el script de saneamiento. El backend debe estar activo en http://localhost:8080.

Tener instalado Node.js (v18+ recomendado) y npm.

Pasos de Instalación y Ejecución

Clonar el repositorio del frontend:

git clone git@github.com:pbesunmag/merchan_frontend.git
cd merchan_frontend


Instalar las dependencias:

npm install


Arrancar el servidor de desarrollo:

npm run dev


Abrir la aplicación en el navegador:

Accede a http://localhost:5173 (o el puerto indicado por Vite) y accede a las diferentes pantallas:

🖥️ Terminal: http://localhost:5173/terminal

📦 Preparación: http://localhost:5173/preparacion

📢 Pantalla Recogida: http://localhost:5173/pantalla

🔍 10. Suposiciones y Limitaciones

Sin autenticación de usuarios: Siguiendo las directrices académicas del proyecto, no se implementa login ni control de sesiones de usuario; todas las vistas son de libre acceso desde el menú superior para facilitar la evaluación global del flujo de pedidos.

Asociación a Terminal por defecto: La Vista Terminal emite los pedidos asociados a terminalId = 1 (garantizado mediante el script de saneamiento).

Adaptación flexible a DTOs paginados o listas: La capa de servicios soporta indistintamente respuestas paginadas de Spring (response.content) como colecciones directas en formato array (response).

Persistencia local en sesión: Las selecciones del checklist de empaquetado y la validación de pago en VistaPreparacion se preservan en el estado del componente, mientras que el historial de las últimas 5 entregas se comparte entre pestañas mediante localStorage.

Arquitectura modular y extensible: Gracias al desacoplamiento entre componentes, hooks personalizados y servicios (pedidoService, productService), el sistema está preparado para soportar de inmediato nuevos estados de EstadoPedido o nuevas vistas operativas sin reescribir la lógica de conexión.

👥 Autores y Créditos

Proyecto desarrollado en equipo con dedicación y cuidado por los detalles:

Linneth Rodrigues 🚀

Pol Bastida Gonzalez ⚡