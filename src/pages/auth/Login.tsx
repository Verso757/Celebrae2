import { Navigate } from "react-router-dom";
import { useAuth } from "../../lib/useAuth";
import { loginWithGoogle, auth } from "../../lib/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { Sparkles, CalendarHeart, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

export default function Login() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  if (user) {
    if (profile) return <Navigate to="/dashboard" />;
    return <Navigate to="/onboarding" />;
  }

  const handleGoogle = async () => {
    try {
      setLoading(true);
      setError("");
      await loginWithGoogle();
    } catch (e: any) {
      console.error(e);
      setError(`Error: ${e.message}`);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Llena todos los campos.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (e: any) {
      console.error(e);
      if (e.code === 'auth/email-already-in-use') setError("El correo ya está registrado.");
      else if (e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found' || e.code === 'auth/invalid-credential') setError("Credenciales inválidas.");
      else setError("Hubo un error en la autenticación.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex text-[#1A1A2E] bg-[#FAFAFA]">
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 w-full">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-[#C9A96E] rounded-xl flex items-center justify-center">
              <CalendarHeart className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold font-serif">Celebrae</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 mb-2">
              Tu evento, en el bolsillo de todos.
            </h2>
            <p className="text-gray-500 mb-8">
              {isRegister 
                ? "Crea tu cuenta y empieza a diseñar invitaciones inteligentes."
                : "Inicia sesión para gestionar tus invitaciones y asistentes."}
            </p>

            {error && (
              <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input 
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#C9A96E] focus:ring-[#C9A96E] p-2.5 border"
                  placeholder="ejemplo@correo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input 
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#C9A96E] focus:ring-[#C9A96E] p-2.5 border"
                  placeholder="••••••••"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#1A1A2E] hover:bg-[#2a2a4a] text-white rounded-xl px-4 py-3 text-sm font-medium transition-all disabled:opacity-50"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isRegister ? "Registrarme" : "Iniciar Sesión"}
              </button>
            </form>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[#FAFAFA] text-gray-500">O continuar con</span>
              </div>
            </div>

            <button
              onClick={handleGoogle}
              disabled={loading}
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#C9A96E] transition-all disabled:opacity-50"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
              Google
            </button>
            
            <div className="mt-8 text-center text-sm text-gray-600">
              {isRegister ? "¿Ya tienes una cuenta?" : "¿No tienes una cuenta?"}{" "}
              <button 
                type="button" 
                onClick={() => { setIsRegister(!isRegister); setError(""); }}
                className="text-[#C9A96E] font-medium hover:underline focus:outline-none"
              >
                {isRegister ? "Inicia Sesión" : "Regístrate"}
              </button>
            </div>
            
            <div className="mt-8">
              <div className="mt-6 flex justify-center text-gray-400">
                <Sparkles className="w-5 h-5 text-[#C9A96E]" />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="hidden lg:block relative w-0 flex-1">
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80"
          alt="Boda elegante en jardín"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <blockquote className="text-2xl font-serif mb-4">
            "Celebrae cambió por completo cómo organizo las bodas. Mis clientes aman el dashboard y yo amo la tranquilidad."
          </blockquote>
          <p className="font-medium">— Mariana P., Wedding Planner</p>
        </div>
      </div>
    </div>
  );
}
