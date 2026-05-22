import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../lib/useAuth";
import { db } from "../../lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { ChevronRight, ChevronLeft, Sparkles, Save, Loader2, MapPin, Clock, Image as ImageIcon, Palette, Gift, Music } from "lucide-react";

export default function Builder() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    type: "boda",
    subtitle: "",
    eventDate: "",
    eventTime: "18:00",
    venueName: "",
    venueUrl: "",
    template: "minimalista",
    coverUrl: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80",
    aiText: "",
    musicUrl: "",
    giftRegistryUrl: "",
    galleryUrls: ["", "", ""]
  });

  // Check if editing existing
  useEffect(() => {
    if (eventId && user) {
      setLoading(true);
      getDoc(doc(db, "events", eventId)).then((docSnap) => {
        if (docSnap.exists() && docSnap.data().ownerId === user.uid) {
          const data = docSnap.data();
          setFormData({
            title: data.title || "",
            type: data.type || "boda",
            subtitle: data.subtitle || "",
            eventDate: data.eventDate ? new Date(data.eventDate).toISOString().split('T')[0] : "",
            eventTime: data.eventTime || "18:00",
            venueName: data.venue?.name || "",
            venueUrl: data.venue?.url || "",
            template: data.theme?.template || "minimalista",
            coverUrl: data.theme?.coverUrl || "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80",
            aiText: data.sections?.vows || "",
            musicUrl: data.music?.url || "",
            giftRegistryUrl: data.giftRegistry?.[0]?.url || "",
            galleryUrls: data.gallery || ["", "", ""]
          });
        }
        setLoading(false);
      });
    }
  }, [eventId, user]);

  const handleGenerateText = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Genera una frase bonita y emotiva para un evento de tipo: ${formData.type}. Nombres/Título: ${formData.title}. Estilo: ${formData.template}.`,
          systemInstruction: "Eres un asistente especializado en eventos sociales mexicanos. Generas textos elegantes, emotivos y personalizados para invitaciones digitales. Siempre respondes en español mexicano, cálido y sin tecnicismos. Máximo 40 palabras."
        })
      });
      const data = await res.json();
      if (data.text) {
        setFormData({ ...formData, aiText: data.text });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (publish = false) => {
    if (!user) return;
    setSaving(true);
    try {
      const id = eventId || `evt_${Date.now()}`;
      await setDoc(doc(db, "events", id), {
        ownerId: user.uid,
        title: formData.title || "Mi Evento",
        type: formData.type,
        subtitle: formData.subtitle,
        eventDate: formData.eventDate ? new Date(formData.eventDate).getTime() : Date.now(),
        eventTime: formData.eventTime,
        venue: { name: formData.venueName, url: formData.venueUrl },
        theme: { template: formData.template, coverUrl: formData.coverUrl },
        music: { url: formData.musicUrl },
        giftRegistry: formData.giftRegistryUrl ? [{ store: "Mesa de Regalos", url: formData.giftRegistryUrl }] : [],
        gallery: formData.galleryUrls.filter(u => u !== ""),
        sections: { vows: formData.aiText },
        status: publish ? "active" : "draft",
        plan: "premium",
        createdAt: eventId ? undefined : serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });

      if (publish) navigate(`/e/${id}`);
      else navigate("/dashboard");
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#C9A96E]" /></div>;

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row">
      {/* Sidebar Wizard Steps */}
      <div className="w-full md:w-72 bg-white border-r border-gray-200 p-6 flex flex-col gap-6">
        <h2 className="text-xl font-serif font-bold text-[#1A1A2E]">Crear Invitación</h2>
        <div className="space-y-4 relative">
          {[
            { n: 1, text: "Detalles Principales" },
            { n: 2, text: "Fecha y Lugar" },
            { n: 3, text: "Diseño Visual" },
            { n: 4, text: "Funciones Especiales" },
            { n: 5, text: "Asistente IA" },
            { n: 6, text: "Publicar" }
          ].map((s) => (
            <div key={s.n} className={`flex items-center gap-3 ${step === s.n ? 'text-[#C9A96E]' : step > s.n ? 'text-gray-900' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step === s.n ? 'border-[#C9A96E] bg-yellow-50' : step > s.n ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300'}`}>
                {s.n}
              </div>
              <span className="font-medium">{s.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <div className="flex-1 p-6 md:p-12">
        <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-sm h-full flex flex-col overflow-hidden">
          
          <div className="flex-1 p-8 overflow-y-auto">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-3xl font-serif font-bold text-[#1A1A2E] mb-8">¿Qué estamos celebrando?</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Evento</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {['boda', 'xv', 'bautizo', 'cumpleanos', 'posada'].map(t => (
                        <button
                          key={t}
                          onClick={() => setFormData({...formData, type: t})}
                          className={`p-3 text-center rounded-xl border font-medium capitalize transition-all ${formData.type === t ? 'border-[#C9A96E] bg-yellow-50 text-[#C9A96E]' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Título principal (Ej. María & José)</label>
                    <input 
                      type="text"
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#C9A96E] focus:ring-[#C9A96E] p-3 border"
                      value={formData.title}
                      placeholder="Nombres de los festejados"
                      onChange={e => setFormData({...formData, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo o Frase de entrada</label>
                    <input 
                      type="text"
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#C9A96E] focus:ring-[#C9A96E] p-3 border"
                      value={formData.subtitle}
                      placeholder="Ej. Nos casamos"
                      onChange={e => setFormData({...formData, subtitle: e.target.value})}
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-3xl font-serif font-bold text-[#1A1A2E] mb-8">Cuándo y Dónde</h3>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <Clock className="w-5 h-5 text-[#C9A96E]" />
                      <h4 className="font-bold text-gray-900">Fecha y Hora</h4>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Día del Evento</label>
                      <input 
                        type="date"
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#C9A96E] focus:ring-[#C9A96E] p-3 border"
                        value={formData.eventDate}
                        onChange={e => setFormData({...formData, eventDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hora (Formato 24h)</label>
                      <input 
                        type="time"
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#C9A96E] focus:ring-[#C9A96E] p-3 border"
                        value={formData.eventTime}
                        onChange={e => setFormData({...formData, eventTime: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2 border-b pb-2">
                      <MapPin className="w-5 h-5 text-[#C9A96E]" />
                      <h4 className="font-bold text-gray-900">Ubicación</h4>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Salón o Lugar</label>
                      <input 
                        type="text"
                        placeholder="Ej. Hacienda de los Morales"
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#C9A96E] focus:ring-[#C9A96E] p-3 border"
                        value={formData.venueName}
                        onChange={e => setFormData({...formData, venueName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Link de Google Maps</label>
                      <input 
                        type="url"
                        placeholder="https://maps.google.com/..."
                        className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#C9A96E] focus:ring-[#C9A96E] p-3 border"
                        value={formData.venueUrl}
                        onChange={e => setFormData({...formData, venueUrl: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-3xl font-serif font-bold text-[#1A1A2E] mb-8">Diseño Visual</h3>
                
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Palette className="w-5 h-5 text-[#C9A96E]" />
                      <h4 className="font-bold text-gray-900">Plantilla</h4>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { id: 'minimalista', label: 'Minimalista', color: 'bg-white border-gray-200' },
                        { id: 'floral', label: 'Floral', color: 'bg-rose-50 border-rose-200' },
                        { id: 'elegante', label: 'Elegante Nocturno', color: 'bg-[#1A1A2E] border-gray-800 text-white' },
                        { id: 'moderno', label: 'Moderno Oro', color: 'bg-yellow-50 border-[#C9A96E]' }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setFormData({...formData, template: t.id})}
                          className={`h-24 rounded-xl border flex items-center justify-center font-medium transition-all ${t.color} ${formData.template === t.id ? 'ring-2 ring-offset-2 ring-[#C9A96E] shadow-md' : 'opacity-80 hover:opacity-100'}`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ImageIcon className="w-5 h-5 text-[#C9A96E]" />
                      <h4 className="font-bold text-gray-900">Foto de Portada</h4>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">Para este MVP, pega el link de una imagen en alta resolución.</p>
                    <input 
                      type="url"
                      placeholder="https://ejemplo.com/mifoto.jpg"
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#C9A96E] focus:ring-[#C9A96E] p-3 border mb-4"
                      value={formData.coverUrl}
                      onChange={e => setFormData({...formData, coverUrl: e.target.value})}
                    />
                    {formData.coverUrl && (
                      <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative">
                        <img src={formData.coverUrl} alt="Cover Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-3xl font-serif font-bold text-[#1A1A2E] mb-8">Funciones Especiales</h3>
                
                <div className="space-y-6">
                  <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl">
                    <h4 className="font-bold text-gray-900 mb-2">Mesa de Regalos</h4>
                    <p className="text-sm text-gray-500 mb-4">Añade el link a tu mesa de regalos de Liverpool, Amazon, Palacio, etc.</p>
                    <input 
                      type="url"
                      placeholder="https://micuenta.amazon.com/..."
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#C9A96E] focus:ring-[#C9A96E] p-3 border"
                      value={formData.giftRegistryUrl}
                      onChange={e => setFormData({...formData, giftRegistryUrl: e.target.value})}
                    />
                  </div>

                  <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl">
                    <h4 className="font-bold text-gray-900 mb-2">Música de Fondo</h4>
                    <p className="text-sm text-gray-500 mb-4">Pega la URL de un audio MP3 directo para que suene de fondo.</p>
                    <input 
                      type="url"
                      placeholder="https://ejemplo.com/cancion.mp3"
                      className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#C9A96E] focus:ring-[#C9A96E] p-3 border"
                      value={formData.musicUrl}
                      onChange={e => setFormData({...formData, musicUrl: e.target.value})}
                    />
                  </div>

                  <div className="bg-gray-50 border border-gray-200 p-6 rounded-2xl">
                    <h4 className="font-bold text-gray-900 mb-2">Galería de Fotos (Opcional)</h4>
                    <p className="text-sm text-gray-500 mb-4">Añade hasta 3 links de imágenes para mostrar en tu invitación.</p>
                    <div className="space-y-3">
                      {[0, 1, 2].map(index => (
                        <input 
                          key={index}
                          type="url"
                          placeholder="https://ejemplo.com/foto.jpg"
                          className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#C9A96E] focus:ring-[#C9A96E] p-3 border"
                          value={formData.galleryUrls[index]}
                          onChange={e => {
                            const newUrls = [...formData.galleryUrls];
                            newUrls[index] = e.target.value;
                            setFormData({...formData, galleryUrls: newUrls});
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <h3 className="text-3xl font-serif font-bold text-[#1A1A2E] mb-2 flex items-center gap-3">
                   Asistente IA <Sparkles className="w-6 h-6 text-[#C9A96E]" />
                </h3>
                <p className="text-gray-500 mb-8 text-lg">Permite que Celebrae redacte una frase única y emotiva para tu evento.</p>
                
                <div className="bg-[#1A1A2E] rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
                  <div className="relative z-10">
                    <button 
                      onClick={handleGenerateText}
                      disabled={generating}
                      className="bg-[#C9A96E] hover:bg-[#b0935d] text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 w-full md:w-auto transition-colors disabled:opacity-75"
                    >
                      {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" /> }
                      {generating ? "Generando magia..." : "Generar Frase Emotiva"}
                    </button>
                    
                    <div className="mt-8">
                      <label className="block text-sm font-medium text-gray-300 mb-2">Mensaje / Frase en la invitación</label>
                      <textarea 
                        rows={5}
                        className="w-full bg-white/5 border border-white/10 rounded-xl shadow-sm focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E] p-4 text-white placeholder-gray-500 text-lg font-serif"
                        placeholder="Escribe algo emotivo o deja que la Inteligencia Artificial lo redacte..."
                        value={formData.aiText}
                        onChange={e => setFormData({...formData, aiText: e.target.value})}
                      />
                    </div>
                  </div>
                  {/* Decorative background blur */}
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#C9A96E] rounded-full mix-blend-screen filter blur-[80px] opacity-20 animate-pulse pointer-events-none" />
                </div>
              </div>
            )}

            {step === 6 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-4xl font-serif font-bold text-[#1A1A2E] text-center mb-2">¡Todo Listo!</h3>
                <p className="text-gray-500 text-center max-w-sm mb-8">
                  Tu invitación ha sido configurada. Revisa los detalles una vez más o publícala para empezar a compartir tu QR.
                </p>
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 w-full max-w-md text-center">
                  <h4 className="text-2xl font-serif font-bold text-[#C9A96E]">{formData.title}</h4>
                  <p className="text-gray-600 font-medium mb-4 capitalize">{formData.type}</p>
                  <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4"/> {formData.eventDate}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {formData.venueName}</span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Navigation Bottom Bar */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
            <button
               onClick={() => setStep(Math.max(1, step - 1))}
               disabled={step === 1 || saving}
               className="px-4 py-2 text-gray-500 font-medium hover:text-gray-900 disabled:opacity-0 flex items-center gap-2 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Atrás
            </button>
            <div className="flex items-center gap-3">
              {step < 6 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  className="px-8 py-3 bg-[#1A1A2E] hover:bg-gray-800 text-white rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm"
                >
                  Siguiente <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleSave(false)}
                    disabled={saving}
                    className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-white rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    Guardar Borrador
                  </button>
                  <button
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="px-8 py-3 bg-[#C9A96E] hover:bg-[#b0935d] text-white rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 shadow-md"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Publicar Evento
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

