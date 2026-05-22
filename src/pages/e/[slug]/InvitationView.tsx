import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../../lib/firebase";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { MapPin, Calendar, Check, Loader2, PartyPopper, Gift, Music, Play, Pause } from "lucide-react";
import { MillisToDate } from "../../../lib/dateUtils";
import { QRCodeSVG } from "qrcode.react";

function Countdown({ targetDate }: { targetDate: number }) {
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex gap-3 md:gap-6 justify-center items-center py-12 relative z-20 -mt-32">
      {[
        { label: 'DÍAS', value: timeLeft.d },
        { label: 'HRS', value: timeLeft.h },
        { label: 'MIN', value: timeLeft.m },
        { label: 'SEG', value: timeLeft.s }
      ].map((item, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="text-2xl md:text-5xl font-serif font-bold text-[#1A1A2E] bg-white w-16 h-16 md:w-24 md:h-24 flex items-center justify-center rounded-2xl shadow-lg border border-[#C9A96E]/20">
            {String(item.value).padStart(2, '0')}
          </div>
          <span className="text-[10px] md:text-sm tracking-[0.2em] font-medium text-gray-800 mt-4 bg-white/50 px-2 py-1 rounded backdrop-blur-sm">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

interface EventData {
  title: string;
  subtitle: string;
  eventDate: number;
  eventTime: string;
  venue: { name: string; url?: string };
  theme?: { template: string; coverUrl?: string };
  sections: { vows: string };
  music?: { url: string };
  giftRegistry?: { store: string; url: string }[];
  gallery?: string[];
}

export default function InvitationView() {
  const { slug } = useParams();
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [guestName, setGuestName] = useState("");
  const [ticketCount, setTicketCount] = useState(1);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [rsvpQrCode, setRsvpQrCode] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (slug) {
      getDoc(doc(db, "events", slug)).then((docSnap) => {
        if (docSnap.exists()) {
          setEventData(docSnap.data() as EventData);
        }
        setLoading(false);
      });
    }
  }, [slug]);

  const handleRSVP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !guestName) return;
    setRsvpLoading(true);
    
    try {
      const qrHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      await addDoc(collection(db, "invitations"), {
        eventId: slug,
        guestName,
        guestLastName: "", // simplified for MVP
        ticketCount: Number(ticketCount),
        qrCode: qrHash,
        rsvpStatus: "confirmed",
        rsvpAt: serverTimestamp()
      });
      
      setRsvpQrCode(qrHash);
      setRsvpSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Hubo un error al confirmar. Por favor intenta de nuevo.");
    } finally {
      setRsvpLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#C9A96E] animate-spin" /></div>;
  if (!eventData) return <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center text-gray-500 font-medium">Evento no encontrado.</div>;

  // Determine dynamic styling based on template
  const isDark = eventData.theme?.template === 'elegante';
  const bgColor = eventData.theme?.template === 'floral' ? 'bg-rose-50' : isDark ? 'bg-[#1A1A2E]' : 'bg-[#FAFAFA]';
  const textColor = isDark ? 'text-white' : 'text-[#1A1A2E]';
  const coverUrl = eventData.theme?.coverUrl || "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80";

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} flex flex-col font-sans transition-colors duration-500`}>
      
      {/* Hero Section */}
      <div className="relative h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={coverUrl} alt="Background" className={`w-full h-full object-cover opacity-40 mix-blend-multiply ${isDark ? 'brightness-50' : ''}`} />
          <div className={`absolute inset-0 bg-gradient-to-b ${isDark ? 'from-[#1A1A2E]/40 to-[#1A1A2E]' : 'from-[#FAFAFA]/40 to-[#FAFAFA]'} z-10`} />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative z-20 text-center max-w-2xl mx-auto"
        >
          <span className="text-[#C9A96E] font-medium tracking-[0.2em] uppercase text-sm mb-6 block drop-shadow-md">
            {eventData.subtitle || "Reserva la fecha"}
          </span>
          <h1 className={`text-6xl md:text-8xl font-serif font-bold ${textColor} leading-tight mb-8 drop-shadow-lg`}>
            {eventData.title}
          </h1>
          <div className="w-16 h-[1px] bg-[#C9A96E] mx-auto mb-8" />
          <p className={`text-xl md:text-2xl ${isDark ? 'text-gray-300' : 'text-gray-700'} italic font-serif leading-relaxed px-4 drop-shadow-md`}>
            {eventData.sections?.vows || "Acompáñanos a celebrar este día tan especial."}
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="absolute bottom-12 z-20"
        >
          <div className="w-[1px] h-16 bg-[#C9A96E] mx-auto animate-pulse" />
        </motion.div>
      </div>

      {/* Countdown Timer */}
      <Countdown targetDate={eventData.eventDate} />

      {/* Details Section */}
      <div className={`py-16 md:py-24 px-6 relative z-20`}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
           <motion.div 
             initial={{ opacity: 0, x: -20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className={`text-center p-8 border ${isDark ? 'border-gray-800 bg-[#2a2a4a]' : 'border-gray-100 bg-white'} rounded-2xl shadow-sm`}
           >
             <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
               <Calendar className="w-6 h-6 text-[#C9A96E]" />
             </div>
             <h3 className="text-xl font-serif font-bold mb-2">Cuándo</h3>
             <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-medium mb-4`}>
               {MillisToDate(eventData.eventDate)}<br/>
               <span className={`text-sm font-normal ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{eventData.eventTime || "18:00 hrs"}</span>
             </p>
             <a 
               href={`data:text/calendar;charset=utf8,BEGIN:VCALENDAR%0AVERSION:2.0%0ABEGIN:VEVENT%0ASUMMARY:${encodeURIComponent(eventData.title)}%0ADTSTART:${new Date(eventData.eventDate).toISOString().replace(/-|:|\.\d\d\d/g, "")}%0ADTEND:${new Date(eventData.eventDate + 4 * 60 * 60 * 1000).toISOString().replace(/-|:|\.\d\d\d/g, "")}%0ALOCATION:${encodeURIComponent(eventData.venue?.name)}%0ADESCRIPTION:${encodeURIComponent(eventData.subtitle)}%0AEND:VEVENT%0AEND:VCALENDAR`}
               download="evento.ics"
               className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-[#C9A96E] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-white rounded-lg transition-colors"
             >
               Agregar al Calendario
             </a>
           </motion.div>

           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className={`text-center p-8 border ${isDark ? 'border-gray-800 bg-[#2a2a4a]' : 'border-gray-100 bg-white'} rounded-2xl shadow-sm`}
           >
             <div className="w-12 h-12 bg-[#C9A96E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
               <MapPin className="w-6 h-6 text-[#C9A96E]" />
             </div>
             <h3 className="text-xl font-serif font-bold mb-2">Dónde</h3>
             <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} font-medium mb-2`}>
               {eventData.venue?.name}
             </p>
             <a href={eventData.venue?.url || `https://maps.google.com/?q=${eventData.venue?.name}`} target="_blank" rel="noopener noreferrer" className="text-sm text-[#C9A96E] hover:underline font-normal inline-block mt-2">
               Ver ubicación en mapa
             </a>
           </motion.div>
        </div>

        {/* Extras: Gift Registry & Gallery */}
        <div className="max-w-4xl mx-auto space-y-24">
          {eventData.giftRegistry && eventData.giftRegistry.length > 0 && eventData.giftRegistry[0].url && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <Gift className="w-10 h-10 text-[#C9A96E] mx-auto mb-6" />
              <h2 className="text-3xl font-serif font-bold mb-4">Mesa de Regalos</h2>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} mb-8 max-w-md mx-auto`}>
                Su presencia es nuestro mejor regalo, pero si desean tener un detalle con nosotros, pueden hacerlo aquí:
              </p>
              <a 
                href={eventData.giftRegistry[0].url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-8 py-3 bg-[#C9A96E] hover:bg-[#b0935d] text-white rounded-xl font-bold transition-colors shadow-md"
              >
                Ver Mesa de Regalos
              </a>
            </motion.div>
          )}

          {eventData.gallery && eventData.gallery.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-serif font-bold mb-10 text-center">Nuestros Momentos</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {eventData.gallery.filter(Boolean).map((url, i) => (
                  <div key={i} className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 relative group shadow-sm">
                    <img src={url} alt={`Gallery ${i}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* RSVP Section */}
      <div className={`py-24 px-6 ${isDark ? 'bg-black/40' : 'bg-[#1A1A2E]'} text-white relative border-t ${isDark ? 'border-gray-800' : 'border-transparent'}`}>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <PartyPopper className="w-8 h-8 text-[#C9A96E] mx-auto mb-6" />
          <h2 className="text-4xl font-serif font-bold mb-4">Confirma tu Asistencia</h2>
          <p className="text-gray-400 mb-10">Esperamos contar con tu presencia.</p>

          <AnimatePresence mode="wait">
            {rsvpSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-900/40 border border-green-800/50 p-8 rounded-2xl flex flex-col items-center"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-4 text-white">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-green-400 mb-6">¡Confirmación Exitosa!</h3>
                <div className="bg-white p-4 rounded-xl mb-6 inline-block">
                  <QRCodeSVG value={rsvpQrCode} size={160} level="H" />
                </div>
                <p className="text-green-200 text-sm text-center max-w-sm">
                  Este es tu pase de acceso. Guárdalo o tómale una captura de pantalla, te lo pediremos en la entrada del evento.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleRSVP}
                className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm text-left"
              >
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Nombre completo</label>
                    <input 
                      type="text" 
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-500 focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E] transition-all"
                      placeholder="Ej. Ana García"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Pases confirmados</label>
                    <select 
                      value={ticketCount}
                      onChange={(e) => setTicketCount(Number(e.target.value))}
                      className="w-full bg-[#2a2a4a] border border-white/10 rounded-xl p-3 text-white focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E] transition-all"
                    >
                      {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                  <button 
                    type="submit"
                    disabled={rsvpLoading}
                    className="w-full bg-[#C9A96E] hover:bg-[#b0935d] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-75"
                  >
                    {rsvpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                    Confirmar Asistencia
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Music Player */}
      {eventData.music?.url && (
         <div className="fixed bottom-6 right-6 z-50">
            <audio id="bg-music" src={eventData.music.url} loop />
            <button 
              onClick={() => {
                const audio = document.getElementById('bg-music') as HTMLAudioElement;
                if (isPlaying) {
                  audio.pause();
                } else {
                  audio.play().catch(console.error);
                }
                setIsPlaying(!isPlaying);
              }}
              className="w-14 h-14 bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-full flex items-center justify-center text-[#C9A96E] hover:bg-white/20 transition-all hover:scale-105"
            >
              {isPlaying ? <Pause className="w-6 h-6" fill="currentColor" /> : <Play className="w-6 h-6" fill="currentColor" className="ml-1" />}
            </button>
         </div>
      )}
      
    </div>
  );
}