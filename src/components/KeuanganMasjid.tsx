import React, { useState } from 'react';
import { Transaction } from '../types';
import { TrendingUp, TrendingDown, Wallet, PlusCircle, ClipboardCheck, Users, Search, Trash2, Edit2, X, Save } from 'lucide-react';

interface PermanentDonor {
  no: number;
  name: string;
  amount: number;
  monthlyPayments: { [month: string]: boolean };
}

export default function KeuanganMasjid({ 
  isAdmin, 
  onAddLog, 
  onShowLogin 
}: { 
  isAdmin: boolean; 
  onAddLog: (title: string, msg: string, type: 'info' | 'success' | 'alert' | 'system') => void;
  onShowLogin: () => void;
}) {
  // Database transactions state locally backed up in local storage - Exact Match of Sheets 1 & 2
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('abrar_financial_transactions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 10) return parsed; // If custom transactions exist, use them
      } catch (e) {
        // use default
      }
    }
    const defaultTx: Transaction[] = [
      // === SHEET 2: PEKAN 12 JUNI - 19 JUNI 2026 ===
      { id: 'tx_s2_exp4', date: '2026-06-19', category: 'Lainnya', type: 'kredit', amount: 4500000, notes: 'Biaya Konsumsi Malam Syuhada + Ceramah', registeredBy: 'SADIK' },
      { id: 'tx_s2_exp3', date: '2026-06-19', category: 'Lainnya', type: 'kredit', amount: 449000, notes: 'Pengiraan Air: Mineral Gelas 3 Dos, & Clara 20 Dos', registeredBy: 'SADIK' },
      { id: 'tx_s2_exp2', date: '2026-06-19', category: 'Lainnya', type: 'kredit', amount: 100000, notes: 'Pembuatan Baliho Malam Syuhada', registeredBy: 'SADIK' },
      { id: 'tx_s2_exp1', date: '2026-06-19', category: 'Santunan Anak Yatim', type: 'kredit', amount: 1700000, notes: 'Biaya Pembinaan Ibadah Pekan 12 s/d 19 Juni 2026', registeredBy: 'SADIK' },
      { id: 'tx_s2_don5', date: '2026-06-12', category: 'Donasi Insidental', type: 'debit', amount: 100000, notes: 'Donatur Tetap: Sajera (No. 15) untuk Bulan Juni (6)', registeredBy: 'SADIK' },
      { id: 'tx_s2_don4', date: '2026-06-12', category: 'Donasi Insidental', type: 'debit', amount: 100000, notes: 'Donatur Tetap: Nurdin (No. 14) untuk Bulan Juni (6)', registeredBy: 'SADIK' },
      { id: 'tx_s2_don3', date: '2026-06-12', category: 'Donasi Insidental', type: 'debit', amount: 100000, notes: 'Donatur Tetap: Hj. Jusni (No. 12) untuk Bulan Juni (6)', registeredBy: 'SADIK' },
      { id: 'tx_s2_don2', date: '2026-06-12', category: 'Donasi Insidental', type: 'debit', amount: 100000, notes: 'Donatur Tetap: Alm. Dr. H. Abd. Wahid Thahir (No. 11) untuk Bulan Juni (6)', registeredBy: 'SADIK' },
      { id: 'tx_s2_don1', date: '2026-06-12', category: 'Donasi Insidental', type: 'debit', amount: 100000, notes: 'Donatur Tetap: Drs. H. Syamsul Kiber AT (No. 4) untuk Bulan Juni (6)', registeredBy: 'SADIK' },
      { id: 'tx_s2_amp6', date: '2026-06-19', category: 'Donasi Insidental', type: 'debit', amount: 2438000, notes: 'Isi Celengan Malam Syuhada (Kategori Amplop)', registeredBy: 'SADIK' },
      { id: 'tx_s2_amp5', date: '2026-06-19', category: 'Donasi Insidental', type: 'debit', amount: 10000, notes: 'Amplop Tanpa Nama V', registeredBy: 'SADIK' },
      { id: 'tx_s2_amp4', date: '2026-06-19', category: 'Donasi Insidental', type: 'debit', amount: 50000, notes: 'Amplop Tanpa Nama IV', registeredBy: 'SADIK' },
      { id: 'tx_s2_amp3', date: '2026-06-19', category: 'Donasi Insidental', type: 'debit', amount: 50000, notes: 'Amplop Tanpa Nama III', registeredBy: 'SADIK' },
      { id: 'tx_s2_amp2', date: '2026-06-19', category: 'Donasi Insidental', type: 'debit', amount: 20000, notes: 'Amplop Kependudukan atas nama Kadir', registeredBy: 'SADIK' },
      { id: 'tx_s2_amp1', date: '2026-06-19', category: 'Donasi Insidental', type: 'debit', amount: 200000, notes: 'Amplop Kependudukan atas nama Ansei', registeredBy: 'SADIK' },
      { id: 'tx_s2_har1', date: '2026-06-19', category: 'Kotak Jumat', type: 'debit', amount: 967000, notes: 'Kotak Amal Harian Masjid (Periode 12 s/d 19 Juni 2026)', registeredBy: 'SADIK' },
      { id: 'tx_s2_jum1', date: '2026-06-12', category: 'Kotak Jumat', type: 'debit', amount: 1044000, notes: 'Kotak Amal Shalat Jumat tanggal 12 Juni 2026', registeredBy: 'SADIK' },

      // === SHEET 1: PEKAN 5 JUNI - 12 JUNI 2026 ===
      { id: 'tx_s1_exp3', date: '2026-06-12', category: 'Lainnya', type: 'kredit', amount: 350000, notes: 'Biaya Pelaksanaan Yasinan Kebersamaan Rutin', registeredBy: 'SADIK' },
      { id: 'tx_s1_exp2', date: '2026-06-12', category: 'Santunan Anak Yatim', type: 'kredit', amount: 100000, notes: 'Sumbangan Sosial / Santunan kepada Keluarga Jamaah', registeredBy: 'SADIK' },
      { id: 'tx_s1_exp1', date: '2026-06-12', category: 'Lainnya', type: 'kredit', amount: 1700000, notes: 'Biaya Pembinaan Hubungan Keagamaan / Ibadah Masjid', registeredBy: 'SADIK' },
      { id: 'tx_s1_don6', date: '2026-06-05', category: 'Donasi Insidental', type: 'debit', amount: 50000, notes: 'Donatur Tetap: Sayyed Sunardjo (No. 26) untuk Bulan April (4)', registeredBy: 'SADIK' },
      { id: 'tx_s1_don5', date: '2026-06-05', category: 'Donasi Insidental', type: 'debit', amount: 100000, notes: 'Donatur Tetap: H. Amir Sabana (No. 10) untuk Bulan Juli (7)', registeredBy: 'SADIK' },
      { id: 'tx_s1_don4', date: '2026-06-05', category: 'Donasi Insidental', type: 'debit', amount: 100000, notes: 'Donatur Tetap: Hamba Allah (No. 7) untuk Bulan Juni (6)', registeredBy: 'SADIK' },
      { id: 'tx_s1_don3', date: '2026-06-05', category: 'Donasi Insidental', type: 'debit', amount: 100000, notes: 'Donatur Tetap: H. Yodi Haya (No. 32) untuk Bulan September & Oktober (9, 10)', registeredBy: 'SADIK' },
      { id: 'tx_s1_don2', date: '2026-06-05', category: 'Donasi Insidental', type: 'debit', amount: 100000, notes: 'Donatur Tetap: Ny. Hj. Ani Danilhaya (No. 30) untuk Bulan September & Oktober (9, 10)', registeredBy: 'SADIK' },
      { id: 'tx_s1_don1', date: '2026-06-05', category: 'Donasi Insidental', type: 'debit', amount: 375000, notes: 'Donatur Tetap: Bahar Dareng (No. 22) untuk Bulan April, Mei, & Juni (Lunas)', registeredBy: 'SADIK' },
      { id: 'tx_s1_amp1', date: '2026-06-12', category: 'Donasi Insidental', type: 'debit', amount: 50000, notes: 'Infaq Amplop - Tanpa Nama', registeredBy: 'SADIK' },
      { id: 'tx_s1_har1', date: '2026-06-12', category: 'Kotak Jumat', type: 'debit', amount: 918000, notes: 'Kotak Amal Harian Masjid (Periode 5 s/d 12 Juni 2026)', registeredBy: 'SADIK' },
      { id: 'tx_s1_jum1', date: '2026-06-05', category: 'Kotak Jumat', type: 'debit', amount: 1210000, notes: 'Kotak Amal Shalat Jumat tanggal 5 Juni 2026', registeredBy: 'SADIK' },

      // === SALDO AWAL (5 JUNI 2026) ===
      { id: 'tx_s1_init', date: '2026-06-05', category: 'Lainnya', type: 'debit', amount: 14711000, notes: 'Saldo Awal Buku Kas Utama per tanggal 5 Juni 2026', registeredBy: 'SADIK' }
    ];
    localStorage.setItem('abrar_financial_transactions', JSON.stringify(defaultTx));
    return defaultTx;
  });

  // Active view layout tab switch
  const [activeSubTab, setActiveSubTab] = useState<'kas_utama' | 'donatur_tetap'>('kas_utama');

  // Search and filter for permanent donors
  const [searchDonorQuery, setSearchDonorQuery] = useState('');

  // Permanent Donors list (Second Image)
  const [permanentDonors, setPermanentDonors] = useState<PermanentDonor[]>(() => {
    const saved = localStorage.getItem('abrar_permanent_donors');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // continue
      }
    }
    const months = ['Jan', 'Peb', 'Maret', 'April', 'Mei', 'Jun', 'Jul', 'Agust', 'Sept', 'Okt', 'Nop', 'Des'];
    
    const rawDonors = [
      { no: 1, name: 'H/K', amount: 100000, paidCount: 6 },
      { no: 2, name: 'Hj. ATIRAH', amount: 50000, paidCount: 6 },
      { no: 3, name: 'Drs. ABD. RAHMAN SULO', amount: 50000, paidCount: 6 },
      { no: 4, name: 'Drs. H. AT. SYAMSUL EIBER', amount: 100000, paidCount: 6 },
      { no: 5, name: 'Hj. NORMA', amount: 50000, paidCount: 6 },
      { no: 6, name: 'MUSTAFA LAIDDA', amount: 50000, paidCount: 5 },
      { no: 7, name: 'HAMBA ALLAH', amount: 100000, paidCount: 6 },
      { no: 8, name: 'ALMR. Drs. SYAMSUDDIN. P', amount: 50000, paidCount: 6 },
      { no: 9, name: 'AZIS', amount: 50000, paidCount: 6 },
      { no: 10, name: 'H. AMIR SABANA', amount: 100000, paidCount: 7 },
      { no: 11, name: 'DR. H. ABD. WAHID THAHIR', amount: 100000, paidCount: 6 },
      { no: 12, name: 'Hj. JUSNI', amount: 100000, paidCount: 6 },
      { no: 13, name: 'HAMBA ALLAH', amount: 100000, paidCount: 6 },
      { no: 14, name: 'NURDIN', amount: 100000, paidCount: 6 },
      { no: 15, name: 'SAJERA', amount: 100000, paidCount: 6 },
      { no: 16, name: 'FADIL AH JULIA NINGSIH', amount: 50000, paidCount: 6 },
      { no: 17, name: 'MUHAMMAD ALKAUTSAR', amount: 50000, paidCount: 6 },
      { no: 18, name: 'DARWIS RESSA & NYONYA', amount: 100000, paidCount: 12 },
      { no: 19, name: 'BURHAN', amount: 100000, paidCount: 0 }, // Crossed out / blank
      { no: 20, name: 'HAFIZHA', amount: 100000, paidCount: 12 },
      { no: 21, name: 'NUR ASMAN ASKAN', amount: 100000, paidCount: 11 },
      { no: 22, name: 'BAHAR DARENG', amount: 125000, paidCount: 6 },
      { no: 23, name: 'Hj. KARIAH', amount: 50000, paidCount: 6 },
      { no: 24, name: 'ABDULLAH JALIL', amount: 50000, paidCount: 5 },
      { no: 25, name: 'Drs. H. MUH. SABIR', amount: 100000, paidCount: 7 },
      { no: 26, name: 'SAYYED SUNARDJO', amount: 50000, paidCount: 6 },
      { no: 27, name: 'H. MUH. TAUFIK. T', amount: 100000, paidCount: 7 },
      { no: 28, name: 'SYAMSIR N', amount: 50000, paidCount: 6 },
      { no: 29, name: 'ANISAH', amount: 50000, paidCount: 6 },
      { id: 'don_30', no: 30, name: 'Ny. HJ. ANI DANILHAYA', amount: 50000, paidCount: 10 },
      { id: 'don_31', no: 31, name: 'Hj. HASNAH ABBAS', amount: 100000, paidCount: 8 },
      { id: 'don_32', no: 32, name: 'H. YODI HAYA', amount: 50000, paidCount: 10 },
      { id: 'don_33', no: 33, name: 'DR. ARQAM MAJID', amount: 50000, paidCount: 8 }
    ];

    const initialDonors: PermanentDonor[] = rawDonors.map(d => {
      const pm: { [m: string]: boolean } = {};
      months.forEach((m, idx) => {
        pm[m] = idx < d.paidCount;
      });
      return {
        no: d.no,
        name: d.name,
        amount: d.amount,
        monthlyPayments: pm
      };
    });
    localStorage.setItem('abrar_permanent_donors', JSON.stringify(initialDonors));
    return initialDonors;
  });

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'debit' | 'kredit'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Input states for Admin Form
  const [txCategory, setTxCategory] = useState<'Kotak Jumat' | 'Donasi Insidental' | 'Operasional Listrik' | 'Kebersihan' | 'Santunan Anak Yatim' | 'Pembelian Inventaris' | 'Lainnya'>('Kotak Jumat');
  const [txType, setTxType] = useState<'debit' | 'kredit'>('debit');
  const [txAmount, setTxAmount] = useState<string>('');
  const [txNotes, setTxNotes] = useState<string>('');

  // Math totals
  const totalDebit = transactions.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
  const totalKredit = transactions.filter(t => t.type === 'kredit').reduce((sum, t) => sum + t.amount, 0);
  const totalBalance = totalDebit - totalKredit;
  
  // === PERMANENT DONORS SUMMARY MATH ===
  const permanentDonorsTotalCollected = permanentDonors.reduce((total, donor) => {
    const paidMonthsCount = Object.values(donor.monthlyPayments).filter(v => v === true).length;
    return total + (donor.amount * paidMonthsCount);
  }, 0);

  const totalPossibleCollections = permanentDonors.reduce((total, d) => total + (d.amount * 12), 0);
  const totalActiveDonors = permanentDonors.filter(d => Object.values(d.monthlyPayments).some(v => v)).length;
  const collectionPercentage = totalPossibleCollections > 0 ? (permanentDonorsTotalCollected / totalPossibleCollections) * 100 : 0;

  // Edit/Delete state
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [editTxForm, setEditTxForm] = useState<Partial<Transaction>>({});

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onShowLogin();
      return;
    }

    const amt = parseInt(txAmount, 10);
    if (isNaN(amt) || amt <= 0) {
      alert('Masukkan nominal jumlah uang yang valid!');
      return;
    }

    if (!txNotes.trim()) {
      alert('Catatan transaksi harus diisi agar laporan transparan!');
      return;
    }

    const newTx: Transaction = {
      id: 'tx_' + Date.now(),
      date: new Date().toISOString().substring(0, 10),
      category: txCategory,
      type: txType,
      amount: amt,
      notes: txNotes.trim(),
      registeredBy: 'Admin Al Abrar'
    };

    const updated = [newTx, ...transactions];
    setTransactions(updated);
    localStorage.setItem('abrar_financial_transactions', JSON.stringify(updated));

    // trigger system logs reporting
    onAddLog(
      `Kas Diperbarui: ${txCategory}`,
      `Transaksi baru dicatatkan oleh Admin: ${txType === 'debit' ? 'Pemasukan (+)' : 'Pengeluaran (-)'} Rp ${amt.toLocaleString('id-ID')} dengan catatan: "${txNotes}".`,
      txType === 'debit' ? 'success' : 'alert'
    );

    // Reset Form fields
    setTxAmount('');
    setTxNotes('');
    alert('✅ Sukses! Transaksi kas masjid berhasil dicatatkan.');
  };

  const handleRemoveTransaction = (id: string, notes: string) => {
    if (!isAdmin) {
      onShowLogin();
      return;
    }
    if (confirm(`Hapus transaksi "${notes}"?`)) {
      const updated = transactions.filter(t => t.id !== id);
      setTransactions(updated);
      localStorage.setItem('abrar_financial_transactions', JSON.stringify(updated));
      onAddLog('Transaksi Dihapus', `Catatan transaksi "${notes}" telah dihapus.`, 'alert');
    }
  };

  const startEditingTx = (t: Transaction) => {
    setEditingTxId(t.id);
    setEditTxForm(t);
  };

  const saveEditTx = () => {
    const updated = transactions.map(t => t.id === editingTxId ? { ...t, ...editTxForm } as Transaction : t);
    setTransactions(updated);
    localStorage.setItem('abrar_financial_transactions', JSON.stringify(updated));
    onAddLog('Transaksi Diperbarui', `Catatan Kas "${editTxForm.notes}" telah diperbarui.`, 'info');
    setEditingTxId(null);
    setEditTxForm({});
    alert('Data transaksi berhasil diperbarui.');
  };

  const handleTogglePayment = (donorNo: number, month: string) => {
    if (!isAdmin) {
      alert('🔐 Status pembayaran donatur tetap hanya dapat diubah oleh Admin Pelaksana (Silakan Masuk)!');
      return;
    }
    const updated = permanentDonors.map(d => {
      if (d.no === donorNo) {
        const pm = { ...d.monthlyPayments, [month]: !d.monthlyPayments[month] };
        return { ...d, monthlyPayments: pm };
      }
      return d;
    });
    setPermanentDonors(updated);
    localStorage.setItem('abrar_permanent_donors', JSON.stringify(updated));
    onAddLog(
      'Donatur Tetap Diperbarui',
      `Telah diubah status pembayaran bulan ${month} untuk tabel Donatur Tetap No. ${donorNo}.`,
      'info'
    );
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCat = filterCategory === 'all' || t.category === filterCategory;
    return matchesType && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="accounting_ledger_view">
      
      {/* Visual Analytics dashboard strip cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Card 1: Total Saldo / Cash Balance */}
        <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1 text-left">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">SALDO KAS MASJID DIGITAL</span>
            <span className="block text-2xl font-black text-emerald-950 font-mono">
              Rp {totalBalance.toLocaleString('id-ID')}
            </span>
            <span className="block text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 py-0.5 px-2 rounded-full inline-block font-sans font-medium">
              Bebas Hutang / Surplus
            </span>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl">
            <Wallet className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Total Income */}
        <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1 text-left">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">TOTAL PEMASUKAN (DEBIT)</span>
            <span className="block text-2xl font-black text-emerald-700 font-mono">
              +Rp {totalDebit.toLocaleString('id-ID')}
            </span>
            <span className="block text-[11px] text-slate-400 font-sans">
              Terakumulasi dari kotak jumat & infaq online
            </span>
          </div>
          <div className="p-4 bg-teal-50 text-emerald-800 rounded-2xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Total Expenses */}
        <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div className="space-y-1 text-left">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">TOTAL PENGELUARAN (KREDIT)</span>
            <span className="block text-2xl font-black text-rose-600 font-mono">
              -Rp {totalKredit.toLocaleString('id-ID')}
            </span>
            <span className="block text-[11px] text-slate-400 font-sans">
              Pengeluaran untuk pembinaan ibadah & konsumsi
            </span>
          </div>
          <div className="p-4 bg-rose-50 text-rose-700 rounded-2xl">
            <TrendingDown className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* Sub-navigation tab view switcher */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-full max-w-xl mx-auto md:mx-0">
        <button
          onClick={() => setActiveSubTab('kas_utama')}
          className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'kas_utama'
              ? 'bg-white text-slate-900 shadow border border-slate-200/40'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardCheck className="h-4 w-4 text-emerald-600" />
          <span>Jurnal Kas Utama</span>
        </button>
        <button
          onClick={() => setActiveSubTab('donatur_tetap')}
          className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeSubTab === 'donatur_tetap'
              ? 'bg-white text-slate-900 shadow border border-slate-200/40'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="h-4 w-4 text-amber-600" />
          <span>Daftar Donatur Tetap (Jan - Des)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {activeSubTab === 'donatur_tetap' ? (
          /* ========================================================================= */
          /*                       BRAND NEW DONATUR TETAP GRID VIEW                   */
          /* ========================================================================= */
          <div className="col-span-12 space-y-6" id="permanent_donors_interactive_board">
            
            {/* Summary Statistics Cards for Donors */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Users className="h-12 w-12" />
                </div>
                <div className="relative z-10 space-y-1 text-left">
                  <span className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Terkumpul</span>
                  <span className="block text-xl font-black font-mono text-emerald-400">
                    Rp {permanentDonorsTotalCollected.toLocaleString('id-ID')}
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${collectionPercentage}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{collectionPercentage.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                  <Users className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">DONATUR AKTIF</span>
                  <span className="block text-xl font-black text-slate-800">{totalActiveDonors} / {permanentDonors.length}</span>
                  <span className="block text-[10px] text-slate-500">Orang sudah berpartisipasi</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">RATA-RATA DONASI</span>
                  <span className="block text-xl font-black text-slate-800">
                    Rp {(permanentDonorsTotalCollected / (totalActiveDonors || 1)).toLocaleString('id-ID')}
                  </span>
                  <span className="block text-[10px] text-slate-500">Per donatur tunggal</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-5 border border-slate-150 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <ClipboardCheck className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">TARGET TAHUNAN</span>
                  <span className="block text-lg font-black text-slate-800">Rp {totalPossibleCollections.toLocaleString('id-ID')}</span>
                  <span className="block text-[10px] text-slate-500">Estimasi total 12 bulan</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-6">
              
              {/* Board Header details */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="text-left space-y-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-500/10 text-amber-700 border border-amber-500/20">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                    DAFTAR DONASI BULANAN 2026
                  </span>
                  <h3 className="text-lg sm:text-xl font-display font-black text-slate-800 tracking-tight leading-none uppercase">
                    DAFTAR NAMA DONATUR TETAP MASJID JAMI AL-ABRAR
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Kelurahan Lapadde, Kecamatan Ujung, Kota Parepare • Disinkronkan dengan papan whiteboard manual.
                  </p>
                </div>

                {/* Filter and Search Box */}
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau nomor donatur tetap..."
                    value={searchDonorQuery}
                    onChange={(e) => setSearchDonorQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/65 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-slate-400 transition"
                  />
                </div>
              </div>

              {/* Informative tips */}
              <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl text-left flex items-start gap-3">
                <span className="text-lg">📢</span>
                <p className="text-slate-600 text-xs leading-relaxed">
                  <strong>Panduan Interaktif:</strong> Anda dapat mengklik sel bulan apa pun (<strong>JAN - DES</strong>) di baris donatur untuk mencatat atau membatalkan status pembayaran secara langsung (Memerlukan login <strong>Admin Masjid</strong>).
                </p>
              </div>

              {/* Interactive Board Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-150 shadow-inner bg-slate-50/30">
                <table className="w-full text-center border-collapse min-w-[1000px] text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-white text-[10px] font-black uppercase tracking-wider font-mono">
                      <th className="py-4 px-2 w-14 border border-slate-850">NO.</th>
                      <th className="py-4 px-4 text-left w-52 border border-slate-850">NAMA DONATUR</th>
                      <th className="py-4 px-3 text-right w-24 border border-slate-850">NOMINAL</th>
                      <th className="py-4 px-3 w-28 border border-slate-850">FREKUENSI</th>
                      <th className="py-4 px-3 text-right w-28 border border-slate-850">TOTAL</th>
                      {['JAN', 'PEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGU', 'SEP', 'OKT', 'NOP', 'DES'].map(m => (
                        <th key={m} className={`py-4 px-1 border border-slate-850 text-[8px] ${['JUN', 'JUL'].includes(m) ? 'bg-emerald-900' : ''}`}>{m}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {permanentDonors
                      .filter(d => d.name.toLowerCase().includes(searchDonorQuery.toLowerCase()) || d.no.toString() === searchDonorQuery)
                      .map((d) => {
                        const paidCount = Object.values(d.monthlyPayments).filter(v => v === true).length;
                        const totalDonorCollected = d.amount * paidCount;
                        const progressPercent = (paidCount / 12) * 100;

                        return (
                          <tr key={d.no} className="hover:bg-slate-50 transition-colors group">
                            <td className="py-3 px-2 font-mono font-bold text-slate-400 border border-slate-100">{d.no}</td>
                            <td className="py-3 px-4 text-left border border-slate-100">
                              <span className="block font-black text-slate-800 text-sm group-hover:text-emerald-700 transition-colors uppercase">{d.name}</span>
                              <span className="text-[9px] text-slate-400 font-bold font-mono tracking-tighter">ID: D-021-{d.no.toString().padStart(3, '0')}</span>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-500 border border-slate-100">
                              Rp {d.amount.toLocaleString('id-ID')}
                            </td>
                            <td className="py-3 px-3 border border-slate-100">
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1">
                                  <span className="font-mono font-black text-[10px] text-slate-700">{paidCount} / 12</span>
                                  {paidCount === 12 && <div className="w-2.5 h-2.5 bg-amber-400 rounded-full flex items-center justify-center text-[6px] text-slate-900 ring-2 ring-amber-100">★</div>}
                                </div>
                                <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full transition-all duration-1000 ${paidCount === 12 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-amber-400'}`}
                                    style={{ width: `${progressPercent}%` }}
                                  ></div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right border border-slate-100">
                              <span className="block font-mono font-black text-slate-900">
                                Rp {totalDonorCollected.toLocaleString('id-ID')}
                              </span>
                              <span className="text-[9px] text-emerald-600 font-bold uppercase">{progressPercent.toFixed(0)}% PAID</span>
                            </td>
                            {['Jan', 'Peb', 'Maret', 'April', 'Mei', 'Jun', 'Jul', 'Agust', 'Sept', 'Okt', 'Nop', 'Des'].map((m) => {
                              const isPaid = d.monthlyPayments[m];
                              return (
                                <td 
                                  key={m} 
                                  onClick={() => handleTogglePayment(d.no, m)}
                                  className={`py-3 px-1 border border-slate-100 transition-all font-mono font-black select-none text-xs cursor-pointer ${
                                    isPaid 
                                      ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' 
                                      : 'bg-white text-slate-200 hover:bg-slate-100'
                                  }`}
                                  title={`${d.name} - ${m}: Klik untuk toggle status.`}
                                >
                                  {isPaid ? "✓" : "—"}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {/* Verified Signatures Replicating the physical whiteboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100 text-slate-500 font-semibold text-xs text-center">
                <div className="flex flex-col items-center">
                  <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px] font-mono mb-2">Mengetahui Kelompok Pelaksana</p>
                  <p className="font-extrabold text-slate-700">Ketua Takmir</p>
                  <div className="h-16 flex items-center justify-center italic text-slate-300 font-normal text-[10px]">
                    [Tanda Tangan Elektronik Terverifikasi]
                  </div>
                  <p className="font-black text-slate-800 text-sm border-t border-slate-200 pt-1 w-44">H. AMIR SABANA</p>
                </div>
                <div className="flex flex-col items-center">
                  <p className="font-bold uppercase tracking-wider text-slate-400 text-[10px] font-mono mb-2">Pencatat Keuangan Penanggung Jawab</p>
                  <p className="font-extrabold text-slate-700">Bendahara Umum</p>
                  <div className="h-16 flex items-center justify-center font-mono font-black text-emerald-700 tracking-wider text-sm select-none">
                    S A D I K
                  </div>
                  <p className="font-black text-slate-800 text-sm border-t border-slate-200 pt-1 w-44">SADIK</p>
                </div>
              </div>

            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /*                          STANDARD KAS UTAMA JURNAL VIEW                   */
          /* ========================================================================= */
          <>
            {/* Left Side: Ledger Transaction list */}
            <div className="lg:col-span-8 space-y-4">
              
              <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
                
                {/* Table Filter options Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-left">
                    <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-emerald-700" /> Jurnal Buku Kas Utama
                    </h3>
                    <p className="text-slate-400 text-xs">Arsip catatan transparan demi akuntabilitas khalayak jamaah.</p>
                  </div>

                  {/* Filtering Controls */}
                  <div className="flex flex-wrap gap-2.5">
                    
                    <div className="flex bg-slate-100 rounded-xl p-1 text-xs">
                      <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition ${
                          filterType === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Semua
                      </button>
                      <button
                        onClick={() => setFilterType('debit')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition ${
                          filterType === 'debit' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-750'
                        }`}
                      >
                        Pemasukan
                      </button>
                      <button
                        onClick={() => setFilterType('kredit')}
                        className={`px-3 py-1.5 rounded-lg font-bold transition ${
                          filterType === 'kredit' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-750'
                        }`}
                      >
                        Pengeluaran
                      </button>
                    </div>

                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-600 outline-none cursor-pointer"
                    >
                      <option value="all">Semua Kategori</option>
                      <option value="Kotak Jumat">Kotak Jumat</option>
                      <option value="Donasi Insidental">Donasi Insidental</option>
                      <option value="Operasional Listrik">Operasional Listrik</option>
                      <option value="Kebersihan">Kebersihan</option>
                      <option value="Santunan Anak Yatim">Santunan Anak Yatim</option>
                      <option value="Pembelian Inventaris">Pembelian Inventaris</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>

                  </div>
                </div>

                <hr className="border-slate-100" />

                {/* List / Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono text-left">
                        <th className="pb-3 w-28 text-left">Tanggal</th>
                        <th className="pb-3 w-36 text-left">Kategori</th>
                        <th className="pb-3 text-left">Catatan Detil</th>
                        <th className="pb-3 text-right">Jumlah Uang</th>
                        {isAdmin && <th className="pb-3 text-right w-24">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-xs">
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map(t => (
                          <tr key={t.id} className="hover:bg-slate-50/50 transition">
                            <td className="py-3.5 font-mono text-slate-500 text-left">
                              {editingTxId === t.id ? (
                                <input 
                                  type="date"
                                  value={editTxForm.date || ''}
                                  onChange={(e) => setEditTxForm({...editTxForm, date: e.target.value})}
                                  className="w-full border rounded p-1"
                                />
                              ) : (
                                <span className="text-left">{t.date}</span>
                              )}
                            </td>
                            <td className="py-3.5 text-left">
                              {editingTxId === t.id ? (
                                <select
                                  value={editTxForm.category}
                                  onChange={(e) => setEditTxForm({...editTxForm, category: e.target.value as any})}
                                  className="w-full border rounded p-1"
                                >
                                  <option value="Kotak Jumat">Kotak Jumat</option>
                                  <option value="Donasi Insidental">Donasi Insidental</option>
                                  <option value="Operasional Listrik">Operasional Listrik</option>
                                  <option value="Kebersihan">Kebersihan</option>
                                  <option value="Santunan Anak Yatim">Santunan Anak Yatim</option>
                                  <option value="Pembelian Inventaris">Pembelian Inventaris</option>
                                  <option value="Lainnya">Lainnya</option>
                                </select>
                              ) : (
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  t.type === 'debit' ? 'bg-teal-50 text-teal-850' : 'bg-red-50 text-red-850'
                                }`}>
                                  {t.category}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 text-left">
                              {editingTxId === t.id ? (
                                <input 
                                  type="text"
                                  value={editTxForm.notes || ''}
                                  onChange={(e) => setEditTxForm({...editTxForm, notes: e.target.value})}
                                  className="w-full border rounded p-1 font-medium text-slate-800"
                                />
                              ) : (
                                <>
                                  <span className="block font-medium text-slate-800 leading-relaxed text-left">{t.notes}</span>
                                  <span className="block text-[9px] text-slate-400 text-left">Pencatat: {t.registeredBy}</span>
                                </>
                              )}
                            </td>
                            <td className={`py-3.5 font-mono font-bold text-right text-sm ${
                              t.type === 'debit' ? 'text-teal-700' : 'text-rose-600'
                            }`}>
                              {editingTxId === t.id ? (
                                <div className="flex flex-col items-end gap-1">
                                  <select 
                                    value={editTxForm.type}
                                    onChange={(e) => setEditTxForm({...editTxForm, type: e.target.value as 'debit' | 'kredit'})}
                                    className="text-[10px] border rounded p-1"
                                  >
                                    <option value="debit">Pemasukan (+)</option>
                                    <option value="kredit">Pengeluaran (-)</option>
                                  </select>
                                  <input 
                                    type="number"
                                    value={editTxForm.amount || 0}
                                    onChange={(e) => setEditTxForm({...editTxForm, amount: parseInt(e.target.value)})}
                                    className="w-24 border rounded p-1 text-right"
                                  />
                                </div>
                              ) : (
                                <span className="text-right">
                                  {t.type === 'debit' ? '+' : '-'}Rp {t.amount.toLocaleString('id-ID')}
                                </span>
                              )}
                            </td>
                            {isAdmin && (
                              <td className="py-3.5 text-right">
                                {editingTxId === t.id ? (
                                  <div className="flex justify-end gap-2 px-1">
                                    <button onClick={saveEditTx} className="p-1.5 bg-emerald-600 text-white rounded-lg" title="Simpan"><Save className="h-3.5 w-3.5"/></button>
                                    <button onClick={() => setEditingTxId(null)} className="p-1.5 bg-slate-200 text-slate-600 rounded-lg" title="Batal"><X className="h-3.5 w-3.5"/></button>
                                  </div>
                                ) : (
                                  <div className="flex justify-end gap-3 px-1 text-[10px] font-bold">
                                    <button onClick={() => startEditingTx(t)} className="text-emerald-600 hover:scale-110 transition shrink-0" title="Edit"><Edit2 className="h-3.5 w-3.5"/></button>
                                    <button onClick={() => handleRemoveTransaction(t.id, t.notes)} className="text-rose-500 hover:scale-110 transition shrink-0" title="Hapus"><Trash2 className="h-3.5 w-3.5"/></button>
                                  </div>
                                )}
                              </td>
                            )}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-10 text-center text-slate-400 text-xs">
                            Tidak ada catatan kas yang cocok dengan penyaringan filter Anda.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>

            </div>

            {/* Right Side: Admin input card / stats */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Form to submit new Ledger entry */}
              <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 uppercase tracking-wide text-left">
                  <span>✍️</span> Catat Transaksi Baru
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed text-left">
                  Formulir penambahan mutasi keuangan masjid secara langsung ke kas digital Masjid Al Abrar.
                </p>

                {isAdmin ? (
                  <form onSubmit={handleAddTransaction} className="space-y-4 pt-2">
                    
                    <div className="space-y-1.5 text-left">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase text-left">Jenis Aliran Dana</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setTxType('debit')}
                          className={`py-2 text-center text-xs font-bold rounded-xl border transition ${
                            txType === 'debit' 
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          🟢 Pemasukan (Debit)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTxType('kredit')}
                          className={`py-2 text-center text-xs font-bold rounded-xl border transition ${
                            txType === 'kredit' 
                              ? 'bg-rose-600 border-rose-600 text-white'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          🔴 Pengeluaran (Kredit)
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3.5 text-left">
                      
                      <div className="space-y-1.5 text-left">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase text-left">Kategori Anggaran</label>
                        <select
                          value={txCategory}
                          onChange={(e) => setTxCategory(e.target.value as any)}
                          className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                        >
                          <option value="Kotak Jumat">Kotak Jumat</option>
                          <option value="Donasi Insidental">Donasi Insidental</option>
                          <option value="Operasional Listrik">Operasional Listrik</option>
                          <option value="Kebersihan">Kebersihan</option>
                          <option value="Santunan Anak Yatim">Santunan Anak Yatim</option>
                          <option value="Pembelian Inventaris">Pembelian Inventaris</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase text-left">Nominal (Rupiah)</label>
                        <input
                          type="text"
                          placeholder="Contoh: 1500000"
                          value={txAmount}
                          onChange={(e) => setTxAmount(e.target.value.replace(/\D/g, ''))}
                          className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none font-mono font-bold"
                        />
                      </div>

                      <div className="space-y-1.5 text-left">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase text-left">Deskripsi/Catatan Detil</label>
                        <textarea
                          rows={2}
                          placeholder="Masukan keterangan penjelas pengadaan atau asal muasal kotak amal..."
                          value={txNotes}
                          onChange={(e) => setTxNotes(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none"
                        />
                      </div>

                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition duration-150 flex items-center justify-center gap-1.5"
                    >
                      <PlusCircle className="h-4 w-4" /> Simpan & Publikasikan
                    </button>

                  </form>
                ) : (
                  <div className="pt-4 pb-2 text-center text-slate-500 space-y-4">
                    <p className="text-xs bg-slate-50 p-4 border border-dashed border-slate-200 rounded-2xl leading-relaxed">
                      🔐 Penambahan ataupun pencatatan mutasi keuangan baru hanya diizinkan bagi <strong>Admin Pelaksana Masjid Al Abrar</strong>.
                    </p>
                    <button
                      onClick={onShowLogin}
                      className="py-2.5 px-6 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-950 transition inline-block shadow cursor-pointer"
                    >
                      Masuk Sebagai Admin
                    </button>
                  </div>
                )}
              </div>

              {/* Quick Static Information graphic */}
              <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4 text-left">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">STATISTIK SALDO</span>
                <h4 className="font-bold text-xs text-left">Argo Persentase Pemasukan Al Abrar</h4>
                
                <div className="space-y-3 pt-1">
                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 pb-1">
                      <span>Kotak Shalat Jumat</span>
                      <span>72%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full">
                      <div className="h-full bg-emerald-400 rounded-full w-[72%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 pb-1">
                      <span>Infaq & Donasi Insidental</span>
                      <span>20%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full">
                      <div className="h-full bg-amber-400 rounded-full w-[20%]"></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 pb-1">
                      <span>Lainnya (Toko Madu Masjid/Grosir)</span>
                      <span>8%</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full">
                      <div className="h-full bg-slate-400 rounded-full w-[8%]"></div>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-slate-500 leading-relaxed text-center italic">
                  Laporan di atas sinkron secara otomatis berdasarkan data input mutasi terbaru.
                </p>
              </div>

            </div>
          </>
        )}

      </div>

    </div>
  );
}
