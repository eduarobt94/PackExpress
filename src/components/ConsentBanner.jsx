import { useState, useEffect } from 'react'
import { analyticsEnabled, getConsent, setConsent } from '../lib/analytics'

/**
 * Banner de consentimiento de analítica. Se muestra solo si la analítica está
 * habilitada en este entorno y el usuario todavía no decidió. "Aceptar" y
 * "Rechazar" tienen el mismo peso visual. El Footer lo reabre con el evento
 * `openConsent` (preferencias).
 */
export default function ConsentBanner() {
  const [open, setOpen] = useState(() => analyticsEnabled() && getConsent() === null)

  useEffect(() => {
    const reopen = () => setOpen(true)
    window.addEventListener('openConsent', reopen)
    return () => window.removeEventListener('openConsent', reopen)
  }, [])

  if (!open || !analyticsEnabled()) return null

  const decide = (granted) => {
    setConsent(granted)
    setOpen(false)
  }

  const btn = `flex-1 sm:flex-none px-4 py-2.5 rounded-lg text-[13px] font-semibold
               border border-[var(--bd-2)] text-[var(--fg-1)] bg-[var(--bg-card)]
               hover:border-[#F07232]/60 transition-colors duration-200`

  return (
    <div
      role="dialog"
      aria-label="Preferencias de cookies"
      className="fixed z-[80] bottom-4 left-4 right-4 sm:right-auto sm:max-w-[420px]
                 bg-[var(--bg-card)] border border-[var(--bd-1)] rounded-2xl p-5
                 shadow-[var(--shadow-modal)]"
    >
      <p className="text-[13px] text-[var(--fg-2)] leading-relaxed mb-4">
        Usamos cookies de analítica (Google Analytics) para entender cómo se usa el sitio y
        mejorarlo. No las usamos para publicidad. Podés cambiar tu decisión cuando quieras.{' '}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('openLegal', { detail: 'privacidad' }))}
          className="underline underline-offset-2 text-[var(--fg-1)] hover:text-[#F07232]"
        >
          Política de privacidad
        </button>
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={() => decide(false)} className={btn}>Rechazar</button>
        <button type="button" onClick={() => decide(true)}  className={btn}>Aceptar</button>
      </div>
    </div>
  )
}
