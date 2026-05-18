import { useLenis } from './hooks/useLenis'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Metrics from './components/Metrics'
import Services from './components/Services'
import Process from './components/Process'
import Tracking from './components/Tracking'
import Cotizacion from './components/Cotizacion'
import Coverage from './components/Coverage'
import Docs from './components/Docs'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'

export default function App() {
  useLenis()

  return (
    <div className="min-h-screen bg-[#060810]">
      <Navbar />
      <Hero />
      <Metrics />
      <Services />
      <Process />
      <Tracking />
      <Cotizacion />
      <Coverage />
      <Docs />
      <Testimonials />
      <Footer />
    </div>
  )
}
