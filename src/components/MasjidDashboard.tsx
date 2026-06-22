import { motion } from 'motion/react';
import { 
  Database,
  Calendar, 
  TrendingUp, 
  Heart, 
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { PrayerTime } from '../types';

interface MasjidDashboardProps {
  prayers: PrayerTime[];
  nextDetails: any;
  onNavigate: (tab: any) => void;
  isAdmin: boolean;
  onShowLogin: () => void;
}

export default function MasjidDashboard({ 
  prayers, 
  nextDetails, 
  onNavigate,
  isAdmin,
  onShowLogin
}: MasjidDashboardProps) {
  
  // Format current date in Indonesian
  const today = new Date();
  const dateFormatted = today.toLocaleDateString('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  const mainServices: { id: string; title: string; desc: string; icon: any; color: string; badge?: string }[] = [
    { 
      id: 'jadwal', 
      title: 'Jadwal & Agenda', 
      desc: 'Penjadwalan shalat & kegiatan masjid harian.', 
      icon: <Calendar className="w-6 h-6" />, 
      color: 'bg-indigo-50 text-indigo-600'
    },
    { 
      id: 'donasi', 
      title: 'Sedekah Digital', 
      desc: 'Saluran donasi aman dan transparan.', 
      icon: <Heart className="w-6 h-6" />, 
      color: 'bg-rose-50 text-rose-600'
    },
    { 
      id: 'keuangan', 
      title: 'Laporan Kas', 
      desc: 'Transparansi laporan keuangan realtime.', 
      icon: <TrendingUp className="w-6 h-6" />, 
      color: 'bg-emerald-50 text-emerald-600'
    },
    { 
      id: 'profil', 
      title: 'Profil Masjid', 
      desc: 'Sejarah, visi-misi, dan struktur pengurus.', 
      icon: <Database className="w-6 h-6" />, 
      color: 'bg-slate-50 text-slate-600'
    },
  ];

  return (
    <div className="space-y-10">
      {/* Dynamic Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Main Status Hero Card (8 Cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-12 bg-white border border-slate-200 rounded-3xl sm:rounded-[3.5rem] shadow-2xl shadow-slate-200/50 p-6 sm:p-12 relative overflow-hidden group"
        >
          {/* Decorative background */}
          <div className="absolute -right-24 -top-24 w-[30rem] h-[30rem] bg-emerald-50 rounded-full blur-[100px] opacity-70 z-0 group-hover:scale-110 transition duration-1000"></div>
          <div className="absolute -left-20 -bottom-20 w-[20rem] h-[20rem] bg-amber-50 rounded-full blur-[80px] opacity-50 z-0 group-hover:scale-110 transition duration-1000 delay-200"></div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Pusat Layanan Digital</span>
              </div>
              
              <div>
                <h2 className="text-3xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.05] mb-4">
                  Ibadah Nyaman <br />
                  <span className="text-emerald-600">Terorganisir.</span>
                </h2>
                <p className="text-slate-500 text-xs sm:text-lg font-medium leading-relaxed max-w-md">
                  Mengelola ekosistem Masjid Jami Al Abrar dengan transparansi tinggi dan layanan berbasis teknologi cerdas.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <div className="px-6 py-3 bg-slate-900 text-white rounded-2xl flex items-center gap-3 shadow-xl shadow-slate-900/20">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider">{dateFormatted}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="w-full max-w-sm bg-slate-950 text-white p-8 sm:p-10 rounded-2xl sm:rounded-[3rem] shadow-2xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group/next">
                {/* Visual Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-100"></div>
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl group-hover/next:scale-150 transition duration-700"></div>
                
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] mb-4 relative z-10">Jadwal Terdekat</span>
                {nextDetails ? (
                  <>
                    <h3 className="text-2xl sm:text-3xl font-black mb-1 relative z-10 tracking-tight">{nextDetails.prayer.name}</h3>
                    <div className="text-5xl sm:text-6xl font-black tracking-tighter my-3 font-mono text-white relative z-10">
                      {nextDetails.prayer.time}
                    </div>
                    <div className="mt-4 px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full relative z-10 backdrop-blur-md">
                      <span className="text-[10px] sm:text-[11px] text-emerald-400 font-black uppercase tracking-[0.2em]">{nextDetails.countdownPrayer}</span>
                    </div>
                  </>
                ) : (
                  <div className="animate-pulse flex flex-col items-center space-y-4 relative z-10">
                    <div className="h-8 w-24 bg-white/10 rounded-xl"></div>
                    <div className="h-16 w-48 bg-white/10 rounded-xl"></div>
                    <div className="h-6 w-32 bg-white/10 rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-10 sm:mt-16 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 border-t border-slate-100 pt-8 sm:pt-10">
            {prayers.map((p) => {
              const isNext = nextDetails?.prayer?.id === p.id;
              return (
                <button 
                  key={p.id} 
                  onClick={() => onNavigate('jadwal')}
                  className={`flex flex-col items-center p-3 sm:p-5 rounded-2xl sm:rounded-[2rem] transition-all duration-300 border group/p relative ${
                    isNext 
                      ? 'bg-emerald-600 border-emerald-500 shadow-xl shadow-emerald-200/50 scale-105 z-20 sm:-translate-y-3' 
                      : 'bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 hover:-translate-y-1'
                  }`}
                >
                  <span className="text-xl sm:text-3xl mb-1 sm:mb-2 group-hover/p:scale-125 transition duration-300">{p.icon}</span>
                  <span className={`text-[8px] sm:text-[10px] font-black uppercase tracking-widest mb-1 shadow-sm ${isNext ? 'text-emerald-100' : 'text-slate-400'}`}>{p.name}</span>
                  <span className={`text-sm sm:text-base font-black font-mono tracking-tighter ${isNext ? 'text-white' : 'text-slate-800'}`}>{p.time}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Main Services Section - The Core Request */}
      <section className="space-y-8 py-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-1">
          <div>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Layanan Prioritas</h3>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">Platform layanan publik terintegrasi Masjid Jami Al Abrar.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semua Online</span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainServices.map((service, idx) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              onClick={() => {
                onNavigate(service.id);
              }}
              className="group bg-white border border-slate-200 rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 text-left hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">
                <ChevronRight className="w-5 h-5 text-emerald-400" />
              </div>

              <div className={`w-14 h-14 rounded-2xl ${service.color} flex items-center justify-center mb-6 group-hover:scale-110 transition duration-500 shadow-sm border border-emerald-100/20`}>
                {service.icon}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="font-black text-xl text-slate-900 tracking-tight">{service.title}</h4>
                  {service.badge && (
                    <span className="px-2 py-0.5 bg-slate-900 text-white text-[8px] font-black rounded-lg tracking-widest">{service.badge}</span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {service.desc}
                </p>
              </div>

              {/* Decorative corner */}
              <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Tertiary Row: Quick Access (Admin Only) or Community Highlights (Public) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="lg:col-span-12"
        >
          {isAdmin ? (
            /* Admin sees Activity Feed & Security side-by-side */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-12 bg-emerald-950 text-white rounded-3xl sm:rounded-[3rem] p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between relative overflow-hidden group">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent"></div>
                <div className="relative z-10 space-y-4 text-center md:text-left">
                  <div className="flex items-center gap-3 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full w-fit mx-auto md:mx-0">
                     <ShieldCheck className="h-4 w-4 text-emerald-400" />
                     <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Keamanan Cloud Terjamin</span>
                  </div>
                  <h4 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">Integritas Data Senter <br />Masjid Jami Al Abrar</h4>
                  <p className="text-xs sm:text-sm text-emerald-300/70 font-medium leading-relaxed max-w-md">
                    Seluruh data operasional masjid terenkripsi dan disimpan secara real-time. Kelola log riwayat secara lengkap melalui menu Jadwal & Agenda.
                  </p>
                </div>
                <div className="relative z-10 mt-8 md:mt-0 flex flex-col items-center gap-4">
                  <button 
                    onClick={() => onNavigate('jadwal')}
                    className="px-8 py-4 bg-emerald-600 text-white font-black text-xs rounded-2xl hover:bg-emerald-500 transition shadow-2xl flex items-center gap-2.5 active:scale-95"
                  >
                    Buka Monitoring Log
                  </button>
                  <p className="text-[10px] text-emerald-400/50 font-bold uppercase tracking-widest">Sesi Admin Aktif</p>
                </div>
              </div>
            </div>
          ) : (
            /* Compact Public Summary Hub */
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white rounded-3xl sm:rounded-[3.5rem] p-6 sm:p-12 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-emerald-600/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
              <div className="absolute bottom-0 left-0 w-[30rem] h-[30rem] bg-indigo-600/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4"></div>
              
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-12 items-center text-center lg:text-left">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400">Portal Aman & Transparan</span>
                  </div>
                  <h3 className="text-2xl sm:text-5xl font-black tracking-tight leading-[1.1]">
                    Digitalisasi Layanan <br />
                    <span className="text-emerald-400">Masjid Al Abrar.</span>
                  </h3>
                  <p className="text-slate-400 text-xs sm:text-base font-medium leading-relaxed max-w-lg mx-auto lg:mx-0">
                    Platform digital terpadu untuk transparansi keuangan, penjadwalan ibadah tepat waktu, dan kemudahan layanan jamaah di era industri 4.0.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 justify-center lg:justify-start">
                    <button 
                      onClick={onShowLogin}
                      className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-black text-xs rounded-2xl hover:bg-emerald-500 transition shadow-2xl shadow-emerald-900/40 flex items-center justify-center gap-2.5 active:scale-95"
                    >
                      🔐 LOGIN PENGURUS
                    </button>
                    <div className="flex flex-col items-center sm:items-start">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Status Sistem</span>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black uppercase text-emerald-400/80">ONLINE • v2.4.0</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 w-full">
                  {[
                    { label: 'Keamanan Data', val: 'Terenkripsi', icon: '🔒' },
                    { label: 'Transparansi', val: 'Real-time', icon: '📊' },
                    { label: 'Jamaah Aktif', val: '1.2k+', icon: '👥' },
                    { label: 'Layanan Digital', val: 'Cloud Hub', icon: '☁️' }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-6 hover:bg-white/10 transition-all duration-300 group/stat">
                      <div className="text-xl sm:text-2xl mb-2 sm:mb-3 group-hover/stat:scale-110 transition duration-300">{stat.icon}</div>
                      <div className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.label}</div>
                      <div className="text-xs sm:text-sm font-black text-white">{stat.val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>

      </div>

      {/* Footer Info Hub */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <button 
          onClick={() => onNavigate('tentang')}
          className="flex items-center gap-3 px-6 py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-100 transition"
        >
          Pelajari Sistem Digital Kami
          <ChevronRight className="h-3 w-3" />
        </button>
        <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-full">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">STATUS: ONLINE</span>
        </div>
      </motion.div>
    </div>
  );
}
