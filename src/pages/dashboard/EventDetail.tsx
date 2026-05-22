import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../lib/firebase";
import { collection, doc, query, where, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../../lib/useAuth";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ArrowLeft, Users, CheckCircle2, Clock, XCircle, Search, Download, Edit, QrCode, X } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

interface Invitation {
  id: string;
  guestName: string;
  rsvpStatus: "pending" | "confirmed" | "declined";
  ticketCount: number;
  qrCode?: string;
  checkedInAt?: any;
}

export default function EventDetail() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [eventData, setEventData] = useState<any>(null);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId || !user) return;

    // Listen to event
    const unsubscribeEvent = onSnapshot(doc(db, "events", eventId), (docSnap) => {
      if (docSnap.exists() && docSnap.data().ownerId === user.uid) {
        setEventData({ id: docSnap.id, ...docSnap.data() });
      } else {
        navigate("/dashboard");
      }
    });

    // Listen to invitations for this event
    const qInvitations = query(
      collection(db, "invitations"),
      where("eventId", "==", eventId)
    );
    const unsubscribeInvitations = onSnapshot(qInvitations, (snapshot) => {
      const invs: Invitation[] = [];
      snapshot.forEach((doc) => {
        invs.push({ id: doc.id, ...doc.data() } as Invitation);
      });
      setInvitations(invs);
    });

    return () => {
      unsubscribeEvent();
      unsubscribeInvitations();
    };
  }, [eventId, user, navigate]);

  useEffect(() => {
    if (scannerOpen) {
       const scanner = new Html5QrcodeScanner("reader", { qrbox: { width: 250, height: 250 }, fps: 5 }, /* verbose= */ false);
       scanner.render(
         (decodedText) => {
           setScanResult(decodedText);
           scanner.clear().catch(console.error); // Close scanner on success
         },
         (error) => {
            // handle error silently
         }
       );
       return () => { 
         // cleanup
         if (document.getElementById('reader')) {
            scanner.clear().catch(e => console.error("Error clearing scanner", e)); 
         }
       };
    }
  }, [scannerOpen]);

  useEffect(() => {
    if (scanResult) {
      const inv = invitations.find(i => i.qrCode === scanResult);
      if (inv) {
        if (!inv.checkedInAt) {
          updateDoc(doc(db, "invitations", inv.id), { checkedInAt: serverTimestamp() }).then(() => {
            alert(`¡Check-in exitoso para ${inv.guestName}! Pases: ${inv.ticketCount}`);
          }).catch(console.error);
        } else {
          alert(`El pase de ${inv.guestName} ya había sido escaneado.`);
        }
      } else {
        alert("Pase inválido o no encontrado en este evento.");
      }
      setScanResult(null);
      setScannerOpen(false);
    }
  }, [scanResult, invitations]);

  if (!eventData) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-[#C9A96E] border-t-transparent rounded-full" />
      </div>
    );
  }

  // Calculate stats based on number of TICKETS, not number of invitations.
  // One invitation could have ticketCount = 3.
  const stats = invitations.reduce(
    (acc, inv) => {
      if (inv.rsvpStatus === "confirmed") {
        acc.confirmed += inv.ticketCount;
      } else if (inv.rsvpStatus === "declined") {
        acc.declined += inv.ticketCount;
      } else {
        acc.pending += inv.ticketCount;
      }
      return acc;
    },
    { confirmed: 0, pending: 0, declined: 0 }
  );

  const totalGuests = stats.confirmed + stats.pending + stats.declined;

  const chartData = [
    { name: "Confirmados", value: stats.confirmed, color: "#10B981" },
    { name: "Pendientes", value: stats.pending, color: "#F59E0B" },
    { name: "Declinados", value: stats.declined, color: "#EF4444" },
  ];

  const filteredInvs = invitations.filter(inv => inv.guestName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col md:flex-row">
      {/* Sidebar - Optional, but keeping it simple for the detail view */}
      <div className="flex-1">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold font-serif text-[#1A1A2E]">{eventData.title}</h1>
              <span className="text-sm text-gray-500 capitalize">{eventData.type}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button
               onClick={() => setScannerOpen(true)}
               className="flex items-center gap-2 px-4 py-2 bg-yellow-50 text-[#C9A96E] hover:bg-[#C9A96E] hover:text-white rounded-lg text-sm font-medium transition"
            >
               <QrCode className="w-4 h-4" /> Check-in
            </button>
            <button
              onClick={() => navigate(`/builder/${eventId}`)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 transition"
            >
              <Edit className="w-4 h-4" /> Editar Evento
            </button>
            <button
              onClick={() => navigate(`/e/${eventId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1A1A2E] text-white rounded-lg text-sm font-medium hover:bg-[#2a2a4a] transition"
            >
              Ver Invitación
            </button>
          </div>
        </div>

        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
          
          {/* Top Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Total de Pases</p>
                <p className="text-2xl font-bold text-gray-900">{totalGuests}</p>
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Asistirán</p>
                <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">No Asistirán</p>
                <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Guest Management Table */}
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-bold font-serif text-[#1A1A2E]">Lista de Invitados</h2>
                <div className="flex gap-2">
                  {/* For MVP, downloading CSV can be a mock feature or we implement standard browser download */}
                  <button className="p-2 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50 tooltip-trigger" title="Exportar CSV">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar invitado..."
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-[#C9A96E] focus:ring-1 focus:ring-[#C9A96E]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-auto">
                {filteredInvs.length === 0 ? (
                   <div className="h-full flex flex-col items-center justify-center text-gray-500 p-6 text-center">
                     <Users className="w-12 h-12 mb-3 text-gray-300" />
                     <p className="font-medium">No hay invitados que coincidan</p>
                     <p className="text-sm mt-1">Busca otro nombre o comparte tu invitación para empezar a recibir confirmaciones.</p>
                   </div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 sticky top-0 shadow-sm">
                      <tr>
                        <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider text-xs">Nombre</th>
                        <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider text-xs">Pases</th>
                        <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider text-xs">Estado</th>
                        <th className="px-6 py-3 font-medium text-gray-500 uppercase tracking-wider text-xs">Asistencia</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredInvs.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50/50 transition">
                          <td className="px-6 py-4 font-medium text-gray-900">{inv.guestName}</td>
                          <td className="px-6 py-4 text-gray-600">{inv.ticketCount}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
                              ${inv.rsvpStatus === 'confirmed' ? 'bg-green-50 text-green-700 border-green-200' : 
                                inv.rsvpStatus === 'declined' ? 'bg-red-50 text-red-700 border-red-200' : 
                                'bg-yellow-50 text-yellow-700 border-yellow-200'}`}
                            >
                              {inv.rsvpStatus === 'confirmed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                              {inv.rsvpStatus === 'declined' && <XCircle className="w-3.5 h-3.5" />}
                              {inv.rsvpStatus === 'pending' && <Clock className="w-3.5 h-3.5" />}
                              {inv.rsvpStatus === 'confirmed' ? 'Confirmado' : inv.rsvpStatus === 'declined' ? 'No asistirá' : 'Pendiente'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {inv.checkedInAt ? (
                              <span className="text-xs font-medium text-green-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Check-in</span>
                            ) : (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Analytics Chart */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 h-fit">
              <h2 className="text-lg font-bold font-serif text-[#1A1A2E] mb-6">Asistencia</h2>
              {totalGuests > 0 ? (
                <div className="h-64 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                       {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend verticalAlign="bottom" height={36}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  <p>Aún no hay datos para graficar</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      {scannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-[#1A1A2E]">Escanear Pase QR</h3>
              <button onClick={() => setScannerOpen(false)} className="p-1 hover:bg-gray-100 rounded-full transition text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 bg-gray-50">
              <div id="reader" className="rounded-xl overflow-hidden shadow-inner border-2 border-dashed border-gray-300"></div>
              <p className="text-center text-sm text-gray-500 mt-4">
                Apunta la cámara del dispositivo al código QR en el pase del invitado para registrar su llegada.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
