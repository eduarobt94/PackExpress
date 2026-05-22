import { MapPin, Phone, Mail, MessageCircle, ArrowUpRight, ArrowRight } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const COLS = [
  {
    heading: 'Servicios',
    links: [
      { label: 'Paquetería Courier',      href: '#servicios' },
      { label: 'Casillero Internacional', href: '#servicios', blue: true },
      { label: 'Equipaje No Acompañado',  href: '#servicios' },
      { label: 'Envío de Documentos',     href: '#servicios' },
    ],
  },
  {
    heading: 'Empresa',
    links: [
      { label: 'Nosotros',         href: '#nosotros'  },
      { label: 'Tarifas',          href: '#tarifas'   },
      { label: 'Cobertura Global', href: '#cobertura' },
      { label: 'Documentación',    href: '#contacto'  },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Términos y Condiciones', modal: 'terminos'   },
      { label: 'Política de Privacidad', modal: 'privacidad' },
      { label: 'Resolución N°148/2023',  href: '#', external: true },
      { label: 'Artículos Prohibidos',   modal: 'prohibidos', danger: true },
    ],
  },
]

const WHATSAPP_URL = 'https://wa.me/59893594297?text=Hola%2C%20me%20gustar%C3%ADa%20cotizar%20un%20env%C3%ADo.'

export default function Footer() {
  const { theme } = useTheme()
  const logo = theme === 'dark' ? '/logoDark.png' : '/logoLight.png'

  return (
    <>
      {/* WhatsApp floating button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp (abre en nueva pestaña)"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full
                   flex items-center justify-center
                   bg-[#22C55E] hover:bg-[#16A34A]
                   shadow-[0_4px_24px_rgba(34,197,94,0.4)]
                   hover:shadow-[0_4px_32px_rgba(34,197,94,0.55)]
                   transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <MessageCircle size={24} className="text-white" />
      </a>

      {/* â”€â”€ Pre-footer CTA â”€â”€ */}
      <div className="bg-[var(--bg-deep)] border-t border-[var(--bd-1)]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-8 py-16 lg:py-24">
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8
                          bg-[var(--bg-card)] border border-[var(--bd-1)] rounded-2xl px-10 py-12 overflow-hidden">
            {/* Glows */}
            <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full
                            bg-[#F07232]/[0.06] blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full
                            bg-[#527ED8]/[0.07] blur-2xl pointer-events-none" />

            <div className="relative text-center lg:text-left w-full lg:w-auto">
              <p className="text-[11px] font-semibold text-[#F07232] tracking-[0.22em] uppercase mb-3">
                ¿Listo para empezar?
              </p>
              <h2 className="font-display font-bold text-[var(--fg-1)] text-[clamp(1.6rem,3.5vw,2.4rem)] leading-tight">
                Enviá al mundo.
                <br />
                <span className="text-[var(--fg-3)]">Traé lo que querés.</span>
              </h2>
            </div>

            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openCotizar'))}
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl w-full sm:w-auto
                           bg-[#F07232] hover:bg-[#E8823C] text-white text-[13px] font-semibold
                           transition-colors duration-200 tracking-wide whitespace-nowrap"
              >
                Cotizar envío <ArrowRight size={14} />
              </button>
              <a
                href="#servicios"
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl w-full sm:w-auto
                           border border-[#527ED8]/30 hover:border-[#527ED8]/55
                           text-[#527ED8] hover:text-[#6B90DC] text-[13px] font-semibold
                           transition-all duration-200 tracking-wide whitespace-nowrap
                           hover:bg-[#527ED8]/[0.07] hover:shadow-[0_0_24px_rgba(59,126,248,0.18)]"
              >
                Abrir casillero <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ Footer grid â”€â”€ */}
      <footer className="bg-[var(--bg-deep)] border-t border-[var(--bd-1)]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-8">

          <div className="py-10 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

            {/* Brand column */}
            <div className="lg:col-span-2">
              <a href="/" className="inline-block mb-6 opacity-100 hover:opacity-85 transition-opacity duration-200">
                <img src={logo} alt="Pack Express Uruguay" className="h-14 w-auto block" />
              </a>

              <p className="text-[12px] text-[var(--fg-4)] leading-relaxed mb-7 max-w-[260px]">
                Courier, casillero internacional y distribución nacional
                desde Montevideo. Llegamos a todo Uruguay y más de 50 países.
              </p>

              <div className="space-y-2.5">
                {[
                  { Icon: MapPin, text: 'Carlos Quijano 1258, Montevideo', href: null },
                  { Icon: Phone,  text: '(+598) 93 594 297',                href: 'tel:+59893594297' },
                  { Icon: Mail,   text: 'packexpress2021@gmail.com',        href: 'mailto:packexpress2021@gmail.com' },
                ].map(({ Icon, text, href }) => {
                  const cls = 'text-[11px] text-[var(--fg-4)] hover:text-[var(--fg-2)] transition-colors duration-200'
                  return (
                    <div key={text} className="flex items-center gap-2.5">
                      <Icon size={12} className="text-[var(--fg-5)] shrink-0" />
                      {href
                        ? <a href={href} className={cls}>{text}</a>
                        : <span className={cls}>{text}</span>
                      }
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Nav columns */}
            {COLS.map(col => (
              <div key={col.heading}>
                <p className="text-[10px] font-bold text-[var(--fg-5)] uppercase tracking-[0.22em] mb-5">
                  {col.heading}
                </p>
                <ul className="space-y-3">
                  {col.links.map(link => (
                    <li key={link.label}>
                      {link.modal ? (
                        <button
                          onClick={() => window.dispatchEvent(new CustomEvent('openLegal', { detail: link.modal }))}
                          className="text-[12px] transition-colors duration-200"
                          style={link.danger
                            ? { color: 'rgba(229,53,53,0.65)' }
                            : undefined
                          }
                          onMouseEnter={e => {
                            if (link.danger) e.currentTarget.style.color = '#E53535'
                            else e.currentTarget.style.color = 'var(--fg-1)'
                          }}
                          onMouseLeave={e => {
                            if (link.danger) e.currentTarget.style.color = 'rgba(229,53,53,0.65)'
                            else e.currentTarget.style.color = 'var(--fg-4)'
                          }}
                        >
                          {link.label}
                        </button>
                      ) : (
                        <a
                          href={link.href}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                          className="inline-flex items-center gap-1 text-[12px] transition-colors duration-200 group"
                          style={link.blue ? { color: 'rgba(59,126,248,0.70)' } : { color: 'var(--fg-4)' }}
                          onMouseEnter={e => {
                            if (link.blue) e.currentTarget.style.color = '#6B90DC'
                            else e.currentTarget.style.color = 'var(--fg-1)'
                          }}
                          onMouseLeave={e => {
                            if (link.blue) e.currentTarget.style.color = 'rgba(59,126,248,0.70)'
                            else e.currentTarget.style.color = 'var(--fg-4)'
                          }}
                        >
                          {link.label}
                          {link.external && (
                            <>
                              <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-60 transition-opacity" aria-hidden="true" />
                              <span className="sr-only">(abre en nueva pestaña)</span>
                            </>
                          )}
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="py-5 border-t border-[var(--bd-1)] flex flex-col sm:flex-row
                          items-center justify-between gap-3">
            <p className="text-[12px] text-[var(--fg-5)]" suppressHydrationWarning>
              Â© {new Date().getFullYear()} Pack Express Uruguay S.A.S. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4 text-[12px] text-[var(--fg-5)]">
              <span>Resolución N°148/2023</span>
              <div className="w-1 h-1 rounded-full bg-slate-800" />
              <span>URSEC Uruguay</span>
              <div className="w-1 h-1 rounded-full bg-slate-800" />
              <span>Montevideo</span>
            </div>
          </div>

        </div>
      </footer>
    </>
  )
}

