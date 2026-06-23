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
  mosqueImageUrl?: string;
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
  receiptImageUrl?: string;
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

export interface PermanentDonor {
  id: string;
  no: number;
  name: string;
  amount: number;
  monthlyPayments: { [month: string]: boolean };
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
  imageUrl?: string;
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
  imageUrl?: string;
}

// 6. Image Slider Interfaces
export interface SlideItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  order: number;
  description?: string;
  badge?: string;
  badgeColor?: string;
  actionText?: string;
  actionTab?: 'beranda' | 'profil' | 'donasi' | 'keuangan' | 'inventaris' | 'jamaah';
  badgeIcon?: string;
  accentColor?: string;
  detailedStory?: {
    heading: string;
    paragraphs: string[];
    quickSpecs: { label: string; value: string }[];
  };
}

export interface KajianEntry {
  id: string;
  day: string;
  time: string;
  title: string;
  lecturer: string;
  theme: string;
  category: 'Rutin' | 'Pilihan' | 'Khusus' | 'Ba\'da Subuh' | 'Ba\'da Maghrib' | 'Lainnya';
  imageUrl?: string;
}

export interface JumatEntry {
  id: string;
  date: string;
  khatib: string;
  imam: string;
  muazin: string;
  month: string; // e.g. "Juni 2026"
}

export interface RamadanEntry {
  id: string;
  title: string;
  time: string;
  description: string;
  icon: string;
  category: 'Ibadah' | 'Sosial' | 'Edukasi';
  imageUrl?: string;
}

export interface RoutineEntry {
  id: string;
  title: string;
  time: string;
  day: string;
  description: string;
  category: 'Harian' | 'Bulanan';
  imageUrl?: string;
}

export interface AdminDashboardPortalProps {
  onLogout: () => void;
  announcement: string;
  announcementInput: string;
  setAnnouncementInput: (val: string) => void;
  showAnnouncement: boolean;
  onUpdateAnnouncement: (text: string) => void;
  onToggleAnnouncement: (enabled: boolean) => void;
  adminPin: string;
  showPinChange: boolean;
  setShowPinChange: (val: boolean) => void;
  newPinValue: string;
  setNewPinValue: (val: string) => void;
  onPinChange: (pin: string) => void;
  onResetDefaults: () => void;
  onResetAllData: () => void;
  seedDummyData: () => void;
  onClearLogs: () => void;
  addLog: (title: string, message: string, type: 'info' | 'success' | 'alert' | 'system') => void;
  logs: NotificationLog[];
  prayers: PrayerTime[];
  nextDetails: any;
  notificationPermission: string;
  selectedAudio: string;
  isMuted: boolean;
  volume: number;
  isAudioPlaying: boolean;
  testNotificationTimeLeft: number | null;
  showConfigInfo: boolean;
  editingPrayer: any;
  editTimeValue: string;
  onSetShowConfigInfo: (val: boolean) => void;
  onTriggerQuickTest: () => void;
  onRequestNotificationPermission: () => void;
  onSetSelectedAudio: (val: any) => void;
  onSetIsMuted: (val: boolean) => void;
  onSetVolume: (val: number) => void;
  onToggleSoundPlay: () => void;
  onStartEditing: (p: any) => void;
  onSetEditTimeValue: (val: string) => void;
  onSavePrayerEdit: () => void;
  onCancelEdit: () => void;
  onDeleteLog: (id: string) => void;
  slides: SlideItem[];
  kajian: KajianEntry[];
  jumat: JumatEntry[];
  ramadan: RamadanEntry[];
  routine: RoutineEntry[];
  campaigns: DonationCampaign[];
  onDonationSuccess: (title: string, msg: string, amount: number) => void;
  triggerAudioPlayback: () => void;
  detailedBoard: DetailedBoardMember[];
}

// 12. Detailed Board Member Interface
export interface DetailedBoardMember {
  id?: string;
  name: string;
  role: string;
  category: 'penasehat' | 'inti' | 'idarah' | 'imarah' | 'riayah';
  sectionName?: string;
  imageUrl?: string;
  phone?: string;
}

