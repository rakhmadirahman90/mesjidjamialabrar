
import { KasJumat, RegularDonor, DonorPayment, FinancialReport, MosqueProfile } from '../types';

export const MOCK_PROFILE: MosqueProfile = {
  name: "Mesjid Jami Al Abrar",
  history: "Mesjid Jami Al Abrar didirikan pada tahun 1985 sebagai pusat dakwah dan pembinaan umat di wilayah Makassar. Berawal dari musholla kecil, kini telah berkembang menjadi pusat kegiatan keagamaan yang melayani ribuan jamaah setiap bulannya.",
  vision: "Menjadi pusat peribadatan dan pemberdayaan umat yang transparan, profesional, dan melayani dengan sepenuh hati.",
  mission: [
    "Menyediakan fasilitas ibadah yang nyaman dan bersih bagi seluruh jamaah.",
    "Menyelenggarakan kajian keislaman yang moderat dan berkualitas.",
    "Mengelola dana umat secara transparan dan akuntabel.",
    "Memberdayakan ekonomi umat melalui program-program sosial."
  ],
  capacity: 1500,
  established_year: 1985,
  address: "Jl. Masjid Al Abrar No. 123, Makassar, Sulawesi Selatan",
  phone: "(0411) 7890-1234",
  email: "kontak@alabrar-jami.or.id"
};

export const MOCK_DONORS: RegularDonor[] = [
  { id: 1, name: "H/K", commitment_amount: 100000, created_at: new Date().toISOString() },
  { id: 2, name: "Hj. ATIRAH", commitment_amount: 50000, created_at: new Date().toISOString() },
  { id: 3, name: "Drs. ABD. RAHMAN SULO", commitment_amount: 50000, created_at: new Date().toISOString() },
  { id: 4, name: "Drs. H. AT SYAMSUL EIBER", commitment_amount: 100000, created_at: new Date().toISOString() },
  { id: 5, name: "Hj. NORMA", commitment_amount: 50000, created_at: new Date().toISOString() },
  { id: 6, name: "MUSTAFA LAIDDA", commitment_amount: 50000, created_at: new Date().toISOString() },
  { id: 7, name: "HAMBA ALLAH 1", commitment_amount: 100000, created_at: new Date().toISOString() },
  { id: 8, name: "ALMR. Drs. SYAMSUDDIN. P", commitment_amount: 50000, created_at: new Date().toISOString() },
  { id: 9, name: "AZIS", commitment_amount: 50000, created_at: new Date().toISOString() },
  { id: 10, name: "H. AMIR SABANA", commitment_amount: 100000, created_at: new Date().toISOString() },
  { id: 11, name: "DR. H. ABD. WAHID THAHIR", commitment_amount: 100000, created_at: new Date().toISOString() },
  { id: 12, name: "Hj. JUSNI", commitment_amount: 100000, created_at: new Date().toISOString() },
  { id: 13, name: "HAMBA ALLAH 2", commitment_amount: 100000, created_at: new Date().toISOString() },
  { id: 14, name: "NURDIN", commitment_amount: 100000, created_at: new Date().toISOString() },
  { id: 15, name: "SAJERA", commitment_amount: 100000, created_at: new Date().toISOString() },
  { id: 16, name: "FADILLAH JULIA NINGSIH", commitment_amount: 50000, created_at: new Date().toISOString() },
  { id: 17, name: "MUHAMMAD ALKAUTSAR", commitment_amount: 50000, created_at: new Date().toISOString() },
  { id: 18, name: "DARWIS RESSA & NYONYA", commitment_amount: 100000, created_at: new Date().toISOString() },
  { id: 19, name: "BURHAN", commitment_amount: 100000, created_at: new Date().toISOString() },
  { id: 20, name: "HAFIZHA", commitment_amount: 100000, created_at: new Date().toISOString() },
  { id: 21, name: "NUR ASMAN ASKAN", commitment_amount: 100000, created_at: new Date().toISOString() },
  { id: 22, name: "BAHAR DARENG", commitment_amount: 125000, created_at: new Date().toISOString() },
  { id: 23, name: "Hj. KARIAH", commitment_amount: 50000, created_at: new Date().toISOString() },
  { id: 24, name: "ABDULLAH JALIL", commitment_amount: 50000, created_at: new Date().toISOString() },
  { id: 25, name: "Drs. H. MUH. SABIR", commitment_amount: 100000, created_at: new Date().toISOString() },
  { id: 26, name: "SAYYED SUNARDJO", commitment_amount: 50000, created_at: new Date().toISOString() },
  { id: 27, name: "H. MUH. TAUFIK T", commitment_amount: 100000, created_at: new Date().toISOString() },
  { id: 28, name: "SYAMSIR N", commitment_amount: 50000, created_at: new Date().toISOString() },
  { id: 29, name: "ANISAH", commitment_amount: 50000, created_at: new Date().toISOString() },
  { id: 30, name: "NY. HJ. ANI DANIL HAYA", commitment_amount: 50000, created_at: new Date().toISOString() },
  { id: 31, name: "HJ. HASNAH ABBAS", commitment_amount: 100000, created_at: new Date().toISOString() },
  { id: 32, name: "H. YODI HAYA", commitment_amount: 50000, created_at: new Date().toISOString() },
  { id: 33, name: "DR. ARQAM MADID", commitment_amount: 50000, created_at: new Date().toISOString() }
];

export const MOCK_PAYMENTS: DonorPayment[] = [];
const year = 2026;
const paymentMatrix: [number, number[]][] = [
  [1, [1, 2, 3, 4, 5, 6]],
  [2, [1, 2, 3, 4, 5, 6]],
  [3, [1, 2, 3, 4, 5, 6]],
  [4, [1, 2, 3, 4, 5, 6]],
  [5, [1, 2, 3, 4, 5, 6]],
  [6, [1, 2, 3, 4, 5, 6]],
  [7, [1, 2, 3, 4, 5, 6]],
  [8, [1, 2, 3, 4, 5, 6]],
  [9, [1, 2, 3, 4, 5, 6]],
  [10, [1, 2, 3, 4, 5, 6]],
  [11, [1, 2, 3, 4, 5, 6]],
  [12, [1, 2, 3, 4, 5, 6]],
  [13, [1, 2, 3, 4, 5, 6]],
  [14, [1, 2, 3, 4, 5, 6]],
  [15, [1, 2, 3, 4, 5, 6]],
  [16, [3, 4, 5, 6]],
  [17, [3, 4, 5, 6]],
  [18, [3, 4, 5, 6]],
  [19, [3, 4, 5, 6]],
  [20, [3, 4, 5, 6]],
  [21, [6]],
  [22, [4, 5, 6]],
  [23, [1, 3, 5]],
  [24, [3, 5]],
  [25, [3, 5]],
  [26, [4]],
  [27, [1, 2, 3, 4]],
  [28, [3]],
  [29, [1, 2, 3, 4]],
  [30, [4, 5, 6]],
  [31, [1, 2, 3, 4, 5, 6]],
  [32, [4, 5, 6]],
  [33, [1, 2, 3, 4, 5, 6]]
];

paymentMatrix.forEach(([id, months]) => {
  const donor = MOCK_DONORS.find(d => d.id === id);
  months.forEach(m => {
    MOCK_PAYMENTS.push({
      id: Math.random(),
      donor_id: id,
      amount: donor?.commitment_amount || 0,
      month: m,
      year: year,
      payment_date: `${year}-${String(m).padStart(2, '0')}-01`
    });
  });
});

export const MOCK_KAS_JUMAT: KasJumat[] = [
  {
    id: 1,
    report_date: '2026-06-19',
    total_inflow: 5279000,
    total_outflow: 6749000,
    details: {
      saldo_awal: 15554000,
      kotak_amal_jumat: 1044000,
      kotak_amal_harian: 967000,
      melalui_amplop: 2768000,
      melalui_donatur: 500000
    },
    amplop_detail: [
      { name: "Anggy", amount: 200000 },
      { name: "Kadir", amount: 20000 },
      { name: "Tanpa Nama", amount: 50000 },
      { name: "Tanpa Nama", amount: 50000 },
      { name: "Tanpa Nama", amount: 10000 },
      { name: "Isi Celengan Malam Syuhada", amount: 2438000 }
    ],
    pengeluaran_detail: [
      { desc: "Pembinaan Ibadah", amount: 1700000 },
      { desc: "Baliho Syuhada", amount: 100000 },
      { desc: "Beli Air (Mineral/Cebo/3dos/20 Dos/Gelas)", amount: 449000 },
      { desc: "Konsumsi Syuhada + Ceramah", amount: 4500000 }
    ]
  },
  {
    id: 2,
    report_date: '2026-06-12',
    total_inflow: 3003000,
    total_outflow: 2150000,
    details: {
      saldo_awal: 14711000,
      kotak_amal_jumat: 1210000,
      kotak_amal_harian: 918000,
      melalui_amplop: 50000,
      melalui_donatur: 825000
    },
    amplop_detail: [{ name: "Tanpa Nama", amount: 50000 }],
    pengeluaran_detail: [
      { desc: "Pembinaan Ibadah", amount: 1700000 },
      { desc: "Sumbangan Sosial", amount: 100000 },
      { desc: "Yasinan", amount: 350000 }
    ]
  }
];

export const MOCK_REPORTS: FinancialReport[] = [
  ...MOCK_KAS_JUMAT.map(k => ({
    id: Math.random(),
    type: 'income' as const,
    category: 'Infaq Jum\'at',
    amount: k.total_inflow,
    description: `Pemasukan Kas Jumat ${k.report_date}`,
    transaction_date: k.report_date
  })),
  ...MOCK_KAS_JUMAT.map(k => ({
    id: Math.random(),
    type: 'expense' as const,
    category: 'Operasional',
    amount: k.total_outflow,
    description: `Pengeluaran Kas Jumat ${k.report_date}`,
    transaction_date: k.report_date
  }))
];

export const MOCK_HADITHS = [
  {
    id: 1,
    text_arab: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    translation: "Sebaik-baik kalian adalah orang yang belajar Al-Qur'an dan mengajarkannya.",
    source: "HR. Bukhari"
  },
  {
    id: 2,
    text_arab: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
    translation: "Sesungguhnya setiap perbuatan tergantung niatnya.",
    source: "HR. Bukhari & Muslim"
  }
];

export const MOCK_KAJIAN = [
  {
    id: 1,
    title: "Kajian Fiqih Ibadah: Shalat Sesuai Sunnah",
    speaker: "Dr. H. Abd. Wahid Thahir",
    start_time: "2026-06-25T18:30:00Z",
    end_time: "2026-06-25T20:00:00Z",
    location: "Ruang Utama Mesjid",
    category: "Fiqih",
    recurrence: "Setiap Kamis Malam"
  },
  {
    id: 2,
    title: "Tafsir Jalalain: QS. Al-Baqarah",
    speaker: "KH. Syamsul Eiber",
    start_time: "2026-06-26T19:30:00Z",
    end_time: "2026-06-26T21:00:00Z",
    location: "Selar Mesjid",
    category: "Tafsir",
    recurrence: "Setiap Jumat Malam"
  },
  {
    id: 3,
    title: "Kajian Hadits Arba'in Nawawi",
    speaker: "Ustadz H. Amir Sabana",
    start_time: "2026-06-23T18:30:00Z",
    end_time: "2026-06-23T20:00:00Z",
    location: "Ruang Utama Mesjid",
    category: "Hadits",
    recurrence: "Setiap Selasa Malam"
  },
  {
    id: 4,
    title: "Tahsin & Tajwid Al-Qur'an",
    speaker: "Ustadz Mustafa Laidda",
    start_time: "2026-06-24T16:00:00Z",
    end_time: "2026-06-24T17:30:00Z",
    location: "TPA Al-Abrar",
    category: "Umum",
    recurrence: "Setiap Rabu Sore"
  }
];

export const MOCK_FACILITIES = [
  { id: 1, name: "WiFi Gratis", description: "Akses internet gratis untuk menunjang kegiatan belajar di masjid.", icon_name: "wifi" },
  { id: 2, name: "Area Wudhu Nyaman", description: "Fasilitas wudhu yang bersih dan terpisah untuk pria dan wanita.", icon_name: "wudhu" },
  { id: 3, name: "Rumah Musafir", description: "Tersedia penginapan sementara bagi musafir yang membutuhkan.", icon_name: "musafir" },
  { id: 4, name: "Akses Disabilitas", description: "Ram yang memudahkan jamaah dengan kursi roda untuk masuk.", icon_name: "disabilitas" }
];

export const MOCK_ARISAN_GROUPS = [
  { id: 1, name: "Reguler A", total_prize: 500000 },
  { id: 2, name: "Reguler B", total_prize: 1000000 }
];

export const MOCK_ARISAN_MEMBERS = [
  { id: 1, group_id: 1, name: "Hj. Norma", order_number: 1, has_received: true, receive_date: "2026-01-05" },
  { id: 2, group_id: 1, name: "Hj. Jusni", order_number: 2, has_received: true, receive_date: "2026-02-05" },
  { id: 3, group_id: 1, name: "Hj. Atirah", order_number: 3, has_received: false, receive_date: null },
  { id: 4, group_id: 1, name: "Sajera", order_number: 4, has_received: false, receive_date: null }
];

export const MOCK_QURBAN_MEMBERS = [
  { id: 1, name: "Rahmadi Rahman", phone: "08123456789", target_amount: 3500000, type: "Sapi (Kolektif)", created_at: new Date().toISOString() }
];

export const MOCK_QURBAN_TRANSACTIONS = [
  { id: 1, member_id: 1, amount: 1000000, transaction_date: "2026-05-01", created_at: new Date().toISOString() },
  { id: 2, member_id: 1, amount: 500000, transaction_date: "2026-06-01", created_at: new Date().toISOString() }
];

