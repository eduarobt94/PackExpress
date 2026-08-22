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
    palabrasClave: ['perfecto', 'genial', 'ok', 'okay', 'entendido', 'buenisimo', 'joya'],
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
