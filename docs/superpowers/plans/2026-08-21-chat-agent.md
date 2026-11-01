# Agente de Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Widget de chat flotante en la landing que responde FAQ, rastrea envíos por número de guía y cotiza paso a paso, con un motor de reglas/palabras clave (sin IA externa), reutilizando los endpoints públicos que ya usan `Tracking.jsx` y `Cotizacion.jsx`.

**Architecture:** Todo el trabajo es frontend en `pack_express`, sin cambios de backend. Un motor de intención puro (`intentEngine.js`) decide entre rastreo/cotización/FAQ/desconocido; un hook (`useChatAgent.js`) orquesta el estado de la conversación y las llamadas a `rastreo.php`/`tarifario.php`; un componente de UI (`ChatAgent.jsx`) adapta el template de referencia al sistema de diseño existente (CSS custom properties, framer-motion, Tailwind).

**Tech Stack:** React 19 + Vite + Tailwind v4 + Framer Motion + lucide-react (todas ya son dependencias del proyecto).

**Spec:** `docs/superpowers/specs/2026-08-21-chat-agent-design.md`

---

## Fase 1 — Extraer datos compartidos (evita duplicar lo que ya existe en Cotizacion.jsx/Footer.jsx)

### Task 1: Extraer `COUNTRY_ZONE`/`ZONE_LABELS` a un módulo compartido

**Files:**
- Create: `D:\Proyectos\pack_express\src\lib\zones.js`
- Modify: `D:\Proyectos\pack_express\src\components\Cotizacion.jsx`

- [ ] **Step 1: Crear el módulo compartido**

`Cotizacion.jsx` ya define `ZONE_LABELS` (líneas 9-19) y `COUNTRY_ZONE` (líneas 22-45) como constantes locales. El chat necesita exactamente los mismos datos para saber a qué zona pertenece el país que el usuario escribe. En vez de duplicarlos, se extraen a un módulo compartido.

```javascript
// src/lib/zones.js
/**
 * Zonas de tarifario y mapeo país → zona.
 * Fuente única — usado por Cotizacion.jsx y por el motor del chat (ChatAgent).
 */

export const ZONE_LABELS = {
  A: 'Zona A — Miami',
  B: 'Zona B — Centro América',
  C: 'Zona C — Caribe Sur / CUBA',
  D: 'Zona D — Caribe Sur / CUBA',
  E: 'Zona E — Sudamérica',
  F: 'Zona F — Caribe / Canadá',
  G: 'Zona G — Europa Occidental',
  H: 'Zona H — Europa Oriental / Asia',
  I: 'Zona I — Resto del Mundo',
}

export const COUNTRY_ZONE = {
  'Estados Unidos': 'A',
  'México': 'B', 'Guatemala': 'B', 'Belice': 'B', 'Honduras': 'B',
  'El Salvador': 'B', 'Nicaragua': 'B', 'Costa Rica': 'B', 'Panamá': 'B',
  'Colombia': 'C', 'República Dominicana': 'C', 'Puerto Rico': 'C', 'Venezuela': 'C',
  'Cuba': 'D', 'Jamaica': 'D', 'Haití': 'D', 'Trinidad y Tobago': 'D',
  'Aruba': 'D', 'Curazao': 'D', 'Barbados': 'D',
  'Ecuador': 'E', 'Perú': 'E', 'Bolivia': 'E', 'Argentina': 'E',
  'Chile': 'E', 'Brasil': 'E', 'Paraguay': 'E', 'Guyana': 'E', 'Surinam': 'E',
  'Canadá': 'F', 'Bahamas': 'F',
  'España': 'G', 'Portugal': 'G', 'Francia': 'G', 'Alemania': 'G',
  'Italia': 'G', 'Reino Unido': 'G', 'Países Bajos': 'G', 'Bélgica': 'G',
  'Suiza': 'G', 'Austria': 'G', 'Irlanda': 'G', 'Suecia': 'G',
  'Noruega': 'G', 'Dinamarca': 'G', 'Finlandia': 'G', 'Grecia': 'G',
  'Polonia': 'G', 'República Checa': 'G', 'Hungría': 'G', 'Rumanía': 'G', 'Croacia': 'G',
  'Ucrania': 'H', 'Turquía': 'H', 'Israel': 'H',
  'China': 'H', 'Japón': 'H', 'India': 'H', 'Corea del Sur': 'H',
  'Tailandia': 'H', 'Vietnam': 'H', 'Indonesia': 'H', 'Malasia': 'H',
  'Filipinas': 'H', 'Singapur': 'H', 'Taiwán': 'H',
  'Emiratos Árabes Unidos': 'H', 'Arabia Saudita': 'H', 'Qatar': 'H',
  'Australia': 'I', 'Nueva Zelanda': 'I',
  'Sudáfrica': 'I', 'Nigeria': 'I', 'Kenia': 'I', 'Egipto': 'I',
  'Marruecos': 'I', 'Tanzania': 'I', 'Ghana': 'I',
}
```

- [ ] **Step 2: Actualizar `Cotizacion.jsx` para importar en vez de definir localmente**

Reemplazar el bloque de las líneas 9-19 (`const ZONE_LABELS = {...}`) y 22-45 (`const COUNTRY_ZONE = {...}`) por un único import. El archivo actualmente empieza así:

```javascript
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, FileText, CheckCircle, MapPin, Weight, Ruler,
  ChevronDown, X, Search, Loader2, AlertTriangle, Tag,
} from 'lucide-react'

/* ── Zone labels ────────────────────────────────────────────────────────────── */
const ZONE_LABELS = {
  A: 'Zona A — Miami',
  ...
}

/* ── Country → Zone ─────────────────────────────────────────────────────────── */
const COUNTRY_ZONE = {
  'Estados Unidos': 'A',
  ...
}

/* ── Regions for CountrySelect ──────────────────────────────────────────────── */
const REGIONS = {
```

Pasa a:

```javascript
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, FileText, CheckCircle, MapPin, Weight, Ruler,
  ChevronDown, X, Search, Loader2, AlertTriangle, Tag,
} from 'lucide-react'
import { ZONE_LABELS, COUNTRY_ZONE } from '../lib/zones'

/* ── Regions for CountrySelect ──────────────────────────────────────────────── */
const REGIONS = {
```

`REGIONS` queda igual, sin tocar — solo se movieron `ZONE_LABELS` y `COUNTRY_ZONE`. El resto del archivo (línea 284 `{ZONE_LABELS[zona]}`, línea 402 `useState(COUNTRY_ZONE)`, línea 649 `{ZONE_LABELS[zona]}`) sigue funcionando igual porque los nombres importados son los mismos.

- [ ] **Step 3: Verificar build**

Run: `pnpm run build`
Expected: build exitoso, sin errores de import.

- [ ] **Step 4: Commit**

```bash
git add src/lib/zones.js src/components/Cotizacion.jsx
git commit -m "refactor: extraer ZONE_LABELS/COUNTRY_ZONE a módulo compartido src/lib/zones.js"
```

---

### Task 2: Extraer `WHATSAPP_URL` a un módulo compartido

**Files:**
- Create: `D:\Proyectos\pack_express\src\lib\whatsapp.js`
- Modify: `D:\Proyectos\pack_express\src\components\Footer.jsx`

- [ ] **Step 1: Crear el módulo compartido**

```javascript
// src/lib/whatsapp.js
/**
 * URL de contacto por WhatsApp — fuente única.
 * Usado por el botón flotante (Footer.jsx) y por el fallback del ChatAgent.
 */
export const WHATSAPP_URL = 'https://wa.me/59893594297?text=Hola%2C%20me%20gustar%C3%ADa%20cotizar%20un%20env%C3%ADo.'
```

- [ ] **Step 2: Actualizar `Footer.jsx` para importar en vez de definir localmente**

`Footer.jsx` línea 34 tiene:

```javascript
const WHATSAPP_URL = 'https://wa.me/59893594297?text=Hola%2C%20me%20gustar%C3%ADa%20cotizar%20un%20env%C3%ADo.'
```

Reemplazar esa línea completa por un import. Buscar el bloque de imports al inicio del archivo (antes de `const SOCIAL = [...]` en la línea 3-4 aproximadamente) y agregar el import ahí, eliminando la constante local:

```javascript
import { WHATSAPP_URL } from '../lib/whatsapp'
```

(La línea `const WHATSAPP_URL = '...'` se borra completamente — el resto del archivo, que usa `href={WHATSAPP_URL}`, sigue funcionando igual porque el nombre importado es el mismo.)

- [ ] **Step 3: Verificar build**

Run: `pnpm run build`
Expected: build exitoso.

- [ ] **Step 4: Commit**

```bash
git add src/lib/whatsapp.js src/components/Footer.jsx
git commit -m "refactor: extraer WHATSAPP_URL a módulo compartido src/lib/whatsapp.js"
```

---

## Fase 2 — Motor del chat

### Task 3: Base de conocimiento (`chatKnowledge.js`)

**Files:**
- Create: `D:\Proyectos\pack_express\src\components\ChatAgent\chatKnowledge.js`

- [ ] **Step 1: Escribir el archivo**

```javascript
/**
 * Base de FAQ del ChatAgent — palabras clave (con sinónimos) → respuesta.
 * Cada entrada cubre varias formas de preguntar lo mismo, no solo la forma
 * "canónica". Contenido alineado con Docs.jsx (horarios, documentación) y
 * Coverage.jsx (cobertura) — si esos textos cambian, actualizar acá también.
 */

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
]
```

- [ ] **Step 2: Verificar build**

Run: `pnpm run build`
Expected: build exitoso (el archivo no se usa todavía en ningún componente, pero debe ser JS válido).

- [ ] **Step 3: Commit**

```bash
git add src/components/ChatAgent/chatKnowledge.js
git commit -m "feat(chat-agent): base de conocimiento FAQ con sinónimos"
```

---

### Task 4: Motor de intención puro (`intentEngine.js`)

**Files:**
- Create: `D:\Proyectos\pack_express\src\components\ChatAgent\intentEngine.js`

- [ ] **Step 1: Escribir el archivo**

```javascript
/**
 * Motor de intención del ChatAgent — funciones puras, sin JSX ni efectos
 * secundarios. Recibe texto del usuario y decide qué quiere hacer.
 */
import { FAQ } from './chatKnowledge'

const PALABRAS_COTIZAR = [
  'cotizar', 'cotizacion', 'precio', 'precios', 'cuanto cuesta', 'cuanto sale',
  'tarifa', 'tarifas', 'cuanto vale', 'cuanto sale enviar', 'costo de envio',
]

/** Minúsculas, sin tildes, sin espacios extra. */
export function normalizeText(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim()
}

/** Busca un número de guía en el texto: solo dígitos (3+) o formato CM000000689PK. */
export function extraerNumeroGuia(texto) {
  const compacto = texto.replace(/\s+/g, '')
  const matchCodigo = compacto.match(/^cm0*(\d+)pk$/i)
  if (matchCodigo) return compacto

  const tokens = texto.trim().split(/\s+/)
  for (const token of tokens) {
    if (/^\d{3,}$/.test(token)) return token
  }
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
 * Primero intenta match exacto, después "el texto contiene el nombre del país".
 */
export function matchPais(texto, countryZone) {
  const norm = normalizeText(texto)
  const paises = Object.keys(countryZone)

  const exacto = paises.find(pais => normalizeText(pais) === norm)
  if (exacto) return exacto

  const contenido = paises.find(pais => norm.includes(normalizeText(pais)))
  return contenido ?? null
}

/** Busca en la lista de tipos de servicio (de la API) el que matchea el texto por nombre o código. */
export function matchTipo(texto, tipos) {
  const norm = normalizeText(texto)
  return tipos.find(t =>
    norm.includes(normalizeText(t.nombre)) || norm.includes(normalizeText(t.codigo)),
  ) ?? null
}

/** 'YYYY-MM-DD HH:MM:SS' → 'DD/MM/YYYY'. */
export function formatFechaHora(fechaHora) {
  if (!fechaHora) return ''
  const [fecha] = fechaHora.split(' ')
  const [y, m, d] = fecha.split('-')
  return `${d}/${m}/${y}`
}

/**
 * Detecta la intención del usuario. `estado.flujo === 'cotizando'` indica que
 * hay un flujo de cotización a mitad de camino esperando una respuesta puntual
 * (peso/país/tipo) — en ese caso el texto NO se re-evalúa como intención nueva.
 */
export function detectarIntencion(textoOriginal, estado) {
  if (estado?.flujo === 'cotizando') {
    return { tipo: 'cotizar_respuesta', valor: textoOriginal.trim() }
  }

  const numeroGuia = extraerNumeroGuia(textoOriginal)
  if (numeroGuia) {
    return { tipo: 'rastreo', numero: numeroGuia }
  }

  const texto = normalizeText(textoOriginal)

  if (PALABRAS_COTIZAR.some(p => texto.includes(p))) {
    return { tipo: 'cotizar_iniciar' }
  }

  for (const entrada of FAQ) {
    if (entrada.palabrasClave.some(p => texto.includes(normalizeText(p)))) {
      return { tipo: 'faq', respuesta: entrada.respuesta }
    }
  }

  return { tipo: 'desconocido' }
}
```

- [ ] **Step 2: Verificar manualmente con un script temporal**

Crear un archivo temporal (NO se commitea) para probar las funciones puras directamente con Node, ya que el proyecto no tiene un test runner instalado:

```javascript
// /tmp/verify-intent.mjs (o cualquier ruta fuera del repo)
import {
  detectarIntencion, extraerNumeroGuia, parsePeso, matchPais, matchTipo, formatFechaHora,
} from 'D:/Proyectos/pack_express/src/components/ChatAgent/intentEngine.js'
import { COUNTRY_ZONE } from 'D:/Proyectos/pack_express/src/lib/zones.js'

const casos = [
  // [descripción, resultado real, resultado esperado]
  ['guía por dígitos', extraerNumeroGuia('mi guia es 000456'), '000456'],
  ['guía formato CM', extraerNumeroGuia('CM000000689PK'), 'CM000000689PK'],
  ['guía sin match', extraerNumeroGuia('hola como estas'), null],
  ['peso válido', parsePeso('pesa 2.5 kg'), 2.5],
  ['peso con coma', parsePeso('3,2'), 3.2],
  ['peso inválido', parsePeso('no se cuanto pesa'), null],
  ['país exacto', matchPais('Cuba', COUNTRY_ZONE), 'Cuba'],
  ['país en frase', matchPais('quiero enviar a estados unidos porfa', COUNTRY_ZONE), 'Estados Unidos'],
  ['país no reconocido', matchPais('la luna', COUNTRY_ZONE), null],
  ['tipo por nombre', matchTipo('es un paquete', [{ id: 1, nombre: 'Paquete', codigo: 'PKG' }]), { id: 1, nombre: 'Paquete', codigo: 'PKG' }],
  ['fecha formato', formatFechaHora('2026-08-15 10:30:00'), '15/08/2026'],
  ['intención rastreo', detectarIntencion('000456', {}).tipo, 'rastreo'],
  ['intención cotizar', detectarIntencion('quiero cotizar un envio', {}).tipo, 'cotizar_iniciar'],
  ['intención faq horarios', detectarIntencion('a que hora abren?', {}).tipo, 'faq'],
  ['intención cotizar_respuesta en flujo', detectarIntencion('cualquier cosa', { flujo: 'cotizando' }).tipo, 'cotizar_respuesta'],
  ['intención desconocida', detectarIntencion('asdkjhaskjdh', {}).tipo, 'desconocido'],
]

let fallos = 0
for (const [desc, real, esperado] of casos) {
  const ok = JSON.stringify(real) === JSON.stringify(esperado)
  console.log(`${ok ? '✅' : '❌'} ${desc}${ok ? '' : ` — real: ${JSON.stringify(real)}, esperado: ${JSON.stringify(esperado)}`}`)
  if (!ok) fallos++
}
console.log(fallos === 0 ? '\nTodos los casos pasaron.' : `\n${fallos} caso(s) fallaron.`)
```

Run: `node /tmp/verify-intent.mjs`
Expected: `Todos los casos pasaron.` — si algún caso falla, corregir `intentEngine.js` hasta que todos pasen. Después borrar el archivo temporal (no forma parte del repo).

- [ ] **Step 3: Commit**

```bash
git add src/components/ChatAgent/intentEngine.js
git commit -m "feat(chat-agent): motor de intención puro (rastreo/cotizar/faq)"
```

---

### Task 5: Hook de orquestación (`useChatAgent.js`)

**Files:**
- Create: `D:\Proyectos\pack_express\src\components\ChatAgent\useChatAgent.js`

- [ ] **Step 1: Escribir el archivo**

```javascript
/**
 * Hook que orquesta la conversación del ChatAgent: estado de mensajes,
 * persistencia en localStorage, y el flujo de rastreo/cotización llamando
 * a los endpoints públicos que ya usan Tracking.jsx y Cotizacion.jsx.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  detectarIntencion, parsePeso, matchPais, matchTipo, formatFechaHora,
} from './intentEngine'
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
  return { activo: false, paso: null, datos: {}, intentosFallidos: 0, tipos: [] }
}

export function useChatAgent() {
  const [mensajes, setMensajes] = useState(cargarHistorial)
  const [escribiendo, setEscribiendo] = useState(false)
  const flujoRef = useRef(flujoVacio())

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
    try {
      const res  = await fetch(`${API}/rastreo.php?guia_numero=${encodeURIComponent(numero)}`)
      const json = await res.json()
      if (!json.ok) {
        ofrecerSalidaWhatsapp(`No encontré ninguna guía con el número "${numero}". Revisá que esté bien escrito, o escribinos por WhatsApp si preferís que te ayudemos directamente.`)
        return
      }
      const { guia, events } = json.data
      const ultimo = events[events.length - 1]
      if (!ultimo) {
        responderConDelay(`Encontré tu envío #${guia.numero}, pero todavía no tiene eventos de rastreo registrados.`)
        return
      }
      responderConDelay(`Tu envío #${guia.numero} está en ${ultimo.hito} desde el ${formatFechaHora(ultimo.fecha_hora)}.`)
    } catch {
      ofrecerSalidaWhatsapp('Tuve un problema para consultar el rastreo. Probá de nuevo en un momento, o escribinos por WhatsApp.')
    }
  }, [responderConDelay, ofrecerSalidaWhatsapp])

  const iniciarCotizacion = useCallback(async () => {
    flujoRef.current = { activo: true, paso: 'peso', datos: {}, intentosFallidos: 0, tipos: [] }
    try {
      const res  = await fetch(`${API}/tarifario.php?action=tipos`)
      const json = await res.json()
      flujoRef.current.tipos = json.ok ? json.data : []
    } catch {
      flujoRef.current.tipos = []
    }
    responderConDelay('¡Perfecto! ¿Cuál es el peso aproximado del envío en kg?')
  }, [responderConDelay])

  const manejarRespuestaCotizacion = useCallback(async (valor) => {
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
      const pais = matchPais(valor, COUNTRY_ZONE)
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

        const zonaCod = COUNTRY_ZONE[pais]
        const fila    = json.data.find(z => z.zona_cod === zonaCod)

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
  }, [responderConDelay, abrirCotizadorCompleto, ofrecerSalidaWhatsapp])

  const enviarMensaje = useCallback((textoUsuario) => {
    const texto = textoUsuario.trim()
    if (!texto) return
    agregarMensaje('user', texto)

    if (texto === 'Hablar por WhatsApp') {
      window.open(WHATSAPP_URL, '_blank', 'noopener')
      return
    }
    if (texto === 'Rastrear mi envío') {
      responderConDelay('Decime el número de tu guía y te digo en qué estado está.')
      return
    }
    if (texto === 'Preguntas frecuentes') {
      responderConDelay('Puedo ayudarte con: horarios de atención, cómo funciona el casillero internacional, cobertura de países y departamentos, y documentación requerida. ¿Sobre cuál querés saber más?')
      return
    }

    const intencion = detectarIntencion(texto, { flujo: flujoRef.current.activo ? 'cotizando' : null })

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
      case 'faq':
        responderConDelay(intencion.respuesta)
        break
      default:
        ofrecerSalidaWhatsapp('No tengo esa información a mano, pero podés escribirnos directamente por WhatsApp y te ayudamos.')
    }
  }, [agregarMensaje, manejarRastreo, iniciarCotizacion, manejarRespuestaCotizacion, responderConDelay, ofrecerSalidaWhatsapp])

  return { mensajes, escribiendo, enviarMensaje, iniciarBienvenida }
}
```

**Nota sobre `iniciarBienvenida`:** usa el patrón `setMensajes(prev => { if (prev.length > 0) return prev; responderConDelay(...); return prev })` — llama a `setMensajes` solo para leer el valor actual sin modificarlo (retorna `prev` sin cambios), y dispara el mensaje de bienvenida como efecto secundario solo si la conversación está vacía. Esto evita un `useEffect` adicional con `mensajes.length` como dependencia, que dispararía cada vez que cambian los mensajes.

- [ ] **Step 2: Verificar build**

Run: `pnpm run build`
Expected: build exitoso (el hook no se usa todavía en ningún componente montado, pero debe compilar sin errores).

- [ ] **Step 3: Commit**

```bash
git add src/components/ChatAgent/useChatAgent.js
git commit -m "feat(chat-agent): hook de orquestación (estado, localStorage, flujos)"
```

---

## Fase 3 — UI y montaje

### Task 6: Componente visual (`ChatAgent.jsx`)

**Files:**
- Create: `D:\Proyectos\pack_express\src\components\ChatAgent\ChatAgent.jsx`

- [ ] **Step 1: Escribir el componente**

```jsx
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send } from 'lucide-react'
import { useChatAgent } from './useChatAgent'

export default function ChatAgent() {
  const [open, setOpen] = useState(false)
  const [texto, setTexto] = useState('')
  const scrollRef = useRef(null)
  const { mensajes, escribiendo, enviarMensaje, iniciarBienvenida } = useChatAgent()

  useEffect(() => {
    if (open) iniciarBienvenida()
  }, [open, iniciarBienvenida])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensajes, escribiendo])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!texto.trim()) return
    enviarMensaje(texto)
    setTexto('')
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Cerrar chat de soporte' : 'Abrir chat de soporte'}
        className="fixed bottom-[84px] sm:bottom-[92px] right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full
                   flex items-center justify-center cursor-pointer
                   bg-[var(--bg-elevated)] border border-[#F07232]/30
                   shadow-[0_0_20px_rgba(240,114,50,0.15),0_4px_24px_rgba(0,0,0,0.25)]
                   hover:shadow-[0_0_30px_rgba(240,114,50,0.3),0_4px_24px_rgba(0,0,0,0.3)]
                   transition-[transform,box-shadow] duration-200 hover:scale-105 active:scale-95"
      >
        {open ? <X size={22} className="text-[#F07232]" /> : <Bot size={22} className="text-[#F07232]" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed z-40 bottom-[144px] sm:bottom-[156px] right-4 sm:right-6 left-4 sm:left-auto
                       sm:w-[360px] h-[65vh] sm:h-[520px] max-h-[600px]
                       rounded-2xl border border-[var(--bd-2)] overflow-hidden
                       flex flex-col bg-[var(--bg-card)] backdrop-blur-xl
                       shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--bd-1)] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F07232]/10 border border-[#F07232]/30">
                  <Bot size={16} className="text-[#F07232]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--fg-1)] leading-tight">Asistente Pack Express</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--fg-3)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    En línea
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar chat"
                className="p-1.5 rounded-lg text-[var(--fg-3)] hover:text-[var(--fg-1)] hover:bg-[var(--bd-1)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
              {mensajes.map(m => (
                <div
                  key={m.id}
                  className="flex flex-col gap-1.5"
                  style={{ alignItems: m.autor === 'user' ? 'flex-end' : 'flex-start' }}
                >
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
                    m.autor === 'user'
                      ? 'bg-[#F07232]/10 border border-[#F07232]/25 text-[var(--fg-1)]'
                      : 'bg-[var(--bg-elevated)] border border-[var(--bd-1)] text-[var(--fg-1)]'
                  }`}
                  >
                    {m.texto}
                  </div>
                  {m.chips && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.chips.map(chip => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => enviarMensaje(chip)}
                          className="text-[11px] px-2.5 py-1 rounded-full border border-[#F07232]/30 text-[#F07232] hover:bg-[#F07232]/10 transition-colors cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {escribiendo && (
                <div className="flex gap-1 bg-[var(--bg-elevated)] border border-[var(--bd-1)] rounded-xl px-3 py-2.5 w-fit">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[var(--fg-3)] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-[var(--bd-1)] shrink-0">
              <input
                type="text"
                value={texto}
                onChange={e => setTexto(e.target.value)}
                placeholder="Escribí tu mensaje..."
                className="flex-1 h-10 px-3 rounded-lg text-[13px] bg-[var(--bg-elevated)] border border-[var(--bd-1)] text-[var(--fg-1)] outline-none focus:border-[#F07232]/50 transition-colors"
              />
              <button
                type="submit"
                aria-label="Enviar mensaje"
                disabled={!texto.trim()}
                className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center bg-[#F07232] hover:bg-[#E8823C] disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <Send size={16} className="text-white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
```

- [ ] **Step 2: Verificar lint y build**

Run: `pnpm run lint`
Expected: sin errores nuevos en `ChatAgent.jsx`.

Run: `pnpm run build`
Expected: build exitoso.

- [ ] **Step 3: Commit**

```bash
git add src/components/ChatAgent/ChatAgent.jsx
git commit -m "feat(chat-agent): componente visual del widget de chat"
```

---

### Task 7: Montar el widget en `App.jsx`

**Files:**
- Modify: `D:\Proyectos\pack_express\src\App.jsx`

- [ ] **Step 1: Agregar el lazy import**

Junto a los demás lazy imports "below-the-fold" (después de `const Footer = lazy(() => import('./components/Footer'))`):

```javascript
const ChatAgent    = lazy(() => import('./components/ChatAgent/ChatAgent'))
```

- [ ] **Step 2: Montar el componente junto al Footer**

Buscar el bloque:

```jsx
        <Suspense fallback={null}>
          <footer role="contentinfo">
            <Footer />
          </footer>
        </Suspense>
      </div>

      {/* ── Legal Modal ── */}
```

Y agregar `<ChatAgent />` en su propio `Suspense`, fuera del `<footer>` (es un widget flotante, no contenido de pie de página) pero antes del cierre del `</div>` contenedor:

```jsx
        <Suspense fallback={null}>
          <footer role="contentinfo">
            <Footer />
          </footer>
        </Suspense>

        <Suspense fallback={null}>
          <ChatAgent />
        </Suspense>
      </div>

      {/* ── Legal Modal ── */}
```

- [ ] **Step 3: Verificar build**

Run: `pnpm run build`
Expected: build exitoso, aparece un chunk nuevo para `ChatAgent`.

- [ ] **Step 4: Prueba manual en el navegador**

```bash
pnpm run dev
```

En el navegador:
1. Confirmar que el botón del chat aparece arriba del botón de WhatsApp (mismo eje horizontal, sin superponerse), y que ambos son clickeables sin que uno tape al otro.
2. Abrir el chat → debe aparecer el mensaje de bienvenida con 3 chips.
3. Click en el chip "Rastrear mi envío" → el bot pide el número de guía. Escribir un número que exista en la base de datos local (o uno inventado) → confirmar que responde con el estado o con "no encontré esa guía".
4. Click en "Cotizar" (o escribir "quiero cotizar") → seguir el flujo (peso → país → tipo) y confirmar que al final muestra un precio, o que tras 2 respuestas no reconocidas abre el cotizador completo (`openCotizar`).
5. Escribir "a que hora abren" → debe responder con el horario.
6. Escribir algo sin sentido ("asdkjhaskjdh") → debe responder con el mensaje de fallback + botón "Hablar por WhatsApp"; click en ese botón debe abrir WhatsApp en una pestaña nueva.
7. Cerrar el chat, recargar la página, volver a abrirlo → la conversación anterior debe seguir ahí (persistida en `localStorage`, clave `pe_chat_history`).
8. Cambiar el tema (claro/oscuro con el `ThemeToggle` del Navbar) con el chat abierto → el panel debe adaptar sus colores sin quedar ilegible en ningún modo.
9. Probar en viewport mobile angosto (ej. 428px) → el panel debe ocupar el ancho disponible con márgenes, sin desbordar horizontalmente.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx
git commit -m "feat(chat-agent): montar ChatAgent en App.jsx, arriba del botón de WhatsApp"
```

---

## Self-Review (cobertura contra la spec)

- Motor de reglas sin IA externa, prioridad rastreo → cotizar → FAQ → desconocido: Task 4. ✓
- Base de FAQ con sinónimos, 4 temas (horarios, casillero, cobertura, documentación), en archivo de código: Task 3. ✓
- Rastreo por número de guía usando `rastreo.php` público, respuesta corta (estado + fecha): Task 5 (`manejarRastreo`). ✓
- Cotización paso a paso (peso → país → tipo) usando `tarifario.php` público, salida a cotizador completo tras 2 fallos: Task 5 (`manejarRespuestaCotizacion`). ✓
- Fallback a WhatsApp reutilizando `WHATSAPP_URL`: Task 2 + Task 5 (`ofrecerSalidaWhatsapp`). ✓
- Persistencia de mensajes en `localStorage`, sin persistir el flujo activo: Task 5 (`cargarHistorial`/`STORAGE_KEY`, `flujoRef` no persistido). ✓
- UI adaptada del template de referencia, respetando el tema claro/oscuro del sitio, acento de marca `#F07232`, posicionado arriba del botón de WhatsApp: Task 6 + Task 7. ✓
- Mensaje de bienvenida con 3 chips de sugerencia al abrir por primera vez: Task 5 (`iniciarBienvenida`) + Task 6. ✓
- Sin backend nuevo, sin API de IA: confirmado en todas las tareas (solo se llaman los dos endpoints públicos ya existentes). ✓
