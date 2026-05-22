import { useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { MapPin, Search, Globe, Zap, Shield } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

/* â”€â”€ Three.js dot-map canvas "” Three.js se carga dinámicamente â”€â”€â”€â”€ */
function DotMap({ onReady }) {
  const canvasRef  = useRef(null)
  const onReadyRef = useRef(onReady)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let animId
    let points    = null
    let particles = []
    let positions = null

    // Carga dinámica: Three.js (507 KB) no bloquea el render inicial
    import('three').then((THREE) => {
    const centerVector = new THREE.Vector3(0, 0, 0)

    const rect = canvas.parentElement.getBoundingClientRect()
    const ww   = rect.width  || window.innerWidth
    const wh   = rect.height || window.innerHeight

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    renderer.setSize(ww, wh, false)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)

    const scene  = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(50, ww / wh, 0.1, 10000)
    camera.position.set(0, 0, 200)
    camera.lookAt(centerVector)
    scene.add(camera)

    const getImageData = (image) => {
      const c   = document.createElement('canvas')
      c.width   = image.width
      c.height  = image.height
      const ctx = c.getContext('2d')
      ctx.drawImage(image, 0, 0)
      return ctx.getImageData(0, 0, image.width, image.height)
    }

    const render = () => {
      animId = requestAnimationFrame(render)
      if (!points) return

      const posAttr = points.geometry.getAttribute('position')
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += (p.destX - p.x) * p.speed
        p.y += (p.destY - p.y) * p.speed
        p.z += (p.destZ - p.z) * p.speed
        positions[i * 3]     = p.x
        positions[i * 3 + 1] = p.y
        positions[i * 3 + 2] = p.z
      }

      posAttr.needsUpdate = true
      renderer.render(scene, camera)
    }

    const drawTheMap = (imagedata) => {
      const fovRad = 50 * Math.PI / 180
      const yVis   = 2 * 200 * Math.tan(fovRad / 2)
      const xVis   = yVis * (ww / wh)
      const factor = ww > 1600 ? 0.89 : 0.88
      const scaleX = (xVis / imagedata.width)  * factor
      const scaleY = (yVis / imagedata.height) * factor

      for (let y = 0; y < imagedata.height; y += 2) {
        for (let x = 0; x < imagedata.width; x += 2) {
          if (imagedata.data[(x * 4 + y * 4 * imagedata.width) + 3] > 128) {
            particles.push({
              x:     Math.random() * 1000 - 500,
              y:     Math.random() * 1000 - 500,
              z:     -Math.random() * 500,
              destX: (x - imagedata.width  / 2) * scaleX,
              destY: (-y + imagedata.height / 2) * scaleY,
              destZ: 0,
              speed: Math.random() / 80 + 0.04,
            })
          }
        }
      }

      positions = new Float32Array(particles.length * 3)
      for (let i = 0; i < particles.length; i++) {
        positions[i * 3]     = particles[i].x
        positions[i * 3 + 1] = particles[i].y
        positions[i * 3 + 2] = particles[i].z
      }

      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

      const material = new THREE.PointsMaterial({
        size: 3,
        color: 0x3d4556,
        sizeAttenuation: false,
      })

      points = new THREE.Points(geometry, material)
      scene.add(points)
      animId = requestAnimationFrame(render)
    }

    const loader = new THREE.TextureLoader()
    loader.load(
      '/textures/worldMap.png',
      (texture) => {
        const imagedata = getImageData(texture.image)
        drawTheMap(imagedata)
        onReadyRef.current?.()
      }
    )

    const onResize = () => {
      const r = canvas.parentElement.getBoundingClientRect()
      const w = r.width  || window.innerWidth
      const h = r.height || window.innerHeight
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    // Cleanup guardado en ref para poder llamarlo desde el return externo
    canvasRef._cleanup = () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
    }
    }) // fin import('three').then

    return () => {
      canvasRef._cleanup?.()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
    />
  )
}

/* â”€â”€ SVG routes overlay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const toSVG = (lat, lon) => ({ x: (lon + 180) / 360 * 1000, y: (90 - lat) / 180 * 580 })

const ORIGIN = toSVG(-48, -70) // Uruguay

const CITIES = [
  { id: 'new-york',   ...toSVG( 40.7,  -144.0) },
  { id: 'london',     ...toSVG( 51.5,    15.0) },
  { id: 'shanghai',   ...toSVG( 61.2,  111.5) },
  { id: 'tokyo',      ...toSVG( 35.7,  139.7) }, 
  { id: 'sao-paulo',  ...toSVG(-23.5,  -46.6) },
  { id: 'miami',      ...toSVG(30,  -80.2) }, 
  { id: 'bogota',     ...toSVG(8, -94) },
  { id: 'sydney',     ...toSVG(-33.9, 151.2) }, 
  { id: 'buenos-aires', ...toSVG(-64.6, -82.4) }
]

function RoutesOverlay({ visible, isDark }) {
  const [vp, setVp] = useState({ ww: window.innerWidth, wh: window.innerHeight })

  useEffect(() => {
    const update = () => setVp({ ww: window.innerWidth, wh: window.innerHeight })
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  const factor           = vp.ww > 1600 ? 0.89 : 0.88
  const circleCorrection = (vp.wh / 580) / (vp.ww / 1000)

  const routes = CITIES.map((city, i) => {
    const endX = ORIGIN.x + (city.x - ORIGIN.x) * 0.80
    const endY = ORIGIN.y + (city.y - ORIGIN.y) * 0.80
    const dx   = endX - ORIGIN.x
    const dy   = endY - ORIGIN.y
    const dist = Math.sqrt(dx * dx + dy * dy)
    const cx   = (ORIGIN.x + endX) / 2
    const cy   = Math.max(30, (ORIGIN.y + endY) / 2 - dist * (city.curve ?? 0.22))
    const dur  = (3.2 + i * 0.28).toFixed(1)
    const begin = (i * 0.55).toFixed(1)
    return { id: city.id, d: `M ${ORIGIN.x} ${ORIGIN.y} Q ${cx} ${cy} ${endX} ${endY}`, dur, begin }
  })

  return (
    <svg
      viewBox="0 0 1000 580"
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="glow-r" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation={isDark ? 3.5 : 2} result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>

      {/* factor-scale group "” matches Three.js map scaling from center */}
      <g transform={`translate(500,290) scale(${factor}) translate(-500,-290)`}>

        {/* Pulsing origin "” Uruguay (appears first) */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          transition={{ duration: 0.9, delay: visible ? 0 : 0 }}
        >
          {/* circleCorrection mantiene los círculos redondos con preserveAspectRatio="none" */}
          <g transform={`translate(${ORIGIN.x},${ORIGIN.y}) scale(${circleCorrection},1) translate(${-ORIGIN.x},${-ORIGIN.y})`}>
            <circle cx={ORIGIN.x} cy={ORIGIN.y} r="4" fill="#F07232" filter="url(#glow-r)" />
            <circle cx={ORIGIN.x} cy={ORIGIN.y} r="4" fill="none" stroke="#F07232" strokeWidth="1.5" opacity="0.6">
              <animate attributeName="r"       values="4;16;4"    dur="2.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx={ORIGIN.x} cy={ORIGIN.y} r="4" fill="none" stroke="#F07232" strokeWidth="1" opacity="0.3">
              <animate attributeName="r"       values="4;26;4"    dur="2.4s" begin="0.7s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2.4s" begin="0.7s" repeatCount="indefinite" />
            </circle>
          </g>
        </motion.g>

        {/* Arc paths "” always in DOM (mpath needs the IDs), staggered fade-in */}
        {routes.map((r, i) => (
          <motion.path
            key={r.id}
            id={`rt${i}`}
            d={r.d}
            fill="none"
            stroke={isDark ? 'rgba(255,107,0,0.18)' : 'rgba(255,107,0,0.45)'}
            strokeWidth="0.8"
            initial={{ opacity: 0 }}
            animate={{ opacity: visible ? 1 : 0 }}
            transition={{ duration: 0.8, delay: visible ? 0.6 + i * 0.1 : 0 }}
          />
        ))}

        {/* Travelling package icons "” appear last, staggered */}
        {routes.map((r, i) => (
          <motion.g
            key={`box-${r.id}`}
            filter="url(#glow-r)"
            initial={{ opacity: 0 }}
            animate={{ opacity: visible ? (isDark ? 0.92 : 1) : 0 }}
            transition={{ duration: 0.8, delay: visible ? 1.8 + i * 0.08 : 0 }}
          >
            <rect x="-2.8" y="-2.5" width="5.6" height="5" rx="0.6"
                  fill="#F07232" stroke="#E8823C" strokeWidth="0.4" />
            <line x1="-2.8" y1="0.3" x2="2.8" y2="0.3"
                  stroke="rgba(255,255,255,0.7)" strokeWidth="0.4" />
            <line x1="0" y1="-2.5" x2="0" y2="0.3"
                  stroke="rgba(255,255,255,0.7)" strokeWidth="0.4" />
            <animateMotion dur={`${r.dur}s`} repeatCount="indefinite" begin={`${r.begin}s`} rotate="auto">
              <mpath href={`#rt${i}`} />
            </animateMotion>
          </motion.g>
        ))}

      </g>
    </svg>
  )
}

/* â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function Hero() {
  const ref = useRef(null)
  const [mapReady, setMapReady] = useState(false)
  const [trackingValue, setTrackingValue] = useState('')

  function handleHeroTrack() {
    window.dispatchEvent(new CustomEvent('doTracking', { detail: trackingValue.trim() }))
    document.getElementById('rastreo')?.scrollIntoView({ behavior: 'smooth' })
  }
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })
  const y       = useTransform(scrollYProgress, [0, 1], ['0%', '28%'])
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden bg-[var(--bg-base)]"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 75% 55% at 50% -5%,  rgba(255,107,0,0.06) 0%, transparent 65%),
            radial-gradient(ellipse 55% 45% at 80% 110%, rgba(37,99,235,0.05) 0%, transparent 65%)
          `,
        }}
      />

      {/* Background dot grid "” fills ocean/polar areas */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden min-[1100px]:block" aria-hidden="true">
        <defs>
          <pattern id="bg-dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="16" cy="16" r="0.8" fill={isDark ? 'rgba(255,255,255,0.055)' : 'rgba(0,0,0,0.06)'} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg-dots)" />
      </svg>

      <motion.div
        className="absolute inset-0 pointer-events-none hidden min-[1100px]:block"
        style={{ y}}
      >
        <DotMap onReady={() => setTimeout(() => setMapReady(true), 2500)} />
        <RoutesOverlay visible={mapReady} isDark={isDark} />
      </motion.div>

      {/* Vignette "” fades only left/right/bottom edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            linear-gradient(to right,  var(--bg-base) 0%, transparent 18%, transparent 82%, var(--bg-base) 100%),
            linear-gradient(to bottom, transparent 0%, transparent 60%, var(--bg-base) 100%)
          `,
        }}
      />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 lg:px-8 pt-20 sm:pt-24 lg:pt-32 pb-14 sm:pb-20 w-full
                   flex justify-end"
        style={{ opacity }}
      >
        <div className="w-full lg:w-[55%] text-left">

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full mb-8
                       border border-[#F07232]/30 bg-[#F07232]/[0.06]
                       text-[9px] sm:text-[12px] font-semibold max-[430px]:tracking-[-0.06em] tracking-[0.06em] sm:tracking-[0.10em] uppercase"
          >
            <span className="text-[#E8823C] whitespace-nowrap">Courier</span>
            <span className="text-[var(--fg-5)]">·</span>
            <span className="text-[#6B90DC] whitespace-nowrap">Casillero Internacional</span>
            <span className="text-[var(--fg-5)]">·</span>
            <span className="text-[var(--fg-2)] whitespace-nowrap">Distribución Nacional</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-bold leading-[0.95] tracking-tight text-[var(--fg-1)] mb-6
                       text-[clamp(2rem,6vw,4.8rem)]"
          >
            Conectamos{' '}
            <span className="text-[#527ED8]">
              Uruguay
            </span>
            <br />
            con el{' '}
            <span className="text-[#F07232]">
              mundo.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.38 }}
            className="text-[15px] sm:text-lg text-[var(--fg-2)] leading-relaxed max-w-[480px] mb-10"
          >
            Distribución en todo Uruguay, envíos internacionales a +50 países
            y tu casillero personal para comprar donde quieras y recibir
            en tu puerta. Todo desde un solo lugar.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 mb-10 sm:mb-12"
          >
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openCotizar'))}
              className="px-6 py-3.5 rounded-xl w-full sm:w-auto justify-center
                         bg-[#F07232] hover:bg-[#E8823C] text-white font-semibold text-sm
                         transition-all duration-300
                         hover:shadow-[0_0_32px_rgba(255,107,0,0.30)]"
            >
              Cotizar envío
            </button>
            <a
              href="#servicios"
              className="px-6 py-3.5 rounded-xl w-full sm:w-auto justify-center
                         border border-[#527ED8]/25 hover:border-[#527ED8]/55
                         text-[var(--fg-2)] hover:text-[#6B90DC] font-semibold text-sm
                         transition-all duration-300
                         bg-[#527ED8]/[0.06] backdrop-blur-2xl hover:bg-[#527ED8]/[0.12]
                         hover:shadow-[0_0_24px_rgba(59,126,248,0.18)]"
            >
              Abrir mi casillero
            </a>
          </motion.div>

          <motion.div
            id="tracking"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.62 }}
            className="flex items-center gap-2 max-w-full sm:max-w-[560px]
                       p-1.5 bg-[var(--bg-card)] border border-[var(--bd-1)] rounded-2xl
                       focus-within:border-[#F07232]/50 focus-within:shadow-[0_0_0_3px_rgba(240,114,50,0.12)]
                       transition-[border-color,box-shadow] duration-200"
          >
            <div className="flex items-center flex-1 pl-2">
              <label htmlFor="hero-tracking" className="sr-only">Número de seguimiento</label>
              <input
                id="hero-tracking"
                type="text"
                value={trackingValue}
                onChange={e => setTrackingValue(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleHeroTrack()}
                placeholder="Número de seguimiento..."
                className="flex-1 bg-transparent text-sm text-[var(--fg-1)] placeholder-[var(--fg-4)]
                           outline-none focus:outline-none focus-visible:outline-none focus:ring-0 py-2.5 min-w-0"
                style={{ outline: 'none', boxShadow: 'none' }}
              />
            </div>
            <button
              onClick={handleHeroTrack}
              className="flex items-center gap-1.5 px-5 py-2.5 bg-[#F07232] hover:bg-[#E8823C] text-white text-sm
                         font-semibold rounded-xl transition-colors duration-200 whitespace-nowrap"
            >
              <MapPin size={13} />
              <span className="hidden min-[400px]:inline">Rastrear</span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-10 flex flex-wrap gap-2.5"
          >
            {[
              { Icon: Globe,  label: '+50 países destino',     blue: false },
              { Icon: Zap,    label: 'Todo Uruguay',           blue: false },
              { Icon: Shield, label: 'Casillero Internacional', blue: true  },
            ].map(({ Icon, label, blue }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[12px]"
                style={blue
                  ? { background: 'rgba(59,126,248,0.07)', border: '1px solid rgba(59,126,248,0.20)', color: '#6B90DC' }
                  : { background: 'var(--bd-1)',            border: '1px solid var(--bd-2)',            color: 'var(--fg-3)' }
                }
              >
                <Icon size={12} style={{ color: blue ? '#527ED8' : 'var(--fg-4)' }} />
                {label}
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] tracking-[0.22em] text-[var(--fg-5)] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-px h-8 bg-gradient-to-b from-slate-600/60 to-transparent"
        />
      </motion.div>
    </section>
  )
}

