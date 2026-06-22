import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  History, 
  Target, 
  ShieldCheck, 
  Compass, 
  Users, 
  Clock, 
  Award, 
  Phone, 
  Mail, 
  MapPin,
  UserCheck,
  Zap,
  BookOpen,
  Calendar,
  Home,
  CheckCircle2,
  Heart,
  ChevronRight,
  Shield,
  Coffee,
  Info
} from 'lucide-react';
import { MosqueProfile } from '../types';
import { LocalDb } from '../lib/localStorageDb';

// Real Board Structure Data from Pictures (Periode 2025 - 2028)
const PENASEHAT = [
  "Camat Ujung (Pelindung/Penasehat)",
  "Kepala KUA Kec. Ujung (Pelindung/Penasehat)",
  "Lurah Lapadde (Pelindung/Penasehat)",
  "dr. H. Nurdin Samad, Sp.PD., FINASIM",
  "Prof. Dr. Drs. H. Amaluddin, M.Hum",
  "Drs. H. AT. Syamsul Eyber",
  "Dr. H. Surianto Abdul Muajib, S.Ag., MM.",
  "Dr. H. Muh Natsir, M.Pd"
];

const BOARD_SECTIONS = [
  {
    title: "Pembinaan Idarah (Administrasi & Kehumasan)",
    description: "Merencanakan, memimpin, mengoordinasi, dan mengawasi segala bentuk kegiatan ketatausahaan, humas, keuangan, serta aset masjid.",
    color: "from-terracotta-light to-terracotta-dark text-white border-terracotta-dark/30",
    gridColor: "bg-terracotta/5 border-terracotta/15",
    badgeColor: "bg-terracotta/10 text-terracotta",
    roles: [
      { label: "Ketua Umum", names: ["Kapt. Purn. H. Amir Sabana"] },
      { label: "Wakil Ketua I", names: ["Abdullah Jalil, SE., SH., M.Si"] },
      { label: "Wakil Ketua II", names: ["Drs. H. Muh. Sabir"] },
      { label: "Sekretaris", names: ["M. Darwis, SE"] },
      { label: "Wakil Sekretaris", names: ["Muhazil"] },
      { label: "Bendahara", names: ["Hardika"] },
      { label: "Wakil Bendahara", names: ["Ismail Majju, S.Pd."] },
      { label: "Seksi Dana", names: [
        "H. Mistang Hamid, SE", "Mujetahidin", "H. Yodi Haya, S.E., M.M", "Abd. Aziz",
        "H. Ade Musytahun Wahid, S.Si., M.M", "A. Maappasessu", "Askar", "Supriadi"
      ] },
      { label: "Seksi Ekonomi & Usaha", names: [
        "Darwis Ressa", "Nasruddin, S.E", "Ruslan, S.E", "Darnawan, S.E", "Drs. Kusnan Sossong, M.Si", "Akbar"
      ] },
      { label: "Seksi Kemasyarakatan (Koor: Amiruddin, SE)", names: [
        "Zakat: Pegawai Syara'",
        "Kesehatan: Ekawati, Amd.Keb, Hj. Helmyria Mappasessu, Amd.Keb",
        "Remaja Masjid: M. Rafly Jafar, Muh. Aswan, Muh. Saki, Risma"
      ] }
    ]
  },
  {
    title: "Pembinaan Imarah (Ibadah, Dakwah & Pendidikan)",
    description: "Mengupayakan kemakmuran masjid dengan program ibadah wajib, dakwah moderat, peringatan hari besar Islam, serta pendidikan Al-Qur'an anak-anak.",
    color: "from-amber-800 to-[#78350f] text-amber-50 border-amber-900/40",
    gridColor: "bg-amber-50/40 border-amber-100",
    badgeColor: "bg-amber-100 text-amber-800",
    roles: [
      { label: "Pegawai Syara' (Keimaman)", names: [
        "Imam Masjid: Drs. Abd. Hakim Latief, M.Pd.I",
        "Imam Rawatib: Nurdin Nawawi",
        "Khatib: M. Darwis, SE",
        "Muadzin: Rahman B Umar",
        "Pelayan: Anas, Hardika"
      ] },
      { label: "Seksi Hari Besar Islam", names: [
        "Endeng Suparman", "Basri Bas", "Arsyad Adam", "Amir Lawang", "Muh. Ilham", "Sayyed Sunarjo", "Bahar"
      ] },
      { label: "Seksi Pendidikan", names: [
        "Madrasah / Sekolah: H. Ahmad Toufik Tahir, S.Ag., MM, Drs. Buneyamin, Firdaus, S.Pd.",
        "Pustaka: Abdullah, S.Pd., Muaris",
        "RKA / TPQ: Hariyani, S.Ag., M.Pd.I, Hj. Norma"
      ] },
      { label: "Seksi Akhwat & Pemberdayaan Perempuan", names: [
        "Nurhayati, S.Pd. (Koordinator)", "Hj. Sudarti Baha, S.Pd", "Dra. Hj. Anisa", 
        "Dra. Hj. Saribanong", "Hj. Nurhayati Husain", "Hj. Ida", "Siti Rahmah", "Pengurus Majelis Taklim"
      ] }
    ]
  },
  {
    title: "Pembinaan Riayah (Sarana, Pembangunan & Keamanan)",
    description: "Memelihara keindahan fisik, kebersihan, kenyamanan ruangan, sistem tata suara, keamanan lingkungan, serta pembangunan kelanjutan infrastruktur.",
    color: "from-sky-800 to-[#0c4a6e] text-sky-50 border-sky-900/40",
    gridColor: "bg-sky-50/40 border-sky-100",
    badgeColor: "bg-sky-100 text-sky-800",
    roles: [
      { label: "Seksi Pembangunan", names: ["Drs. Muhammadong", "Syamsir Nali", "Syarif", "H. Muh. Yunus", "Sultan, S.Pd"] },
      { label: "Seksi Perlengkapan & Teknis", names: ["Arifin", "Adam", "Bahar Dareng", "Burhan", "H. Supu", "Muhammad Adha"] },
      { label: "Seksi Kebersihan", names: ["Anas", "Abd. Hamid", "Burhan", "Langgoe", "Abdulla Rajab"] },
      { label: "Keamanan & Pengawas", names: [
        "H. Syahrir", "Darwis Baha", "Nurdin", "Mustamin", "Hasnawati Sakka", "Muh. Yasin", "Bambang"
      ] }
    ]
  }
];

// Activity items representing photos
const AKTIVITAS_DATA = [
  {
    title: "TKA - TPA Al Abrar Unit 021",
    subtitle: "Pendidikan Al-Qur'an Anak Berizin Resmi LPPTKA BKPRMI",
    description: "Menyelenggarakan proses pembelajaran mengaji anak usia dini dengan kurikulum tajwid, setoran hafalan hafalan surat pendek, adab Islami, doa harian, dan praktek ibadah praktis. Memiliki nomor unit resmi 021 di Parepare.",
    schedule: "Senin s/d Jum'at Sore (16:00 - 17:30 WITA)",
    beneficiary: "Anak-Anak / Remaja di lingkungan Lapadde",
    icon: BookOpen,
    badge: "Pendidikan",
    color: "emerald"
  },
  {
    title: "Kamar Musafir Gratis & Nyaman",
    subtitle: "Layanan Sosial Penginapan Musafir 24 Jam",
    description: "Menyediakan kamar peristirahatan khusus yang ramah, bersih, dan aman bagi saudara muslim (musafir) yang sedang melakukan perjalanan jauh (safari) melintasi kota Parepare tanpa dipungut biaya sepeser pun.",
    schedule: "Tersedia Setiap Saat (Non-stop)",
    beneficiary: "Musafir lintas daerah / provinsi",
    icon: Coffee,
    badge: "Sosial & Layanan",
    color: "amber"
  },
  {
    title: "Masjid Buka 24 Jam Terbuka",
    subtitle: "Pusat Peribadatan Non-Stop Tanpa Terkunci",
    description: "Sesuai plang maklumat resmi 'MASJID BUKA 24 JAM', pintu gerbang peribadatan selalu terbuka lebar untuk masyarakat yang ingin menunaikan ibadah, shalat malam, I'tikaf, tadarus mutiara Al-Qur'an, maupun istirahat sejenak.",
    schedule: "Setiap Hari (24 Jam Penuh)",
    beneficiary: "Seluruh Jamaah Umum & Masyarakat",
    icon: Home,
    badge: "Keagamaan",
    color: "sky"
  },
  {
    title: "Kajian Tarbiyah & Fiqih Kontemporer",
    subtitle: "Penguatan Literasi Umat dengan Sanad Terjaga",
    description: "Menyelenggarakan kajian berkala mengenai Tafsir Jalalain, Fiqih Muamalah praktis, serta ulasan Hadits Arba'in An-Nawawiyah mendatangkan ulama dan akademisi se-Sulawesi Selatan guna membina akidah moderat.",
    schedule: "Malam Ahad & Sabtu Sore",
    beneficiary: "Jamaah Umum, Profesional, Mahasiswa",
    icon: Users,
    badge: "Dakwah & Kajian",
    color: "rose"
  },
  {
    title: "Majelis Taklim Akhwat Al Abrar",
    subtitle: "Pemberdayaan Perempuan & Pembinaan Keluarga Sakinah",
    description: "Komunitas aktif kaum akhwat yang menyelenggarakan pengajian khusus, pelatihan keterampilan keluarga dakwah sakinah, bakti sosial kaum dhuafa, serta koordinasi arisan kesejahteraan jamaah.",
    schedule: "Setiap Kamis Siang",
    beneficiary: "Ibu-Ibu & Kaum Akhwat Parepare",
    icon: Heart,
    badge: "Pemberdayaan Akhwat",
    color: "purple"
  }
];

interface ProfilMasjidProps {
  initialTab?: 'sejarah' | 'pengurus';
}

export default function ProfilMasjid({ initialTab = 'sejarah' }: ProfilMasjidProps) {
  const [profile, setProfile] = useState<MosqueProfile>(LocalDb.getProfile());
  const [activeTab, setActiveTab] = useState<'sejarah' | 'pengurus'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const loadProfile = () => {
    setProfile(LocalDb.getProfile());
  };

  useEffect(() => {
    loadProfile();

    const handleUpdate = () => {
      loadProfile();
    };
    window.addEventListener('db-update', handleUpdate);

    return () => {
      window.removeEventListener('db-update', handleUpdate);
    };
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#fdfdfc] via-cream to-[#f1ede2] min-h-screen pb-24">
      {/* Visual Page Header */}
      <div className="relative bg-terracotta text-white py-14 md:py-24 px-4 overflow-hidden border-b-4 border-gold shadow-md">
        {/* Decorative elements */}
        <div className="absolute top-[-30%] left-[-10%] w-[500px] h-[500px] bg-terracotta-light/40 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-96 h-96 bg-gold/15 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-black/10" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-5">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-16 h-16 bg-gold/15 text-gold border border-gold/30 rounded-2xl flex items-center justify-center mx-auto shadow-2xl backdrop-blur-sm"
          >
            <Compass className="h-8 w-8" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight uppercase leading-tight font-sans text-transparent bg-clip-text bg-gradient-to-r from-white via-cream to-white"
          >
            Tentang {profile.name}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-[#f5d9d2] text-xs md:text-sm font-semibold max-w-2xl mx-auto italic tracking-wide font-sans uppercase"
          >
            "Pusat keteduhan ibadah wajib, bimbingan takwa bersanad, serta pelopor kemaslahatan & perlindungan sosial masyarakat di Parepare"
          </motion.p>
        </div>
      </div>

      {/* Structured Switch Tab Controller */}
      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white/95 backdrop-blur-md p-2 rounded-3xl shadow-xl border border-gray-100 flex flex-nowrap overflow-x-auto justify-center space-x-4 max-w-xl mx-auto">
          <button
            onClick={() => setActiveTab('sejarah')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs md:text-sm font-bold uppercase tracking-wider shrink-0 transition-all ${
              activeTab === 'sejarah'
                ? 'bg-terracotta text-white shadow-md'
                : 'text-gray-500 hover:text-terracotta hover:bg-terracotta/5'
            }`}
          >
            <History className="h-4 w-4" />
            Visi & Sejarah
          </button>
          <button
            onClick={() => setActiveTab('pengurus')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs md:text-sm font-bold uppercase tracking-wider shrink-0 transition-all ${
              activeTab === 'pengurus'
                ? 'bg-terracotta text-white shadow-md'
                : 'text-gray-500 hover:text-terracotta hover:bg-terracotta/5'
            }`}
          >
            <UserCheck className="h-4 w-4" />
            Struktur Pengurus
          </button>
        </div>
      </div>

      {/* Tab Render Content */}
      <div className="max-w-5xl mx-auto px-4 mt-12">
        <AnimatePresence mode="wait">
          {activeTab === 'sejarah' && (
            <motion.div
              key="sejarah-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              {/* Quick Info Board */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-100 p-6 rounded-3xl text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-2xl bg-terracotta/5 text-terracotta flex items-center justify-center mx-auto mb-3 border border-terracotta/10">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="text-2xl md:text-3xl font-mono font-bold text-terracotta">{profile.capacity}</div>
                  <div className="text-[10px] uppercase font-sans font-extrabold text-gray-400 tracking-wider mt-1">Kapasitas Jamaah</div>
                </div>

                <div className="bg-white border border-gray-100 p-6 rounded-3xl text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-2xl bg-terracotta/5 text-terracotta flex items-center justify-center mx-auto mb-3 border border-terracotta/10">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div className="text-2xl md:text-3xl font-mono font-bold text-terracotta">{profile.established_year}</div>
                  <div className="text-[10px] uppercase font-sans font-extrabold text-gray-400 tracking-wider mt-1">Tahun Berdiri</div>
                </div>

                <div className="bg-white border border-gray-100 p-6 rounded-3xl text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-2xl bg-terracotta/5 text-terracotta flex items-center justify-center mx-auto mb-3 border border-terracotta/10">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="text-2xl md:text-3xl font-mono font-bold text-terracotta">100%</div>
                  <div className="text-[10px] uppercase font-sans font-extrabold text-gray-400 tracking-wider mt-1">Status Transparansi</div>
                </div>

                <div className="bg-white border border-gray-100 p-6 rounded-3xl text-center shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-11 h-11 rounded-2xl bg-terracotta/5 text-terracotta flex items-center justify-center mx-auto mb-3 border border-terracotta/10">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div className="text-2xl md:text-3xl font-mono font-bold text-terracotta flex items-center justify-center">24 Jam</div>
                  <div className="text-[10px] uppercase font-sans font-extrabold text-gray-400 tracking-wider mt-1">Layanan Terbuka</div>
                </div>
              </div>

              {/* Sejarah, Visi, Misi Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-8">
                  {/* Sejarah Singkat */}
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4">
                    <h2 className="text-xl font-extrabold text-terracotta flex items-center gap-2 pb-3 border-b border-gray-150">
                      <History className="h-5 w-5 text-amber-500" />
                      Sejarah Jami Al Abrar
                    </h2>
                    <p className="text-gray-650 text-sm leading-relaxed whitespace-pre-line text-justify font-sans">
                      {profile.history}
                    </p>
                  </div>

                  {/* Visi Kami */}
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-4">
                    <h2 className="text-xl font-extrabold text-terracotta flex items-center gap-2 pb-3 border-b border-gray-150">
                      <Target className="h-5 w-5 text-gold" />
                      Visi Masjid
                    </h2>
                    <p className="text-gray-700 text-sm leading-relaxed italic font-sans py-3 pl-4 border-l-4 border-gold bg-amber-50/20 rounded-r-2xl">
                      "{profile.vision}"
                    </p>
                  </div>
                </div>

                {/* Right Column: Mission and Contact */}
                <div className="lg:col-span-5 space-y-8">
                  {/* Misi Utama */}
                  <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
                    <h2 className="text-xl font-extrabold text-terracotta flex items-center gap-2 pb-3 border-b border-gray-150">
                      <ShieldCheck className="h-5 w-5 text-terracotta" />
                      Misi Pengurus
                    </h2>
                    <div className="space-y-4">
                      {profile.mission.map((m, i) => (
                        <div key={i} className="flex gap-3 items-start p-2.5 hover:bg-terracotta/5 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                          <div className="w-6 h-6 rounded-full bg-gold text-terracotta-dark flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                            {i + 1}
                          </div>
                          <p className="text-gray-700 text-xs leading-relaxed font-sans">{m}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Kontak Pengurus */}
                  <div className="bg-gradient-to-br from-terracotta to-terracotta-dark text-white rounded-3xl p-8 shadow-md border border-terracotta-dark relative overflow-hidden space-y-6">
                    <div className="absolute top-[-10%] right-[-10%] w-20 h-20 bg-white/5 blur-xl rounded-full" />
                    <h2 className="text-lg font-extrabold text-gold uppercase tracking-wider">Sekretariat Pengurus</h2>
                    <div className="space-y-5 text-xs text-cream-dark font-sans">
                      <div className="flex gap-3.5 items-start">
                        <MapPin className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                        <p className="leading-relaxed">{profile.address}</p>
                      </div>
                      <div className="flex gap-3.5 items-center">
                        <Phone className="h-5 w-5 text-gold shrink-0" />
                        <p className="font-bold text-sm text-white">{profile.phone}</p>
                      </div>
                      <div className="flex gap-3.5 items-center">
                        <Mail className="h-5 w-5 text-gold shrink-0" />
                        <p className="hover:underline cursor-pointer">{profile.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}



          {/* Tab 3: Struktur Pengurus */}
          {activeTab === 'pengurus' && (
            <motion.div
              key="pengurus-content"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-10"
            >
              <div className="text-center space-y-2 mb-10">
                <h2 className="text-2xl md:text-3xl font-extrabold text-terracotta">Struktur Pengurus Masjid</h2>
                <h3 className="text-xs text-amber-600 uppercase font-sans tracking-widest font-extrabold">MASJID JAMI AL ABRAR • PERIODE AMANAH 2025 - 2028</h3>
                <p className="text-gray-500 text-xs max-w-xl mx-auto mt-2 leading-relaxed">
                  Berdasarkan musyawarah syura mufakat jamaah dan kepengurusan Kelurahan Lapadde, Kecamatan Ujung Parepare, disusunlah pilar kepemimpinan terintegrasi.
                </p>
              </div>

              {/* Pelindung & Penasehat (Top tree element) */}
              <div className="bg-white border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 max-w-4xl mx-auto">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
                  <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900 uppercase tracking-wide">Pelindung & Dewan Penasehat</h3>
                    <p className="text-[10px] text-gray-400 uppercase font-sans">Membimbing arah strategis dan menjaga ketakwaan dakwah masjid</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {PENASEHAT.map((name, i) => (
                    <div key={i} className="bg-gray-50 border border-gray-100/60 p-4 rounded-2xl flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-gold/10 text-gold flex items-center justify-center text-xs font-bold font-mono">
                        {i + 1}
                      </div>
                      <span className="text-xs text-gray-700 font-semibold leading-relaxed font-sans">{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grouped Management Pillars (Idarah, Imarah, Riayah) */}
              <div className="space-y-12">
                {BOARD_SECTIONS.map((sec, secIndex) => (
                  <div key={sec.title} className="space-y-4">
                    {/* Header Banner for the section */}
                    <div className={`p-6 rounded-3xl border text-white bg-gradient-to-r ${sec.color} flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm`}>
                      <div className="space-y-1 max-w-2xl">
                        <h3 className="text-base md:text-lg font-extrabold uppercase tracking-wide">{sec.title}</h3>
                        <p className="text-xs leading-relaxed text-slate-100/80 font-sans">{sec.description}</p>
                      </div>
                      <span className="shrink-0 text-[10px] font-sans font-bold bg-gold text-terracotta-dark px-3.5 py-1.5 rounded-full uppercase tracking-wider self-start md:self-center">
                        Pilar {secIndex + 1}
                      </span>
                    </div>

                    {/* Roles Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sec.roles.map((role, rIndex) => (
                        <div key={role.label} className={`${sec.gridColor} border p-5 rounded-3xl flex flex-col justify-between space-y-3`}>
                          <div>
                            <span className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-extrabold uppercase tracking-wider ${sec.badgeColor} mb-3`}>
                              {role.label}
                            </span>
                            <ul className="space-y-2">
                              {role.names.map((n, nameIndex) => (
                                <li key={nameIndex} className="flex items-start gap-2 text-xs text-gray-800 font-semibold">
                                  <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0 mt-0.5" />
                                  <span className="font-sans leading-relaxed">{n}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-900 text-gold rounded-3xl p-6 text-center max-w-xl mx-auto space-y-2">
                <CheckCircle2 className="h-6 w-6 mx-auto" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Amanah & Dedikasi Sosial</h4>
                <p className="text-[10px] text-white/80 leading-relaxed font-sans">
                  Segenap Pengurus Masjid Jami Al Abrar mendedikasikan waktu, tenaga, pikiran, dan materi demi rida Allah SWT, kelancaran ibadah jamaah, serta kemakmuran umat muslim di Parepare.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
