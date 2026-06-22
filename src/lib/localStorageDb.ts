import { supabase } from './supabase';
import { MosqueProfile, PrayerTime, Hadith, KajianSchedule, QurbanMember, QurbanTransaction, FinancialReport, AktivitasItem } from '../types';
import { MOCK_PROFILE, MOCK_DONORS } from '../data/mockData';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';

// Custom interfaces for new admin features
export interface HomeSlider {
  id: number;
  image: string;
  title: string;
  description: string;
}

export interface LivestreamConfig {
  videoId: string;
  title: string;
  isActive: boolean;
}

export interface AudioConfig {
  quranUrl: string;
  songUrl: string; // Sholawat / Masjid song
  azanUrl: string;
  isMuted: boolean;
  quranVolume: number;
  songVolume: number;
  azanVolume: number;
}

// Default initial mock data
const DEFAULT_PROFILE: MosqueProfile = {
  name: "Masjid Jami Al Abrar",
  history: "Masjid Jami Al Abrar didirikan pada tahun 1985 sebagai pusat dakwah dan pembinaan umat di Kota Parepare. Berawal dari musholla kecil, kini telah berkembang menjadi pusat kegiatan keagamaan yang melayani ribuan jamaah setiap bulannya.",
  vision: "Menjadi pusat peribadatan dan pemberdayaan umat yang transparan, profesional, dan melayani dengan sepenuh hati.",
  mission: [
    "Menyediakan fasilitas ibadah yang nyaman dan bersih bagi seluruh jamaah.",
    "Menyelenggarakan kajian keislaman yang moderat dan berkualitas di Kota Parepare.",
    "Mengelola dana umat secara transparan dan akuntabel.",
    "Memberdayakan ekonomi umat melalui program-program sosial kreatif."
  ],
  capacity: 1500,
  established_year: 1985,
  address: "Jl Jend Ahmad Yani Km 5, Kec Ujung, Kel Lapadde, Parepare, Sulawesi Selatan",
  phone: "0811-4567-890",
  email: "kontak@alabrar-parepare.or.id"
};

const DEFAULT_PRAYER_TIMES = [
  { id: 1, name: 'Subuh', time: '04:46', rakaat: 2 },
  { id: 2, name: 'Terbit', time: '06:05', rakaat: 0 },
  { id: 3, name: 'Dzuhur', time: '12:08', rakaat: 4 },
  { id: 4, name: 'Ashar', time: '15:31', rakaat: 4 },
  { id: 5, name: 'Maghrib', time: '18:07', rakaat: 3 },
  { id: 6, name: 'Isya', time: '19:21', rakaat: 4 },
];

const DEFAULT_SLIDERS: HomeSlider[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1590075865003-e48277adc558?auto=format&fit=crop&q=80&w=1600&h=600",
    title: "Masjid Jami Al-Abrar Parepare",
    description: "Tempat Teduh Meniti Cahaya Ilahi di Jantung Kota Parepare"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=1600&h=600",
    title: "Kajian Tarbiyah Rutin",
    description: "Saksikan live streaming kajian rutin setiap malam akhir pekan di website resmi"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=1600&h=600",
    title: "Tabungan Qurban 1447H",
    description: "Mulai langkah berkurban Anda dengan menabung amanah dan terprogram bersama Masjid Jami Al-Abrar"
  }
];

const DEFAULT_HADITHS: Hadith[] = [
  {
    id: 1,
    text_arab: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
    translation: "Sesungguhnya setiap amalan itu bergantung pada niatnya.",
    source: "HR. Bukhari & Muslim",
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    text_arab: "مَنْ بَنَى مَسْجِدًا لِلَّهِ بَنَى اللَّهُ لَهُ فِي الْجَنَّةِ مِثْلَهُ",
    translation: "Barangsiapa membangun masjid karena Allah, maka Allah akan membangunkan rumah baginya di surga.",
    source: "HR. Bukhari",
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    text_arab: "الدُّنْيَا مَلْعُونَةٌ مَلْعُونٌ مَا فِيهَا إِلاَّ ذِكْرَ اللَّهِ",
    translation: "Dunia itu terlaknat dan terlaknat pula apa yang ada di dalamnya, kecuali dzikir kepada Allah.",
    source: "HR. Tirmidzi",
    created_at: new Date().toISOString()
  }
];

const DEFAULT_KAJIAN: KajianSchedule[] = [
  {
    id: 1,
    title: "Tafsir Jalalain: Kitab Al-Baqarah",
    speaker: "Ustadz Dr. H. Muh. Syahrir, Lc., M.A.",
    location: "Ruang Utama Masjid Al Abrar",
    start_time: (() => {
      const d = new Date();
      d.setHours(18, 15, 0, 0);
      return d.toISOString();
    })(),
    category: "Tafsir",
    recurrence: "Setiap Malam Ahad"
  },
  {
    id: 2,
    title: "Fiqih Muamalah Kontemporer",
    speaker: "Ustadz Ahmad Fauzi, M.H.I.",
    location: "Pelataran Masjid Jami Al Abrar",
    start_time: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(16, 0, 0, 0);
      return d.toISOString();
    })(),
    category: "Fiqih",
    recurrence: "Setiap Sabtu Sore"
  },
  {
    id: 3,
    title: "Hadits Arba’in An-Nawawiyah",
    speaker: "K.H. Muhammad Basri",
    location: "Ruang Utama Masjid",
    start_time: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 2);
      d.setHours(19, 30, 0, 0);
      return d.toISOString();
    })(),
    category: "Hadits",
    recurrence: "Setiap Malam Jum'at"
  }
];

const DEFAULT_LIVESTREAM: LivestreamConfig = {
  videoId: "K-R-nQ0K-OQ", // Example placeholder ID (or free useful streaming/sceneric ID)
  title: "Live Streaming Kajian & Shalat Masjid Jami Al-Abrar Parepare",
  isActive: true
};

const DEFAULT_AUDIO: AudioConfig = {
  // Free public audio tracks on internet archive / standard public-domain mp3 (stable, safe links from radio, internetarchive etc.)
  quranUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", // beautiful audio
  songUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",  // sholawat / tarhim chime
  azanUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3", // beautiful adzan MP3
  isMuted: false,
  quranVolume: 0.8,
  songVolume: 0.7,
  azanVolume: 0.9
};

const DEFAULT_QURBAN_MEMBERS: QurbanMember[] = [
  { id: 1, name: "Ir. H. Syamsuddin", phone: "08123456781", target_amount: 3500000, type: "Sapi (Kolektif)" },
  { id: 2, name: "Ibu Hj. Aminah Basri", phone: "08523456782", target_amount: 3500000, type: "Sapi (Kolektif)" },
  { id: 3, name: "Bapak Drs. Ruslan", phone: "08134567893", target_amount: 3500000, type: "Sapi (Kolektif)" },
  { id: 4, name: "Ibu Fatimah Az-Zahra", phone: "08124445556", target_amount: 2500000, type: "Kambing" }
];

const DEFAULT_QURBAN_TRANSACTIONS: QurbanTransaction[] = [
  { id: 1, member_id: 1, amount: 1500000, transaction_date: "2026-05-01" },
  { id: 2, member_id: 1, amount: 2000000, transaction_date: "2026-06-15" },
  { id: 3, member_id: 2, amount: 1750000, transaction_date: "2026-04-20" },
  { id: 4, member_id: 2, amount: 1000000, transaction_date: "2026-05-25" },
  { id: 5, member_id: 3, amount: 3500000, transaction_date: "2026-06-01" },
  { id: 6, member_id: 4, amount: 1500000, transaction_date: "2026-06-10" }
];

const DEFAULT_FINANCIALS: FinancialReport[] = [
  { id: 1, type: "income", category: "Infaq Jum'at", amount: 2450000, description: "Infaq Shalat Jumat Minggu ke-2 Juni", transaction_date: "2026-06-12" },
  { id: 2, type: "income", category: "Zakat", amount: 1500000, description: "Zakat Maal Hamba Allah", transaction_date: "2026-06-14" },
  { id: 3, type: "expense", category: "Sarana", amount: 450000, description: "Pembelian Air Mineral Gelas (10 Dus) & Tisue", transaction_date: "2026-06-15" },
  { id: 4, type: "expense", category: "Pemeliharaan", amount: 1200000, description: "Perbaikan Pendingin Ruangan (AC) Masjid", transaction_date: "2026-06-16" },
  { id: 5, type: "income", category: "Infaq Jum'at", amount: 3100000, description: "Infaq Shalat Jumat Minggu ke-3 Juni", transaction_date: "2026-06-19" },
  { id: 6, type: "expense", category: "Sosial", amount: 500000, description: "Santunan Anak Yatim Lingkungan Masjid", transaction_date: "2026-06-20" },
  { id: 7, type: "income", category: "Sedekah", amount: 800000, description: "Sedekah Jariyah dari Musafir", transaction_date: "2026-06-21" }
];

const DEFAULT_ACTIVITIES: AktivitasItem[] = [
  {
    id: 1,
    title: "TKA - TPA Al Abrar Unit 021",
    subtitle: "Pendidikan Al-Qur'an Anak Berizin Resmi LPPTKA BKPRMI",
    description: "Menyelenggarakan proses pembelajaran mengaji anak usia dini dengan kurikulum tajwid, setoran hafalan surat pendek, adab Islami, doa harian, dan praktek ibadah praktis. Memiliki nomor unit resmi 021 di Parepare.",
    schedule: "Senin s/d Jum'at Sore (16:00 - 17:30 WITA)",
    beneficiary: "Anak-Anak / Remaja di lingkungan Lapadde",
    badge: "Pendidikan",
    image: "/input_file_0.png",
    colorGradient: "from-emerald-50 to-teal-50/50",
    iconColor: "text-emerald-700 bg-emerald-100",
    borderColor: "border-emerald-100",
    iconName: "book"
  },
  {
    id: 2,
    title: "Kamar Musafir Gratis & Nyaman",
    subtitle: "Layanan Sosial Penginapan Musafir 24 Jam",
    description: "Menyediakan kamar peristirahatan khusus yang ramah, bersih, dan aman bagi saudara muslim (musafir) yang sedang melakukan perjalanan jauh (safari) melintasi kota Parepare tanpa dipungut biaya sepeser pun.",
    schedule: "Tersedia Setiap Saat (Non-stop)",
    beneficiary: "Musafir lintas daerah / provinsi",
    badge: "Social & Layanan",
    image: "/input_file_1.png",
    colorGradient: "from-amber-50 to-orange-50/50",
    iconColor: "text-amber-700 bg-amber-100",
    borderColor: "border-amber-100",
    iconName: "coffee"
  },
  {
    id: 3,
    title: "Masjid Buka 24 Jam Terbuka",
    subtitle: "Pusat Peribadatan Non-Stop Tanpa Terkunci",
    description: "Sesuai plang maklumat resmi 'MASJID BUKA 24 JAM', pintu gerbang peribadatan selalu terbuka lebar untuk masyarakat yang ingin menunaikan ibadah, shalat malam, I'tikaf, tadarus mutiara Al-Qur'an, maupun istirahat sejenak.",
    schedule: "Setiap Hari (24 Jam Penuh)",
    beneficiary: "Seluruh Jamaah Umum & Masyarakat",
    badge: "Keagamaan",
    image: "/input_file_2.png",
    colorGradient: "from-sky-50 to-blue-50/50",
    iconColor: "text-sky-700 bg-sky-100",
    borderColor: "border-sky-105",
    iconName: "home"
  },
  {
    id: 4,
    title: "Kajian Tarbiyah & Fiqih Kontemporer",
    subtitle: "Penguatan Literasi Umat dengan Sanad Terjaga",
    description: "Menyelenggarakan kajian berkala mengenai Tafsir Jalalain, Fiqih Muamalah praktis, serta ulasan Hadits Arba'in An-Nawawiyah mendatangkan ulama dan akademisi se-Sulawesi Selatan guna membina akidah moderat.",
    schedule: "Malam Ahad & Sabtu Sore",
    beneficiary: "Jamaah Umum, Profesional, Mahasiswa",
    badge: "Dakwah & Kajian",
    image: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&q=80&w=800",
    colorGradient: "from-rose-50 to-red-50/40",
    iconColor: "text-rose-700 bg-rose-100",
    borderColor: "border-rose-100",
    iconName: "users"
  },
  {
    id: 5,
    title: "Majelis Taklim Akhwat Al Abrar",
    subtitle: "Pemberdayaan Perempuan & Pembinaan Keluarga Sakinah",
    description: "Komunitas aktif kaum akhwat yang menyelenggarakan pengajian khusus, pelatihan keterampilan keluarga dakwah sakinah, bakti sosial kaum dhuafa, serta koordinasi arisan kesejahteraan jamaah.",
    schedule: "Setiap Kamis Siang",
    beneficiary: "Ibu-Ibu & Kaum Akhwat Parepare",
    badge: "Pemberdayaan Akhwat",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=800",
    colorGradient: "from-purple-50 to-fuchsia-50/40",
    iconColor: "text-purple-700 bg-purple-100",
    borderColor: "border-purple-100",
    iconName: "heart"
  }
];

// LocalStorage Helper to manage local variables and fire update events
export class LocalDb {
  private static get<T>(key: string, defaultValue: T): T {
    try {
      const stored = localStorage.getItem(`al_abrar_${key}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Error loading local key:', key, e);
    }
    this.set(key, defaultValue);
    return defaultValue;
  }

  private static set(key: string, value: any): void {
    try {
      localStorage.setItem(`al_abrar_${key}`, JSON.stringify(value));
      // Dispatch updating event
      window.dispatchEvent(new CustomEvent('db-update', { detail: { key } }));
    } catch (e) {
      console.error('Error saving local key:', key, e);
    }
  }

  private static async syncListToFirestore(collectionName: string, items: any[]) {
    try {
      const snap = await getDocs(collection(db, collectionName));
      const incomingIds = new Set(items.map(item => String(item.id)));
      for (const d of snap.docs) {
        if (!incomingIds.has(d.id)) {
          await deleteDoc(doc(db, collectionName, d.id));
        }
      }
      for (const item of items) {
        await setDoc(doc(db, collectionName, String(item.id)), item);
      }
    } catch (e) {
      console.error(`Error syncing list to ${collectionName}:`, e);
    }
  }

  static async syncWithFirestore() {
    console.log("Syncing with Firestore database...");
    try {
      await Promise.all([
        // 1. Profile
        getDocs(collection(db, "al_abrar_profile")).then(async (snap) => {
          if (snap.empty) {
            await setDoc(doc(db, "al_abrar_profile", "mosque"), DEFAULT_PROFILE);
          } else {
            const data = snap.docs[0].data() as MosqueProfile;
            this.set('profile', data);
          }
        }),

        // 2. Prayer Times
        getDocs(collection(db, "al_abrar_prayer_times")).then(async (snap) => {
          if (snap.empty) {
            for (const t of DEFAULT_PRAYER_TIMES) {
              await setDoc(doc(db, "al_abrar_prayer_times", String(t.id)), t);
            }
          } else {
            const times = snap.docs.map(d => d.data()).sort((a: any, b: any) => a.id - b.id);
            this.set('prayer_times', times);
          }
        }),

        // 3. Sliders
        getDocs(collection(db, "al_abrar_sliders")).then(async (snap) => {
          if (snap.empty) {
            for (const s of DEFAULT_SLIDERS) {
              await setDoc(doc(db, "al_abrar_sliders", String(s.id)), s);
            }
          } else {
            const sliders = snap.docs.map(d => d.data()).sort((a: any, b: any) => a.id - b.id);
            this.set('sliders', sliders);
          }
        }),

        // 4. Hadiths
        getDocs(collection(db, "al_abrar_hadiths")).then(async (snap) => {
          if (snap.empty) {
            for (const h of DEFAULT_HADITHS) {
              await setDoc(doc(db, "al_abrar_hadiths", String(h.id)), h);
            }
          } else {
            const hadiths = snap.docs.map(d => d.data()).sort((a: any, b: any) => a.id - b.id);
            this.set('hadiths', hadiths);
          }
        }),

        // 5. Kajian
        getDocs(collection(db, "al_abrar_kajian")).then(async (snap) => {
          if (snap.empty) {
            for (const k of DEFAULT_KAJIAN) {
              await setDoc(doc(db, "al_abrar_kajian", String(k.id)), k);
            }
          } else {
            const kajian = snap.docs.map(d => d.data()).sort((a: any, b: any) => a.id - b.id);
            this.set('kajian', kajian);
          }
        }),

        // 6. Livestream
        getDocs(collection(db, "al_abrar_livestream")).then(async (snap) => {
          if (snap.empty) {
            await setDoc(doc(db, "al_abrar_livestream", "youtube"), DEFAULT_LIVESTREAM);
          } else {
            const data = snap.docs[0].data() as LivestreamConfig;
            this.set('livestream', data);
          }
        }),

        // 7. Audio Config
        getDocs(collection(db, "al_abrar_audio")).then(async (snap) => {
          if (snap.empty) {
            await setDoc(doc(db, "al_abrar_audio", "settings"), DEFAULT_AUDIO);
          } else {
            const data = snap.docs[0].data() as AudioConfig;
            this.set('audio_config', data);
          }
        }),

        // 8. Qurban Members
        getDocs(collection(db, "al_abrar_qurban_members")).then(async (snap) => {
          if (snap.empty) {
            for (const m of DEFAULT_QURBAN_MEMBERS) {
              await setDoc(doc(db, "al_abrar_qurban_members", String(m.id)), m);
            }
          } else {
            const members = snap.docs.map(d => d.data()).sort((a: any, b: any) => a.id - b.id);
            this.set('qurban_members', members);
          }
        }),

        // 9. Qurban Transactions
        getDocs(collection(db, "al_abrar_qurban_transactions")).then(async (snap) => {
          if (snap.empty) {
            for (const t of DEFAULT_QURBAN_TRANSACTIONS) {
              await setDoc(doc(db, "al_abrar_qurban_transactions", String(t.id)), t);
            }
          } else {
            const txs = snap.docs.map(d => d.data()).sort((a: any, b: any) => a.id - b.id);
            this.set('qurban_transactions', txs);
          }
        }),

        // 10. Financials
        getDocs(collection(db, "al_abrar_financials")).then(async (snap) => {
          if (snap.empty) {
            for (const f of DEFAULT_FINANCIALS) {
              await setDoc(doc(db, "al_abrar_financials", String(f.id)), f);
            }
          } else {
            const financials = snap.docs.map(d => d.data()).sort((a: any, b: any) => a.id - b.id);
            this.set('financials', financials);
          }
        }),

        // 11. Activities
        getDocs(collection(db, "al_abrar_activities")).then(async (snap) => {
          if (snap.empty) {
            for (const act of DEFAULT_ACTIVITIES) {
              await setDoc(doc(db, "al_abrar_activities", String(act.id)), act);
            }
          } else {
            const activities = snap.docs.map(d => d.data()).sort((a: any, b: any) => a.id - b.id);
            this.set('activities', activities);
          }
        })
      ]);

      console.log("Firestore successfully synced to local storage.");
      window.dispatchEvent(new CustomEvent('db-update', { detail: { key: 'all' } }));
    } catch (err) {
      console.error("Firestore sync error:", err);
    }
  }

  // Getters
  static getProfile(): MosqueProfile {
    return this.get<MosqueProfile>('profile', DEFAULT_PROFILE);
  }

  static getPrayerTimes() {
    return this.get('prayer_times', DEFAULT_PRAYER_TIMES);
  }

  static getSliders(): HomeSlider[] {
    return this.get<HomeSlider[]>('sliders', DEFAULT_SLIDERS);
  }

  static getHadiths(): Hadith[] {
    return this.get<Hadith[]>('hadiths', DEFAULT_HADITHS);
  }

  static getKajian(): KajianSchedule[] {
    return this.get<KajianSchedule[]>('kajian', DEFAULT_KAJIAN);
  }

  static getLivestream(): LivestreamConfig {
    return this.get<LivestreamConfig>('livestream', DEFAULT_LIVESTREAM);
  }

  static getAudioConfig(): AudioConfig {
    return this.get<AudioConfig>('audio_config', DEFAULT_AUDIO);
  }

  static getQurbanMembers(): QurbanMember[] {
    return this.get<QurbanMember[]>('qurban_members', DEFAULT_QURBAN_MEMBERS);
  }

  static getQurbanTransactions(): QurbanTransaction[] {
    return this.get<QurbanTransaction[]>('qurban_transactions', DEFAULT_QURBAN_TRANSACTIONS);
  }

  static getFinancials(): FinancialReport[] {
    return this.get<FinancialReport[]>('financials', DEFAULT_FINANCIALS);
  }

  // Setters
  static saveProfile(profile: MosqueProfile) {
    this.set('profile', profile);
    setDoc(doc(db, "al_abrar_profile", "mosque"), profile).catch(e => console.error(e));
    supabase.from('mosque_profile').upsert(profile).then();
  }

  static savePrayerTimes(times: typeof DEFAULT_PRAYER_TIMES) {
    this.set('prayer_times', times);
    this.syncListToFirestore("al_abrar_prayer_times", times);
    times.forEach(t => {
      supabase.from('prayer_times').upsert({ id: t.id, name: t.name, time: `${t.time}:00` }).then();
    });
  }

  static saveSliders(sliders: HomeSlider[]) {
    this.set('sliders', sliders);
    this.syncListToFirestore("al_abrar_sliders", sliders);
  }

  static saveHadiths(hadiths: Hadith[]) {
    this.set('hadiths', hadiths);
    this.syncListToFirestore("al_abrar_hadiths", hadiths);
    hadiths.forEach(h => {
      supabase.from('hadiths').upsert(h).then();
    });
  }

  static saveKajian(kajian: KajianSchedule[]) {
    this.set('kajian', kajian);
    this.syncListToFirestore("al_abrar_kajian", kajian);
    kajian.forEach(k => {
      supabase.from('kajian_schedules').upsert(k).then();
    });
  }

  static saveLivestream(config: LivestreamConfig) {
    this.set('livestream', config);
    setDoc(doc(db, "al_abrar_livestream", "youtube"), config).catch(e => console.error(e));
  }

  static saveAudioConfig(config: AudioConfig) {
    this.set('audio_config', config);
    setDoc(doc(db, "al_abrar_audio", "settings"), config).catch(e => console.error(e));
  }

  static saveQurbanMembers(members: QurbanMember[]) {
    this.set('qurban_members', members);
    this.syncListToFirestore("al_abrar_qurban_members", members);
    members.forEach(m => {
      supabase.from('qurban_members').upsert({ id: m.id, name: m.name, phone: m.phone, target_amount: m.target_amount, type: m.type }).then();
    });
  }

  static saveQurbanTransactions(txs: QurbanTransaction[]) {
    this.set('qurban_transactions', txs);
    this.syncListToFirestore("al_abrar_qurban_transactions", txs);
    txs.forEach(t => {
      supabase.from('qurban_transactions').upsert(t).then();
    });
  }

  static saveFinancials(financials: FinancialReport[]) {
    this.set('financials', financials);
    this.syncListToFirestore("al_abrar_financials", financials);
    financials.forEach(f => {
      supabase.from('financial_reports').upsert(f).then();
    });
  }

  static getActivities(): AktivitasItem[] {
    const list = this.get<AktivitasItem[]>('activities', DEFAULT_ACTIVITIES);
    let updated = false;
    const migratedList = list.map(act => {
      // Migrate images to new uploaded documentation assets dynamically
      if (act.id === 1 && act.image !== '/input_file_0.png') {
        act.image = '/input_file_0.png';
        updated = true;
      } else if (act.id === 2 && act.image !== '/input_file_1.png') {
        act.image = '/input_file_1.png';
        updated = true;
      } else if (act.id === 3 && act.image !== '/input_file_2.png') {
        act.image = '/input_file_2.png';
        updated = true;
      }
      return act;
    });
    if (updated) {
      this.saveActivities(migratedList);
    }
    return migratedList;
  }

  static saveActivities(activities: AktivitasItem[]) {
    this.set('activities', activities);
    this.syncListToFirestore("al_abrar_activities", activities);
    activities.forEach(act => {
      supabase.from('activities').upsert(act).then();
    });
  }
}
