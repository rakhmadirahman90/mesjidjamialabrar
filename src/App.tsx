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
  Users,
  Calendar,
  Info
} from 'lucide-react';

import MosqueProfile from './components/MosqueProfile';
import AboutApp from './components/AboutApp';
import DonationOpen from './components/DonationOpen';
import KeuanganMasjid from './components/KeuanganMasjid';
import { ConfirmationModal } from './components/ConfirmationModal';
import InventarisMasjid from './components/InventarisMasjid';
import ManajemenJamaah from './components/ManajemenJamaah';
import ImageSlider from './components/ImageSlider';
import JadwalHub from './components/JadwalHub';
import MasjidDashboard from './components/MasjidDashboard';
import ProfessionalToasts from './components/ProfessionalToasts';
import AudioUploader from './components/AudioUploader';
import AdminLogin from './components/AdminLogin';
import QrisUploader from './components/QrisUploader';
import { PrayerTime, NotificationLog, SlideItem, KajianEntry, JumatEntry, RamadanEntry, DonationCampaign } from './types';
import { 
  DEFAULT_SLIDES,
  DEFAULT_KAJIAN,
  DEFAULT_JUMAT,
  DEFAULT_CAMPAIGNS,
  DEFAULT_PRAYERS,
  DUMMY_TRANSACTIONS,
  DUMMY_PERMANENT_DONORS,
  DUMMY_ASSETS,
  DUMMY_CONGREGANTS,
  DUMMY_DONORS
} from './data/dummyData';
import { 
  subscribeToCollection, 
  subscribeToDocument, 
  upsertDocument, 
  addDocument, 
  deleteDocument,
  clearCollection
} from './lib/db';

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
  const [prayers, setPrayers] = useState<PrayerTime[]>(DEFAULT_PRAYERS);

  // Sound selection
  const [selectedAudio, setSelectedAudio] = useState<keyof typeof AUDIO_SOURCES>('chime');
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // States
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [logs, setLogs] = useState<NotificationLog[]>([]);

  // Editor states
  const [editingPrayer, setEditingPrayer] = useState<PrayerTime | null>(null);
  const [editTimeValue, setEditTimeValue] = useState('');
  const [showConfigInfo, setShowConfigInfo] = useState(true);
  const [testNotificationTimeLeft, setTestNotificationTimeLeft] = useState<number | null>(null);
  const [activeToasts, setActiveToasts] = useState<NotificationLog[]>([]);

  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [kajian, setKajian] = useState<KajianEntry[]>([]);
  const [jumat, setJumat] = useState<JumatEntry[]>([]);
  const [ramadan, setRamadan] = useState<RamadanEntry[]>([]);
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);

  // High-Level Integrated Navigation Hub Tab selection
  const [activeTab, setActiveTab] = useState<'beranda'|'profil'|'jadwal'|'donasi'|'keuangan'|'inventaris'|'jamaah'|'tentang'|'admin'>('beranda');

  // Admin Mode States
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('abrar_is_admin') === 'true';
  });
  const [adminPin, setAdminPin] = useState<string>('123456');
  const [loginError, setLoginError] = useState<string>('');
  const [showPinChange, setShowPinChange] = useState<boolean>(false);
  const [showPinConfirm, setShowPinConfirm] = useState<boolean>(false);
  const [newPinValue, setNewPinValue] = useState<string>('');
  const [announcement, setAnnouncement] = useState<string>('Selamat Datang di Masjid Jami Al Abrar Lapadde, Parepare. Mari laksanakan Shalat Berjamaah tepat waktu di Shaff terdepan.');
  const [announcementInput, setAnnouncementInput] = useState<string>('');
  const [customAdzan, setCustomAdzan] = useState<string | null>(null);

  useEffect(() => {
    // Load custom adzan from Firestore if available
    const unsubscribe = subscribeToDocument<{ adzanUrl: string }>('settings', 'audio_config', (doc) => {
        if (doc && doc.adzanUrl) {
            setCustomAdzan(doc.adzanUrl);
        }
    });                
    return () => unsubscribe();
  }, []);

  // Firebase Real-time listeners
  useEffect(() => {
    const unsubConfig = subscribeToDocument<{ announcement: string, adminPin: string, prayers: PrayerTime[] }>('settings', 'config', (data) => {
      if (data) {
        if (data.announcement) {
          setAnnouncement(data.announcement);
          setAnnouncementInput(data.announcement);
        }
        if (data.adminPin) setAdminPin(data.adminPin);
        if (data.prayers) setPrayers(data.prayers);
      } else {
        // Seed initial config
        upsertDocument('settings', 'config', {
          announcement: announcement,
          adminPin: adminPin,
          prayers: DEFAULT_PRAYERS
        });
      }
    });

    const unsubLogs = subscribeToCollection<NotificationLog>('activity_logs', (data) => {
      setLogs(data);
    }, 'timestamp', 'desc');

    const unsubSlides = subscribeToCollection<SlideItem>('slides', (data) => {
      if (data.length > 0) {
        setSlides(data);
      } else {
        // Seed slides
        DEFAULT_SLIDES.forEach(s => addDocument('slides', s));
      }
    }, 'order', 'asc');

    const unsubKajian = subscribeToCollection<KajianEntry>('kajian_schedule', (data) => {
      if (data.length > 0) setKajian(data);
      else DEFAULT_KAJIAN.forEach(k => addDocument('kajian_schedule', k));
    });

    const unsubJumat = subscribeToCollection<JumatEntry>('jumat_schedule', (data) => {
      if (data.length > 0) setJumat(data);
      else DEFAULT_JUMAT.forEach(j => addDocument('jumat_schedule', j));
    });

    const unsubRamadan = subscribeToCollection<RamadanEntry>('ramadan_schedule', (data) => {
      if (data.length > 0) setRamadan(data);
      else {
        [
          { id: 'r1', title: 'Tarawih & Witir', time: '19:30', description: '20 Rakaat Tarawih + 3 Rakaat Witir khatam Al-Quran.', icon: '🌙', category: 'Ibadah' },
          { id: 'r2', title: 'Buka Bersama', time: 'Maghrib', description: 'Takjil & makan malam untuk 100 jamaah gratis.', icon: '🍲', category: 'Sosial' },
          { id: 'r3', title: 'I\'tikaf 10 Malam', time: '01:00', description: 'Qiyamul Lail & Sahur bersama peserta i\'tikaf.', icon: '📖', category: 'Ibadah' }
        ].forEach(r => addDocument('ramadan_schedule', r as any));
      }
    });

    const unsubCampaigns = subscribeToCollection<DonationCampaign>('campaigns', (data) => {
      if (data.length > 0) setCampaigns(data);
      else DEFAULT_CAMPAIGNS.forEach(c => addDocument('campaigns', c));
    });

    // Additional dummy data seeding checks
    const unsubTx = subscribeToCollection('financial_transactions', (data) => {
      if (data.length === 0) {
        DUMMY_TRANSACTIONS.forEach(t => addDocument('financial_transactions', t));
      }
    });

    const unsubDonors = subscribeToCollection('permanent_donors', (data: any) => {
      if (!data || data.length === 0) {
        DUMMY_PERMANENT_DONORS.forEach(d => {
          if (d.no) {
            upsertDocument('permanent_donors', `donor_${d.no}`, d);
          }
        });
      } else {
        const seenNos = new Set();
        data.forEach((item: any) => {
          if (item.no !== undefined && item.id) {
            if (seenNos.has(item.no)) {
              deleteDocument('permanent_donors', item.id);
            } else {
              seenNos.add(item.no);
            }
          }
        });
      }
    });

    const unsubAssets = subscribeToCollection('mosque_assets', (data: any) => {
      if (!data || data.length === 0) {
        DUMMY_ASSETS.forEach(a => addDocument('mosque_assets', a));
      } else {
        const seenNames = new Set();
        data.forEach((item: any) => {
          if (item.name && item.id) {
            if (seenNames.has(item.name)) {
              deleteDocument('mosque_assets', item.id);
            } else {
              seenNames.add(item.name);
            }
          }
        });
      }
    });

    const unsubCon = subscribeToCollection('mosque_congregants', (data: any) => {
      if (!data || data.length === 0) {
        DUMMY_CONGREGANTS.forEach(c => addDocument('mosque_congregants', c));
      } else {
        const seenPhones = new Set();
        data.forEach((item: any) => {
          if (item.phone && item.id) {
            if (seenPhones.has(item.phone)) {
              deleteDocument('mosque_congregants', item.id);
            } else {
              seenPhones.add(item.phone);
            }
          }
        });
      }
    });

    const unsubCampDonors = subscribeToCollection('donors', (data) => {
      if (data.length === 0) {
        DUMMY_DONORS.forEach(d => addDocument('donors', d));
      }
    });

    return () => {
      unsubConfig();
      unsubLogs();
      unsubSlides();
      unsubKajian();
      unsubJumat();
      unsubRamadan();
      unsubCampaigns();
      unsubTx();
      unsubDonors();
      unsubAssets();
      unsubCon();
      unsubCampDonors();
    };
  }, []);

  const handleAdminLogin = (pinStr: string) => {
    if (pinStr.trim() === adminPin) {
      setIsAdmin(true);
      localStorage.setItem('abrar_is_admin', 'true');
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
      addLog('Gagal', 'PIN harus terdiri dari minimal 4 digit!', 'alert');
      return;
    }
    setAdminPin(newPin);
    upsertDocument('settings', 'config', { adminPin: newPin });
    setShowPinChange(false);
    setNewPinValue('');
    addLog('PIN Admin Diubah', 'Kunci PIN keamanan admin berhasil diperbarui.', 'success');
  };

  const handleUpdateAnnouncement = (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) {
      addLog('Gagal', 'Teks pengumuman tidak boleh kosong!', 'alert');
      return;
    }
    setAnnouncement(cleanText);
    upsertDocument('settings', 'config', { announcement: cleanText });
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
    upsertDocument('settings', 'config', { prayers: updatedPrayers });
    addLog('Database Diperbarui', 'Jadwal shalat baru telah disimpan ke database cloud.', 'info');
  };

  // Reset to default schedule
  const handleResetDefaults = () => {
    if (!isAdmin) {
      addLog('Akses Ditolak', 'Silakan masuk ke menu Kontrol Admin terlebih dahulu.', 'alert');
      setActiveTab('admin');
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
        audioRef.current.src = customAdzan || AUDIO_SOURCES.adzan;
        audioRef.current.load(); // Ensure the source is loaded
        audioRef.current.volume = volume;
        audioRef.current.play().then(() => {
          audioRef.current!.onended = () => {
            setIsAudioPlaying(false);
          };
        }).catch(err => {
          setIsAudioPlaying(false);
          // Only log error if it's not simply an interruption (AbortError)
          if (err.name !== 'AbortError') {
            console.error("Audio playback error:", err);
            addLog('Kegagalan Suara', 'Gagal memutar aliran audio eksternal. Kami merekomendasikan menggunakan nada sintetis Chime atau Gong.', 'info');
          }
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
    
    // Save to Firestore
    addDocument('activity_logs', newLog);
    
    // Add to active toasts for professional floating feedback
    setActiveToasts(prev => [newLog, ...prev]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(newLog.id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  // Request browser notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      addLog('Gagal', 'Browser Anda tidak mendukung Web Notifications API.', 'alert');
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
      addLog('Akses Ditolak', 'Silakan masuk ke menu Kontrol Admin terlebih dahulu.', 'alert');
      setActiveTab('admin');
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
      addLog('Gagal', 'Format waktu tidak valid! Gunakan format HH:MM.', 'alert');
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

  const deleteLog = (id: string) => {
    const logToDelete = logs.find(l => l.id === id);
    if (logToDelete && (logToDelete as any).id) {
       deleteDocument('activity_logs', (logToDelete as any).id);
    }
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
              <div className="flex flex-col">
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400/80 uppercase tracking-[0.25em] leading-none mb-1">Pusat Ibadah</span>
                <h1 className="text-base sm:text-2xl font-black tracking-tight whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-white via-emerald-50 to-emerald-200 leading-none">
                  Masjid Al Abrar
                  <span className="hidden sm:inline text-white/30 ml-2 font-bold uppercase tracking-normal">Parepare</span>
                </h1>
              </div>
              <p className="text-emerald-400/50 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest leading-none mt-1.5 hidden sm:block">Sistem Cerdas Terintegrasi</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div className="flex items-center gap-2 sm:gap-3 bg-white/5 backdrop-blur-xl px-2 sm:px-4 py-1.5 sm:py-2.5 rounded-xl sm:rounded-3xl border border-white/5 shadow-inner">
              <div className="hidden md:block">
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              <div className="flex flex-col items-center sm:items-start shrink-0">
                <span className="text-[8px] sm:text-[9px] font-black text-amber-400 uppercase tracking-widest leading-none mb-1">
                  {currentTime.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                </span>
                <span className="text-sm sm:text-lg font-black font-mono tracking-tighter text-white leading-none flex items-baseline">
                  {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  <span className="text-[9px] sm:text-xs opacity-40 ml-0.5 font-normal">: {currentTime.toLocaleTimeString('id-ID', { second: '2-digit' })}</span>
                  <span className="text-[9px] ml-1 opacity-60 font-bold text-amber-200 hidden sm:inline">WITA</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>


      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-24 sm:pb-32" id="main_content">
        
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
        <div className="bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-[2.5rem] p-1 sm:p-1.5 border border-slate-200 shadow-xl shadow-slate-200/20 flex items-center sticky top-2 sm:top-4 z-40 overflow-hidden" id="navigation_menu_tabs">
          <div className="flex overflow-x-auto no-scrollbar gap-1 flex-1 px-1 py-0.5">
            {[
              { id: 'beranda', label: 'Home', icon: <Home className="h-4 w-4" /> },
              { id: 'jadwal', label: 'Jadwal', icon: <Calendar className="h-4 w-4" /> },
              { id: 'profil', label: 'Masjid', icon: <Building className="h-4 w-4" /> },
              { id: 'donasi', label: 'Donasi', icon: <Heart className="h-4 w-4" /> },
              { id: 'keuangan', label: 'Kas', icon: <TrendingUp className="h-4 w-4" /> },
              { id: 'jamaah', label: 'Jamaah', icon: <Users className="h-4 w-4" /> },
              { id: 'inventaris', label: 'Aset', icon: <Package className="h-4 w-4" /> },
              { id: 'tentang', label: 'Info', icon: <Info className="h-4 w-4" /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 sm:px-7 py-2 sm:py-3 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-black transition-all duration-300 outline-none relative whitespace-nowrap shrink-0 overflow-hidden ${
                    isActive 
                      ? 'text-white shadow-lg translate-y-[-1px]'
                      : 'text-slate-500 hover:text-slate-950 hover:bg-slate-50 transition-colors'
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
                  isAdmin={isAdmin}
                  onNavigate={setActiveTab}
                  onShowLogin={() => setActiveTab('admin')}
                />
              </div>
            )}

            {activeTab === 'profil' && <MosqueProfile isAdmin={isAdmin} onAddLog={addLog} />}

            {activeTab === 'tentang' && <AboutApp />}

            {activeTab === 'jadwal' && (
              <div className="animate-fade-in space-y-6">
                <div className="mb-4 text-left px-2">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-widest rounded-full mb-2">Penjadwalan</span>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">Jadwal & Agenda Ibadah</h2>
                  <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">Konfigurasi waktu shalat, pengingat otomatis, dan riwayat aktivitas sistem.</p>
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
                    const ids = logs.map(l => (l as any).id).filter(Boolean);
                    clearCollection('activity_logs', ids);
                  }}
                  onNavigate={(tab) => setActiveTab(tab as any)}
                  onDeleteLog={deleteLog}
                  isAdmin={isAdmin}
                  slides={slides}
                  onUpdateSlides={async () => {
                    // Logic to update slides handled by subcomponents
                  }}
                  onAddLog={addLog}
                  kajian={kajian}
                  onUpdateKajian={() => {
                    // Bulk update if needed
                  }}
                  jumat={jumat}
                  onUpdateJumat={() => {
                    // Bulk update if needed
                  }}
                  ramadan={ramadan}
                />
              </div>
            )}
            
            {activeTab === 'donasi' && (
              <DonationOpen 
                isAdmin={isAdmin}
                campaigns={campaigns}
                onUpdateCampaigns={() => {
                  // Handled by subcomponent usually
                }}
                onDonationSuccess={(title, msg, _amount) => {
                  addLog(title, msg, 'success');
                  triggerAudioPlayback();
                }} 
                onAddLog={addLog}
              />
            )}

            {activeTab === 'keuangan' && (
              <KeuanganMasjid 
                isAdmin={isAdmin} 
                onAddLog={addLog} 
                onShowLogin={() => setActiveTab('admin')} 
              />
            )}

            {activeTab === 'inventaris' && (
              <InventarisMasjid 
                isAdmin={isAdmin} 
                onAddLog={addLog} 
                onShowLogin={() => setActiveTab('admin')} 
              />
            )}

            {activeTab === 'jamaah' && (
              <ManajemenJamaah 
                isAdmin={isAdmin}
                onAddLog={addLog} 
                onShowLogin={() => setActiveTab('admin')}
              />
            )}

            {activeTab === 'admin' && (
              <div className="animate-fade-in space-y-6">
                {!isAdmin ? (
                  <AdminLogin 
                    onLogin={handleAdminLogin} 
                    loginError={loginError} 
                    onClose={() => setActiveTab('beranda')}
                  />
                ) : (
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl shadow-2xl p-6 sm:p-10 relative overflow-hidden border-t-8 border-amber-400" id="admin_control_tab">
                    <div className="absolute right-0 top-0 opacity-5 text-9xl font-sans select-none translate-y-4 -translate-x-8 font-black pointer-events-none text-amber-300">
                      ADMIN
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="p-3 sm:p-4 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-2xl sm:rounded-3xl shadow-lg">
                          <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
                        </div>
                        <div className="text-left">
                          <h3 className="font-black text-xl sm:text-2xl tracking-tight text-white flex items-center gap-2">
                            ADMIN HUB
                            <span className="bg-amber-400 text-slate-950 text-[8px] sm:text-[10px] px-2 py-0.5 rounded-full font-black uppercase">LIVE</span>
                          </h3>
                          <p className="text-slate-400 text-xs sm:text-sm mt-0.5 font-medium">Pusat kendali Masjid Jami Al Abrar.</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleAdminLogout}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-black text-xs rounded-2xl shadow-xl shadow-rose-950/40 transition active:scale-95"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Keluar & Kunci
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
                      <div className="bg-slate-950/40 backdrop-blur-sm p-5 sm:p-6 rounded-3xl border border-slate-800/50 space-y-4 hover:border-amber-400/30 transition duration-300 group">
                        <div className="w-10 h-10 bg-amber-400/10 rounded-xl flex items-center justify-center text-amber-300 group-hover:scale-110 transition">
                          📢
                        </div>
                        <div className="space-y-2 text-left">
                          <h4 className="font-black text-[10px] sm:text-[11px] text-amber-400 uppercase tracking-widest text-left">Broadcast Pengumuman</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-medium text-left">
                            Update running text yang tampil secara realtime pada display utama masjid.
                          </p>
                        </div>
                        <div className="space-y-3 pt-2">
                          <textarea
                            rows={2}
                            placeholder="Tulis pengumuman baru..."
                            value={announcementInput}
                            onChange={(e) => setAnnouncementInput(e.target.value)}
                            className="w-full p-3 bg-slate-900/80 text-slate-100 placeholder-slate-600 rounded-2xl text-[11px] border border-slate-800 focus:border-amber-400 outline-none transition"
                          />
                          <button
                            onClick={() => handleUpdateAnnouncement(announcementInput)}
                            className="w-full py-2.5 bg-amber-400 hover:bg-amber-500 active:bg-amber-600 font-black text-slate-950 rounded-xl text-xs transition active:scale-95 shadow-lg shadow-amber-400/10"
                          >
                            Update Sekarang
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-950/40 backdrop-blur-sm p-5 sm:p-6 rounded-3xl border border-slate-800/50 space-y-4 hover:border-emerald-400/30 transition duration-300 group">
                        <div className="w-10 h-10 bg-emerald-400/10 rounded-xl flex items-center justify-center text-emerald-300 group-hover:scale-110 transition">
                          🛠️
                        </div>
                        <div className="space-y-2 text-left">
                          <h4 className="font-black text-[10px] sm:text-[11px] text-emerald-400 uppercase tracking-widest text-left">Utilitas Sistem</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-medium text-left">
                            Aksi cepat untuk mereset data atau membersihkan logs aktivitas historis.
                          </p>
                        </div>
                        <div className="space-y-2 pt-2">
                          <button
                            onClick={handleResetDefaults}
                            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95"
                          >
                            Reset Jadwal Sholat
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Bersihkan LOG aktivitas?')) {
                                setLogs([]);
                                localStorage.removeItem('abrar_notification_logs');
                                addLog('Log Dibersihkan', 'Admin membersihkan log aktivitas.', 'system');
                              }
                            }}
                            className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 active:scale-95"
                          >
                            Bersihkan System Logs
                          </button>
                        </div>
                      </div>

                      <div className="bg-slate-950/40 backdrop-blur-sm p-5 sm:p-6 rounded-3xl border border-slate-800/50 space-y-4 hover:border-sky-400/30 transition duration-300 group">
                        <div className="w-10 h-10 bg-sky-400/10 rounded-xl flex items-center justify-center text-sky-300 group-hover:scale-110 transition">
                          📷
                        </div>
                        <div className="space-y-2 text-left">
                          <h4 className="font-black text-[10px] sm:text-[11px] text-sky-400 uppercase tracking-widest text-left">Update QRIS</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-medium text-left">
                            Ganti gambar QRIS masjid yang tampil pada menu donasi.
                          </p>
                        </div>
                        <QrisUploader onAddLog={addLog} />
                      </div>

                      <div className="bg-slate-950/40 backdrop-blur-sm p-5 sm:p-6 rounded-3xl border border-slate-800/50 space-y-4 hover:border-emerald-400/30 transition duration-300 group">
                        <div className="w-10 h-10 bg-emerald-400/10 rounded-xl flex items-center justify-center text-emerald-300 group-hover:scale-110 transition">
                          🎵
                        </div>
                        <div className="space-y-2 text-left">
                          <h4 className="font-black text-[10px] sm:text-[11px] text-emerald-400 uppercase tracking-widest text-left">Suara Notifikasi</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-medium text-left">
                            Ganti file audio Adzan untuk notifikasi waktu shalat.
                          </p>
                        </div>
                        <AudioUploader 
                          onAddLog={addLog} 
                          onUpload={(dataUrl: string) => {
                            upsertDocument('settings', 'audio_config', { adzanUrl: dataUrl });
                          }}
                        />
                      </div>

                      <div className="bg-slate-950/40 backdrop-blur-sm p-5 sm:p-6 rounded-3xl border border-slate-800/50 space-y-4 hover:border-blue-400/30 transition duration-300 group">
                        <div className="w-10 h-10 bg-blue-400/10 rounded-xl flex items-center justify-center text-blue-300 group-hover:scale-110 transition">
                          🔐
                        </div>
                        <div className="space-y-2 text-left">
                          <h4 className="font-black text-[10px] sm:text-[11px] text-blue-400 uppercase tracking-widest text-left">Keamanan Akses</h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-medium text-left">
                            Ganti PIN otorisasi Admin untuk menjaga kerahasiaan akses kontrol sistem.
                          </p>
                        </div>
                        <div className="pt-2">
                          {showPinChange ? (
                            <div className="space-y-2">
                              <input
                                type="password"
                                placeholder="PIN Baru"
                                value={newPinValue}
                                onChange={(e) => setNewPinValue(e.target.value)}
                                className="w-full p-2.5 bg-slate-900 text-slate-100 rounded-xl text-xs border border-slate-800 focus:border-blue-400 outline-none font-mono text-center"
                              />
                              <div className="flex gap-2">
                                <button onClick={() => setShowPinConfirm(true)} className="flex-1 py-1.5 bg-blue-600 rounded-lg text-[10px] font-bold">Simpan</button>
                                <button onClick={() => setShowPinChange(false)} className="flex-1 py-1.5 bg-slate-800 rounded-lg text-[10px] font-bold text-slate-400">Batal</button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowPinChange(true)}
                              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold transition active:scale-95"
                            >
                              Ganti PIN Otorisasi
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      {/* Footer Area */}
      <footer className="fixed bottom-0 left-0 right-0 bg-emerald-950/90 backdrop-blur-md text-emerald-250 border-t border-emerald-900/50 py-4 px-4 z-40" id="footer_section">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <p className="text-emerald-400/80 text-[10px] font-bold tracking-[0.2em] uppercase">@2026 Mesjid Jami Al Abrar Parepare</p>
          <button 
            onClick={() => setActiveTab('admin')}
            className="text-emerald-400/50 hover:text-emerald-300 transition-colors"
            title="Admin Access"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </footer>

      {/* Professional Floating Notifications */}
      <ProfessionalToasts logs={activeToasts} onRemove={removeToast} />
      <ConfirmationModal 
        isOpen={showPinConfirm}
        title="Ganti PIN"
        message="Anda yakin akan mengganti PIN akses Admin? Pastikan Anda mengingat PIN baru ini untuk menghindari terkunci dari fitur Admin."
        onConfirm={() => {
            handlePinChange(newPinValue);
            setShowPinConfirm(false);
            setShowPinChange(false);
        }}
        onCancel={() => setShowPinConfirm(false)}
      />
    </div>
  );
}
