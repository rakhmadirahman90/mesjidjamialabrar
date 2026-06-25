import { 
  Info, 
  HelpCircle, 
  ChevronDown, 
  Check, 
  Search, 
  Award, 
  Users, 
  Landmark,
  User
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { DetailedBoardMember } from '../types';

interface InfoMasjidProps {
  activeSubTab?: 'info_umum' | 'sejarah' | 'visi_misi' | 'pengurus_lengkap';
  setActiveSubTab?: (sub: 'info_umum' | 'sejarah' | 'visi_misi' | 'pengurus_lengkap') => void;
  detailedBoard?: DetailedBoardMember[];
}

export default function InfoMasjid({ activeSubTab: propSubTab, detailedBoard = [] }: InfoMasjidProps) {
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

  const faqs = [
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
          <section className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700">
              <Info className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Pusat Informasi Digital Al Abrar</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase font-display">
              Latar Belakang <br />
              <span className="text-emerald-600">Digitalisasi Masjid.</span>
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed max-w-2xl mx-auto font-medium">
              Digitalisasi Masjid Jami Al Abrar Parepare dilatarbelakangi oleh visi luhur Pengurus Takmir untuk menghadirkan tata kelola rumah ibadah yang modern, transparan, akuntabel, dan berorientasi pada peningkatan layanan keumatan serta kemudahan akses informasi bagi seluruh jamaah secara realtime.
            </p>
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
              {faqs.map((faq, idx) => (
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

          <div className="bg-white rounded-[2rem] p-8 border border-slate-200/85 shadow-sm space-y-6 leading-relaxed text-sm text-slate-600">
            <p className="font-medium text-slate-800 text-base leading-relaxed">
              Masjid Jami Al Abrar didirikan pertama kali pada tahun <strong className="text-emerald-700 font-extrabold">1961</strong> sebagai sebuah tempat ibadah berupa mushalla kecil sederhana. Diinisiasi oleh tokoh adat setempat, takmir perdana, serta dukungan tulus para pemilik lahan wakaf di wilayah Kelurahan Lapadde, Parepare.
            </p>
            <p>
              Tujuan awal dari pendirian mushalla ini adalah untuk mempermudah jamaah sekitar menunaikan ibadah shalat fardhu 5 waktu secara berjamaah tanpa harus menempuh jarak jauh ke wilayah perkotaan Parepare. Dengan pesatnya perkembangan perumahan dan pertambahan penduduk di Lapadde, pada tahun <strong className="text-slate-800">1998</strong>, mushalla ini diputuskan oleh warga untuk direnovasi total dan ditingkatkan statusnya secara resmi menjadi <strong className="text-emerald-700 font-extrabold">Masjid Jami Al Abrar</strong> yang sanggup menggelar Shalat Jumat perdana.
            </p>
            <p>
              Pada tahun <strong className="text-slate-800">2012</strong>, menyadari luapan jamaah shalat Jumat yang terus membludak hingga meluber ke jalan raya, panitia pembangunan takmir merancang perluasan agung. Berkat gotong-royong swadaya jamaah yang luar biasa, dikonstruksi bangunan beton berarsitektur modern dua lantai yang sangat kokoh dan sejuk.
            </p>
            <p>
              Kini, di usianya yang telah matang, Masjid Jami Al Abrar berdiri gagah dilengkapi menara pemancar adzan, pendingin ruangan (AC) yang sejuk, sistem audio akustik digital, ruang sekretariat, perpustakaan keagamaan, serta layanan ambulans gratis 24 jam untuk melayani seluruh umat di kota Parepare, khususnya kawasan Lapadde.
            </p>
          </div>

          {/* Timeline Milestones */}
          <section className="space-y-6">
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2 px-1">
              ⌛ Milestones & Garis Waktu Perkembangan
            </h3>
            
            <div className="relative border-l-2 border-emerald-100 ml-4 space-y-8 pl-6">
              {[
                {
                  year: '1961',
                  title: 'Pendirian Mushalla Perdana',
                  desc: 'Mushalla kayu bersahaja dibangun secara swadaya di atas tanah wakaf perdana untuk shalat fardhu berjamaah.'
                },
                {
                  year: '1998',
                  title: 'Peningkatan Status Jami',
                  desc: 'Konstruksi ditingkatkan menjadi bangunan semipermanen dengan perluasan ruang agar memuat shalat Jumat agung.'
                },
                {
                  year: '2012',
                  title: 'Megaproyek Renovasi 2 Lantai',
                  desc: 'Peletakan batu pertama pembangunan gedung megah beton berlantai dua guna meningkatkan daya tampung hingga 1.200 jamaah.'
                },
                {
                  year: '2019',
                  title: 'Pembangunan Menara & AC',
                  desc: 'Penyelesaian struktur menara masjid setinggi 21 meter, serta pemasangan AC terpadu dan tempat wudhu stainless otomatis.'
                },
                {
                  year: '2024 - Sekarang',
                  title: 'Era Digitalisasi Cerdas',
                  desc: 'Integrasi sistem notifikasi digital, alarm penyiaran adzan otomatis, monitor keuangan realtime, dan portal informasi jamaah digital.'
                }
              ].map((m, idx) => (
                <div key={idx} className="relative group text-left">
                  <div className="absolute -left-[31px] top-1 bg-white border-2 border-emerald-500 text-emerald-600 font-mono text-xs font-black px-2 py-0.5 rounded-full shadow-sm group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                    {m.year}
                  </div>
                  <div className="bg-white border border-slate-150 rounded-2xl p-5 hover:border-emerald-200 transition-all shadow-sm">
                    <h4 className="font-extrabold text-slate-900 text-sm tracking-tight mb-1">{m.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
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
          <section className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-[2.5rem] p-8 sm:p-10 shadow-xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4 opacity-10">
              <Landmark className="w-64 h-64" />
            </div>
            <h4 className="text-[10px] sm:text-xs font-black tracking-[0.25em] text-emerald-300 uppercase leading-none">VISI UTAMA</h4>
            <blockquote className="text-lg sm:text-2xl font-black leading-snug font-display tracking-tight text-white italic pt-2 border-t border-white/10">
              "Terwujudnya Masjid Al Abrar sebagai pusat ibadah yang suci, makmur, mandiri, dan berdaya guna dalam mendidik jamaah yang bertakwa dan berakhlakul karimah."
            </blockquote>
          </section>

          {/* Mission list */}
          <section className="space-y-4">
            <h3 className="text-base font-black uppercase tracking-wider text-slate-800">Misi Pelayanan & Pembinaan Islam</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Tertib & Nyaman', text: 'Menyelenggarakan kegiatan ibadah fardhu 5 waktu dan ibadah sunnah secara tertib, khusyuk, dan nyaman.' },
                { title: 'Pembinaan Akhlak', text: 'Meningkatkan pembinaan aqidah, ibadah, dan akhlak melalui program kajian keagamaan rutin serta madrasah dhuha.' },
                { title: 'Transparansi Penuh', text: 'Mengelola keuangan, aset kas, dan inventaris milik masjid secara akuntabel, transparan, serta profesional.' },
                { title: 'Pemberdayaan Ekonomi', text: 'Mengembangkan program pengetasan kemiskinan dan ketahanan pangan berbasis infaq, sedekah, dan zakat syariah.' },
                { title: 'Pembinaan Pemuda', text: 'Memfasilitasi pemberdayaan potensi pemuda Remaja Masjid (PRISMA) sebagai kader penerus dakwah masa depan.' },
                { title: 'Pelayanan Sosial', text: 'Menghadirkan sarana ambulans siaga, bantuan darurat dhuafa, dan bakti sosial masyarakat Parepare.' }
              ].map((m, i) => (
                <div key={i} className="bg-white border border-slate-150 rounded-2xl p-5 shadow-sm flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 font-bold" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <h4 className="font-extrabold text-slate-900 text-sm tracking-tight">{m.title}</h4>
                    <p className="text-slate-500 text-xs leading-relaxed">{m.text}</p>
                  </div>
                </div>
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
                  <div className="grid grid-cols-1 gap-4">
                    {Array.from(new Set(filteredMembers.map(m => m.sectionName || 'Struktur Pelaksana'))).map((section, sIdx) => (
                      <div key={sIdx} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-3">
                        <h4 className={`text-xs font-black uppercase tracking-widest ${cat.colorClass}`}>{section}</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                          {filteredMembers.filter(m => (m.sectionName || 'Struktur Pelaksana') === section).map((m, mIdx) => (
                            <div key={mIdx} className="flex flex-col items-center text-center group">
                              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-100 group-hover:border-emerald-500 transition-colors duration-300 shadow-sm mb-2">
                                {m.imageUrl ? (
                                  <img 
                                    src={m.imageUrl} 
                                    alt={m.name} 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                                    <User className="h-6 w-6" />
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] font-black text-slate-800 leading-tight block truncate w-full">{m.name}</span>
                              <span className={`text-[8px] font-black uppercase tracking-tighter ${cat.colorClass} mt-0.5 block truncate w-full`}>{m.role}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    {filteredMembers.map((m, idx) => (
                      <div key={idx} className="bg-white border rounded-2xl p-4 shadow-sm flex flex-col items-center text-center group hover:shadow-md transition-shadow duration-300">
                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-100 group-hover:border-blue-500 transition-colors duration-300 shadow-sm mb-2">
                          {m.imageUrl ? (
                            <img 
                              src={m.imageUrl} 
                              alt={m.name} 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                              <User className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <span className={`text-[8px] font-black tracking-wider ${cat.colorClass} uppercase font-mono mb-1 truncate w-full`}>{m.role}</span>
                        <span className="text-[10px] font-black text-slate-800 leading-tight truncate w-full">{m.name}</span>
                      </div>
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
