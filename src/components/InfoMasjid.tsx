import { 
  Info, 
  ShieldCheck, 
  HelpCircle, 
  ChevronDown, 
  MapPin, 
  Check, 
  Search, 
  Award, 
  Users, 
  Landmark 
} from 'lucide-react';
import { useState, useEffect } from 'react';

interface InfoMasjidProps {
  activeSubTab?: 'info_umum' | 'sejarah' | 'visi_misi' | 'pengurus_lengkap';
  setActiveSubTab?: (sub: 'info_umum' | 'sejarah' | 'visi_misi' | 'pengurus_lengkap') => void;
}

export default function InfoMasjid({ activeSubTab: propSubTab }: InfoMasjidProps) {
  const [internalSubTab, setInternalSubTab] = useState<'info_umum' | 'sejarah' | 'visi_misi' | 'pengurus_lengkap'>('info_umum');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle support for both prop-controlled and internal-controlled subtabs
  const activeTab = propSubTab || internalSubTab;

  useEffect(() => {
    const handleSubtabChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && detail.tab === 'tentang' && detail.subtab) {
        setInternalSubTab(detail.subtab as any);
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

  // Complete Detailed Committee list
  const structuredBoard = {
    penasehat: [
      'Camat Ujung', 
      'Kepala KUA Kec. Ujung', 
      'Lurah Lapadde', 
      'dr. H. Nurdin Samad, Sp.PD., FINASIM', 
      'Prof. Dr. Drs. H. Amaluddin, M.Hum',
      'Drs. H. AT. Syamsul Eyber', 
      'Dr. H. Surianto Abdul Muijib, S.Ag., MM.', 
      'Dr. H. Muh Natsir, M.Pd'
    ],
    inti: [
      { role: 'Ketua Umum', name: 'Kapt. Purn. H. Amir Sabana' },
      { role: 'Wakil Ketua I', name: 'Abdullah Jalil, SE., SH., M.Si' },
      { role: 'Wakil Ketua II', name: 'Drs. H. Muh. Sabir' },
      { role: 'Sekretaris Umum', name: 'M. Darwis, SE' },
      { role: 'Wakil Sekretaris', name: 'Muhazil' },
      { role: 'Bendahara Umum', name: 'Hardika' },
      { role: 'Wakil Bendahara', name: 'Ismail Majju, S.Pd.' }
    ],
    idarah: [
      { section: 'Seksi Dana & Pendanaan', members: ['H. Mistang Hamid, SE (Koordinator)', 'H. Yodi Haya, S.E., M.M', 'H. Ade Musytahun Wahid, S.Si., M.M', 'Askar', 'Mujetahidin', 'Abd. Aziz', 'A. Maappasessu', 'Supriadi'] },
      { section: 'Seksi Ekonomi Umat & Usaha', members: ['Darwis Ressa (Koordinator)', 'Ruslan, S.E', 'Drs. Kusnan Sossong, M.Si', 'Nasruddin, S.E', 'Darnawan, S.E', 'Akbar'] },
      { section: 'Seksi Kemasyarakatan & Kesehatan', members: ['Amiruddin, SE (Koordinator)', 'Ekawati, Amd.Keb', 'Hj. Helmyria Mappasessu, Amd.Keb', 'Zakat & Fitrah (Dilayani Pegawai Syara\')', 'Pemuda Remaja Masjid (PRISMA): M. Rafly Jafar, Muh. Aswan, Muh. Saki, Risma'] }
    ],
    imarah: [
      { section: 'Imam & Khidmat Peribadatan', members: ['Drs. Abd. Hakim Latief, M.Pd.I (Imam Utama)', 'Nurdin Nawawi (Imam Rawatib)', 'M. Darwis, SE (Khatib)', 'Rahman B Umar (Muadzin)', 'Anas (Pelayan/Marbot)', 'Hardika (Pelayan)'] },
      { section: 'Seksi Hari Besar Islam (PHBI)', members: ['Endeng Suparman (Koordinator)', 'Basri Bas', 'Arsyad Adam', 'Amir Lawang', 'Muh. Ilham', 'Sayyed Sunarjo', 'Bahar'] },
      { section: 'Seksi Pendidikan, TPA & Perpustakaan', members: ['H. Ahmad Toufik Tahir, S.Ag., MM', 'Drs. Buneyamin Firdaus, S.Pd.', 'Abdullah, S.Pd.', 'Muaris', 'Mariyani, S.Ag., M.Pd.I (Kepala TPA)', 'Hj. Norma (Pengajar)'] },
      { section: 'Seksi Pembinaan Wanita (Majelis Taklim)', members: ['Nurhayati, S.Pd. (Koordinator)', 'Hj. Sudarti Baha, S.Pd', 'Dra. Hj. Anisa', 'Dra. Hj. Saribanong', 'Hj. Nurhayati Husain', 'Hj. Ida', 'Siti Rahmah'] }
    ],
    riayah: [
      { section: 'Seksi Pembangunan & Pemeliharaan Fisik', members: ['Drs. Muhammadong (Koordinator)', 'Syamsir Nali', 'Syarif', 'H. Muh. Yunus', 'Sultan, S.Pd'] },
      { section: 'Seksi Perlengkapan & Aset Inventaris', members: ['Arifin (Koordinator)', 'Adam', 'Bahar Dareng', 'Burhan', 'H. Supu', 'Muhammad Adha'] },
      { section: 'Seksi Kebersihan & Kesehatan Jurnal', members: ['Anas (Koordinator)', 'Abd. Hamid', 'Burhan', 'Langgoe', 'Abdulla Rajab'] },
      { section: 'Seksi Keamanan & Ketertiban', members: ['H. Syahrir (Koordinator)', 'Darwis Baha', 'Nurdin', 'Mustamin', 'Hasnawati Sakka', 'Muh. Yasin', 'Bambang'] }
    ]
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8 animate-fade-in" id="info_masjid_view">
      
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
              Satu Sistem Untuk <br />
              <span className="text-emerald-600">Semua Layanan.</span>
            </h2>
            <p className="text-slate-500 text-base leading-relaxed max-w-xl mx-auto font-medium">
              Aplikasi Masjid Jami Al Abrar Lapadde adalah platform terpadu untuk transparansi keuangan, penjadwalan ibadah, dan kemudahan sedekah bagi seluruh jamaah.
            </p>
          </section>

          {/* Contact Area */}
          <section className="bg-white rounded-[2rem] p-8 border border-slate-150 shadow-sm space-y-6">
            <h3 className="text-sm font-bold font-display text-slate-800 tracking-tight flex items-center gap-2">
               <MapPin className="h-5 w-5 text-emerald-600" /> Informasi Kontak & Akses
            </h3>
            <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
              <div className="flex gap-3">
                 <span className="font-semibold text-slate-800 w-24 shrink-0">Sekretariat:</span>
                 <span>Kantor Takmir Lt. 1 Al Abrar, Kelurahan Lapadde, Kecamatan Ujung, Kota Parepare</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-slate-800 w-24 shrink-0">E-mail:</span>
                <span className="underline text-emerald-700">takmir@alabrar-parepare.or.id</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-slate-800 w-24 shrink-0">Google Map:</span>
                <span className="text-slate-500 italic">5.021° S, 119.645° E (Lapadde)</span>
              </div>
              <div className="flex gap-3">
                <span className="font-semibold text-slate-800 w-24 shrink-0">Jam Layanan:</span>
                <span>Terbuka 24 Jam Setiap Hari bagi Jamaat Umum</span>
              </div>
            </div>
          </section>

          {/* Grid of Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                title: 'Ibadah & Agenda', 
                desc: 'Jadwal shalat realtime, petugas Jumat, dan pengumuman kajian rutin harian.',
                icon: '🕌'
              },
              { 
                title: 'Kas & Transparansi', 
                desc: 'Laporan pemasukan dan pengeluaran kas masjid yang dapat dipantau setiap saat.',
                icon: '📊'
              },
              { 
                title: 'Zakat & Infaq', 
                desc: 'Saluran donasi digital dan manajemen bantuan sosial bagi warga yang membutuhkan.',
                icon: '🤝'
              }
            ].map((item, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-4 shadow-sm hover:border-emerald-200 transition-colors text-left group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl group-hover:scale-110 transition">
                  {item.icon}
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Security Banner */}
          <section className="bg-emerald-950 text-white rounded-[3rem] p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl">
            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-10 h-10 text-emerald-400" />
            </div>
            <div className="space-y-2 text-center md:text-left">
              <h4 className="text-xl font-black tracking-tight">Kerahasiaan & Keamanan 100%</h4>
              <p className="text-[11px] text-emerald-200/50 leading-relaxed font-mono uppercase tracking-widest">
                Seluruh transaksi dan data pribadi jamaah diproses melalui sistem cloud terenkripsi standar industri.
              </p>
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
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Informasi Umum Layanan Masjid</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
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
              Masjid Jami Al Abrar didirikan pertama kali pada tahun <strong className="text-emerald-700 font-extrabold">1985</strong> sebagai sebuah tempat ibadah berupa mushalla kecil sederhana. Diinisiasi oleh tokoh adat setempat, takmir perdana, serta dukungan tulus para pemilik lahan wakaf di wilayah Kelurahan Lapadde, Parepare.
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
                  year: '1985',
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

          {/* A. PENASEHAT (ONLY SHOW IF NOT FILTERED OR MATCHES) */}
          {('penasehat'.includes(searchTerm) || structuredBoard.penasehat.some(p => p.toLowerCase().includes(searchTerm))) && (
            <section className="bg-slate-50 rounded-2xl p-6 border border-slate-200/60 shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase text-blue-800 tracking-widest flex items-center gap-2 mb-1">
                ⭐ Dewan Pelindung / Penasehat Takmir
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {structuredBoard.penasehat
                  .filter(p => p.toLowerCase().includes(searchTerm))
                  .map((p, idx) => (
                    <div key={idx} className="bg-white border rounded-xl px-4 py-3 text-xs font-semibold text-slate-700 shadow-sm flex items-center gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                      <span>{p}</span>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* B. PENGURUS INTI (HARIAN IDARAH) */}
          {('pengurus inti harian sekretariat bendahara ketua'.includes(searchTerm) || structuredBoard.inti.some(p => p.name.toLowerCase().includes(searchTerm) || p.role.toLowerCase().includes(searchTerm))) && (
            <section className="bg-white rounded-3xl p-6 border shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase text-emerald-700 tracking-widest flex items-center gap-2 mb-1">
                👥 Jajaran Pengurus Inti (Harian)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {structuredBoard.inti
                  .filter(p => p.name.toLowerCase().includes(searchTerm) || p.role.toLowerCase().includes(searchTerm))
                  .map((i, idx) => (
                    <div key={idx} className="bg-slate-50/60 border rounded-2xl p-4 shadow-sm flex flex-col justify-center text-left">
                      <span className="text-[9px] font-black tracking-wider text-emerald-700 uppercase font-mono mb-1">{i.role}</span>
                      <span className="text-sm font-black text-slate-800">{i.name}</span>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {/* C. SEKSI-SEKSI DETAIL BERDASARKAN BIDANG */}
          <div className="space-y-6">
            
            {/* Bidang Idarah Section */}
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 pl-1 border-l-4 border-amber-500 py-0.5">
                📁 Bidang Idarah (Administrasi & Pendanaan)
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {structuredBoard.idarah.map((sec, idx) => {
                  const filteredMembers = sec.members.filter(m => m.toLowerCase().includes(searchTerm));
                  if (!sec.section.toLowerCase().includes(searchTerm) && filteredMembers.length === 0) return null;
                  return (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-3">
                      <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest">{sec.section}</h4>
                      <div className="flex flex-wrap gap-2">
                        {sec.members.map((m, mIdx) => (
                          <span 
                            key={mIdx} 
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold ${
                              m.toLowerCase().includes(searchTerm) && searchTerm !== ''
                                ? 'bg-amber-100 border-amber-300 text-amber-950 font-black'
                                : 'bg-slate-50 text-slate-700 border-slate-100'
                            }`}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Bidang Imarah Section */}
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 pl-1 border-l-4 border-emerald-600 py-0.5">
                🕌 Bidang Imarah (Kemakmuran & Peribadatan)
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {structuredBoard.imarah.map((sec, idx) => {
                  const filteredMembers = sec.members.filter(m => m.toLowerCase().includes(searchTerm));
                  if (!sec.section.toLowerCase().includes(searchTerm) && filteredMembers.length === 0) return null;
                  return (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-3">
                      <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest">{sec.section}</h4>
                      <div className="flex flex-wrap gap-2">
                        {sec.members.map((m, mIdx) => (
                          <span 
                            key={mIdx} 
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold ${
                              m.toLowerCase().includes(searchTerm) && searchTerm !== ''
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-black'
                                : 'bg-slate-50 text-slate-700 border-slate-100'
                            }`}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Bidang Riayah Section */}
            <section className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 pl-1 border-l-4 border-blue-600 py-0.5">
                🛠️ Bidang Riayah (Sarana, Prasarana & Keamanan)
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {structuredBoard.riayah.map((sec, idx) => {
                  const filteredMembers = sec.members.filter(m => m.toLowerCase().includes(searchTerm));
                  if (!sec.section.toLowerCase().includes(searchTerm) && filteredMembers.length === 0) return null;
                  return (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm space-y-3">
                      <h4 className="text-xs font-black text-blue-600 uppercase tracking-widest">{sec.section}</h4>
                      <div className="flex flex-wrap gap-2">
                        {sec.members.map((m, mIdx) => (
                          <span 
                            key={mIdx} 
                            className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold ${
                              m.toLowerCase().includes(searchTerm) && searchTerm !== ''
                                ? 'bg-blue-100 border-blue-300 text-blue-950 font-black'
                                : 'bg-slate-50 text-slate-700 border-slate-100'
                            }`}
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>
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
