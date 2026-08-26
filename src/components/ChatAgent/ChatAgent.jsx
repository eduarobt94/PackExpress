import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send } from 'lucide-react'
import { useChatAgent } from './useChatAgent'

export default function ChatAgent() {
  const [open, setOpen] = useState(false)
  const [texto, setTexto] = useState('')
  const scrollRef = useRef(null)
  const inputRef = useRef(null)
  const toggleButtonRef = useRef(null)
  const { mensajes, escribiendo, ocupado, enviarMensaje, iniciarBienvenida } = useChatAgent()

  useEffect(() => {
    if (open) {
      iniciarBienvenida()
      inputRef.current?.focus()
    }
  }, [open, iniciarBienvenida])

  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [mensajes, escribiendo, open])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!texto.trim() || ocupado) return
    enviarMensaje(texto)
    setTexto('')
    inputRef.current?.focus()
  }

  return (
    <>
      <button
        type="button"
        ref={toggleButtonRef}
        onClick={() => setOpen(v => {
          const next = !v
          if (!next) toggleButtonRef.current?.focus()
          return next
        })}
        aria-label={open ? 'Cerrar chat de soporte' : 'Abrir chat de soporte'}
        className="fixed bottom-[84px] sm:bottom-[92px] right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full
                   flex items-center justify-center cursor-pointer
                   bg-[var(--bg-elevated)] border border-[#F07232]/30
                   shadow-[0_0_20px_rgba(240,114,50,0.15),0_4px_24px_rgba(0,0,0,0.25)]
                   hover:shadow-[0_0_30px_rgba(240,114,50,0.3),0_4px_24px_rgba(0,0,0,0.3)]
                   transition-[transform,box-shadow] duration-200 hover:scale-105 active:scale-95"
      >
        {open ? <X size={22} className="text-[#F07232]" /> : <Bot size={22} className="text-[#F07232]" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Asistente Pack Express"
            data-lenis-prevent
            className="fixed z-40 bottom-[144px] sm:bottom-[156px] right-4 sm:right-6 left-4 sm:left-auto
                       sm:w-[360px] h-[65vh] sm:h-[520px] max-h-[600px]
                       rounded-2xl border border-[var(--bd-2)] overflow-hidden
                       flex flex-col bg-[var(--bg-card)] backdrop-blur-xl
                       shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--bd-1)] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#F07232]/10 border border-[#F07232]/30">
                  <Bot size={16} className="text-[#F07232]" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--fg-1)] leading-tight">Asistente Pack Express</p>
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--fg-3)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    En línea
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { setOpen(false); toggleButtonRef.current?.focus() }}
                aria-label="Cerrar chat"
                className="p-1.5 rounded-lg text-[var(--fg-3)] hover:text-[var(--fg-1)] hover:bg-[var(--bd-1)] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div ref={scrollRef} aria-live="polite" aria-relevant="additions" className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
              {mensajes.map(m => (
                <div
                  key={m.id}
                  className="flex flex-col gap-1.5"
                  style={{ alignItems: m.autor === 'user' ? 'flex-end' : 'flex-start' }}
                >
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed whitespace-pre-line ${
                    m.autor === 'user'
                      ? 'bg-[#F07232]/10 border border-[#F07232]/25 text-[var(--fg-1)]'
                      : 'bg-[var(--bg-elevated)] border border-[var(--bd-1)] text-[var(--fg-1)]'
                  }`}
                  >
                    {m.texto}
                  </div>
                  {m.chips && (
                    <div className="flex flex-wrap gap-1.5">
                      {m.chips.map(chip => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => enviarMensaje(chip)}
                          disabled={ocupado || escribiendo}
                          className="text-[11px] px-2.5 py-1 rounded-full border border-[#F07232]/30 text-[#F07232] hover:bg-[#F07232]/10 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {escribiendo && (
                <div className="flex gap-1 bg-[var(--bg-elevated)] border border-[var(--bd-1)] rounded-xl px-3 py-2.5 w-fit">
                  {[0, 1, 2].map(i => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-[var(--fg-3)] animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 border-t border-[var(--bd-1)] shrink-0">
              <input
                type="text"
                ref={inputRef}
                value={texto}
                onChange={e => setTexto(e.target.value)}
                placeholder={ocupado ? 'Esperá la respuesta...' : 'Escribí tu mensaje...'}
                className="flex-1 h-10 px-3 rounded-lg text-[13px] bg-[var(--bg-elevated)] border border-[var(--bd-1)] text-[var(--fg-1)] outline-none focus:border-[#F07232]/50 transition-colors"
              />
              <button
                type="submit"
                aria-label="Enviar mensaje"
                disabled={!texto.trim() || ocupado}
                className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center bg-[#F07232] hover:bg-[#E8823C] disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <Send size={16} className="text-white" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
