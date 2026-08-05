# Ticketera · Frontend

Plataforma interactiva de venta de entradas para eventos independientes de Jazz y Rnb: consulta la cartelera, explora el evento destacado y reserva
entradas en línea.

Es el frontend del proyecto integrador iniciado en el **Hito 1** (core de dominio puro en
Java). Este frontend consume un **mock API (Express)** y, si el servidor no está
disponible, cae automáticamente a una fuente de datos local (`public/data/events.json`).

## Links del proyecto

- **Repositorio Hito 1:** [Link](https://github.com/pablocelva/hito1-ticketera)
- **Despliegue en Netlify:** [Link](https://ticketera-hito-2.netlify.app/)

## Contexto: del Hito 1 (Java) a este frontend

El dominio modelado en Java se traduce a TypeScript y a los contratos HTTP del mock API:

| Dominio del Hito 1 (Java) | Equivalente en este frontend |
|---|---|
| `Event.getAvailableTickets()` / `hasAvailability()` | `EventService.getAvailableTickets()` / `hasAvailability()` → `capacity - ticketsSold` |
| `TicketPool.reserve()` → `SoldOutException` | `POST /api/v1/bookings` → HTTP `409` |
| `OrderValidator.validate()` → `InvalidOrderException` | Validación en el cliente + HTTP `400` |
| `OrderService.processOrder()` → `BookingConfirmation` | `BookingService.createBooking()` → `Booking` con `BookingStatus.CONFIRMED` |
| `EventRepository` / `NotificationService` | `EventService` (fetch + fallback) / pantalla de confirmación |

## Tecnologías

- **TypeScript Vanilla** — tipado estricto, cero `any` (type guards con `unknown`)
- **Vite** — bundler y servidor de desarrollo (con proxy de `/api`)
- **Tailwind CSS v4** — estilos utilitarios (plugin de Vite)
- **Módulos nativos ES** — `import`/`export` sin frameworks de UI
- **Lucide** — iconos SVG
- **Vitest + jsdom** — tests unitarios y de componentes (cobertura con `@vitest/coverage-v8`)
- **Express + CORS** — mock API (solo dentro de `mockapi/`)

## Requisitos

- **Node.js ≥ 20.19** (lo exige Vite 8; recomendado 22.x)
- **pnpm** (o npm)
- Para la mock API: `express` y `cors` (se instalan con `pnpm install` dentro de `mockapi/`)

## Estructura del repositorio

```
hito2-ticketera-frontend/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts            # Tailwind plugin, proxy /api, config de Vitest
├── index.html
├── mockapi/                  # backend simulado (Express + CORS), puerto 3100
│   ├── package.json
│   ├── data.js               # eventos cartelera
│   └── server.js             # endpoints de eventos y reservas
├── public/
│   ├── data/events.json      # fallback estático (fechas DD-MM-YYYY)
│   ├── images/               # imágenes de los artistas + placeholder.svg
│   └── favicon.svg
├── src/
│   ├── main.ts               # bootstrap asíncrono (Top-Level Await)
│   ├── config/app.config.ts  # endpoints, moneda, delay simulado
│   ├── models/               # interfaces + enums (EventStatus, BookingStatus)
│   ├── services/             # fetch asíncrono + parseo tipado + fallback
│   ├── views/eventBoard.view.ts
│   ├── components/           # EventCard, FeaturedBanner, BookingForm, skeletons, states, EventToolbar, Footer
│   ├── utils/                # fechas, moneda, iconos, validaciones
│   └── styles/global.css     # tema y animaciones (Tailwind v4)
└── tests/                    # utils, config, services, components, views
```

## Instalación y ejecución

```bash
# 1) Backend simulado (mock API) — terminal 1
cd mockapi
pnpm install
pnpm start            # http://localhost:3100

# 2) Frontend — terminal 2
cd ..
pnpm install
pnpm run dev          # http://localhost:5173 (proxy /api → :3100)
```

Si la mock API no está corriendo, la app usa automáticamente
`public/data/events.json` como respaldo.

## Mock API (Express)

Simula el backend del Hito 1: lista de eventos, detalle, un endpoint de error y la
creación de reservas con las reglas de negocio (`capacity - ticketsSold`).

| Método | Endpoint | Respuesta |
|---|---|---|
| `GET` | `/api/v1/events` | Cartelera completa (`200`) |
| `GET` | `/api/v1/events/:id` | Detalle de un evento (`200` / `404`) |
| `GET` | `/api/v1/events-error` | Error de servidor simulado (`500`) |
| `POST` | `/api/v1/bookings` | Reserva (`201` / `400` payload inválido / `404` evento inexistente / `409` sin stock) |

Para probar el flujo de error en vivo:

```bash
curl http://localhost:3100/api/v1/events-error
curl -X POST http://localhost:3100/api/v1/bookings -H "Content-Type: application/json" -d '{"eventId":"evt-2","customerName":"Ana","customerEmail":"ana@mail.com","quantity":99,"unitPrice":38000}'
```

## Fuente de respaldo (fallback estático)

`EventService.getAllEvents()` intenta primero el mock API; ante **cualquier** error (red
apagada, `500`, cuerpo malformado) cae automáticamente a `public/data/events.json`.

- El mock API entrega fechas en formato **ISO** (`2026-10-10T20:00:00`).
- El fallback usa **`DD-MM-YYYY`** (`10-10-2026`).
- `parseEventDate()` (`src/utils/date.utils.ts`) reconoce ambos formatos y devuelve una
  fecha de respaldo ante valores inválidos.

## Contrato de datos

### `Event` (`src/models/events.ts`)

| Campo | Tipo | Descripción |
|---|---|---|
| `id` | `string` | Identificador (`evt-1` … `evt-10`) |
| `title` / `artist` | `string` | Título del evento y artista |
| `venue` / `city` | `string` | Sede y ciudad |
| `date` | `Date` | Fecha (parseada con `parseEventDate`) |
| `time` | `string` | Hora (`20:00`) |
| `price` | `number` | Precio por entrada en **CLP** |
| `capacity` / `ticketsSold` | `number` | Disponibilidad = `capacity - ticketsSold` |
| `status` | `EventStatus` | Estado tipado con `enum` |
| `imageUrl?` | `string` | Imagen del artista (`/images/…`) |
| `isFeatured?` | `boolean` | Marca el evento destacado (banner) |

### `EventStatus`

`SCHEDULED` (próximamente) · `ON_SALE` (a la venta) · `SOLD_OUT` (agotado) · `LIVE` (en
vivo) · `FINISHED` (finalizado) · `CANCELED` (cancelado)

### `Booking` (`src/models/booking.ts`)

`id`, `eventId`, `customerName`, `customerEmail`, `quantity`, `unitPrice`, `totalPrice`,
`status` (`BookingStatus`: `PENDING` · `CONFIRMED` · `REJECTED` · `CANCELLED`),
`createdAt`.

## Arquitectura del frontend

- **`config/`** — valores centrales: endpoints (`/api/v1/events`, `/api/v1/bookings`),
  moneda (`es-CL`, CLP) y delay de red simulado (600 ms).
- **`models/`** — interfaces y enums puros, sin lógica.
- **`services/`** — capa asíncrona: `fetch` + `response.ok` + `try/catch` + parseo con
  type guards (`unknown`, cero `any`) + estrategia de fallback (local y ante respuestas
  no-JSON de un host sin API).
- **`views/`** — `EventBoardView` orquesta los estados (loading, render, vacío, error),
  crea/sincroniza la barra de filtros y maneja los clics en la grilla.
- **`components/`** — piezas de UI generadas como templates dinámicos: `EventCard`,
  `FeaturedBanner`, `BookingForm`, `EventToolbar`, `Footer`, `LoadingSkeleton` y
  `StateViews`. `EventToolbar` guarda el filtro actual (WeakMap) para combinar controles
  sin recrear el DOM y sin perder el foco del buscador.
- **`utils/`** — fechas, moneda, iconos, validaciones (email, rango), filtros/orden de
  eventos (funciones puras) y serialización de filtros en la URL.
- **`styles/`** — tema escenario (violeta/fucsia, Space Grotesk) y animación `fade-up`
  (respeta `prefers-reduced-motion`).
- **`main.ts`** — bootstrap: lee los filtros desde la URL, re-renderiza la cartelera al
  cambiar un filtro y actualiza la URL con `history.replaceState`.

## Flujo de datos

1. `main.ts` pide la cartelera a `EventService.getAllEvents()` (API → fallback JSON).
2. `EventBoardView` muestra skeletons, la barra de filtros, el banner destacado
   (`isFeatured`) y la grilla.
3. Los filtros (búsqueda por texto, ciudad, estado) y el ordenamiento (fecha, precio,
   nombre, disponibilidad) se aplican con funciones puras
   (`src/utils/event.filter.utils.ts`) y se reflejan en la URL
   (`?q=...&ciudad=...&estado=...&orden=...`).
4. Al pulsar "Comprar Entradas" se preselecciona el evento en el formulario.
5. `BookingForm` valida en el cliente y envía la reserva con `POST /api/v1/bookings`.
6. Éxito → pantalla de confirmación con código y total. Error (409 agotado / 400 / 500 /
   502 backend caído / red) → mensaje amigable en pantalla.

## Estrategia de resiliencia

- **`EventService`**: cualquier fallo de la API → respaldo estático. Si ambos fallan, se
  propaga el error y la vista muestra el estado de error con botón "Reintentar".
- **`BookingService`**: solo un `TypeError` de `fetch` (servidor apagado) genera una
  reserva local de respaldo; los errores de negocio (`4xx`/`5xx`) se propagan y se
  traducen a mensajes amigables para el usuario (p. ej. `502` → "El servicio de reservas
  no está disponible en este momento").
- Si la respuesta de error **no es JSON** (p. ej. una página HTML con `404` de un host
  estático sin API, como Netlify), se interpreta como "servicio de reservas no disponible"
  y no como un evento inexistente.

## Scripts

| Comando | Descripción |
|---|---|
| `pnpm run dev` | Servidor de desarrollo (Vite) |
| `pnpm run build` | `tsc` (verificación estricta) + `vite build` |
| `pnpm run preview` | Previsualizar el build de producción |
| `pnpm run test` | Ejecutar la suite Vitest |
| `pnpm run coverage` | Suite + reporte de cobertura (v8, umbral 100% en `vite.config.ts`) |

## Tests

Suite actual: **18 archivos / 148 tests** en verde.

- `tests/utils/` — fechas (ISO y DD-MM-YYYY), moneda, validaciones, iconos, HTTP,
  filtros/orden de eventos y URL de filtros
- `tests/config/` — configuración de la app
- `tests/services/` — `EventService` (parseo, `response.ok`, fallback) y `BookingService`
  (confirmación, 400/404/409/502/5xx, mensajes de servidor, respaldo local)
- `tests/components/` — `BookingForm`, `EventCard`, `FeaturedBanner`, `EventToolbar`,
  `Footer`, `StateViews`, `LoadingSkeleton`
- `tests/views/` — `EventBoardView` (loading, filtros, render, vacío, error, clics y
  guards nulos)

> **Cobertura 100 %:** la suite alcanza 100 % en líneas, funciones, ramas y sentencias
> (`pnpm run coverage`). El `exclude` ignora `src/main.ts`, los barrels `**/index.ts`
> y archivos de config/build. Unas pocas guardias de nulidad son inalcanzables por
> diseño y están documentadas con `/* c8 ignore */` en el código.

## Personalización de datos

- Los eventos viven en dos lugares que deben mantenerse en sincronía:
  - `mockapi/data.js` (fuente primaria, fechas ISO)
  - `public/data/events.json` (fallback, fechas `DD-MM-YYYY`)
- Las imágenes de los artistas van en `public/images/`; si una imagen falta, la tarjeta
  usa `placeholder.svg` por medio del `onerror`.
- La moneda, los endpoints y el delay se configuran en `src/config/app.config.ts`.
