import { Package, MapPin, Phone, Mail, MessageCircle, ArrowUpRight } from 'lucide-react'

const COLS = [
  {
    heading: 'Servicios',
    links: [
      { label: 'Paquetería Courier',       href: '#servicios' },
      { label: 'Equipaje No Acompañado',   href: '#servicios' },
      { label: 'Envío de Documentos',      href: '#servicios' },
      { label: 'Embalaje Profesional',     href: '#servicios' },
      { label: 'Gestión Aduanera',         href: '#servicios' },
    ],
  },
  {
    heading: 'Empresa',
    links: [
      { label: 'Nosotros',        href: '#nosotros'  },
      { label: 'Tarifas',         href: '#tarifas'   },
      { label: 'Documentación',   href: '#'           },
      { label: 'Cobertura Global',href: '#cobertura' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Términos y Condiciones', href: '#' },
      { label: 'Política de Privacidad', href: '#' },
      { label: 'Resolución N°148/2023',  href: '#', external: true },
    ],
  },
]

const WHATSAPP_URL = 'https://wa.me/59829027227?text=Hola%2C%20me%20gustar%C3%ADa%20cotizar%20un%20env%C3%ADo.'

export default function Footer() {
  return (
    <>
      {/* WhatsApp Floating CTA */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contactar por WhatsApp"
        className="fixed bottom-6 right-6 z-40
                   w-14 h-14 rounded-full
                   flex items-center justify-center
                   bg-[#22C55E] hover:bg-[#16A34A]
                   shadow-[0_4px_24px_rgba(34,197,94,0.45)]
                   hover:shadow-[0_4px_32px_rgba(34,197,94,0.6)]
                   transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <MessageCircle size={24} className="text-white" />
      </a>

      <footer className="bg-[#03040A] border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          {/* Main grid */}
          <div className="py-16 lg:py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

            {/* Brand column — col-span-2 */}
            <div className="lg:col-span-2">
              {/* Logo */}
              <a href="/" className="flex items-center gap-2.5 mb-6 w-fit group">
                <div className="w-9 h-9 rounded-xl bg-[#FF6B00] flex items-center justify-center
                                group-hover:bg-[#FF8C3A] transition-colors duration-200">
                  <Package size={16} className="text-white" />
                </div>
                <div className="leading-none">
                  <div className="text-white font-bold text-sm tracking-wide font-display">
                    PACK EXPRESS
                  </div>
                  <div className="text-white/30 text-[9px] tracking-[0.18em] uppercase mt-0.5">
                    Uruguay S.A.S.
                  </div>
                </div>
              </a>

              {/* Tagline */}
              <p className="text-[13px] text-slate-600 leading-relaxed mb-6 max-w-[280px]">
                Logística nacional e internacional con sede en Montevideo.
                Distribuimos en todo Uruguay y conectamos con más de 50 países.
              </p>

              {/* Contact info */}
              <div className="space-y-3 mb-8">
                <div className="flex items-start gap-2.5">
                  <MapPin size={13} className="text-slate-700 shrink-0 mt-0.5" />
                  <span className="text-[12px] text-slate-600">
                    Carlos Quijano 1258, Montevideo, Uruguay
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={13} className="text-slate-700 shrink-0" />
                  <a
                    href="tel:+59829027227"
                    className="text-[12px] text-slate-600 hover:text-slate-400 transition-colors duration-200"
                  >
                    (+598) 2902 7227
                  </a>
                </div>
                <div className="flex items-center gap-2.5">
                  <Mail size={13} className="text-slate-700 shrink-0" />
                  <a
                    href="mailto:packexpress2021@gmail.com"
                    className="text-[12px] text-slate-600 hover:text-slate-400 transition-colors duration-200"
                  >
                    packexpress2021@gmail.com
                  </a>
                </div>
              </div>

              {/* WhatsApp CTA in brand col */}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                           bg-[#22C55E]/10 border border-[#22C55E]/20 hover:border-[#22C55E]/40
                           text-[#22C55E] hover:text-[#4ADE80]
                           text-[12px] font-semibold
                           transition-all duration-200 group"
              >
                <MessageCircle size={13} />
                Escribinos por WhatsApp
                <ArrowUpRight size={11} className="opacity-60 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>

            {/* Nav columns */}
            {COLS.map(col => (
              <div key={col.heading}>
                <p className="text-[9px] font-bold text-slate-700 uppercase tracking-[0.2em] mb-5">
                  {col.heading}
                </p>
                <ul className="space-y-3">
                  {col.links.map(link => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className="inline-flex items-center gap-1 text-[12px] text-slate-600
                                   hover:text-slate-300 transition-colors duration-200 group"
                      >
                        {link.label}
                        {link.external && (
                          <ArrowUpRight
                            size={10}
                            className="opacity-0 group-hover:opacity-60 transition-opacity duration-200"
                          />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="py-5 border-t border-white/[0.04] flex flex-col sm:flex-row
                          items-center justify-between gap-3">
            <p className="text-[11px] text-slate-700" suppressHydrationWarning>
              © {new Date().getFullYear()} Pack Express Uruguay S.A.S. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-1 h-1 rounded-full bg-slate-800 hidden sm:block" />
              <p className="text-[11px] text-slate-700">
                Resolución N°148/2023
              </p>
              <div className="w-1 h-1 rounded-full bg-slate-800" />
              <p className="text-[11px] text-slate-700">
                URSEC Uruguay
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
