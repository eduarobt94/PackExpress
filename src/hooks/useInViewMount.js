import { useEffect, useRef, useState } from 'react'

// Monta recién cuando el placeholder entra (o está por entrar) al viewport,
// en vez de apenas se resuelve el chunk lazy — evita que las ~9 secciones
// below-the-fold compitan todas por CPU/red en los primeros segundos de
// carga en mobile. rootMargin generoso: para cuando el usuario scrollea
// hasta ahí, ya montó.
export function useInViewMount(rootMargin = '600px 0px') {
  const ref = useRef(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    if (visible) return
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )
    observer.observe(el)
    // Red de seguridad: si por lo que sea el observer nunca dispara (bug de
    // navegador, extensión que lo bloquea), no dejar la sección invisible
    // para siempre.
    const fallback = setTimeout(() => setVisible(true), 8000)
    return () => {
      observer.disconnect()
      clearTimeout(fallback)
    }
  }, [visible, rootMargin])

  return [ref, visible]
}

// Para widgets fijos (no ligados a scroll, ej. ChatAgent): montar recién en
// idle, para no competir con el hilo principal durante la carga inicial.
export function useIdleMount(timeout = 3000) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!('requestIdleCallback' in window)) {
      const t = setTimeout(() => setVisible(true), timeout)
      return () => clearTimeout(t)
    }
    const id = requestIdleCallback(() => setVisible(true), { timeout })
    return () => cancelIdleCallback(id)
  }, [timeout])

  return visible
}
