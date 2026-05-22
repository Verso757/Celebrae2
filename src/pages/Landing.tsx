import { Link } from "react-router-dom";
import { Sparkles, QrCode, Palette, ChevronRight, Check } from "lucide-react";
import { motion } from "motion/react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans text-[#1A1A2E]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#C9A96E] rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-serif font-bold text-xl tracking-tight">Celebrae</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-[#1A1A2E] hidden md:block transition-colors">
              Iniciar Sesión
            </Link>
            <Link to="/login" className="bg-[#1A1A2E] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
              Crear Invitación
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="text-[#C9A96E] font-bold tracking-[0.2em] text-xs md:text-sm uppercase mb-6 block">
              La nueva era de los eventos sociales
            </span>
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-[#1A1A2E] mb-8 leading-tight">
              Invitaciones digitales que <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A96E] to-yellow-600">
                cuentan tu historia.
              </span>
            </h1>
            <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
              Crea experiencias únicas con Inteligencia Artificial. Gestiona RSVPs, mesas de regalos, música y controla el acceso a tu evento con códigos QR.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login" className="w-full sm:w-auto bg-[#C9A96E] hover:bg-[#b0935d] text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                Comenzar Gratis <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-serif font-bold text-[#1A1A2E] mb-4">Todo lo que necesitas en un solo lugar</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">Diseñadas para deslumbrar, construidas para facilitar tu vida y la de tus invitados.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                icon: <Sparkles className="w-6 h-6 text-[#C9A96E]" />, 
                title: "Asistente de IA", 
                desc: "No pierdas tiempo pensando qué escribir. Nuestra Inteligencia Artificial redactará mensajes emotivos y únicos para tus invitados en segundos." 
              },
              { 
                icon: <QrCode className="w-6 h-6 text-[#1A1A2E]" />, 
                title: "Check-in Seguro (QR)", 
                desc: "Olvídate de las listas impresas. Cada invitado recibe un código QR individual. Escanéalos en la puerta principal desde cualquier celular." 
              },
              { 
                icon: <Palette className="w-6 h-6 text-[#C9A96E]" />, 
                title: "Diseños Premium", 
                desc: "Plantillas elegantes, modernas y adaptables a bodas, XV años, bautizos o eventos corporativos con un solo clic." 
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#FAFAFA] p-8 rounded-3xl border border-gray-100 hover:border-[#C9A96E]/30 transition-colors"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience Section */}
      <section className="py-24 px-6 bg-[#1A1A2E] text-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6">Para Parejas y <br/><span className="text-[#C9A96E]">Planners Profesionales</span></h2>
            <p className="text-gray-400 mb-8 max-w-lg leading-relaxed">
              Celebrae está diseñado tanto para quienes organizan su propia boda u evento, como para agencias de Wedding Planning que requieren gestionar decenas de eventos simultáneos con marca blanca.
            </p>
            <ul className="space-y-4">
              {['Panel B2B para Planners', 'Analíticas en tiempo real', 'Exportación de listas (Excel)', 'Galerías y Enlaces múltiples'].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#C9A96E]/20 flex items-center justify-center text-[#C9A96E]">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#C9A96E]/20 to-transparent rounded-3xl transform rotate-3" />
            <img 
              src="https://images.unsplash.com/photo-1542314831-c6a4d142cbcc?auto=format&fit=crop&q=80" 
              alt="Planner" 
              className="rounded-3xl relative z-10 shadow-2xl object-cover aspect-[4/3] border border-white/10"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 text-center">
        <h2 className="text-4xl md:text-6xl font-serif font-bold text-[#1A1A2E] mb-8 max-w-3xl mx-auto">¿Listo para hacer una invitación inolvidable?</h2>
        <Link to="/login" className="inline-flex bg-[#1A1A2E] hover:bg-gray-800 text-white px-10 py-5 rounded-2xl font-bold flex-col sm:flex-row items-center justify-center gap-3 transition-all shadow-xl hover:-translate-y-1 hover:shadow-2xl text-lg">
          Crear mi primer evento
        </Link>
      </section>
      
      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 bg-[#C9A96E] rounded-md flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="font-serif font-bold text-[#1A1A2E]">Celebrae</span>
        </div>
        <p>© 2026 Celebrae. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
