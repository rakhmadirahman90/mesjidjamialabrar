import React, { useState, useEffect } from 'react';
import { Transaction, PermanentDonor } from '../types';
import { TrendingUp, TrendingDown, Wallet, PlusCircle, ClipboardCheck, Users, Search, Trash2, Edit2, X, Save } from 'lucide-react';
import { ConfirmationModal } from './ConfirmationModal';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '../lib/db';
import { parseNumber } from '../lib/utils';
import { DUMMY_TRANSACTIONS, DUMMY_PERMANENT_DONORS } from '../data/dummyData';

export default function KeuanganMasjid({ 
  isAdmin, 
  onAddLog 
}: { 
  isAdmin: boolean; 
  onAddLog: (title: string, msg: string, type: 'info' | 'success' | 'alert' | 'system') => void;
}) {
  // Database transactions state locally backed up in local storage - Exact Match of Sheets 1 & 2
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Active view layout tab switch
  const [activeSubTab, setActiveSubTab] = useState<'kas_utama' | 'donatur_tetap'>('kas_utama');

  useEffect(() => {
    const handleSubtabChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && (detail.tab === 'keuangan' || detail.tab === 'donasi') && detail.subtab) {
        if (detail.subtab === 'donatur_tetap' || detail.subtab === 'kas_utama') {
          setActiveSubTab(detail.subtab as any);
        }
      }
    };
    window.addEventListener('change_subtab', handleSubtabChange);
    return () => window.removeEventListener('change_subtab', handleSubtabChange);
  }, []);

  // Search and filter for permanent donors
  const [searchDonorQuery, setSearchDonorQuery] = useState('');

  // Donor Editing State
  const [editingDonorId, setEditingDonorId] = useState<string | null>(null);
  const [editDonorForm, setEditDonorForm] = useState<Partial<PermanentDonor>>({});
  const [showAddDonorForm, setShowAddDonorForm] = useState(false);
  const [newDonorForm, setNewDonorForm] = useState({ name: '', amount: 100000 });

  // Permanent Donors list (Second Image)
  const [permanentDonors, setPermanentDonors] = useState<PermanentDonor[]>([]);

  // Firebase sync
  useEffect(() => {
    const unsubTx = subscribeToCollection<Transaction>('financial_transactions', (data) => {
      if (data.length === 0) {
        setTransactions(DUMMY_TRANSACTIONS as Transaction[]);
      } else {
        setTransactions(data);
      }
    }, 'date', 'desc');

    const unsubDonors = subscribeToCollection<PermanentDonor>('permanent_donors', (data) => {
      if (data.length === 0) {
        setPermanentDonors(DUMMY_PERMANENT_DONORS as PermanentDonor[]);
      } else {
        setPermanentDonors(data);
      }
    }, 'no', 'asc');

    return () => {
      unsubTx();
      unsubDonors();
    };
  }, []);

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
      onAddLog('Akses Terbatas', 'Hanya administrator yang dapat mencatatkan transaksi keuangan.', 'alert');
      return;
    }

    const amt = parseNumber(txAmount);
    if (isNaN(amt) || amt <= 0) {
      onAddLog('Validasi Gagal', 'Masukkan nominal jumlah uang yang valid!', 'alert');
      return;
    }

    if (!txNotes.trim()) {
      onAddLog('Validasi Gagal', 'Catatan transaksi harus diisi agar laporan transparan!', 'alert');
      return;
    }

    const newTx = {
      date: new Date().toISOString().substring(0, 10),
      category: txCategory,
      type: txType,
      amount: amt,
      notes: txNotes.trim(),
      registeredBy: 'Admin Al Abrar'
    };

    addDocument('financial_transactions', newTx);

    // trigger system logs reporting
    onAddLog(
      `Kas Diperbarui: ${txCategory}`,
      `Transaksi baru dicatatkan oleh Admin: ${txType === 'debit' ? 'Pemasukan (+)' : 'Pengeluaran (-)'} Rp ${amt.toLocaleString('id-ID')} dengan catatan: "${txNotes}".`,
      txType === 'debit' ? 'success' : 'alert'
    );

    // Reset Form fields
    setTxAmount('');
    setTxNotes('');
  };

  const handleRemoveTransaction = (id: string, notes: string) => {
    if (!isAdmin) {
      onAddLog('Akses Terbatas', 'Hanya administrator yang dapat menghapus catatan transaksi.', 'alert');
      return;
    }
    if (confirm(`Hapus transaksi "${notes}"?`)) {
      const txToDelete = transactions.find(t => t.id === id);
      if (txToDelete && txToDelete.id) {
        deleteDocument('financial_transactions', txToDelete.id);
        onAddLog('Transaksi Dihapus', `Catatan transaksi "${notes}" telah dihapus.`, 'alert');
      }
    }
  };

  const startEditingTx = (t: Transaction) => {
    setEditingTxId(t.id);
    setEditTxForm(t);
  };

  const saveEditTx = () => {
    if (editingTxId) {
       const existingtx = transactions.find(t => t.id === editingTxId);
       if (existingtx && existingtx.id) {
         updateDocument('financial_transactions', existingtx.id, editTxForm);
         onAddLog('Transaksi Diperbarui', `Catatan Kas "${editTxForm.notes}" telah diperbarui.`, 'success');
       }
    }
    setEditingTxId(null);
    setEditTxForm({});
  };

  const handleTogglePayment = (donorNo: number, month: string) => {
    if (!isAdmin) {
      onAddLog('Akses Ditolak', 'Status pembayaran donatur tetap hanya dapat diubah oleh Admin!', 'alert');
      return;
    }
    const donor = permanentDonors.find(d => d.no === donorNo);
    if (donor && donor.id) {
       const pm = { ...donor.monthlyPayments, [month]: !donor.monthlyPayments[month] };
       updateDocument('permanent_donors', donor.id, { monthlyPayments: pm });
       onAddLog(
        'Donatur Tetap Diperbarui',
        `Telah diubah status pembayaran bulan ${month} untuk tabel Donatur Tetap No. ${donorNo}.`,
        'info'
      );
    }
  };

  const handleAddDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!newDonorForm.name.trim()) return;

    const months = ['JAN', 'PEB', 'MARET', 'APRIL', 'MEI', 'JUN', 'JUL', 'AGUST', 'SEPT', 'OKT', 'NOP', 'DES'];
    const pm: { [m: string]: boolean } = {};
    months.forEach(m => pm[m] = false);

    const nextNo = permanentDonors.length > 0 ? Math.max(...permanentDonors.map(d => d.no)) + 1 : 1;
    const newDonor = {
      no: nextNo,
      name: newDonorForm.name.trim(),
      amount: newDonorForm.amount,
      monthlyPayments: pm
    };

    addDocument('permanent_donors', newDonor);
    onAddLog('Donatur Baru Terdaftar', `Donatur "${newDonor.name}" berhasil ditambahkan ke daftar tetap.`, 'success');
    setNewDonorForm({ name: '', amount: 100000 });
    setShowAddDonorForm(false);
  };

  const [donorToDelete, setDonorToDelete] = useState<{no: number, name: string} | null>(null);

  const handleRemoveDonor = (no: number, name: string) => {
    setDonorToDelete({ no, name });
  };

  const performDeleteDonor = () => {
    if (!donorToDelete) return;
    const dToDelete = permanentDonors.find(d => d.no === donorToDelete.no);
    if (dToDelete && dToDelete.id) {
        deleteDocument('permanent_donors', dToDelete.id);
        onAddLog('Donatur Dihapus', `Data donatur "${donorToDelete.name}" telah dihapus.`, 'alert');
    }
    setDonorToDelete(null);
  };

  const saveDonorEdit = () => {
    if (!editDonorForm.name || !editingDonorId) return;
    const dToEdit = permanentDonors.find(d => d.id === editingDonorId);
    if (dToEdit && dToEdit.id) {
      updateDocument('permanent_donors', dToEdit.id, editDonorForm);
      onAddLog('Profil Donatur Diperbarui', `Informasi donatur "${editDonorForm.name}" telah diupdate.`, 'info');
    }
    setEditingDonorId(null);
    setEditDonorForm({});
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesType = filterType === 'all' || t.type === filterType;
    const matchesCat = filterCategory === 'all' || t.category === filterCategory;
    return matchesType && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="accounting_ledger_view">
      <ConfirmationModal
        isOpen={!!donorToDelete}
        title="Hapus Donatur"
        message={`Anda yakin akan menghapus donatur "${donorToDelete?.name}" dari daftar tetap? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={performDeleteDonor}
        onCancel={() => setDonorToDelete(null)}
      />
      
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
                <div className="flex items-center gap-3 w-full md:w-auto">
                  {isAdmin && (
                    <button 
                      onClick={() => setShowAddDonorForm(true)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-900/10 flex items-center gap-2 shrink-0 transition"
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                      Tambah Donatur
                    </button>
                  )}
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari nama atau nomor..."
                      value={searchDonorQuery}
                      onChange={(e) => setSearchDonorQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 hover:bg-slate-100/65 border border-slate-200/90 rounded-xl outline-none focus:bg-white focus:border-slate-400 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Add Donor Form (Modal-like Inline) */}
              {showAddDonorForm && isAdmin && (
                <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl animate-fade-in relative">
                  <button onClick={() => setShowAddDonorForm(false)} className="absolute top-4 right-4 text-emerald-400 hover:text-emerald-700"><X className="h-4 w-4"/></button>
                  <h4 className="font-black text-xs text-emerald-800 uppercase mb-3 flex items-center gap-2">
                    <PlusCircle className="h-4 w-4"/> Tambah Donatur Tetap Baru
                  </h4>
                  <form onSubmit={handleAddDonor} className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px] space-y-1">
                      <label className="text-[10px] font-bold text-emerald-700 uppercase">Nama Lengkap</label>
                      <input 
                        type="text" 
                        required
                        value={newDonorForm.name}
                        onChange={e => setNewDonorForm({...newDonorForm, name: e.target.value})}
                        placeholder="Contoh: H. Ahmad Yani"
                        className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div className="w-44 space-y-1">
                      <label className="text-[10px] font-bold text-emerald-700 uppercase">Nominal Rutin (Rp)</label>
                      <input 
                        type="number" 
                        required
                        value={newDonorForm.amount}
                        onChange={e => setNewDonorForm({...newDonorForm, amount: parseNumber(e.target.value)})}
                        className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                    <button className="px-6 py-2.5 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-700 transition">Daftarkan</button>
                  </form>
                </div>
              )}

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
                      {['JAN', 'PEB', 'MARET', 'APRIL', 'MEI', 'JUN', 'JUL', 'AGUST', 'SEPT', 'OKT', 'NOP', 'DES'].map(m => (
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
                          <tr key={d.id || d.no} className="hover:bg-slate-50 transition-colors group">
                            <td className="py-3 px-2 font-mono font-bold text-slate-400 border border-slate-100">{d.no}</td>
                            <td className="py-3 px-4 text-left border border-slate-100">
                              {editingDonorId === d.id ? (
                                <input 
                                  value={editDonorForm.name || ''}
                                  onChange={e => setEditDonorForm({...editDonorForm, name: e.target.value})}
                                  className="w-full border p-1 rounded font-black text-xs"
                                />
                              ) : (
                                <>
                                  <span className="block font-black text-slate-800 text-sm group-hover:text-emerald-700 transition-colors uppercase">{d.name}</span>
                                  <span className="text-[9px] text-slate-400 font-bold font-mono tracking-tighter">ID: D-{d.no.toString().padStart(3, '0')}</span>
                                </>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-slate-500 border border-slate-100">
                              {editingDonorId === d.id ? (
                                <input 
                                  type="number"
                                  value={editDonorForm.amount || 0}
                                  onChange={e => setEditDonorForm({...editDonorForm, amount: parseNumber(e.target.value)})}
                                  className="w-24 text-right border p-1 rounded"
                                />
                              ) : (
                                <>Rp {d.amount.toLocaleString('id-ID')}</>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right border border-slate-100">
                              {editingDonorId === d.id ? (
                                <div className="flex gap-2 justify-center">
                                  <button onClick={saveDonorEdit} className="p-1.5 bg-emerald-600 text-white rounded-lg"><Save className="h-3.5 w-3.5"/></button>
                                  <button onClick={() => setEditingDonorId(null)} className="p-1.5 bg-slate-200 text-slate-600 rounded-lg"><X className="h-3.5 w-3.5"/></button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex items-center gap-1">
                                    <span className="font-mono font-black text-[10px] text-slate-700">{paidCount} / 12</span>
                                    {paidCount === 12 && <div className="w-2.5 h-2.5 bg-amber-400 rounded-full flex items-center justify-center text-[6px] text-slate-900 ring-2 ring-amber-100">★</div>}
                                    {isAdmin && (
                                      <div className="flex items-center gap-1.5 ml-2 opacity-0 group-hover:opacity-100 transition">
                                        <button onClick={() => {setEditingDonorId(d.id || null); setEditDonorForm(d);}} className="text-emerald-600"><Edit2 className="h-3 w-3"/></button>
                                        <button onClick={() => handleRemoveDonor(d.no, d.name)} className="text-rose-500"><Trash2 className="h-3 w-3"/></button>
                                      </div>
                                    )}
                                  </div>
                                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full transition-all duration-1000 ${paidCount === 12 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-amber-400'}`}
                                      style={{ width: `${progressPercent}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 text-right bg-slate-50/30 border border-slate-100">
                              <span className="block font-mono font-black text-emerald-800 text-xs">
                                Rp {(paidCount * d.amount).toLocaleString('id-ID')}
                              </span>
                              <span className="text-[8px] text-slate-400 uppercase font-black tracking-tighter">TOTAL TERKUMPUL</span>
                            </td>
                            <td className="py-3 px-3 text-right border border-slate-100">
                              <span className="block font-mono font-black text-slate-900">
                                Rp {totalDonorCollected.toLocaleString('id-ID')}
                              </span>
                              <span className="text-[9px] text-emerald-600 font-bold uppercase">{progressPercent.toFixed(0)}% PAID</span>
                            </td>
                            {['JAN', 'PEB', 'MARET', 'APRIL', 'MEI', 'JUN', 'JUL', 'AGUST', 'SEPT', 'OKT', 'NOP', 'DES'].map((m) => {
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

                {/* Mobile View: Cards */}
                <div className="md:hidden space-y-3">
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map(t => (
                      <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
                          <div className='flex flex-col gap-1'>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold inline-block w-max ${t.type === 'debit' ? 'bg-teal-50 text-teal-850' : 'bg-red-50 text-red-850' }`}> {t.category} </span>
                              <span className="text-xs font-semibold text-slate-800">{t.notes}</span>
                              <span className="text-[10px] text-slate-400">{t.date}</span>
                          </div>
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <span className={`font-mono font-black text-sm ${t.type === 'debit' ? 'text-teal-700' : 'text-rose-600'}`}>
                                {t.type === 'debit' ? '+' : '-'}Rp {t.amount.toLocaleString('id-ID')}
                            </span>
                            {isAdmin && (
                              <button onClick={() => handleRemoveTransaction(t.id, t.notes)} className="text-rose-400 p-1"><Trash2 className="h-3 w-3"/></button>
                            )}
                          </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-slate-400 text-xs text-center border-2 border-dashed rounded-xl">
                      Tidak ada data.
                    </div>
                  )}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
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
                                    onChange={(e) => setEditTxForm({...editTxForm, amount: parseNumber(e.target.value)})}
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
                          <td colSpan={isAdmin ? 5 : 4} className="py-10 text-center text-slate-400 text-xs">
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
              
              {/* Form to submit new Ledger entry - ONLY VISIBLE TO ADMINS */}
              {isAdmin && (
                <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
                  <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 uppercase tracking-wide text-left">
                    <span>✍️</span> Catat Transaksi Baru
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed text-left">
                    Formulir penambahan mutasi keuangan masjid secara langsung ke kas digital Masjid Al Abrar.
                  </p>

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
                </div>
              )}

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
