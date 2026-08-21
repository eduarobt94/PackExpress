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
  return { activo: false, paso: null, datos: {}, intentosFallidos: 0, tipos: [], zonaMap: COUNTRY_ZONE }
}

export function useChatAgent() {
  const [mensajes, setMensajes] = useState(cargarHistorial)
  const [escribiendo, setEscribiendo] = useState(false)
  const flujoRef = useRef(flujoVacio())
  const procesandoRef = useRef(false)

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
    if (procesandoRef.current) return
    procesandoRef.current = true
    try {
      const res  = await fetch(`${API}/rastreo.php?guia_numero=${encodeURIComponent(numero)}`)
      const json = await res.json()
      if (!json.ok) {
        ofrecerSalidaWhatsapp(`No encontré ninguna guía con el número "${numero}". Revisá que esté bien escrito, o escribinos por WhatsApp si preferís que te ayudemos directamente.`)
        return
      }
      const { guia, events } = json.data
      const ultimo = (events ?? [])[(events ?? []).length - 1]
      if (!ultimo) {
        responderConDelay(`Encontré tu envío #${guia.numero}, pero todavía no tiene eventos de rastreo registrados.`)
        return
      }
      responderConDelay(`Tu envío #${guia.numero} está en ${ultimo.hito} desde el ${formatFechaHora(ultimo.fecha_hora)}.`)
    } catch {
      ofrecerSalidaWhatsapp('Tuve un problema para consultar el rastreo. Probá de nuevo en un momento, o escribinos por WhatsApp.')
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
    responderConDelay('¡Perfecto! ¿Cuál es el peso aproximado del envío en kg?')
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
      const pais = matchPais(valor, flujo.zonaMap)
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
          abrirCotizadorCompleto('Tuve un problema calculando la cotización. Te abrí el cotizador completo para que puedas intentarlo ahí.')
          return
        }

        const zonaCod = zonaMap[pais]
        const fila    = json.data.zonas.find(z => z.zona_cod === zonaCod)

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
    } finally {
      procesandoRef.current = false
    }
  }, [responderConDelay, abrirCotizadorCompleto, ofrecerSalidaWhatsapp])

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
