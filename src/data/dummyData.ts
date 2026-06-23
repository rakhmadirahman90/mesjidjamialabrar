import { 
  Transaction, 
  MosqueAsset, 
  Congregant, 
  DonationCampaign,
  SlideItem,
  KajianEntry,
  JumatEntry,
  PrayerTime
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
    date: '2026-06-20',
    category: 'Kotak Jumat',
    type: 'debit',
    amount: 4250000,
    notes: 'Infaq Jumat Berkah Pekan-3 Juni 2026',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    date: '2026-06-18',
    category: 'Operasional Listrik',
    type: 'kredit',
    amount: 1850000,
    notes: 'Bayar Tagihan Listrik PLN 3500 VA (Abonemen + Pemakaian)',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    date: '2026-06-15',
    category: 'Kebersihan',
    type: 'kredit',
    amount: 750000,
    notes: 'Pembelian Sabun Pel, Karbol, dan Tisue Kamar Mandi',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    date: '2026-06-10',
    category: 'Donasi Insidental',
    type: 'debit',
    amount: 12000000,
    notes: 'Infaq dari Keluarga Alm. H. Mustafa untuk Perbaikan Atas',
    registeredBy: 'SADIK (Bendahara)'
  },
  {
    date: '2026-06-05',
    category: 'Kotak Jumat',
    type: 'debit',
    amount: 3890000,
    notes: 'Infaq Jumat Berkah Pekan-1 Juni 2026',
    registeredBy: 'SADIK (Bendahara)'
  }
];

export const DUMMY_PERMANENT_DONORS: Partial<PermanentDonor>[] = [
  {
    no: 1,
    name: 'H. Rusli Maidin',
    amount: 250000,
    monthlyPayments: {
      'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true,
      'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false
    }
  },
  {
    no: 2,
    name: 'Drs. H. Syamsul Kiber',
    amount: 150000,
    monthlyPayments: {
      'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': false,
      'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false
    }
  },
  {
    no: 3,
    name: 'Ustadz Nur Hadi',
    amount: 500000,
    monthlyPayments: {
      'Jan': true, 'Peb': true, 'Maret': true, 'April': true, 'Mei': true, 'Jun': true,
      'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false
    }
  },
  {
    no: 4,
    name: 'H. Amir Sabana',
    amount: 200000,
    monthlyPayments: {
      'Jan': true, 'Peb': true, 'Maret': true, 'April': false, 'Mei': false, 'Jun': false,
      'Jul': false, 'Agust': false, 'Sept': false, 'Okt': false, 'Nop': false, 'Des': false
    }
  }
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
