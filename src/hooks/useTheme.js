import { createContext, useContext } from 'react'

/**
 * Contexto y hook de tema, separados del componente ThemeProvider a propósito:
 * un módulo que exporta componentes no debe exportar además hooks/constantes,
 * porque rompe Fast Refresh para ese archivo (react-refresh/only-export-components).
 * El provider vive en context/ThemeContext.jsx y consume estos dos.
 */
export const ThemeContext = createContext({ theme: 'dark', toggle: () => {} })

export const useTheme = () => useContext(ThemeContext)
