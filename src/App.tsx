import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Settings, 
  RefreshCw, 
  Home,
  Building,
  Heart,
  TrendingUp,
  Package,
  Users
} from 'lucide-react';

import MosqueProfile from './components/MosqueProfile';
import DonationOpen from './components/DonationOpen';
import KeuanganMasjid from './components/KeuanganMasjid';
import InventarisMasjid from './components/InventarisMasjid';
import ManajemenJamaah from './components/ManajemenJamaah';
import ImageSlider from './components/ImageSlider';
import JadwalHub from './components/JadwalHub';
import MasjidDashboard from './components/MasjidDashboard';
import { PrayerTime, NotificationLog, SlideItem } from './types';
import { DEFAULT_SLIDES } from './data/defaultSlides';

// Default prayer times for Parepare, South Sulawesi (or standard Al Abrar Unit 021)
const DEFAULT_PRAYERS: PrayerTime[] = [
  { id: 'imsak', name: 'Imsak', time: '04:35', icon: '🌙', description: 'Batas akhir makan sahur sebelum fajar' },
  { id: 'shubuh', name: 'Shubuh', time: '04:45', icon: '🌅', description: 'Awal waktu shalat fajar' },
  { id: 'syuruk', name: 'Syuruk/Terbit', time: '06:04', icon: '☀️', description: 'Waktu matahari terbit (batas dhuha)' },
  { id: 'dzuhur', name: 'Dzuhur', time: '12:05', icon: '☀️', description: 'Shalat tengah hari ketika matahari tergelincir' },
  { id: 'ashar', name: 'Ashar', time: '15:28', icon: '⛅', description: 'Shalat sore hari menjelang terbenamnya matahari' },
  { id: 'maghrib', name: 'Maghrib', time: '18:07', icon: '🌇', description: 'Shalat petang bertepatan saat matahari tenggelam' },
  { id: 'isya', name: 'Isya', time: '19:21', icon: '🌌', description: 'Shalat malam hari' }
];

// Audio settings (Publicly available non-copyrighted high quality audio streams)
const AUDIO_SOURCES = {
  chime: 'local_synthesis',
  gong: 'local_synthesis',
  adzan: 'https://archive.org/download/Adzan_201602/Adzan.mp3'
};

// Pure client-side synthesizer using Web Audio API to prevent external file CORS/Codec loading blocks
const playSynthesizedTone = (type: 'chime' | 'gong', volume: number) => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return null;
    const ctx = new AudioContext();
    const now = ctx.currentTime;

    if (type === 'chime') {
      // Crystal clear, warm chime notification bell matching premium micro-gongs
      const freqs = [880, 1046.50, 1318.51, 1760]; // Complex chord for richness
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        
        // Slightly stagger arrival for beautiful, realistic bell dynamic
        const trigTime = now + (idx * 0.04);
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.15 * volume, trigTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, trigTime + 1.8);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start(trigTime);
        osc.stop(trigTime + 2.0);
      });
      return { stop: () => { ctx.close().catch(() => {}); } };
    } else {
      // Warm, deep resonant gong (low frequency compound wave with warm lowpass cutoff, ideal for mosques)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(110, now); // A2
      osc1.frequency.exponentialRampToValueAtTime(73.42, now + 2.5); // Descend softly
      
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(112, now); // Detune
      osc2.frequency.exponentialRampToValueAtTime(74, now + 2.5);
      
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);
      filter.frequency.exponentialRampToValueAtTime(90, now + 2.0);
      
      gainNode.gain.setValueAtTime(0.25 * volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 3.5);
      osc2.stop(now + 3.5);
      
      return { stop: () => { ctx.close().catch(() => {}); } };
    }
  } catch (e) {
    console.error("Synthesizer initializer error:", e);
    return null;
  }
};

export default function App() {
  // Database / Local Storage Persistence
  const [prayers, setPrayers] = useState<PrayerTime[]>(() => {
    const saved = localStorage.getItem('abrar_prayer_schedule');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_PRAYERS;
      }
    }
    return DEFAULT_PRAYERS;
  });

  // Sound selection
  const [selectedAudio, setSelectedAudio] = useState<keyof typeof AUDIO_SOURCES>('chime');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // States
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [logs, setLogs] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem('abrar_notification_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [{
      id: 'init',
      timestamp: new Date().toLocaleTimeString('id-ID'),
      title: 'Sistem Diaktifkan',
      message: 'Pemantauan jadwal shalat Al Abrar berjalan lancar di browser Anda.',
      type: 'system'
    }];
  });

  // Editor states
  const [editingPrayer, setEditingPrayer] = useState<PrayerTime | null>(null);
  const [editTimeValue, setEditTimeValue] = useState('');
  const [showConfigInfo, setShowConfigInfo] = useState(true);
  const [testNotificationTimeLeft, setTestNotificationTimeLeft] = useState<number | null>(null);

  const [slides, setSlides] = useState<SlideItem[]>(() => {
    const saved = localStorage.getItem('abrar_mosque_slides');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return DEFAULT_SLIDES;
      }
    }
    return DEFAULT_SLIDES;
  });

  // High-Level Integrated Navigation Hub Tab selection
  const [activeTab, setActiveTab] = useState<'beranda' | 'profil' | 'donasi' | 'keuangan' | 'inventaris' | 'jamaah'>('beranda');

  // Admin Mode States
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('abrar_is_admin') === 'true';
  });
  const [adminPin, setAdminPin] = useState<string>(() => {
    return localStorage.getItem('abrar_admin_pin') || '123456';
  });
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');
  const [showPinChange, setShowPinChange] = useState<boolean>(false);
  const [newPinValue, setNewPinValue] = useState<string>('');
  const [announcement, setAnnouncement] = useState<string>(() => {
    return localStorage.getItem('abrar_announcement') || 'Selamat Datang di Masjid Jami Al Abrar Lapadde, Parepare. Mari laksanakan Shalat Berjamaah tepat waktu di Shaff terdepan.';
  });
  const [announcementInput, setAnnouncementInput] = useState<string>(() => {
    return localStorage.getItem('abrar_announcement') || 'Selamat Datang di Masjid Jami Al Abrar Lapadde, Parepare. Mari laksanakan Shalat Berjamaah tepat waktu di Shaff terdepan.';
  });

  const handleAdminLogin = (pinStr: string) => {
    if (pinStr.trim() === adminPin) {
      setIsAdmin(true);
      localStorage.setItem('abrar_is_admin', 'true');
      setShowLoginModal(false);
      setEnteredPin('');
      setLoginError('');
      addLog('Akses Admin Dibuka', 'Sesi admin aktif berhasil diverifikasi menggunakan PIN.', 'success');
    } else {
      setLoginError('PIN yang Anda masukkan salah. Silakan coba lagi.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('abrar_is_admin');
    addLog('Akses Admin Ditutup', 'Sesi admin berhasil ditutup dengan aman.', 'system');
  };

  const handlePinChange = (newPin: string) => {
    if (newPin.trim().length < 4) {
      alert('PIN harus terdiri dari minimal 4 digit!');
      return;
    }
    setAdminPin(newPin);
    localStorage.setItem('abrar_admin_pin', newPin);
    setShowPinChange(false);
    setNewPinValue('');
    addLog('PIN Admin Diubah', 'Kunci PIN keamanan admin berhasil diperbarui.', 'success');
  };

  const handleUpdateAnnouncement = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) {
      alert('Teks pengumuman tidak boleh kosong!');
      return;
    }
    setAnnouncement(cleanText);
    localStorage.setItem('abrar_announcement', cleanText);
    addLog('Pengumuman Masjid Diperbarui', `Informasi baru dipublikasikan: "${cleanText}"`, 'info');
  };

  // Audio element reference to control playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firedAlerts = useRef<Set<string>>(new Set());

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
    
    // Setup audio element
    audioRef.current = new Audio();

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Sync prayers to local storage
  const savePrayersToDb = (updatedPrayers: PrayerTime[]) => {
    setPrayers(updatedPrayers);
    localStorage.setItem('abrar_prayer_schedule', JSON.stringify(updatedPrayers));
    addLog('Database Diperbarui', 'Jadwal shalat baru telah disimpan ke database lokal.', 'info');
  };

  // Reset to default schedule
  const handleResetDefaults = () => {
    if (!isAdmin) {
      setLoginError('');
      setShowLoginModal(true);
      return;
    }
    if (confirm('Apakah Anda yakin ingin mengembalikan semua jadwal shalat ke setelan default Parepare?')) {
      savePrayersToDb(DEFAULT_PRAYERS);
      firedAlerts.current.clear();
      addLog('Reset Database', 'Jadwal shalat berhasil dipulihkan ke setelan default.', 'system');
    }
  };

  // Active custom synthesis instance reference
  const synthInstanceRef = useRef<{ stop: () => void } | null>(null);

  // Sound volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Reset/stop playing audio on selection change
  useEffect(() => {
    stopAudioPlayback();
  }, [selectedAudio]);

  const stopAudioPlayback = () => {
    if (synthInstanceRef.current) {
      synthInstanceRef.current.stop();
      synthInstanceRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsAudioPlaying(false);
  };

  const triggerAudioPlayback = () => {
    stopAudioPlayback();

    if (isMuted) return;

    setIsAudioPlaying(true);

    if (selectedAudio === 'chime' || selectedAudio === 'gong') {
      const synth = playSynthesizedTone(selectedAudio as 'chime' | 'gong', volume);
      if (synth) {
        synthInstanceRef.current = synth;
        const duration = selectedAudio === 'chime' ? 2200 : 3600;
        const timeoutId = setTimeout(() => {
          setIsAudioPlaying(false);
        }, duration);
        // Bind clear
        const originalStop = synth.stop;
        synth.stop = () => {
          clearTimeout(timeoutId);
          originalStop();
        };
      } else {
        setIsAudioPlaying(false);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.src = AUDIO_SOURCES.adzan;
        audioRef.current.volume = volume;
        audioRef.current.play().then(() => {
          audioRef.current!.onended = () => {
            setIsAudioPlaying(false);
          };
        }).catch(err => {
          setIsAudioPlaying(false);
          console.error("Audio playback interrupted:", err);
          addLog('Kegagalan Suara', 'Gagal memutar aliran audio eksternal. Kami merekomendasikan menggunakan nada sintetis Chime atau Gong.', 'info');
        });
      } else {
        setIsAudioPlaying(false);
      }
    }
  };

  const toggleSoundPlay = () => {
    if (isAudioPlaying) {
      stopAudioPlayback();
    } else {
      triggerAudioPlayback();
    }
  };

  // Notification helper
  const addLog = (title: string, message: string, type: 'info' | 'success' | 'alert' | 'system', prayerId?: string, isCustomTest = false) => {
    const newLog: NotificationLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      title,
      message,
      type,
      prayerId,
      isCustomTest
    };
    setLogs(prev => {
      const updated = [newLog, ...prev].slice(0, 50); // Keep last 50
      localStorage.setItem('abrar_notification_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Browser Anda tidak mendukung Web Notifications API.');
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        new Notification('Izin Aktif!', {
          body: 'Notifikasi push adzan Masjid Jami Al Abrar siap melayani Anda.',
          icon: '/favicon.ico'
        });
        addLog('Izin Notifikasi Disetujui', 'Notifikasi browser diaktifkan dengan sukses.', 'success');
      } else {
        addLog('Izin Notifikasi Ditolak', 'Izin ditolak. Peringatan hanya akan muncul di dalam aplikasi.', 'alert');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Simulated Test Trigger
  const triggerQuickTest = () => {
    addLog('Mengatur Uji Coba', 'Notifikasi simulasi akan dipicu dalam 5 detik kedepan.', 'info');
    setTestNotificationTimeLeft(5);
  };

  // Simulated timer effect
  useEffect(() => {
    if (testNotificationTimeLeft === null) return;
    
    if (testNotificationTimeLeft > 0) {
      const timer = setTimeout(() => {
        setTestNotificationTimeLeft(prev => (prev !== null ? prev - 1 : null));
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Trigger simulation notification now
      setTestNotificationTimeLeft(null);
      firePushNotification('SIMULASI ADZAN (Uji Coba)', 'Perhatian: 10 menit lagi memasuki waktu shalat uji coba!', 'imsak', true);
    }
  }, [testNotificationTimeLeft]);

  // General absolute trigger mechanism
  const firePushNotification = (title: string, message: string, prayerId: string, isTest = false) => {
    // 1. Desktop Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const n = new Notification(title, {
          body: message,
          icon: 'https://images.unsplash.com/photo-1590075865003-e48277adc558',
          requireInteraction: true
        });
        n.onclick = () => {
          window.focus();
        };
      } catch (err) {
        console.error("Failed to showcase desktop notification:", err);
      }
    }

    // 2. Play Audio Alert
    if (!isMuted) {
      triggerAudioPlayback();
    }

    // 3. Log notification event
    addLog(title, message, 'success', prayerId, isTest);
  };

  // Dynamic High-Precision Scheduler Engine running every 1 second
  useEffect(() => {
    const schedulerInterval = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);

      const hourString = String(now.getHours()).padStart(2, '0');
      const minuteString = String(now.getMinutes()).padStart(2, '0');
      const timeHHMM = `${hourString}:${minuteString}`;

      // Check each prayer time
      prayers.forEach(prayer => {
        // Calculate the alert time (10 minutes before the prayer time)
        const [h, m] = prayer.time.split(':').map(Number);
        
        // Target minute calculation
        let alertH = h;
        let alertM = m - 10;
        if (alertM < 0) {
          alertM += 60;
          alertH -= 1;
          if (alertH < 0) {
            alertH += 24;
          }
        }
        
        const alertHStr = String(alertH).padStart(2, '0');
        const alertMStr = String(alertM).padStart(2, '0');
        const alertTimeHHMM = `${alertHStr}:${alertMStr}`;

        // Create uniqueness key: prayer_id + date string to avoid multiple fires in same minute
        const dateKey = now.toDateString();
        const fireKey = `${prayer.id}_${alertTimeHHMM}_${dateKey}`;

        if (timeHHMM === alertTimeHHMM && !firedAlerts.current.has(fireKey)) {
          firedAlerts.current.add(fireKey);
          
          const title = `Peringatan Adzan: ${prayer.name}`;
          const message = `Waktu shalat ${prayer.name} untuk wilayah Parepare akan tiba 10 menit lagi (${prayer.time} WITA). Persiapkan diri Anda!`;
          
          firePushNotification(title, message, prayer.id);
        }
      });
    }, 1000);

    return () => clearInterval(schedulerInterval);
  }, [prayers, selectedAudio, isMuted, volume]);

  // Calculated next prayer structures
  const getNextPrayerDetails = () => {
    let nextPrayer: PrayerTime | null = null;
    let minDiff = Infinity;
    
    const now = new Date();

    for (const p of prayers) {
      const [h, m] = p.time.split(':').map(Number);
      
      // Calculate normal prayer date
      const pDate = new Date(now);
      pDate.setHours(h, m, 0, 0);
      if (pDate.getTime() <= now.getTime()) {
        pDate.setDate(pDate.getDate() + 1);
      }
      
      // Calculate alert date (10 min before)
      const aDate = new Date(now);
      aDate.setHours(h, m - 10, 0, 0);
      if (aDate.getTime() <= now.getTime()) {
        aDate.setDate(aDate.getDate() + 1);
      }

      const diffP = pDate.getTime() - now.getTime();

      // Find the absolute closest upcoming event (either prayer or its 10m alert)
      if (diffP < minDiff) {
        minDiff = diffP;
        nextPrayer = p;
      }
    }

    if (!nextPrayer) return null;

    // Calculate countdown format
    const prayerTimeObj = new Date(now);
    const [ph, pm] = nextPrayer.time.split(':').map(Number);
    prayerTimeObj.setHours(ph, pm, 0, 0);
    if (prayerTimeObj.getTime() <= now.getTime()) {
      prayerTimeObj.setDate(prayerTimeObj.getDate() + 1);
    }

    const alertTimeObj = new Date(prayerTimeObj);
    alertTimeObj.setMinutes(ph === 0 && pm < 10 ? pm - 10 + 60 : pm - 10);
    if (ph === 0 && pm < 10) {
      alertTimeObj.setHours(23);
    }

    const totalSecondsToPrayer = Math.floor((prayerTimeObj.getTime() - now.getTime()) / 1000);
    
    // Time remaining to alert
    let secondsToAlert = Math.floor((alertTimeObj.getTime() - now.getTime()) / 1000);
    if (secondsToAlert < 0) {
      // If alert time is today, recalculate next alert
      secondsToAlert += 24 * 3600;
    }

    const formatCountdown = (totalSecs: number) => {
      const hours = Math.floor(totalSecs / 3600);
      const minutes = Math.floor((totalSecs % 3600) / 60);
      const seconds = totalSecs % 60;
      return `${hours}j ${minutes}m ${seconds}d`;
    };

    return {
      prayer: nextPrayer,
      countdownPrayer: formatCountdown(totalSecondsToPrayer),
      countdownAlert: formatCountdown(secondsToAlert),
      alertTimeFormatted: alertTimeObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      rawSecondsToAlert: secondsToAlert
    };
  };

  const nextDetails = getNextPrayerDetails();

  // Handle single prayer edit start
  const startEditing = (p: PrayerTime) => {
    if (!isAdmin) {
      setLoginError('');
      setShowLoginModal(true);
      return;
    }
    setEditingPrayer(p);
    setEditTimeValue(p.time);
  };

  // Perform save of prayer time
  const savePrayerEdit = () => {
    if (!editingPrayer) return;
    
    // Simple validation "HH:MM"
    const regex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!regex.test(editTimeValue)) {
      alert('Format waktu tidak valid! Gunakan format HH:MM.');
      return;
    }

    const updated = prayers.map(p => {
      if (p.id === editingPrayer.id) {
        return { ...p, time: editTimeValue };
      }
      return p;
    });

    savePrayersToDb(updated);
    addLog('Update Waktu Shalat', `Lokal database diperbarui untuk ${editingPrayer.name}: ${editTimeValue} WITA`, 'success', editingPrayer.id);
    setEditingPrayer(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Emerald Header */}
      <header className="bg-slate-950 text-white shadow-2xl relative overflow-hidden border-b border-white/5" id="header_navbar">
        {/* Motif background pattern */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,_var(--tw-gradient-stops))] from-emerald-900/40 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-5 sm:px-6 lg:px-8 relative z-10 flex flex-nowrap items-center justify-between gap-3 sm:gap-4">
          
          <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
            <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 border border-white/20 flex items-center justify-center text-xl sm:text-2xl shadow-xl shadow-emerald-900/40 shrink-0 transform hover:rotate-3 transition duration-300">
              🕌
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-sm sm:text-2xl font-black tracking-tight whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-50 to-emerald-200">
                  AL ABRAR
                  <span className="hidden sm:inline"> JAMI PAREPARE</span>
                </h1>
                <span className="text-[8px] sm:text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded sm:rounded-md font-black uppercase tracking-wider shrink-0">UNIT 021</span>
              </div>
              <p className="text-emerald-400/70 text-[8px] sm:text-xs font-bold uppercase tracking-widest leading-none mt-1 hidden sm:block">Sistem Cerdas Terintegrasi</p>
              <p className="text-emerald-400/70 text-[8px] font-bold uppercase tracking-widest leading-none mt-0.5 sm:hidden">Cerdas • Terintegrasi</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-xl px-2.5 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-3xl border border-white/5 shadow-inner">
              <div className="hidden md:block">
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex flex-col items-end sm:items-start">
                <span className="text-[7px] sm:text-[9px] font-black text-amber-400 uppercase tracking-[0.1em] sm:tracking-[0.2em] leading-none mb-0.5">
                  {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                <span className="text-xs sm:text-lg font-black font-mono tracking-tighter text-white leading-none flex items-baseline">
                  {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  <span className="text-[8px] sm:text-xs opacity-40 ml-0.5 font-normal">: {currentTime.toLocaleTimeString('id-ID', { second: '2-digit' })}</span>
                  <span className="text-[8px] ml-1 opacity-60 font-bold text-amber-200 hidden sm:inline">WITA</span>
                </span>
              </div>
            </div>

            {isAdmin ? (
              <div className="flex items-center gap-1 sm:gap-2 bg-amber-400/10 border border-amber-400/20 text-amber-400 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-[8px] sm:text-xs font-black shadow-lg shadow-amber-900/20">
                <span className="hidden md:inline">ADMIN</span>
                <button
                  onClick={handleAdminLogout}
                  className="hover:bg-amber-400/20 text-white px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl transition duration-150 border border-white/5"
                >
                  <span className="sm:hidden">OUT</span>
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setLoginError('');
                  setShowLoginModal(true);
                }}
                className="flex items-center justify-center p-2 sm:px-4 sm:py-3 bg-white text-slate-950 rounded-xl sm:rounded-2xl text-[9px] sm:text-xs font-black border border-white shadow-xl hover:bg-emerald-50 transition active:scale-95 shrink-0"
                title="Login Admin"
              >
                <Settings className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline uppercase">Akses</span>
              </button>
            )}
          </div>
        </div>
      </header>


      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6" id="main_content">
        
        {/* Banner Running Text / Pengumuman */}
        <div className="bg-emerald-950 border border-emerald-800/80 rounded-2xl py-3 px-4 flex items-center gap-3 overflow-hidden shadow-inner font-sans">
          <span className="bg-amber-400 text-emerald-950 text-[10px] font-black uppercase px-2 py-1 rounded shrink-0 tracking-wide flex items-center gap-1">
            📢 PENGUMUMAN
          </span>
          <div className="relative flex-1 overflow-hidden h-5">
            <div className="absolute whitespace-nowrap text-xs text-emerald-100 font-medium tracking-wide animate-marquee hover:pause-marquee">
              {announcement}
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Tab Hub */}
        <div className="bg-white/90 backdrop-blur-md rounded-[2.5rem] p-1.5 border border-slate-200 shadow-xl shadow-slate-200/40 flex items-center sticky top-2 sm:top-4 z-40 overflow-hidden" id="navigation_menu_tabs">
          <div className="flex overflow-x-auto no-scrollbar gap-1 flex-1 px-1 py-0.5">
            {[
              { id: 'beranda', label: 'Beranda', icon: <Home className="h-4 w-4" /> },
              { id: 'profil', label: 'Profil', icon: <Building className="h-4 w-4" /> },
              { id: 'donasi', label: 'Donasi', icon: <Heart className="h-4 w-4" /> },
              { id: 'keuangan', label: 'Keuangan', icon: <TrendingUp className="h-4 w-4" /> },
              { id: 'inventaris', label: 'Inventaris', icon: <Package className="h-4 w-4" /> },
              { id: 'jamaah', label: 'Jamaah', icon: <Users className="h-4 w-4" /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2.5 px-6 sm:px-7 py-2.5 sm:py-3 rounded-full text-xs font-black transition-all duration-500 outline-none relative whitespace-nowrap shrink-0 overflow-hidden ${
                    isActive 
                      ? 'text-white shadow-2xl translate-y-[-1px]'
                      : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50/80 transition-colors'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2.5">
                    {tab.icon}
                    <span>{tab.label}</span>
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute inset-0 bg-slate-900"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.7 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>


        {/* Dashboard Kendali Admin */}
        {isAdmin && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-2xl p-6 sm:p-8 relative overflow-hidden border-t-4 border-amber-400" id="admin_control_panel">
            <div className="absolute right-0 top-0 opacity-5 text-8xl font-sans select-none translate-y-2 -translate-x-4 font-black pointer-events-none text-amber-300">
              ADMIN
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-2xl">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg tracking-wide text-amber-300">ADMIN CONTROL CENTER</h3>
                <p className="text-slate-300 text-xs mt-0.5">Pusat kendali operasional digital penyiaran Masjid Jami Al Abrar Unit 021.</p>
              </div>
            </div>

            <hr className="border-slate-800 mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Box 1: Announcement Broadcasting */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-xs text-amber-300 uppercase tracking-widest flex items-center gap-2">
                  <span>📢</span> Broadcasting Pengumuman
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Update teks pengumuman berjalan (running text) yang tampil pada layar utama jamaah secara realtime.
                </p>
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    placeholder="Contoh: Pengajian rutin ba'da maghrib malam ini..."
                    value={announcementInput}
                    onChange={(e) => setAnnouncementInput(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 text-slate-100 placeholder-slate-500 rounded-xl text-xs border border-slate-805 focus:border-amber-400 outline-none"
                  />
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => handleUpdateAnnouncement(announcementInput)}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-500 font-bold text-slate-950 rounded-lg text-xs transition duration-150"
                    >
                      Kirim & Simpan
                    </button>
                  </div>
                </div>
              </div>

              {/* Box 2: Quick System Utilities */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-xs text-amber-300 uppercase tracking-widest flex items-center gap-2">
                  <span>⚙️</span> Utilitas Operasional
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Gunakan perkakas darurat di bawah ini untuk reset ulang sistem penyiaran jika dibutuhkan.
                </p>
                
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleResetDefaults}
                    className="w-full py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-400/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Reset Schedule Ke Parepare
                  </button>
                  
                  <button
                    onClick={() => {
                      if (confirm('Bersihkan seluruh log transaksional sistem?')) {
                        setLogs([]);
                        localStorage.removeItem('abrar_notification_logs');
                        addLog('Log Dibersihkan', 'Admin membersihkan seluruh riwayat log aktivitas.', 'system');
                      }
                    }}
                    className="w-full py-2.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                  >
                    🗑️ Bersihkan Semua Log
                  </button>
                </div>
              </div>

              {/* Box 3: Security & PIN Management */}
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-xs text-amber-300 uppercase tracking-widest flex items-center gap-2">
                    <span>🔑</span> Keamanan PIN Admin
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Ubah PIN akses masuk Admin Anda jika keamanan dirasa terkompromi. PIN bawaan: <strong className="text-amber-300 font-mono">123456</strong>.
                  </p>
                </div>

                <div className="space-y-2 pt-1">
                  {showPinChange ? (
                    <div className="space-y-2">
                      <input
                        type="password"
                        placeholder="PIN Baru (min. 4 angka)"
                        value={newPinValue}
                        onChange={(e) => setNewPinValue(e.target.value)}
                        className="w-full p-2 bg-slate-900 text-slate-100 placeholder-slate-500 rounded-xl text-xs border border-slate-850 focus:border-amber-400 outline-none font-mono text-center tracking-widest"
                      />
                      <div className="flex gap-1.5 justify-end">
                        <button
                          onClick={() => handlePinChange(newPinValue)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 font-semibold rounded-lg text-[10px] text-white transition"
                        >
                          Simpan
                        </button>
                        <button
                          onClick={() => setShowPinChange(false)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg text-[10px] transition"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowPinChange(true)}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      🔒 Ubah PIN Akses
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
        
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'beranda' && (
              <div className="space-y-8 pb-10">
                {/* Elegant Header Hero */}
                <div className="space-y-4">
                  <ImageSlider slides={slides} onNavigate={setActiveTab} />
                </div>

                <MasjidDashboard 
                  prayers={prayers}
                  nextDetails={nextDetails}
                  logs={logs}
                  isAdmin={isAdmin}
                  onNavigate={setActiveTab}
                  onShowLogin={() => {
                    setLoginError('');
                    setShowLoginModal(true);
                  }}
                />

                {/* Detailed Notification & Schedule Control Section */}
                <div className="mt-16 pt-12 border-t border-slate-200" id="config_center">
                  <div className="mb-8">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Pusat Konfigurasi & Penjadwalan</h2>
                    <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">Konfigurasi mendalam sistem cerdas: Waktu shalat, alert audio, dan integritas data.</p>
                  </div>
                  <JadwalHub 
                    prayers={prayers}
                    nextDetails={nextDetails}
                    logs={logs}
                    notificationPermission={notificationPermission}
                    selectedAudio={selectedAudio}
                    isMuted={isMuted}
                    volume={volume}
                    isAudioPlaying={isAudioPlaying}
                    testNotificationTimeLeft={testNotificationTimeLeft}
                    showConfigInfo={showConfigInfo}
                    editingPrayer={editingPrayer}
                    editTimeValue={editTimeValue}
                    onSetShowConfigInfo={setShowConfigInfo}
                    onTriggerQuickTest={triggerQuickTest}
                    onRequestNotificationPermission={requestNotificationPermission}
                    onSetSelectedAudio={setSelectedAudio}
                    onSetIsMuted={setIsMuted}
                    onSetVolume={setVolume}
                    onToggleSoundPlay={toggleSoundPlay}
                    onResetDefaults={handleResetDefaults}
                    onStartEditing={startEditing}
                    onSetEditTimeValue={setEditTimeValue}
                    onSavePrayerEdit={savePrayerEdit}
                    onCancelEdit={() => setEditingPrayer(null)}
                    onClearLogs={() => {
                      setLogs([]);
                      localStorage.removeItem('abrar_notification_logs');
                    }}
                    onNavigate={(tab) => setActiveTab(tab as any)}
                    isAdmin={isAdmin}
                    slides={slides}
                    onUpdateSlides={setSlides}
                    onAddLog={addLog}
                  />
                </div>
              </div>
            )}

            {activeTab === 'profil' && <MosqueProfile />}
            
            {activeTab === 'donasi' && (
              <DonationOpen 
                onDonationSuccess={(title, msg, _amount) => {
                  addLog(title, msg, 'success');
                  triggerAudioPlayback();
                }} 
              />
            )}

            {activeTab === 'keuangan' && (
              <KeuanganMasjid 
                isAdmin={isAdmin} 
                onAddLog={addLog} 
                onShowLogin={() => {
                  setLoginError('');
                  setShowLoginModal(true);
                }} 
              />
            )}

            {activeTab === 'inventaris' && (
              <InventarisMasjid 
                isAdmin={isAdmin} 
                onAddLog={addLog} 
                onShowLogin={() => {
                  setLoginError('');
                  setShowLoginModal(true);
                }} 
              />
            )}

            {activeTab === 'jamaah' && (
              <ManajemenJamaah 
                isAdmin={isAdmin}
                onAddLog={addLog} 
                onShowLogin={() => {
                  setLoginError('');
                  setShowLoginModal(true);
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* Footer Area */}
      <footer className="bg-emerald-950 text-emerald-250 border-t border-emerald-900 py-6 px-4" id="footer_section">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <p className="text-emerald-400/80 text-[11px] font-bold tracking-wider uppercase">@2026 Mesjid Jami Al Abrar Parepare</p>
        </div>
      </footer>

      {/* Login Portal Admin Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-8 shadow-2xl border border-slate-150 transform transition duration-200 scale-100 flex flex-col items-center text-center space-y-4">
            
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-3xl shadow">
              🔐
            </div>
            
            <div className="space-y-1">
              <h4 className="text-lg font-black text-slate-800 tracking-wide">Akses Terkunci</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Silakan masukkan PIN Otorisasi Admin Masjid Al Abrar untuk melanjutkan konfigurasi.
              </p>
            </div>

            <div className="w-full space-y-2">
              <input
                type="password"
                placeholder="• • • • • •"
                maxLength={10}
                value={enteredPin}
                onChange={(e) => {
                  setEnteredPin(e.target.value);
                  setLoginError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAdminLogin(enteredPin);
                  }
                }}
                className="w-full text-center tracking-widest font-mono text-xl py-3 bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl outline-none"
                autoFocus
              />
              
              {loginError && (
                <p className="text-[10px] text-red-600 font-bold bg-red-50 py-1 px-3.5 rounded-lg border border-red-100">
                  ⚠️ {loginError}
                </p>
              )}
              
              <p className="text-[10px] text-slate-400">
                PIN Bawaan Pabrikan: <span className="font-bold underline text-emerald-800">123456</span>
              </p>
            </div>

            <div className="w-full grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowLoginModal(false);
                  setEnteredPin('');
                  setLoginError('');
                }}
                className="py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition"
              >
                Kembali
              </button>
              
              <button
                type="button"
                onClick={() => handleAdminLogin(enteredPin)}
                className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                Konfirmasi
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
