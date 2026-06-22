import { motion } from 'motion/react';
import { 
  Bell, 
  Database,
  ArrowRight,
  MapPin,
  Info,
  Calendar, 
  TrendingUp, 
  Heart, 
} from 'lucide-react';
import { PrayerTime, NotificationLog } from '../types';

interface MasjidDashboardProps {
  prayers: PrayerTime[];
  nextDetails: any;
  logs: NotificationLog[];
  onNavigate: (tab: any) => void;
  isAdmin: boolean;
  onShowLogin: () => void;
}

export default function MasjidDashboard({ 
  prayers, 
  nextDetails, 
  logs, 
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

  return (
    <div className="space-y-8">
      {/* Bento Grid Header / Welcome Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Status Hero Card (8 Cols) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-8 bg-white border border-slate-200 rounded-[3rem] shadow-2xl shadow-slate-200/50 p-8 sm:p-10 relative overflow-hidden flex flex-col justify-between group"
        >
          {/* Subtle background abstract element */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-50 rounded-full blur-3xl opacity-60 z-0 group-hover:scale-110 transition duration-700"></div>
          <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-amber-50 rounded-full blur-3xl opacity-40 z-0 group-hover:scale-110 transition duration-700 delay-100"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-6">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.25em]">Sistem Aktif Real-time</span>
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.1]">
                  Mari Shalat berjamaah <br />
                  <span className="text-emerald-600">tepat waktu.</span>
                </h2>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <div className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl flex items-center gap-3 shadow-xl">
                  <Calendar className="h-4 w-4 text-amber-400" />
                  <span className="text-xs font-black uppercase tracking-wider">{dateFormatted}</span>
                </div>
                <div className="px-5 py-2.5 bg-white border border-slate-200 rounded-2xl flex items-center gap-2 shadow-sm">
                  <MapPin className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700">Parepare, Sulawesi Selatan</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-64 bg-slate-950 text-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group/next">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 to-transparent opacity-0 group-hover/next:opacity-100 transition duration-500"></div>
              <span className="text-[9px] font-black text-amber-400 uppercase tracking-[0.3em] mb-3 relative z-10">Jadwal Berikutnya</span>
              {nextDetails ? (
                <>
                  <h3 className="text-2xl font-black mb-1 relative z-10 tracking-tight">{nextDetails.prayer.name}</h3>
                  <div className="text-5xl font-black tracking-tighter my-2 font-mono text-white relative z-10">
                    {nextDetails.prayer.time}
                  </div>
                  <div className="mt-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full relative z-10">
                    <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">{nextDetails.countdownPrayer}</span>
                  </div>
                </>
              ) : (
                <div className="animate-pulse flex flex-col items-center space-y-3 relative z-10">
                  <div className="h-8 w-24 bg-white/10 rounded-xl"></div>
                  <div className="h-12 w-36 bg-white/10 rounded-xl"></div>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 mt-12 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 border-t border-slate-100 pt-8">
            {prayers.map((p) => {
              const isNext = nextDetails?.prayer?.id === p.id;
              return (
                <button 
                  key={p.id} 
                  onClick={() => {
                    const el = document.getElementById('config_center');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`flex flex-col items-center p-3 sm:p-4 rounded-3xl transition-all duration-300 border group/p relative ${
                    isNext 
                      ? 'bg-emerald-600 border-emerald-500 shadow-2xl shadow-emerald-200 scale-105 z-20 -translate-y-2' 
                      : 'bg-white border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 hover:-translate-y-1'
                  }`}
                >
                  <span className="text-xl sm:text-2xl mb-1.5 group-hover/p:scale-125 transition duration-300">{p.icon}</span>
                  <span className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isNext ? 'text-emerald-100' : 'text-slate-400'}`}>{p.name}</span>
                  <span className={`text-sm font-black font-mono tracking-tighter ${isNext ? 'text-white' : 'text-slate-800'}`}>{p.time}</span>
                  {isNext && (
                    <motion.div 
                      layoutId="pulse"
                      className="absolute inset-0 bg-emerald-400/20 rounded-3xl animate-ping -z-10"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Quick Navigation Panel (4 Cols) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4"
        >
          <button 
            onClick={() => onNavigate('profil')}
            className="group bg-white border border-slate-200 rounded-[2.5rem] p-8 text-slate-900 flex items-center gap-6 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 text-left relative overflow-hidden"
          >
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 flex items-center justify-center text-3xl group-hover:scale-110 transition duration-500 shrink-0">🏛️</div>
            <div className="space-y-1">
              <h4 className="font-black text-lg tracking-tight">Profil Masjid</h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Struktur organisasi & sejarah Masjid Al Abrar.</p>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('donasi')}
            className="group bg-amber-400 rounded-[2.5rem] p-8 text-slate-950 flex items-center gap-6 hover:bg-amber-500 hover:shadow-xl hover:shadow-amber-200/50 transition-all duration-300 text-left relative overflow-hidden"
          >
            <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 group-hover:scale-110 transition duration-500">
               <Heart className="w-32 h-32" />
            </div>
            <div className="w-16 h-16 rounded-3xl bg-white/40 backdrop-blur-md flex items-center justify-center text-3xl mb-0 relative z-10 shrink-0">💝</div>
            <div className="space-y-1 relative z-10">
              <h4 className="font-black text-lg tracking-tight">Sedekah Jariyah</h4>
              <p className="text-[11px] text-amber-950/70 font-bold leading-relaxed">Salurkan donasi terbaik Anda secara online.</p>
            </div>
          </button>

          <button 
            className="bg-slate-950 rounded-[2.5rem] p-8 text-white flex items-center justify-between group hover:bg-slate-900 transition-all duration-300 shadow-xl shadow-slate-200/50"
            onClick={() => onNavigate('keuangan')}
          >
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-3xl bg-white/10 flex items-center justify-center text-3xl group-hover:rotate-6 transition duration-500">📊</div>
              <div>
                <h4 className="font-black text-lg tracking-tight">Transparansi</h4>
                <p className="text-[11px] text-slate-400 font-medium italic">Update kas masjid harian.</p>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:translate-x-1 transition duration-300">
              <ArrowRight className="h-5 w-5 text-emerald-400" />
            </div>
          </button>
        </motion.div>

      </div>

      {/* Secondary Dashboard Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        
        {/* Community Insight Bento (Log Feed) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-5 bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-6 flex flex-col"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-emerald-600" />
              Notifikasi Sistem
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktivitas Terakhir</span>
          </div>
          
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[320px] pr-2">
            {logs.slice(0, 5).map((log) => (
              <button 
                key={log.id} 
                onClick={() => {
                  const el = document.getElementById('config_center');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full text-left flex gap-4 p-3 hover:bg-slate-50 rounded-2xl transition border border-transparent hover:border-slate-100 group/l"
              >
                <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg ${
                   log.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                   log.type === 'alert' ? 'bg-red-50 text-red-600' :
                   'bg-blue-50 text-blue-600'
                }`}>
                  {log.type === 'success' ? '✅' : log.type === 'alert' ? '🔔' : '🔵'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h5 className="font-bold text-xs text-slate-800 truncate group-hover/l:text-emerald-700 transition">{log.title}</h5>
                    <span className="text-[9px] font-mono text-slate-400">{log.timestamp}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-2">{log.message}</p>
                </div>
              </button>
            ))}
            {logs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                <span className="text-3xl mb-2">⏳</span>
                <p className="text-xs font-bold">Belum ada riwayat</p>
              </div>
            )}
          </div>

          <button 
            onClick={() => {
              const el = document.getElementById('config_center');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="group/log w-full py-3 bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-slate-600 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2"
          >
            Lihat Semua Riwayat & Konfigurasi
            <ArrowRight className="h-3.5 w-3.5 group-hover/log:translate-x-1 transition" />
          </button>
        </motion.div>

        {/* Integration Stats Bento */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-7 grid grid-cols-2 gap-6"
        >
          <button 
            onClick={() => onNavigate('keuangan')}
            className="group/fin bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 text-left"
          >
            <div className="flex items-center justify-between">
              <TrendingUp className="h-6 w-6 text-emerald-600 group-hover/fin:scale-110 transition" />
              <div className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[9px] font-black rounded-full">LIVE DATA</div>
            </div>
            <div className="mt-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Kas Operasional</span>
              <div className="text-2xl font-black text-slate-800 tracking-tighter">Rp 241.500.000</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] font-bold text-emerald-600">+12%</span>
                <span className="text-[10px] text-slate-400 font-medium">Dari bulan lalu</span>
              </div>
            </div>
            <div className="h-12 w-full bg-slate-50 rounded-xl mt-4 flex items-end gap-1 p-2 overflow-hidden group-hover/fin:bg-emerald-50 transition">
               {[40, 70, 45, 90, 65, 80, 55, 95, 75, 85].map((h, i) => (
                 <div key={i} className="flex-1 bg-emerald-200 rounded-sm group-hover/fin:bg-emerald-400 transition" style={{ height: `${h}%` }}></div>
               ))}
            </div>
          </button>

          <div className="bg-emerald-950 text-white rounded-[2.5rem] p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute right-0 bottom-0 translate-x-1/2 translate-y-1/2 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex items-center justify-between">
               <Database className="h-6 w-6 text-emerald-400" />
               <div className="px-2 py-0.5 bg-emerald-400/20 text-emerald-400 text-[9px] font-black rounded-full border border-emerald-400/30">INKY CLOUD</div>
            </div>
            <div className="relative z-10 mt-4">
              <h4 className="text-sm font-bold leading-snug">Integritas Sistem &<br />Keamanan Data</h4>
              <p className="text-[10px] text-emerald-300/70 mt-2 leading-relaxed">
                Database terenkripsi & sinkronisasi real-time antar perangkat pengelola masjid.
              </p>
            </div>
            {!isAdmin && (
              <button 
                onClick={onShowLogin}
                className="relative z-10 mt-4 py-2.5 bg-white text-emerald-950 font-black text-[10px] rounded-xl hover:bg-emerald-100 transition shadow-xl"
              >
                🔐 LOGIN SISTEM ADMIN
              </button>
            )}
          </div>

          <div className="col-span-2 bg-gradient-to-br from-emerald-800 to-emerald-900 border border-emerald-700 rounded-[2.5rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 text-white relative overflow-hidden group">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
            <div className="flex items-center gap-5 relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-[1.5rem] flex items-center justify-center text-3xl group-hover:scale-110 transition">🏷️</div>
              <div>
                <h4 className="font-bold text-lg">Layanan Inventaris Masjid</h4>
                <p className="text-xs text-emerald-200/80">Kelola & pantau aset fisik masjid secara digital.</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('inventaris')}
              className="px-6 py-3 bg-white text-emerald-950 font-black text-xs rounded-2xl hover:bg-emerald-50 transition relative z-10 shadow-lg"
            >
              Kelola Inventaris
            </button>
          </div>
        </motion.div>

      </div>

      {/* Footer Info Hub */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-slate-50 border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
             <Info className="h-5 w-5 text-slate-400" />
          </div>
          <p className="text-[11px] text-slate-500 font-medium max-w-lg text-center md:text-left">
            Sistem Masjid Jami Al Abrar ini merupakan platform terintegrasi untuk mengelola seluruh aspek operasional masjid dari penjadwalan shalat hingga transparansi keuangan publik.
          </p>
        </div>
        <div className="flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sistem Aktif & Terpantau</span>
        </div>
      </motion.div>
    </div>
  );
}
