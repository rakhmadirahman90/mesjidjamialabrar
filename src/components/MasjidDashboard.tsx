import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Database,
  Calendar, 
  Heart, 
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
}

export default function MasjidDashboard({ 
  prayers, 
  onNavigate
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
        const pObj = (prayers || []).find(p => p.id === mk.id);
        if (pObj && pObj.time && pObj.time.includes(':')) {
          const [h, m] = pObj.time.split(':').map(Number);
          const pDate = new Date(now);
          if (!isNaN(h) && !isNaN(m)) {
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
      desc: 'Informasi waktu shalat, pengajian rutin, dan agenda kegiatan masjid lainnya.', 
      icon: <Calendar className="w-6 h-6" />, 
      color: 'bg-emerald-50 text-emerald-600'
    },
    { 
      id: 'donasi', 
      title: 'Sedekah Digital', 
      desc: 'Saluran donasi aman, transparan, dan realtime untuk kemakmuran masjid.', 
      icon: <Heart className="w-6 h-6" />, 
      color: 'bg-rose-50 text-rose-600'
    },
    { 
      id: 'profil', 
      title: 'Tentang Masjid', 
      desc: 'Mengenal sejarah, visi misi, serta struktur pengurus Masjid Al Abrar.', 
      icon: <Database className="w-6 h-6" />, 
      color: 'bg-amber-50 text-amber-600'
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
    <div className="w-full py-0.5 sm:py-1 space-y-1 sm:space-y-2">
      {/* Hero Informational Grid - Moved to Top */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 pt-0.5">
        {/* Live Video Streaming Section - Spans 2 columns */}
        <section className="space-y-1.5 lg:col-span-2">
          <h3 className="text-lg font-black text-slate-900 tracking-tight px-1">Siaran Langsung</h3>
          <div className="bg-[#031d14] rounded-[1.8rem] p-1 sm:p-2 border border-emerald-500/10 shadow-xl overflow-hidden group">
             <div className="relative pt-[50%] sm:pt-[45%] rounded-[1.4rem] overflow-hidden bg-emerald-950 flex items-center justify-center border border-white/5 shadow-inner">
               <div className="absolute inset-0 flex flex-col items-center justify-center text-emerald-400/30 group-hover:text-emerald-400/50 transition-colors">
                 <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-700">
                   <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[12px] border-l-current border-b-[6px] border-b-transparent ml-1"></div>
                 </div>
                 <span className="text-[8px] font-black uppercase tracking-[0.3em]">Channel Masjid Jami Al Abrar</span>
               </div>
               
               {/* Live Badge */}
               <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-rose-600 px-2 py-0.5 rounded-full text-[6px] font-black text-white tracking-widest uppercase animate-pulse shadow-lg shadow-rose-600/30">
                 <span className="w-1 h-1 rounded-full bg-white"></span>
                 OFFLINE
               </div>
             </div>
             <div className="flex items-center justify-between px-2.5 py-1 sm:py-1.5">
               <div className="flex flex-col">
                 <p className="text-[7px] text-emerald-500/60 font-black uppercase tracking-[0.2em] mb-0.5">Media Informasi</p>
                 <p className="text-xs sm:text-sm font-black text-white tracking-tight">Kajian Rutin & Shalat Berjamaah</p>
               </div>
               <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/10">
                 <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                 <span className="text-[7px] font-black text-emerald-400 tracking-widest uppercase">Streaming</span>
               </div>
             </div>
          </div>
        </section>

        {/* Sholat Schedule Card */}
        <section className="space-y-1.5">
          <h3 className="text-lg font-black text-slate-900 tracking-tight px-1">Waktu Shalat</h3>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-emerald-600 rounded-[1.8rem] p-3.5 sm:p-4.5 h-[calc(100%-2.25rem)] flex flex-col text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden group"
          >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 p-5 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <Sun className="w-20 h-20" />
            </div>

            <div className="relative z-10 mb-3">
              <div className="flex items-center justify-between mb-0.5">
                <p className="text-[8px] font-black tracking-[0.2em] text-emerald-100 uppercase">Parepare, Sulsel</p>
                <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white/20 rounded-full border border-white/10">
                  <div className="w-1 h-1 rounded-full bg-amber-400 animate-pulse"></div>
                  <span className="text-[8px] font-black tracking-widest uppercase">{targetName}</span>
                </div>
              </div>
              <h4 className="text-xl font-black tracking-tight leading-tight">{hijriFormatted}</h4>
              <p className="text-emerald-100/70 text-[8px] font-bold uppercase tracking-widest">{currentDateFormatted}</p>
            </div>

            {/* Prayer List Vertical - Tighter Spacing */}
            <div className="relative z-10 space-y-1 mb-3">
              {FIVE_PRAYERS.map((fp) => {
                const prayerValue = (prayers || []).find(p => p.id === fp.id);
                const displayTime = prayerValue ? prayerValue.time : '--:--';
                const isActive = targetName === fp.name;

                return (
                  <div 
                    key={fp.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-white text-emerald-600 shadow-md scale-[1.02] border-0' 
                        : 'bg-emerald-700/30 border border-white/5 hover:bg-emerald-700/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={isActive ? 'text-emerald-600' : 'text-emerald-300'}>
                        {React.cloneElement(getPrayerIcon(fp.id, isActive) as React.ReactElement, { className: "w-3.5 h-3.5" })}
                      </div>
                      <span className={`text-[10px] font-black tracking-widest uppercase ${isActive ? 'text-emerald-700' : 'text-emerald-100'}`}>
                        {fp.label}
                      </span>
                    </div>
                    <span className={`font-mono text-xs font-black ${isActive ? 'text-emerald-700' : 'text-white'}`}>
                      {displayTime}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Countdown Banner at bottom */}
            <div className="relative z-10 bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-2 flex items-center justify-between mt-auto">
              <div className="flex flex-col">
                <span className="text-[7px] font-black tracking-[0.2em] text-emerald-100 uppercase leading-none mb-1">Menuju {targetName}</span>
                <span className="text-base font-black tracking-tighter leading-none">{timeLeft}</span>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => onNavigate('jadwal')}
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-md"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              </motion.button>
            </div>
          </motion.div>
        </section>
      </div>

      {/* Main Services Section - Moved below Hero */}
      <section className="space-y-3 pt-0.5">
        <div className="flex flex-col items-center text-center space-y-0.5">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight px-1">Layanan Prioritas</h3>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">Akses cepat ke program utama dan informasi krusial Masjid Jami Al Abrar</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-4">
          {mainServices.map((service, idx) => (
            <motion.button
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ 
                y: -6, 
                scale: 1.01,
                boxShadow: "0 20px 40px -8px rgba(0, 0, 0, 0.08)",
                borderColor: "rgba(16, 185, 129, 0.12)"
              }}
              whileTap={{ scale: 0.98 }}
              transition={{ 
                type: "spring",
                stiffness: 400,
                damping: 30,
                delay: 0.04 * idx 
              }}
              onClick={() => onNavigate(service.id)}
              className="group bg-white border border-slate-150 rounded-[1.8rem] p-4 sm:p-6 text-left transition-all duration-300 flex flex-col justify-between h-full min-h-[220px] shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {service.icon}
              </div>

              <div className="flex flex-col items-start w-full relative z-10">
                {/* Icon Container */}
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl ${service.color} flex items-center justify-center mb-3 shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500`}>
                  {React.cloneElement(service.icon as React.ReactElement, { className: "w-4.5 h-4.5 sm:w-5 sm:h-5" })}
                </div>
                
                {/* Title */}
                <h4 className="font-black text-lg sm:text-xl text-slate-900 tracking-tight mb-1.5">
                  {service.title}
                </h4>
                
                {/* Description */}
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed mb-3">
                  {service.desc}
                </p>
              </div>

              {/* Pill Button */}
              <div className="w-full mt-auto relative z-10">
                <div className="w-full py-2.5 bg-emerald-600 group-hover:bg-emerald-500 text-white font-black text-[10px] tracking-[0.2em] rounded-xl uppercase text-center transition-all duration-300 shadow-md shadow-emerald-600/10">
                  PILIH LAYANAN
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </section>


    </div>
  );
}
