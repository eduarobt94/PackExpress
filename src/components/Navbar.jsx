import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, MapPin, Search, ChevronRight } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useTheme } from '../context/ThemeContext'

const LINKS = [
  { label: 'Servicios',   href: '#servicios' },
  { label: 'Tarifas',     href: null },
  { label: 'Cobertura',   href: '#cobertura' },
  { label: 'Nosotros',    href: '#nosotros' },
  { label: 'Contacto',    href: '#contacto' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen]         = useState(false)
  const { theme } = useTheme()
  const logo = theme === 'dark' ? '/logoDark.png' : '/logoLight.png'

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
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 backdrop-blur-xl ${
          scrolled
            ? 'border-b border-[var(--bd-1)] shadow-[var(--shadow-navbar)]'
            : 'border-b border-transparent'
        }`}
        style={{ backgroundColor: scrolled ? 'color-mix(in srgb, var(--bg-base) 82%, transparent)' : 'transparent' }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[68px]">

            {/* Logo */}
            <a href="/" className="shrink-0 group opacity-100 hover:opacity-90 transition-opacity duration-200">
              <img src={logo} alt="Pack Express Uruguay" className="h-12 w-auto block" />
            </a>

            {/* Desktop links */}
            <div className="hidden min-[860px]:flex items-center gap-5 lg:gap-7">
              {LINKS.map(({ label, href }) =>
                label === 'Tarifas' ? (
                  <button
                    key="Tarifas"
                    onClick={() => window.dispatchEvent(new CustomEvent('openCotizar'))}
                    className="relative text-sm text-[var(--fg-3)] hover:text-[var(--fg-1)] transition-colors duration-200 group py-1"
                  >
                    Tarifas
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-[#F07232] group-hover:w-full transition-all duration-300" />
                  </button>
                ) : (
                  <a
                    key={label}
                    href={href}
                    className="relative text-sm text-[var(--fg-3)] hover:text-[var(--fg-1)] transition-colors duration-200 group py-1"
                  >
                    {label}
                    <span className="absolute bottom-0 left-0 w-0 h-px bg-[#F07232]
                                     group-hover:w-full transition-all duration-300" />
                  </a>
                )
              )}
            </div>

            {/* Desktop CTAs */}
            <div className="hidden min-[860px]:flex items-center gap-2 lg:gap-3">
              <ThemeToggle />
              <a
                href="#rastreo"
                className="flex items-center gap-1.5 text-sm text-[var(--fg-2)] hover:text-[var(--fg-1)]
                           border border-[var(--bd-2)] hover:border-[var(--bd-3)] px-4 py-2 rounded-lg
                           transition-all duration-200 hover:bg-[var(--bd-1)]"
              >
                <MapPin size={13} />
                Rastrear
              </a>
<button
                onClick={() => window.dispatchEvent(new CustomEvent('openCotizar'))}
                className="flex items-center gap-1.5 text-sm font-semibold text-white
                           bg-[#F07232] hover:bg-[#E8823C] px-4 py-2 rounded-lg
                           transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,107,0,0.25)]
                           focus-visible:ring-2 focus-visible:ring-[#F07232]/50"
              >
                Cotizar
                <ChevronRight size={13} />
              </button>
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setOpen(v => !v)}
              className="min-[860px]:hidden text-[var(--fg-3)] hover:text-[var(--fg-1)] transition-colors p-2 -mr-2 rounded-lg"
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
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 min-[860px]:hidden flex flex-col"
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[var(--bg-alt)]/97 backdrop-blur-2xl -z-10" />

            {/* Header row */}
            <div className="flex items-center justify-end px-6 py-4 border-b border-[var(--bd-1)]">
              <button
                onClick={() => setOpen(false)}
                className="text-[var(--fg-3)] hover:text-[var(--fg-1)] transition-colors p-1"
                aria-label="Cerrar menú"
              >
                <X size={22} />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto px-6 py-2">
              {LINKS.map(({ label, href }) =>
                label === 'Tarifas' ? (
                  <button
                    key={label}
                    onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent('openCotizar')) }}
                    className="flex items-center justify-between w-full py-4 text-[15px]
                               border-b border-[var(--bd-1)] last:border-0
                               text-[var(--fg-2)] hover:text-[var(--fg-1)] transition-colors"
                  >
                    {label}
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <a
                    key={label}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-4 text-[15px]
                               border-b border-[var(--bd-1)] last:border-0
                               text-[var(--fg-2)] hover:text-[var(--fg-1)] transition-colors"
                  >
                    {label}
                    <ChevronRight size={14} />
                  </a>
                )
              )}
            </div>

            {/* Bottom action area */}
            <div className="px-6 pb-8 pt-5 space-y-3 border-t border-[var(--bd-1)]">
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[var(--fg-3)]">Tema</span>
                <ThemeToggle />
              </div>
              <a
                href="#rastreo"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full text-sm text-[var(--fg-2)]
                           border border-[var(--bd-2)] hover:border-[var(--bd-3)]
                           px-4 py-3 rounded-xl transition-colors hover:bg-[var(--bd-1)]"
              >
                <Search size={14} />
                Rastrear envío
              </a>
<button
                onClick={() => { setOpen(false); window.dispatchEvent(new CustomEvent('openCotizar')) }}
                className="flex items-center justify-center w-full text-sm font-semibold text-white
                           bg-[#F07232] hover:bg-[#E8823C] px-4 py-3 rounded-xl transition-colors"
              >
                Cotizar envío
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

