import { motion } from 'motion/react';
import { 
  Database,
  Calendar, 
  TrendingUp, 
  Heart, 
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Dynamic Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Main Status Hero Card (Full Cols) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-12 bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-8 relative overflow-hidden group"
        >
          {/* Decorative background */}
          <div className="absolute -right-24 -top-24 w-[24rem] h-[24rem] bg-emerald-50 rounded-full blur-[100px] opacity-70 z-0 group-hover:scale-110 transition duration-1000"></div>
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700">
                <Sparkles className="h-3 w-3 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Pusat Layanan Digital</span>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  Ibadah Nyaman <br />
                  <span className="text-emerald-600">Terorganisir.</span>
                </h2>
                <p className="text-slate-500 text-sm sm:text-base font-medium leading-relaxed">
                  Mengelola ekosistem Masjid Jami Al Abrar dengan transparansi tinggi.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="px-5 py-2 bg-slate-900 text-white rounded-xl flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{dateFormatted}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center md:justify-end">
              <div className="w-full max-w-sm bg-slate-950 text-white p-8 sm:p-10 rounded-3xl shadow-xl border border-white/10 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent"></div>
                
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.4em] mb-4 relative z-10">Jadwal Terdekat</span>
                {nextDetails ? (
                  <>
                    <h3 className="text-2xl sm:text-3xl font-black mb-1 relative z-10 tracking-tight">{nextDetails.prayer.name}</h3>
                    <div className="text-5xl font-black tracking-tighter my-3 font-mono text-white relative z-10">
                      {nextDetails.prayer.time}
                    </div>
                    <div className="px-5 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full relative z-10 backdrop-blur-md">
                      <span className="text-[11px] text-emerald-300 font-black uppercase tracking-[0.2em]">{nextDetails.countdownPrayer}</span>
                    </div>
                  </>
                ) : (
                  <div className="animate-pulse flex flex-col items-center space-y-4">
                    <div className="h-24 w-full bg-white/5 rounded-2xl"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-10 border-t border-slate-100 pt-8 grid grid-cols-2 lg:grid-cols-5 gap-4">
            {prayers.map((p) => {
              const isNext = nextDetails?.prayer?.id === p.id;
              return (
                <button 
                  key={p.id} 
                  onClick={() => onNavigate('jadwal')}
                  className={`flex flex-col items-center p-4 rounded-2xl transition-all duration-300 border ${
                    isNext 
                      ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg' 
                      : 'bg-white border-slate-100 hover:bg-emerald-50'
                  }`}
                >
                  <span className="text-xl mb-1">{p.icon}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${isNext ? 'text-emerald-100' : 'text-slate-400'}`}>{p.name}</span>
                  <span className={`text-sm font-black font-mono tracking-tighter ${isNext ? 'text-white' : 'text-slate-800'}`}>{p.time}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Main Services Section */}
      <section className="space-y-6">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight px-1">Layanan Prioritas</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mainServices.map((service, idx) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * idx }}
              onClick={() => onNavigate(service.id)}
              className="group bg-white border border-slate-200 rounded-3xl p-6 text-left hover:border-emerald-300 hover:shadow-lg transition-all"
            >
              <div className={`w-12 h-12 rounded-2xl ${service.color} flex items-center justify-center mb-6 group-hover:scale-105 transition`}>
                {service.icon}
              </div>
              <h4 className="font-black text-lg text-slate-900 tracking-tight mb-2">{service.title}</h4>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {service.desc}
              </p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Live Video Streaming Section */}
      <section className="space-y-4 pt-4">
        <h3 className="text-xl font-black text-slate-900 tracking-tight px-1">Siaran Langsung</h3>
        <div className="bg-slate-950 rounded-3xl p-2 sm:p-3 border border-slate-800 shadow-xl">
           <div className="relative pt-[56.25%] rounded-2xl overflow-hidden bg-slate-900">
             <iframe
               className="absolute top-0 left-0 w-full h-full"
               src="https://www.youtube.com/embed/dQw4w9WgXcQ"
               title="Live Streaming Masjid"
               frameBorder="0"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               allowFullScreen
             ></iframe>
           </div>
           <p className="text-[10px] text-slate-400 font-mono p-3 uppercase tracking-widest text-center">
             Status: Offline / Standby
           </p>
        </div>
      </section>

      {/* Admin/Login Section */}
      <div className="pt-6">
        {!isAdmin && (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h4 className="text-lg font-black text-slate-900">Akses Pengurus</h4>
              <p className="text-xs text-slate-500 font-medium">Hanya untuk pengurus resmi masjid dengan otorisasi PIN.</p>
            </div>
            <button 
              onClick={onShowLogin}
              className="px-6 py-3 bg-slate-900 text-white font-black text-xs rounded-xl hover:bg-slate-800 transition active:scale-95"
            >
              LOGIN PENGURUS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
