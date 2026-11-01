// src/lib/analytics.js
/**
 * Única vía de salida hacia Google Analytics 4 (Google tag / gtag.js, sin GTM).
 * Plan y justificación: docs/GOOGLE_ANALYTICS_IMPLEMENTATION_PLAN.md
 *
 * Reglas:
 *  - Nada se carga ni se envía hasta que el usuario acepta (modo "básico" de
 *    Consent Mode: sin consentimiento NO hay requests a Google).
 *  - Todo evento pasa por track(), que descarta lo que no esté en SCHEMA: así
 *    no se puede colar PII (nombre, email, teléfono, nº de guía, texto libre).
 *  - gtag() se inicia desde acá y no desde un <script> inline porque la CSP
 *    (public/.htaccess) no permite scripts inline.
 */

const GA_ID       = import.meta.env.VITE_GA_MEASUREMENT_ID
const DEBUG       = import.meta.env.VITE_GA_DEBUG === '1'   // propiedad de pruebas + DebugView
const PROD_HOST   = 'packexpress.com.uy'
const CONSENT_KEY = 'pe-consent'                            // 'granted' | 'denied'

/** Evento → parámetros permitidos. Cualquier otro parámetro se descarta. */
const SCHEMA = {
  generate_lead:    ['lead_source', 'form_topic'],
  form_start:       ['form_type'],
  form_error:       ['form_type', 'error_type'],
  quote_open:       ['source'],
  quote_calculated: ['destination_country', 'service_type', 'zone', 'weight_bucket', 'source'],
  track_shipment:   ['result', 'origin'],
  tracking_repeat:  ['count_bucket'],
  whatsapp_click:   ['placement', 'topic'],
  contact_click:    ['method'],
  legal_open:       ['doc'],
  // Chat: solo categorías cerradas del motor de intenciones. NUNCA el texto que escribe el usuario.
  chat_open:            [],
  chat_intent:          ['intent', 'faq_topic', 'country'],
  chat_unrecognized:    ['step', 'level'],
  chat_quote_completed: ['destination_country', 'service_type', 'weight_bucket', 'mode'],
  chat_quote_abandoned: ['step', 'reason'],
  chat_handoff:         ['reason'],
}

/** ¿Está la analítica habilitada en este entorno? (ID presente + host permitido) */
export const analyticsEnabled = () =>
  Boolean(GA_ID) && (DEBUG || location.hostname === PROD_HOST)

export function getConsent() {
  try { return localStorage.getItem(CONSENT_KEY) } catch { return null }
}

let loaded = false
let queue  = []
let last   = { key: '', t: 0 }

function load() {
  if (loaded || !analyticsEnabled()) return
  loaded = true
  window.dataLayer = window.dataLayer || []
  // gtag necesita recibir el objeto `arguments`, no un array.
  window.gtag = function () { window.dataLayer.push(arguments) }

  // Solo se llega acá con consentimiento previo. Las señales de publicidad
  // quedan siempre denegadas: el sitio no usa Google Ads.
  window.gtag('consent', 'default', {
    analytics_storage:  'granted',
    ad_storage:         'denied',
    ad_user_data:       'denied',
    ad_personalization: 'denied',
  })
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, {
    allow_google_signals:             false,
    allow_ad_personalization_signals: false,
    ...(DEBUG ? { debug_mode: true } : {}),
  })

  const s = document.createElement('script')
  s.async = true
  s.src   = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`
  document.head.appendChild(s)

  queue.forEach(([name, params]) => window.gtag('event', name, params))
  queue = []
}

/** Borra las cookies _ga* de GA4 al revocar el consentimiento. */
function clearGaCookies() {
  const hosts = [location.hostname, `.${location.hostname.replace(/^www\./, '')}`]
  document.cookie.split(';').forEach(c => {
    const name = c.split('=')[0].trim()
    if (name === '_ga' || name.startsWith('_ga_')) {
      hosts.forEach(domain => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${domain}`
      })
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    }
  })
}

/** Clasificación de un clic en enlaces de contacto (delegado: un solo listener). */
function onDocumentClick(e) {
  const a = e.target instanceof Element ? e.target.closest('a[href]') : null
  if (!a) return
  const href = a.getAttribute('href') || ''
  if (href.startsWith('tel:'))         return track('contact_click', { method: 'phone' })
  if (href.startsWith('mailto:'))      return track('contact_click', { method: 'email' })
  if (/^https:\/\/wa\.me\//.test(href)) {
    track('whatsapp_click', {
      placement: a.dataset.gaPlacement || 'other',
      topic:     /casillero/i.test(decodeURIComponent(href)) ? 'locker_waitlist' : 'quote',
    })
  }
}

/** Se llama una vez al arrancar la app. */
export function initAnalytics() {
  if (!analyticsEnabled()) return
  document.addEventListener('click', onDocumentClick)
  if (getConsent() === 'granted') load()
}

/** Guarda la decisión del usuario y la aplica. */
export function setConsent(granted) {
  try { localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied') } catch { /* sin storage */ }
  if (granted) {
    if (loaded) window.gtag('consent', 'update', { analytics_storage: 'granted' })
    else        load()
  } else {
    queue = []
    if (loaded) window.gtag('consent', 'update', { analytics_storage: 'denied' })
    clearGaCookies()
  }
}

/** Envía un evento del catálogo. No-op sin consentimiento, sin ID o fuera de prod. */
export function track(name, params = {}) {
  const allowed = SCHEMA[name]
  if (!allowed || !analyticsEnabled() || getConsent() !== 'granted') return
  const clean = Object.fromEntries(
    Object.entries(params).filter(([k, v]) => allowed.includes(k) && v != null && v !== ''),
  )
  // Antiduplicado: mismo evento + mismos parámetros en <1 s = un solo envío.
  const key = name + JSON.stringify(clean)
  const now = Date.now()
  if (key === last.key && now - last.t < 1000) return
  last = { key, t: now }
  if (loaded) window.gtag('event', name, clean)
  else        queue.push([name, clean])
}

/** Peso → rango (no se envía el valor exacto). */
export function weightBucket(kg) {
  if (!(kg > 0)) return undefined
  if (kg < 1)    return '<1'
  if (kg <= 5)   return '1-5'
  if (kg <= 20)  return '5-20'
  if (kg <= 100) return '20-100'
  return '>100'
}
