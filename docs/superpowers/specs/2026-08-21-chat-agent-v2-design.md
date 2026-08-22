# Motor conversacional del ChatAgent v2 — diseño

**Fecha:** 2026-08-21
**Repo:** `pack_express` (landing) — evolución del ChatAgent existente (`src/components/ChatAgent/`). Sin backend nuevo, sin IA/LLM externa (decisión explícita, ver Alcance).

## Objetivo

Mejorar sustancialmente la naturalidad conversacional del ChatAgent dentro de las limitaciones de un motor basado en reglas (sin IA): tolerancia a errores de tipeo, saludos/small talk/despedidas naturales, detección de 2 intenciones simples en un mismo mensaje, memoria del último tema para preguntas de seguimiento breves, y un fallback en 3 niveles que evita derivar a WhatsApp como primera respuesta.

## Alcance y no-alcance (honesto, para no prometer de más)

**Incluye:**
- Fuzzy matching por palabra (tolerancia a errores de tipeo tipo "kuesta"/"csta").
- Intenciones nuevas: `GREETING` (con saludo dinámico según hora real), `SMALL_TALK`, `GOODBYE`, `THANKS`, `HUMAN_HANDOFF` explícito.
- Detección de **hasta 2** intenciones en un mismo mensaje cuando una es `GREETING`/`THANKS` y la otra es una intención de negocio reconocible (ej. "Hola, cuánto cuesta").
- Memoria de "último tema" de un solo nivel (la intención de negocio más reciente resuelta), usada solo cuando el mensaje siguiente es corto y no matchea ninguna intención nueva por sí solo.
- Fallback en 3 niveles antes de ofrecer WhatsApp.
- Expansión de la base de FAQ con contenido real del sitio (servicios, contacto, ubicación) y variantes informales/sin tildes/abreviadas.
- Reconocer preguntas sobre métodos de pago, cancelaciones/cambios y promociones como intenciones válidas, pero **sin inventar respuesta** — se deriva a WhatsApp porque esa información no existe en el sitio hoy.

**No incluye (requiere un LLM, fuera de este alcance):**
- Comprensión de lenguaje verdaderamente libre/no estructurado.
- Múltiples intenciones (3+) de temas distintos mezcladas en un mismo mensaje.
- Memoria de contexto de más de un tema hacia atrás (no es una conversación con historial semántico real).
- Desambiguación conversacional abierta (el bot ofrece opciones fijas predefinidas, no genera preguntas de aclaración dinámicas sobre temas no anticipados).
- Corrección ortográfica a nivel de frase completa — el fuzzy matching es por palabra individual contra un diccionario de términos conocidos, no un corrector general.

## Arquitectura

Mismos 4 archivos existentes en `src/components/ChatAgent/`, reescritos/expandidos. Ningún cambio de backend.

### `chatKnowledge.js` — reestructurado

Pasa de un array plano `FAQ` a una estructura con categorías separadas, todas basadas en contenido real ya existente en el sitio (`Services.jsx`, `Coverage.jsx`, `Docs.jsx`, `Footer.jsx`):

```js
export const GREETING_RESPONSES = { manana: [...5 variantes...], tarde: [...], noche: [...] }
export const SMALL_TALK = [ { palabrasClave: [...], respuestas: [...variantes...] }, ... ] // cómo estás, gracias, perfecto, ok, genial, entendido
export const GOODBYE_RESPONSES = [...variantes...]
export const FAQ = [
  // Existentes, con variantes ampliadas: horarios, casillero, cobertura, documentacion
  // Nuevas, con contenido real del sitio:
  { id: 'servicios', ... }          // los 5 servicios de Services.jsx
  { id: 'contacto', ... }           // teléfono, email, dirección de Docs.jsx/Footer.jsx
  { id: 'redes_sociales', ... }     // Instagram/Facebook de Footer.jsx
  { id: 'ubicacion', ... }          // Carlos Quijano 1258, Montevideo
  { id: 'sin_info_pago', ... }      // reconoce la pregunta, deriva a WhatsApp (sin inventar)
  { id: 'sin_info_cancelacion', ... }
  { id: 'sin_info_promociones', ... }
]
```

Cada entrada de `FAQ`/`SMALL_TALK` incluye variantes: formales, informales, sin tildes, con errores de tipeo comunes, abreviadas (q, xq, porfa, info).

### `intentEngine.js` — motor reescrito

Funciones nuevas/cambiadas (mantiene las firmas de `parsePeso`, `matchPais`, `matchTipo`, `formatFechaHora` sin cambios — el flujo de cotización no se toca):

```js
// Distancia de Levenshtein simple, sin librería externa
function levenshtein(a, b) { ... }

// true si `palabra` matchea `objetivo` exacto o con hasta 1-2 errores de tipeo
// (umbral proporcional al largo de la palabra, para no generar falsos positivos en palabras cortas)
function matchFuzzy(palabra, objetivo) { ... }

// Saludo según franja horaria real (Date.getHours()), rangos configurables en una constante
function franjaHoraria(hora) { ... } // 'manana' | 'tarde' | 'noche'

// Reemplaza a detectarIntencion (single) — devuelve un ARRAY de intenciones detectadas
export function detectarIntenciones(textoOriginal, estado) {
  // 1. Si estado.flujo === 'cotizando' → [{ tipo: 'cotizar_respuesta', valor }]  (sin cambios)
  // 2. Si el mensaje es un número de guía puro → [{ tipo: 'rastreo', numero }]  (sin cambios)
  // 3. Buscar GREETING/THANKS en el mensaje (con fuzzy matching)
  // 4. Buscar UNA intención de negocio adicional en el resto del mensaje (cotizar, faq, human_handoff)
  // 5. Si se encontró (3) y (4) → devolver ambas
  // 6. Si solo (3) → [{ tipo: 'greeting' }] o [{ tipo: 'thanks' }] o [{ tipo: 'goodbye' }] o [{ tipo: 'small_talk', respuestas }]
  // 7. Si solo (4) → [ esa intención ]
  // 8. Si nada matcheó Y hay un `estado.ultimoTema` Y el mensaje es corto (< 6 palabras) →
  //    reintentar el match de (4) asumiendo que se refiere a `estado.ultimoTema`
  // 9. Si nada → [{ tipo: 'desconocido' }]
}
```

El fuzzy matching se aplica únicamente a palabras de 4+ caracteres (palabras cortas como "el", "de", "no" quedan exactas para evitar falsos positivos), con tolerancia de 1 error para palabras de 4-7 caracteres y 2 errores para palabras de 8+.

### `useChatAgent.js` — orquestación ajustada

- `enviarMensaje` pasa a llamar `detectarIntenciones` (plural) y recorre el array, respondiendo a cada intención detectada en mensajes separados del bot (o concatenados si son cortos — a definir en implementación según qué se vea mejor).
- Se agrega `ultimoTemaRef` (un `useRef` más, mismo patrón que `flujoRef`) que guarda el `id` de la última FAQ/intención de negocio resuelta, para la heurística de "tema breve sin sujeto".
- Fallback pasa a 3 niveles con contador (`nivelFallback` en el mismo objeto de estado que ya trackea intentos), reseteado cada vez que una intención SÍ se resuelve:
  - Nivel 1: "Disculpá, no estoy seguro de haber entendido tu consulta. ¿Podés explicarme un poco más qué necesitás?"
  - Nivel 2: "Quiero ayudarte 😊. ¿Tu consulta está relacionada con nuestros servicios, precios, horarios, ubicación o rastreo de un envío?" (chips con esas 5 opciones)
  - Nivel 3: deriva a WhatsApp con el mensaje ya usado (`ofrecerSalidaWhatsapp`).
- `GREETING` con saludo dinámico reemplaza el mensaje de bienvenida fijo actual (el `iniciarBienvenida` fijo se mantiene solo para el primer mensaje automático al abrir el panel por primera vez; un saludo escrito por el usuario en cualquier momento de la conversación dispara `GREETING` con la franja horaria real).

## Ejemplo de flujo esperado

> Usuario: "Hola, cuanto sale enviar a cuba?"
> Bot: "¡Buenas tardes! 😊" + "Para darte un precio exacto necesito un par de datos — ¿querés que coticemos juntos? Escribí 'cotizar' o decime el peso aproximado."

(Nota: "cuánto sale" dispara `cotizar_iniciar`, que ya requiere el flujo paso a paso existente — no cambia, solo se le antepone el saludo detectado en el mismo mensaje.)

> Usuario: "grasias, y el horario?"
> Bot: "¡De nada! 😊" + "Nuestro horario de atención es Lunes a Viernes de 10:00 a 18:00, Sábados de 10:00 a 14:00, y Domingos cerrado."

> Usuario: "y los sabados?"  *(sin sujeto explícito, tema anterior = horarios)*
> Bot: reusa `ultimoTema = 'horarios'` → responde de nuevo la FAQ de horarios (no hay lógica para extraer "solo la parte de sábados" — eso sería NLU real; se repite la respuesta completa del tema).

## Fuera de alcance explícito

Confirmado con el usuario: no hay información real disponible hoy sobre métodos de pago, políticas de cancelación/cambio ni promociones activas. El bot reconoce estas preguntas como una intención válida (`sin_info_pago`, `sin_info_cancelacion`, `sin_info_promociones`) pero responde reconociendo que no tiene ese dato específico y deriva a WhatsApp — nunca inventa una política o método de pago.
