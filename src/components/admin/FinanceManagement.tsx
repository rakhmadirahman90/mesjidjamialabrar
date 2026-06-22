import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Trash2, ArrowUpRight, ArrowDownLeft, FileSpreadsheet, PlusCircle, AlertCircle, Calendar } from 'lucide-react';
import { LocalDb } from '@/src/lib/localStorageDb';
import { formatCurrency } from '@/src/lib/utils';
import { FinancialReport } from '@/src/types';

export default function FinanceManagement() {
  const [reports, setReports] = useState<FinancialReport[]>([]);
  
  // Quick Transaction addition state
  const [formData, setFormData] = useState({
    type: 'income' as 'income' | 'expense',
    category: "Infaq Jum'at",
    amount: '',
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  });

  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterMonth, setFilterMonth] = useState('all');

  useEffect(() => {
    setReports(LocalDb.getFinancials());
  }, []);

  const showStatus = (msg: string) => {
    alert(msg);
  };

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    const item: FinancialReport = {
      id: Date.now(),
      type: formData.type,
      category: formData.category,
      amount: Number(formData.amount),
      description: formData.description,
      transaction_date: formData.transaction_date
    };

    const updated = [item, ...reports];
    setReports(updated);
    LocalDb.saveFinancials(updated);

    setFormData({
      type: 'income',
      category: "Infaq Jum'at",
      amount: '',
      description: '',
      transaction_date: new Date().toISOString().split('T')[0]
    });
    showStatus('Transaksi keuangan berhasil tercatat!');
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus catatan transaksi keuangan ini?")) {
      const updated = reports.filter(r => r.id !== id);
      setReports(updated);
      LocalDb.saveFinancials(updated);
      showStatus('Transaksi berhasil dihapus.');
    }
  };

  // --- Aggregate Computations ---
  const totals = useMemo(() => {
    let totalIncome = 0;
    let totalExpense = 0;

    reports.forEach(r => {
      if (r.type === 'income') {
        totalIncome += Number(r.amount);
      } else {
        totalExpense += Number(r.amount);
      }
    });

    const currentBalance = totalIncome - totalExpense;

    return {
      totalIncome,
      totalExpense,
      currentBalance
    };
  }, [reports]);

  // Months lists
  const availableMonths = useMemo(() => {
    const list = new Set<string>();
    reports.forEach(r => {
      if (r.transaction_date) {
        list.add(r.transaction_date.substring(0, 7)); // e.g., '2026-06'
      }
    });
    return Array.from(list).sort().reverse();
  }, [reports]);

  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchType = filterType === 'all' || r.type === filterType;
      const matchMonth = filterMonth === 'all' || (r.transaction_date && r.transaction_date.startsWith(filterMonth));
      return matchType && matchMonth;
    });
  }, [reports, filterType, filterMonth]);

  // --- CSV Export implementation ---
  const handleExportCSV = () => {
    try {
      if (filteredReports.length === 0) {
        showStatus("Tidak ada data untuk diekspor!");
        return;
      }

      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "ID,Tanggal,Tipe,Kategori,Nominal,Keterangan\n";

      filteredReports.forEach(r => {
        const row = [
          r.id,
          r.transaction_date,
          r.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
          `"${r.category.replace(/"/g, '""')}"`,
          r.amount,
          `"${r.description.replace(/"/g, '""')}"`
        ];
        csvContent += row.join(",") + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Laporan_Keuangan_Al_Abrar_${new Date().toISOString().substring(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e: any) {
      console.error(e);
      showStatus("Gagal mengekspor berkas");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Visual statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-forest text-gold flex items-center justify-center font-bold font-sans">
            <ArrowUpRight className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Total Pemasukan</p>
            <h4 className="text-2xl font-bold text-forest mt-0.5">{formatCurrency(totals.totalIncome)}</h4>
            <p className="text-[10px] text-gray-400 font-medium font-sans">Seluruh infaq, sedekah, zakat masuk</p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-100 p-6 rounded-3xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-650 text-red-600 bg-red-100 flex items-center justify-center font-bold">
            <ArrowDownLeft className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Total Pengeluaran</p>
            <h4 className="text-2xl font-bold text-red-800 mt-0.5">{formatCurrency(totals.totalExpense)}</h4>
            <p className="text-[10px] text-gray-400 font-medium font-sans">Belanja sarana, renovasi & santunan</p>
          </div>
        </div>

        <div className={`p-6 rounded-3xl flex items-center gap-4 border ${
          totals.currentBalance >= 0 ? "bg-amber-50 border-amber-100" : "bg-rose-50 border-rose-100"
        }`}>
          <div className="w-12 h-12 rounded-2xl bg-gold text-forest flex items-center justify-center font-bold">
            💰
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400">Kas Bersih (Saldo)</p>
            <h4 className={`text-2xl font-bold mt-0.5 ${totals.currentBalance >= 0 ? "text-amber-800" : "text-rose-800"}`}>
              {formatCurrency(totals.currentBalance)}
            </h4>
            <p className="text-[10px] text-gray-400 font-medium font-sans">Transparansi neraca saldo kas</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Input transactions */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4">
          <h4 className="text-sm font-extrabold uppercase text-forest border-b border-gray-100 pb-2 flex items-center gap-1.5 leading-none">
            <PlusCircle className="h-4 w-4" /> Catat Transaksi Keuangan
          </h4>

          <form onSubmit={handleInsert} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase">Tipe Catatan</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'income', category: "Infaq Jum'at" })}
                  className={`p-2.5 rounded-xl text-center font-bold transition-all border ${
                    formData.type === 'income' 
                      ? "bg-forest border-forest text-gold" 
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'expense', category: "Sarana & Prasarana" })}
                  className={`p-2.5 rounded-xl text-center font-bold transition-all border ${
                    formData.type === 'expense' 
                      ? "bg-red-50 border-red-500 text-red-700" 
                      : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  Pengeluaran
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Kategori Transaksi</label>
              {formData.type === 'income' ? (
                <select
                  value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-forest text-xs font-semibold"
                >
                  <option>Infaq Jum'at</option>
                  <option>Infaq Harian / Kotak Amal</option>
                  <option>Zakat Maal</option>
                  <option>Sedekah Jariyah</option>
                  <option>Dana Sosial / Donatur</option>
                  <option>Tabungan Qurban</option>
                </select>
              ) : (
                <select
                  value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-forest text-xs font-semibold"
                >
                  <option>Sarana & Prasarana</option>
                  <option>Pemeliharaan Masjid</option>
                  <option>Konsumsi & Acara</option>
                  <option>Pembinaan Keagamaan</option>
                  <option>Santunan Sosial</option>
                  <option>Lain-lain</option>
                </select>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Nominal (Rp)</label>
                <input 
                  type="number" required min="100"
                  value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-forest text-xs font-bold"
                  placeholder="Contoh: 150000"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tanggal</label>
                <input 
                  type="date" required
                  value={formData.transaction_date} onChange={e => setFormData({ ...formData, transaction_date: e.target.value })}
                  className="w-full p-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-forest text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Keterangan / Deskripsi</label>
              <textarea 
                rows={3} required
                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-forest text-xs leading-relaxed"
                placeholder="Air mineral gelas 10 dus untuk Jumatan"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-forest text-white rounded-xl font-bold hover:bg-forest/90 mt-2 text-xs"
            >
              Simpan Catatan Kas
            </button>
          </form>
        </div>

        {/* Right: filterable transaction list & export */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-gray-100">
            <div>
              <h4 className="text-base font-bold text-forest">Catatan Arus Keuangan Masjid</h4>
              <p className="text-xs text-gray-400">Tersinkronisasi dan dapat diekspor</p>
            </div>

            <div className="flex gap-2 self-start sm:self-auto">
              {/* Type Filter */}
              <select
                value={filterType} onChange={e => setFilterType(e.target.value as any)}
                className="p-2 text-xs rounded-xl bg-gray-50 border-transparent focus:border-forest"
              >
                <option value="all">Semua Tipe</option>
                <option value="income">Pemasukan Only</option>
                <option value="expense">Pengeluaran Only</option>
              </select>

              {/* Month Filter */}
              <select
                value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
                className="p-2 text-xs rounded-xl bg-gray-50 border-transparent focus:border-forest font-mono"
              >
                <option value="all">Semua Bulan</option>
                {availableMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {/* Export Button */}
              <button
                onClick={handleExportCSV}
                className="p-2.5 bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 rounded-xl text-xs font-bold flex items-center gap-1.5"
                title="Ekspor CSV"
                type="button"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px]">
            {filteredReports.map(r => {
              const isIncome = r.type === 'income';
              return (
                <div key={r.id} className="p-4 rounded-xl border border-gray-50 flex items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isIncome ? 'bg-emerald-55 bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {isIncome ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownLeft className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">{r.category}</span>
                        <span className="text-[9px] text-gray-400 font-medium font-sans flex items-center gap-0.5"><Calendar className="h-3 w-3" /> {r.transaction_date}</span>
                      </div>
                      <p className="text-xs font-bold text-gray-800 line-clamp-1 mt-0.5">{r.description}</p>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-3 shrink-0">
                    <span className={`text-sm font-bold ${isIncome ? 'text-forest' : 'text-red-600'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(r.amount)}
                    </span>
                    <button 
                      onClick={() => handleDelete(r.id)}
                      className="p-2 text-gray-300 hover:text-red-500 rounded-lg transition-colors hover:bg-gray-100"
                      type="button"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredReports.length === 0 && (
              <p className="text-gray-400 text-center py-10 font-bold text-xs">Arus kas kosong</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
