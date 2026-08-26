/**
 * Base de conocimiento del ChatAgent — saludos, small talk, despedidas y FAQ.
 * Contenido alineado con el sitio real (Services.jsx, Coverage.jsx, Docs.jsx,
 * Footer.jsx) — si esos textos cambian, actualizar acá también. Nunca se
 * inventa información que no exista en el sitio (ver sin_info_* al final).
 */

/** Palabras/frases que disparan un saludo (respuesta dinámica según hora real, ver intentEngine.js). */
export const GREETING_PALABRAS = [
  'hola', 'holaa', 'holaaa', 'holaaaa', 'holis', 'ola', 'buenas', 'buenass', 'buenasss',
  'buen dia', 'buenos dias', 'buenas tardes', 'buenas noches',
  'hey', 'hi', 'hello', 'que tal', 'como andan', 'hay alguien', 'estan atendiendo',
  'hay alguien disponible', 'me pueden ayudar', 'necesito ayuda',
  'necesito informacion', 'una pregunta', 'tengo una consulta', 'tengo una duda',
  'tengo una pregunta', 'quisiera consultar', 'quisiera preguntar algo',
  'consulta rapida', 'disculpen la molestia', 'se puede consultar algo',
  'me pueden atender', 'buen dia disculpe', 'una consulta rapida',
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
    palabrasClave: [
      'como estas', 'como andas', 'como te va', 'todo bien', 'como estan',
      'que haces', 'todo tranquilo', 'como va', 'que hay de nuevo', 'como andamos',
    ],
    respuestas: [
      '¡Muy bien, gracias! 😊 Estoy acá para ayudarte. ¿Qué necesitás consultar?',
      '¡Todo muy bien! 😊 ¿En qué puedo ayudarte?',
    ],
  },
  {
    tipo: 'thanks',
    palabrasClave: [
      'gracias', 'muchas gracias', 'mil gracias', 'te agradezco', 'grasias',
      'te pasaste', 'muy amable', 'agradecido', 'agradecida', 'buenisimo gracias',
      'mil gracias por la ayuda', 'excelente gracias', 'genial gracias',
    ],
    respuestas: [
      '¡Con mucho gusto! 😊',
      '¡A vos! Estamos para ayudarte.',
    ],
  },
  {
    tipo: 'small_talk',
    palabrasClave: [
      'perfecto', 'genial', 'ok', 'okay', 'entendido', 'buenisimo',
      'de acuerdo', 'listo', 'todo claro', 'esta clarisimo', 'me sirvio',
      'me sirvio mucho', 'buena esa', 'todo bien entendido', 'excelente',
    ],
    respuestas: [
      '¡Excelente! 😊 ¿Necesitás algo más?',
      'Perfecto 👍 ¿Te ayudo con algo más?',
    ],
  },
]

export const GOODBYE_PALABRAS = [
  'adios', 'chau', 'chao', 'nos vemos', 'hasta luego', 'hasta pronto', 'bye',
  'eso era todo', 'no necesito nada mas', 'eso es todo', 'gracias hasta luego',
  'gracias por la ayuda', 'listo gracias', 'nada mas gracias', 'nos hablamos',
  'ya esta gracias', 'listo eso era todo', 'perfecto gracias eso es todo',
  'ninguna otra cosa gracias', 'gracias buenas noches', 'gracias buen dia',
  'muchas gracias adios', 'nada mas por ahora',
]

export const GOODBYE_RESPONSES = [
  '¡Con mucho gusto! Que tengas un excelente día.',
  '¡Gracias a vos! Cuando necesites, acá estamos.',
  '¡Perfecto! Que tengas un excelente día. 😊',
  '¡Hasta luego! Fue un gusto ayudarte.',
]

/** Respuesta de tiempos_entrega cuando el destino resuelto es Uruguay (nacional) — ver 'tiempos_entrega' en FAQ para la internacional. */
export const RESPUESTA_TIEMPOS_NACIONAL = 'Para envíos nacionales dentro de Uruguay tenemos entrega express en 24 h.'

export const FAQ = [
  {
    id: 'horarios',
    palabrasClave: [
      'horario', 'horarios', 'a que hora', 'a que hora abren', 'a que hora cierran',
      'cuando atienden', 'cuando abren', 'dias de atencion', 'estan abiertos',
      'trabajan los sabados', 'abren los sabados', 'atencion al publico',
      'estan abiertos ahora', 'hoy atienden', 'abren hoy',
      'que horario tienen', 'en que horario trabajan', 'hasta que hora atienden',
      'desde que hora abren', 'atienden los domingos', 'trabajan los domingos',
      'trabajan fines de semana', 'que dias trabajan', 'horario de oficina',
      'horario comercial', 'a que hora puedo llamar', 'estan abiertos los sabados',
      'trabajan sabado', 'trabajan domingo', 'trabajan el sabado', 'trabajan el domingo',
      'atienden el sabado', 'atienden el domingo', 'abren el sabado', 'abren el domingo',
      'que dias laburan', 'que dias trabajan',
      'puedo caer hoy', 'puedo pasar hoy', 'puedo ir ahora', 'puedo pasar ahora',
      'estan atendiendo esta tarde', 'estan atendiendo ahora', 'hasta que hora estan ahi',
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
      'quiero comprar en amazon', 'tienen casillero en miami',
      'como hago para comprar afuera', 'puedo comprar en shein',
      'puedo comprar en ebay', 'como me registro al casillero',
      'que necesito para el casillero', 'como recibo mis compras de estados unidos',
      'reenvio de compras', 'como funciona el reenvio', 'consolidan mis compras',
    ],
    respuesta: 'El Casillero Internacional te da una dirección en EE.UU. para comprar en tiendas americanas. Nosotros recibimos tus compras, las consolidamos y te las enviamos a Uruguay con la gestión aduanera incluida.',
  },
  {
    id: 'cobertura',
    palabrasClave: [
      'cobertura', 'a que paises envian', 'paises destino',
      'departamentos', 'todo uruguay', 'interior del pais',
      'cuantos paises', 'a donde envian', 'zonas de reparto',
      'envian al interior', 'llegan al interior', 'hacen envios internacionales',
      'a que paises hacen envios', 'cuantos departamentos cubren',
      'tienen cobertura nacional', 'reparten en todo el pais',
      'envian fuera de uruguay', 'hacen envios al exterior', 'hacen envios a europa',
      'hacen envios a america', 'que zonas cubren', 'llegan a todo el pais',
      'hacen envios al interior',
    ],
    respuesta: 'Tenemos cobertura en los 19 departamentos de Uruguay y hacemos envíos internacionales a más de 50 países en América, Europa, Asia y Oceanía.',
  },
  {
    id: 'articulos_prohibidos',
    // Contenido real resumido de LegalModal.jsx (clave 'prohibidos') — no
    // se inventa nada, es la misma lista que ve el usuario en el modal.
    palabrasClave: [
      'articulos prohibidos', 'que no puedo enviar', 'que esta prohibido enviar',
      'que no se puede mandar', 'prohibidos', 'prohibido', 'lista de prohibidos',
      'cosas prohibidas', 'que no puedo mandar', 'hay una lista de articulos prohibidos',
      'que cosas no se pueden enviar', 'que no se puede enviar al exterior',
      'que puedo mandar en el paquete', 'que no puedo enviar en el paquete',
    ],
    respuesta: 'No podés enviar: materiales peligrosos o inflamables (baterías de litio, fuegos artificiales, municiones, gasolina, aerosoles), armas y sustancias tóxicas, corrosivas o radiactivas, dinero en efectivo o tarjetas bancarias, joyas y antigüedades, animales vivos, medicamentos sin comprobante de compra, y cualquier objeto cuya importación o exportación esté prohibida por la ley uruguaya. Podés ver el detalle completo acá.',
    chips: ['Ver lista completa'],
  },
  {
    id: 'documentacion',
    palabrasClave: [
      'documentacion', 'declaracion jurada', 'que documentos necesito',
      'requisitos', 'requisitos para enviar', 'papeles necesarios',
      'que necesito para enviar', 'necesito factura para enviar',
      'que papeles pido para enviar internacional', 'requisitos courier',
      'que es la declaracion jurada', 'necesito algun documento',
    ],
    respuesta: 'Para envíos internacionales necesitás completar la Declaración Jurada. También tenés disponible la lista de Artículos Prohibidos y los Requisitos Courier en la sección Documentación de la página.',
  },
  {
    id: 'peso_maximo',
    palabrasClave: [
      'peso maximo', 'maximo de kg', 'cuanto puedo enviar', 'limite de peso',
      'kg extra', 'peso extra', 'hasta cuantos kg', 'cuanto es lo maximo',
      'maximo peso', 'kilos extra', 'kilo adicional', 'kg adicional',
      'cuantos kilos puedo enviar', 'hay limite de peso', 'peso limite',
      'cuantos kg puedo enviar', 'cuanto puede pesar', 'cuanto pesa un paquete',
      'que es lo maximo que puede pesar', 'maximo que puede pesar',
      'que tan pesado puede ser', 'cuanto peso puedo enviar',
      'cuanto peso maximo', 'limite de kg', 'limite de kilos',
      'cuanto pesa maximo un paquete', 'tienen limite de peso por envio',
      'cuanto puedo mandar de peso', 'hay un maximo de peso',
      'cuantas libras puedo enviar', 'libras extra', 'peso en libras',
      'limite de libras', 'cuantas libras maximo', 'cuanto pesa',
    ],
    respuesta: 'No tenemos un límite máximo fijo de peso: cada tarifa incluye un peso base, y lo que excede ese peso se cobra como kilo adicional según la zona y el tipo de envío. Para saber el costo exacto con tu peso, puedo cotizarlo ahora mismo — escribí "cotizar" — o te lo confirma nuestro equipo por WhatsApp.',
  },
  {
    id: 'servicios',
    palabrasClave: [
      'servicios', 'que servicios tienen', 'que hacen', 'que ofrecen',
      'a que se dedican', 'que puedo enviar', 'tipos de envio',
      'que tipo de envios hacen', 'hacen envios de documentos',
      'hacen envios nacionales', 'que modalidades de envio tienen',
      'manejan equipaje no acompañado', 'que es equipaje no acompañado',
      'envian documentos', 'hacen distribucion nacional',
      'que puedo mandar', 'que cosas puedo mandar', 'que cosas puedo enviar',
    ],
    respuesta: 'Ofrecemos Paquetería Courier (nacional e internacional), Casillero Internacional, Equipaje No Acompañado, Envío de Documentos y Distribución Nacional en todo Uruguay.',
  },
  {
    id: 'contacto',
    palabrasClave: [
      'contacto', 'telefono', 'numero de telefono', 'email', 'correo',
      'como los contacto', 'como me comunico', 'mail', 'numero de contacto',
      'como me puedo comunicar con ustedes', 'cual es su numero',
      'a que correo escribo', 'donde los puedo contactar',
      'quiero hablar con ustedes', 'me pasan un telefono', 'me pasan un correo',
    ],
    respuesta: 'Podés contactarnos al (+598) 93 594 297 (Lunes a viernes 10:00-18:00) o por correo a packexpress2021@gmail.com (respuesta en menos de 24 h).',
  },
  {
    id: 'ubicacion',
    palabrasClave: [
      'ubicacion', 'direccion', 'donde estan', 'donde queda', 'donde se ubican',
      'donde los encuentro', 'sede', 'oficina',
      'cual es su direccion', 'en que calle estan', 'como llego hasta ahi',
      'tienen local', 'tienen oficina fisica', 'puedo visitarlos',
      'donde puedo ir', 'donde tienen local',
    ],
    respuesta: 'Estamos en Carlos Quijano 1258, Montevideo, Uruguay.',
  },
  {
    id: 'redes_sociales',
    palabrasClave: [
      'instagram', 'facebook', 'redes sociales', 'redes', 'tienen instagram',
      'tienen facebook', 'cual es el instagram', 'cual es el facebook',
      'me pasan el instagram', 'me pasan el facebook', 'tienen alguna red social',
    ],
    respuesta: 'Nos encontrás en Instagram como @packexpressuruguay y en Facebook como Pack Express Uruguay.',
  },
  {
    id: 'experiencia_empresa',
    palabrasClave: [
      'hace cuanto existen', 'cuantos años tienen', 'desde cuando operan',
      'son una empresa nueva', 'experiencia de la empresa', 'cuantos envios hicieron',
      'son confiables', 'tienen buenas reseñas', 'cuantos clientes tienen',
      'indice de satisfaccion', 'son de fiar', 'hace cuanto trabajan',
    ],
    respuesta: 'Tenemos más de 5 años de experiencia conectando Uruguay con el mundo: ya llevamos más de 50.000 envíos completados y un 98% de clientes satisfechos.',
  },
  {
    id: 'proceso_envio',
    palabrasClave: [
      'como es el proceso de envio', 'pasan a buscar el paquete',
      'recogen a domicilio', 'como funciona el envio paso a paso',
      'hacen recoleccion en mi casa', 'como envio un paquete', 'que pasos sigue mi envio',
    ],
    respuesta: 'El proceso es simple: pasamos a buscar tu envío a domicilio (o lo recibimos en nuestra sede de Carlos Quijano 1258), lo clasificamos, lo transportamos, gestionamos toda la documentación de despacho, y te lo entregamos con seguimiento en tiempo real.',
  },
  {
    id: 'tiempos_entrega',
    palabrasClave: [
      'cuanto tarda un envio', 'cuanto demora la entrega', 'en cuanto tiempo llega',
      'tiempo de entrega internacional', 'cuantos dias tarda en llegar',
      'cuanto tarda en llegar a destino', 'tiempos de entrega',
      'cuanto demora', 'cuanto demoran', 'cuanto tarda', 'en cuanto llega',
      'cuanto tiempo tarda', 'cuanto se tarda', 'que tan rapido llega',
      'cuando llega', 'que tiempo demoran', 'que tiempo demora', 'que tiempo tarda',
      'que tiempo tardan', 'que tiempo demoran en entregar', 'que tiempo tarda en llegar',
      'demoran en entregar', 'tardan en entregar', 'demora en entregar', 'tarda en entregar',
      'que tiempo demoran los envios', 'los envios en cuanto llegan',
    ],
    // Texto internacional por defecto (se usa también cuando no se pudo
    // determinar el país, ej. una interrupción dentro de un flujo sin
    // countryZone disponible). Para Uruguay como destino, useChatAgent.js
    // responde con RESPUESTA_TIEMPOS_NACIONAL en su lugar — no tiene sentido
    // mezclar ambos tiempos en la misma respuesta si ya sabemos cuál aplica.
    respuesta: 'Para envíos internacionales: despachamos ante la Aduana de Uruguay los lunes, el vuelo (con escala en Panamá) sale entre martes y jueves, el transbordo puede demorar de 4 a 7 días, y una vez en destino la entrega local puede tomar hasta 30 días desde que la recibe la aduana de destino.',
  },
  {
    id: 'despacho_aduanero',
    palabrasClave: [
      'cuanto cuesta el despacho aduanero', 'costo de aduana', 'cobran aduana',
      'hay que pagar aduana', 'cuanto es el despacho en aduana', 'costo de despacho',
    ],
    respuesta: 'El despacho aduanero en Uruguay tiene un costo fijo de USD 100, independiente del peso total del envío.',
  },
  {
    id: 'normativa_ursec',
    palabrasClave: [
      'estan habilitados por ursec', 'son legales', 'tienen normativa oficial',
      'estan regulados', 'resolucion 148', 'estan autorizados',
    ],
    respuesta: 'Sí, operamos bajo la Resolución N°148/2023 de URSEC, la normativa oficial de servicios postales en Uruguay.',
  },
  {
    id: 'cotizar_online',
    palabrasClave: [
      'puedo cotizar online', 'hay una calculadora de precio',
      'cotizar sin escribirles', 'cotizador en la pagina', 'cotizador online',
    ],
    respuesta: 'Sí, podés cotizar tu envío al instante desde el botón "Cotizar envío" en la página, sin necesidad de escribirnos primero — o si preferís, seguimos la cotización acá mismo, escribí "cotizar".',
  },
  {
    id: 'sin_info_pago',
    derivaWhatsapp: true,
    palabrasClave: [
      'metodos de pago', 'como pago', 'formas de pago', 'aceptan tarjeta',
      'aceptan transferencia', 'se puede pagar en efectivo', 'como se paga',
      'puedo pagar con tarjeta de credito', 'aceptan paypal',
      'se puede pagar por transferencia', 'como abono el envio', 'donde pago',
      'aceptan mercado pago', 'puedo pagar en dolares',
    ],
    respuesta: 'Para confirmarte las formas de pago disponibles según tu envío, mejor te conecto con nuestro equipo por WhatsApp.',
  },
  {
    id: 'sin_info_cancelacion',
    derivaWhatsapp: true,
    palabrasClave: [
      'cancelar', 'cancelar envio', 'quiero cancelar', 'puedo cancelar',
      'cambiar el envio', 'modificar mi envio', 'anular envio',
      'quiero anular mi envio', 'me arrepenti del envio', 'puedo devolver el paquete',
      'como hago un reclamo', 'quiero hacer un reclamo', 'quiero devolver mi compra',
    ],
    respuesta: 'Para cancelar o modificar un envío ya solicitado, nuestro equipo te va a poder ayudar directamente por WhatsApp.',
  },
  {
    id: 'sin_info_promociones',
    derivaWhatsapp: true,
    palabrasClave: [
      'promocion', 'promociones', 'descuento', 'descuentos', 'oferta',
      'ofertas', 'hay alguna promo', 'tienen descuentos por cantidad',
      'hay cupones', 'hay algun codigo de descuento', 'promo del mes',
      'ofertas actuales', 'hay descuento por volumen',
    ],
    respuesta: 'Las promociones vigentes te las puede confirmar nuestro equipo directamente por WhatsApp.',
  },
]
