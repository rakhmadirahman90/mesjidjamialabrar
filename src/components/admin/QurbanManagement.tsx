import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, Search, PiggyBank, Receipt, DollarSign, Percent, TrendingUp, CheckCircle, Ban } from 'lucide-react';
import { LocalDb } from '@/src/lib/localStorageDb';
import { formatCurrency } from '@/src/lib/utils';
import { QurbanMember, QurbanTransaction } from '@/src/types';

export default function QurbanManagement() {
  const [members, setMembers] = useState<QurbanMember[]>([]);
  const [transactions, setTransactions] = useState<QurbanTransaction[]>([]);
  const [search, setSearch] = useState('');
  
  // Registration form
  const [newMember, setNewMember] = useState({ name: '', phone: '', type: 'Sapi (Kolektif)', target_amount: 3500000 });
  // Setoran/installment form
  const [newTx, setNewTx] = useState({ member_id: 0, amount: 100000 });
  const [selectedTxMember, setSelectedTxMember] = useState<QurbanMember | null>(null);

  useEffect(() => {
    setMembers(LocalDb.getQurbanMembers());
    setTransactions(LocalDb.getQurbanTransactions());
  }, []);

  const showStatus = (msg: string) => {
    alert(msg);
  };

  // --- Actions ---
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.phone) return;
    
    const item: QurbanMember = {
      id: Date.now(),
      name: newMember.name,
      phone: newMember.phone,
      type: newMember.type,
      target_amount: Number(newMember.target_amount)
    };
    
    const updated = [...members, item];
    setMembers(updated);
    LocalDb.saveQurbanMembers(updated);
    
    setNewMember({ name: '', phone: '', type: 'Sapi (Kolektif)', target_amount: 3500000 });
    showStatus('Peserta Qurban berhasil terdaftar!');
  };

  const handleDeleteMember = (id: number) => {
    if (window.confirm("Hapus peserta ini beserta semua laporan riwayat tabungannya?")) {
      const updatedMembers = members.filter(m => m.id !== id);
      const updatedTxs = transactions.filter(t => t.member_id !== id);
      
      setMembers(updatedMembers);
      setTransactions(updatedTxs);
      
      LocalDb.saveQurbanMembers(updatedMembers);
      LocalDb.saveQurbanTransactions(updatedTxs);
      
      if (selectedTxMember?.id === id) {
        setSelectedTxMember(null);
      }
      showStatus('Peserta qurban berhasil dihapus.');
    }
  };

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTxMember) return;
    
    const item: QurbanTransaction = {
      id: Date.now(),
      member_id: selectedTxMember.id,
      amount: Number(newTx.amount),
      transaction_date: new Date().toISOString().split('T')[0]
    };
    
    const updated = [...transactions, item];
    setTransactions(updated);
    LocalDb.saveQurbanTransactions(updated);
    
    setNewTx({ member_id: 0, amount: 100000 });
    showStatus('Setoran tabungan qurban berhasil dicatat!');
  };

  const handleDeleteTransaction = (txId: number) => {
    if (window.confirm("Batalkan setoran/transaksi ini?")) {
      const updated = transactions.filter(t => t.id !== txId);
      setTransactions(updated);
      LocalDb.saveQurbanTransactions(updated);
      showStatus('Transaksi berhasil dihapus.');
    }
  };

  // --- Computations / Statistics ---
  const stats = useMemo(() => {
    const totalParticipants = members.length;
    const totalDeposited = transactions.reduce((acc, t) => acc + Number(t.amount), 0);
    
    let totalProgressSum = 0;
    members.forEach(m => {
      const mPaid = transactions.filter(t => t.member_id === m.id).reduce((acc, t) => acc + Number(t.amount), 0);
      const mPercent = m.target_amount > 0 ? (mPaid / m.target_amount) * 100 : 0;
      totalProgressSum += Math.min(100, mPercent);
    });
    
    const averageProgress = totalParticipants > 0 ? Math.round(totalProgressSum / totalParticipants) : 0;
    
    return {
      totalParticipants,
      totalDeposited,
      averageProgress
    };
  }, [members, transactions]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) || 
      m.phone.includes(search) ||
      m.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [members, search]);

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top statistics panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-forest text-gold flex items-center justify-center font-bold">
            <PiggyBank className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Total Peserta Qurban</p>
            <h4 className="text-2xl font-bold text-forest mt-0.5">{stats.totalParticipants} Orang</h4>
            <p className="text-xs text-forest/70 font-medium">Berdasarkan data tabungan aktif</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gold text-forest flex items-center justify-center font-bold">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Total Dana Terkumpul</p>
            <h4 className="text-2xl font-bold text-amber-800 mt-0.5">{formatCurrency(stats.totalDeposited)}</h4>
            <p className="text-xs text-amber-700/70 font-medium">Setoran amanah tersimpan</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-105 p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Rata-rata Progress</p>
            <h4 className="text-2xl font-bold text-blue-800 mt-0.5">{stats.averageProgress}%</h4>
            <div className="h-1.5 w-24 bg-gray-200 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-blue-600" style={{ width: `${stats.averageProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Add/Modify forms */}
        <div className="lg:col-span-4 space-y-6">
          {/* Form 1: New Registration */}
          <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
            <h4 className="text-sm font-extrabold uppercase text-forest border-b border-gray-100 pb-2 flex items-center gap-1">
              ➕ Registrasi Peserta Qurban
            </h4>
            <form onSubmit={handleRegister} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nama Lengkap</label>
                <input 
                  type="text" required
                  value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full p-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-forest text-xs"
                  placeholder="Ahmad Basri"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">No HP WhatsApp</label>
                <input 
                  type="tel" required
                  value={newMember.phone} onChange={e => setNewMember({ ...newMember, phone: e.target.value })}
                  className="w-full p-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-forest text-xs"
                  placeholder="0812xxxx"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tipe</label>
                  <select
                    value={newMember.type} onChange={e => setNewMember({ ...newMember, type: e.target.value })}
                    className="w-full p-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-forest text-xs"
                  >
                    <option>Sapi (Kolektif)</option>
                    <option>Sapi (Pribadi)</option>
                    <option>Kambing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Target (Rp)</label>
                  <input 
                    type="number" required
                    value={newMember.target_amount} onChange={e => setNewMember({ ...newMember, target_amount: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-forest text-xs"
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full py-3 bg-forest text-white rounded-xl font-bold hover:bg-forest/90 mt-2 text-xs"
              >
                Simpan & Daftarkan
              </button>
            </form>
          </div>

          {/* Form 2: Input setoran tabungan */}
          <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
            <h4 className="text-sm font-extrabold uppercase text-forest border-b border-gray-100 pb-2">
              💰 Catat Setoran Baru
            </h4>
            {selectedTxMember ? (
              <form onSubmit={handleAddTransaction} className="space-y-3 text-xs">
                <div className="bg-cream/40 p-3 rounded-xl border border-gold/10 flex justify-between items-center">
                  <div>
                    <p className="font-bold text-forest">{selectedTxMember.name}</p>
                    <p className="text-[10px] text-gray-400 uppercase">{selectedTxMember.type}</p>
                  </div>
                  <button 
                    type="button" onClick={() => setSelectedTxMember(null)}
                    className="text-[10px] text-red-500 font-bold hover:underline"
                  >
                    Ganti
                  </button>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nominal Setoran (Rp)</label>
                  <input 
                    type="number" required min="1000"
                    value={newTx.amount} onChange={e => setNewTx({ ...newTx, amount: Number(e.target.value) })}
                    className="w-full p-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-forest text-xs"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full py-3 bg-gold text-forest rounded-xl font-bold hover:bg-gold/90 text-xs shadow-sm"
                >
                  Konfirmasi Setoran Masuk
                </button>
              </form>
            ) : (
              <p className="text-xs text-gray-400 text-center py-4">Silakan pilih/klik nama peserta di daftar sebelah kanan terlebih dahulu untuk mencatatkan setorannya</p>
            )}
          </div>
        </div>

        {/* Right column: list of participants with progress */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h4 className="text-base font-bold text-forest">Daftar Buku Tabungan Qurban</h4>
              <p className="text-xs text-gray-400">Total data: {filteredMembers.length} record</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
              <input 
                type="text"
                placeholder="Cari nama/HP..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs rounded-xl bg-gray-50 border-transparent focus:border-forest w-full sm:w-48"
              />
            </div>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[500px]">
            {filteredMembers.map(m => {
              const mPaid = transactions.filter(t => t.member_id === m.id).reduce((acc, t) => acc + Number(t.amount), 0);
              const mPercent = m.target_amount > 0 ? (mPaid / m.target_amount) * 100 : 0;
              const isComplete = mPercent >= 100;
              
              const mTxs = transactions.filter(t => t.member_id === m.id);

              return (
                <div key={m.id} className="p-4 rounded-2xl hover:bg-gray-50 transition-all border border-gray-100 flex flex-col md:flex-row justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-gray-800 text-sm block">{m.name}</span>
                        <span className="text-[10px] text-gray-450 font-bold uppercase select-none">{m.phone} • {m.type}</span>
                      </div>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full select-none ${
                        isComplete ? 'bg-green-150 text-green-600 bg-green-50' : 'bg-gold/15 text-yellow-700 bg-yellow-50'
                      }`}>
                        {isComplete ? 'Lunas' : 'Menabung'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold text-gray-500">
                        <span>Terkumpul: {formatCurrency(mPaid)}</span>
                        <span>Target: {formatCurrency(m.target_amount)}</span>
                      </div>
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all ${isComplete ? 'bg-green-500' : 'bg-gold'}`} 
                          style={{ width: `${Math.min(100, mPercent)}%` }} 
                        />
                      </div>
                    </div>

                    {/* Member transactions brief */}
                    {mTxs.length > 0 && (
                      <div className="bg-gray-50/70 p-2 rounded-xl text-[10px] space-y-1.5 font-sans border border-gray-100">
                        <p className="font-bold text-gray-405 uppercase tracking-wide">RIWAYAT TRANSAKSI SETORAN:</p>
                        {mTxs.map(t => (
                          <div key={t.id} className="flex justify-between text-gray-600 items-center">
                            <span>📅 {t.transaction_date}</span>
                            <span className="font-bold text-forest">{formatCurrency(t.amount)}</span>
                            <button 
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="text-red-500 font-bold hover:underline scale-90"
                              type="button"
                              title="Hapus setoran ini"
                            >
                              Batal
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="md:border-l border-gray-100 md:pl-4 flex md:flex-col gap-2 justify-center items-stretch shrink-0">
                    <button 
                      onClick={() => setSelectedTxMember(m)}
                      className="flex-1 px-3 py-2 bg-forest text-white hover:bg-forest/90 font-bold rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      💳 Setor
                    </button>
                    <button 
                      onClick={() => handleDeleteMember(m.id)}
                      className="px-3 py-2 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 font-bold rounded-xl text-xs flex items-center justify-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" /> Hapus
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredMembers.length === 0 && (
              <p className="text-gray-400 text-center py-10 font-bold text-xs">Tidak ditemukan data peserta</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
