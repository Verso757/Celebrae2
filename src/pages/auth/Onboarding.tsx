import { useState } from "react";
import { useAuth } from "../../lib/useAuth";
import { db } from "../../lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Navigate, useNavigate } from "react-router-dom";
import { HeartHandshake, Briefcase, ChevronRight, Loader2, Check } from "lucide-react";
import { motion } from "motion/react";

export default function Onboarding() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"client" | "planner" | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) return <Navigate to="/login" />;
  if (profile) return <Navigate to="/dashboard" />;

  const handleComplete = async () => {
    if (!role || !plan) return;
    setLoading(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || "Usuario",
        role: role,
        plan: plan,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      // In a real app we'd trigger Stripe checkout here for paid plans
      // For MVP, we grant access directly and the onSnapshot in useAuth will push us to /dashboard
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        
        {/* Progress */}
        <div className="mb-12 flex items-center justify-center gap-4">
           <div className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-[#C9A96E]' : 'bg-gray-300'}`} />
           <div className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-[#C9A96E]' : 'bg-gray-300'}`} />
        </div>

        {step === 1 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 text-center"
          >
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1A1A2E] mb-4">¿Cómo usarás Celebrae?</h1>
            <p className="text-gray-500 mb-10 max-w-lg mx-auto">Selecciona si estás organizando tu propio evento o si eres profesional de la industria planner.</p>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Cliente */}
              <button 
                onClick={() => setRole("client")}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${role === 'client' ? 'border-[#C9A96E] bg-yellow-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${role === 'client' ? 'bg-[#C9A96E] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Para mi evento</h3>
                <p className="text-gray-500 text-sm">Quiero crear la invitación para mi boda, XV años, cumpleaños o evento personal.</p>
              </button>

              {/* Planner */}
              <button 
                onClick={() => setRole("planner")}
                className={`p-6 rounded-2xl border-2 text-left transition-all ${role === 'planner' ? 'border-[#1A1A2E] bg-gray-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${role === 'planner' ? 'bg-[#1A1A2E] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Soy Wedding Planner</h3>
                <p className="text-gray-500 text-sm">Organizo eventos profesionalmente y quiero un dashboard para gestionar múltiples clientes.</p>
              </button>
            </div>

            <div className="mt-10 flex justify-center">
              <button 
                onClick={() => setStep(2)}
                disabled={!role}
                className="bg-[#1A1A2E] hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente paso <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && role === 'client' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1A1A2E] mb-4">Elige tu Invitación</h1>
              <p className="text-gray-500">Paga una sola vez por evento. Sin suscripciones.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { id: 'b2c_basic', name: 'Básica', price: '$299', desc: 'Ideal para eventos pequeños', features: ['Hasta 100 invitados', 'RSVP básico', 'Diseño estándar', 'Soporte vía email'] },
                { id: 'b2c_premium', name: 'Premium', price: '$599', desc: 'La más popular para bodas', features: ['Hasta 300 invitados', 'Asistente IA (Textos)', 'Mesa de regalos', 'Música de fondo', 'Check-in con QR'], highlight: true },
                { id: 'b2c_elite', name: 'Elite', price: '$999', desc: 'La experiencia completa', features: ['Invitados ilimitados', 'Chatbot Gemini', 'Galería de fotos extendida', 'Animaciones exclusivas', 'Soporte prioritario 24/7'] }
              ].map(p => (
                <div key={p.id} className={`bg-white rounded-3xl p-8 border-2 flex flex-col ${plan === p.id ? (p.highlight ? 'border-[#C9A96E] shadow-xl relative' : 'border-[#1A1A2E] shadow-lg') : 'border-gray-200'}`}>
                  {p.highlight && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#C9A96E] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">Más Popular</div>}
                  <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                  <div className="my-4">
                    <span className="text-4xl font-serif font-bold">{p.price}</span>
                    <span className="text-gray-500 text-sm ml-1">MXN / evento</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">{p.desc}</p>
                  
                  <ul className="space-y-3 mb-8 flex-1">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-[#C9A96E] shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => setPlan(p.id)}
                    className={`w-full py-3 rounded-xl font-medium transition-colors ${plan === p.id ? 'bg-[#1A1A2E] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                  >
                    Seleccionar
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-10 flex justify-center">
              <button 
                onClick={handleComplete}
                disabled={!plan || loading}
                className="bg-[#C9A96E] hover:bg-[#b0935d] text-white px-8 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 w-full md:w-auto min-w-[200px]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Proceder al Checkout (Demo)"}
              </button>
            </div>
          </motion.div>
        )}

        {step === 2 && role === 'planner' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="text-center mb-10">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#1A1A2E] mb-4">Planes para Profesionales</h1>
              <p className="text-gray-500">Suscripción mensual para gestionar todas tus bodas y eventos desde un solo lugar.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { id: 'planner_starter', name: 'Starter', price: '$799', desc: 'Para planners independientes', features: ['Hasta 5 eventos activos', 'Panel B2B', 'Estadísticas básicas'] },
                { id: 'planner_pro', name: 'Pro', price: '$1,499', desc: 'Crece tu negocio', features: ['Hasta 20 eventos activos', 'Automatización WhatsApp', 'Marca blanca básica', 'Dashboard avanzado'], highlight: true },
                { id: 'planner_elite', name: 'Enterprise', price: '$2,999', desc: 'Agencias y gran volumen', features: ['Eventos ilimitados', 'Marca blanca completa', 'URL personalizada', 'API de integración'] }
              ].map(p => (
                <div key={p.id} className={`bg-white rounded-3xl p-8 border-2 flex flex-col ${plan === p.id ? (p.highlight ? 'border-[#1A1A2E] shadow-xl relative' : 'border-gray-500 shadow-lg') : 'border-gray-200'}`}>
                  {p.highlight && <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#1A1A2E] text-white px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full">Recomendado</div>}
                  <h3 className="text-xl font-bold text-gray-900">{p.name}</h3>
                  <div className="my-4">
                    <span className="text-4xl font-serif font-bold">{p.price}</span>
                    <span className="text-gray-500 text-sm ml-1">/ mes</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">{p.desc}</p>
                  
                  <ul className="space-y-3 mb-8 flex-1">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="w-4 h-4 text-gray-900 shrink-0 mt-0.5" /> {f}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => setPlan(p.id)}
                    className={`w-full py-3 rounded-xl font-medium transition-colors ${plan === p.id ? 'bg-[#1A1A2E] text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
                  >
                    Seleccionar
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-10 flex justify-center flex-col items-center gap-4">
              <button 
                onClick={handleComplete}
                disabled={!plan || loading}
                className="bg-[#1A1A2E] hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all disabled:opacity-50 w-full md:w-auto min-w-[200px]"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Iniciar Suscripción (Demo)"}
              </button>
              <button 
                onClick={() => setStep(1)}
                className="text-gray-500 hover:text-gray-900 text-sm font-medium"
              >
                Volver
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}
