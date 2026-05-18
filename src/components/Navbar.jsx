import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Menu, X, MapPin, ChevronRight } from 'lucide-react'

const LINKS = [
  { label: 'Servicios',   href: '#servicios' },
  { label: 'Tarifas',     href: '#tarifas' },
  { label: 'Cobertura',   href: '#cobertura' },
  { label: 'Nosotros',    href: '#nosotros' },
  { label: 'Contacto',    href: '#contacto' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 backdrop-blur-md ${
          scrolled
            ? 'bg-[#060810]/55'
            : 'bg-[#060810]/20'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[68px]">

            {/* Logo */}
            <a href="#" className="flex items-center gap-2.5 group shrink-0">
              <div className="w-8 h-8 rounded-lg bg-[#FF6B00] flex items-center justify-center
                              group-hover:bg-[#FF8C3A] transition-colors duration-200">
                <Package size={15} className="text-white" />
              </div>
              <div className="leading-none">
                <div className="text-white font-bold text-sm tracking-wide font-display">
                  PACK EXPRESS
                </div>
                <div className="text-white/35 text-[9px] tracking-[0.18em] uppercase mt-0.5">
                  Uruguay S.A.S.
                </div>
              </div>
            </a>

            {/* Desktop links */}
            <div className="hidden lg:flex items-center gap-7">
              {LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  className="relative text-sm text-slate-400 hover:text-white transition-colors duration-200 group py-1"
                >
                  {label}
                  <span className="absolute bottom-0 left-0 w-0 h-px bg-[#FF6B00]
                                   group-hover:w-full transition-all duration-300" />
                </a>
              ))}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden lg:flex items-center gap-2.5">
              <a
                href="#tracking"
                className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white
                           border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg
                           transition-all duration-200 hover:bg-white/[0.04]"
              >
                <MapPin size={13} />
                Rastrear
              </a>
              <a
                href="#contacto"
                className="flex items-center gap-1.5 text-sm font-semibold text-white
                           bg-[#FF6B00] hover:bg-[#FF8C3A] px-4 py-2 rounded-lg
                           transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,107,0,0.25)]"
              >
                Cotizar
                <ChevronRight size={13} />
              </a>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen(v => !v)}
              className="lg:hidden text-slate-400 hover:text-white transition-colors p-1"
              aria-label="Menu"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-x-0 top-16 z-40 bg-[#0C1018]/95 backdrop-blur-2xl
                       border-b border-white/[0.06] lg:hidden"
          >
            <div className="px-6 py-4 space-y-0.5">
              {LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="block py-3 text-sm text-slate-400 hover:text-white transition-colors
                             border-b border-white/[0.04] last:border-0"
                >
                  {label}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-2">
                <a href="#tracking" onClick={() => setOpen(false)}
                   className="text-center text-sm text-slate-300 border border-white/10
                              px-4 py-2.5 rounded-xl transition-colors hover:border-white/20">
                  Rastrear envío
                </a>
                <a href="#contacto" onClick={() => setOpen(false)}
                   className="text-center text-sm font-semibold text-white
                              bg-[#FF6B00] hover:bg-[#FF8C3A] px-4 py-2.5 rounded-xl transition-colors">
                  Cotizar envío
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
