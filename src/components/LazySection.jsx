import { useInViewMount } from '../hooks/useInViewMount'

// Wrapper genérico: el hijo (una sección lazy) recién se renderiza cuando
// el placeholder entra en el viewport (con margen de precarga). El div es
// necesario como ancla para el IntersectionObserver antes de que exista
// contenido real.
export default function LazySection({ children, rootMargin, as: Tag = 'div', ...rest }) {
  const [ref, visible] = useInViewMount(rootMargin)
  return <Tag ref={ref} {...rest}>{visible ? children : null}</Tag>
}
