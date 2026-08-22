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
  const dispatchGenRef = useRef(0)
  const bienvenidaEnviadaRef = useRef(false)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mensajes))
  }, [mensajes])

  const agregarMensaje = useCallback((autor, texto, chips = null) => {
    setMensajes(prev => [...prev, crearMensaje(autor, texto, chips)])
  }, [])

  const responderConDelay = useCallback((texto, chips = null) => {
    setEscribiendo(true)
    const delay = 500 + Math.random() * 700
    return new Promise(resolve => {
      setTimeout(() => {
        setEscribiendo(false)
        agregarMensaje('bot', texto, chips)
        resolve()
      }, delay)
    })
  }, [agregarMensaje])

  const iniciarBienvenida = useCallback(() => {
    setMensajes(prev => {
      if (prev.length > 0 || bienvenidaEnviadaRef.current) return prev
      // Guard síncrono: responderConDelay demora el mensaje real (setTimeout),
      // así que "prev.length > 0" no alcanza para evitar duplicados si esta
      // función se llama dos veces seguidas antes de que el mensaje se agregue
      // (ej. React StrictMode invoca los efectos dos veces a propósito en dev).
      bienvenidaEnviadaRef.current = true
      responderConDelay(
        '¡Hola! 👋 Soy el asistente de Pack Express. Puedo ayudarte a rastrear un envío, cotizar, o responder preguntas frecuentes.',
        ['Rastrear mi envío', 'Cotizar', 'Preguntas frecuentes'],
      )
      return prev
    })
  }, [responderConDelay])

  const ofrecerSalidaWhatsapp = useCallback((mensaje) => {
    return responderConDelay(mensaje, ['Hablar por WhatsApp'])
  }, [responderConDelay])

  const abrirCotizadorCompleto = useCallback((mensaje) => {
    flujoRef.current = flujoVacio()
    window.dispatchEvent(new CustomEvent('openCotizar'))
    return responderConDelay(mensaje)
  }, [responderConDelay])

  const manejarRastreo = useCallback(async (numero) => {
    if (procesandoRef.current) return
    procesandoRef.current = true
    try {
      const res  = await fetch(`${API}/rastreo.php?guia_numero=${encodeURIComponent(numero)}`)
      const json = await res.json()
      if (!json.ok) {
        return ofrecerSalidaWhatsapp(`No encontré ninguna guía con el número "${numero}". Revisá que esté bien escrito, o escribinos por WhatsApp si preferís que te ayudemos directamente.`)
      }
      const { guia, events } = json.data
      // guia.numero es el AWB/manifiesto compartido por todos los paquetes del
      // lote, no identifica una guía puntual — el código único por guía es el
      // formato CM...PK derivado de id_guia (el mismo que el cliente puede
      // haber tipeado para buscar).
      const codigoGuia = `CM${String(guia.id_guia).padStart(9, '0')}PK`
      const destino = guia.municipio_dest && guia.provincia_dest
        ? ` Destino: ${guia.municipio_dest}, ${guia.provincia_dest}.`
        : ''
      const ultimo = (events ?? [])[(events ?? []).length - 1]
      if (!ultimo) {
        return responderConDelay(`Encontré tu envío #${codigoGuia}, pero todavía no tiene eventos de rastreo registrados.${destino}`)
      }
      return responderConDelay(`Tu envío #${codigoGuia} está en ${ultimo.hito} desde el ${formatFechaHora(ultimo.fecha_hora)}.${destino}`)
    } catch {
      return ofrecerSalidaWhatsapp('Tuve un problema para consultar el rastreo. Probá de nuevo en un momento, o escribinos por WhatsApp.')
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
    return responderConDelay('¡Perfecto! ¿Cuál es el peso aproximado del envío en kg?')
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
          return abrirCotizadorCompleto('Para cotizar con más detalle, te abrí el cotizador completo.')
        }
        return responderConDelay('No pude entender el peso, ¿podés escribirlo solo en números? Ej: 2.5')
      }
      flujo.datos.peso = peso
      flujo.paso = 'pais'
      flujo.intentosFallidos = 0
      return responderConDelay('¿A qué país enviamos?')
    }

    if (flujo.paso === 'pais') {
      const pais = matchPais(valor, flujo.zonaMap)
      if (!pais) {
        flujo.intentosFallidos += 1
        if (flujo.intentosFallidos >= MAX_INTENTOS_FALLIDOS) {
          return abrirCotizadorCompleto('Para cotizar con más detalle, te abrí el cotizador completo.')
        }
        return responderConDelay('No reconocí ese país, ¿podés escribirlo de nuevo? Por ejemplo: Estados Unidos, España, Cuba.')
      }
      flujo.datos.pais = pais
      flujo.paso = 'tipo'
      flujo.intentosFallidos = 0
      const nombresTipos = flujo.tipos.map(t => t.nombre).join(', ') || 'paquete, documento'
      return responderConDelay(`¿Qué tipo de envío es? (${nombresTipos})`)
    }

    if (flujo.paso === 'tipo') {
      const tipo = matchTipo(valor, flujo.tipos)
      if (!tipo) {
        flujo.intentosFallidos += 1
        if (flujo.intentosFallidos >= MAX_INTENTOS_FALLIDOS) {
          return abrirCotizadorCompleto('Para cotizar con más detalle, te abrí el cotizador completo.')
        }
        return responderConDelay('No reconocí ese tipo de envío, ¿podés elegir uno de la lista?')
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
          return abrirCotizadorCompleto('Tuve un problema calculando la cotización. Te abrí el cotizador completo para que puedas intentarlo ahí.')
        }

        const zonaCod = zonaMap[pais]
        const fila    = json.data.zonas.find(z => z.zona_cod === zonaCod)

        if (!fila || !fila.disponible) {
          return responderConDelay(`No tengo una tarifa disponible para ${pais} con ${peso} kg en este momento. Te recomiendo escribirnos por WhatsApp para confirmarlo.`, ['Hablar por WhatsApp'])
        }
        return responderConDelay(`Envío de ${peso} kg a ${pais} (${ZONE_LABELS[zonaCod]}): USD ${fila.total.toFixed(2)}. Este precio es estimado, se confirma al gestionar el envío.`)
      } catch {
        flujoRef.current = flujoVacio()
        return ofrecerSalidaWhatsapp('Tuve un problema calculando la cotización. Probá de nuevo, o escribinos por WhatsApp.')
      }
    }
    } finally {
      procesandoRef.current = false
    }
  }, [responderConDelay, abrirCotizadorCompleto, ofrecerSalidaWhatsapp])

  /** Procesa UNA intención ya detectada (puede haber varias por mensaje, ver enviarMensaje). */
  const procesarIntencion = useCallback(async (intencion) => {
    if (intencion.tipo !== 'desconocido') {
      contextoRef.current.nivelFallback = 0
    }

    switch (intencion.tipo) {
      case 'rastreo':
        return manejarRastreo(intencion.numero)
      case 'rastreo_pedir_numero':
        return responderConDelay('Decime el número de tu guía y te digo en qué estado está.')
      case 'cotizar_iniciar':
        return iniciarCotizacion()
      case 'cotizar_respuesta':
        return manejarRespuestaCotizacion(intencion.valor)
      case 'greeting':
        return responderConDelay(elegirSaludo())
      case 'goodbye':
        return responderConDelay(GOODBYE_RESPONSES[Math.floor(Math.random() * GOODBYE_RESPONSES.length)])
      case 'small_talk':
      case 'thanks':
        return responderConDelay(intencion.respuestas[Math.floor(Math.random() * intencion.respuestas.length)])
      case 'human_handoff':
        return responderConDelay('¡Dale! Te paso directo con nuestro equipo para que te ayuden mejor.', ['Hablar por WhatsApp'])
      case 'faq':
        contextoRef.current.ultimoTema = intencion.temaId
        if (intencion.derivaWhatsapp) {
          return responderConDelay(intencion.respuesta, ['Hablar por WhatsApp'])
        }
        return responderConDelay(intencion.respuesta)
      default: {
        contextoRef.current.nivelFallback += 1
        const nivel = contextoRef.current.nivelFallback
        if (nivel === 1) {
          return responderConDelay('Disculpá, no estoy seguro de haber entendido tu consulta. ¿Podés explicarme un poco más qué necesitás?')
        }
        if (nivel === 2) {
          return responderConDelay(
            'Quiero ayudarte 😊 ¿Tu consulta está relacionada con nuestros servicios, precios, horarios, ubicación o rastreo de un envío?',
            ['Servicios', 'Cotizar', 'Horarios', 'Ubicación', 'Rastrear mi envío'],
          )
        }
        contextoRef.current.nivelFallback = 0
        return ofrecerSalidaWhatsapp('Para esta consulta necesito la ayuda de una persona de nuestro equipo. Podés contactarnos por WhatsApp y te ayudamos directamente.')
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

    const miGen = ++dispatchGenRef.current
    ;(async () => {
      for (const intencion of intenciones) {
        if (dispatchGenRef.current !== miGen) return
        await procesarIntencion(intencion)
      }
    })()
  }, [agregarMensaje, responderConDelay, procesarIntencion])

  return { mensajes, escribiendo, enviarMensaje, iniciarBienvenida }
}
