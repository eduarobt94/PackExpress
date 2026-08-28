const BASE_URL = 'https://packexpress.com.uy'

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: 'Pack Express Uruguay S.A.S.',
  alternateName: ['Pack Express', 'PackExpress Uruguay', 'Pack Express UY'],
  url: BASE_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/logo.png`,
    width: 200,
    height: 60,
  },
  description:
    'Empresa de courier, logística nacional e internacional con sede en Montevideo, Uruguay. Cobertura en los 19 departamentos y más de 50 países destino.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Carlos Quijano 1258',
    addressLocality: 'Montevideo',
    addressRegion: 'Montevideo',
    postalCode: '11200',
    addressCountry: 'UY',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -34.907382,
    longitude: -56.188793,
  },
  telephone: '+59893594297',
  email: 'packexpress2021@gmail.com',
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: '+59893594297',
      email: 'packexpress2021@gmail.com',
      areaServed: 'UY',
      availableLanguage: ['Spanish'],
      hoursAvailable: [
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:00', closes: '18:00' },
        { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday'], opens: '10:00', closes: '14:00' },
      ],
    },
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: '+59893594297',
      email: 'packexpress2021@gmail.com',
      areaServed: 'UY',
      availableLanguage: ['Spanish'],
    },
  ],
  foundingDate: '2020',
  numberOfEmployees: { '@type': 'QuantitativeValue', value: 20 },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '10:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '10:00',
      closes: '14:00',
    },
  ],
  areaServed: [
    { '@type': 'Country', name: 'Uruguay' },
    { '@type': 'AdministrativeArea', name: 'Montevideo' },
  ],
  sameAs: [
    'https://www.facebook.com/profile.php?id=100063612524908',
    'https://www.instagram.com/packexpressuruguay/',
  ],
}

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${BASE_URL}/#localbusiness`,
  name: 'Pack Express Uruguay',
  image: `${BASE_URL}/og-default.jpg`,
  priceRange: '$$',
  currenciesAccepted: 'UYU, USD',
  paymentAccepted: 'Cash, Credit Card, Bank Transfer',
  url: BASE_URL,
  telephone: '+59893594297',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Carlos Quijano 1258',
    addressLocality: 'Montevideo',
    addressRegion: 'Montevideo',
    postalCode: '11200',
    addressCountry: 'UY',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -34.907382,
    longitude: -56.188793,
  },
  hasMap: 'https://maps.google.com/maps?q=-34.907382,-56.188793',
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '10:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Saturday'],
      opens: '10:00',
      closes: '14:00',
    },
  ],
  // ⚠️ Descomentar solo cuando haya reviews reales verificables en Google Business u otra plataforma
  // aggregateRating: {
  //   '@type': 'AggregateRating',
  //   ratingValue: '4.8',
  //   reviewCount: '127',
  // },
}

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  url: BASE_URL,
  name: 'Pack Express Uruguay',
  description: 'Courier y logística nacional e internacional desde Montevideo, Uruguay',
  inLanguage: 'es-UY',
  publisher: { '@id': `${BASE_URL}/#organization` },
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${BASE_URL}/?rastreo={tracking_number}`,
    },
    'query-input': 'required name=tracking_number',
  },
}

export const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto tarda un envío nacional dentro de Uruguay?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Los envíos a Montevideo y área metropolitana se entregan en 24 horas hábiles. Para el interior del país el plazo estándar es de 48 horas hábiles. Todos los envíos incluyen seguimiento en tiempo real.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Pack Express realiza recolección a domicilio en Montevideo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Retiramos en tu domicilio sin costo adicional en Montevideo y el área metropolitana. También podés acercarte a nuestra sede en Carlos Quijano 1258, Montevideo, de lunes a viernes de 10:00 a 18:00 y sábados de 10:00 a 14:00.',
      },
    },
    {
      '@type': 'Question',
      name: '¿A qué países envían desde Uruguay?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Realizamos envíos internacionales a más de 50 países incluyendo Estados Unidos, España, Argentina, Brasil, México, Alemania, China, Japón y Australia. Consultá tarifas según destino en nuestro cotizador online.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Gestionan los trámites de aduana?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Nos encargamos de toda la documentación aduanera en origen y destino, conforme a la Resolución N°148/2023 de URSEC. Sin burocracia de tu parte.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuánto cuesta enviar un paquete de Uruguay a Estados Unidos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El costo depende del peso, volumen y urgencia del envío. Podés obtener una cotización exacta en menos de 2 minutos usando nuestro cotizador en línea o contactándonos directamente por WhatsApp.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Hacen distribución dentro de Uruguay?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Pack Express ofrece distribución logística en los 19 departamentos de Uruguay. La logística nacional es uno de nuestros servicios principales, con entrega estándar en 48 horas hábiles.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué es el equipaje no acompañado?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El equipaje no acompañado es el servicio que permite enviar tu maleta o equipaje personal como carga, sin que viaje contigo en el avión. Pack Express gestiona el traslado completo con trámites aduaneros incluidos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cuál es el mejor courier para enviar desde Uruguay a España?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pack Express Uruguay ofrece servicio courier a España con tiempos de entrega de 7–10 días en modalidad estándar y 3–5 días en modalidad exprés, con gestión aduanera y seguimiento en tiempo real incluidos.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué courier cubre todos los departamentos de Uruguay?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Pack Express Uruguay tiene cobertura nacional completa en los 19 departamentos, incluyendo Artigas, Rivera, Tacuarembó, Treinta y Tres y todas las zonas del interior. Entrega estándar en 48 horas hábiles.',
      },
    },
    {
      '@type': 'Question',
      // El casillero TODAVÍA NO está operativo. Estas respuestas se redactan
      // en futuro a propósito: declarar en structured data un servicio que no
      // se presta es contenido que no coincide con la página, y Google lo
      // penaliza. Actualizar a presente recién cuando el servicio esté activo.
      name: '¿Pack Express tiene casillero internacional?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El casillero internacional de Pack Express todavía no está disponible: es un servicio que estamos preparando para incorporar. Cuando esté activo vas a poder comprar en tiendas del exterior usando nuestra dirección como destino y recibir tus compras en Uruguay. Mientras tanto ofrecemos paquetería courier nacional e internacional, equipaje no acompañado, envío de documentos y distribución nacional.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo va a funcionar el casillero internacional de Pack Express?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El servicio está en preparación y todavía no se encuentra disponible. Cuando se active, vas a solicitar tu dirección de casillero, hacer tus compras en tiendas extranjeras indicando esa dirección como destino, y Pack Express va a recibir tus paquetes, consolidarlos si son varios y despacharlos hacia Uruguay con gestión aduanera.',
      },
    },
  ],
}

export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: item.name,
    item: item.url,
  })),
})

export const serviceSchema = (name, description, url) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name,
  description,
  provider: { '@id': `${BASE_URL}/#organization` },
  areaServed: [
    { '@type': 'Country', name: 'Uruguay' },
    { '@type': 'City', name: 'Montevideo' },
  ],
  url: `${BASE_URL}${url}`,
})

/**
 * Schemas de los servicios que efectivamente se prestan hoy.
 *
 * Vive acá (y no en App.jsx) para que sea UNA sola fuente de verdad: la app
 * los inyecta en runtime y `scripts/inject-jsonld.mjs` los escribe estáticos
 * en el HTML del build, que es lo que ven los crawlers que no ejecutan JS.
 *
 * El Casillero Internacional NO se declara como Service a propósito: todavía
 * no está operativo y declararlo le diría a Google/agentes que es un servicio
 * disponible. Su estado real se explica en las FAQ de faqSchema.
 */
export const servicesSchemas = [
  serviceSchema(
    'Courier Internacional',
    'Envíos internacionales desde Uruguay a más de 50 países. Gestión aduanera, seguimiento en tiempo real y entrega garantizada.',
    '/#servicios',
  ),
  serviceSchema(
    'Distribución Nacional Uruguay',
    'Cobertura logística en los 19 departamentos de Uruguay. Entrega estándar en 48 horas hábiles y express en 24 horas en Montevideo.',
    '/#servicios',
  ),
  serviceSchema(
    'Equipaje No Acompañado',
    'Transporte de maletas y pertenencias personales dentro de Uruguay y hacia el exterior, con gestión aduanera completa.',
    '/#servicios',
  ),
  serviceSchema(
    'Envío de Documentos',
    'Gestión segura de documentación oficial, contratos y correspondencia con cadena de custodia certificada, nacional e internacional.',
    '/#servicios',
  ),
]

/** Todos los schemas de la home, en el orden en que se emiten. */
export const homeSchemas = [
  organizationSchema,
  localBusinessSchema,
  websiteSchema,
  faqSchema,
  ...servicesSchemas,
]
