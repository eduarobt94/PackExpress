import { Helmet } from 'react-helmet-async'

const BASE_URL = 'https://packexpress.com.uy'
const DEFAULT_OG = `${BASE_URL}/og-default.jpg`

/**
 * ⚠️ HOY ESTE COMPONENTE NO SE RENDERIZA (ver App.jsx).
 *
 * La home emite todo su <head> de forma estática desde index.html. Con React 19
 * react-helmet-async delega en el hoisting nativo de React, que NO deduplica
 * contra los tags ya presentes en el HTML servido: montar <SEO /> junto al
 * fallback estático producía un <meta description>, <link canonical>,
 * <meta og:title>… DUPLICADO en el DOM (docs/QA_BUGS.md, BUG-APP-001).
 *
 * Se conserva para cuando existan rutas con metadatos propios. Al reintroducirlo:
 * montarlo SOLO en esas rutas y quitar de index.html los tags que pasen a ser
 * dinámicos, para que no vuelvan a coexistir dos fuentes del mismo tag.
 *
 * Los defaults de abajo replican exactamente los valores de index.html, para
 * que un crawler sin JS y un usuario con JS nunca vean metadatos distintos.
 */
const DEFAULTS = {
  title: 'Pack Express Uruguay | Courier y Logística Nacional e Internacional',
  description:
    'Pack Express: courier y distribución en los 19 departamentos de Uruguay y envíos internacionales a +50 países. Recolección a domicilio en Montevideo. ¡Cotizá ahora!',
  ogDescription:
    'Courier y distribución en los 19 departamentos de Uruguay y envíos internacionales a +50 países. Recolección a domicilio en Montevideo.',
  twitterDescription:
    'Courier y distribución en los 19 departamentos de Uruguay y envíos internacionales a +50 países.',
  ogImageAlt: 'Pack Express Uruguay — Courier y Logística Internacional',
  geoPosition: '-34.907382;-56.188793',
  icbm: '-34.907382, -56.188793',
}

export default function SEO({
  title = DEFAULTS.title,
  description = DEFAULTS.description,
  ogDescription = DEFAULTS.ogDescription,
  twitterDescription = DEFAULTS.twitterDescription,
  canonical = `${BASE_URL}/`,
  ogImage = DEFAULT_OG,
  schemas = [],
}) {
  const fullTitle = title.includes('Pack Express')
    ? title
    : `${title} | Pack Express Uruguay`

  return (
    <Helmet>
      {/* Idioma */}
      <html lang="es-UY" />

      {/* Básico */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <link rel="canonical" href={canonical} />

      {/* Geolocalización */}
      <meta name="geo.region" content="UY-MO" />
      <meta name="geo.placename" content="Montevideo, Uruguay" />
      <meta name="geo.position" content={DEFAULTS.geoPosition} />
      <meta name="ICBM" content={DEFAULTS.icbm} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={DEFAULTS.ogImageAlt} />
      <meta property="og:locale" content="es_UY" />
      <meta property="og:site_name" content="Pack Express Uruguay" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@packexpressuy" />

      {/* Structured Data — múltiples schemas */}
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  )
}
