import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Clock, 
  Send, 
  CheckCircle, 
  Trash2, 
  ChevronDown,
  Compass,
  Settings,
  Layers
} from 'lucide-react';
import { addDocument, subscribeToCollection, deleteDocument } from '../lib/db';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

const MOSQUE_POSITION = { lat: -4.004052, lng: 119.643329 };

interface KontakMasjidProps {
  isAdmin?: boolean;
}

interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  whatsapp: string;
  subject: string;
  message: string;
  timestamp: string;
}

export default function KontakMasjid({ isAdmin = false }: KontakMasjidProps) {
  // Interactive Google Maps state
  const [isInfoWindowOpen, setIsInfoWindowOpen] = useState(true);
  const [mapTab, setMapTab] = useState<'standard' | 'tutorial'>('standard');

  // Form input states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [incomingMessages, setIncomingMessages] = useState<ContactMessage[]>([]);
  const [activeAdminTab, setActiveAdminTab] = useState<'form' | 'admin_inbox'>('form');

  // Load incoming messages if admin
  useEffect(() => {
    if (isAdmin) {
      const unsubscribe = subscribeToCollection<ContactMessage>('contact_messages', (data) => {
        // Sort newest first
        const sorted = [...data].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setIncomingMessages(sorted);
      });
      return () => unsubscribe();
    }
  }, [isAdmin]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple Client-side validation
    if (!formData.name || !formData.email || !formData.whatsapp || !formData.subject || !formData.message) {
      setErrorMessage('Harap lengkapi semua field yang berbintang (*).');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const payload = {
        ...formData,
        timestamp: new Date().toISOString()
      };
      
      await addDocument('contact_messages', payload);
      
      setIsSubmitting(false);
      setSubmitSuccess(true);
      // Reset form
      setFormData({
        name: '',
        email: '',
        whatsapp: '',
        subject: '',
        message: ''
      });

      // Clear success state after 5 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      setIsSubmitting(false);
      setErrorMessage('Terjadi kesalahan saat mengirim pesan. Harap coba lagi.');
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pesan ini?')) {
      try {
        await deleteDocument('contact_messages', id);
      } catch (err) {
        console.error('Failed to delete message:', err);
      }
    }
  };

  return (
    <div className="animate-fade-in space-y-6 sm:space-y-8 w-full">
      
      {/* Title Header matching Screenshot Theme */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl sm:text-4.5xl font-black text-[#031d14] tracking-tight uppercase">
          Hubungi Pengurus Masjid Al Abrar
        </h1>
        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent bg-amber-500 mx-auto rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
      </div>

      {/* Admin Toggle Tabs inside Kontak Tab */}
      {isAdmin && (
        <div className="flex justify-center gap-2 max-w-md mx-auto bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveAdminTab('form')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition duration-300 ${
              activeAdminTab === 'form' 
                ? 'bg-emerald-800 text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Form Kontak Utama
          </button>
          <button
            onClick={() => setActiveAdminTab('admin_inbox')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition duration-300 relative ${
              activeAdminTab === 'admin_inbox' 
                ? 'bg-emerald-800 text-white shadow-md' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pesan Masuk ({incomingMessages.length})
            {incomingMessages.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-400 text-emerald-950 text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-black animate-pulse">
                {incomingMessages.length}
              </span>
            )}
          </button>
        </div>
      )}

      {/* Conditional Rendering based on selected view */}
      {activeAdminTab === 'form' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column Description Card: "Mari Berdiskusi" */}
          <div className="lg:col-span-5 bg-[#034d38] text-white rounded-[2rem] p-8 sm:p-10 flex flex-col justify-between shadow-xl relative overflow-hidden h-full min-h-[480px]">
            {/* Islamic geometric patterns background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 0l30 30-30 30L0 30zm0 10L10 30l20 20 20-20z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'repeat'
            }}></div>
            
            <div className="relative z-10 space-y-8">
              <div className="space-y-3">
                <h2 className="text-3xl font-black tracking-tight text-white font-display">
                  Mari Berdiskusi
                </h2>
                <p className="text-emerald-100/80 text-sm leading-relaxed font-medium">
                  Pintu kami selalu terbuka untuk pertanyaan, saran, atau kerjasama demi kemajuan umat.
                </p>
              </div>

              {/* Info Items List matching Screenshot */}
              <div className="space-y-6">
                
                {/* Lokasi Utama */}
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-emerald-900/60 rounded-2xl border border-white/5 text-amber-400 shrink-0 shadow-md">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 text-left">
                    <h4 className="text-sm font-black tracking-wide text-white">Lokasi Utama</h4>
                    <p className="text-xs text-emerald-100/80 leading-relaxed font-semibold">
                      Jl jend A Yani Km 5 Kecamatan ujung kelurahan lapadde
                    </p>
                  </div>
                </div>

                {/* Email Resmi */}
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-emerald-900/60 rounded-2xl border border-white/5 text-amber-400 shrink-0 shadow-md">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 text-left">
                    <h4 className="text-sm font-black tracking-wide text-white">Email Resmi</h4>
                    <p className="text-xs text-emerald-100/80 leading-relaxed font-semibold font-mono break-all">
                      info@masjidalabrarparepare.or.id
                    </p>
                  </div>
                </div>

                {/* Layanan Telepon */}
                <div className="flex gap-4 items-start">
                  <div className="p-3 bg-emerald-900/60 rounded-2xl border border-white/5 text-amber-400 shrink-0 shadow-md">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 text-left">
                    <h4 className="text-sm font-black tracking-wide text-white">Layanan Telepon</h4>
                    <p className="text-xs text-emerald-100/80 leading-relaxed font-semibold font-mono">
                      +62 811-4200-244
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* Jam Operasional Kantor Alert container */}
            <div className="relative z-10 mt-8 p-5 bg-emerald-950/40 rounded-2xl border border-emerald-500/10 text-left">
              <h5 className="text-amber-400 font-black text-xs uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                <Clock className="h-3.5 w-3.5" />
                Jam Operasional Kantor:
              </h5>
              <p className="text-xs text-emerald-100 font-bold">
                Senin - Jumat: 08.00 - 16.00 WITA
              </p>
              <p className="text-xs text-emerald-100/60 font-medium">
                Sabtu - Minggu: Tutup (Kecuali Acara Khusus)
              </p>
            </div>

          </div>

          {/* Right Column Form Card: Input Fields */}
          <div className="lg:col-span-7 bg-white rounded-[2rem] p-8 sm:p-10 shadow-xl border border-slate-200/60 flex flex-col justify-between">
            <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-4 mb-6 text-left">
              Kirim Pesan Anda
            </h3>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nama Lengkap */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider">
                    Nama Lengkap<span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Masukkan nama Anda"
                    className="w-full px-4 py-3 bg-slate-50/70 text-slate-800 border border-slate-200/85 rounded-xl text-sm focus:border-emerald-600 focus:bg-white focus:outline-none transition font-medium"
                  />
                </div>

                {/* Alamat Email */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider">
                    Alamat Email<span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="nama@email.com"
                    className="w-full px-4 py-3 bg-slate-50/70 text-slate-800 border border-slate-200/85 rounded-xl text-sm focus:border-emerald-600 focus:bg-white focus:outline-none transition font-medium"
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Nomor WhatsApp */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider">
                    Nomor WhatsApp<span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    required
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="08xxxx"
                    className="w-full px-4 py-3 bg-slate-50/70 text-slate-800 border border-slate-200/85 rounded-xl text-sm focus:border-emerald-600 focus:bg-white focus:outline-none transition font-semibold"
                  />
                </div>

                {/* Subjek / Layanan */}
                <div className="space-y-1 text-left relative">
                  <label className="text-xs font-black text-slate-600 uppercase tracking-wider">
                    Subjek<span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-slate-50/70 text-slate-800 border border-slate-200/85 rounded-xl text-sm focus:border-emerald-600 focus:bg-white focus:outline-none appearance-none transition pr-10 font-medium"
                    >
                      <option value="">Pilih Layanan...</option>
                      <option value="Tanya Jawab / Konsultasi">Tanya Jawab / Konsultasi</option>
                      <option value="Kemitraan">Kemitraan & Kerjasama</option>
                      <option value="Saran / Masukan">Saran / Masukan</option>
                      <option value="Pertanyaan Umum">Pertanyaan Umum</option>
                      <option value="Konfirmasi Donasi">Konfirmasi Donasi</option>
                    </select>
                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

              </div>

              {/* Pesan Textarea */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-black text-slate-600 uppercase tracking-wider">
                  Pesan<span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tuliskan pesan Anda secara detail..."
                  className="w-full px-4 py-3 bg-slate-50/70 text-slate-800 border border-slate-200/85 rounded-xl text-sm focus:border-emerald-600 focus:bg-white focus:outline-none transition font-medium"
                />
              </div>

              {/* Animate Validation Errors or Submit Success Message */}
              <AnimatePresence mode="wait">
                {errorMessage && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl text-left"
                  >
                    ⚠ {errorMessage}
                  </motion.div>
                )}

                {submitSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl text-left flex items-start gap-3 shadow-sm"
                  >
                    <CheckCircle className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-emerald-900 mb-0.5">Pesan Berhasil Dikirim!</p>
                      <p className="font-medium text-emerald-700">Jazakumullah Khairan. Pengurus masjid akan membalas pesan Anda sesegera mungkin.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-[#008967] hover:bg-[#007356] active:bg-[#005e46] text-white font-black rounded-xl text-sm transition shadow-lg shadow-emerald-800/10 active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    MENGIRIM...
                  </>
                ) : (
                  <>
                    <span>Kirim Pesan Sekarang</span>
                    <Send className="h-4 w-4" />
                  </>
                )}
              </button>

            </form>
          </div>

        </div>
      ) : (
        /* ADMIN INBOX VIEW */
        <div className="bg-white rounded-[2rem] border border-slate-200/60 p-6 sm:p-10 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5 mb-6">
            <div className="text-left">
              <h3 className="text-xl font-black text-slate-800">Riwayat Pesan Masuk</h3>
              <p className="text-xs text-slate-500 font-medium">Mengelola pesan, saran, dan konsultasi dari jamaah secara real-time.</p>
            </div>
            <span className="bg-amber-400 text-emerald-950 text-[10px] sm:text-xs px-3 py-1 rounded-full font-black uppercase">
              TOTAL: {incomingMessages.length} PESAN
            </span>
          </div>

          {incomingMessages.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3 font-medium">
              <div className="text-5xl">📥</div>
              <p>Belum ada pesan masuk dari form kontak.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 no-scrollbar">
              {incomingMessages.map((msg) => (
                <div key={msg.id} className="p-5 bg-slate-50 hover:bg-slate-100/50 rounded-2xl border border-slate-200/50 text-left transition duration-300 relative group">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-extrabold text-slate-800 text-sm sm:text-base">{msg.name}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase tracking-wider">
                          {msg.subject}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 text-xs font-medium font-mono">
                        <span>✉ {msg.email}</span>
                        <span>📱 {msg.whatsapp}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <span className="text-[10px] text-slate-400 shrink-0 font-bold">
                        {new Date(msg.timestamp).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      
                      <button
                        onClick={() => msg.id && handleDeleteMessage(msg.id)}
                        className="p-2 text-rose-500 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 hover:text-rose-600 transition shadow-sm"
                        title="Hapus Pesan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-white/75 rounded-xl border border-slate-200/40 text-slate-700 text-sm leading-relaxed font-medium">
                    {msg.message}
                  </div>
                  
                  {/* Whatsapp Quick Reply */}
                  <div className="mt-3 flex justify-end">
                    <a 
                      href={`https://wa.me/${msg.whatsapp.replace(/\D/g, '')}`} 
                      target="_blank" 
                      referrerPolicy="no-referrer"
                      className="px-4 py-1.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 transition text-white font-black text-xs rounded-xl inline-flex items-center gap-1.5 shadow-sm uppercase tracking-wide"
                    >
                      <span>Balas via WhatsApp</span>
                      <span>💬</span>
                    </a>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Interactive Google Maps Platform Section */}
      <div className="w-full space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-[#031d14] uppercase tracking-wide flex items-center gap-2">
              <Compass className="h-5 w-5 text-emerald-700" /> Peta Lokasi Interaktif
            </h3>
            <p className="text-xs text-slate-500 font-medium">Jelajahi petunjuk arah dan lokasi geografis Masjid Jami Al Abrar Kota Parepare.</p>
          </div>

          {/* Toggle Tab if API key is not configured */}
          {!hasValidKey && (
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200/60 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setMapTab('standard')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition cursor-pointer ${
                  mapTab === 'standard'
                    ? 'bg-[#034d38] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Peta Standar
              </button>
              <button
                type="button"
                onClick={() => setMapTab('tutorial')}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition flex items-center gap-1 cursor-pointer ${
                  mapTab === 'tutorial'
                    ? 'bg-[#034d38] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Settings className="w-3 h-3 text-amber-400" /> Setup Kunci API
              </button>
            </div>
          )}
        </div>

        {/* Map Display Container */}
        <div className="w-full h-[400px] sm:h-[480px] rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl relative bg-slate-100 flex flex-col">
          {hasValidKey ? (
            /* Fully Interactive Google Maps API Experience */
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                defaultCenter={MOSQUE_POSITION}
                defaultZoom={16}
                mapId="DEMO_MAP_ID"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
                gestureHandling={'cooperative'}
                disableDefaultUI={false}
              >
                <AdvancedMarker
                  position={MOSQUE_POSITION}
                  onClick={() => setIsInfoWindowOpen(true)}
                  title="Masjid Jami Al Abrar"
                >
                  <Pin background="#034d38" glyphColor="#fbbf24" borderColor="#022c22" />
                </AdvancedMarker>

                {isInfoWindowOpen && (
                  <InfoWindow
                    position={MOSQUE_POSITION}
                    onCloseClick={() => setIsInfoWindowOpen(false)}
                  >
                    <div className="p-2 text-slate-800 text-xs font-sans max-w-[220px] text-left">
                      <h4 className="font-extrabold text-[#031d14] text-sm mb-1">Masjid Jami Al Abrar</h4>
                      <p className="text-[11px] text-slate-600 leading-relaxed mb-2">
                        Jl. Jenderal Ahmad Yani Km. 5, Kel. Lapadde, Kec. Ujung, Kota Parepare, Sulawesi Selatan.
                      </p>
                      <a
                        href="https://maps.google.com/?q=Masjid%20Jami%20Al%20Abrar%20Lapadde%20Parepare"
                        target="_blank"
                        rel="noopener noreferrer"
                        referrerPolicy="no-referrer"
                        className="inline-flex items-center gap-1 text-[10px] font-black text-[#008967] hover:text-[#007356] underline uppercase"
                      >
                        Petunjuk Arah ➔
                      </a>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </APIProvider>
          ) : mapTab === 'standard' ? (
            /* Fallback Standard Iframe Map with Upgrade Invitation Banner */
            <div className="w-full h-full relative flex flex-col">
              {/* Upgrade Banner Overlay */}
              <div className="absolute top-3 left-3 right-3 z-10 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-emerald-500/15 shadow-lg flex items-center justify-between text-left gap-3 animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-50 text-emerald-800 rounded-lg hidden sm:block">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[11px] font-extrabold text-emerald-950 uppercase tracking-wide">Peta Interaktif Tersedia! ✨</h5>
                    <p className="text-[10px] text-slate-500 font-medium">Tambahkan API Key untuk mengaktifkan rendering 3D, Custom Marker, dan detail interaktif.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMapTab('tutorial')}
                  className="px-3 py-1.5 bg-[#034d38] hover:bg-[#023e2c] text-white text-[9px] font-black rounded-xl uppercase transition shrink-0 shadow-sm cursor-pointer"
                >
                  Aktifkan
                </button>
              </div>

              {/* Standard Iframe */}
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                style={{ border: 0 }} 
                src="https://maps.google.com/maps?q=Masjid%20Jami%20Al%20Abrar%20Lapadde%20Parepare&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Masjid Jami Al Abrar"
                className="w-full h-full"
              ></iframe>
            </div>
          ) : (
            /* Visual Tutorial for Adding the API Key */
            <div className="w-full h-full p-6 sm:p-8 bg-[#021c13] text-white flex flex-col justify-between overflow-y-auto text-left">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-amber-400/10 text-amber-400 rounded-xl">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white uppercase tracking-wider font-mono">Setup Google Maps Platform</h4>
                    <p className="text-[10px] text-slate-400 font-semibold">Aktifkan integrasi peta interaktif premium hanya dalam beberapa detik</p>
                  </div>
                </div>

                <hr className="border-emerald-800/50" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  
                  {/* Step 1 & 2 */}
                  <div className="space-y-3.5">
                    <div className="flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">1</span>
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-black text-slate-200 uppercase tracking-wide">Dapatkan API Key</h5>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                          Dapatkan kunci API resmi Anda di{' '}
                          <a 
                            href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            referrerPolicy="no-referrer"
                            className="text-amber-400 hover:underline font-bold"
                          >
                            Google Cloud Console
                          </a>.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">2</span>
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-black text-slate-200 uppercase tracking-wide">Buka Settings</h5>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                          Klik ikon <strong>Gigi Roda (Settings ⚙️)</strong> di sudut kanan atas menu AI Studio Anda.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Step 3 & 4 */}
                  <div className="space-y-3.5">
                    <div className="flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">3</span>
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-black text-slate-200 uppercase tracking-wide">Simpan Secrets</h5>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                          Pilih submenu <strong>Secrets</strong>, tambahkan variabel bernama <code>GOOGLE_MAPS_PLATFORM_KEY</code>, lalu simpan kunci Anda di sana.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3 items-start">
                      <span className="w-6 h-6 rounded-full bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-xs font-black shrink-0">4</span>
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-black text-slate-200 uppercase tracking-wide">Aktif Otomatis!</h5>
                        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                          Aplikasi akan membangun ulang otomatis tanpa harus muat ulang halaman. Peta interaktif 3D instan aktif!
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              <div className="pt-4 border-t border-emerald-800/40 flex flex-col sm:flex-row justify-between items-center gap-3">
                <span className="text-[10px] text-slate-500 font-medium font-mono">Dukungan: @vis.gl/react-google-maps v1.1</span>
                <button
                  type="button"
                  onClick={() => setMapTab('standard')}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-slate-200 hover:text-white font-bold rounded-xl transition uppercase tracking-wide shrink-0 cursor-pointer"
                >
                  Kembali ke Peta Standar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
