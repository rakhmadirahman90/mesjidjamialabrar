import React, { useState } from 'react';
import { Calendar, RefreshCw } from 'lucide-react';

export default function HijriConverterWidget() {
  const [inputDate, setInputDate] = useState('');
  const [hijriResult, setHijriResult] = useState('');

  const calculateHijri = (dateStr: string) => {
    if (!dateStr) return;
    const gDate = new Date(dateStr);
    
    // Simple robust Hijri estimation matching exact June 23, 2026 = 8 Muharram 1448 H
    const refDate = new Date(2026, 5, 23); // June is 5 in JS Date
    const diffTime = gDate.getTime() - refDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    let hijriDay = 8 + diffDays;
    let hijriMonthIdx = 0; // Muharram
    let hijriYear = 1448;

    const hijriMonths = [
      'Muḥarram', 'Ṣafar', 'Rabī‘ul Awwal', 'Rabī‘uts Tsānī', 
      'Jumādil Ūlā', 'Jumādits Tsānī', 'Rajab', 'Sya‘bān', 
      'Ramaḍān', 'Syawwāl', 'Dzulqa‘dah', 'Dzulhijjah'
    ];

    while (hijriDay > 30) {
      const daysInMonth = (hijriMonthIdx % 2 === 0) ? 30 : 29;
      if (hijriDay > daysInMonth) {
        hijriDay -= daysInMonth;
        hijriMonthIdx = (hijriMonthIdx + 1) % 12;
        if (hijriMonthIdx === 0) hijriYear++;
      } else {
        break;
      }
    }

    while (hijriDay <= 0) {
      hijriMonthIdx = (hijriMonthIdx - 1 + 12) % 12;
      if (hijriMonthIdx === 11) hijriYear--;
      const daysInMonth = (hijriMonthIdx % 2 === 0) ? 30 : 29;
      hijriDay += daysInMonth;
    }

    setHijriResult(`${hijriDay} ${hijriMonths[hijriMonthIdx]} ${hijriYear} H`);
  };

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();
    calculateHijri(inputDate);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm overflow-hidden relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-bl-full -z-10 transition-transform duration-500 group-hover:scale-110 opacity-50"></div>
      
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">Konversi Kalender Hijriah</h3>
          <p className="text-[11px] text-slate-500 font-medium">Ubah penanggalan Masehi menjadi penanggalan Islam.</p>
        </div>
      </div>

      <form onSubmit={handleConvert} className="space-y-4">
        <div>
          <label className="text-[11px] font-bold text-slate-700 block mb-1.5 uppercase tracking-wider">Tanggal Masehi</label>
          <input
            type="date"
            required
            value={inputDate}
            onChange={(e) => setInputDate(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
          />
        </div>
        
        <button
          type="submit"
          disabled={!inputDate}
          className="w-full bg-[#008F6A] hover:bg-[#007C5B] disabled:bg-slate-300 disabled:text-slate-500 text-white font-black text-xs px-5 py-3 rounded-xl shadow-md shadow-emerald-600/10 transition flex items-center justify-center gap-2 uppercase tracking-widest"
        >
          <RefreshCw className="w-4 h-4" />
          Konversi Tanggal
        </button>
      </form>

      {hijriResult && (
        <div className="mt-5 bg-amber-50 border border-amber-200/60 rounded-xl p-4 text-center animate-fade-in">
          <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Hasil Konversi Hijriah</p>
          <p className="text-lg font-black text-slate-900 tracking-tight">{hijriResult}</p>
        </div>
      )}
    </div>
  );
}
