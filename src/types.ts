export interface PrayerTime {
  id: string;
  name: string;
  time: string; // "HH:MM" format
  icon: string;
  description: string;
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'alert' | 'system';
  prayerId?: string;
  isCustomTest?: boolean;
}

// 1. Profile Masjid Interfaces & Data
export interface MosqueStructure {
  role: string;
  name: string;
  phone: string;
  imageUrl?: string;
}

export interface MosqueFacility {
  name: string;
  icon: string;
  status: 'Baik' | 'Perbaikan' | 'Butuh Donasi';
  description: string;
}

export interface MosqueProfileDetail {
  history: string;
  vision: string;
  mision: string[];
  facilities: MosqueFacility[];
  structure: MosqueStructure[];
}

// 2. Donasi Online Interfaces
export interface DonationCampaign {
  id: string;
  title: string;
  target: number;
  raised: number;
  description: string;
  deadline?: string;
}

export interface Donor {
  id: string;
  name: string;
  amount: number;
  timestamp: string;
  campaignId: string;
  message?: string;
  status: 'Tertunda' | 'Diverifikasi';
}

// 3. Keuangan Masjid Interfaces (Mosque Digital Ledger)
export interface Transaction {
  id: string;
  date: string;
  category: 'Kotak Jumat' | 'Donasi Insidental' | 'Operasional Listrik' | 'Kebersihan' | 'Santunan Anak Yatim' | 'Pembelian Inventaris' | 'Lainnya';
  type: 'debit' | 'kredit'; // debit = income (+), kredit = expense (-)
  amount: number;
  notes: string;
  registeredBy: string;
}

// 4. Inventaris Masjid Interfaces (Asset Registry)
export interface MosqueAsset {
  id: string;
  name: string;
  category: 'Alat Shalat' | 'Sound System' | 'Elektronik & Pendingin' | 'Kebersihan' | 'Kitab Suci / Al-Quran' | 'Mebel & Lemari';
  quantity: number;
  unit: string;
  condition: 'Sangat Baik' | 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
  location: string;
  registeredBy: string;
}

// 5. Manajemen Jamaah Interfaces (Congregants)
export interface Congregant {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  rtRw: string;
  familyMembersCount: number;
  status: 'Warga Tetap' | 'Pendatang' | 'Musafir';
  attendanceStatus: 'Aktif Jamaah' | 'Jarang' | 'Sakit';
  registeredDate: string;
}

// 6. Image Slider Interfaces
export interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  badge: string;
  badgeColor: string;
  actionText: string;
  actionTab?: 'beranda' | 'profil' | 'donasi' | 'keuangan' | 'inventaris' | 'jamaah';
  badgeIcon: string; // Lucide icon name or emoji
  accentColor: string;
  detailedStory: {
    heading: string;
    paragraphs: string[];
    quickSpecs: { label: string; value: string }[];
  };
}
