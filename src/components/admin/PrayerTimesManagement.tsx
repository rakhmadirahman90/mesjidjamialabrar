import React, { useState, useEffect } from 'react';
import { Save, Loader2, Clock, RotateCcw, AlertCircle } from 'lucide-react';
import { LocalDb } from '@/src/lib/localStorageDb';

export default function PrayerTimesManagement() {
  const [times, setTimes] = useState<{ id: number; name: string; time: string; rakaat?: number }[]>([]);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  useEffect(() => {
    setTimes(LocalDb.getPrayerTimes());
  }, []);

  const handleTimeChange = (id: number, value: string) => {
    setTimes(prev => prev.map(t => t.id === id ? { ...t, time: value } : t));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      LocalDb.savePrayerTimes(times);
      setStatus({ type: 'success', msg: 'Jadwal waktu shalat berhasil diperbarui & disinkronkan!' });
      setTimeout(() => setStatus(null), 3000);
    } catch (e: any) {
      setStatus({ type: 'error', msg: 'Gagal memperbarui jadwal waktu shalat' });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Apakah Anda yakin ingin menyetel ulang jadwal waktu shalat ke standar Parepare?")) {
      const defaultValue = [
        { id: 1, name: 'Subuh', time: '04:46', rakaat: 2 },
        { id: 2, name: 'Terbit', time: '06:05', rakaat: 0 },
        { id: 3, name: 'Dzuhur', time: '12:08', rakaat: 4 },
        { id: 4, name: 'Ashar', time: '15:31', rakaat: 4 },
        { id: 5, name: 'Maghrib', time: '18:07', rakaat: 3 },
        { id: 6, name: 'Isya', time: '19:21', rakaat: 4 },
      ];
      setTimes(defaultValue);
      LocalDb.savePrayerTimes(defaultValue);
      setStatus({ type: 'success', msg: 'Berhasil menyetel ulang' });
      setTimeout(() => setStatus(null), 2000);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 max-w-4xl animate-in fade-in space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-50">
        <div>
          <h3 className="text-xl font-bold text-forest">Edit Waktu Shalat Realtime</h3>
          <p className="text-xs text-gray-500">Sesuaikan waktu adzan lokal Masjid Jami Al Abrar Parepare. Klik simpan untuk sinkronisasi realtime.</p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-500 hover:text-red-500 border border-gray-200 rounded-xl hover:bg-red-50"
          type="button"
          title="Reset Standard"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Setel Ulang
        </button>
      </div>

      {status && (
        <div className={`p-4 rounded-2xl flex items-center gap-2 text-xs font-bold ${
          status.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
        }`}>
          <AlertCircle className="h-4 w-4" />
          {status.msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {times.map((p) => {
            const isSunrise = p.name === 'Terbit' || p.name === 'Syuruq';
            return (
              <div key={p.id} className="bg-gray-50 p-5 rounded-2xl border border-gray-100 flex flex-col items-center">
                <span className="text-xs font-extrabold uppercase tracking-widest text-forest mb-3">
                  {p.name} {isSunrise ? '' : `(${p.rakaat || 4} Rkt)`}
                </span>
                
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={p.time}
                    onChange={(e) => handleTimeChange(p.id, e.target.value)}
                    placeholder="HH:MM"
                    maxLength={5}
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-white border border-gray-200 focus:border-forest text-center font-mono font-bold text-lg"
                  />
                </div>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-2">Jam & Menit (24j)</span>
              </div>
            );
          })}
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full py-4 bg-forest text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all text-sm shadow-md"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Simpan & Sinkronisasi Waktu Shalat
        </button>
      </form>
    </div>
  );
}
