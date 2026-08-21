import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

const PROMO_ENDPOINT = '/pack-sistema/api/v1/promociones.php?action=activa'

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
      .catch(() => { /* sin promo activa ante cualquier error de red */ })
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

  const content = (
    <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-8 flex items-center justify-center gap-2 py-2.5">
      <span className="text-[13px] md:text-sm font-medium tracking-[0.02em] text-[#FFF5EC] text-center">
        {promo.mensaje}
      </span>
      {promo.link_url && (
        <>
          <span className="hidden sm:inline text-[#FFF5EC]/40">·</span>
          <span className="hidden sm:inline-flex items-center gap-0.5 text-[13px] font-medium text-[#FFF5EC] underline decoration-transparent hover:decoration-current underline-offset-4 transition-[text-decoration-color] duration-200">
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
      style={{ background: 'linear-gradient(90deg, #C85A1F 0%, #F07232 50%, #C85A1F 100%)' }}
    >
      {promo.link_url ? (
        <a href={promo.link_url} className="block">{content}</a>
      ) : content}
    </motion.div>
  )
}
