import { 
  Info, 
  HelpCircle, 
  ChevronDown, 
  Check, 
  Search, 
  Award, 
  Users, 
  Landmark,
  User,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { DetailedBoardMember } from '../types';

interface InfoMasjidProps {
  activeSubTab?: 'info_umum' | 'sejarah' | 'visi_misi' | 'pengurus_lengkap';
  setActiveSubTab?: (sub: 'info_umum' | 'sejarah' | 'visi_misi' | 'pengurus_lengkap') => void;
  detailedBoard?: DetailedBoardMember[];
  mosqueSettings?: any;
}

export default function InfoMasjid({ activeSubTab: propSubTab, detailedBoard = [], mosqueSettings }: InfoMasjidProps) {
  const [internalSubTab, setInternalSubTab] = useState<'info_umum' | 'sejarah' | 'visi_misi' | 'pengurus_lengkap'>('info_umum');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle support for both prop-controlled and internal-controlled subtabs
  const activeTab = propSubTab || internalSubTab;

  useEffect(() => {
    const handleSubtabChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.tab === 'profil' && detail.subtab) {
        if (detail.subtab !== 'jamaah') {
          setInternalSubTab(detail.subtab as any);
        }
      }
    };
    window.addEventListener('change_subtab', handleSubtabChange);
    return () => window.removeEventListener('change_subtab', handleSubtabChange);
  }, []);

  const historyText = mosqueSettings?.history || `Masjid Jami Al Abrar didirikan pertama kali pada tahun 1961 sebagai sebuah tempat ibadah berupa mushalla kecil sederhana. Diinisiasi oleh tokoh adat setempat, takmir perdana, serta dukungan tulus para pemilik lahan wakaf di wilayah Kelurahan Lapadde, Parepare.`;
  const visionText = mosqueSettings?.vision || `Terwujudnya Masjid Al Abrar sebagai pusat ibadah yang suci, makmur, mandiri, dan berdaya guna dalam mendidik jamaah yang bertakwa dan berakhlakul karimah.`;
  const misionList = mosqueSettings?.mision || [
    { title: 'Tertib & Nyaman', text: 'Menyelenggarakan kegiatan ibadah fardhu 5 waktu dan ibadah sunnah secara tertib, khusyuk, dan nyaman.' },
    { title: 'Pembinaan Akhlak', text: 'Meningkatkan pembinaan aqidah, ibadah, dan akhlak melalui program kajian keagamaan rutin serta madrasah dhuha.' },
    { title: 'Transparansi Penuh', text: 'Mengelola keuangan, aset kas, dan inventaris milik masjid secara akuntabel, transparan, serta profesional.' },
    { title: 'Pemberdayaan Ekonomi', text: 'Mengembangkan program pengetasan kemiskinan dan ketahanan pangan berbasis infaq, sedekah, dan zakat syariah.' },
    { title: 'Pembinaan Pemuda', text: 'Memfasilitasi pemberdayaan potensi pemuda Remaja Masjid (PRISMA) sebagai kader penerus dakwah masa depan.' },
    { title: 'Pelayanan Sosial', text: 'Menghadirkan sarana ambulans siaga, bantuan darurat dhuafa, dan bakti sosial masyarakat Parepare.' }
  ];
  const faqs = mosqueSettings?.faqs || [
    {
      q: "Bagaimana cara berdonasi secara digital?",
      a: "Anda dapat masuk ke menu 'Donasi Digital', pilih program yang ingin didukung, lalu lakukan pembayaran via QRIS otomatis atau transfer ke rekening BSI resmi masjid."
    },
    {
      q: "Apakah laporan keuangan masjid transparan?",
      a: "Ya, seluruh data pemasukan dan pengeluaran dicatat secara realtime dan dapat dipantau oleh siapa saja melalui menu 'Laporan Kas' di aplikasi ini."
    },
    {
      q: "Bagaimana cara menghubungi pengurus masjid?",
      a: "Untuk keperluan administrasi, pendaftaran jamaah, atau konsultasi, Anda dapat mengunjungi Sekretariat Masjid Al Abrar atau menghubungi nomor pengurus di menu 'Profil Masjid'."
    },
    {
      q: "Apakah data donatur saya aman?",
      a: "Sistem kami menggunakan enkripsi standar industri. Anda juga memiliki opsi untuk berdonasi sebagai 'Hamba Allah' jika ingin menjaga privasi (Anonim)."
    }
  ];

  return (
    <div className="w-full py-2 space-y-6 sm:space-y-8 animate-fade-in" id="info_masjid_view">
      
      {/* 1. TENTANG / INFORMASI UMUM */}
      {activeTab === 'info_umum' && (
        <div className="space-y-8">
          {/* Main Info Header */}
          <section className="text-center space-y-12">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700">
                <Info className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Pusat Informasi Digital Al Abrar</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight uppercase font-display">
                Latar Belakang <br />
                <span className="text-emerald-600">Digitalisasi Masjid.</span>
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed max-w-2xl mx-auto font-medium">
                Digitalisasi Masjid Jami Al Abrar Parepare dilatarbelakangi oleh visi luhur Pengurus Takmir untuk menghadirkan tata kelola rumah ibadah yang modern, transparan, akuntabel, dan berorientasi pada peningkatan layanan keumatan.
              </p>
            </div>

            {/* Identitas Utama Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto px-4">
              {[
                { label: 'Tahun Berdiri', value: '1961', icon: <Landmark className="w-5 h-5" />, color: 'bg-amber-50 text-amber-600' },
                { label: 'Kapasitas', value: '± 800 Jamaah', icon: <Users className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
                { label: 'Status Tanah', value: 'Wakaf Sah', icon: <Award className="w-5 h-5" />, color: 'bg-emerald-50 text-emerald-600' },
                { label: 'Lokasi', value: 'Lapadde, Parepare', icon: <MapPin className="w-5 h-5" />, color: 'bg-rose-50 text-rose-600' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-3 p-6 bg-white border border-slate-150 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all group">
                  <div className={`w-12 h-12 rounded-2xl ${item.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {item.icon}
                  </div>
                  <div className="text-center">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{item.label}</span>
                    <span className="block text-sm font-black text-slate-800">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Detailed Background Context Card */}
          <section className="bg-slate-50 border border-slate-200/60 rounded-[2rem] p-8 space-y-6 text-left">
            <h3 className="text-base font-black text-slate-900 tracking-tight border-b border-slate-200/80 pb-3 flex items-center gap-2">
              📜 Sejarah & Dorongan Transformasi Digital
            </h3>
            <div className="space-y-4 text-xs text-slate-600 leading-relaxed font-normal">
              <p>
                Sebagai salah satu masjid utama yang terletak strategis di Kelurahan Lapadde, Kecamatan Ujung, Kota Parepare, Masjid Jami Al Abrar terus mengalami lonjakan jamaah dan dinamika kepengurusan. Seiring berjalannya waktu, metode pencatatan manual untuk laporan keuangan, penyebaran selebaran kertas untuk jadwal petugas Jumat, serta papan pengumuman fisik dinilai kurang memadai untuk memenuhi mobilitas tinggi kejamaahan era modern.
              </p>
              <p>
                Menjawab tantangan tersebut, Badan Kesejahteraan/Takmir Masjid Al Abrar pada tahun 2024 berkomitmen meluncurkan <strong className="text-emerald-700">Sistem Digitalisasi Terpadu</strong>. Platform ini menghubungkan takmir dan jamaah dalam satu ekosistem cloud, memastikan transparansi penuh atas kas umat, serta menjamin keakuratan jadwal ibadah dan program syiar sepanjang tahun.
              </p>
            </div>
          </section>

          {/* Three Pillars of Al Abrar Digital Hub */}
          <section className="space-y-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight text-center">
              🔑 Tiga Pilar Utama Digitalisasi
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  title: 'Transparansi Kas Digital', 
                  desc: 'Melalui transparansi keuangan realtime di menu Kas, jamaah dapat memantau saldo, bukti pengeluaran, serta rincian donatur tetap kapan saja. Solusi ini memperkuat sirkulasi amanah umat tanpa keraguan.',
                  icon: '📊'
                },
                { 
                  title: 'Syiar & Penjadwalan Cerdas', 
                  desc: 'Mendigitalisasi alarm adzan, tabel petugas khatib Jumat otomatis, dokumentasi ringkasan khutbah, dan publikasi kajian harian demi memastikan efisiensi khidmat peribadatan.',
                  icon: '🕌'
                },
                { 
                  title: 'Databases Jamaah & Aset', 
                  desc: 'Integrasi aspirasi jamaah, inventarisasi aset masjid berbasis digital, serta registrasi keanggotaan jamaah untuk meningkatkan sinergi sosial dan ukhuwah antar-warga Lapadde.',
                  icon: '👥'
                }
              ].map((item, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-4 shadow-sm hover:border-emerald-250 transition-all text-left group">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">{item.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>
          {/* FAQs */}
          <section className="space-y-6 pt-4">
            <div className="flex items-center gap-3 px-1">
              <div className="p-2 bg-slate-900 text-white rounded-xl">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Tanya Jawab (FAQ)</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Informasi Umum Layanan Digitalisasi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 text-left">
              {faqs.map((faq: any, idx: number) => (
                <div 
                  key={idx}
                  className={`bg-white border rounded-3xl overflow-hidden transition-all duration-300 ${
                    activeFaq === idx ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-slate-150 hover:border-slate-300'
                  }`}
                >
                  <button 
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full flex items-center justify-between p-6 text-left outline-none"
                  >
                    <span className="font-bold text-slate-800 text-sm">{faq.q}</span>
                    <ChevronDown className={`h-5 w-5 text-slate-300 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180 text-emerald-500' : ''}`} />
                  </button>
                  
                  <div className={`transition-all duration-300 ease-in-out px-6 overflow-hidden ${activeFaq === idx ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-slate-500 text-xs leading-relaxed border-t border-slate-50 pt-4 text-left">
                      {faq.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 2. SEJARAH SINGKAT MASJID */}
      {activeTab === 'sejarah' && (
        <div className="space-y-8 text-left animate-fade-in">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-100 rounded-full text-amber-700">
              <Landmark className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Kilas Sejarah Perjuangan</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display uppercase">
              Riwayat Masjid Jami <br />
              <span className="text-emerald-600">Al Abrar Lapadde.</span>
            </h2>
            <p className="text-slate-500 text-sm max-w-2xl mx-auto font-medium">
              Perjalanan spiritual berdirinya sarana ibadah agung tumpuan iman masyarakat Kelurahan Lapadde, Ujung, Parepare.
            </p>
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-slate-200/85 shadow-sm space-y-6 leading-relaxed text-sm text-slate-600 whitespace-pre-wrap">
            {historyText}
          </div>

          {/* Timeline Milestones */}
          <section className="space-y-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 px-1">
              ⌛ Milestones & Garis Waktu Perkembangan
            </h3>
            
            <div className="relative border-l-4 border-emerald-50 ml-4 space-y-12 pl-10 py-4">
              {[
                {
                  year: '1961',
                  title: 'Pendirian Mushalla Perdana',
                  desc: 'Mushalla kayu bersahaja dibangun secara swadaya di atas tanah wakaf perdana untuk shalat fardhu berjamaah.',
                  icon: <Landmark className="w-5 h-5" />
                },
                {
                  year: '1998',
                  title: 'Peningkatan Status Jami',
                  desc: 'Konstruksi ditingkatkan menjadi bangunan semipermanen dengan perluasan ruang agar memuat shalat Jumat agung.',
                  icon: <Users className="w-5 h-5" />
                },
                {
                  year: '2012',
                  title: 'Megaproyek Renovasi 2 Lantai',
                  desc: 'Peletakan batu pertama pembangunan gedung megah beton berlantai dua guna meningkatkan daya tampung hingga 1.200 jamaah.',
                  icon: <Landmark className="w-5 h-5" />
                },
                {
                  year: '2019',
                  title: 'Pembangunan Menara & AC',
                  desc: 'Penyelesaian struktur menara masjid setinggi 21 meter, serta pemasangan AC terpadu dan tempat wudhu stainless otomatis.',
                  icon: <Info className="w-5 h-5" />
                },
                {
                  year: '2024',
                  title: 'Era Digitalisasi Cerdas',
                  desc: 'Integrasi sistem notifikasi digital, alarm penyiaran adzan otomatis, monitor keuangan realtime, dan portal informasi jamaah digital.',
                  icon: <TrendingUp className="w-5 h-5" />
                }
              ].map((m, idx) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="relative group text-left"
                >
                  {/* Floating Year Badge */}
                  <div className="absolute -left-[54px] top-0 w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 z-10 group-hover:scale-110 transition-transform">
                    <span className="text-[10px] font-black rotate-[-90deg] whitespace-nowrap">{m.year}</span>
                  </div>
                  
                  {/* Connecting Dot */}
                  <div className="absolute -left-[45px] top-4 w-4 h-4 rounded-full bg-white border-4 border-emerald-500 shadow-sm z-20 group-hover:scale-125 transition-transform"></div>

                  <div className="bg-white border border-slate-150 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all group-hover:border-emerald-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div className="space-y-1">
                        <h4 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-emerald-700 transition-colors">
                          {m.title}
                        </h4>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/50">Momen Bersejarah</span>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        {m.icon}
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">
                      {m.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 3. VISI MISI */}
      {activeTab === 'visi_misi' && (
        <div className="space-y-8 text-left animate-fade-in">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700">
              <Award className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Arah & Tujuan Mulia</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display uppercase">
              Visi dan Misi Utama <br />
              <span className="text-emerald-700">Kemakmuran Masjid.</span>
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
              Landasan operasional takmir dalam memakmurkan tempat suci dan mengayomi kedamaian jamaah.
            </p>
          </div>

          {/* Vision card */}
          <section className="relative group perspective-1000">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-[2.5rem] p-10 sm:p-14 shadow-2xl space-y-6 overflow-hidden">
              <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                <Landmark className="w-80 h-80" />
              </div>
              <div className="relative z-10 space-y-4">
                <h4 className="text-[11px] font-black tracking-[0.4em] text-emerald-400 uppercase leading-none">VISI UTAMA AL ABRAR</h4>
                <blockquote className="text-2xl sm:text-4xl font-black leading-tight font-display tracking-tight text-white italic pt-6 border-t border-white/10 max-w-4xl">
                  "{visionText}"
                </blockquote>
              </div>
            </div>
          </section>

          {/* Mission list */}
          <section className="space-y-8 pt-6">
            <div className="flex items-center gap-3 px-1">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
              <h3 className="text-xl font-black uppercase tracking-wider text-slate-900">Misi Pelayanan & Pembinaan Islam</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {misionList.map((m: any, i: number) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white border border-slate-150 rounded-3xl p-8 shadow-sm flex gap-6 hover:border-emerald-200 hover:shadow-md transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Check className="w-6 h-6 font-bold" />
                  </div>
                  <div className="space-y-2 min-w-0">
                    <h4 className="font-black text-slate-900 text-lg tracking-tight leading-none">{m.title || `Misi ke-${i+1}`}</h4>
                    <p className="text-slate-500 text-sm leading-relaxed font-medium">{m.text || m}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Pillars of values */}
          <section className="bg-white border rounded-[2rem] p-8 space-y-6">
            <h3 className="text-base font-black uppercase tracking-wider text-slate-800 text-center">Budaya Kerja & Nilai Pelayanan Takmir</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              {[
                { icon: '✨', label: 'Keikhlasan', desc: 'Ibadah murni demi ridha Allah SWT' },
                { icon: '⚖️', label: 'Amanah & Jujur', desc: 'Bertanggung jawab penuh atas milik jamaah' },
                { icon: '🤝', label: 'Ukhuwah Islamiyah', desc: 'Merangkul persaudaraan tanpa sekat golongan' },
                { icon: '🌟', label: 'Unggul', desc: 'Memberikan standar pelayanan tempat ibadah terbaik' }
              ].map((p, idx) => (
                <div key={idx} className="p-4 border rounded-xl hover:bg-slate-50 transition">
                  <span className="text-2xl block mb-2">{p.icon}</span>
                  <h4 className="font-extrabold text-xs text-slate-900 tracking-tight">{p.label}</h4>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* 4. SUSUNAN PENGURUS LENGKAP */}
      {activeTab === 'pengurus_lengkap' && (
        <div className="space-y-8 text-left animate-fade-in">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-blue-700">
              <Users className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Struktur Organisasi Lengkap</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display uppercase">
              Susunan Pengurus Takmir <br />
              <span className="text-emerald-600">Masjid Jami Al Abrar.</span>
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto font-medium">
              Sinergi jajaran pengurus penasehat, idarah, imarah, serta riayah dalam satu komite pelayanan umat terpadu.
            </p>
          </div>

          {/* Search bar inside pengurus */}
          <div className="bg-white p-4 rounded-2xl border flex items-center gap-3 shadow-inner">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Cari nama pengurus atau jabatan..."
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              className="bg-transparent text-slate-800 placeholder-slate-400 text-xs font-medium w-full focus:outline-none"
            />
          </div>

          {/* Category Sections Based on detailedBoard */}
          {[
            { id: 'penasehat', label: 'Dewan Pelindung / Penasehat', icon: '⭐', colorClass: 'text-blue-800', borderClass: 'border-blue-500' },
            { id: 'inti', label: 'Jajaran Pengurus Inti (Harian)', icon: '👥', colorClass: 'text-emerald-700', borderClass: 'border-emerald-600' },
            { id: 'idarah', label: 'Bidang Idarah (Administrasi & Dana)', icon: '📁', colorClass: 'text-amber-700', borderClass: 'border-amber-500' },
            { id: 'imarah', label: 'Bidang Imarah (Kemakmuran & Ibadah)', icon: '🕌', colorClass: 'text-emerald-600', borderClass: 'border-emerald-600' },
            { id: 'riayah', label: 'Bidang Riayah (Sarana & Prasarana)', icon: '🛠️', colorClass: 'text-sky-700', borderClass: 'border-sky-600' }
          ].map((cat) => {
            const members = detailedBoard.filter(m => m.category === cat.id);
            const filteredMembers = (members || []).filter(m => {
              if (!m) return false;
              return (m.name || '').toLowerCase().includes(searchTerm || '') || 
                     (m.role || '').toLowerCase().includes(searchTerm || '') ||
                     ((m.sectionName || '').toLowerCase().includes(searchTerm || ''))
            });

            if (filteredMembers.length === 0 && searchTerm) return null;
            if (members.length === 0) return null;

            return (
              <section key={cat.id} className="space-y-4">
                <h3 className={`text-sm font-black uppercase tracking-wider text-slate-800 pl-1 border-l-4 ${cat.borderClass} py-0.5 flex items-center gap-2`}>
                  {cat.icon} {cat.label}
                </h3>
                
                {/* Grouping by sectionName if available for idarah, imarah, riayah */}
                {['idarah', 'imarah', 'riayah'].includes(cat.id) ? (
                  <div className="grid grid-cols-1 gap-8">
                    {Array.from(new Set(filteredMembers.map(m => m.sectionName || 'Struktur Pelaksana'))).map((section, sIdx) => (
                      <div key={sIdx} className="space-y-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-1 h-4 rounded-full ${cat.borderClass.replace('border-', 'bg-')}`}></div>
                          <h4 className={`text-sm font-black uppercase tracking-[0.2em] ${cat.colorClass}`}>{section}</h4>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                          {filteredMembers.filter(m => (m.sectionName || 'Struktur Pelaksana') === section).map((m, mIdx) => (
                            <motion.div 
                              key={mIdx} 
                              whileHover={{ y: -8 }}
                              className="flex flex-col items-center text-center group bg-white p-6 rounded-[2rem] border border-slate-150 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all"
                            >
                              <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-slate-100 group-hover:border-emerald-500 transition-all duration-500 shadow-md mb-4 rotate-3 group-hover:rotate-0">
                                {m.imageUrl ? (
                                  <img 
                                    src={m.imageUrl} 
                                    alt={m.name} 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                                    <User className="h-8 w-8" />
                                  </div>
                                )}
                              </div>
                              <span className="text-xs font-black text-slate-900 leading-tight block mb-1 group-hover:text-emerald-700 transition-colors">{m.name}</span>
                              <span className={`text-[9px] font-black uppercase tracking-wider ${cat.colorClass} opacity-60 group-hover:opacity-100 transition-opacity`}>{m.role}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                    {filteredMembers.map((m, idx) => (
                      <motion.div 
                        key={idx} 
                        whileHover={{ y: -8 }}
                        className="bg-white border border-slate-150 rounded-[2rem] p-6 shadow-sm flex flex-col items-center text-center group hover:shadow-xl hover:shadow-blue-900/5 transition-all"
                      >
                        <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-slate-100 group-hover:border-blue-500 transition-all duration-500 shadow-md mb-4 -rotate-3 group-hover:rotate-0">
                          {m.imageUrl ? (
                            <img 
                              src={m.imageUrl} 
                              alt={m.name} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                              <User className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                        <span className={`text-[9px] font-black tracking-widest ${cat.colorClass} uppercase font-mono mb-1.5 opacity-60 group-hover:opacity-100 transition-opacity`}>{m.role}</span>
                        <span className="text-xs font-black text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">{m.name}</span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}

      {/* Version Status */}
      <footer className="pt-8 border-t border-slate-100 text-center">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
          Takmir Masjid Jami Al Abrar Lapadde • Parepare • 2026
        </p>
      </footer>
    </div>
  );
}
