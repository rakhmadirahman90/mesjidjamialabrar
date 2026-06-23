import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Database,
  Calendar, 
  TrendingUp, 
  Heart, 
  MapPin,
  Sun,
  CloudSun,
  Moon,
  CloudMoon
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
  onNavigate,
  isAdmin,
  onShowLogin
}: MasjidDashboardProps) {
  
  // States for ticking countdown and dates
  const [timeLeft, setTimeLeft] = useState('00:00:00');
  const [targetName, setTargetName] = useState('SUBUH');
  const [currentDateFormatted, setCurrentDateFormatted] = useState('23 Jun 2026');
  const [hijriFormatted, setHijriFormatted] = useState('8 Muḥarram 1448 H');


  useEffect(() => {
    // Format Gregorian date as "23 Jun 2026"
    const today = new Date();
    const day = today.getDate();
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const month = monthsShort[today.getMonth()];
    const year = today.getFullYear();
    setCurrentDateFormatted(`${day} ${month} ${year}`);

    // Simple robust Hijri estimation around June 2026 matching exact June 23, 2026 = 8 Muharram 1448 H
    const refDate = new Date(2026, 5, 23); // June is 5 in JS Date
    const diffTime = today.getTime() - refDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    let hijriDay = 8 + diffDays;
    let hijriMonthIdx = 0; // Muharram
    let hijriYear = 1448;

    const hijriMonths = [
      'Muḥarram', 'Ṣafar', 'Rabī‘ul Awwal', 'Rabī‘uts Tsānī', 
      'Jumādil Ūlā', 'Jumādits Tsānī', 'Rajab', 'Sya‘bān', 
      'Ramaḍān', 'Syawwāl', 'Dzulqa‘dah', 'Dzulhijjah'
    ];

    while (hijriDay > 30) {
      const daysInMonth = (hijriMonthIdx % 2 === 0) ? 30 : 29;
      if (hijriDay > daysInMonth) {
        hijriDay -= daysInMonth;
        hijriMonthIdx = (hijriMonthIdx + 1) % 12;
        if (hijriMonthIdx === 0) hijriYear++;
      } else {
        break;
      }
    }

    while (hijriDay <= 0) {
      hijriMonthIdx = (hijriMonthIdx - 1 + 12) % 12;
      if (hijriMonthIdx === 11) hijriYear--;
      const daysInMonth = (hijriMonthIdx % 2 === 0) ? 30 : 29;
      hijriDay += daysInMonth;
    }

    setHijriFormatted(`${hijriDay} ${hijriMonths[hijriMonthIdx]} ${hijriYear} H`);
  }, []);

  // Recalculating ticker countdown
  useEffect(() => {
    const mainKeys = [
      { id: 'shubuh', name: 'SUBUH' },
      { id: 'dzuhur', name: 'DZUHUR' },
      { id: 'ashar', name: 'ASHAR' },
      { id: 'maghrib', name: 'MAGHRIB' },
      { id: 'isya', name: 'ISYA' }
    ];

    const timer = setInterval(() => {
      const now = new Date();
      let nextP = null;
      let minDiff = Infinity;

      mainKeys.forEach(mk => {
        const pObj = prayers.find(p => p.id === mk.id);
        if (pObj) {
          const [h, m] = pObj.time.split(':').map(Number);
          const pDate = new Date(now);
          pDate.setHours(h, m, 0, 0);
          if (pDate.getTime() <= now.getTime()) {
            pDate.setDate(pDate.getDate() + 1);
          }
          const diff = pDate.getTime() - now.getTime();
          if (diff < minDiff) {
            minDiff = diff;
            nextP = mk;
          }
        }
      });

      if (nextP) {
        setTargetName((nextP as any).name);
        const totalSecs = Math.floor(minDiff / 1000);
        const h = String(Math.floor(totalSecs / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, '0');
        const s = String(totalSecs % 60).padStart(2, '0');
        setTimeLeft(`${h}:${m}:${s}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [prayers]);

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

  // Map 5 main prayer keys for visual layout matching screenshot 3
  const FIVE_PRAYERS = [
    { id: 'shubuh', name: 'SUBUH', label: 'SUBUH' },
    { id: 'dzuhur', name: 'DZUHUR', label: 'DZUHUR' },
    { id: 'ashar', name: 'ASHAR', label: 'ASHAR' },
    { id: 'maghrib', name: 'MAGHRIB', label: 'MAGHRIB' },
    { id: 'isya', name: 'ISYA', label: 'ISYA' }
  ];

  const getPrayerIcon = (id: string, isActive: boolean) => {
    const iconClass = `h-7 w-7 ${isActive ? 'text-white' : 'text-emerald-450'} transition`;
    switch (id) {
      case 'shubuh':
        return <CloudMoon className={iconClass} />;
      case 'dzuhur':
        return <Sun className={iconClass} />;
      case 'ashar':
        return <CloudSun className={iconClass} />;
      case 'maghrib':
        return <Moon className={iconClass} />;
      case 'isya':
        return (
          <div className="relative">
            <Moon className={iconClass} />
            <span className={`absolute -top-1.5 -right-1.5 text-[9px] ${isActive ? 'text-white' : 'text-emerald-400'}`}>★</span>
          </div>
        );
      default:
        return <Sun className={iconClass} />;
    }
  };


  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Waktu Sholat Wilayah Parepare - Perfect reconstruction of Image 3 */}
      <div className="w-full relative select-none">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-[#031d14] rounded-[2.5rem] py-12 px-6 overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl border border-[#0d3c2a] relative"
        >
          {/* Elegant repeating Islamic geometric patterns backdrop */}
          <div className="absolute inset-0 opacity-[0.035] pointer-events-none" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cpath d='M30 0l30 30-30 30L0 30zm0 10L10 30l20 20 20-20z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat'
          }}></div>
          
          {/* Golden radial background overlay aura */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[35rem] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

          <div className="relative z-10 w-full flex flex-col items-center">
            
            {/* Title with yellow gold glow line */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-wide font-display uppercase">
              Waktu Sholat wilayah Parepare
            </h2>
            <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent bg-amber-500 mx-auto mt-2.5 mb-5 rounded-full shadow-[0_0_8px_#d4af37]"></div>

            {/* Location marker info pill - Custom Cimahi / Parepare reference */}
            <div className="flex items-center gap-2 text-emerald-200/70 text-xs sm:text-sm font-black tracking-widest uppercase mb-6 bg-emerald-950/40 border border-emerald-500/10 px-4 py-1.5 rounded-full">
              <MapPin className="h-4 w-4 text-emerald-400" />
              <span>Parepare</span>
            </div>

            {/* Capsule Ticking CountDown Badge */}
            <div className="bg-[#0b3c2a]/60 border border-emerald-500/15 backdrop-blur-md rounded-[2.5rem] px-12 py-5 max-w-sm w-full mx-auto shadow-inner mb-6 flex flex-col items-center">
              <span className="text-[10px] font-black tracking-[0.25em] text-[#abccbe] uppercase mb-1">
                MENUJU {targetName}
              </span>
              <div className="text-3xl sm:text-4.5xl font-black tracking-widest font-mono text-white">
                {timeLeft}
              </div>
            </div>

            {/* Dates: Gregorian and Hijri aligned */}
            <p className="text-emerald-100/60 text-xs font-black tracking-wider uppercase mb-1">
              {currentDateFormatted}
            </p>
            <p className="text-amber-400 text-lg sm:text-xl font-black tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
              {hijriFormatted}
            </p>

            {/* Prayer Cards Grid Horizontally (Exact replica of Image 3) */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6 w-full mt-11 max-w-4xl relative">
              {FIVE_PRAYERS.map((fp) => {
                const prayerValue = prayers.find(p => p.id === fp.id);
                const displayTime = prayerValue ? prayerValue.time : '00:00';
                const isActive = targetName === fp.name;

                return (
                  <button
                    key={fp.id}
                    onClick={() => onNavigate('jadwal')}
                    className={`group transition-all duration-500 flex flex-col justify-between items-center rounded-3xl p-5 min-h-[145px] hover:-translate-y-1 ${
                      isActive 
                        ? 'bg-gradient-to-b from-amber-500 via-amber-600 to-yellow-600 border-0 shadow-[0_15px_30px_rgba(245,158,11,0.35)] scale-105 z-10' 
                        : 'bg-[#06241a]/60 backdrop-blur-md border border-white/5 hover:border-white/12 text-white'
                    }`}
                  >
                    {/* Icon aligned at top */}
                    <div className="mb-2">
                      {getPrayerIcon(fp.id, isActive)}
                    </div>

                    {/* Prayer key label centered */}
                    <span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-[0.25em] mb-2 ${
                      isActive ? 'text-white' : 'text-emerald-200/50 group-hover:text-emerald-100'
                    }`}>
                      {fp.label}
                    </span>

                    {/* Display exact sholat time at bottom */}
                    <span className={`font-black font-mono tracking-tight text-center ${
                      isActive ? 'text-white text-2xl drop-shadow-md' : 'text-white text-xl'
                    }`}>
                      {displayTime}
                    </span>
                  </button>
                );
              })}
            </div>

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
