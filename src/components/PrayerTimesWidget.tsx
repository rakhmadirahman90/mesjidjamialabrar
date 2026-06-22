import { useEffect, useState, useMemo, useRef } from 'react';
import { Clock, MapPin, Play, Pause, Volume2, VolumeX, Music, HelpCircle, Info } from 'lucide-react';
import { cn, formatCurrency } from '@/src/lib/utils';
import { format, differenceInSeconds, parse, isAfter, addDays, subMinutes } from 'date-fns';
import { id } from 'date-fns/locale';
import { LocalDb, AudioConfig } from '../lib/localStorageDb';

interface PrayerTimeLocal {
  id: number;
  name: string;
  time: string;
  rakaat?: number;
}

export default function PrayerTimesWidget() {
  const [prayers, setPrayers] = useState<PrayerTimeLocal[]>([]);
  const [audioConfig, setAudioConfig] = useState<AudioConfig>(LocalDb.getAudioConfig());
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Audio playback state
  const [currentTrackType, setCurrentTrackType] = useState<'idle' | 'quran' | 'song' | 'azan'>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>("Sistem Audio Siaga Otomatis");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load data and handle realtime updates
  const loadData = () => {
    setPrayers(LocalDb.getPrayerTimes());
    setAudioConfig(LocalDb.getAudioConfig());
  };

  useEffect(() => {
    loadData();
    
    // Listen to "db-update" custom event for instant realtime reactive reloading
    const handleUpdate = (e: any) => {
      loadData();
    };
    
    window.addEventListener('db-update', handleUpdate);
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => {
      window.removeEventListener('db-update', handleUpdate);
      clearInterval(timer);
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Format prayers with additional metadata (Rakaat)
  const prayerSchedule = useMemo(() => {
    return prayers.map(p => {
      let rakaatCount = 4;
      if (p.name.toLowerCase() === 'subuh') rakaatCount = 2;
      else if (p.name.toLowerCase() === 'maghrib') rakaatCount = 3;
      else if (p.name.toLowerCase() === 'terbit' || p.name.toLowerCase() === 'syuruq') rakaatCount = 0;
      
      return {
        ...p,
        rakaat: rakaatCount
      };
    });
  }, [prayers]);

  // Find upcoming prayer time
  const activeNext = useMemo(() => {
    if (!prayerSchedule.length) return null;
    const nowStr = format(currentTime, 'HH:mm:ss');
    
    for (const p of prayerSchedule) {
      const pTimeStr = `${p.time}:00`;
      if (pTimeStr > nowStr) return p;
    }
    return prayerSchedule[0]; // Next day's first prayer (Subuh)
  }, [prayerSchedule, currentTime]);

  // Calculate countdown
  const countdownDetails = useMemo(() => {
    if (!activeNext) return { text: '', secondsLeft: 999999 };
    
    let prayerTime = parse(activeNext.time, 'HH:mm', currentTime);
    if (isAfter(currentTime, prayerTime)) {
      prayerTime = addDays(prayerTime, 1);
    }

    const diff = differenceInSeconds(prayerTime, currentTime);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;

    const formatted = `${h > 0 ? `${h}:` : ''}${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return {
      text: formatted,
      secondsLeft: diff
    };
  }, [activeNext, currentTime]);

  const countdown = countdownDetails.text;
  const secondsToNext = countdownDetails.secondsLeft;

  // Audio Engine: Triggering automatically
  // 15 minutes before is 900 seconds. T-15 to T-10 is quran (900s to 600s left)
  // 10 minutes before is 600 seconds. T-10 to T-0 is song (600s to 0s left)
  // T-0 is azan
  useEffect(() => {
    if (!activeNext || isMuted || audioConfig.isMuted) {
      if (isPlaying && (currentTrackType === 'quran' || currentTrackType === 'song' || currentTrackType === 'azan')) {
        // Muted globally, or locally
        stopAudio();
      }
      return;
    }

    // Determine what should be playing according to the schedule
    let targetType: 'idle' | 'quran' | 'song' | 'azan' = 'idle';
    let targetUrl = '';
    let volumeLevel = 1.0;
    let label = '';

    // Quran: T-15 to T-10 (seconds to Next between 900 and 601)
    if (secondsToNext <= 900 && secondsToNext > 600) {
      targetType = 'quran';
      targetUrl = audioConfig.quranUrl;
      volumeLevel = audioConfig.quranVolume;
      label = "🔊 T-15: Otomatis Melantunkan Murottal Al-Qur'an";
    }
    // Song/Tarhim: T-10 to T-0 (seconds to Next between 600 and 1)
    else if (secondsToNext <= 600 && secondsToNext > 0) {
      targetType = 'song';
      targetUrl = audioConfig.songUrl;
      volumeLevel = audioConfig.songVolume;
      label = "🔊 T-10: Shalawat Tarhim Masjid Jami Al-Abrar";
    }
    // Azan: Exactly on prayer time (seconds to Next is 0, or just struck 0. We'll play it for 2 minutes or till finish if it is 0/nearly 0)
    else if (secondsToNext === 0 || (secondsToNext > 86340)) { // 86340 is 24h - 10px buffer
      // Only do azan if it's not a sunrise time 'Terbit'
      if (activeNext.name.toLowerCase() !== 'terbit') {
        targetType = 'azan';
        targetUrl = audioConfig.azanUrl;
        volumeLevel = audioConfig.azanVolume;
        label = `🕌 Adzan ${activeNext.name} Berkumandang`;
      }
    }

    if (targetType !== 'idle') {
      setStatusMessage(label);
      if (currentTrackType !== targetType) {
        playTrack(targetUrl, targetType, volumeLevel);
      }
    } else {
      setStatusMessage("Sistem Audio Siaga Otomatis");
      if (currentTrackType !== 'idle') {
        stopAudio();
      }
    }
  }, [secondsToNext, activeNext, isMuted, audioConfig]);

  const playTrack = (url: string, type: 'idle' | 'quran' | 'song' | 'azan', vol: number) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      const audioObj = new Audio(url);
      audioObj.volume = isMuted ? 0 : vol;
      audioObj.loop = type !== 'azan'; // Loop Quran and Tarhim, play Adzan once
      
      audioRef.current = audioObj;
      setCurrentTrackType(type);
      setIsPlaying(true);
      
      audioObj.play().catch(err => {
        console.warn("Autoplay blocked. User physical interaction needed:", err);
        setStatusMessage("⚠️ Audio otomatis terhambat peramban browser. Silakan klik tombol 'Aktifkan Suara'!");
      });
    } catch (e) {
      console.error("Audio play error:", e);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setCurrentTrackType('idle');
    setIsPlaying(false);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.volume = nextMuted ? 0 : 0.8;
    }
  };

  // Manual Trigger testing play
  const triggerManualPlay = (type: 'quran' | 'song' | 'azan') => {
    let url = '';
    let vol = 0.8;
    if (type === 'quran') { url = audioConfig.quranUrl; vol = audioConfig.quranVolume; }
    if (type === 'song') { url = audioConfig.songUrl; vol = audioConfig.songVolume; }
    if (type === 'azan') { url = audioConfig.azanUrl; vol = audioConfig.azanVolume; }
    
    if (currentTrackType === type && isPlaying) {
      stopAudio();
      setStatusMessage("Manual dimatikan");
    } else {
      playTrack(url, type, vol);
      const labels = {
        quran: "Mendengarkan Murottal Al-Qur'an (Manual)",
        song: "Mendengarkan Shalawat Tarhim Masjid (Manual)",
        azan: "Mendengarkan Lantunan Adzan Jami (Manual)"
      };
      setStatusMessage(labels[type]);
    }
  };

  return (
    <div className="bg-forest text-white rounded-3xl shadow-xl p-8 relative overflow-hidden border border-emerald-900 group">
      {/* Decorative patterns */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Clock className="w-64 h-64 rotate-12" />
      </div>
      <div className="absolute top-[-20%] left-[-10%] w-64 h-64 bg-gold/10 blur-[100px] rounded-full" />
      
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-gold/20 rounded-lg">
                <Clock className="h-5 w-5 text-gold" />
              </div>
              <h3 className="font-bold tracking-tight text-xl uppercase font-sans">Jadwal Waktu Shalat</h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-cream/70 font-sans">
              <MapPin className="h-3.5 w-3.5 text-gold" />
              <span>Jl jend Ahmad Yani Km 5, Lapadde, Parepare, Sulsel</span>
            </div>
          </div>

          <div className="text-right flex flex-col items-end">
            <div className="text-4xl font-mono font-bold tracking-tighter text-white/90">
              {format(currentTime, 'HH:mm:ss')}
            </div>
            <div className="text-xs text-gold font-bold uppercase tracking-widest mt-1">
              {format(currentTime, 'EEEE, d MMMM yyyy', { locale: id })}
            </div>
          </div>
        </div>

        {/* Prayers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {prayerSchedule.map((p) => {
            const isActive = activeNext?.name === p.name;
            const rakaatText = p.rakaat && p.rakaat > 0 ? `${p.rakaat} Rakaat` : 'Syuruq';
            
            return (
              <div 
                key={p.name} 
                className={cn(
                  "relative flex flex-col items-center justify-center p-5 rounded-2xl transition-all duration-300",
                  isActive 
                    ? "bg-gold text-forest shadow-xl scale-105 z-20 font-bold border-2 border-white/10" 
                    : "bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-900"
                )}
              >
                <span className={cn(
                  "text-[10px] uppercase font-bold tracking-widest mb-2 transition-colors duration-300",
                  isActive ? "text-forest/70" : "text-cream/50"
                )}>
                  {p.name}
                </span>
                
                <span className="text-2xl font-bold tracking-tight leading-none mb-1 font-mono">
                  {p.time}
                </span>

                <span className={cn(
                  "text-[9px] font-medium tracking-wide border px-1.5 py-0.5 rounded-full",
                  isActive ? "border-forest/20 text-forest/75 bg-forest/5" : "border-white/10 text-cream/40"
                )}>
                  {rakaatText}
                </span>

                {isActive && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-terracotta text-white text-[9px] font-extrabold px-3 py-1 rounded-full border border-gold shadow-lg whitespace-nowrap animate-bounce leading-none">
                    SELANJUTNYA: {countdown}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Real-time automated Adzan Audio engine interface */}
        <div className="bg-emerald-950/60 rounded-2xl p-5 border border-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-12 h-12 bg-gold/10 rounded-xl flex items-center justify-center border border-gold/30 relative text-gold">
              <Music className={cn("h-6 w-6", isPlaying && "animate-pulse")} />
              {isPlaying && (
                <span className="absolute top-1 right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-terracotta"></span>
                </span>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gold">Sistem Audio Digital Masjid</p>
              <h4 className="text-sm font-bold text-white/90 line-clamp-1 mt-0.5">{statusMessage}</h4>
              <p className="text-[10px] text-cream/50 font-medium mt-0.5">Auto-play: T-15 Murottal • T-10 Tarhim • T-0 Adzan</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Test Previews */}
            <div className="flex gap-1.5 mr-2">
              <button 
                onClick={() => triggerManualPlay('quran')}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all border",
                  currentTrackType === 'quran' && isPlaying 
                    ? "bg-cream text-forest border-cream" 
                    : "bg-white/5 text-gold border-white/10 hover:bg-white/10"
                )}
                title="Murottal Test"
              >
                Murottal
              </button>
              <button 
                onClick={() => triggerManualPlay('song')}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all border",
                  currentTrackType === 'song' && isPlaying 
                    ? "bg-cream text-forest border-cream" 
                    : "bg-white/5 text-gold border-white/10 hover:bg-white/10"
                )}
                title="Tarhim Test"
              >
                Tarhim
              </button>
              <button 
                onClick={() => triggerManualPlay('azan')}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all border",
                  currentTrackType === 'azan' && isPlaying 
                    ? "bg-cream text-forest border-cream" 
                    : "bg-white/5 text-gold border-white/10 hover:bg-white/10"
                )}
                title="Adzan Test"
              >
                Adzan
              </button>
            </div>

            <button 
              onClick={toggleMute}
              className={cn(
                "p-3 rounded-xl transition-all shadow-md",
                isMuted || audioConfig.isMuted
                  ? "bg-red-600 hover:bg-red-500 text-white" 
                  : "bg-gold hover:bg-gold/90 text-forest"
              )}
              title={isMuted ? "Matikan Mute" : "Aktifkan Mute"}
            >
              {isMuted || audioConfig.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between items-center text-[10px] text-cream/40 uppercase tracking-widest px-1">
        <span>Metode: Kemenag RI (Kota Parepare)</span>
        <span className="flex items-center gap-1">
          <Info className="h-3 w-3 text-gold/60" /> Pengeras Suara Aktif Otomatis
        </span>
      </div>
    </div>
  );
}
