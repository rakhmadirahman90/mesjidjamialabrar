import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  BookOpen, 
  Coffee, 
  Home, 
  Users, 
  Heart, 
  Info,
  Clock, 
  MapPin, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Award,
  X,
  PhoneCall,
  Sparkle
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LocalDb } from '../lib/localStorageDb';
import { AktivitasItem } from '../types';

// Matching iconName to dynamic Lucide Icon
const getIconComponent = (name?: string) => {
  switch (name) {
    case 'book': return BookOpen;
    case 'coffee': return Coffee;
    case 'home': return Home;
    case 'users': return Users;
    case 'heart': return Heart;
    case 'zap': return Zap;
    case 'sparkles': return Sparkles;
    case 'award': return Award;
    default: return Sparkles;
  }
};

const detailedSpecs: Record<string, { kurikulum?: string[]; fasilitas?: string[]; prosedur?: string[]; kontak?: string }> = {
  "TKA - TPA Al Abrar Unit 021": {
    kurikulum: [
      "Metode Iqra' praktis jilid 1 hingga jilid 6 secara komparatif",
      "Pelajaran tajwid makharijul huruf & sifat huruf secara mendalam",
      "Hafalan Juz 30 (Surah-Surah Pendek) & Doa Harian Terpilih",
      "Pembelajaran rukun iman, rukun Islam, serta sirah Nabawiyah lengkap",
      "Praktek ibadah harian: Syarat sah, rukun, & tata cara shalat wajib & wudhu secara bersandarkan fiqih syafii"
    ],
    fasilitas: [
      "Ruang belajar berpendingin AC yang nyaman, wangi & luas",
      "Mushaf Al-Qur'an khusus metode hafalan cepat & juz amma secara gratis",
      "Meja belajar kayu jati kokoh untuk kenyamanan posisi duduk tegak",
      "Tenaga pengajar/Ustadz-Ustadzah kompeten berlisensi & bersertifikat LPPTKA BKPRMI Parepare"
    ],
    kontak: "Ustadz Syarifuddin, S.Pd.I (0812-4455-6677 / Koordinator TKA-TPA)"
  },
  "Kamar Musafir Gratis & Nyaman": {
    prosedur: [
      "Menghubungi Pengurus Utama / Petugas Keamanan Masjid Jami Al Abrar (aktif siaga 24 jam)",
      "Menyerahkan fotokopi atau memperlihatkan kartu identitas asli (KTP/SIM/Paspor) demi keamanan & kondusifitas",
      "Mengikuti pengarahan singkat terkait adab kebersihan & penggunaan sarana bersama",
      "Batas waktu menginap maksimal 3 malam berturut-turut (dapat diperpanjang sesuai kondisi darurat/kebijakan khusus pengurus)"
    ],
    fasilitas: [
      "Kamar tidur berpendingin alami sejuk dengan kasur spring bed empuk",
      "Kamar mandi dalam super bersih lengkap dengan sediaan sabun, sampo & cermin",
      "Stopkontak listrik mandiri di setiap samping ranjang untuk keperluan isi daya gawai",
      "Air minum galon dispenser higienis (tersedia opsi Air Panas & Dingin) 24 jam gratis",
      "Penyediaan handuk bersih & selimut steril bagi musafir luar kota"
    ],
    kontak: "Keamanan Masjid Jami Al Abrar (0811-9988-7766 / Layanan Resepsionis Musafir 24 Jam)"
  },
  "Masjid Buka 24 Jam Terbuka": {
    prosedur: [
      "Terbuka lebar sepanjang hari & malam untuk seluruh ibadah shalat wajib maupun sunnah qiyamul lail",
      "Kajian tadarus Al-Qur'an mandiri dibolehkan di area shaf belakang dengan tetap menjaga ketertiban",
      "Menjaga adab suci masjid: Dilarang bersuara terlalu keras yang mengganggu jamaah lain, serta menjaga lantai dari najis"
    ],
    fasilitas: [
      "Kamera pengawas CCTV resolusi ultra tinggi aktif 24 jam penuh di sudut perimeter luar & dalam masjid",
      "Ambal sajadah karpet beludru super tebal premium yang dibersihkan vakum berkala setiap pagi",
      "Rak mushaf Al-Qur'an terjemahan edisi terlengkap dari Kementerian Agama RI",
      "Sediaan mukena & sarung bersih wangi melimpah bagi jamaah yang singgah spontan",
      "Air wudhu melimpah, jernih & segar disaring dengan sistem filtrasi modern"
    ],
    kontak: "Sekretariat Pengurus Jami Al Abrar (Parepare)"
  },
  "Kajian Tarbiyah & Fiqih Kontemporer": {
    kurikulum: [
      "Kajian kitab Tafsir Al-Jalalain komparatif dibimbing secara runut per ayat",
      "Bedah kaidah Hadits Arba'in Nawawiyah dikaitkan dengan realita kehidupan modern",
      "Solusi hukum fiqih kontemporer: Muamalah, zakat digital, keluarga sakinah & fiqih ibadah praktis harian"
    ],
    fasilitas: [
      "Penyediaan rangkuman materi ringkas kajian secara digital (dibagikan via grup WA Jamaah)",
      "Snack sore gratis, kue tradisional Parepare & hidangan teh hangat selepas shalat Ashar berjamaah",
      "Sesi tanya-jawab interaktif terbuka dengan mikrofon nirkabel bagi ikhwan maupun akhwat",
      "Penyiaran rekaman / live streaming YouTube interaktif bagi jamaah yang berhalangan hadir fisik"
    ],
    kontak: "Ustadz Hendra Wijaya, Lc. (Seksi Dakwah Masjid Jami Al Abrar)"
  },
  "Majelis Taklim Akhwat Al Abrar": {
    kurikulum: [
      "Kajian Fiqih Wanita (Haid, Waris, Pernikahan, Pendidikan Anak) secara aplikatif",
      "Pelatihan keterampilan kuliner, kerajinan tangan, & dasar bisnis ekonomi kreatif syariah untuk kemandirian finansial",
      "Program sosial penyaluran beras cinta kasih & sembako berkala bagi lansia & janda dhuafa"
    ],
    fasilitas: [
      "Aula pertemuan berlantai karpet lembut khusus lantai 2 berdaya tampung hingga 150 jamaah akhwat",
      "Fasilitas ruang penitipan balita ramah anak bersamadengan pengawas khusus agar pengajian diikuti tenang",
      "Konsumsi snack dos ramah-tamah & sediaan air mineral gelas bagi seluruh hadirin"
    ],
    kontak: "Ustazah Hajjah Maryam Latif, M.Ag. (Koordinator Majelis Taklim Akhwat)"
  }
};

export default function AktivitasMasjid() {
  const [activities, setActivities] = useState<AktivitasItem[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<AktivitasItem | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Load from local db
    setActivities(LocalDb.getActivities());

    // Listen on dynamic changes from administration panel
    const handleDbUpdate = () => {
      setActivities(LocalDb.getActivities());
    };
    window.addEventListener('db-update', handleDbUpdate);
    return () => {
      window.removeEventListener('db-update', handleDbUpdate);
    };
  }, []);

  // Monitor deep linking via ?id=X param
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const idParam = searchParams.get('id');
    if (idParam && activities.length > 0) {
      const found = activities.find(a => String(a.id) === String(idParam));
      if (found) {
        setSelectedActivity(found);
      } else {
        setSelectedActivity(null);
      }
    } else {
      setSelectedActivity(null);
    }
  }, [location.search, activities]);

  const openActivity = (id: string | number) => {
    navigate(`/aktivitas?id=${id}`);
  };

  const closeActivity = () => {
    navigate(`/aktivitas`);
  };

  return (
    <div className="bg-gradient-to-b from-[#fdfdfc] via-cream to-[#f1ede2] min-h-screen pb-24">
      {/* Page Header banner */}
      <div className="relative bg-terracotta text-white py-14 md:py-20 px-4 overflow-hidden border-b-4 border-gold shadow-md">
        <div className="absolute top-[-30%] left-[-10%] w-[500px] h-[500px] bg-terracotta-light/40 blur-[130px] rounded-full" />
        <div className="absolute bottom-[-15%] right-[-5%] w-80 h-80 bg-gold/15 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/15" />

        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-16 h-16 bg-gold/15 text-gold border border-gold/30 rounded-2xl flex items-center justify-center mx-auto shadow-2xl backdrop-blur-sm"
          >
            <Zap className="h-8 w-8" />
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl md:text-5xl font-extrabold tracking-tight uppercase leading-tight font-sans text-transparent bg-clip-text bg-gradient-to-r from-white via-cream to-white"
          >
            Aktivitas & Layanan Masjid
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="text-[#f5d9d2] text-xs md:text-sm font-semibold max-w-2xl mx-auto italic tracking-wide font-sans text-center uppercase"
          >
            "Menghidupkan syiar Islam, menebar manfaat peradaban, dan melindungi kenyamanan dhuafa & musafir 24 jam"
          </motion.p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-12 space-y-12">
        {/* Banner with stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-terracotta/5 text-terracotta border border-terracotta/10 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-sans font-extrabold text-base text-terracotta">Akses 24 Jam</h3>
              <p className="text-xs text-gray-500 font-medium">Terbuka lebar untuk ibadah & istirahat</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center shrink-0">
              <Home className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-sans font-extrabold text-base text-amber-800">Kamar Musafir</h3>
              <p className="text-xs text-gray-500 font-medium">Gratis, aman, dan berfasilitas memadai</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-750 border border-sky-100 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-sans font-extrabold text-base text-sky-800">TKA - TPA Resmi</h3>
              <p className="text-xs text-gray-500 font-medium">Izin resmi LPPTKA Unit 021 Parepare</p>
            </div>
          </div>
        </div>

        {/* Core items showcase */}
        <div className="space-y-8">
          {activities.map((act, idx) => {
            const Icon = getIconComponent(act.iconName);
            return (
              <motion.div
                key={act.id || act.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                onClick={() => openActivity(act.id)}
                className={`bg-white border ${act.borderColor || 'border-gray-100'} rounded-3xl p-6 md:p-8 shadow-sm hover:shadow-md hover:border-gold/30 hover:scale-[1.005] cursor-pointer transition-all relative overflow-hidden group grid grid-cols-1 md:grid-cols-12 gap-6`}
              >
                {/* Decorative side bar matching category */}
                <div className="md:col-span-1 flex md:flex-col justify-between items-start md:items-center">
                  <div className={`w-12 h-12 rounded-2xl ${act.iconColor || 'text-terracotta bg-cream'} flex items-center justify-center border shrink-0`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="md:rotate-270 capitalize text-[9px] font-sans font-extrabold tracking-widest text-terracotta bg-terracotta/5 border border-terracotta/15 px-2.5 py-1 rounded-lg mt-2 hidden md:inline-block whitespace-nowrap">
                    {act.badge}
                  </span>
                </div>

                <div className="md:col-span-11 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 pb-3">
                    <div>
                      <span className="sm:hidden text-[9px] font-sans font-extrabold tracking-widest text-gold bg-terracotta-dark px-2.5 py-1 rounded-full mb-1 inline-block">
                        {act.badge}
                      </span>
                      <h3 className="text-lg md:text-xl font-extrabold text-gray-900 group-hover:text-terracotta transition-colors">
                        {act.title}
                      </h3>
                      <p className="text-xs text-amber-600 font-bold uppercase tracking-wide mt-0.5">{act.subtitle}</p>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-sans text-justify line-clamp-3">
                    {act.description}
                  </p>

                  <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-2xl p-4 bg-gradient-to-br ${act.colorGradient || 'from-cream to-cream/20'} border border-transparent group-hover:border-gray-100`}>
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Jadwal & Waktu Kegiatan / Operasional</span>
                      <span className="text-xs text-terracotta font-bold font-sans flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                        {act.schedule}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">Sasaran & Penerima Manfaat</span>
                      <span className="text-xs text-gray-800 font-bold font-sans flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                        {act.beneficiary}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Action Trigger Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
                    <div className="text-[10px] text-gray-400 font-medium">
                      *Klik kartu ini untuk membaca panduan tata tertib, rincian fasilitas & kontak pengurus secara terperinci.
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openActivity(act.id);
                      }}
                      className="px-4 py-2 bg-terracotta text-white group-hover:bg-terracotta-dark group-hover:text-gold text-[10px] font-extrabold rounded-xl shadow-sm flex items-center gap-1.5 transition-all active:scale-95 uppercase tracking-wide shrink-0 border border-transparent group-hover:border-gold/25"
                    >
                      <span>Detail & Prosedur</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer info/callout card */}
        <div className="bg-amber-50 border border-amber-200/60 p-6 md:p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-6 max-w-3xl mx-auto mt-16 shadow-inner">
          <div className="w-12 h-12 rounded-2xl bg-amber-100/60 flex items-center justify-center shrink-0">
            <Info className="h-6 w-6 text-amber-700" />
          </div>
          <div className="space-y-1.5 text-center sm:text-left flex-1">
            <h4 className="text-xs md:text-sm font-extrabold text-amber-900 uppercase tracking-wider">Donasi Khusus Program Infaq Kreatif</h4>
            <p className="text-xs text-amber-850 leading-relaxed font-sans">
              Anda bisa menyalurkan kontribusi dana operasional untuk menunjang kebutuhan guru mengaji TKA-TPA Al Abrar maupun penyediaan fasilitas kebersihan kamar musafir di halaman Laporan Kas / Infaq Masjid.
            </p>
          </div>
          <Link
            to="/keuangan"
            className="bg-terracotta hover:bg-terracotta/90 text-white font-bold text-xs uppercase px-5 py-3 rounded-xl shadow-sm transition-transform active:scale-95 whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span>Transfer Infaq</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* AESTHETIC HIGHLY INFORMATIVE MODAL PANEL */}
      <AnimatePresence>
        {selectedActivity && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeActivity}
              className="absolute inset-0 bg-black/75 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-gold/20 flex flex-col max-h-[90vh] z-10 animate-in fade-in"
            >
              {/* Close Button top-right over visual banner */}
              <button
                onClick={closeActivity}
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center hover:scale-105 active:scale-95 shadow-lg transition-all focus:outline-none"
                aria-label="Tutup Detail"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Title Header with cover photo */}
              <div className="relative h-48 sm:h-64 shrink-0 bg-gradient-to-r from-terracotta to-terracotta-dark">
                {selectedActivity.image ? (
                  <img 
                    src={selectedActivity.image} 
                    alt={selectedActivity.title} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <Zap className="w-32 h-32 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />
                
                {/* Category Badge & Titles */}
                <div className="absolute bottom-5 left-6 right-6 text-white space-y-1 sm:space-y-2">
                  <span className="text-[9px] sm:text-[10px] font-sans font-extrabold tracking-widest text-[#3e140d] bg-gold px-3 py-1 rounded-full uppercase">
                    {selectedActivity.badge}
                  </span>
                  <h2 className="text-xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md">
                    {selectedActivity.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-cream font-bold tracking-wide uppercase">
                    {selectedActivity.subtitle}
                  </p>
                </div>
              </div>

              {/* Modal Core Contents (Scrollable) */}
              <div className="p-6 sm:p-8 overflow-y-auto space-y-6 font-sans">
                {/* Visual Overview text paragraph */}
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-extrabold text-terracotta tracking-wider flex items-center gap-1.5">
                    <Info className="h-3.5 w-3.5" /> Gambaran Umum Program
                  </span>
                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed text-justify whitespace-pre-line bg-cream/15 p-4 rounded-2xl border border-cream/50 shadow-inner">
                    {selectedActivity.description}
                  </p>
                </div>

                {/* Sub-specification Grid depending if predefined or custom activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Specs Side */}
                  <div className="space-y-4">
                    {/* Schedule info block */}
                    <div className="p-4 bg-terracotta/5 rounded-2xl border border-terracotta/10 space-y-2">
                      <span className="text-[10px] uppercase font-extrabold text-terracotta tracking-wider block">Waktu Operasional / Jadwal Rutin</span>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                        <Clock className="h-4 w-4 text-amber-605" />
                        <span>{selectedActivity.schedule}</span>
                      </div>
                    </div>

                    {/* Beneficiary info block */}
                    <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100/50 space-y-2">
                      <span className="text-[10px] uppercase font-extrabold text-emerald-800 tracking-wider block">Penerima Manfaat / Sasaran</span>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-800">
                        <Users className="h-4 w-4 text-emerald-600" />
                        <span>{selectedActivity.beneficiary}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Specs Side (Rules / Procedural guideline if available) */}
                  <div className="space-y-4">
                    {detailedSpecs[selectedActivity.title]?.kurikulum && (
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-extrabold text-amber-800 tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" /> Kurikulum Pembelajaran
                        </span>
                        <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4 leading-relaxed font-sans">
                          {detailedSpecs[selectedActivity.title].kurikulum?.map((item, id) => (
                            <li key={id}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {detailedSpecs[selectedActivity.title]?.prosedur && (
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-extrabold text-amber-800 tracking-wider flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-amber-600" /> Alur Prosedur & Tata Tertib
                        </span>
                        <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4 leading-relaxed font-sans">
                          {detailedSpecs[selectedActivity.title].prosedur?.map((item, id) => (
                            <li key={id}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Facilities bullet listings */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] uppercase font-extrabold text-terracotta tracking-wider flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-gold" /> Sarana Fasilitas yang Disediakan
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gradient-to-br from-cream/20 to-amber-50/10 p-5 rounded-2xl border border-gray-100 shadow-sm">
                    {detailedSpecs[selectedActivity.title]?.fasilitas ? (
                      detailedSpecs[selectedActivity.title].fasilitas?.map((fac, i) => (
                        <div key={i} className="flex gap-2 items-start text-xs text-gray-600 font-sans leading-relaxed">
                          <span className="text-gold mt-0.5">✦</span>
                          <span>{fac}</span>
                        </div>
                      ))
                    ) : (
                      <>
                        <div className="flex gap-2 items-start text-xs text-gray-600 font-sans leading-relaxed">
                          <span className="text-gold mt-0.5">✦</span>
                          <span>Mushaf Al-Qur'an bersih siap pakai</span>
                        </div>
                        <div className="flex gap-2 items-start text-xs text-gray-600 font-sans leading-relaxed">
                          <span className="text-gold mt-0.5">✦</span>
                          <span>Ruang ibadah sejuk berpaling AC & kipas angin</span>
                        </div>
                        <div className="flex gap-2 items-start text-xs text-gray-600 font-sans leading-relaxed">
                          <span className="text-gold mt-0.5">✦</span>
                          <span>Air wudhu bersih dari sumur bor filterisasi</span>
                        </div>
                        <div className="flex gap-2 items-start text-xs text-gray-600 font-sans leading-relaxed">
                          <span className="text-gold mt-0.5">✦</span>
                          <span>Kamar mandi & Tempat wudhu bersih terpisah</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Coordinator / Contact card */}
                {detailedSpecs[selectedActivity.title]?.kontak && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-white rounded-xl text-amber-700 shadow-sm">
                        <PhoneCall className="h-4 w-4 animate-bounce" />
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-extrabold text-amber-800 tracking-wider block leading-none">Narahubung Resmi</span>
                        <span className="text-xs text-amber-950 font-bold font-sans mt-0.5 block">{detailedSpecs[selectedActivity.title].kontak}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl uppercase tracking-wider font-sans shrink-0">
                      Sedia Melayani
                    </span>
                  </div>
                )}
              </div>

              {/* Modal Footer call to action */}
              <div className="bg-gray-50 p-5 sm:px-8 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <span className="text-[11px] text-gray-400 font-medium font-sans">
                  © 2026 MASJID JAMI AL ABRAR PAREPARE. ALL RIGHTS RESERVED.
                </span>
                <div className="flex gap-3 w-full sm:w-auto font-sans font-bold">
                  <button
                    onClick={closeActivity}
                    className="flex-1 sm:flex-initial px-5 py-2.5 border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs rounded-xl active:scale-95 transition-all text-center uppercase tracking-wide"
                  >
                    Tutup
                  </button>
                  <Link
                    to="/keuangan"
                    onClick={closeActivity}
                    className="flex-1 sm:flex-initial px-6 py-2.5 bg-terracotta hover:bg-terracotta-dark text-white hover:text-gold text-xs rounded-xl active:scale-95 transition-all text-center uppercase tracking-wide flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>Salurkan Infaq</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
