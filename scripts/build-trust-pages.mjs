/**
 * Genera las páginas de confianza (/about, /contact, /privacy) como HTML
 * ESTÁTICO real en dist/, después del build de Vite.
 *
 * Por qué páginas físicas y no rutas del SPA: App.jsx trata cualquier path
 * que no sea "/" como 404 (VALID_PATHS = Set(['/', '/index.html'])) — es una
 * single-page app real, no un router con páginas propias. Convertirla en una
 * app multi-página para 3 páginas de confianza sería un cambio de arquitectura
 * fuera de alcance. En cambio, estas páginas son archivos físicos que Apache
 * sirve DIRECTO (la regla `RewriteCond %{REQUEST_FILENAME} -f` del .htaccess
 * ya lo hace, sin ningún cambio ahí): siempre HTTP 200, siempre con contenido
 * real en el HTML crudo, sin depender de que el bundle de React cargue.
 *
 * Por qué generadas y no escritas a mano en public/: el contenido de
 * organización (dirección, contactPoint, RUT) vive en UN solo lugar
 * (src/seo/schemas.js) y en el texto legal que ya usa LegalModal.jsx — este
 * script los reutiliza tal cual en vez de duplicarlos a mano, para que nunca
 * queden desincronizados.
 *
 * Uso: node scripts/build-trust-pages.mjs   (después de "vite build")
 */
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { organizationSchema, breadcrumbSchema } from '../src/seo/schemas.js'

const DIST = 'dist'
const BASE_URL = 'https://packexpress.com.uy'

if (!existsSync(DIST)) {
  console.error(`✗ No existe ${DIST}/. Corré "vite build" antes.`)
  process.exit(1)
}

const serializar = (schema) => JSON.stringify(schema).replace(/<\/script/gi, '<\\/script')

/** Layout compartido — self-contained (sin depender del bundle con hash del
 * SPA, que puede no existir todavía en el primer request tras un deploy). */
function layout({ slug, title, description, h1, cuerpoHtml, jsonLd }) {
  return `<!doctype html>
<html lang="es-UY">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} | Pack Express Uruguay</title>
<meta name="description" content="${description}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${BASE_URL}/${slug}/">
<link rel="icon" type="image/png" href="/favicon.png">
<meta property="og:type" content="website">
<meta property="og:title" content="${title} | Pack Express Uruguay">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${BASE_URL}/${slug}/">
${jsonLd.map(s => `<script type="application/ld+json">${serializar(s)}</script>`).join('\n')}
<style>
  :root{--bg:#060810;--card:#0C1018;--fg1:#F8F8F8;--fg2:#94A3B8;--fg3:#64748B;--bd:rgba(255,255,255,.08);--accent:#F07232;--blue:#527ED8}
  *{box-sizing:border-box}
  body{margin:0;background:var(--bg);color:var(--fg1);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.7}
  main{max-width:52rem;margin:0 auto;padding:3rem 1.5rem 5rem}
  header{border-bottom:1px solid var(--bd);padding:1.25rem 1.5rem}
  header a{color:var(--fg1);text-decoration:none;font-weight:700;font-size:15px}
  h1{font-size:clamp(1.7rem,4vw,2.4rem);font-weight:800;letter-spacing:-.02em;margin:0 0 .5rem}
  h2{font-size:1.15rem;font-weight:700;margin:2.2rem 0 .6rem;color:var(--fg1)}
  p{color:var(--fg2);margin:0 0 1rem}
  a{color:var(--accent)}
  .lead{color:var(--fg2);font-size:1.05rem;margin-bottom:2rem}
  address{font-style:normal;color:var(--fg2)}
  ul{color:var(--fg2);padding-left:1.2rem}
  li{margin-bottom:.4rem}
  .crumbs{font-size:12px;color:var(--fg3);margin-bottom:1.5rem}
  .crumbs a{color:var(--fg3)}
  .card{background:var(--card);border:1px solid var(--bd);border-radius:14px;padding:1.5rem;margin:1.5rem 0}
  nav.foot{border-top:1px solid var(--bd);margin-top:3rem;padding-top:1.5rem;font-size:13px;color:var(--fg3);display:flex;gap:1.25rem;flex-wrap:wrap}
  nav.foot a{color:var(--fg3)}
</style>
</head>
<body>
<header><a href="/">Pack Express Uruguay</a></header>
<main>
  <p class="crumbs"><a href="/">Inicio</a> / ${h1}</p>
  <h1>${h1}</h1>
  ${cuerpoHtml}
  <nav class="foot">
    <a href="/">Inicio</a>
    <a href="/about/">Sobre nosotros</a>
    <a href="/contact/">Contacto</a>
    <a href="/privacy/">Privacidad</a>
    <a href="/llms.txt">llms.txt</a>
    <a href="/sitemap.xml">Sitemap</a>
  </nav>
</main>
</body>
</html>
`
}

const breadcrumb = (nombre, slug) => breadcrumbSchema([
  { name: 'Inicio', url: `${BASE_URL}/` },
  { name: nombre, url: `${BASE_URL}/${slug}/` },
])

// ── /about ──────────────────────────────────────────────────────────────
const about = layout({
  slug: 'about',
  title: 'Sobre nosotros',
  description: 'Pack Express Uruguay S.A.S. — empresa de courier y logística con sede en Montevideo, más de 5 años operando bajo la Resolución N°148/2023 de URSEC.',
  h1: 'Sobre Pack Express Uruguay',
  jsonLd: [organizationSchema, breadcrumb('Sobre nosotros', 'about')],
  cuerpoHtml: `
    <p class="lead">Pack Express Uruguay S.A.S. es una empresa de courier y logística con sede en Montevideo, con más de 5 años de operación en el mercado uruguayo.</p>

    <h2>Quiénes somos</h2>
    <p>Fundada en 2020, Pack Express Uruguay ofrece servicios de courier internacional, distribución nacional, equipaje no acompañado y envío de documentos. Operamos bajo la Resolución N°148/2023 de URSEC (Unidad Reguladora de Servicios de Comunicaciones), el organismo que regula los servicios postales en Uruguay.</p>

    <h2>Cobertura</h2>
    <p>Cubrimos los 19 departamentos de Uruguay con logística nacional B2B y B2C, y realizamos envíos internacionales a más de 50 países en América, Europa, Asia y Oceanía, con gestión aduanera completa en origen y destino.</p>

    <h2>Identidad legal</h2>
    <div class="card">
      <p style="margin-bottom:.5rem"><strong>Razón social:</strong> Pack Express Uruguay S.A.S.</p>
      <p style="margin-bottom:.5rem"><strong>RUT:</strong> 218883410015</p>
      <p style="margin-bottom:.5rem"><strong>Gerente responsable:</strong> Lic. Yusniel Rojas Castro</p>
      <p style="margin-bottom:0"><strong>Domicilio:</strong> Carlos Quijano 1258 esquina Soriano, Centro, Montevideo, Uruguay</p>
    </div>

    <h2>Qué hacemos</h2>
    <ul>
      <li><strong>Courier internacional:</strong> exportación e importación a más de 50 países.</li>
      <li><strong>Distribución nacional:</strong> cobertura completa en los 19 departamentos de Uruguay.</li>
      <li><strong>Equipaje no acompañado:</strong> traslado de maletas y pertenencias personales como carga.</li>
      <li><strong>Envío de documentos:</strong> nacionales e internacionales, con trazabilidad.</li>
    </ul>
    <p>El Casillero Internacional está en preparación y todavía no está disponible.</p>

    <h2>Más información</h2>
    <p>Los detalles de servicios, tiempos de entrega y preguntas frecuentes están disponibles en la <a href="/">página principal</a> y en nuestro <a href="/llms.txt">llms.txt</a>, pensado para que agentes y modelos de lenguaje puedan consultar información autorizada sobre la empresa.</p>
  `,
})

// ── /contact ────────────────────────────────────────────────────────────
const contact = layout({
  slug: 'contact',
  title: 'Contacto',
  description: 'Contacto de Pack Express Uruguay: WhatsApp, teléfono, email y dirección en Montevideo. Horario de atención de lunes a sábado.',
  h1: 'Contacto',
  jsonLd: [organizationSchema, breadcrumb('Contacto', 'contact')],
  cuerpoHtml: `
    <p class="lead">Estas son las vías oficiales de contacto de Pack Express Uruguay S.A.S. Respondemos en menos de 24 horas hábiles.</p>

    <div class="card">
      <address>
        <p style="margin-bottom:.5rem"><strong>Teléfono / WhatsApp:</strong> <a href="tel:+59893594297">+598 93 594 297</a> — <a href="https://wa.me/59893594297">wa.me/59893594297</a></p>
        <p style="margin-bottom:.5rem"><strong>Email:</strong> <a href="mailto:packexpress2021@gmail.com">packexpress2021@gmail.com</a></p>
        <p style="margin-bottom:.5rem"><strong>Dirección:</strong> Carlos Quijano 1258, Montevideo, Uruguay</p>
        <p style="margin-bottom:0"><strong>Horario:</strong> Lunes a viernes 10:00–18:00 · Sábados 10:00–14:00</p>
      </address>
    </div>

    <h2>Formulario de contacto</h2>
    <p>El formulario interactivo con envío de mensajes está disponible en la <a href="/#contacto">sección Contacto de la página principal</a> — requiere JavaScript para enviarse.</p>

    <h2>Cotizar o rastrear un envío</h2>
    <p>Para obtener un precio estimado de envío o hacer seguimiento de una guía, usá el <a href="/#tarifas">cotizador</a> o el <a href="/#rastreo">rastreador</a> en la página principal, o escribinos directo por WhatsApp con el peso y destino del envío.</p>

    <h2>Identidad legal</h2>
    <p>Pack Express Uruguay S.A.S. — RUT 218883410015. Operamos bajo la Resolución N°148/2023 de URSEC. Ver más en <a href="/about/">Sobre nosotros</a>.</p>
  `,
})

// ── /privacy ────────────────────────────────────────────────────────────
// Texto reutilizado TAL CUAL de src/components/LegalModal.jsx (CONTENT.privacidad)
// — misma fuente que ya se muestra dentro de la app vía modal, no una versión
// nueva o parafraseada.
const privacy = layout({
  slug: 'privacy',
  title: 'Política de Privacidad',
  description: 'Política de privacidad y protección de datos de Pack Express Uruguay S.A.S.',
  h1: 'Política de Privacidad',
  jsonLd: [organizationSchema, breadcrumb('Privacidad', 'privacy')],
  cuerpoHtml: `
    <p class="lead">Protección de datos y privacidad — Pack Express Uruguay S.A.S.</p>

    <h2>Aviso de Privacidad</h2>
    <p>Pack Express Uruguay S.A.S se compromete con la protección de los datos personales en todas las transacciones comerciales realizadas con los visitantes del sitio web. La información recopilada es tratada con estricta confidencialidad y únicamente con los fines para los que fue proporcionada.</p>

    <h2>Datos que recopilamos</h2>
    <p>Podemos recopilar nombre, dirección de correo electrónico, número de teléfono, dirección postal y cualquier otra información que usted nos proporcione voluntariamente al completar formularios de contacto, solicitar cotizaciones o realizar envíos. No vendemos ni cedemos sus datos personales a terceros sin su consentimiento expreso.</p>

    <h2>Uso de la información</h2>
    <p>La información recopilada se utiliza exclusivamente para gestionar sus envíos, responder consultas, mejorar nuestros servicios y, con su autorización, enviarle comunicaciones relevantes sobre nuestros servicios. Nos reservamos el derecho de utilizar la información de forma agregada y anónima para fines estadísticos internos.</p>

    <h2>Comentarios y sugerencias</h2>
    <p>Agradecemos sus comentarios y sugerencias; sin embargo, no nos es posible responder a todos los comentarios de forma individual. Al enviar información, usted acepta que la empresa puede utilizar dicha información libremente, sin obligación de confidencialidad, compensación ni restricción de uso.</p>

    <h2>Seguridad</h2>
    <p>Implementamos medidas de seguridad técnicas y organizativas razonables para proteger su información personal contra acceso no autorizado, pérdida o divulgación. Sin embargo, ninguna transmisión por Internet o sistema de almacenamiento electrónico es completamente seguro.</p>

    <h2>Aviso de uso fraudulento de marca</h2>
    <p>Pack Express Uruguay S.A.S advierte sobre posibles estafas que utilizan fraudulentamente nuestro nombre o imagen de marca. Aclaramos que únicamente cobramos pagos oficiales por servicios de envío debidamente contratados. No solicitamos pagos anticipados por productos, ni realizamos cobros a través de canales no oficiales. La empresa no se responsabiliza por pérdidas económicas derivadas de transacciones fraudulentas realizadas en nombre de Pack Express por personas o entidades no autorizadas.</p>

    <h2>Contacto</h2>
    <p>Consultas sobre esta política: <a href="mailto:packexpress2021@gmail.com">packexpress2021@gmail.com</a> — ver también nuestros <a href="/about/">datos de identidad legal</a>.</p>
  `,
})

for (const [slug, html] of [['about', about], ['contact', contact], ['privacy', privacy]]) {
  const dir = `${DIST}/${slug}`
  mkdirSync(dir, { recursive: true })
  writeFileSync(`${dir}/index.html`, html)
}

console.log('✓ Páginas de confianza generadas: /about/, /contact/, /privacy/')
