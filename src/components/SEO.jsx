import { Helmet } from 'react-helmet-async'

const BASE_URL = 'https://packexpress.com.uy'
const DEFAULT_OG = `${BASE_URL}/og-default.jpg`

export default function SEO({
  title = 'Courier y Logística en Uruguay — Envíos Nacionales e Internacionales',
  description = 'Pack Express: courier y distribución en los 19 departamentos de Uruguay y envíos internacionales a +50 países. Recolección a domicilio en Montevideo. ¡Cotizá ahora!',
  canonical = BASE_URL,
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
      <meta name="geo.position" content="-34.9011;-56.1645" />
      <meta name="ICBM" content="-34.9011, -56.1645" />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="Pack Express Uruguay — Courier y Logística" />
      <meta property="og:locale" content="es_UY" />
      <meta property="og:site_name" content="Pack Express Uruguay" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
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
