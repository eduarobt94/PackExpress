# Motor Conversacional del ChatAgent v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reescribir el motor de intención del ChatAgent para tolerar errores de tipeo, reconocer saludos/small talk/despedidas de forma natural con saludo dinámico según la hora real, detectar hasta 2 intenciones en un mismo mensaje, recordar el último tema para preguntas de seguimiento breves, y aplicar un fallback en 3 niveles antes de derivar a WhatsApp — todo sin IA externa.

**Architecture:** Mismos 3 archivos existentes de `src/components/ChatAgent/` (`chatKnowledge.js`, `intentEngine.js`, `useChatAgent.js`), reescritos. `chatKnowledge.js` pasa a contener saludos/small-talk/despedidas además de la FAQ ampliada. `intentEngine.js` gana fuzzy matching (Levenshtein) y una función `detectarIntenciones` (plural, reemplaza a `detectarIntencion`) que devuelve un array. `useChatAgent.js` despacha cada intención detectada con un pequeño delay escalonado para que, si hay 2, aparezcan como 2 mensajes del bot en orden.

**Tech Stack:** JavaScript puro (sin librerías nuevas) — mismo stack que el resto de `pack_express`.

**Spec:** `docs/superpowers/specs/2026-08-21-chat-agent-v2-design.md`

---

## Decisión de alcance (de la spec, repetida acá para que no se pierda)

**Fuzzy matching (tolerancia a errores de tipeo) se aplica SOLO a la detección de saludos/small-talk/despedidas/FAQ/cotizar-humano.** NO se aplica a `matchPais`/`matchTipo` dentro del flujo de cotización — esas funciones ya están probadas en producción calculando precios reales, y agregarles fuzzy matching arriesga introducir falsos positivos en algo que afecta directamente lo que se le cobra a un cliente. Quedan exactamente como están hoy.

---

### Task 1: Base de conocimiento ampliada (`chatKnowledge.js`)

**Files:**
- Modify: `D:\Proyectos\pack_express\src\components\ChatAgent\chatKnowledge.js` (reemplazo completo del archivo)

- [ ] **Step 1: Reemplazar todo el contenido del archivo**

```javascript
/**
 * Base de conocimiento del ChatAgent — saludos, small talk, despedidas y FAQ.
 * Contenido alineado con el sitio real (Services.jsx, Coverage.jsx, Docs.jsx,
 * Footer.jsx) — si esos textos cambian, actualizar acá también. Nunca se
 * inventa información que no exista en el sitio (ver sin_info_* al final).
 */

/** Palabras/frases que disparan un saludo (respuesta dinámica según hora real, ver intentEngine.js). */
export const GREETING_PALABRAS = [
  'hola', 'holaa', 'holaaa', 'holaaaa', 'buenas', 'buenass', 'buenasss',
  'buen dia', 'buenos dias', 'buenas tardes', 'buenas noches',
  'hey', 'hi', 'hello', 'que tal', 'hay alguien', 'estan atendiendo',
  'hay alguien disponible', 'me pueden ayudar', 'necesito ayuda',
  'necesito informacion', 'una pregunta', 'tengo una consulta',
]

export const GREETING_RESPONSES = {
  manana: [
    '¡Buenos días! 😊 ¿En qué puedo ayudarte?',
    '¡Buenos días! Es un gusto atenderte. ¿Qué información necesitás?',
    '¡Buenos días! ¿Cómo puedo ayudarte?',
    '¡Buenos días! 👋 Contame, ¿qué necesitás?',
    '¡Buenos días! Estoy acá para ayudarte. ¿Qué deseás consultar?',
  ],
  tarde: [
    '¡Buenas tardes! 😊 ¿En qué puedo ayudarte?',
    '¡Buenas tardes! ¿Qué consulta tenés?',
    '¡Buenas tardes! Es un gusto atenderte. ¿Cómo puedo ayudarte?',
    '¡Buenas tardes! 👋 Contame, ¿qué necesitás?',
    '¡Buenas tardes! Estoy acá para ayudarte.',
  ],
  noche: [
    '¡Buenas noches! 😊 ¿En qué puedo ayudarte?',
    '¡Buenas noches! ¿Qué deseás consultar?',
    '¡Buenas noches! Estoy acá para ayudarte.',
    '¡Buenas noches! 👋 Contame, ¿qué necesitás?',
  ],
}

/** Small talk: cada grupo trae su propio `tipo` (usado tal cual como tipo de intención). */
export const SMALL_TALK = [
  {
    tipo: 'small_talk',
    palabrasClave: ['como estas', 'como andas', 'como te va', 'todo bien', 'como estan'],
    respuestas: [
      '¡Muy bien, gracias! 😊 Estoy acá para ayudarte. ¿Qué necesitás consultar?',
      '¡Todo muy bien! 😊 ¿En qué puedo ayudarte?',
    ],
  },
  {
    tipo: 'thanks',
    palabrasClave: ['gracias', 'muchas gracias', 'mil gracias', 'te agradezco', 'grasias'],
    respuestas: [
      '¡Con mucho gusto! 😊',
      '¡A vos! Estamos para ayudarte.',
    ],
  },
  {
    tipo: 'small_talk',
    palabrasClave: ['perfecto', 'genial', 'ok', 'okay', 'dale', 'entendido', 'buenisimo', 'joya'],
    respuestas: [
      '¡Excelente! 😊 ¿Necesitás algo más?',
      'Perfecto 👍 ¿Te ayudo con algo más?',
    ],
  },
]

export const GOODBYE_PALABRAS = [
  'adios', 'chau', 'chao', 'nos vemos', 'hasta luego', 'hasta pronto',
  'eso era todo', 'no necesito nada mas', 'eso es todo', 'gracias hasta luego',
  'gracias por la ayuda', 'listo gracias', 'nada mas gracias',
]

export const GOODBYE_RESPONSES = [
  '¡Con mucho gusto! Que tengas un excelente día.',
  '¡Gracias a vos! Cuando necesites, acá estamos.',
  '¡Perfecto! Que tengas un excelente día. 😊',
  '¡Hasta luego! Fue un gusto ayudarte.',
]

export const FAQ = [
  {
    id: 'horarios',
    palabrasClave: [
      'horario', 'horarios', 'a que hora', 'a que hora abren', 'a que hora cierran',
      'cuando atienden', 'cuando abren', 'dias de atencion', 'estan abiertos',
      'trabajan los sabados', 'abren los sabados', 'atencion al publico',
      'estan abiertos ahora', 'hoy atienden', 'abren hoy',
    ],
    respuesta: 'Nuestro horario de atención es Lunes a Viernes de 10:00 a 18:00, Sábados de 10:00 a 14:00, y Domingos cerrado.',
  },
  {
    id: 'casillero',
    palabrasClave: [
      'casillero', 'casillero internacional', 'como funciona el casillero',
      'comprar en estados unidos', 'comprar en eeuu', 'comprar en usa',
      'comprar afuera', 'compras en el exterior', 'abrir un casillero',
      'como abro mi casillero', 'que es el casillero', 'como comprar en amazon',
      'direccion en estados unidos', 'direccion en miami',
    ],
    respuesta: 'El Casillero Internacional te da una dirección en EE.UU. para comprar en tiendas americanas. Nosotros recibimos tus compras, las consolidamos y te las enviamos a Uruguay con la gestión aduanera incluida.',
  },
  {
    id: 'cobertura',
    palabrasClave: [
      'cobertura', 'a que paises envian', 'paises destino', 'envian a',
      'llegan a', 'departamentos', 'todo uruguay', 'interior del pais',
      'cuantos paises', 'a donde envian', 'zonas de reparto',
      'envian al interior', 'llegan al interior', 'hacen envios internacionales',
    ],
    respuesta: 'Tenemos cobertura en los 19 departamentos de Uruguay y hacemos envíos internacionales a más de 50 países en América, Europa, Asia y Oceanía.',
  },
  {
    id: 'documentacion',
    palabrasClave: [
      'documentacion', 'documentos', 'declaracion jurada', 'que documentos necesito',
      'requisitos', 'requisitos para enviar', 'articulos prohibidos',
      'que no puedo enviar', 'que esta prohibido enviar', 'papeles necesarios',
      'que necesito para enviar', 'que no se puede mandar',
    ],
    respuesta: 'Para envíos internacionales necesitás completar la Declaración Jurada. También tenés disponible la lista de Artículos Prohibidos y los Requisitos Courier en la sección Documentación de la página.',
  },
  {
    id: 'servicios',
    palabrasClave: [
      'servicios', 'que servicios tienen', 'que hacen', 'que ofrecen',
      'a que se dedican', 'que puedo enviar', 'tipos de envio',
    ],
    respuesta: 'Ofrecemos Paquetería Courier (nacional e internacional), Casillero Internacional, Equipaje No Acompañado, Envío de Documentos y Distribución Nacional en todo Uruguay.',
  },
  {
    id: 'contacto',
    palabrasClave: [
      'contacto', 'telefono', 'numero de telefono', 'email', 'correo',
      'como los contacto', 'como me comunico', 'mail', 'numero de contacto',
    ],
    respuesta: 'Podés contactarnos al (+598) 93 594 297 (Lunes a viernes 10:00-18:00) o por correo a packexpress2021@gmail.com (respuesta en menos de 24 h).',
  },
  {
    id: 'ubicacion',
    palabrasClave: [
      'ubicacion', 'direccion', 'donde estan', 'donde queda', 'donde se ubican',
      'donde los encuentro', 'domicilio', 'sede', 'oficina',
    ],
    respuesta: 'Estamos en Carlos Quijano 1258, Montevideo, Uruguay.',
  },
  {
    id: 'redes_sociales',
    palabrasClave: [
      'instagram', 'facebook', 'redes sociales', 'redes', 'tienen instagram',
      'tienen facebook',
    ],
    respuesta: 'Nos encontrás en Instagram como @packexpressuruguay y en Facebook como Pack Express Uruguay.',
  },
  {
    id: 'sin_info_pago',
    derivaWhatsapp: true,
    palabrasClave: [
      'metodos de pago', 'como pago', 'formas de pago', 'aceptan tarjeta',
      'aceptan transferencia', 'se puede pagar en efectivo', 'como se paga',
    ],
    respuesta: 'Para confirmarte las formas de pago disponibles según tu envío, mejor te conecto con nuestro equipo por WhatsApp.',
  },
  {
    id: 'sin_info_cancelacion',
    derivaWhatsapp: true,
    palabrasClave: [
      'cancelar', 'cancelar envio', 'quiero cancelar', 'puedo cancelar',
      'cambiar el envio', 'modificar mi envio', 'anular envio',
    ],
    respuesta: 'Para cancelar o modificar un envío ya solicitado, nuestro equipo te va a poder ayudar directamente por WhatsApp.',
  },
  {
    id: 'sin_info_promociones',
    derivaWhatsapp: true,
    palabrasClave: [
      'promocion', 'promociones', 'descuento', 'descuentos', 'oferta',
      'ofertas', 'hay alguna promo',
    ],
    respuesta: 'Las promociones vigentes te las puede confirmar nuestro equipo directamente por WhatsApp.',
  },
]
```

- [ ] **Step 2: Verificar build**

Run: `pnpm run build`
Expected: build exitoso (el archivo todavía no lo consume ningún componente con la forma nueva, pero debe ser JS válido).

- [ ] **Step 3: Commit**

```bash
git add src/components/ChatAgent/chatKnowledge.js
git commit -m "feat(chat-agent): base de conocimiento v2 — saludos, small talk, despedidas y FAQ ampliada"
```

---

### Task 2: Motor de intención v2 (`intentEngine.js`)

**Files:**
- Modify: `D:\Proyectos\pack_express\src\components\ChatAgent\intentEngine.js` (reemplazo completo del archivo)

- [ ] **Step 1: Reemplazar todo el contenido del archivo**

```javascript
/**
 * Motor de intención del ChatAgent — funciones puras, sin JSX ni efectos
 * secundarios. Recibe texto del usuario y decide qué quiere hacer.
 */
import {
  FAQ, SMALL_TALK, GREETING_PALABRAS, GREETING_RESPONSES, GOODBYE_PALABRAS,
} from './chatKnowledge'

const PALABRAS_COTIZAR = [
  'cotizar', 'cotizacion', 'precio', 'precios', 'cuanto cuesta', 'cuanto sale',
  'tarifa', 'tarifas', 'cuanto vale', 'costo de envio',
]

const PALABRAS_HUMANO = [
  'hablar con una persona', 'hablar con alguien', 'hablar con un humano',
  'necesito un asesor', 'hablar con un agente', 'pasame con alguien',
  'quiero whatsapp', 'me pasas el whatsapp', 'contactar por whatsapp',
  'hablar con un operador',
]

/** Minúsculas, sin tildes, sin espacios extra. */
export function normalizeText(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/** Distancia de Levenshtein entre dos strings cortos (palabras individuales). */
function levenshtein(a, b) {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const fila = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    let anterior = fila[0]
    fila[0] = i
    for (let j = 1; j <= n; j++) {
      const temp = fila[j]
      const costo = a[i - 1] === b[j - 1] ? 0 : 1
      fila[j] = Math.min(fila[j] + 1, fila[j - 1] + 1, anterior + costo)
      anterior = temp
    }
  }
  return fila[n]
}

/** Tolerancia de errores según el largo de la palabra objetivo: 0 para <4, 1 para 4-7, 2 para 8+. */
function toleranciaPara(largo) {
  if (largo < 4) return 0
  if (largo < 8) return 1
  return 2
}

/** true si alguna palabra de `texto` matchea `objetivo` exacto o con tolerancia a errores de tipeo. */
function palabraFuzzyEn(texto, objetivo) {
  const tolerancia = toleranciaPara(objetivo.length)
  return texto.split(/\s+/).some(palabra => {
    if (palabra === objetivo) return true
    if (tolerancia === 0) return false
    if (Math.abs(palabra.length - objetivo.length) > tolerancia) return false
    return levenshtein(palabra, objetivo) <= tolerancia
  })
}

/** Frases de una sola palabra toleran errores de tipeo; frases de varias palabras exigen substring exacto. */
function contieneFrase(textoNormalizado, frase) {
  const fraseNorm = normalizeText(frase)
  if (fraseNorm.includes(' ')) return textoNormalizado.includes(fraseNorm)
  return palabraFuzzyEn(textoNormalizado, fraseNorm)
}

function contieneAlguna(textoNormalizado, frases) {
  return frases.some(frase => contieneFrase(textoNormalizado, frase))
}

/** Busca un número de guía: el mensaje entero debe ser solo dígitos (3+) o formato CM000000689PK. */
export function extraerNumeroGuia(texto) {
  const compacto = texto.trim().replace(/\s+/g, '')
  const matchCodigo = compacto.match(/^cm0*(\d+)pk$/i)
  if (matchCodigo) return compacto
  if (/^\d{3,}$/.test(compacto)) return compacto
  return null
}

/** Extrae el primer número (con decimales) del texto, o null si no hay ninguno válido (> 0). */
export function parsePeso(texto) {
  const match = texto.replace(',', '.').match(/(\d+(\.\d+)?)/)
  if (!match) return null
  const valor = parseFloat(match[1])
  return valor > 0 ? valor : null
}

/**
 * Busca el nombre de país (clave de countryZone) que mejor matchea el texto.
 * Primero intenta match exacto, después "el texto contiene el nombre del país"
 * con límite de palabra. Sin fuzzy matching acá a propósito: el flujo de
 * cotización ya está probado en producción calculando precios reales — no
 * vale la pena el riesgo de un falso positivo ahí.
 */
export function matchPais(texto, countryZone) {
  const norm = normalizeText(texto)
  const paises = Object.keys(countryZone)

  const exacto = paises.find(pais => normalizeText(pais) === norm)
  if (exacto) return exacto

  const contenido = paises.find(pais => {
    const paisNorm = normalizeText(pais)
    return new RegExp(`\\b${paisNorm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(norm)
  })
  return contenido ?? null
}

/** Busca en la lista de tipos de servicio (de la API) el que matchea el texto por nombre o código. */
export function matchTipo(texto, tipos) {
  const norm = normalizeText(texto)
  return tipos.find(t => {
    const nombreNorm = normalizeText(t.nombre)
    return norm.includes(nombreNorm) || nombreNorm.includes(norm) || norm.includes(normalizeText(t.codigo))
  }) ?? null
}

/** 'YYYY-MM-DD HH:MM:SS' → 'DD/MM/YYYY'. */
export function formatFechaHora(fechaHora) {
  if (!fechaHora) return ''
  const [fecha] = fechaHora.split(' ')
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

/** Franja horaria real: mañana 05:00-11:59, tarde 12:00-18:59, noche 19:00-04:59. Rangos configurables acá. */
export function franjaHoraria(hora) {
  if (hora >= 5 && hora < 12) return 'manana'
  if (hora >= 12 && hora < 19) return 'tarde'
  return 'noche'
}

/** Elige una respuesta de saludo al azar según la hora real del dispositivo del usuario. */
export function elegirSaludo(fecha = new Date()) {
  const franja = franjaHoraria(fecha.getHours())
  const opciones = GREETING_RESPONSES[franja]
  return opciones[Math.floor(Math.random() * opciones.length)]
}

/**
 * Busca UNA intención "de negocio" (humano, cotizar, o FAQ) en el texto ya
 * normalizado. No incluye rastreo/cotizar_respuesta (se resuelven antes, en
 * detectarIntenciones) ni greeting/small_talk/goodbye (se resuelven aparte).
 */
function buscarIntencionDeNegocio(texto) {
  if (contieneAlguna(texto, PALABRAS_HUMANO)) {
    return { tipo: 'human_handoff' }
  }
  if (contieneAlguna(texto, PALABRAS_COTIZAR)) {
    return { tipo: 'cotizar_iniciar' }
  }
  for (const entrada of FAQ) {
    if (contieneAlguna(texto, entrada.palabrasClave)) {
      return { tipo: 'faq', respuesta: entrada.respuesta, temaId: entrada.id, derivaWhatsapp: !!entrada.derivaWhatsapp }
    }
  }
  return null
}

/**
 * Detecta todas las intenciones del mensaje. Devuelve un ARRAY, nunca vacío.
 * `estado`: { flujo: 'cotizando' | null, ultimoTema: string | null }
 *
 * Prioridad: flujo de cotización en curso > número de guía > despedida >
 * small talk > saludo (+ intención de negocio si viene combinado en el mismo
 * mensaje) > intención de negocio sola > "último tema" si el mensaje es
 * corto y no matchea nada por sí solo > desconocido.
 */
export function detectarIntenciones(textoOriginal, estado) {
  if (estado?.flujo === 'cotizando') {
    return [{ tipo: 'cotizar_respuesta', valor: textoOriginal.trim() }]
  }

  const numeroGuia = extraerNumeroGuia(textoOriginal)
  if (numeroGuia) {
    return [{ tipo: 'rastreo', numero: numeroGuia }]
  }

  const texto = normalizeText(textoOriginal)

  if (contieneAlguna(texto, GOODBYE_PALABRAS)) {
    return [{ tipo: 'goodbye' }]
  }

  for (const grupo of SMALL_TALK) {
    if (contieneAlguna(texto, grupo.palabrasClave)) {
      return [{ tipo: grupo.tipo, respuestas: grupo.respuestas }]
    }
  }

  const esGreeting = contieneAlguna(texto, GREETING_PALABRAS)
  const negocio = buscarIntencionDeNegocio(texto)

  if (esGreeting && negocio) return [{ tipo: 'greeting' }, negocio]
  if (esGreeting) return [{ tipo: 'greeting' }]
  if (negocio) return [negocio]

  if (estado?.ultimoTema && textoOriginal.trim().split(/\s+/).length < 6) {
    const temaPrevio = FAQ.find(f => f.id === estado.ultimoTema)
    if (temaPrevio) {
      return [{ tipo: 'faq', respuesta: temaPrevio.respuesta, temaId: temaPrevio.id, derivaWhatsapp: !!temaPrevio.derivaWhatsapp }]
    }
  }

  return [{ tipo: 'desconocido' }]
}
```

- [ ] **Step 2: Verificar manualmente con un script temporal**

Crear (con la herramienta Write, no con heredoc de shell, para evitar problemas de encoding con tildes ya vistos antes en este proyecto) un archivo temporal fuera del repo, por ejemplo `C:\Users\Eduardo\AppData\Local\Temp\claude\verify-intent-v2.mjs`, con este contenido (usando imports relativos a las rutas reales del repo):

```javascript
import {
  detectarIntenciones, franjaHoraria, elegirSaludo, matchPais, matchTipo,
} from 'D:/Proyectos/pack_express/src/components/ChatAgent/intentEngine.js'
import { COUNTRY_ZONE } from 'D:/Proyectos/pack_express/src/lib/zones.js'
import { GREETING_RESPONSES } from 'D:/Proyectos/pack_express/src/components/ChatAgent/chatKnowledge.js'

const casos = [
  ['franja mañana', franjaHoraria(9), 'manana'],
  ['franja tarde', franjaHoraria(14), 'tarde'],
  ['franja noche', franjaHoraria(21), 'noche'],
  ['franja madrugada', franjaHoraria(2), 'noche'],
  ['saludo pertenece a su franja', GREETING_RESPONSES[franjaHoraria(10)].includes(elegirSaludo(new Date(2026, 0, 1, 10))), true],
  ['rastreo sin cambios', detectarIntenciones('000456', {})[0].tipo, 'rastreo'],
  ['cotizar_respuesta en flujo', detectarIntenciones('cualquier cosa', { flujo: 'cotizando' })[0].tipo, 'cotizar_respuesta'],
  ['saludo solo', detectarIntenciones('Hola', {}).map(i => i.tipo), ['greeting']],
  ['saludo + cotizar combinados', detectarIntenciones('Hola, cuanto cuesta enviar algo', {}).map(i => i.tipo), ['greeting', 'cotizar_iniciar']],
  ['saludo + faq combinados', detectarIntenciones('Buenas, en que horario atienden', {}).map(i => i.tipo), ['greeting', 'faq']],
  ['small talk gracias', detectarIntenciones('muchas gracias', {})[0].tipo, 'thanks'],
  ['small talk como estas', detectarIntenciones('como andas', {})[0].tipo, 'small_talk'],
  ['despedida', detectarIntenciones('bueno chau', {})[0].tipo, 'goodbye'],
  ['humano explicito', detectarIntenciones('quiero hablar con una persona', {})[0].tipo, 'human_handoff'],
  ['faq con error de tipeo (fuzzy)', detectarIntenciones('cuanto kuesta', {})[0].tipo, 'cotizar_iniciar'],
  ['faq horarios con error de tipeo', detectarIntenciones('orarios de atencion', {})[0].tipo, 'faq'],
  ['sin info de pago deriva whatsapp', detectarIntenciones('como pago mi envio', {})[0].derivaWhatsapp, true],
  ['mensaje corto usa ultimo tema', detectarIntenciones('y los sabados', { ultimoTema: 'horarios' })[0].temaId, 'horarios'],
  ['mensaje corto sin ultimo tema es desconocido', detectarIntenciones('y eso', {})[0].tipo, 'desconocido'],
  ['mensaje sin sentido no matchea nada por fuzzy', detectarIntenciones('asdkjhaskjdh', {})[0].tipo, 'desconocido'],
  ['pais sigue exacto/con limite de palabra (sin fuzzy)', matchPais('necesito enviar una incubadora', COUNTRY_ZONE), null],
  ['tipo bidireccional sigue funcionando', matchTipo('paquete', [{ id: 2, nombre: 'Paquetería', codigo: 'PKG' }])?.id, 2],
]

let fallos = 0
for (const [desc, real, esperado] of casos) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${desc}${ok ? '' : ` — real: ${JSON.stringify(real)}, esperado: ${JSON.stringify(esperado)}`}`)
  if (!ok) fallos++
}
console.log(fallos === 0 ? '\nTodos los casos pasaron.' : `\n${fallos} caso(s) fallaron.`)
```

Run: `node <ruta-del-archivo-temporal>.mjs`
Expected: `Todos los casos pasaron.` — si algún caso falla, corregir `intentEngine.js` o `chatKnowledge.js` hasta que todos pasen (Node ESM exige extensión `.js` explícita en imports relativos, a diferencia de Vite — si hace falta, usar una copia temporal con los imports parchados para probar, tal como se hizo la vez anterior que se verificó este archivo; el archivo real del repo debe quedar SIN extensión en sus imports internos, que es lo correcto para Vite). Después borrar el archivo temporal (no forma parte del repo).

- [ ] **Step 3: Commit**

```bash
git add src/components/ChatAgent/intentEngine.js
git commit -m "feat(chat-agent): motor de intencion v2 — fuzzy matching, greeting/small-talk/goodbye, multi-intencion, ultimo tema"
```

---

### Task 3: Orquestación v2 (`useChatAgent.js`)

**Files:**
- Modify: `D:\Proyectos\pack_express\src\components\ChatAgent\useChatAgent.js` (reemplazo completo del archivo)

- [ ] **Step 1: Reemplazar todo el contenido del archivo**

```javascript
/**
 * Hook que orquesta la conversación del ChatAgent: estado de mensajes,
 * persistencia en localStorage, y los flujos de rastreo/cotización/FAQ
 * llamando a los endpoints públicos que ya usan Tracking.jsx y Cotizacion.jsx.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  detectarIntenciones, parsePeso, matchPais, matchTipo, formatFechaHora, elegirSaludo,
} from './intentEngine'
import { GOODBYE_RESPONSES } from './chatKnowledge'
import { COUNTRY_ZONE, ZONE_LABELS } from '../../lib/zones'
import { WHATSAPP_URL } from '../../lib/whatsapp'

const API = '/pack-sistema/api/v1'
const STORAGE_KEY = 'pe_chat_history'
const MAX_INTENTOS_FALLIDOS = 2

function cargarHistorial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function crearMensaje(autor, texto, chips = null) {
  return { id: crypto.randomUUID(), autor, texto, chips, ts: Date.now() }
}

function flujoVacio() {
  return { activo: false, paso: null, datos: {}, intentosFallidos: 0, tipos: [], zonaMap: COUNTRY_ZONE }
}

function contextoVacio() {
  return { ultimoTema: null, nivelFallback: 0 }
}

export function useChatAgent() {
  const [mensajes, setMensajes] = useState(cargarHistorial)
  const [escribiendo, setEscribiendo] = useState(false)
  const flujoRef = useRef(flujoVacio())
  const contextoRef = useRef(contextoVacio())
  const procesandoRef = useRef(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mensajes))
  }, [mensajes])

  const agregarMensaje = useCallback((autor, texto, chips = null) => {
    setMensajes(prev => [...prev, crearMensaje(autor, texto, chips)])
  }, [])

  const responderConDelay = useCallback((texto, chips = null) => {
    setEscribiendo(true)
    const delay = 500 + Math.random() * 700
    setTimeout(() => {
      setEscribiendo(false)
      agregarMensaje('bot', texto, chips)
    }, delay)
  }, [agregarMensaje])

  const iniciarBienvenida = useCallback(() => {
    setMensajes(prev => {
      if (prev.length > 0) return prev
      responderConDelay(
        '¡Hola! 👋 Soy el asistente de Pack Express. Puedo ayudarte a rastrear un envío, cotizar, o responder preguntas frecuentes.',
        ['Rastrear mi envío', 'Cotizar', 'Preguntas frecuentes'],
      )
      return prev
    })
  }, [responderConDelay])

  const ofrecerSalidaWhatsapp = useCallback((mensaje) => {
    responderConDelay(mensaje, ['Hablar por WhatsApp'])
  }, [responderConDelay])

  const abrirCotizadorCompleto = useCallback((mensaje) => {
    flujoRef.current = flujoVacio()
    window.dispatchEvent(new CustomEvent('openCotizar'))
    responderConDelay(mensaje)
  }, [responderConDelay])

  const manejarRastreo = useCallback(async (numero) => {
    if (procesandoRef.current) return
    procesandoRef.current = true
    try {
      const res  = await fetch(`${API}/rastreo.php?guia_numero=${encodeURIComponent(numero)}`)
      const json = await res.json()
      if (!json.ok) {
        ofrecerSalidaWhatsapp(`No encontré ninguna guía con el número "${numero}". Revisá que esté bien escrito, o escribinos por WhatsApp si preferís que te ayudemos directamente.`)
        return
      }
      const { guia, events } = json.data
      const ultimo = (events ?? [])[(events ?? []).length - 1]
      if (!ultimo) {
        responderConDelay(`Encontré tu envío #${guia.numero}, pero todavía no tiene eventos de rastreo registrados.`)
        return
      }
      responderConDelay(`Tu envío #${guia.numero} está en ${ultimo.hito} desde el ${formatFechaHora(ultimo.fecha_hora)}.`)
    } catch {
      ofrecerSalidaWhatsapp('Tuve un problema para consultar el rastreo. Probá de nuevo en un momento, o escribinos por WhatsApp.')
    } finally {
      procesandoRef.current = false
    }
  }, [responderConDelay, ofrecerSalidaWhatsapp])

  const iniciarCotizacion = useCallback(async () => {
    if (procesandoRef.current) return
    procesandoRef.current = true
    flujoRef.current = { activo: true, paso: 'peso', datos: {}, intentosFallidos: 0, tipos: [], zonaMap: COUNTRY_ZONE }
    try {
      const [tiposRes, zonasRes] = await Promise.all([
        fetch(`${API}/tarifario.php?action=tipos`),
        fetch(`${API}/tarifario.php?action=zonas`),
      ])
      const tiposJson = await tiposRes.json()
      flujoRef.current.tipos = tiposJson.ok ? tiposJson.data : []

      const zonasJson = await zonasRes.json()
      if (zonasJson.ok && Array.isArray(zonasJson.data)) {
        flujoRef.current.zonaMap = Object.fromEntries(zonasJson.data.map(p => [p.nombre, p.zona_cod]))
      }
    } catch {
      flujoRef.current.tipos = []
    } finally {
      procesandoRef.current = false
    }
    responderConDelay('¡Perfecto! ¿Cuál es el peso aproximado del envío en kg?')
  }, [responderConDelay])

  const manejarRespuestaCotizacion = useCallback(async (valor) => {
    if (procesandoRef.current) return
    procesandoRef.current = true
    try {
    const flujo = flujoRef.current

    if (flujo.paso === 'peso') {
      const peso = parsePeso(valor)
      if (peso == null) {
        flujo.intentosFallidos += 1
        if (flujo.intentosFallidos >= MAX_INTENTOS_FALLIDOS) {
          abrirCotizadorCompleto('Para cotizar con más detalle, te abrí el cotizador completo.')
          return
        }
        responderConDelay('No pude entender el peso, ¿podés escribirlo solo en números? Ej: 2.5')
        return
      }
      flujo.datos.peso = peso
      flujo.paso = 'pais'
      flujo.intentosFallidos = 0
      responderConDelay('¿A qué país enviamos?')
      return
    }

    if (flujo.paso === 'pais') {
      const pais = matchPais(valor, flujo.zonaMap)
      if (!pais) {
        flujo.intentosFallidos += 1
        if (flujo.intentosFallidos >= MAX_INTENTOS_FALLIDOS) {
          abrirCotizadorCompleto('Para cotizar con más detalle, te abrí el cotizador completo.')
          return
        }
        responderConDelay('No reconocí ese país, ¿podés escribirlo de nuevo? Por ejemplo: Estados Unidos, España, Cuba.')
        return
      }
      flujo.datos.pais = pais
      flujo.paso = 'tipo'
      flujo.intentosFallidos = 0
      const nombresTipos = flujo.tipos.map(t => t.nombre).join(', ') || 'paquete, documento'
      responderConDelay(`¿Qué tipo de envío es? (${nombresTipos})`)
      return
    }

    if (flujo.paso === 'tipo') {
      const tipo = matchTipo(valor, flujo.tipos)
      if (!tipo) {
        flujo.intentosFallidos += 1
        if (flujo.intentosFallidos >= MAX_INTENTOS_FALLIDOS) {
          abrirCotizadorCompleto('Para cotizar con más detalle, te abrí el cotizador completo.')
          return
        }
        responderConDelay('No reconocí ese tipo de envío, ¿podés elegir uno de la lista?')
        return
      }

      const { peso, pais } = flujo.datos
      const zonaMap = flujo.zonaMap
      try {
        const res  = await fetch(`${API}/tarifario.php?action=cotizar_todas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ peso, tipo_servicio_id: tipo.id }),
        })
        const json = await res.json()
        flujoRef.current = flujoVacio()

        if (!json.ok) {
          abrirCotizadorCompleto('Tuve un problema calculando la cotización. Te abrí el cotizador completo para que puedas intentarlo ahí.')
          return
        }

        const zonaCod = zonaMap[pais]
        const fila    = json.data.zonas.find(z => z.zona_cod === zonaCod)

        if (!fila || !fila.disponible) {
          responderConDelay(`No tengo una tarifa disponible para ${pais} con ${peso} kg en este momento. Te recomiendo escribirnos por WhatsApp para confirmarlo.`, ['Hablar por WhatsApp'])
          return
        }
        responderConDelay(`Envío de ${peso} kg a ${pais} (${ZONE_LABELS[zonaCod]}): USD ${fila.total.toFixed(2)}. Este precio es estimado, se confirma al gestionar el envío.`)
      } catch {
        flujoRef.current = flujoVacio()
        ofrecerSalidaWhatsapp('Tuve un problema calculando la cotización. Probá de nuevo, o escribinos por WhatsApp.')
      }
    }
    } finally {
      procesandoRef.current = false
    }
  }, [responderConDelay, abrirCotizadorCompleto, ofrecerSalidaWhatsapp])

  /** Procesa UNA intención ya detectada (puede haber varias por mensaje, ver enviarMensaje). */
  const procesarIntencion = useCallback((intencion) => {
    if (intencion.tipo !== 'desconocido') {
      contextoRef.current.nivelFallback = 0
    }

    switch (intencion.tipo) {
      case 'rastreo':
        manejarRastreo(intencion.numero)
        break
      case 'cotizar_iniciar':
        iniciarCotizacion()
        break
      case 'cotizar_respuesta':
        manejarRespuestaCotizacion(intencion.valor)
        break
      case 'greeting':
        responderConDelay(elegirSaludo())
        break
      case 'goodbye':
        responderConDelay(GOODBYE_RESPONSES[Math.floor(Math.random() * GOODBYE_RESPONSES.length)])
        break
      case 'small_talk':
      case 'thanks':
        responderConDelay(intencion.respuestas[Math.floor(Math.random() * intencion.respuestas.length)])
        break
      case 'human_handoff':
        responderConDelay('¡Dale! Te paso directo con nuestro equipo para que te ayuden mejor.', ['Hablar por WhatsApp'])
        break
      case 'faq':
        contextoRef.current.ultimoTema = intencion.temaId
        if (intencion.derivaWhatsapp) {
          responderConDelay(intencion.respuesta, ['Hablar por WhatsApp'])
        } else {
          responderConDelay(intencion.respuesta)
        }
        break
      default: {
        contextoRef.current.nivelFallback += 1
        const nivel = contextoRef.current.nivelFallback
        if (nivel === 1) {
          responderConDelay('Disculpá, no estoy seguro de haber entendido tu consulta. ¿Podés explicarme un poco más qué necesitás?')
        } else if (nivel === 2) {
          responderConDelay(
            'Quiero ayudarte 😊 ¿Tu consulta está relacionada con nuestros servicios, precios, horarios, ubicación o rastreo de un envío?',
            ['Servicios', 'Cotizar', 'Horarios', 'Ubicación', 'Rastrear mi envío'],
          )
        } else {
          contextoRef.current.nivelFallback = 0
          ofrecerSalidaWhatsapp('Para esta consulta necesito la ayuda de una persona de nuestro equipo. Podés contactarnos por WhatsApp y te ayudamos directamente.')
        }
      }
    }
  }, [responderConDelay, ofrecerSalidaWhatsapp, manejarRastreo, iniciarCotizacion, manejarRespuestaCotizacion])

  const enviarMensaje = useCallback((textoUsuario) => {
    const texto = textoUsuario.trim()
    if (!texto) return
    agregarMensaje('user', texto)

    if (procesandoRef.current) {
      return
    }

    if (texto === 'Hablar por WhatsApp') {
      window.open(WHATSAPP_URL, '_blank', 'noopener')
      return
    }
    if (texto === 'Rastrear mi envío') {
      responderConDelay('Decime el número de tu guía y te digo en qué estado está.')
      return
    }
    if (texto === 'Preguntas frecuentes') {
      responderConDelay('Puedo ayudarte con: horarios de atención, cómo funciona el casillero internacional, cobertura de países y departamentos, nuestros servicios, contacto, ubicación y documentación requerida. ¿Sobre cuál querés saber más?')
      return
    }

    const intenciones = detectarIntenciones(texto, {
      flujo: flujoRef.current.activo ? 'cotizando' : null,
      ultimoTema: contextoRef.current.ultimoTema,
    })

    intenciones.forEach((intencion, i) => {
      setTimeout(() => procesarIntencion(intencion), i * 800)
    })
  }, [agregarMensaje, responderConDelay, procesarIntencion])

  return { mensajes, escribiendo, enviarMensaje, iniciarBienvenida }
}
```

- [ ] **Step 2: Verificar build**

Run: `pnpm run build`
Expected: build exitoso.

- [ ] **Step 3: Commit**

```bash
git add src/components/ChatAgent/useChatAgent.js
git commit -m "feat(chat-agent): orquestar multi-intencion, fallback en 3 niveles y ultimo tema"
```

---

### Task 4: Verificación end-to-end en navegador

**Files:** ninguno (solo verificación manual)

- [ ] **Step 1: Levantar el dev server**

```bash
pnpm run dev
```

- [ ] **Step 2: Limpiar estado previo**

En la consola del navegador: `localStorage.removeItem('pe_chat_history')` y recargar la página, para arrancar con una conversación limpia.

- [ ] **Step 3: Probar cada escenario y confirmar la respuesta esperada**

| # | Mensaje del usuario | Comportamiento esperado |
|---|---|---|
| 1 | `Hola` | Responde SOLO con un saludo dinámico según la hora real (no deriva a WhatsApp) |
| 2 | `Hola, cuanto cuesta enviar algo` | Dos mensajes del bot en orden: saludo, y luego inicia el flujo de cotización ("¿Cuál es el peso...?") |
| 3 | `grasias` (con error de tipeo) | Responde con una variante de agradecimiento (intención `thanks`) |
| 4 | `como andas` | Responde con small talk, no deriva a WhatsApp |
| 5 | `chau, gracias por todo` | Responde con una despedida |
| 6 | `cuanto kuesta` (error de tipeo en "cuesta") | Reconoce igual la intención de cotizar (fuzzy matching) |
| 7 | `orarios` (sin h, error de tipeo) | Reconoce la FAQ de horarios igual |
| 8 | `en que horario atienden` seguido de `y los sabados?` | La segunda pregunta corta reutiliza el tema "horarios" sin repreguntar |
| 9 | `como pago mi envio` | Responde reconociendo que no tiene ese dato y ofrece el chip "Hablar por WhatsApp" (no inventa una forma de pago) |
| 10 | `quiero hablar con una persona` | Responde derivando a WhatsApp inmediatamente (handoff explícito) |
| 11 | `asdkjhaskjdh` tres veces seguidas | Primera vez: pide reformular. Segunda vez: ofrece categorías con chips. Tercera vez: deriva a WhatsApp |
| 12 | Flujo completo de cotización (cotizar → peso → país real → tipo) | Sigue funcionando exactamente igual que antes (no se tocó `matchPais`/`matchTipo`/el flujo en sí) |
| 13 | Un número de guía real (ej. `CM000000689PK`) | El rastreo sigue funcionando igual que antes |

- [ ] **Step 4: Si algún caso falla**

Volver a `intentEngine.js`/`chatKnowledge.js`/`useChatAgent.js`, corregir, verificar de nuevo con `pnpm run build`, repetir el caso puntual en el navegador. No hace falta repetir los 13 casos completos por cada fix — solo el que falló y los directamente relacionados.

- [ ] **Step 5: Commit final (si hubo fixes durante la verificación)**

```bash
git add src/components/ChatAgent/
git commit -m "fix(chat-agent): ajustes tras verificacion en vivo del motor v2"
```

(Si no hizo falta ningún fix, no hay nada que commitear en este paso — los Tasks 1-3 ya quedaron commiteados.)

---

## Self-Review (cobertura contra la spec)

- Fuzzy matching por palabra, tolerancia 1-2 según largo, excluyendo `matchPais`/`matchTipo`: Task 2. ✓
- `GREETING` con saludo dinámico según hora real, banco de variantes: Task 1 (`GREETING_RESPONSES`) + Task 2 (`franjaHoraria`, `elegirSaludo`). ✓
- `SMALL_TALK`, `GOODBYE`, `THANKS`: Task 1 (contenido) + Task 2 (detección) + Task 3 (respuesta con variante al azar). ✓
- Detección de hasta 2 intenciones combinadas (greeting + negocio): Task 2 (`detectarIntenciones`) + Task 3 (dispatch escalonado). ✓
- Memoria de "último tema" para preguntas cortas de seguimiento: Task 2 (`estado.ultimoTema`) + Task 3 (`contextoRef.current.ultimoTema`). ✓
- Fallback en 3 niveles antes de WhatsApp: Task 3 (`case default` con `nivelFallback`). ✓
- Preguntas sobre pago/cancelación/promociones reconocidas pero sin inventar respuesta, derivan a WhatsApp: Task 1 (`sin_info_*` con `derivaWhatsapp: true`) + Task 3 (chip "Hablar por WhatsApp" cuando `derivaWhatsapp`). ✓
- `HUMAN_HANDOFF` explícito: Task 2 (`PALABRAS_HUMANO`) + Task 3. ✓
- No tocar el flujo de cotización/rastreo existente: confirmado línea por línea en Task 3, idéntico a la versión actual salvo el import de `detectarIntenciones` (antes `detectarIntencion`) y la extracción de `procesarIntencion`. ✓
- No inventar información no disponible en el sitio: contenido de `chatKnowledge.js` (Task 1) grounded en `Services.jsx`/`Docs.jsx`/`Footer.jsx`/`Coverage.jsx` reales. ✓
