import { 
  Transaction, 
  MosqueAsset, 
  Congregant, 
  DonationCampaign,
  SlideItem,
  KajianEntry,
  JumatEntry,
  PrayerTime,
  DetailedBoardMember
} from '../types';

export interface PermanentDonor {
  no: number;
  name: string;
  amount: number;
  monthlyPayments: { [month: string]: boolean };
}

export const DEFAULT_SLIDES: SlideItem[] = [
  {
    id: "1",
    title: "Kubah Emas & Arsitektur Megah Jami Al Abrar",
    subtitle: "MASJID JAMI AL ABRAR • LAPADDE, PAREPARE",
    description: "Berdiri anggun sebagai mercusuar spiritual di Kota Parepare. Desain kubah elips yang megah serta pencahayaan temaram menciptakan kedamaian mendalam bagi ribuan jamaah setiap harinya.",
    imageUrl: "https://images.unsplash.com/photo-1542856391-010fb87dcfed?auto=format&fit=crop&q=80&w=1200",
    badge: "Kubah & Desain Utama",
    badgeColor: "bg-emerald-500/20 text-emerald-350 border border-emerald-500/30",
    actionText: "Pelajari Sejarah Masjid",
    actionTab: "profil",
    badgeIcon: "Compass",
    accentColor: "text-emerald-400",
    order: 1,
    detailedStory: {
      heading: "Mahakarya Arsitektur Al Abrar Lapadde",
      paragraphs: [
        "Masjid Jami Al Abrar didesain sebagai perpaduan harmonis antara nilai budaya tradisional Sulawesi Selatan dengan estetika arsitektur modern Timur Tengah.",
        "Struktur kubah utama dirancang khusus demi menjamin akustik ruangan yang luar biasa jernih kala gema takbir dan lantunan suci Al-Quran dikumandangkan dari mimbar utama oleh para imam.",
        "Menara masjid setinggi 17 meter melambangkan jumlah rakaat shalat dalam sehari semalam, bertindak sebagai pengingat visual yang terus tegak berdiri di jalan reformasi moral wilayah Lapadde."
      ],
      quickSpecs: [
        { label: "Kapasitas Maksimal", value: "800 - 1.000 Jamaah" },
        { label: "Luas Bangunan Utama", value: "24 x 24 Meter Persegi" },
        { label: "Tahun Renovasi Kubah", value: "Tahun 2024 - 2026" },
        { label: "Lokasi Geografis", value: "Lapadde, Kota Parepare" }
      ]
    }
  },
  {
    id: "2",
    title: "Muzakarah & Kajian Pembinaan Ilmu Syariah",
    subtitle: "MAJELIS ILMU TERPADU • SETIAP BA'DA SUBUH & MAGHRIB",
    description: "Menyegarkan dahaga rohani dengan silabus sunnah yang dipimpin ustadz-ustadz terkemuka. Al Abrar bukan sekadar tempat ruku dan sujud, melainkan episentrum ilmu, adab, dan ukhuwah islamiyah.",
    imageUrl: "https://images.unsplash.com/photo-1609599006353-e629f1d00f18?auto=format&fit=crop&q=80&w=1200",
    badge: "Kajian & Syiar Islam",
    badgeColor: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    actionText: "Sensus Kehadiran Kajian",
    actionTab: "jamaah",
    badgeIcon: "BookOpen",
    accentColor: "text-amber-300",
    order: 2,
    detailedStory: {
      heading: "Penyuburan Majelis Ilmu & Pengajaran Kitab",
      paragraphs: [
        "Setiap pekan, takmir menyelenggarakan pengajian tafsir tematik serta fiqih ibadah guna meminimalisir salah paham di tengah umat serta memperkokoh tauhid.",
        "Tersedia pula program Tahsin Al-Quran Gratis bagi lansia serta remaja masjid yang dibidani langsung oleh para hafidz bersertifikasi nasional sanad.",
        "Kajian subuh hari ahad merupakan momen ikonik di mana bubur hangat serta logistik sembako dibagikan secara berkala kepada ratusan mustahik sekitar."
      ],
      quickSpecs: [
        { label: "Frekuensi Kajian", value: "4 Kali Sepekan" },
        { label: "Kitab Rujukan", value: "Bulughul Maram & Riyadhus Shalihin" },
        { label: "Program Unggulan", value: "Halaqah Quran Remaja & Tahsin" },
        { label: "Fasilitas Belajar", value: "Perpustakaan Mini & Layar Projektor" }
      ]
    }
  },
  {
    id: "3",
    title: "Transparansi Kas & Infaq Masjid Tanpa Celah",
    subtitle: "LAPORAN DIGITALLEDGER • SETIAP PEKAN TERBARU",
    description: "Setiap rupiah donasi kemanusiaan dan sedekah shubuh Anda dilaporkan secara presisi. Lihat arus masuk-keluar kotak amal jumat demi mengawal keberkahan pembangunan fasilitas masjid.",
    imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
    badge: "Audit Keuangan Terbuka",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
    actionText: "Buka Buku Keuangan",
    actionTab: "keuangan",
    badgeIcon: "Tv",
    accentColor: "text-cyan-400",
    order: 3,
    detailedStory: {
      heading: "Gerakan Transparansi Kas & Pengelolaan Dana",
      paragraphs: [
        "Takmir berkomitmen penuh untuk mengoptimalkan keadilan pengelolaan dana jamaah dengan konsep 'Kas Masjid Saldo Nol' di akhir periode krusial guna memaksimalkan pembangunan kemaslahatan.",
        "Penyetoran infaq melalui scan QRIS dan transfer rekening divalidasi ganda serta dipublikasikan di infoboard digital masjid dan rekapan laporan keuangan aplikasi.",
        "Zakat Mal dan Sedekah Anak Yatim dikelola oleh Badan Zakat internal Al Abrar untuk memastikan penyaluran tepat sasaran kepada keluarga miskin di 4 RT mitra."
      ],
      quickSpecs: [
        { label: "Standar Laporan", value: "PSAK 45 Modifikasi Syariah" },
        { label: "Grup Saldo Khusus", value: "Yatim, Dakwah, Renovasi, Operasional" },
        { label: "Pembaruan Data", value: "Realtime Tiap Transaksi Terekam" },
        { label: "Status audit", value: "WTP (Wajar Tanpa Pengecualian) Internal" }
      ]
    }
  }
];

export const DEFAULT_CAMPAIGNS: DonationCampaign[] = [
  { id: 'kubah', title: 'Pengecatan & Perbaikan Khotbah Kubah Utama', target: 75000000, raised: 52450000, description: 'Peremajaan warna logam eksterior kubah utama lantai dua Masjid Al Abrar.' },
  { id: 'operasional', title: 'Biaya Operasional Guru Pondok Pengajian TPA', target: 35000000, raised: 18900000, description: 'Saku bulanan guru mengaji sukarela TPA Masjid Al Abrar untuk 150 santri.' },
  { id: 'ambulan', title: 'Layanan Pembelian Sparepart & Bensin Ambulan Siaga', target: 15000000, raised: 12200000, description: 'Pengelolaan operasional mobil jenazah & ambulan tanggap bencana gratis.' }
];

export const DEFAULT_KAJIAN: KajianEntry[] = [
  { id: '1', day: 'Ahad', time: '05:30', title: 'Tafsir Al-Munir', lecturer: 'Ustadz Dr. H. Muh. Natsir, M.Pd.', theme: 'Tafsir Tematik', category: 'Ba\'da Subuh' },
  { id: '2', day: 'Senin', time: '05:15', title: 'Kultum Subuh', lecturer: 'Ustadz Drs. Abd. Hakim Latief', theme: 'Akhlakul Karimah', category: 'Ba\'da Subuh' },
  { id: '3', day: 'Setiap Hari', time: '05:15', title: 'Tadarus Bersama', lecturer: 'Pengurus Masjid', theme: 'Tahsin & Tilawah', category: 'Ba\'da Subuh' },
  { id: '4', day: 'Selasa', time: '18:30', title: 'Hadits Arbain An-Nawawi', lecturer: 'Ustadz Nur Hadi, Lc.', theme: 'Hadits', category: 'Ba\'da Maghrib' },
  { id: '5', day: 'Kamis', time: '18:30', title: 'Fiqh Ibadah Praktis', lecturer: 'Ustadz Drs. Abd. Hakim Latief', theme: 'Fiqh', category: 'Ba\'da Maghrib' },
  { id: '6', day: 'Malam Jumat', time: '18:30', title: 'Yasinan & Dzikir Bersama', lecturer: 'Jamaah Masjid', theme: 'Spiritualitas', category: 'Ba\'da Maghrib' }
];

export const DEFAULT_JUMAT: JumatEntry[] = [
  { id: '1', date: '05 Juni 2026', khatib: 'Dr. H. Rusli Maidin, M.Ag', imam: 'Drs. H. Syamsul Kiber AT', muazin: 'Rahman B Umar', month: 'Juni 2026' },
  { id: '2', date: '12 Juni 2026', khatib: 'Ustadz Nur Hadi, Lc', imam: 'Drs. Abd. Hakim Latief', muazin: 'H. Rakhmadi Rahman', month: 'Juni 2026' },
  { id: '3', date: '19 Juni 2026', khatib: 'Dr. H. Arqam Majid', imam: 'Ustadz Dr. H. Muh. Natsir', muazin: 'Muhazil', month: 'Juni 2026' },
  { id: '4', date: '26 Juni 2026', khatib: 'Prof. Dr. Drs. H. Amaluddin, M.Hum', imam: 'Drs. Abd. Hakim Latief', muazin: 'Rahman B Umar', month: 'Juni 2026' }
];

export const DEFAULT_PRAYERS: PrayerTime[] = [
  { id: 'imsak', name: 'Imsak', time: '04:35', icon: '🌙', description: 'Batas akhir makan sahur sebelum fajar' },
  { id: 'shubuh', name: 'Shubuh', time: '04:45', icon: '🌅', description: 'Awal waktu shalat fajar' },
  { id: 'syuruk', name: 'Syuruk/Terbit', time: '06:04', icon: '☀️', description: 'Waktu matahari terbit (batas dhuha)' },
  { id: 'dzuhur', name: 'Dzuhur', time: '12:05', icon: '☀️', description: 'Shalat tengah hari ketika matahari tergelincir' },
  { id: 'ashar', name: 'Ashar', time: '15:28', icon: '⛅', description: 'Shalat sore hari menjelang terbenamnya matahari' },
  { id: 'maghrib', name: 'Maghrib', time: '18:07', icon: '🌇', description: 'Shalat petang bertepatan saat matahari tenggelam' },
  { id: 'isya', name: 'Isya', time: '19:21', icon: '🌌', description: 'Shalat malam hari' }
];

export const DUMMY_TRANSACTIONS: Partial<Transaction>[] = [
  {
    id: 't0',
    date: '2026-06-04',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 14711000,
    notes: 'Saldo Awal (Limpahan Kas Pekan Sebelumnya per 5-6-26)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't1',
    date: '2026-06-05',
    category: 'Kotak Jumat',
    type: 'debit',
    amount: 1210000,
    notes: 'Kotak Amal Jumat Tanggal 5-6-26',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't2',
    date: '2026-06-12',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 918000,
    notes: 'Kotak Amal Harian Tanggal 5 s/d 12-6-26',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't3',
    date: '2026-06-12',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 50000,
    notes: 'Melalui Amplop: Tanpa Nama',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't4',
    date: '2026-06-05',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 375000,
    notes: 'Donatur: BAHAR DARENG (Bulan 4,5,6)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't5',
    date: '2026-06-05',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 100000,
    notes: 'Donatur: NY. HJ. ANI DANILHAYA (Bulan 9,10)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't6',
    date: '2026-06-05',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 100000,
    notes: 'Donatur: H. YODI HAYA (Bulan 9,10)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't7',
    date: '2026-06-05',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 100000,
    notes: 'Donatur: HAMBA ALLAH (Bulan 6)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't8',
    date: '2026-06-05',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 100000,
    notes: 'Donatur: H. AMIR SABANA (Bulan 7)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't9',
    date: '2026-06-05',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 50000,
    notes: 'Donatur: SAYYED SUNARDJO (Bulan 4)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't10',
    date: '2026-06-12',
    category: 'Lainnya',
    type: 'kredit',
    amount: 1700000,
    notes: 'PEMBINAAN IBADAH (12-6-26)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't11',
    date: '2026-06-12',
    category: 'Santunan Anak Yatim',
    type: 'kredit',
    amount: 100000,
    notes: 'SUMBANGAN SOSIAL (12-6-26)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't12',
    date: '2026-06-12',
    category: 'Lainnya',
    type: 'kredit',
    amount: 350000,
    notes: 'YASINAN (12-6-26)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't13',
    date: '2026-06-12',
    category: 'Kotak Jumat',
    type: 'debit',
    amount: 1044000,
    notes: 'Kotak Amal Jumat Tanggal 12-6-26',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't14',
    date: '2026-06-19',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 967000,
    notes: 'Kotak Amal Harian Tanggal 12 s/d 19-6-26',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't15',
    date: '2026-06-19',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 200000,
    notes: 'Melalui Amplop: ANGGI',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't16',
    date: '2026-06-19',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 20000,
    notes: 'Melalui Amplop: KADIR',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't17',
    date: '2026-06-19',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 50000,
    notes: 'Melalui Amplop: TANPA NAMA (Pemasukan 1)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't18',
    date: '2026-06-19',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 50000,
    notes: 'Melalui Amplop: TANPA NAMA (Pemasukan 2)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't19',
    date: '2026-06-19',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 10000,
    notes: 'Melalui Amplop: TANPA NAMA (Pemasukan 3)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't20',
    date: '2026-06-19',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 2438000,
    notes: 'ISI CELENGAN MALAM SYUHADA',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't21',
    date: '2026-06-12',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 100000,
    notes: 'Donatur: DRS. H. SYAMSUL EYBER AT (Bulan 6)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't22',
    date: '2026-06-12',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 100000,
    notes: 'Donatur: ALMARHUM DR. H. ABD. WAHID (Bulan 6)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't23',
    date: '2026-06-12',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 100000,
    notes: 'Donatur: HJ. JUSNI (Bulan 6)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't24',
    date: '2026-06-12',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 100000,
    notes: 'Donatur: NURDIN (Bulan 6)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't25',
    date: '2026-06-12',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 100000,
    notes: 'Donatur: SAJERA (Bulan 6)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't26',
    date: '2026-06-19',
    category: 'Lainnya',
    type: 'kredit',
    amount: 1700000,
    notes: 'PEMBINAAN IBADAH (19-6-26)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't27',
    date: '2026-06-19',
    category: 'Lainnya',
    type: 'kredit',
    amount: 100000,
    notes: 'BALIHO SYUHADA (19-6-26)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't28',
    date: '2026-06-19',
    category: 'Lainnya',
    type: 'kredit',
    amount: 449000,
    notes: 'AIR MINERAL CEBO 3 POS, 20 DOS (GAPAS)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    id: 't29',
    date: '2026-06-19',
    category: 'Lainnya',
    type: 'kredit',
    amount: 4500000,
    notes: 'Konsumsi Y/Syuhada + ceramah',
    registeredBy: 'SADIK (Bendahara)'
  }
];

export const DUMMY_PERMANENT_DONORS: Partial<PermanentDonor>[] = [
  { no: 1, name: 'H/K', amount: 100000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': true, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 2, name: 'HJ. ATIRAH', amount: 50000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': true, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 3, name: 'DRS. ABD. RAHMAN SULO', amount: 50000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': false, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 4, name: 'DRS. H. AT. SYAMSUL EYBER', amount: 100000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 5, name: 'HJ. NORMA', amount: 50000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 6, name: 'MUSTAFA LAIDDA', amount: 50000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 7, name: 'HAMBA ALLAH', amount: 100000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 8, name: 'ALMR. Drs. SYAMSUDDIN. P', amount: 50000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 9, name: 'AZIS', amount: 50000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 10, name: 'H. AMIR SABANA', amount: 100000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 11, name: 'DR. H. ABD. WAHID THAHIR', amount: 100000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 12, name: 'HJ. JUSNI', amount: 100000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 13, name: 'HAMBA ALLAH', amount: 100000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 14, name: 'NURDIN', amount: 100000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 15, name: 'SAJERA', amount: 100000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 16, name: 'FADIL AH JULIA NINGSIH', amount: 50000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 17, name: 'MUHAMMAD ALKAUTSAR', amount: 50000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 18, name: 'DARWIS RESSA & NYONYA', amount: 100000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': false, 'Mei': false, 'Jun': false, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 19, name: 'BURHAN', amount: 100000, monthlyPayments: { 'Jan': false, 'Peb': false, 'Maret': false, 'April': false, 'Mei': false, 'Jun': false, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 20, name: 'HAFIZHA', amount: 100000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': true, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 21, name: 'NUR ASMAN ASKAN', amount: 100000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': true, 'Agust': true, 'Sept': true, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 22, name: 'BAHAR DARENG', amount: 125000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 23, name: 'HJ. KARIAH', amount: 50000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 24, name: 'ABDULLAH JALIL', amount: 50000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': false, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 25, name: 'Drs. H. MUH. SABIR', amount: 100000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 26, name: 'SAYYED SUNARDJO', amount: 50000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': false, 'Jun': false, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 27, name: 'H. MUH. TAUFIK, T', amount: 100000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 28, name: 'SYAMSIR N', amount: 50000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 29, name: 'ANISAH', amount: 50000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 30, name: 'Ny. HJ. ANI DANILHAYA', amount: 50000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': true, 'Agust': true, 'Sept': true, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 31, name: 'HJ. HASNAH ABBAS', amount: 100000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': true, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 32, name: 'H. YODI HAYA', amount: 50000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': true, 'Agust': true, 'Sept': true, 'Okt': false, 'Nop': false, 'Des': false } },
  { no: 33, name: 'DR. ARQAM MAJID', amount: 50000, monthlyPayments: { 'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true, 'Jul': true, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false } }
];

export const DUMMY_ASSETS: Partial<MosqueAsset>[] = [
  {
    name: 'AC Sharp Plasma 1.5 PK',
    category: 'Elektronik & Pendingin',
    quantity: 4,
    unit: 'Unit',
    condition: 'Sangat Baik',
    location: 'Ruang Utama Lantai 1',
    registeredBy: 'Admin Al Abrar',
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Mixer Yamaha 16-Channel MG16XU',
    category: 'Sound System',
    quantity: 1,
    unit: 'Unit',
    condition: 'Baik',
    location: 'Ruang Sound/Samping Mihrab',
    registeredBy: 'Admin Al Abrar',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Al-Quran Madinah (Ukuran Sedang)',
    category: 'Kitab Suci / Al-Quran',
    quantity: 100,
    unit: 'Buah',
    condition: 'Sangat Baik',
    location: 'Lemari Shaf Belakang & Samping',
    registeredBy: 'Admin Al Abrar',
    imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629b1d500f3?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Kipas Angin Dinding Cosmos 16 inch',
    category: 'Elektronik & Pendingin',
    quantity: 8,
    unit: 'Unit',
    condition: 'Baik',
    location: 'Lantai 2 & Teras Samping',
    registeredBy: 'Admin Al Abrar',
    imageUrl: 'https://images.unsplash.com/photo-1618945037843-ab19ae4c66ff?auto=format&fit=crop&w=600&q=80'
  },
  {
    name: 'Penyedot Debu (Vacuum Cleaner) Sharp',
    category: 'Kebersihan',
    quantity: 2,
    unit: 'Unit',
    condition: 'Baik',
    location: 'Gudang Inventaris Lt. 1',
    registeredBy: 'Admin Al Abrar',
    imageUrl: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80'
  }
];

export const DUMMY_CONGREGANTS: Partial<Congregant>[] = [
  {
    fullName: 'Muhammad Yusuf',
    phone: '081244556677',
    address: 'Jl. Lapadde No. 12',
    rtRw: 'RT 001 / RW 002',
    familyMembersCount: 4,
    status: 'Warga Tetap',
    attendanceStatus: 'Aktif Jamaah',
    registeredDate: '2026-01-15',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop'
  },
  {
    fullName: 'Siti Aminah',
    phone: '085211223344',
    address: 'Gg. Damai Lapadde',
    rtRw: 'RT 003 / RW 002',
    familyMembersCount: 2,
    status: 'Warga Tetap',
    attendanceStatus: 'Sakit',
    registeredDate: '2026-02-10',
    imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop'
  },
  {
    fullName: 'Abdurrahman',
    phone: '087788990011',
    address: 'Kost Perintis Utama Blok B',
    rtRw: 'RT 005 / RW 001',
    familyMembersCount: 1,
    status: 'Pendatang',
    attendanceStatus: 'Aktif Jamaah',
    registeredDate: '2026-05-20',
    imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&h=256&auto=format&fit=crop'
  }
];

export const DUMMY_DONORS = [
  {
    name: 'H. Ahmad Yani',
    amount: 1000000,
    campaignId: 'kubah',
    message: 'Semoga berkah untuk pembangunan masjid.',
    timestamp: new Date().toISOString()
  },
  {
    name: 'Hamba Allah',
    amount: 500000,
    campaignId: 'ambulan',
    message: 'Infaq sedekah jariyah.',
    timestamp: new Date().toISOString()
  },
  {
    name: 'Ibu Fatimah',
    amount: 250000,
    campaignId: 'operasional',
    message: 'Untuk guru mengaji TPA.',
    timestamp: new Date().toISOString()
  }
];

export const DUMMY_DETAILED_BOARD: DetailedBoardMember[] = [
  // PENASEHAT
  {
    name: 'Camat Ujung',
    role: 'Pelindung Utama',
    category: 'penasehat',
    sectionName: 'Dewan Pelindung / Penasehat',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0812-1111-2222'
  },
  {
    name: 'Kepala KUA Kec. Ujung',
    role: 'Penasehat Syariah',
    category: 'penasehat',
    sectionName: 'Dewan Pelindung / Penasehat',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0813-2222-3333'
  },
  {
    name: 'Lurah Lapadde',
    role: 'Penasehat Kewilayahan',
    category: 'penasehat',
    sectionName: 'Dewan Pelindung / Penasehat',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0811-3333-4444'
  },
  {
    name: 'dr. H. Nurdin Samad, Sp.PD.',
    role: 'Penasehat Medis & Sosial',
    category: 'penasehat',
    sectionName: 'Dewan Pelindung / Penasehat',
    imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0852-4444-5555'
  },
  {
    name: 'Prof. Dr. Drs. H. Amaluddin, M.Hum',
    role: 'Penasehat Akademis & Keumatan',
    category: 'penasehat',
    sectionName: 'Dewan Pelindung / Penasehat',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0812-5555-6666'
  },

  // INTI / HARIAN
  {
    name: 'Kapt. Purn. H. Amir Sabana',
    role: 'Ketua Umum',
    category: 'inti',
    sectionName: 'Pengurus Harian Utama',
    imageUrl: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0812-4455-1211'
  },
  {
    name: 'Abdullah Jalil, SE., SH., M.Si',
    role: 'Wakil Ketua I',
    category: 'inti',
    sectionName: 'Pengurus Harian Utama',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0852-5566-7788'
  },
  {
    name: 'Drs. H. Muh. Sabir',
    role: 'Wakil Ketua II',
    category: 'inti',
    sectionName: 'Pengurus Harian Utama',
    imageUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0811-9988-1243'
  },
  {
    name: 'M. Darwis, SE',
    role: 'Sekretaris Umum',
    category: 'inti',
    sectionName: 'Pengurus Harian Utama',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0852-1122-3344'
  },
  {
    name: 'Hardika',
    role: 'Bendahara Umum',
    category: 'inti',
    sectionName: 'Pengurus Harian Utama',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0811-9988-7766'
  },

  // IDARAH
  {
    name: 'H. Mistang Hamid, SE',
    role: 'Koordinator Seksi Dana',
    category: 'idarah',
    sectionName: 'Seksi Dana & Pendanaan',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0812-7777-8888'
  },
  {
    name: 'H. Yodi Haya, S.E., M.M',
    role: 'Anggota Seksi Dana',
    category: 'idarah',
    sectionName: 'Seksi Dana & Pendanaan',
    imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0813-8888-9999'
  },
  {
    name: 'Darwis Ressa',
    role: 'Koordinator Seksi Ekonomi',
    category: 'idarah',
    sectionName: 'Seksi Ekonomi Umat & Usaha',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0811-6677-8899'
  },
  {
    name: 'Amiruddin, SE',
    role: 'Koordinator Seksi Kemasyarakatan',
    category: 'idarah',
    sectionName: 'Seksi Kemasyarakatan & Kesehatan',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0852-8899-0011'
  },

  // IMARAH
  {
    name: 'Drs. Abd. Hakim Latief, M.Pd.I',
    role: 'Imam Utama Masjid',
    category: 'imarah',
    sectionName: 'Imam & Khidmat Peribadatan',
    imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0821-2222-1111'
  },
  {
    name: 'Nurdin Nawawi',
    role: 'Imam Rawatib',
    category: 'imarah',
    sectionName: 'Imam & Khidmat Peribadatan',
    imageUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0853-2222-1111'
  },
  {
    name: 'Endeng Suparman',
    role: 'Koordinator PHBI',
    category: 'imarah',
    sectionName: 'Seksi Hari Besar Islam (PHBI)',
    imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0812-4444-2222'
  },
  {
    name: 'Mariyani, S.Ag., M.Pd.I',
    role: 'Kepala TPA Al Abrar',
    category: 'imarah',
    sectionName: 'Seksi Pendidikan, TPA & Perpustakaan',
    imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0813-5555-1111'
  },
  {
    name: 'Nurhayati, S.Pd.',
    role: 'Koordinator Majelis Taklim',
    category: 'imarah',
    sectionName: 'Seksi Pembinaan Wanita (Majelis Taklim)',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0852-6666-2222'
  },

  // RIAYAH
  {
    name: 'Drs. Muhammadong',
    role: 'Koordinator Seksi Pembangunan',
    category: 'riayah',
    sectionName: 'Seksi Pembangunan & Pemeliharaan Fisik',
    imageUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0812-9999-1111'
  },
  {
    name: 'Arifin',
    role: 'Koordinator Seksi Perlengkapan',
    category: 'riayah',
    sectionName: 'Seksi Perlengkapan & Aset Inventaris',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0811-9999-2222'
  },
  {
    name: 'Anas',
    role: 'Koordinator Kebersihan',
    category: 'riayah',
    sectionName: 'Seksi Kebersihan & Kesehatan Jurnal',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0852-9999-3333'
  },
  {
    name: 'H. Syahrir',
    role: 'Koordinator Keamanan',
    category: 'riayah',
    sectionName: 'Seksi Keamanan & Ketertiban',
    imageUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop',
    phone: '0813-9999-4444'
  }
];

