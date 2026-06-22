import React, { type FormEvent } from 'react';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/src/lib/supabase';
import type { QurbanMember, QurbanTransaction } from '@/src/types';
import { HeartHandshake, Search, Plus, Calculator, CheckCircle2, TrendingUp, PiggyBank, Award } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { LocalDb } from '../lib/localStorageDb';

export default function TabunganQurban() {
  const [search, setSearch] = useState('');
  const [members, setMembers] = useState<QurbanMember[]>(LocalDb.getQurbanMembers());
  const [transactions, setTransactions] = useState<QurbanTransaction[]>(LocalDb.getQurbanTransactions());
  
  const [member, setMember] = useState<QurbanMember | null>(null);
  const [memberTxs, setMemberTxs] = useState<QurbanTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success'|'error', text: string } | null>(null);
  
  // Registration form state
  const [formData, setFormData] = useState({ name: '', phone: '', type: 'Sapi (Kolektif)', target: 3500000 });

  const loadData = () => {
    const mems = LocalDb.getQurbanMembers();
    const txs = LocalDb.getQurbanTransactions();
    setMembers(mems);
    setTransactions(txs);

    // If a member is currently selected, refresh their view
    if (member) {
      const refreshedMember = mems.find(m => m.id === member.id);
      if (refreshedMember) {
        setMember(refreshedMember);
        setMemberTxs(txs.filter(t => t.member_id === refreshedMember.id));
      } else {
        setMember(null);
        setMemberTxs([]);
      }
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('db-update', loadData);
    return () => window.removeEventListener('db-update', loadData);
  }, [member]);

  // Handle Search
  const handleSearch = () => {
    setLoading(true);
    setStatusMsg(null);
    
    const query = search.trim().toLowerCase();
    if (!query) {
      setMember(null);
      setMemberTxs([]);
      setLoading(false);
      return;
    }

    const found = members.find(m => 
      m.phone.includes(query) || m.name.toLowerCase().includes(query)
    );

    if (found) {
      setMember(found);
      setMemberTxs(transactions.filter(t => t.member_id === found.id));
    } else {
      setMember(null);
      setMemberTxs([]);
      setStatusMsg({ type: 'error', text: 'Data tidak ditemukan. Silakan hubungi admin atau daftarkan diri Anda di sebelah kiri!' });
    }
    setLoading(false);
  };

  // Handle Registration
  const handleRegister = (e: FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);

    // Check duplicate phone
    const exists = members.some(m => m.phone === formData.phone);
    if (exists) {
      setStatusMsg({ type: 'error', text: 'Nomor HP ini sudah terdaftar sebagai peserta!' });
      return;
    }

    const item: QurbanMember = {
      id: Date.now(),
      name: formData.name,
      phone: formData.phone,
      type: formData.type,
      target_amount: Number(formData.target)
    };

    const updated = [...members, item];
    LocalDb.saveQurbanMembers(updated);
    
    // Auto select newly registered member
    setMember(item);
    setMemberTxs([]);
    setSearch(item.phone);

    setFormData({ name: '', phone: '', type: 'Sapi (Kolektif)', target: 3500000 });
    setStatusMsg({ type: 'success', text: 'Pendaftaran Berhasil! Silakan temui panitia/admin untuk mencatatkan setoran pertama Anda.' });
  };

  // Computations
  const totalPaid = memberTxs.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const progressPercent = member ? Math.min(100, (totalPaid / member.target_amount) * 100) : 0;

  // General Statistics
  const stats = useMemo(() => {
    const count = members.length;
    const totalCash = transactions.reduce((acc, t) => acc + Number(t.amount), 0);
    
    let sumProgress = 0;
    members.forEach(m => {
      const p = transactions.filter(t => t.member_id === m.id).reduce((acc, t) => acc + Number(t.amount), 0);
      sumProgress += Math.min(100, m.target_amount > 0 ? (p / m.target_amount) * 100 : 0);
    });
    
    const avgProgress = count > 0 ? Math.round(sumProgress / count) : 0;

    return {
      count,
      totalCash,
      avgProgress
    };
  }, [members, transactions]);

  return (
    <div className="max-w-6xl mx-auto p-4 py-12 space-y-12 bg-cream/10">
      {/* Introduction */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <HeartHandshake className="h-10 w-10 text-gold mx-auto" />
        <h2 className="text-3xl font-extrabold text-forest tracking-tight uppercase">Program Tabungan Qurban Jami Al Abrar</h2>
        <p className="text-sm text-gray-500 leading-relaxed">
          Niat mulia berkurban kini lebih mudah dicapai melalui program tabungan terencana terpercaya Masjid Jami Al Abrar Parepare. Daftarkan diri Anda sekarang atau cek progres tabungan Anda.
        </p>
      </div>

      {/* Aggregate stats banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 bg-emerald-950 text-white rounded-3xl p-6 shadow-md border border-emerald-900 select-none">
        <div className="p-4 flex items-center gap-4 border-r border-white/10 last:border-0">
          <div className="p-3 bg-white/5 rounded-2xl text-gold">
            <PiggyBank className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase text-cream/55 font-extrabold tracking-wider">Total Shof Peserta</p>
            <h4 className="text-2xl font-bold font-mono text-white mt-0.5">{stats.count} Jamaah</h4>
          </div>
        </div>

        <div className="p-4 flex items-center gap-4 border-r border-white/10 last:border-0">
          <div className="p-3 bg-white/5 rounded-2xl text-gold">
            <Calculator className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase text-cream/55 font-extrabold tracking-wider">Tabungan Terkumpul</p>
            <h4 className="text-2xl font-bold font-mono text-gold mt-0.5">{formatCurrency(stats.totalCash)}</h4>
          </div>
        </div>

        <div className="p-4 flex items-center gap-4 border-r border-white/10 last:border-0">
          <div className="p-3 bg-white/5 rounded-2xl text-gold">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] uppercase text-cream/55 font-extrabold tracking-wider">Progress Kelayakan</p>
            <h4 className="text-2xl font-bold font-mono text-white mt-0.5">{stats.avgProgress}%</h4>
            <div className="h-1.5 w-full bg-white/10 rounded-full mt-1.5 overflow-hidden">
              <div className="h-full bg-gold" style={{ width: `${stats.avgProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Registration Section */}
        <div className="space-y-4">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <h3 className="text-lg font-bold text-forest flex items-center gap-2">
              📝 Form Pendaftaran Baru
            </h3>
            <form onSubmit={handleRegister} className="space-y-5 text-xs text-gray-700">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Nama Lengkap Sesuai KTP</label>
                <input 
                  type="text" required
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-forest focus:ring-0 transition-all font-medium text-sm"
                  placeholder="Contoh: Muhammad Yusuf"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Nomor HP / WhatsApp Aktif</label>
                <input 
                  type="tel" required
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-forest focus:ring-0 transition-all font-medium text-sm"
                  placeholder="Contoh: 081234567890"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Tipe Pilihan Hewan</label>
                  <select 
                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-forest focus:ring-0 transition-all font-medium text-xs font-semibold"
                  >
                    <option>Sapi (Kolektif)</option>
                    <option>Sapi (Pribadi)</option>
                    <option>Kambing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Target Tabungan (Rp)</label>
                  <input 
                    type="number" required
                    value={formData.target} onChange={e => setFormData({...formData, target: Number(e.target.value)})}
                    className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-forest focus:ring-0 transition-all font-medium font-mono text-sm"
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-forest text-white rounded-xl font-bold hover:bg-forest/90 transition-all shadow-md active:scale-[0.98] text-sm">
                Daftar Sebagai Pekurban
              </button>
            </form>
          </div>
        </div>

        {/* Tracking Section */}
        <div className="space-y-4">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-forest mb-6 flex items-center gap-2">
              🔎 Portal Cek Progres Buku Tabungan
            </h3>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Masukkan Nomor HP atau Nama Lengkap..."
                className="flex-1 px-4 py-3.5 rounded-xl bg-gray-50 border border-transparent focus:bg-white focus:border-gold focus:ring-0 transition-all font-medium text-xs"
              />
              <button 
                onClick={handleSearch}
                className="px-6 py-3.5 bg-gold text-forest rounded-xl font-bold hover:bg-gold/90 transition-all text-xs flex items-center gap-1.5"
              >
                Cek
              </button>
            </div>

            {statusMsg && (
              <div className={`mt-5 p-4 rounded-xl text-xs font-bold ${
                statusMsg.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-650'
              }`}>
                {statusMsg.text}
              </div>
            )}

            {member && (
              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 space-y-6"
              >
                <div className="p-6 bg-gray-55 bg-gray-50/50 rounded-2xl border border-gray-100">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-base font-bold text-forest">{member.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{member.phone} • {member.type}</p>
                    </div>
                    {progressPercent >= 100 && (
                      <div className="bg-green-50 text-green-600 p-2 rounded-full border border-green-200 animate-pulse">
                        <CheckCircle2 className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-gray-500">Murobahah Terkumpul</span>
                      <span className="text-forest">{formatCurrency(totalPaid)}</span>
                    </div>
                    <div className="h-3 w-full bg-gray-150 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        className="h-full bg-forest"
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                      <span>Proses: {progressPercent.toFixed(0)}%</span>
                      <span>Target Kurban: {formatCurrency(member.target_amount)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="font-bold text-gray-700 text-xs flex items-center gap-2 border-b border-gray-100 pb-2">
                    📚 Riwayat Buku Setoran Masuk
                  </h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {memberTxs.map(tx => (
                      <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-50 text-xs">
                        <span className="text-gray-450 font-medium">📅 {tx.transaction_date}</span>
                        <span className="font-bold text-forest">{formatCurrency(tx.amount)}</span>
                      </div>
                    ))}

                    {memberTxs.length === 0 && (
                      <p className="text-[10px] text-gray-400 text-center py-4 font-bold uppercase tracking-wider">Belum ada transaksi setoran masuk</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
