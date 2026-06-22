
export interface Hadith {
  id: number;
  text_arab: string;
  translation: string;
  source?: string;
  created_at: string;
}

export interface PrayerTime {
  id: number;
  name: string;
  time: string;
}

export interface MosqueProfile {
  id?: number;
  name: string;
  history: string;
  vision: string;
  mission: string[];
  capacity: number;
  established_year: number;
  address: string;
  phone: string;
  email: string;
}

export interface KajianSchedule {
  id: number;
  title: string;
  speaker: string;
  location: string;
  start_time: string;
  category: 'Tauhid' | 'Fiqih' | 'Tafsir' | 'Hadits' | 'Umum';
  recurrence?: string;
}

export interface MosqueFacility {
  id: number;
  name: string;
  description: string;
  icon_name: string;
}

export interface FinancialReport {
  id: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  transaction_date: string;
  receipt_url?: string;
}

export interface KasJumat {
  id: number;
  report_date: string;
  total_inflow: number;
  total_outflow: number;
  details?: any; // Generic details object
  amplop_detail?: any;
  donatur_detail?: any;
  pengeluaran_detail?: any;
}

export interface ArisanMember {
  id: number;
  group_id: number;
  name: string;
  phone?: string;
  join_date: string;
  order_number?: number;
  has_received?: boolean;
  receive_date?: string;
  total_contribution?: number;
}

export interface QurbanMember {
  id: number;
  name: string;
  phone: string;
  target_amount: number;
  type: string;
  total_paid?: number;
}

export interface QurbanTransaction {
  id: number;
  member_id: number;
  amount: number;
  transaction_date: string;
}

export interface ArisanGroup {
  id: number;
  name: string;
  total_prize: number;
}

export interface RegularDonor {
  id: number;
  name: string;
  phone?: string;
  commitment_amount: number;
  created_at: string;
}

export interface DonorPayment {
  id: number;
  donor_id: number;
  amount: number;
  month: number;
  year: number;
  payment_date: string;
}

export interface AktivitasItem {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  schedule: string;
  beneficiary: string;
  badge: string;
  image?: string;
  colorGradient?: string;
  iconColor?: string;
  borderColor?: string;
  iconName?: string; // used to display custom icons from a map dynamically or store string names
}
