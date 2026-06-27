import { useState, useEffect } from 'react';
import { Calendar, BookOpen, CheckCircle2, Copy, PiggyBank, Sparkles } from 'lucide-react';

interface QurbanPackage {
  id: string;
  name: string;
  type: string;
  price: number;
  description: string;
  icon: string;
}

const QURBAN_PACKAGES: QurbanPackage[] = [
  {
    id: 'kambing_standar',
    name: 'Kambing / Domba Standar',
    type: 'Kambing tipe C (18-21 kg)',
    price: 3000000,
    description: 'Hewan sehat, bebas cacat, sesuai syariat Islam.',
    icon: '🐐'
  },
  {
    id: 'kambing_premium',
    name: 'Kambing / Domba Premium',
    type: 'Kambing tipe A (>25 kg)',
    price: 4500000,
    description: 'Hewan premium berukuran besar, daging melimpah.',
    icon: '🐏'
  },
  {
    id: 'sapi_patungan',
    name: 'Patungan Sapi (1/7 Sapi)',
    type: 'Sapi tipe Standar',
    price: 3500000,
    description: 'Gotong royong bersama 6 jamaah lainnya.',
    icon: '🐂'
  },
  {
    id: 'sapi_premium_patungan',
    name: 'Patungan Sapi Premium (1/7)',
    type: 'Sapi Limosin / Simental',
    price: 5500000,
    description: 'Patungan sapi tipe super dengan bobot besar.',
    icon: '🐄'
  },
  {
    id: 'sapi_utuh',
    name: '1 Sapi Utuh Standar',
    type: 'Sapi Standar (250-300 kg)',
    price: 24500000,
    description: 'Qurban atas nama keluarga besar atau pribadi.',
    icon: '🐂'
  }
];

export default function KalkulatorQurban({
  onAddLog
}: {
  onAddLog: (title: string, msg: string, type: 'info' | 'success' | 'alert' | 'system') => void;
}) {
  // Target date for next Idul Adha (Estimated: 16 May 2027)
  const targetIdulAdha = new Date('2027-05-16');
  
  // State variables
  const [selectedPackageId, setSelectedPackageId] = useState<string>('kambing_standar');
  const [customPrice, setCustomPrice] = useState<string>('');
  const [isCustomPrice, setIsCustomPrice] = useState<boolean>(false);
  const [initialSavings, setInitialSavings] = useState<string>('');
  const [savingPeriodMonths, setSavingPeriodMonths] = useState<number>(10);
  const [copied, setCopied] = useState<boolean>(false);

  // Auto calculate months left between now and May 16, 2027
  const [daysLeft, setDaysLeft] = useState<number>(0);
  const [monthsLeft, setMonthsLeft] = useState<number>(0);

  useEffect(() => {
    const today = new Date();
    const diffTime = targetIdulAdha.getTime() - today.getTime();
    const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    setDaysLeft(diffDays);

    // Month calculation
    let months = (targetIdulAdha.getFullYear() - today.getFullYear()) * 12;
    months -= today.getMonth();
    months += targetIdulAdha.getMonth();
    const finalMonths = Math.max(1, months);
    setMonthsLeft(finalMonths);
    setSavingPeriodMonths(finalMonths);
  }, []);

  // Determine current active target price
  const activePackage = QURBAN_PACKAGES.find(p => p.id === selectedPackageId);
  const rawPrice = isCustomPrice ? (parseInt(customPrice) || 0) : (activePackage?.price || 0);
  const rawInitial = parseInt(initialSavings) || 0;
  
  const remainingTarget = Math.max(0, rawPrice - rawInitial);

  // Calculations
  const monthlySavings = Math.round(remainingTarget / (savingPeriodMonths || 1));
  const weeklySavings = Math.round(remainingTarget / ((savingPeriodMonths * 4.34) || 1));
  const dailySavings = Math.round(remainingTarget / ((savingPeriodMonths * 30) || 1));

  // Handle format Rupiah helper
  const formatIDR = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const handleCopyPlan = () => {
    const packageName = isCustomPrice ? 'Hewan Kustom' : activePackage?.name;
    const details = `📋 *RENCANA TABUNGAN QURBAN MASJID AL ABRAR*
==============================
Target Hewan: ${packageName}
Harga Hewan: ${formatIDR(rawPrice)}
Tabungan Awal: ${formatIDR(rawInitial)}
Kurang Dana: ${formatIDR(remainingTarget)}
Durasi Menabung: ${savingPeriodMonths} Bulan

Estimasi Cicilan Menabung:
• Bulanan: ${formatIDR(monthlySavings)} /bulan
• Mingguan: ${formatIDR(weeklySavings)} /minggu
• Harian: ${formatIDR(dailySavings)} /hari

Mari persiapkan ibadah Qurban terbaik kita demi meraih ketakwaan. Insya Allah berkah!
------------------------------
Dihitung via Kalkulator Tabungan Qurban Masjid Jami Al Abrar`;

    navigator.clipboard.writeText(details);
    setCopied(true);
    onAddLog('Simulasi Disalin', 'Rencana tabungan Qurban berhasil disalin ke clipboard.', 'success');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-slate-800 text-left" id="kalkulator_qurban_module">
      
      {/* Kiri: Pilihan Hewan & Setingan Simpanan */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-6">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-800 border border-primary-150 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Persiapan Idul Adha 1448 H / 2027 M
            </span>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Pilih Target Hewan Qurban</h3>
            <p className="text-xs text-slate-500">Pilih salah satu paket hewan qurban masjid atau masukkan harga kustom.</p>
          </div>

          {/* Grid Pilihan Hewan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {QURBAN_PACKAGES.map((pkg) => {
              const isSelected = selectedPackageId === pkg.id && !isCustomPrice;
              return (
                <div
                  key={pkg.id}
                  onClick={() => {
                    setSelectedPackageId(pkg.id);
                    setIsCustomPrice(false);
                  }}
                  className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden ${
                    isSelected
                      ? 'bg-primary-50/75 border-primary-500 ring-1 ring-primary-500 shadow-md shadow-primary-500/5'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="text-2xl">{pkg.icon}</div>
                    {isSelected && (
                      <span className="bg-primary-600 text-white rounded-full p-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900 leading-tight">{pkg.name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{pkg.type}</p>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">{pkg.description}</p>
                  </div>
                  <div className="border-t border-slate-100/80 pt-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Harga Estimasi</span>
                    <span className="text-xs font-black font-mono text-slate-900">{formatIDR(pkg.price)}</span>
                  </div>
                </div>
              );
            })}

            {/* Custom Option */}
            <div
              onClick={() => setIsCustomPrice(true)}
              className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between space-y-3 ${
                isCustomPrice
                  ? 'bg-primary-50/75 border-primary-500 ring-1 ring-primary-500 shadow-md shadow-primary-500/5'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="text-2xl">💰</div>
                {isCustomPrice && (
                  <span className="bg-primary-600 text-white rounded-full p-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-black text-slate-900 leading-tight">Harga Hewan Kustom</h4>
                <p className="text-[10px] text-slate-400">Masukkan nilai target keuangan Anda secara manual.</p>
              </div>
              <div>
                {isCustomPrice ? (
                  <input
                    type="text"
                    placeholder="e.g. 3500000"
                    value={customPrice}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setCustomPrice(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-primary-300 rounded-xl focus:border-primary-500 outline-none font-mono font-bold"
                  />
                ) : (
                  <div className="border-t border-slate-100 pt-2 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mulai Input</span>
                    <span className="text-xs font-black text-slate-600">INPUT MANUAL</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Pengaturan Angsuran Tabungan */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Set Parameter Tabungan</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Tabungan Saat Ini / DP (Rupiah)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="text"
                    placeholder="e.g. 500000"
                    value={initialSavings}
                    onChange={(e) => setInitialSavings(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 hover:bg-slate-100/60 border border-slate-200 focus:bg-white focus:border-slate-400 rounded-xl text-xs font-mono font-bold outline-none transition"
                  />
                </div>
                <span className="text-[9px] text-slate-400 leading-none">Akan langsung mengurangi sisa dana yang harus ditabung.</span>
              </div>

              <div className="space-y-1 text-left">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Jangka Waktu Menabung</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={12}
                    value={savingPeriodMonths}
                    onChange={(e) => setSavingPeriodMonths(parseInt(e.target.value))}
                    className="flex-1 accent-primary-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                  />
                  <span className="w-16 text-center text-xs font-black bg-primary-50 text-primary-800 border border-primary-150 py-1.5 rounded-xl font-mono shrink-0">
                    {savingPeriodMonths} Bln
                  </span>
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 pt-0.5">
                  <span>1 Bulan</span>
                  <span>Estimasi Idul Adha: ~{monthsLeft} bulan</span>
                  <span>12 Bulan</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Edukasi Keutamaan Qurban */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-3xl p-5 text-left flex items-start gap-3.5">
          <div className="p-2.5 bg-primary-50 text-primary-700 rounded-2xl shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-black text-slate-800 uppercase tracking-wide">Fadhilah / Keutamaan Qurban</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              &quot;Tidak ada suatu amalan yang dikerjakan oleh manusia pada hari raya Idul Adha yang lebih dicintai oleh Allah daripada menyembelih hewan qurban. Sesungguhnya hewan itu akan datang pada hari kiamat dengan tanduk-tanduknya, bulu-bulunya, dan kuku-kukunya...&quot; <span className="font-bold text-slate-600 block mt-1">— HR. Tirmidzi &amp; Ibnu Majah</span>
            </p>
          </div>
        </div>
      </div>

      {/* Kanan: Hasil Kalkulasi / Rencana Tabungan */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Ringkasan Simulasi Tabungan */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between space-y-6">
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary-500/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div className="text-left space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary-500/10 text-primary-400 rounded-xl">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider font-mono">REKOMENDASI TABUNGAN</h4>
                <p className="text-[10px] text-primary-400 font-bold">Rencana Anda Menuju Idul Adha</p>
              </div>
            </div>

            <hr className="border-slate-800" />

            {/* Sisa dana target */}
            <div className="space-y-1 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">Sisa Anggaran Perlu Ditabung</span>
              <div className="text-2xl font-black font-mono text-primary-400">{formatIDR(remainingTarget)}</div>
              <div className="flex justify-between text-[10px] text-slate-400 pt-1">
                <span>Harga: {formatIDR(rawPrice)}</span>
                <span>Tabungan: {formatIDR(rawInitial)}</span>
              </div>
            </div>

            {/* Rekomendasi Cicilan Menabung */}
            <div className="space-y-3 pt-2">
              
              {/* Bulanan */}
              <div className="flex items-center justify-between p-3 bg-slate-950/20 border border-slate-800/40 rounded-xl hover:bg-slate-950/40 transition">
                <div className="text-left">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">ESTIMASI BULANAN</span>
                  <span className="block text-xs text-slate-200">Satu kali setiap bulan</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black font-mono text-white">{formatIDR(monthlySavings)}</span>
                  <span className="text-[8px] text-slate-400 uppercase font-bold block">/ bulan</span>
                </div>
              </div>

              {/* Mingguan */}
              <div className="flex items-center justify-between p-3 bg-slate-950/20 border border-slate-800/40 rounded-xl hover:bg-slate-950/40 transition">
                <div className="text-left">
                  <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-widest font-mono">ESTIMASI MINGGUAN</span>
                  <span className="block text-xs text-slate-200">Menyisihkan sepekan sekali</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-black font-mono text-white">{formatIDR(weeklySavings)}</span>
                  <span className="text-[8px] text-slate-400 uppercase font-bold block">/ minggu</span>
                </div>
              </div>

              {/* Harian */}
              <div className="flex items-center justify-between p-3 bg-primary-950/30 border border-primary-500/20 rounded-xl hover:bg-primary-950/50 transition">
                <div className="text-left">
                  <span className="block text-[8px] font-bold text-primary-400 uppercase tracking-widest font-mono">ESTIMASI HARIAN ✨</span>
                  <span className="block text-xs text-primary-200/90 font-medium">Hanya menyisihkan setiap hari</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-black font-mono text-accent-gold">{formatIDR(dailySavings)}</span>
                  <span className="text-[8px] text-primary-300 uppercase font-bold block">/ hari</span>
                </div>
              </div>

            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium text-left bg-slate-950/50 p-2.5 rounded-xl border border-white/5">
              <Calendar className="w-4 h-4 text-primary-400 shrink-0" />
              <span>Idul Adha berikutnya diperkirakan jatuh pada <strong>16 Mei 2027</strong> (sekitar <strong>{daysLeft} hari</strong> lagi).</span>
            </div>

            <div className="grid grid-cols-1 gap-2 pt-2">
              <button
                type="button"
                onClick={handleCopyPlan}
                className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-1.5"
              >
                <Copy className="h-4 w-4" /> {copied ? 'Berhasil Disalin!' : 'Salin Rencana Tabunan'}
              </button>
            </div>
          </div>

        </div>

        {/* Informasi Pendaftaran di Masjid */}
        <div className="bg-white rounded-3xl p-5 border border-slate-150 text-left space-y-3">
          <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">💡 Cara Mulai Menabung Qurban</h4>
          <ol className="text-xs text-slate-500 space-y-2 list-decimal list-inside pl-1 leading-relaxed">
            <li>Gunakan kalkulator di atas untuk memantapkan niat dan rencana anggaran qurban Anda.</li>
            <li>Silakan kunjungi <strong>Pusat Layanan Donasi &amp; Infaq</strong> Masjid Jami Al Abrar di kantor pengurus secara langsung.</li>
            <li>Anda dapat menyetorkan tabungan secara berkala baik harian, mingguan, maupun bulanan ke Bendahara Masjid (<strong>Bapak Sadik</strong>).</li>
            <li>Setiap setoran tabungan qurban Anda akan dicatat resmi dalam Buku Pembukuan Qurban Masjid demi transparansi penuh.</li>
          </ol>
        </div>

      </div>

    </div>
  );
}
