import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Tag } from 'lucide-react'

const PROMO_ENDPOINT = '/pack-sistema/api/v1/promociones.php?action=activa'

const isSafeUrl = (url) => /^(https?:\/\/|\/)/i.test(url)

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

/** Parsea 'YYYY-MM-DD' sin pasar por Date() para evitar corrimientos por timezone. */
function parseFechaLocal(fecha) {
  const [, m, d] = fecha.split('-').map(Number)
  return { dia: d, mes: MESES[m - 1] }
}

/** 'Del 8 al 21 de agosto' (mismo mes) o 'Del 28 de septiembre al 2 de agosto' (meses distintos). */
function formatRangoFechas(fechaInicio, fechaFin) {
  if (!fechaInicio || !fechaFin) return null
  const ini = parseFechaLocal(fechaInicio)
  const fin = parseFechaLocal(fechaFin)
  if (ini.mes === fin.mes) return `Del ${ini.dia} al ${fin.dia} de ${fin.mes}`
  return `Del ${ini.dia} de ${ini.mes} al ${fin.dia} de ${fin.mes}`
}

export default function PromoBanner() {
  const [promo, setPromo] = useState(null)
  const barRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    fetch(PROMO_ENDPOINT)
      .then(res => res.json())
      .then(json => {
        if (cancelled) return
        if (json?.ok && json.data?.promocion) setPromo(json.data.promocion)
      })
      .catch(err => { console.error('[PromoBanner] fetch failed', err) })
    return () => { cancelled = true }
  }, [])

  const measure = useCallback(() => {
    const h = barRef.current?.offsetHeight ?? 0
    document.documentElement.style.setProperty('--promo-h', `${h}px`)
  }, [])

  useEffect(() => {
    if (!promo) {
      document.documentElement.style.setProperty('--promo-h', '0px')
      return
    }
    measure()
    const ro = new ResizeObserver(measure)
    if (barRef.current) ro.observe(barRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      document.documentElement.style.setProperty('--promo-h', '0px')
    }
  }, [promo, measure])

  if (!promo) return null

  const ctaLabel = promo.link_texto?.trim() || 'Ver más'
  const hasSafeLink = promo.link_url && isSafeUrl(promo.link_url)
  const rangoFechas = formatRangoFechas(promo.fecha_inicio, promo.fecha_fin)

  const content = (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-8 flex items-center justify-center gap-2 py-1.5">
      <Tag size={14} className="hidden sm:block shrink-0 text-white" />
      <span className="min-w-0 text-[12px] sm:text-[13px] md:text-[15px] font-semibold tracking-[0.01em] text-white text-center leading-snug">
        {promo.mensaje}
        {rangoFechas && (
          <span className="font-medium text-white/80"> · {rangoFechas}</span>
        )}
      </span>
      {hasSafeLink && (
        <>
          <span className="hidden sm:inline text-white/40">·</span>
          <span className="hidden sm:inline-flex items-center gap-0.5 text-[13px] font-medium text-white underline decoration-transparent hover:decoration-current underline-offset-4 transition-[text-decoration-color] duration-200">
            {ctaLabel}
            <ChevronRight size={12} />
          </span>
        </>
      )}
    </div>
  )

  return (
    <motion.div
      ref={barRef}
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 inset-x-0 z-[60]"
      style={{ background: 'linear-gradient(90deg, #B85D2C 0%, #F07232 22%, #F07232 78%, #B85D2C 100%)' }}
    >
      {hasSafeLink ? (
        <a href={promo.link_url} className="block">{content}</a>
      ) : content}
    </motion.div>
  )
}
