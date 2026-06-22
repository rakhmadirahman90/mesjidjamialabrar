import { SlideItem } from '../types';

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
