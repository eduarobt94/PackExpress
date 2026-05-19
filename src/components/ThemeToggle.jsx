import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <motion.button
      onClick={toggle}
      whileTap={{ scale: 0.88 }}
      className="w-8 h-8 rounded-lg flex items-center justify-center
                 border border-[var(--bd-2)] text-[var(--fg-3)]
                 hover:text-[var(--fg-1)] hover:border-[var(--bd-3)]
                 transition-colors duration-200 shrink-0"
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ rotate: -20, opacity: 0, scale: 0.75 }}
          animate={{ rotate: 0,   opacity: 1, scale: 1    }}
          exit={{    rotate:  20, opacity: 0, scale: 0.75 }}
          transition={{ duration: 0.18 }}
          style={{ display: 'flex' }}
        >
          {isDark ? <Sun size={14} /> : <Moon size={14} />}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}
