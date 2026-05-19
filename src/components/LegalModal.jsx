import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShieldCheck, FileText, Package, Briefcase, Ban } from 'lucide-react'

const CONTENT = {
  courier: {
    icon:  Package,
    label: 'Requisitos Courier',
    title: 'Políticas de envío paquetería',
    sections: [
      {
        heading: 'Atención al cliente',
        body: 'Los envíos se atienden por orden de llegada en los horarios correspondientes. No es necesario agendarse previamente. Lunes a viernes de 9:00 a 18:00 hs, sábados de 9:00 a 13:00 hs.',
      },
      {
        heading: 'Documentación requerida',
        body: 'Para realizar envíos es obligatorio presentar Cédula de Identidad o Pasaporte vigente. Se requieren los datos completos del beneficiario: número de identidad, nombre completo, 1 o 2 teléfonos de contacto y dirección exacta. Es posible enviar a diferentes personas dentro de un mismo domicilio.',
      },
      {
        heading: 'Declaración de productos',
        body: 'Cada cliente debe entregar por escrito una declaración de los productos a enviar, especificando cantidad y descripción de los mismos (Declaración Jurada). El formulario está disponible para descargar en nuestro sitio web.',
      },
      {
        heading: 'Medios de pago',
        body: 'Los pagos se realizan en efectivo en dólares americanos o pesos uruguayos según la tasa de cambio vigente en el día. Si se utiliza POS se aplican cargos adicionales: crédito 14.75%, débito 6.35%. Se recomienda el pago en efectivo. No se admiten tarjetas bancarias ni dinero en el interior de los envíos.',
      },
      {
        heading: 'Tiempos de entrega',
        body: 'Cada lunes se despacha ante la Aduana de Uruguay las encomiendas recibidas la semana anterior. Entre martes y jueves sale el vuelo con escala en Panamá (PTY). El transbordo en Panamá puede tener una demora de 4 a 7 días. Una vez en destino, la entrega al beneficiario por la entidad de logística local puede tomar hasta 30 días desde la recepción por la aduana destino.',
      },
      {
        heading: 'Cobertura del servicio',
        body: 'Nuestro servicio, responsabilidad y garantía se aplican mientras su encomienda esté en posesión de Pack Express Uruguay S.A.S y la Compañía Panameña de Aviación (Copa Courier). Los documentos no pueden mezclarse con paquetería, ya que tienen una clasificación postal diferente.',
      },
    ],
  },
  equipaje: {
    icon:  Briefcase,
    label: 'Equipaje No Acompañado',
    title: 'Tarifas y condiciones',
    sections: [
      {
        heading: 'Tarifa base',
        body: '$350 USD hasta 40 kg de peso total. El peso final corresponde al mayor entre el peso real según balanza y el peso volumétrico (Alto × Ancho × Largo ÷ 5000).',
      },
      {
        heading: 'Exceso de peso',
        body: '$9 USD por cada kilogramo adicional sobre los 40 kg iniciales.',
      },
      {
        heading: 'Despacho aduanero',
        body: '$100 USD por despacho aduanero en Uruguay. Este monto es fijo e independiente del peso total del envío.',
      },
      {
        heading: 'Valor máximo declarado',
        body: 'El valor máximo de mercadería declarado es de $1.000 USD por envío. El cliente no paga impuestos arancelarios en el país de destino — la aduana los cobra al beneficiario según el peso y tipo de mercadería.',
      },
      {
        heading: 'Condiciones del equipaje',
        body: 'Los equipos tecnológicos y eléctricos (celulares, tablets, laptops, Play Station, etc.) deben estar en sus cajas de origen. No pueden estar adulterados ni mezclarse con misceláneas. El valor del seguro se establece en función del peso.',
      },
    ],
  },
  prohibidos: {
    icon:  Ban,
    label: 'Artículos Prohibidos',
    title: 'Objetos restringidos para envíos',
    sections: [
      {
        heading: 'Materiales peligrosos e inflamables',
        items: [
          'Productos explosivos, gases comprimidos, y líquidos o sólidos inflamables: baterías de litio, bengalas, fuegos artificiales, municiones, gasolina, pintura, diluyente, encendedores a gas, perfumes, sprays, extintores, aerosoles y productos de limpieza.',
          'Armas, artefactos y toda sustancia corrosiva, magnética (imanes), radiactiva, explosiva, inflamable, tóxica, venenosa, comburente, oxidante o infecciosa, independientemente de su estado (inerte o activa).',
          'Agentes biológicos o cualquier muestra que los contenga, en cualquier formato o presentación.',
        ],
      },
      {
        heading: 'Valores, animales y productos regulados',
        items: [
          'Dinero en efectivo, monedas, tarjetas bancarias, joyas y antigüedades de cualquier valor.',
          'Materiales relacionados con loterías, rifas o cualquier otra modalidad de juego de suerte y azar.',
          'Animales vivos o pieles de animales, en cualquier condición.',
          'Medicamentos y productos farmacéuticos que no cuenten con comprobante de compra válido.',
        ],
      },
      {
        heading: 'Contenido prohibido por normativa',
        items: [
          'Objetos cuya cubierta o faja exterior contenga inscripciones, imágenes o representaciones de carácter indecente, lujurioso, amenazador, difamante o injurioso.',
          'Libros, publicaciones o propaganda de cualquier índole que infrinja leyes o disposiciones de autoridades competentes, o que contenga material sexual, discriminatorio, que atente contra la seguridad colectiva, el bienestar general, la moralidad pública o el orden público.',
          'Todo objeto, producto o sustancia cuya importación, exportación o libre circulación se encuentre prohibida por la legislación uruguaya vigente o por los tratados internacionales aplicables.',
        ],
      },
    ],
  },
  privacidad: {
    icon:  ShieldCheck,
    label: 'Política de Privacidad',
    title: 'Protección de datos y privacidad',
    sections: [
      {
        heading: 'Aviso de Privacidad',
        body: 'Pack Express Uruguay S.A.S se compromete con la protección de los datos personales en todas las transacciones comerciales realizadas con los visitantes del sitio web. La información recopilada es tratada con estricta confidencialidad y únicamente con los fines para los que fue proporcionada.',
      },
      {
        heading: 'Datos que recopilamos',
        body: 'Podemos recopilar nombre, dirección de correo electrónico, número de teléfono, dirección postal y cualquier otra información que usted nos proporcione voluntariamente al completar formularios de contacto, solicitar cotizaciones o realizar envíos. No vendemos ni cedemos sus datos personales a terceros sin su consentimiento expreso.',
      },
      {
        heading: 'Uso de la información',
        body: 'La información recopilada se utiliza exclusivamente para gestionar sus envíos, responder consultas, mejorar nuestros servicios y, con su autorización, enviarle comunicaciones relevantes sobre nuestros servicios. Nos reservamos el derecho de utilizar la información de forma agregada y anónima para fines estadísticos internos.',
      },
      {
        heading: 'Comentarios y sugerencias',
        body: 'Agradecemos sus comentarios y sugerencias; sin embargo, no nos es posible responder a todos los comentarios de forma individual. Al enviar información, usted acepta que la empresa puede utilizar dicha información libremente, sin obligación de confidencialidad, compensación ni restricción de uso.',
      },
      {
        heading: 'Seguridad',
        body: 'Implementamos medidas de seguridad técnicas y organizativas razonables para proteger su información personal contra acceso no autorizado, pérdida o divulgación. Sin embargo, ninguna transmisión por Internet o sistema de almacenamiento electrónico es completamente seguro.',
      },
      {
        heading: 'Aviso de uso fraudulento de marca',
        body: 'Pack Express Uruguay S.A.S advierte sobre posibles estafas que utilizan fraudulentamente nuestro nombre o imagen de marca. Aclaramos que únicamente cobramos pagos oficiales por servicios de envío debidamente contratados. No solicitamos pagos anticipados por productos, ni realizamos cobros a través de canales no oficiales. La empresa no se responsabiliza por pérdidas económicas derivadas de transacciones fraudulentas realizadas en nombre de Pack Express por personas o entidades no autorizadas.',
      },
    ],
  },
  terminos: {
    icon:  FileText,
    label: 'Términos y Condiciones',
    title: 'Condiciones de uso del servicio',
    sections: [
      {
        heading: 'Aviso Legal',
        body: 'El presente sitio web es operado por Pack Express Uruguay S.A.S, con domicilio en Calle Carlos Quijano N° 1258 esquina Soriano, Centro, Montevideo, Uruguay. RUT: 218883410015. Gerente responsable: Lic. Yusniel Rojas Castro.',
      },
      {
        heading: 'Aceptación de los términos',
        body: 'Al acceder y utilizar este sitio web, usted acepta quedar vinculado por estos Términos y Condiciones, todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de las leyes locales aplicables. Si no está de acuerdo con alguno de estos términos, tiene prohibido utilizar o acceder a este sitio.',
      },
      {
        heading: 'Derechos de autor y uso permitido',
        body: 'Pack Express Uruguay S.A.S conserva todos los derechos de publicación sobre los contenidos de este sitio web. Se permite la reproducción del material únicamente con fines informativos y sin fines de lucro. Los materiales no pueden ser modificados ni utilizados con fines comerciales sin autorización expresa y por escrito de la empresa.',
      },
      {
        heading: 'Marcas registradas',
        body: 'Queda estrictamente prohibida la copia, reproducción o uso no autorizado de las marcas registradas, logotipos e identidad visual de Pack Express Uruguay S.A.S. Cualquier uso no autorizado constituye una violación de los derechos de propiedad intelectual y será perseguido conforme a la legislación uruguaya vigente.',
      },
      {
        heading: 'Limitación de responsabilidad',
        body: 'Pack Express Uruguay S.A.S no será responsable por daños derivados del uso o imposibilidad de uso de este sitio web, ni por interrupciones del servicio. La información contenida en este sitio puede ser modificada sin previo aviso. Los servicios de envío están sujetos a disponibilidad y a las condiciones específicas pactadas en cada contrato de servicio.',
      },
      {
        heading: 'Legislación aplicable',
        body: 'Estos términos se rigen por las leyes de la República Oriental del Uruguay. Cualquier disputa será sometida a la jurisdicción exclusiva de los tribunales competentes de Montevideo, Uruguay. La empresa opera bajo la regulación de URSEC conforme a la Resolución N° 148/2023.',
      },
    ],
  },
}

export default function LegalModal({ type, onClose }) {
  const isOpen = Boolean(type)
  const doc    = CONTENT[type] ?? null

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && doc && (() => {
        const Icon = doc.icon
        return (
          <motion.div
            key="legal-root"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[90]"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-[var(--bg-base)]/55 backdrop-blur-2xl"
              onClick={onClose}
            />

            {/* Centering container */}
            <div className="relative h-full flex items-center justify-center p-4 sm:p-6 lg:p-10 z-10">
              <motion.div
                key="legal-modal"
                initial={{ opacity: 0, y: 40, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-2xl flex flex-col"
                style={{ maxHeight: 'calc(100vh - 4rem)' }}
                onClick={e => e.stopPropagation()}
              >
                <div role="dialog" aria-modal="true" aria-label={doc.title} className="bg-[var(--bg-alt)] border border-[var(--bd-1)] rounded-2xl overflow-hidden
                                shadow-[var(--shadow-modal)] flex flex-col min-h-0">

                  {/* Header */}
                  <div className="relative flex items-start justify-between px-8 py-6
                                  border-b border-[var(--bd-1)] overflow-hidden shrink-0">
                    <div className="absolute inset-0 pointer-events-none"
                         style={{ background: 'radial-gradient(ellipse 60% 100% at 0% 50%, rgba(255,107,0,0.05) 0%, transparent 70%)' }} />
                    <div className="relative flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl border border-[#FF6B00]/50
                                      flex items-center justify-center shrink-0">
                        <Icon size={16} className="text-[#FF6B00]" />
                      </div>
                      <div>
                        <p className="text-[#FF6B00] text-[10px] font-semibold tracking-[0.22em] uppercase mb-1">
                          {doc.label}
                        </p>
                        <h2 className="font-display font-bold text-[var(--fg-1)] text-lg leading-tight">
                          {doc.title}
                        </h2>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="relative w-9 h-9 rounded-xl border border-[var(--bd-2)]
                                 flex items-center justify-center shrink-0 ml-4
                                 text-[var(--fg-4)] hover:text-[var(--fg-1)] hover:border-[var(--bd-3)]
                                 transition-all duration-200"
                      aria-label="Cerrar"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  {/* Content — scrolls internally */}
                  <div
                    className="px-8 py-7 space-y-6 overflow-y-auto
                                [scrollbar-width:thin] [scrollbar-color:var(--bd-3)_transparent]"
                    data-lenis-prevent
                  >
                    {doc.sections.map((s, i) => (
                      <div key={i}>
                        <h3 className="font-display font-semibold text-[var(--fg-1)] text-[14px] mb-2 flex items-center gap-2">
                          <span className="text-[#FF6B00]/50 font-black text-[10px] tracking-[0.15em]">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          {s.heading}
                        </h3>
                        {s.body && (
                          <p className="text-[13px] text-[var(--fg-3)] leading-relaxed">
                            {s.body}
                          </p>
                        )}
                        {s.items && (
                          <ul className="space-y-2">
                            {s.items.map((item, j) => (
                              <li key={j} className="flex items-start gap-2.5 text-[13px] text-[var(--fg-3)] leading-relaxed">
                                <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-[#FF6B00]/40 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                        {i < doc.sections.length - 1 && (
                          <div className="mt-6 h-px bg-[var(--bd-1)]" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Footer */}
                  <div className="px-8 py-4 border-t border-[var(--bd-1)] shrink-0
                                  flex items-center justify-between">
                    <p className="text-[11px] text-[var(--fg-5)]">
                      Pack Express Uruguay S.A.S · RUT 218883410015
                    </p>
                    <button
                      onClick={onClose}
                      className="text-[12px] font-semibold text-[#FF6B00] hover:text-[#FF8C3A]
                                 transition-colors duration-200"
                    >
                      Cerrar
                    </button>
                  </div>

                </div>
              </motion.div>
            </div>
          </motion.div>
        )
      })()}
    </AnimatePresence>
  )
}
