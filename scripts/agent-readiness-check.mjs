/**
 * Verificación de "agent readiness" — los 5 puntos de la auditoría.
 *
 * Comprueba lo que un agente/crawler ve REALMENTE, sin ejecutar JavaScript:
 *   1. Contenido sin JS   — H1 + >=500 chars de texto en el HTML crudo
 *   2. 404 amigable       — status 404 real + cuerpo markdown de recuperación
 *   3. Accept: text/markdown — Content-Type correcto, Vary: Accept, 406, q-values
 *   4. JSON-LD            — structured data en el HTML crudo
 *   5. llms.txt           — sección "cuándo usar" con casos concretos
 *
 * Uso:
 *   node scripts/agent-readiness-check.mjs                 -> valida dist/ (offline)
 *   node scripts/agent-readiness-check.mjs http://host     -> valida un sitio en vivo
 *
 * Sin URL solo corre los checks que se pueden validar sobre los archivos
 * construidos; los de negociación y 404 necesitan un servidor y se marcan como
 * omitidos, no como aprobados (para no dar una falsa sensación de verde).
 */
import { readFileSync, existsSync } from 'node:fs'

const base = process.argv[2]?.replace(/\/$/, '') ?? null

let pasaron = 0
let fallaron = 0
let omitidos = 0
const fallas = []

function check(nombre, fn) {
  try {
    const r = fn()
    if (r === 'skip') { omitidos++; console.log(`  ~ ${nombre} (omitido: requiere URL)`); return }
    if (r === true) { pasaron++; console.log(`  ✓ ${nombre}`); return }
    fallaron++; fallas.push({ nombre, detalle: r })
    console.log(`  ✗ ${nombre} — ${r}`)
  } catch (e) {
    fallaron++; fallas.push({ nombre, detalle: e.message })
    console.log(`  ✗ ${nombre} — ${e.message}`)
  }
}

async function checkAsync(nombre, fn) {
  try {
    const r = await fn()
    if (r === 'skip') { omitidos++; console.log(`  ~ ${nombre} (omitido: requiere URL)`); return }
    if (r === true) { pasaron++; console.log(`  ✓ ${nombre}`); return }
    fallaron++; fallas.push({ nombre, detalle: r })
    console.log(`  ✗ ${nombre} — ${r}`)
  } catch (e) {
    fallaron++; fallas.push({ nombre, detalle: e.message })
    console.log(`  ✗ ${nombre} — ${e.message}`)
  }
}

/** Texto visible del HTML, EXCLUYENDO <script>, <style> y <noscript>.
 *  Se excluye noscript a propósito: es exactamente lo que descartan los
 *  extractores de las auditorías, y por eso la home marcaba 67 caracteres. */
function textoDe(html) {
  return html
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const htmlLocal = existsSync('dist/index.html') ? readFileSync('dist/index.html', 'utf8') : null

async function traer(ruta, headers = {}) {
  const res = await fetch(`${base}${ruta}`, { headers, redirect: 'manual' })
  return { status: res.status, headers: res.headers, body: await res.text() }
}

console.log('\n== 1. Contenido sin JavaScript ==')
check('dist/index.html existe (corré "pnpm run build")', () => htmlLocal ? true : 'no existe dist/index.html')
if (htmlLocal) {
  check('tiene un <h1> fuera de <noscript>', () => {
    const sinNoscript = htmlLocal.replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    return /<h1[\s>]/i.test(sinNoscript) ? true : 'no hay <h1> en el HTML crudo'
  })
  check('exactamente un <h1> (evita competencia de encabezados)', () => {
    const n = (htmlLocal.replace(/<noscript[\s\S]*?<\/noscript>/gi, '').match(/<h1[\s>]/gi) || []).length
    return n === 1 ? true : `hay ${n} <h1>`
  })
  check('>= 500 caracteres de texto en el HTML crudo', () => {
    const n = textoDe(htmlLocal).length
    return n >= 500 ? true : `solo ${n} caracteres`
  })
  check('el contenido NO afirma que el casillero esté disponible', () => {
    const t = textoDe(htmlLocal).toLowerCase()
    if (!t.includes('casillero')) return true
    return /todav[ií]a no est[áa] disponible/.test(t)
      ? true
      : 'menciona el casillero sin aclarar que aún no está disponible'
  })
}

console.log('\n== 4. JSON-LD estructurado ==')
if (htmlLocal) {
  const bloques = [...htmlLocal.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
  check('hay al menos un bloque JSON-LD en el HTML crudo', () => bloques.length > 0 ? true : 'ninguno')
  check('todos los bloques son JSON válido con @context y @type', () => {
    for (const [, cuerpo] of bloques) {
      let o
      try { o = JSON.parse(cuerpo) } catch (e) { return `JSON inválido: ${e.message}` }
      if (!o['@context'] || !o['@type']) return 'falta @context o @type'
    }
    return true
  })
  check('incluye una identidad de la empresa (Organization/LocalBusiness)', () => {
    const tipos = bloques.map(([, c]) => { try { return JSON.parse(c)['@type'] } catch { return null } })
    return tipos.includes('Organization') || tipos.includes('LocalBusiness')
      ? true : `tipos presentes: ${tipos.join(', ')}`
  })
  check('NO declara el Casillero como Service (todavía no se presta)', () => {
    const nombres = bloques.map(([, c]) => { try { const o = JSON.parse(c); return o['@type'] === 'Service' ? o.name : null } catch { return null } }).filter(Boolean)
    return nombres.some(n => /casillero/i.test(n)) ? `declarado como Service: ${nombres}` : true
  })
}

console.log('\n== 5. llms.txt con "cuándo usar" ==')
const llms = existsSync('public/llms.txt') ? readFileSync('public/llms.txt', 'utf8') : null
check('public/llms.txt existe', () => llms ? true : 'no existe')
if (llms) {
  check('tiene una sección de "cuándo usar"', () => /##\s*Cuándo usar/i.test(llms) ? true : 'falta la sección')
  check('tiene una sección de "cómo consultar"', () => /##\s*Cómo consultar/i.test(llms) ? true : 'falta la sección')
  check('dice explícitamente para qué NO sirve', () => /NO es la fuente correcta/i.test(llms) ? true : 'no acota los casos fuera de alcance')
  check('el casillero figura como NO disponible', () =>
    /NO disponible|NO está operativo|EN PREPARACIÓN/i.test(llms) ? true : 'sigue descrito como servicio activo')
}

console.log('\n== 2. 404 amigable para agentes ==')
await checkAsync('ruta inexistente devuelve HTTP 404', async () => {
  if (!base) return 'skip'
  const r = await traer('/ruta-que-no-existe-jamas-xyz')
  return r.status === 404 ? true : `devolvió ${r.status}`
})
await checkAsync('el 404 responde markdown a un agente (Accept: */*)', async () => {
  if (!base) return 'skip'
  const r = await traer('/ruta-que-no-existe-jamas-xyz', { Accept: '*/*' })
  const ct = r.headers.get('content-type') || ''
  if (!ct.includes('text/markdown')) return `Content-Type: ${ct}`
  return /sitemap|llms\.txt/i.test(r.body) ? true : 'el cuerpo no apunta a sitemap/llms.txt'
})
await checkAsync('el 404 sigue sirviendo la app a un navegador (Accept: text/html)', async () => {
  if (!base) return 'skip'
  const r = await traer('/ruta-que-no-existe-jamas-xyz', { Accept: 'text/html,application/xhtml+xml' })
  const ct = r.headers.get('content-type') || ''
  return ct.includes('text/html') && r.status === 404 ? true : `status=${r.status} type=${ct}`
})

console.log('\n== 3. Negociación de contenido markdown ==')
await checkAsync('Accept: text/markdown devuelve text/markdown', async () => {
  if (!base) return 'skip'
  const r = await traer('/', { Accept: 'text/markdown' })
  const ct = r.headers.get('content-type') || ''
  return ct.includes('text/markdown') ? true : `Content-Type: ${ct}`
})
await checkAsync('la respuesta markdown incluye charset=utf-8', async () => {
  if (!base) return 'skip'
  const r = await traer('/', { Accept: 'text/markdown' })
  return (r.headers.get('content-type') || '').includes('charset=utf-8') ? true : r.headers.get('content-type')
})
await checkAsync('Vary incluye Accept (evita envenenar la caché del CDN)', async () => {
  if (!base) return 'skip'
  const r = await traer('/', { Accept: 'text/markdown' })
  const vary = r.headers.get('vary') || ''
  return /accept(?!-)/i.test(vary) ? true : `Vary: ${vary || '(ausente)'}`
})
await checkAsync('Accept: text/html sigue devolviendo HTML', async () => {
  if (!base) return 'skip'
  const r = await traer('/', { Accept: 'text/html,application/xhtml+xml,*/*;q=0.8' })
  const ct = r.headers.get('content-type') || ''
  return ct.includes('text/html') ? true : `Content-Type: ${ct}`
})
await checkAsync('Accept: */* (curl, bots) sigue devolviendo HTML — sin cambio observable', async () => {
  if (!base) return 'skip'
  const r = await traer('/', { Accept: '*/*' })
  const ct = r.headers.get('content-type') || ''
  return ct.includes('text/html') ? true : `Content-Type: ${ct}`
})
await checkAsync('honra q-values: html;q=0.9 gana sobre markdown;q=0.1', async () => {
  if (!base) return 'skip'
  const r = await traer('/', { Accept: 'text/html;q=0.9, text/markdown;q=0.1' })
  const ct = r.headers.get('content-type') || ''
  return ct.includes('text/html') ? true : `Content-Type: ${ct}`
})
await checkAsync('honra q-values: markdown;q=0.9 gana sobre html;q=0.1', async () => {
  if (!base) return 'skip'
  const r = await traer('/', { Accept: 'text/html;q=0.1, text/markdown;q=0.9' })
  const ct = r.headers.get('content-type') || ''
  return ct.includes('text/markdown') ? true : `Content-Type: ${ct}`
})
await checkAsync('devuelve 406 si no acepta ningún tipo servible', async () => {
  if (!base) return 'skip'
  const r = await traer('/', { Accept: 'application/vnd.inexistente' })
  return r.status === 406 ? true : `devolvió ${r.status}`
})
await checkAsync('/index.md se sirve como text/markdown', async () => {
  if (!base) return 'skip'
  const r = await traer('/index.md')
  const ct = r.headers.get('content-type') || ''
  return ct.includes('text/markdown') ? true : `Content-Type: ${ct}`
})

console.log(`\n== TOTAL: ${pasaron} pasaron, ${fallaron} fallaron, ${omitidos} omitidos ==`)
if (!base) console.log('   (pasá una URL para correr los checks de negociación y 404)')
if (fallaron > 0) {
  console.log('\nFallas:')
  for (const f of fallas) console.log(`  ✗ ${f.nombre} — ${f.detalle}`)
  process.exit(1)
}
