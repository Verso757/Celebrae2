import { useState, useEffect } from "react";
import { useAuth } from "../../lib/useAuth";
import { db, logout } from "../../lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Settings, LogOut, Users, QrCode } from "lucide-react";

interface AppEvent {
  id: string;
  title: string;
  type: string;
  status: string;
  createdAt: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<AppEvent[]>([]);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, "events"),
      where("ownerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const evts: AppEvent[] = [];
      snapshot.forEach((doc) => {
        evts.push({ id: doc.id, ...doc.data() } as AppEvent);
      });
      setEvents(evts);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-[#C9A96E] rounded-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <span className="font-serif font-bold text-xl text-[#1A1A2E]">Celebrae</span>
        </div>
        
        <div className="p-4 flex-1">
          <nav className="space-y-1">
            <a href="#" className="flex items-center gap-3 px-3 py-2 bg-gray-50 text-gray-900 rounded-md font-medium text-sm">
              <Calendar className="w-4 h-4 text-gray-500" /> Mis Eventos
            </a>
            <a href="#" className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md font-medium text-sm transition-colors">
              <Settings className="w-4 h-4" /> Configuración
            </a>
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => logout()}
            className="flex items-center gap-3 w-full px-3 py-2 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-md font-medium text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif text-[#1A1A2E]">Mis Eventos</h1>
            <p className="text-gray-500 mt-1">Gestiona tus invitaciones y asistentes.</p>
          </div>
          <button
            onClick={() => navigate("/builder")}
            className="bg-[#C9A96E] hover:bg-[#b0935d] text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Nuevo Evento
          </button>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes eventos activos</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Empieza a crear tu primera invitación digital inteligente usando nuestro creador asistido por IA.
            </p>
            <button
              onClick={() => navigate("/builder")}
              className="bg-[#1A1A2E] hover:bg-[#2a2a4a] text-white px-5 py-2.5 rounded-lg font-medium shadow-sm transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" /> Crear mi primer evento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
                <div className="h-32 bg-gray-100 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#1A1A2E]/80 to-[#C9A96E]/80" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <span className="text-xs font-semibold uppercase tracking-wider bg-white/20 px-2 py-1 rounded backdrop-blur-sm">
                      {event.type}
                    </span>
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{event.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${event.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {event.status === 'active' ? 'Activo' : 'Borrador'}
                    </span>
                  </div>
                  <div className="mt-auto flex pt-4 border-t border-gray-100 gap-4">
                    <button 
                      onClick={() => navigate(`/dashboard/evento/${event.id}`)}
                      className="flex items-center gap-1.5 text-sm font-medium text-[#1A1A2E] hover:text-[#C9A96E] transition"
                    >
                      <Users className="w-4 h-4" />
                      <span>Gestionar Invitados</span>
                    </button>
                    <button 
                      onClick={() => navigate(`/builder/${event.id}`)}
                      className="ml-auto text-gray-500 hover:text-gray-900 text-sm font-medium"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
