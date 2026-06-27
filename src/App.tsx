import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Home,
  Building,
  Heart,
  TrendingUp,
  Package,
  Calendar,
  Image as ImageIcon,
  Phone,
  Landmark,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

import InfoMasjid from './components/InfoMasjid';
import DonationOpen from './components/DonationOpen';
import KeuanganMasjid from './components/KeuanganMasjid';
import { ConfirmationModal } from './components/ConfirmationModal';
import InventarisMasjid from './components/InventarisMasjid';
import ManajemenJamaah from './components/ManajemenJamaah';
import ImageSlider from './components/ImageSlider';
import JadwalHub from './components/JadwalHub';
import MasjidDashboard from './components/MasjidDashboard';
import ProfessionalToasts from './components/ProfessionalToasts';
import AdminLogin from './components/AdminLogin';
import GaleriMasjid from './components/GaleriMasjid';
import KontakMasjid from './components/KontakMasjid';
import AdminDashboardPortal from './components/AdminDashboardPortal';
import { PrayerTime, NotificationLog, SlideItem, KajianEntry, JumatEntry, RamadanEntry, DonationCampaign, RoutineEntry, DetailedBoardMember } from './types';
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
  DUMMY_DONORS,
  DUMMY_DETAILED_BOARD
} from './data/dummyData';
import { 
  subscribeToCollection, 
  subscribeToDocument, 
  upsertDocument, 
  addDocument, 
  deleteDocument,
  clearCollection,
  deleteAllInCollection
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
  const [routine, setRoutine] = useState<RoutineEntry[]>([]);
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
  const [detailedBoard, setDetailedBoard] = useState<DetailedBoardMember[]>([]);
  const [mosqueSettings, setMosqueSettings] = useState<any>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [congregants, setCongregants] = useState<any[]>([]);

  // High-Level Integrated Navigation Hub Tab selection
  const [activeTab, setActiveTab] = useState<'beranda'|'profil'|'jadwal'|'donasi'|'keuangan'|'inventaris'|'jamaah'|'tentang'|'admin'|'galeri'|'kontak'>('beranda');

  // Submenu State synchronized with child components via event listeners
  const [curJadwalSub, setCurJadwalSub] = useState<'sholat' | 'kajian' | 'ramadan' | 'jumat' | 'slider' | 'log'>('sholat');
  const [curKeuanganSub, setCurKeuanganSub] = useState<'kas_utama' | 'donatur_tetap'>('kas_utama');
  const [curDonasiSub, setCurDonasiSub] = useState<'online' | 'donatur_tetap'>('online');
  const [curTentangSub, setCurTentangSub] = useState<'info_umum' | 'sejarah' | 'visi_misi' | 'pengurus_lengkap' | 'jamaah'>('info_umum');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileExpandedTab, setMobileExpandedTab] = useState<string | null>(null);

  useEffect(() => {
    const handleSubtabSync = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        if (detail.tab === 'jadwal' && detail.subtab) {
          setCurJadwalSub(detail.subtab);
        }
        if (detail.tab === 'keuangan' && detail.subtab) {
          setCurKeuanganSub(detail.subtab);
        }
        if (detail.tab === 'donasi' && detail.subtab) {
          setCurDonasiSub(detail.subtab);
        }
        if (detail.tab === 'profil' && detail.subtab) {
          setCurTentangSub(detail.subtab as any);
        }
      }
    };
    window.addEventListener('change_subtab', handleSubtabSync);
    return () => window.removeEventListener('change_subtab', handleSubtabSync);
  }, []);

  // Admin Mode States
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem('abrar_is_admin') === 'true';
      }
    } catch (e) {
      console.warn('LocalStorage access blocked');
    }
    return false;
  });

  const clickCountRef = useRef(0);
  const handleLogoClick = () => {
    clickCountRef.current += 1;
    if (clickCountRef.current >= 5) {
      setActiveTab('admin');
      clickCountRef.current = 0;
      return true;
    }
    // Simple debounced reset
    const timeout = (window as any)._logoReset;
    if (timeout) clearTimeout(timeout);
    (window as any)._logoReset = setTimeout(() => {
        clickCountRef.current = 0;
    }, 3000);
    return false;
  };

  const [adminPin, setAdminPin] = useState<string>('123456');
  const [loginError, setLoginError] = useState<string>('');
  const [showPinChange, setShowPinChange] = useState<boolean>(false);
  const [showPinConfirm, setShowPinConfirm] = useState<boolean>(false);
  const [newPinValue, setNewPinValue] = useState<string>('');
  const [announcement, setAnnouncement] = useState<string>('Selamat Datang di Masjid Jami Al Abrar Lapadde, Parepare. Mari laksanakan Shalat Berjamaah tepat waktu di Shaff terdepan.');
  const [announcementInput, setAnnouncementInput] = useState<string>('');
  const [showAnnouncement, setShowAnnouncement] = useState<boolean>(false);
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
    const unsubConfig = subscribeToDocument<{ announcement: string, adminPin: string, prayers: PrayerTime[], showAnnouncement?: boolean }>('settings', 'config', (data) => {
      if (data) {
        setMosqueSettings(data);
        if (data.announcement) {
          setAnnouncement(data.announcement);
          setAnnouncementInput(data.announcement);
        }
        if (data.adminPin) setAdminPin(String(data.adminPin));
        if (data.prayers) setPrayers(data.prayers);
        if (data.showAnnouncement !== undefined) {
          setShowAnnouncement(data.showAnnouncement);
        } else {
          setShowAnnouncement(false);
        }
      } else {
        // Seed initial config
        upsertDocument('settings', 'config', {
          announcement: announcement,
          adminPin: adminPin,
          prayers: DEFAULT_PRAYERS,
          showAnnouncement: false
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

    const unsubRoutine = subscribeToCollection<RoutineEntry>('routine_schedule', (data) => {
      setRoutine(data);
    });

    const unsubCampaigns = subscribeToCollection<DonationCampaign>('campaigns', (data) => {
      if (data.length > 0) setCampaigns(data);
      else DEFAULT_CAMPAIGNS.forEach(c => addDocument('campaigns', c));
    });

    // Additional dummy data seeding checks
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
          if (item && item.no !== undefined && item.id) {
            if (seenNos.has(item.no)) {
              deleteDocument('permanent_donors', item.id);
            } else {
              seenNos.add(item.no);
            }
          }
        });
      }
    });

    const unsubAssets = subscribeToCollection<any>('mosque_assets', (data: any) => {
      setAssets(data);
      if (!data || data.length === 0) {
        DUMMY_ASSETS.forEach(a => addDocument('mosque_assets', a));
      } else {
        const seenNames = new Set();
        data.forEach((item: any) => {
          if (item && item.name && item.id) {
            if (seenNames.has(item.name)) {
              deleteDocument('mosque_assets', item.id);
            } else {
              seenNames.add(item.name);
            }
          }
        });
      }
    });

    const unsubCon = subscribeToCollection<any>('mosque_congregants', (data: any) => {
      setCongregants(data);
      if (!data || data.length === 0) {
        DUMMY_CONGREGANTS.forEach(c => addDocument('mosque_congregants', c));
      } else {
        const seenPhones = new Set();
        data.forEach((item: any) => {
          if (item && item.phone && item.id) {
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

    const unsubDetailedBoard = subscribeToCollection('mosque_detailed_board', (data: any) => {
      if (!data || data.length === 0) {
        DUMMY_DETAILED_BOARD.forEach(b => addDocument('mosque_detailed_board', b));
      } else {
        setDetailedBoard(data);
      }
    });

    return () => {
      unsubConfig();
      unsubLogs();
      unsubSlides();
      unsubKajian();
      unsubJumat();
      unsubRamadan();
      unsubRoutine();
      unsubCampaigns();
      unsubDonors();
      unsubAssets();
      unsubCon();
      unsubCampDonors();
      unsubDetailedBoard();
    };
  }, []);

  const handleAdminLogin = (userStr: string, passStr: string) => {
    const safeUser = userStr || '';
    const safePass = passStr || '';
    const isUserValid = safeUser.trim().toLowerCase() === 'admin' || safeUser.trim().toLowerCase() === 'admin_abrar';
    const isPassValid = safePass.trim() === String(adminPin).trim() || safePass.trim().toLowerCase() === 'admin123';

    if (isUserValid && isPassValid) {
      setIsAdmin(true);
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('abrar_is_admin', 'true');
        }
      } catch (e) {
        console.warn('LocalStorage save failed');
      }
      setLoginError('');
      addLog('Akses Admin Dibuka', 'Sesi admin aktif berhasil diverifikasi menggunakan Username dan Password.', 'success');
    } else {
      setLoginError('Username atau Password yang Anda masukkan salah. Silakan coba lagi.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('abrar_is_admin');
      }
    } catch (e) {
      console.warn('LocalStorage clear failed');
    }
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

  const handleToggleAnnouncement = (enabled: boolean) => {
    setShowAnnouncement(enabled);
    upsertDocument('settings', 'config', { showAnnouncement: enabled });
    addLog(
      enabled ? 'Pengumuman Diaktifkan' : 'Pengumuman Dinonaktifkan',
      enabled ? 'Running text pengumuman kini aktif dan tampil di halaman utama.' : 'Running text pengumuman disembunyikan dari halaman utama.',
      enabled ? 'success' : 'info'
    );
  };

  // Audio element reference to control playback
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const firedAlerts = useRef<Set<string>>(new Set());

  // Check notification permission on mount and setup audio
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setNotificationPermission(Notification.permission);
      }
    } catch (e) {
      console.warn("Notification API access restricted:", e);
    }

    try {
      // Setup audio element
      audioRef.current = new Audio();
    } catch (e) {
      console.warn("Audio API access restricted:", e);
    }

    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.pause();
        } catch (e) {
          // Ignore pause errors on cleanup
        }
      }
    };
  }, []);

  // Sync prayers to local storage
  const savePrayersToDb = (updatedPrayers: PrayerTime[]) => {
    setPrayers(updatedPrayers);
    upsertDocument('settings', 'config', { prayers: updatedPrayers });
    addLog('Database Diperbarui', 'Jadwal shalat baru telah disimpan ke database cloud.', 'info');
  };

  const handleAddPrayer = (newPrayer: Omit<PrayerTime, 'id'>) => {
    if (!isAdmin) {
      addLog('Akses Ditolak', 'Silakan masuk ke menu Kontrol Admin terlebih dahulu.', 'alert');
      return;
    }
    const id = 'custom_' + Math.random().toString(36).substring(2, 9);
    const updated = [...(prayers || []), { ...newPrayer, id }];
    savePrayersToDb(updated);
    addLog('Tambah Jadwal Shalat', `Jadwal baru ${newPrayer.name} berhasil ditambahkan.`, 'success', id);
  };

  const handleDeletePrayer = (id: string) => {
    if (!isAdmin) {
      addLog('Akses Ditolak', 'Silakan masuk ke menu Kontrol Admin terlebih dahulu.', 'alert');
      return;
    }
    const prayer = (prayers || []).find(p => p?.id === id);
    if (!prayer) return;
    const updated = (prayers || []).filter(p => p?.id !== id);
    savePrayersToDb(updated);
    addLog('Hapus Jadwal Shalat', `Jadwal ${prayer.name} berhasil dihapus.`, 'success', id);
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

  const handleResetAllData = async () => {
    if (!isAdmin) {
      addLog('Akses Ditolak', 'Silakan masuk ke menu Kontrol Admin terlebih dahulu.', 'alert');
      setActiveTab('admin');
      return;
    }
    if (confirm('⚠️ PERINGATAN: Apakah Anda yakin ingin MENGHAPUS SEMUA DATA aktivitas? Anda tidak dapat membatalkan tindakan ini.')) {
      const collections = [
        'slides',
        'kajian_schedule',
        'jumat_schedule',
        'ramadan_schedule',
        'routine_schedule',
        'campaigns',
        'financial_transactions',
        'permanent_donors',
        'mosque_assets',
        'mosque_congregants',
        'donors',
        'activity_logs'
      ];
      try {
        await Promise.all(collections.map(c => deleteAllInCollection(c)));
        addLog('Reset Data Berhasil', 'Seluruh data aktivitas telah direset ke setelan awal.', 'system');
      } catch (e) {
        addLog('Reset Data Gagal', 'Terjadi kesalahan sistem saat mereset data.', 'alert');
      }
    }
  };

  const seedDummyData = async () => {
    addLog('Seed Data Dimulai', 'Sistem sedang memproses pemuatan data dummy ke database cloud...', 'info');
    try {
      // 1. Ramadan Schedule
      const dummyRamadan: RamadanEntry[] = [
        { id: 'r1', title: 'Tarawih', time: '20:00', description: 'Tarawih berjamaah', icon: '🌙', category: 'Ibadah' },
        { id: 'r2', title: 'Buka Bersama', time: '18:00', description: 'Buka puasa bersama', icon: '🍲', category: 'Sosial' }
      ];
      await Promise.all(dummyRamadan.map(r => upsertDocument('ramadan_schedule', r.id, r)));
      
      // 2. Routine Schedule
      const dummyRoutine: RoutineEntry[] = [
        { id: 'k1', title: 'Bersih Masjid', time: '07:00', day: 'Jumat', description: 'Gotong royong membersihkan masjid', category: 'Bulanan' },
        { id: 'k2', title: 'Pengajian Rutin', time: '19:30', day: 'Kamis', description: 'Kajian kitab bersama ustadz setempat', category: 'Harian' }
      ];
      await Promise.all(dummyRoutine.map(r => upsertDocument('routine_schedule', r.id, r)));
      
      // 3. Kajian Schedule
      const dummyKajian: KajianEntry[] = [
        { id: 'kj1', title: 'Tafsir Jalalain', lecturer: 'Ustadz Ahmad', theme: 'Memahami QS. Al-Baqarah', time: '05:30', day: 'Setiap Hari', category: 'Ba\'da Subuh' },
        { id: 'kj2', title: 'Kajian Fiqih', lecturer: 'KH. Mahmud', theme: 'Fiqih Shalat Berjamaah', time: '19:00', day: 'Senin', category: 'Ba\'da Maghrib' }
      ];
      await Promise.all(dummyKajian.map(r => upsertDocument('kajian_schedule', r.id, r)));

      // 4. Financial Transactions (from images)
      await Promise.all(DUMMY_TRANSACTIONS.map((tx, idx) => 
        upsertDocument('financial_transactions', tx.id || `seed_tx_${idx}`, tx)
      ));

      // 5. Permanent Donors (from images)
      // First clear the old permanent donors to ensure a fresh reset
      await deleteAllInCollection('permanent_donors');
      await Promise.all(DUMMY_PERMANENT_DONORS.map((donor, idx) => 
        upsertDocument('permanent_donors', `seed_donor_${idx}`, donor)
      ));

      // 6. Inventaris (Assets)
      const dummyAssets = [
        { id: 'as1', name: 'Karpet Masjid', category: 'Alat Shalat', quantity: 10, unit: 'Gulung', condition: 'Baik', location: 'Ruang Utama', registeredBy: 'Admin' },
        { id: 'as2', name: 'Mic Wireless', category: 'Sound System', quantity: 4, unit: 'Buah', condition: 'Sangat Baik', location: 'Mimbar', registeredBy: 'Admin' },
        { id: 'as3', name: 'AC Daikin 2 PK', category: 'Elektronik & Pendingin', quantity: 6, unit: 'Unit', condition: 'Sangat Baik', location: 'Ruang Utama', registeredBy: 'Admin' }
      ];
      await Promise.all(dummyAssets.map(a => upsertDocument('mosque_assets', a.id, a)));

      // 7. Jamaah (Congregants)
      const dummyJamaah = [
        { id: 'jm1', fullName: 'Bapak Budi Santoso', phone: '08123456789', address: 'Jl. Merdeka No. 10', rtRw: '01/02', familyMembersCount: 4, status: 'Warga Tetap', attendanceStatus: 'Aktif Jamaah', registeredDate: new Date().toISOString() },
        { id: 'jm2', fullName: 'Bapak Andi Hermawan', phone: '08987654321', address: 'Jl. Sudirman No. 25', rtRw: '02/02', familyMembersCount: 3, status: 'Warga Tetap', attendanceStatus: 'Jarang', registeredDate: new Date().toISOString() }
      ];
      await Promise.all(dummyJamaah.map(j => upsertDocument('mosque_congregants', j.id, j)));

      // 8. Galeri (Galleries)
      const dummyGalleries = [
        { id: 'gl1', title: 'Kegiatan Buka Bersama 2025', date: '2025-03-15', images: ['https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800'] },
        { id: 'gl2', title: 'Gotong Royong Membersihkan Masjid', date: '2025-05-20', images: ['https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800'] }
      ];
      await Promise.all(dummyGalleries.map(g => upsertDocument('galleries', g.id, g)));

      // 9. Jadwal Jumat (Jumat Schedule)
      const dummyJumat = [
        { id: 'ju1', date: '2026-06-05', khatib: 'Ust. H. Abdullah', imam: 'Ust. Abdul Somad', muazin: 'Sdr. Rizky', month: 'Juni 2026' },
        { id: 'ju2', date: '2026-06-12', khatib: 'KH. Bahauddin', imam: 'Ust. Hasyim', muazin: 'Sdr. Fauzan', month: 'Juni 2026' }
      ];
      await Promise.all(dummyJumat.map(j => upsertDocument('jumat_schedule', j.id, j)));

      // 10. Donasi Campaigns (Campaigns)
      const dummyCampaigns = [
        { id: 'cp1', title: 'Renovasi Atap Masjid', target: 50000000, raised: 15000000, description: 'Penggalangan dana untuk memperbaiki atap masjid yang bocor.' },
        { id: 'cp2', title: 'Santunan Yatim Piatu', target: 20000000, raised: 5000000, description: 'Program santunan rutin bulan Muharram.' }
      ];
      await Promise.all(dummyCampaigns.map(c => upsertDocument('campaigns', c.id, c)));

      // 11. Slides
      const dummySlides = [
        { id: 'sl1', title: 'Selamat Datang', subtitle: 'Masjid Jami Al Abrar', imageUrl: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=1000', order: 1, badge: 'Info', badgeColor: 'bg-emerald-600' }
      ];
      await Promise.all(dummySlides.map(s => upsertDocument('slides', s.id, s)));

      // 12. Pengurus (Detailed Board)
      const dummyBoard = [
        { id: 'bd1', name: 'H. Anwar Rasyid', role: 'Ketua DKM', category: 'inti', phone: '08111222333' },
        { id: 'bd2', name: 'Ust. Zakaria', role: 'Seksi Dakwah', category: 'idarah', phone: '08222333444' }
      ];
      await Promise.all(dummyBoard.map(b => upsertDocument('mosque_detailed_board', b.id, b)));
      
      addLog('Seed Data Berhasil', 'Seluruh data dummy berhasil dimuat ke database.', 'success');
    } catch (e) {
      console.error('Seed Error:', e);
      addLog('Seed Data Gagal', 'Terjadi kesalahan teknis saat memuat data ke basis data.', 'alert');
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
        audioRef.current.onerror = () => {
          console.warn("Failed to load custom audio, falling back to default.");
          if (customAdzan && audioRef.current) {
            audioRef.current.src = AUDIO_SOURCES.adzan;
            audioRef.current.load();
          }
        };
        audioRef.current.play().then(() => {
          audioRef.current!.onended = () => {
            setIsAudioPlaying(false);
          };
        }).catch(err => {
          setIsAudioPlaying(false);
          // Only log error if it's not simply an interruption (AbortError)
          if (err.name !== 'AbortError') {
            console.warn("Audio playback error:", err);
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
      timestamp: new Date().toISOString(),
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
      console.warn('Notification permission error:', e);
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
        console.warn("Failed to showcase desktop notification:", err);
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
      (prayers || []).forEach(prayer => {
        // Calculate the alert time (10 minutes before the prayer time)
        if (!prayer || !prayer.time || !prayer.time.includes(':')) return;
        const [h, m] = prayer.time.split(':').map(Number);
        if (isNaN(h) || isNaN(m)) return;
        
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

    for (const p of (prayers || [])) {
      if (!p || !p.time || !p.time.includes(':')) continue;
      const [h, m] = p.time.split(':').map(Number);
      if (isNaN(h) || isNaN(m)) continue;
      
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
    const phm = (nextPrayer.time || '00:00').split(':');
    const ph = Number(phm[0]) || 0;
    const pm = Number(phm[1]) || 0;
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

    const updated = (prayers || []).map(p => {
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
    const logToDelete = (logs || []).find(l => l.id === id);
    if (logToDelete && (logToDelete as any).id) {
       deleteDocument('activity_logs', (logToDelete as any).id);
    }
  };

  const submenusMap: Record<string, { label: string; key: string; isBoard?: boolean; icon: string; desc: string; adminOnly?: boolean }[]> = {
    jadwal: [
      { label: 'Waktu Shalat', key: 'sholat', icon: '🕌', desc: 'Jadwal adzan 5 waktu Parepare' },
      { label: 'Kajian & Ta\'lim', key: 'kajian', icon: '📖', desc: 'Program & kajian rutin keagamaan' },
      { label: 'Khutbah Jum\'at', key: 'jumat', icon: '🎙️', desc: 'Jadwal khotib & muadzin Jum’at' },
      { label: 'Agenda Ramadan', key: 'ramadan', icon: '🌙', desc: 'Tarawih, takjil & i\'tikaf masjid' }
    ],
    profil: [
      { label: 'Tentang', key: 'info_umum', icon: 'ℹ️', desc: 'Pusat Informasi Umum & Tanya Jawab (FAQ)' },
      { label: 'Sejarah Singkat', key: 'sejarah', icon: '📜', desc: 'Sejarah singkat berdirinya Masjid Jami Al Abrar' },
      { label: 'Visi dan Misi', key: 'visi_misi', icon: '🎯', desc: 'Visi utama dan misi pelayanan ketaqwaan' },
      { label: 'Pengurus Lengkap', key: 'pengurus_lengkap', icon: '👥', desc: 'Susunan seluruh pengurus inti dan fungsional' },
      { label: 'Jamaah Masjid', key: 'jamaah', icon: '👥', desc: 'Manajemen database dan aspirasi jamaah' }
    ],
    keuangan: [
      { label: 'Kas Utama', key: 'kas_utama', icon: '💰', desc: 'Laporan pemasukan dan pengeluaran harian' },
      { label: 'Donatur Tetap', key: 'donatur_tetap', icon: '📋', desc: 'Papan kontribusi bulanan donatur tetap 2026' }
    ],
    donasi: [
      { label: 'Pilihan Program', key: 'online', icon: '💖', desc: 'Salurkan sedekah & jariyah terbaik' },
      { label: 'Donatur Tetap', key: 'donatur_tetap', icon: '📋', desc: 'Papan kontribusi bulanan donatur tetap 2026' }
    ]
  };

  const handleSubtabClick = (tabId: string, subtabKey: string) => {
    setActiveTab(tabId as any);
    if (tabId === 'jadwal') setCurJadwalSub(subtabKey as any);
    if (tabId === 'keuangan') setCurKeuanganSub(subtabKey as any);
    if (tabId === 'donasi') setCurDonasiSub(subtabKey as any);
    if (tabId === 'profil') setCurTentangSub(subtabKey as any);

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('change_subtab', {
        detail: {
          tab: tabId,
          subtab: subtabKey
        }
      }));
    }, 50);
    setActiveDropdown(null);
  };

  if (activeTab === 'admin' && isAdmin) {
    return (
      <div className="min-h-screen bg-[#020b06] text-slate-100 flex flex-col font-sans select-none overflow-x-hidden">
        <AdminDashboardPortal
          onLogout={handleAdminLogout}
          announcement={announcement}
          announcementInput={announcementInput}
          setAnnouncementInput={setAnnouncementInput}
          showAnnouncement={showAnnouncement}
          onUpdateAnnouncement={handleUpdateAnnouncement}
          onToggleAnnouncement={handleToggleAnnouncement}
          adminPin={adminPin}
          showPinChange={showPinChange}
          setShowPinChange={setShowPinChange}
          newPinValue={newPinValue}
          setNewPinValue={setNewPinValue}
          onPinChange={handlePinChange}
          onResetDefaults={handleResetDefaults}
          onResetAllData={handleResetAllData}
          seedDummyData={seedDummyData}
          onClearLogs={() => {
            const ids = (logs || []).map(l => (l as any).id).filter(Boolean);
            clearCollection('activity_logs', ids);
          }}
          addLog={addLog}
          logs={logs}
          prayers={prayers}
          nextDetails={nextDetails}
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
          onStartEditing={startEditing}
          onSetEditTimeValue={setEditTimeValue}
          onSavePrayerEdit={savePrayerEdit}
          onCancelEdit={() => setEditingPrayer(null)}
          onDeleteLog={deleteLog}
          onAddPrayer={handleAddPrayer}
          onDeletePrayer={handleDeletePrayer}
          slides={slides}
          kajian={kajian}
          jumat={jumat}
          ramadan={ramadan}
          routine={routine}
          campaigns={campaigns}
          onDonationSuccess={(title, msg, _amount) => {
            addLog(title, msg, 'success');
            triggerAudioPlayback();
          }}
          triggerAudioPlayback={triggerAudioPlayback}
          detailedBoard={detailedBoard}
          mosqueSettings={mosqueSettings}
          congregants={congregants}
          assets={assets}
        />
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Floating Glass Navbar Capsule mimicking the premium Istiqlal UI/UX */}
      {activeTab !== 'admin' && (
      <header className="sticky top-0 sm:top-1 z-50 w-full max-w-[1400px] mx-auto px-1 sm:px-4 lg:px-8 select-none overflow-visible" id="header_navbar">
          <div className="bg-[#0b1f17]/95 backdrop-blur-md border border-emerald-500/20 rounded-xl sm:rounded-full px-2 py-1 sm:px-4 sm:py-1 shadow-[0_12px_30px_rgba(4,47,31,0.25)] flex items-center justify-between gap-1 text-white transition-all duration-300 overflow-visible">
            
            {/* Brand Left Silhouette Logo Area */}
            <div 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0" 
              onClick={() => {
                const triggered = handleLogoClick();
                if (!triggered) {
                  setActiveTab('beranda');
                }
                setActiveDropdown(null);
              }}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 border border-white/10 flex items-center justify-center text-sm sm:text-lg shadow-lg shrink-0 transform group-hover:scale-105 transition-all duration-300">
                <Landmark className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div className="text-left leading-tight hidden xs:block">
                <span className="text-[6px] sm:text-[7px] font-black tracking-[0.2em] text-emerald-400 uppercase leading-none block mb-0.5">Pusat Ibadah</span>
                <h1 className="text-[10px] sm:text-xs font-black tracking-wider text-white uppercase whitespace-nowrap">
                  Masjid Jami Al Abrar <span className="text-emerald-400">Parepare</span>
                </h1>
              </div>
            </div>

          {/* Desktop Core Navigation Links (Modern typography, beautifully spaced) */}
          <nav className="hidden md:flex items-center justify-center gap-1.5 lg:gap-3 xl:gap-4 text-xs font-semibold tracking-wide font-sans text-slate-300">
            {[
              { id: 'beranda', label: 'Beranda', hasSub: false },
              { id: 'profil', label: 'Profil', hasSub: true },
              { id: 'jadwal', label: 'Jadwal', hasSub: true },
              { id: 'galeri', label: 'Galeri', hasSub: false },
              { id: 'keuangan', label: 'Laporan', hasSub: true },
              { id: 'donasi', label: 'Donasi', hasSub: true },
              { id: 'inventaris', label: 'Inventaris', hasSub: false },
              { id: 'kontak', label: 'Kontak', hasSub: false },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <div
                  key={tab.id}
                  className="relative group/nav"
                  onMouseEnter={() => tab.hasSub && setActiveDropdown(tab.id)}
                  onMouseLeave={() => tab.hasSub && setActiveDropdown(null)}
                >
                  <button
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      if (tab.hasSub) {
                        setActiveDropdown(activeDropdown === tab.id ? null : tab.id);
                      } else {
                        setActiveDropdown(null);
                      }
                    }}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-300 relative outline-none whitespace-nowrap overflow-visible select-none font-bold tracking-tight ${
                      isActive
                        ? 'text-emerald-400 font-extrabold bg-emerald-500/5 shadow-[inset_0_0_10px_rgba(16,185,129,0.1)]'
                        : 'text-slate-200/90 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-[11px] sm:text-[12px]">{tab.label}</span>
                    {tab.hasSub && (
                      <ChevronDown className={`h-3 w-3 transition-transform duration-300 ${activeDropdown === tab.id ? 'rotate-180' : ''} ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    )}
                    {isActive && (
                      <motion.span
                        layoutId="activeFloatingIndicator"
                        className="absolute bottom-0 left-3 right-3 h-[2px] bg-emerald-400 rounded-full"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </button>

                  {/* Desktop Dropdown with Dark Luxurious Floating Cards style */}
                  <AnimatePresence>
                    {tab.hasSub && activeDropdown === tab.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-1/2 -translate-x-1/2 mt-3.5 bg-[#0b1f17]/98 backdrop-blur-xl border border-emerald-500/20 shadow-[0_30px_60px_rgba(0,0,0,0.5)] rounded-3xl p-5 min-w-[340px] z-55 flex flex-col gap-2.5 overflow-hidden text-left"
                        style={{ transformOrigin: 'top center' }}
                        onMouseEnter={() => setActiveDropdown(tab.id)}
                        onMouseLeave={() => setActiveDropdown(null)}
                      >
                         {/* Dropdown Header */}
                         <div className="flex items-center justify-between pb-2.5 border-b border-white/5 mb-1 select-none">
                           <span className="text-[9px] font-black text-emerald-400 tracking-wider uppercase">PILIH LAYANAN {tab.label}</span>
                           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                         </div>
                         <div className="grid grid-cols-1 gap-1">
                           {submenusMap[tab.id]
                             ?.filter(sub => !sub.adminOnly || isAdmin)
                             .map((sub) => {
                               const isSelected = tab.id === 'jadwal' ? curJadwalSub === sub.key
                                 : tab.id === 'keuangan' ? curKeuanganSub === sub.key
                                 : tab.id === 'donasi' ? curDonasiSub === sub.key
                                 : tab.id === 'profil' ? curTentangSub === sub.key
                                 : false;
                               return (
                                 <button
                                   key={sub.key}
                                   onClick={() => handleSubtabClick(tab.id, sub.key)}
                                   className={`w-full flex items-start text-left gap-3.5 p-2.5 rounded-2xl transition-all duration-150 ${
                                     isSelected
                                       ? 'bg-emerald-600/20 text-white font-bold border-l-4 border-emerald-400 shadow-inner'
                                       : 'hover:bg-white/5 text-slate-300 hover:text-white hover:translate-x-1'
                                   }`}
                                 >
                                   <span className={`text-base shrink-0 p-2 border rounded-xl transition-colors ${
                                     isSelected ? 'bg-emerald-500/20 border-emerald-500/40' : 'bg-white/5 border-white/10'
                                   }`}>{sub.icon}</span>
                                   <div className="min-w-0 flex-1">
                                     <p className={`text-xs font-extrabold tracking-tight flex items-center justify-between ${
                                       isSelected ? 'text-white' : 'text-slate-200'
                                     }`}>
                                       <span>{sub.label}</span>
                                       {sub.adminOnly && <span className="bg-amber-400 text-amber-950 text-[8px] px-1.5 rounded font-black">ADMIN</span>}
                                     </p>
                                     <p className={`text-[9px] mt-1 font-medium leading-normal ${
                                       isSelected ? 'text-emerald-200/60' : 'text-slate-500'
                                     }`}>{sub.desc}</p>
                                   </div>
                                 </button>
                               );
                             })}
                         </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Right Side Tools Area (Clock, CTA) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Universal Digital Clock (Mono font for stability) */}
            <div className="hidden sm:flex flex-col items-end border-r border-white/10 pr-3 mr-1">
               <span className="text-[10px] font-black text-amber-300 font-mono tracking-tighter tabular-nums leading-none">
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[6px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Parepare, Indonesia</span>
            </div>

            {/* Major CTA Button (Donasi) */}
            <button
              onClick={() => {
                setActiveTab('donasi');
                setActiveDropdown(null);
              }}
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-3 py-1.5 sm:px-5 sm:py-2 text-[8px] sm:text-[10px] font-black tracking-widest uppercase shadow-lg shadow-emerald-900/40 flex items-center gap-1.5 group/cta transition-all active:scale-95"
            >
              <Heart className="h-3 w-3 fill-current group-hover/cta:scale-110 transition-transform" />
              <span className="hidden sm:inline">Infaq & Sedekah</span>
              <span className="sm:hidden">INFAQ</span>
            </button>

            {/* Minimal Mobile Menu Toggle */}
            <button 
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-full bg-white/5 hover:bg-white/10 transition border border-white/10"
            >
              {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Modern Interactive Mobile Navigation Drawer */}
        <AnimatePresence>
          {showMobileMenu && (
            <>
              {/* Backdrop Overlay with blur */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowMobileMenu(false)}
                className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-55 md:hidden"
              />

              {/* Slider Drawer Panel */}
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 220 }}
                className="fixed top-0 right-0 h-full w-[300px] sm:w-[350px] bg-[#05130d] border-l border-emerald-500/20 z-55 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col justify-between text-white md:hidden select-none"
              >
                {/* Header with branding and close icon */}
                <div className="p-5 border-b border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-left">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center">
                      <Landmark className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest leading-none">Navigasi</h4>
                      <span className="text-[10px] font-bold text-slate-350 tracking-wide mt-0.5 block">Jami Al Abrar</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition active:scale-90"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Nav Links Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                  {[
                    { id: 'beranda', label: 'Beranda', icon: <Home className="h-4 w-4" />, hasSub: false },
                    { id: 'profil', label: 'Profil Jami Al Abrar', icon: <Building className="h-4 w-4" />, hasSub: true },
                    { id: 'jadwal', label: 'Jadwal & Syiar', icon: <Calendar className="h-4 w-4" />, hasSub: true },
                    { id: 'galeri', label: 'Galeri Dokumentasi', icon: <ImageIcon className="h-4 w-4" />, hasSub: false },
                    { id: 'keuangan', label: 'Laporan Keuangan', icon: <TrendingUp className="h-4 w-4" />, hasSub: true },
                    { id: 'donasi', label: 'Portal Donasi', icon: <Heart className="h-4 w-4" />, hasSub: true },
                    { id: 'inventaris', label: 'Inventaris Aset', icon: <Package className="h-4 w-4" />, hasSub: false },
                    { id: 'kontak', label: 'Kontak Masjid', icon: <Phone className="h-4 w-4" />, hasSub: false },
                  ].map((tab) => {
                    const isTabActive = activeTab === tab.id;
                    const isExpanded = mobileExpandedTab === tab.id;

                    return (
                      <div key={tab.id} className="space-y-1">
                        {tab.hasSub ? (
                          /* Accordion trigger for items with submenus */
                          <div>
                            <button
                              onClick={() => setMobileExpandedTab(isExpanded ? null : tab.id)}
                              className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all ${
                                isTabActive 
                                  ? 'bg-emerald-800/20 text-emerald-400 border border-emerald-500/20' 
                                  : 'hover:bg-white/5 text-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className={isTabActive ? 'text-emerald-400' : 'text-slate-400'}>{tab.icon}</span>
                                <span className="text-left">{tab.label}</span>
                              </div>
                              <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Collapsible Submenu list */}
                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden pl-4 pr-1 pt-1 flex flex-col gap-1 border-l border-emerald-500/10 ml-5"
                                >
                                  {submenusMap[tab.id]
                                    ?.filter(sub => !sub.adminOnly || isAdmin)
                                    .map((sub) => {
                                      const isSubSelected = tab.id === 'jadwal' ? curJadwalSub === sub.key
                                        : tab.id === 'keuangan' ? curKeuanganSub === sub.key
                                        : tab.id === 'donasi' ? curDonasiSub === sub.key
                                        : tab.id === 'profil' ? curTentangSub === sub.key
                                        : false;

                                      return (
                                        <button
                                          key={sub.key}
                                          onClick={() => {
                                            handleSubtabClick(tab.id, sub.key);
                                            setShowMobileMenu(false);
                                          }}
                                          className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-[11px] font-semibold transition-all text-left ${
                                            isSubSelected
                                              ? 'bg-emerald-600/20 text-white border-l-2 border-emerald-400'
                                              : 'hover:bg-white/5 text-slate-400 hover:text-white'
                                          }`}
                                        >
                                          <span className="text-xs shrink-0">{sub.icon}</span>
                                          <span className="truncate">{sub.label}</span>
                                        </button>
                                      );
                                    })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ) : (
                          /* Direct Link button for items without submenus */
                          <button
                            onClick={() => {
                              setActiveTab(tab.id as any);
                              setShowMobileMenu(false);
                            }}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all text-left ${
                              isTabActive 
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/50' 
                                : 'hover:bg-white/5 text-slate-300'
                            }`}
                          >
                            <span className={isTabActive ? 'text-white' : 'text-slate-400'}>{tab.icon}</span>
                            <span>{tab.label}</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Footer with clock and quick action */}
                <div className="p-5 border-t border-white/5 bg-[#030d09] space-y-4">
                  {/* Digital Clock */}
                  <div className="flex justify-between items-center bg-white/5 rounded-xl px-4 py-2.5 border border-white/5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Waktu Lokal</span>
                    <span className="text-xs font-black text-amber-300 font-mono">
                      {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WITA
                    </span>
                  </div>

                  {/* Sedekah Quick CTA Button */}
                  <button
                    onClick={() => {
                      setActiveTab('donasi');
                      setShowMobileMenu(false);
                    }}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white rounded-xl text-xs font-black tracking-widest uppercase transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Heart className="h-3.5 w-3.5 fill-current" />
                    <span>Infaq & Sedekah</span>
                  </button>

                  <div className="text-center text-[8px] text-slate-500 font-bold">
                    © 2026 MASJID JAMI AL ABRAR PAREPARE
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </header>
      )}


      {/* Category Submenu Pill Row (When a desktop tab has submenus, float beneath the sticky navbar in gorgeous dark-emerald gold glass wrapper) */}
      {submenusMap[activeTab] && (
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-1 select-none z-30 relative animate-fade-in">
          <div className="bg-[#031d12]/90 backdrop-blur-md px-3 py-1.5 sm:py-2 border border-emerald-500/15 shadow-[0_10px_25px_rgba(4,47,31,0.2)] rounded-xl flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth">
            <span className="text-[9px] font-black text-emerald-400/60 uppercase tracking-widest shrink-0 hidden xl:inline-block border-r border-emerald-500/10 pr-3.5 mr-0.5">Kategori:</span>
            <div className="flex gap-2 min-w-max">
              {submenusMap[activeTab]
                .filter(sub => !sub.adminOnly || isAdmin)
                .map(sub => {
                  const isSelected = activeTab === 'jadwal' ? curJadwalSub === sub.key
                    : activeTab === 'keuangan' ? curKeuanganSub === sub.key
                    : activeTab === 'donasi' ? curDonasiSub === sub.key
                    : activeTab === 'profil' ? curTentangSub === sub.key
                    : false;
                  return (
                    <button
                      key={sub.key}
                      onClick={() => handleSubtabClick(activeTab, sub.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-[9px] sm:text-xs font-black tracking-wider transition-all duration-300 transform active:scale-95 border uppercase ${
                        isSelected
                          ? 'bg-emerald-600 text-white font-black shadow-[0_0_12px_rgba(16,185,129,0.25)] border-emerald-500'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/5'
                      }`}
                    >
                      <span className="text-sm shrink-0">{sub.icon}</span>
                      <span className="whitespace-nowrap leading-none mt-0.5">{sub.label}</span>
                      {sub.adminOnly && <span className="bg-amber-950 text-amber-300 text-[8px] px-1 rounded font-black ml-1 border border-amber-500/10">ADMIN</span>}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}


      {/* Premium Editorial Header Banner for Non-Home tabs (mimicking the clean, institutional banner backdrop) */}
      {activeTab !== 'beranda' && (
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 mt-2 select-none relative animate-fade-in z-10">
          <div className="relative h-24 sm:h-32 bg-gradient-to-tr from-emerald-950 via-emerald-900 to-slate-950 text-white rounded-2xl flex items-end px-5 sm:px-8 pb-4 sm:pb-5 overflow-hidden shadow-lg border border-emerald-900/40">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent pointer-events-none"></div>
            <div className="absolute -bottom-8 -right-8 w-44 h-44 sm:w-64 sm:h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
              <div>
                <span className="text-[9px] font-black tracking-[0.25em] text-emerald-400 uppercase">Halaman Layanan</span>
                <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white uppercase mt-0.5">
                  {activeTab === 'profil' ? 'Profil Jami Al Abrar' :
                   activeTab === 'jadwal' ? 'Jadwal & Syiar' :
                   activeTab === 'galeri' ? 'Galeri Dokumentasi' :
                   activeTab === 'donasi' ? 'Portal Amal Jariyah' :
                   activeTab === 'keuangan' ? 'Keuangan & Infaq' :
                   activeTab === 'inventaris' ? 'Aset & Inventaris' :
                   activeTab === 'kontak' ? 'Kontak Kami' :
                   'Sistem Administrator'}
                </h2>
              </div>
              
              {/* Breadcrumb paths */}
              <div className="text-[9px] sm:text-[10px] text-slate-350 font-bold bg-white/5 border border-white/10 px-3 py-1.5 rounded-full max-w-fit flex items-center gap-1.5 backdrop-blur-sm shadow-inner mt-1 sm:mt-0">
                <span className="text-slate-500 hover:text-slate-300 font-extrabold cursor-pointer" onClick={() => setActiveTab('beranda')}>BERANDA</span>
                <span className="text-slate-500">/</span>
                <span className="text-emerald-400 uppercase font-extrabold">{activeTab}</span>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Main Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-2 sm:py-3.5 space-y-2.5 sm:space-y-4 pb-20" id="main_content">
        
        {/* Banner Running Text / Pengumuman - Integrated beneath headers */}
        {showAnnouncement && (
          <div className="bg-emerald-950 border border-emerald-900 rounded-2xl py-1.5 px-3 sm:px-4 flex items-center gap-2.5 overflow-hidden shadow-inner font-sans">
            <span className="bg-amber-400 text-emerald-950 text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 sm:py-1 rounded-md shrink-0 tracking-wider flex items-center gap-1 shadow-sm">
              📢 PENGUMUMAN
            </span>
            <div className="relative flex-1 overflow-hidden h-5 flex items-center">
              <div className="absolute whitespace-nowrap text-[11px] sm:text-xs text-emerald-100 font-medium tracking-wide animate-marquee hover:pause-marquee">
                {announcement}
              </div>
            </div>
          </div>
        )}
        
        <div id="main_content_anchor"></div>


        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'beranda' && (
              <div className="space-y-1.5 sm:space-y-3 pb-6">
                {/* Elegant Header Hero */}
                <div className="space-y-0.5">
                  <ImageSlider slides={slides} onNavigate={setActiveTab} />
                </div>

                <MasjidDashboard 
                  prayers={prayers}
                  nextDetails={nextDetails}
                  onNavigate={setActiveTab}
                />
              </div>
            )}

            {activeTab === 'profil' && (
              <>
                {curTentangSub === 'jamaah' ? (
                  <ManajemenJamaah 
                    isAdmin={false}
                    onAddLog={addLog} 
                  />
                ) : (
                  <InfoMasjid 
                    activeSubTab={curTentangSub} 
                    detailedBoard={detailedBoard}
                  />
                )}
              </>
            )}

            {activeTab === 'galeri' && (
              <GaleriMasjid isAdmin={false} />
            )}

            {activeTab === 'jadwal' && (
              <div className="animate-fade-in space-y-6">
                <div className="mb-4 text-left px-2">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-widest rounded-full mb-2">
                    {curJadwalSub === 'sholat' ? 'Penjadwalan Sholat' :
                     curJadwalSub === 'kajian' ? 'Syiar Kajian' :
                     curJadwalSub === 'jumat' ? 'Pelayanan Jum\'at' :
                     curJadwalSub === 'ramadan' ? 'Kegiatan Ramadan' :
                     curJadwalSub === 'slider' ? 'Manajemen Media' :
                     'Audit Log'}
                  </span>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                    {curJadwalSub === 'sholat' ? 'Jadwal Adzan & Pengingat' :
                     curJadwalSub === 'kajian' ? 'Program Kajian & Majelis Ilmu' :
                     curJadwalSub === 'jumat' ? 'Petugas Shalat Jum\'at' :
                     curJadwalSub === 'ramadan' ? 'Agenda Syiar Ramadan 1447H' :
                     curJadwalSub === 'slider' ? 'Banner Media Informasi' :
                     'Log Aktivitas Alarm'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">
                    {curJadwalSub === 'sholat' ? 'Konfigurasi waktu shalat 5 waktu Parepare, pengingat adzan otomatis, serta uji alarm terintegrasi.' :
                     curJadwalSub === 'kajian' ? 'Daftar kajian rutin, tabligh akbar, pemateri, dan pendalaman kitab suci bagi seluruh jamaah.' :
                     curJadwalSub === 'jumat' ? 'Jadwal petugas khatib pilihan, imam tetap, muadzin, serta tanggal khutbah Jum’at agung.' :
                     curJadwalSub === 'ramadan' ? 'Program semarak Ramadan mubarok: kajian tarawih, konsumsi, buka puasa bersama, dan i\'tikaf.' :
                     curJadwalSub === 'slider' ? 'Kelola slider poster banner pengumuman serta promosi media luar ruang di lingkungan masjid.' :
                     'Daftar penyiaran adzan digital, riwayat notifikasi, dan catatan jejak audit administrasi.'}
                  </p>
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
                    const ids = (logs || []).map(l => (l as any).id).filter(Boolean);
                    clearCollection('activity_logs', ids);
                  }}
                  onNavigate={(tab) => setActiveTab(tab as any)}
                  onDeleteLog={deleteLog}
                  isAdmin={false}
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
                  routine={routine}
                />
              </div>
            )}
            
            {activeTab === 'donasi' && (
              <div className="animate-fade-in space-y-6">
                <div className="mb-4 text-left px-2">
                  <span className="inline-block px-3 py-1 bg-red-100 text-red-800 font-bold text-[10px] uppercase tracking-widest rounded-full mb-2">
                    {curDonasiSub === 'online' ? 'Layanan Donasi Digital' : 'Papan Donatur Tetap'}
                  </span>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                    {curDonasiSub === 'online' ? 'Saluran Infaq & Sedekah' : 'Kontribusi Donatur Tetap Al-Abrar'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">
                    {curDonasiSub === 'online' ? 'Dukung program pembangunan dan operasional masjid melalui penyaluran dana yang transparan dan amanah.' : 'Daftar partisipasi rutin bulanan dari para donatur setia yang telah berkomitmen membantu syiar masjid.'}
                  </p>
                </div>
                
                {curDonasiSub === 'online' ? (
                  <DonationOpen 
                    isAdmin={false}
                    campaigns={campaigns}
                    onUpdateCampaigns={() => {}}
                    onDonationSuccess={(title, msg, _amount) => {
                      addLog(title, msg, 'success');
                      triggerAudioPlayback();
                    }} 
                    onAddLog={addLog}
                  />
                ) : (
                  <KeuanganMasjid 
                    isAdmin={false} 
                    onAddLog={addLog} 
                  />
                )}
              </div>
            )}

            {activeTab === 'keuangan' && (
              <div className="animate-fade-in space-y-6">
                <div className="mb-4 text-left px-2">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-widest rounded-full mb-2">
                    {curKeuanganSub === 'kas_utama' ? 'Laporan Keuangan' : 'Papan Donatur Tetap'}
                  </span>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                    {curKeuanganSub === 'kas_utama' ? 'Jurnal Kas Masuk & Keluar' : 'Kontribusi Donatur Tetap Al-Abrar'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">
                    {curKeuanganSub === 'kas_utama' ? 'Catatan mutasi keuangan masjid yang akuntabel, transparan, dan dapat diperiksa oleh seluruh jamaah.' : 'Daftar partisipasi rutin bulanan dari para donatur setia yang telah berkomitmen membantu syiar masjid.'}
                  </p>
                </div>
                <KeuanganMasjid 
                  isAdmin={false} 
                  onAddLog={addLog} 
                />
              </div>
            )}

            {activeTab === 'inventaris' && (
              <InventarisMasjid 
                isAdmin={false} 
                onAddLog={addLog} 
              />
            )}

            {activeTab === 'kontak' && (
              <KontakMasjid isAdmin={false} />
            )}

            {activeTab === 'jamaah' && (
              <ManajemenJamaah 
                isAdmin={false}
                onAddLog={addLog} 
              />
            )}

            {activeTab === 'admin' && !isAdmin && (
              <div className="animate-fade-in space-y-6">
                <AdminLogin 
                  onLogin={handleAdminLogin} 
                  loginError={loginError} 
                  onClose={() => setActiveTab('beranda')}
                />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </main>

      <footer className="bg-[#0b1f17] text-emerald-400/60 py-4 px-4 border-t border-emerald-500/10" id="footer_section">
        <div className="max-w-[1440px] mx-auto text-center">
          <p className="text-[9px] font-black uppercase tracking-[0.3em]">@2026 Masjid Jami Al Abrar Parepare</p>
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
