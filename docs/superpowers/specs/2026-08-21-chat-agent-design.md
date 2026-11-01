# Agente de chat en la landing — diseño

**Fecha:** 2026-08-21
**Repo:** `pack_express` (landing) — sin cambios de backend, reutiliza endpoints públicos ya existentes en `pack-sistema`.

## Objetivo

Un widget de chat flotante en la landing que responda preguntas frecuentes, rastree envíos por número de guía y cotice paso a paso, sin depender de un modelo de IA externo (costo cero, sin API key). El motor es un sistema de reglas y coincidencia de palabras clave, no un LLM.

## Alcance y no-alcance

**Incluye:** widget visual (botón + panel), detección de intención por reglas, base de FAQ por palabras clave con sinónimos, flujo de rastreo, flujo de cotización paso a paso, persistencia en `localStorage`, fallback a WhatsApp.

**No incluye:** integración con ningún proveedor de IA/LLM, backend nuevo, panel de administración para editar las FAQ (quedan en un archivo de código), comprensión de lenguaje natural más allá de coincidencia de palabras clave/patrones.

## Arquitectura

Todo el trabajo vive en el frontend de `pack_express`. No se toca `public_html/pack-sistema` — el chat reutiliza dos endpoints públicos que la landing ya consume hoy desde otros componentes:

- `GET /pack-sistema/api/v1/rastreo.php?guia_numero=X` (público, usado hoy por `Tracking.jsx`)
- `POST /pack-sistema/api/v1/tarifario.php?action=cotizar_todas` con body `{ peso, tipo_servicio_id }` (público, usado hoy por `Cotizacion.jsx`)

### Archivos nuevos

```
src/components/ChatAgent/
  ChatAgent.jsx        — botón flotante + panel (UI)
  useChatAgent.js       — hook: estado de conversación, localStorage, orquestación
  intentEngine.js        — función pura: texto → intención detectada
  chatKnowledge.js       — base de FAQ (palabras clave + sinónimos → respuesta)
```

Se monta una vez en `App.jsx`, junto al `Footer`, como componente hermano de `PromoBanner`/`Navbar` (no dentro de ninguno de los dos).

## Motor de intención (`intentEngine.js`)

Función pura `detectarIntencion(texto, estadoConversacion)`. Sin JSX, sin efectos secundarios — recibe el texto normalizado (minúsculas, sin tildes, trim) y el estado actual de la conversación (para saber si hay un flujo de cotización a mitad de camino esperando una respuesta puntual), y devuelve un objeto de una de estas formas:

```js
{ tipo: 'rastreo', numero: string }
{ tipo: 'cotizar_iniciar' }
{ tipo: 'cotizar_respuesta', valor: string }   // cuando estadoConversacion.flujo === 'cotizando'
{ tipo: 'faq', respuesta: string }
{ tipo: 'desconocido' }
```

**Prioridad de detección (en este orden):**
1. Si `estadoConversacion.flujo === 'cotizando'` → se interpreta el texto como respuesta al paso actual (`cotizar_respuesta`), no se re-evalúa como intención nueva.
2. Patrón de número de guía: `/^\d{3,}$/` (solo dígitos, 3+) o `/^cm0*\d+pk$/i` (formato código externo) en el texto completo o como token aislado.
3. Palabras de cotización: lista de términos (`cotizar`, `cotización`, `precio`, `precios`, `cuanto cuesta`, `cuánto sale`, `tarifa`, `tarifas`, `cuanto vale`) — si alguna aparece → `cotizar_iniciar`.
4. Búsqueda en `chatKnowledge.js`: por cada entrada, si el texto contiene alguna de sus `palabrasClave` → `faq` con esa respuesta. Primera coincidencia gana (las entradas se recorren en orden, sin scoring).
5. Si nada matcheó → `desconocido`.

## Base de conocimiento (`chatKnowledge.js`)

Array de entradas. **Cada entrada cubre varias formas de preguntar lo mismo** (sinónimos, informal/formal, con/sin signos de pregunta) — no solo la palabra "canónica":

```js
export const FAQ = [
  {
    id: 'horarios',
    palabrasClave: [
      'horario', 'horarios', 'a que hora', 'a que hora abren', 'a que hora cierran',
      'cuando atienden', 'cuando abren', 'dias de atencion', 'estan abiertos',
      'trabajan los sabados', 'abren los sabados', 'atencion al publico',
    ],
    respuesta: 'Nuestro horario de atención es Lunes a Viernes de 10:00 a 18:00, Sábados de 10:00 a 14:00, y Domingos cerrado.',
  },
  {
    id: 'casillero',
    palabrasClave: [
      'casillero', 'casillero internacional', 'como funciona el casillero',
      'comprar en estados unidos', 'comprar en eeuu', 'comprar en usa',
      'comprar afuera', 'compras en el exterior', 'abrir un casillero',
      'como abro mi casillero', 'que es el casillero',
    ],
    respuesta: 'El Casillero Internacional te da una dirección en EE.UU. para comprar en tiendas americanas. Nosotros recibimos tus compras, las consolidamos y te las enviamos a Uruguay con la gestión aduanera incluida.',
  },
  {
    id: 'cobertura',
    palabrasClave: [
      'cobertura', 'a que paises envian', 'paises destino', 'envian a',
      'llegan a', 'departamentos', 'todo uruguay', 'interior del pais',
      'cuantos paises', 'a donde envian', 'zonas de reparto',
    ],
    respuesta: 'Tenemos cobertura en los 19 departamentos de Uruguay y hacemos envíos internacionales a más de 50 países en América, Europa, Asia y Oceanía.',
  },
  {
    id: 'documentacion',
    palabrasClave: [
      'documentacion', 'documentos', 'declaracion jurada', 'que documentos necesito',
      'requisitos', 'requisitos para enviar', 'articulos prohibidos',
      'que no puedo enviar', 'que esta prohibido enviar', 'papeles necesarios',
    ],
    respuesta: 'Para envíos internacionales necesitás completar la Declaración Jurada. También tenés disponible la lista de Artículos Prohibidos y los Requisitos Courier en la sección Documentación de la página.',
  },
]
```

Contenido tomado de `Docs.jsx` (horarios, documentación) y `Coverage.jsx` (cobertura) para no desincronizarse del resto del sitio.

## Flujo de rastreo

1. `intentEngine` detecta `{ tipo: 'rastreo', numero }`.
2. `useChatAgent` llama `GET /pack-sistema/api/v1/rastreo.php?guia_numero={numero}`.
3. Si `ok: true` → responde: `Tu envío #{numero} está en {estado_actual} desde el {fecha}.` — solo estado actual + fecha, sin listar los 11 hitos.
4. Si `404` o error → responde: `No encontré ninguna guía con ese número. Revisá que esté bien escrito, o escribinos por WhatsApp si preferís que te ayudemos directamente.` con el link de WhatsApp.

## Flujo de cotización paso a paso

Estado de conversación mientras cotiza: `{ flujo: 'cotizando', paso: 'peso' | 'pais' | 'tipo', datos: { peso, pais, tipo_servicio_id } }`.

1. `cotizar_iniciar` → bot pregunta: *"¿Cuál es el peso aproximado del envío en kg?"*, `paso = 'peso'`.
2. Usuario responde → si el texto parsea a número > 0 → guarda `datos.peso`, pregunta *"¿A qué país enviamos?"*, `paso = 'pais'`. Si no parsea → *"No pude entender el peso, ¿podés escribirlo solo en números? Ej: 2.5"* (mismo paso, no avanza).
3. País → matchea contra la lista de países ya usada en `Cotizacion.jsx` (reutilizar `COUNTRY_ZONE`/lista de países del propio componente, importándola o extrayéndola a un módulo compartido si hace falta). Si no matchea ningún país conocido → repregunta una vez con la lista de continentes como ayuda.
4. Tipo de envío → pregunta *"¿Qué tipo de envío es: paquete, documento o equipaje?"*, matchea contra `tipos` (`apiGetTipos()`).
5. Con los 3 datos → llama `POST /tarifario.php?action=cotizar_todas` con `{ peso, tipo_servicio_id }`, muestra el resultado (zona/precio, igual formato que el cotizador).
6. **Salida por fallo repetido:** si en cualquier paso el usuario no da una respuesta interpretable **dos veces seguidas**, el bot corta el flujo y responde con un botón/mensaje: *"Para cotizar con más detalle, abrí el cotizador completo"* que dispara `window.dispatchEvent(new CustomEvent('openCotizar'))` (el mismo evento que ya usa el Navbar).

## Fallback sin match (`desconocido`)

Mensaje genérico + link directo a WhatsApp, reutilizando `WHATSAPP_URL` de `Footer.jsx` (extraerlo a un módulo compartido, ej. `src/lib/whatsapp.js`, para no duplicar el string): *"No tengo esa información a mano, pero podés escribirnos directamente por WhatsApp y te ayudamos."*

## UI (`ChatAgent.jsx`)

Adaptado del template de referencia (`index.html`/`style.css`/`script.js` provisto), con estos cambios:

- **Tema:** usa las CSS custom properties del sitio (`--bg-card`, `--bg-elevated`, `--fg-1`, `--fg-2`, `--bd-1`, `--bd-2`) en vez de los colores fijos oscuros del template — respeta el `ThemeToggle` existente (claro/oscuro).
- **Acento:** `#F07232` (marca) reemplaza el amarillo `#FFD60A` del template en glow, borde animado, botón de enviar y burbujas de usuario.
- **Posición:** botón flotante `fixed bottom-24 right-6 z-40` (o el valor exacto que quede arriba del botón de WhatsApp de `Footer.jsx`, que usa `bottom-6 right-6 z-40` con `w-12 h-12 sm:w-14 sm:h-14`) — mismo eje horizontal, apilado verticalmente por encima.
- **Estructura:** se mantiene el layout del template (header con avatar + nombre + estado, área de mensajes, indicador de "escribiendo", input + botón enviar) pero como componentes React controlados, no manipulación directa del DOM como en el `script.js` original.
- **Mensaje de bienvenida:** al abrir por primera vez (sin historial en localStorage), muestra un saludo + 3 sugerencias rápidas como chips/botones: "Rastrear mi envío", "Cotizar", "Preguntas frecuentes" (estos disparan las mismas intenciones que si el usuario las escribiera).
- **Responsive:** en mobile, el panel ocupa ancho casi completo con márgenes laterales chicos, igual que el `@media (max-width: 440px)` del template de referencia.

## Persistencia (`useChatAgent.js`)

- Historial de mensajes (`{ texto, autor: 'user'|'bot', ts }[]`) guardado en `localStorage` bajo `pe_chat_history`.
- Estado de flujo activo (si estaba a mitad de una cotización) **no** se persiste — al recargar la página, si había un flujo en curso, se pierde y el usuario puede volver a escribir "cotizar" para reiniciarlo. Solo se persisten los mensajes ya intercambiados.
- Sin límite de expiración por ahora (queda hasta que el usuario borre datos del navegador o limpiemos código a futuro) — no se guarda ningún dato personal más allá del texto que el usuario decide escribir.

## Testing

`intentEngine.js` al ser una función pura es testeable de forma aislada sin necesidad de un test runner instalado en el proyecto — se verifica manualmente en la implementación con casos de entrada/salida documentados en el propio plan de implementación (el proyecto no tiene suite de tests automatizados, se usa `pnpm run build` como gate real, igual que el resto de `pack_express`).
