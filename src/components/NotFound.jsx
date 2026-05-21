import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  // Noindex: esta página no debe indexarse
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name    = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    document.title = 'Página no encontrada | Pack Express Uruguay'
    return () => {
      document.head.removeChild(meta)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center px-6">
      {/* Glow de fondo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,107,0,0.05) 0%, transparent 70%)',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative text-center max-w-md"
      >
        {/* Icono */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#FF6B00]/10 border border-[#FF6B00]/20
                          flex items-center justify-center">
            <Package size={28} className="text-[#FF6B00]" />
          </div>
        </div>

        {/* Código */}
        <div className="text-[80px] font-bold font-display leading-none
                        text-transparent bg-clip-text
                        bg-gradient-to-b from-[var(--fg-1)] to-[var(--fg-4)]
                        mb-4 select-none">
          404
        </div>

        {/* Título */}
        <h1 className="text-xl font-semibold text-[var(--fg-1)] mb-3">
          Página no encontrada
        </h1>
        <p className="text-[var(--fg-3)] text-sm leading-relaxed mb-8">
          La dirección que buscás no existe o fue movida.
          Desde la home podés rastrear tu envío o cotizar.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href="/"
            className="flex items-center gap-2 text-sm font-semibold text-white
                       bg-[#FF6B00] hover:bg-[#FF8C3A] px-5 py-2.5 rounded-lg
                       transition-colors duration-200 w-full sm:w-auto justify-center"
          >
            <ArrowLeft size={14} />
            Volver al inicio
          </a>
          <a
            href="/#rastreo"
            className="flex items-center gap-2 text-sm text-[var(--fg-2)] hover:text-[var(--fg-1)]
                       border border-[var(--bd-2)] hover:border-[var(--bd-3)]
                       px-5 py-2.5 rounded-lg transition-colors duration-200
                       hover:bg-[var(--bd-1)] w-full sm:w-auto justify-center"
          >
            <Search size={14} />
            Rastrear envío
          </a>
        </div>
      </motion.div>
    </div>
  )
}
