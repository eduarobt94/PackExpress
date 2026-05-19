import { Package, MapPin, Phone, Mail, MessageCircle, ArrowUpRight, ArrowRight } from 'lucide-react'

const COLS = [
  {
    heading: 'Servicios',
    links: [
      { label: 'Paquetería Courier',     href: '#servicios' },
      { label: 'Equipaje No Acompañado', href: '#servicios' },
      { label: 'Envío de Documentos',    href: '#servicios' },
      { label: 'Embalaje Profesional',   href: '#servicios' },
      { label: 'Despacho de Envíos',       href: '#servicios' },
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
    ],
  },
]

const WHATSAPP_URL = 'https://wa.me/59829027227?text=Hola%2C%20me%20gustar%C3%ADa%20cotizar%20un%20env%C3%ADo.'

export default function Footer() {
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

      {/* ── Pre-footer CTA ── */}
      <div className="bg-[var(--bg-deep)] border-t border-[var(--bd-1)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8
                          bg-[var(--bg-card)] border border-[var(--bd-1)] rounded-2xl px-10 py-12 overflow-hidden">
            {/* Glow */}
            <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full
                            bg-[#FF6B00]/[0.06] blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full
                            bg-[#FF6B00]/[0.04] blur-2xl pointer-events-none" />

            <div className="relative text-center lg:text-left w-full lg:w-auto">
              <p className="text-[11px] font-semibold text-[#FF6B00] tracking-[0.22em] uppercase mb-3">
                ¿Listo para enviar?
              </p>
              <h2 className="font-display font-bold text-[var(--fg-1)] text-[clamp(1.6rem,3.5vw,2.4rem)] leading-tight">
                Cotizá tu envío ahora.
                <br />
                <span className="text-[var(--fg-3)]">Sin compromisos.</span>
              </h2>
            </div>

            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openCotizar'))}
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl w-full sm:w-auto
                           bg-[#FF6B00] hover:bg-[#FF8C3A] text-white text-[13px] font-semibold
                           transition-colors duration-200 tracking-wide whitespace-nowrap"
              >
                Cotizar envío <ArrowRight size={14} />
              </button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl w-full sm:w-auto
                           border border-[var(--bd-2)] hover:border-[var(--bd-3)]
                           text-[var(--fg-2)] hover:text-[var(--fg-1)] text-[13px] font-semibold
                           transition-all duration-200 tracking-wide whitespace-nowrap"
              >
                <MessageCircle size={14} aria-hidden="true" />
                WhatsApp
                <span className="sr-only">(abre en nueva pestaña)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer grid ── */}
      <footer className="bg-[var(--bg-deep)] border-t border-[var(--bd-1)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <div className="py-10 lg:py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

            {/* Brand column */}
            <div className="lg:col-span-2">
              <a href="/" className="flex items-center gap-2.5 mb-6 w-fit group">
                <div className="w-9 h-9 rounded-xl bg-[#FF6B00] flex items-center justify-center
                                group-hover:bg-[#FF8C3A] transition-colors duration-200">
                  <Package size={16} className="text-white" />
                </div>
                <div className="leading-none">
                  <div className="text-[var(--fg-1)] font-bold text-sm tracking-wide font-display">
                    PACK EXPRESS
                  </div>
                  <div className="text-[var(--fg-5)] text-[10px] tracking-[0.18em] uppercase mt-0.5">
                    Uruguay S.A.S.
                  </div>
                </div>
              </a>

              <p className="text-[12px] text-[var(--fg-4)] leading-relaxed mb-7 max-w-[260px]">
                Logística nacional e internacional desde Montevideo.
                Distribuimos en todo Uruguay y conectamos con más de 50 países.
              </p>

              <div className="space-y-2.5">
                {[
                  { Icon: MapPin, text: 'Carlos Quijano 1258, Montevideo', href: null },
                  { Icon: Phone,  text: '(+598) 2902 7227',                href: 'tel:+59829027227' },
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
                          className="text-[12px] text-[var(--fg-4)] hover:text-[var(--fg-1)]
                                     transition-colors duration-200"
                        >
                          {link.label}
                        </button>
                      ) : (
                        <a
                          href={link.href}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                          className="inline-flex items-center gap-1 text-[12px] text-[var(--fg-4)]
                                     hover:text-[var(--fg-1)] transition-colors duration-200 group"
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
              © {new Date().getFullYear()} Pack Express Uruguay S.A.S. Todos los derechos reservados.
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
