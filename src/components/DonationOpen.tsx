import React, { useState } from 'react';
import { DonationCampaign, Donor } from '../types';
import { Heart, ShieldCheck, QrCode, CheckCircle } from 'lucide-react';

const CAMPAIGNS: DonationCampaign[] = [
  { id: 'kubah', title: 'Pengecatan & Perbaikan Khotbah Kubah Utama', target: 75000000, raised: 52450000, description: 'Peremajaan warna logam eksterior kubah utama lantai dua Masjid Al Abrar.' },
  { id: 'operasional', title: 'Biaya Operasional Guru Pondok Pengajian TPA', target: 35000000, raised: 18900000, description: 'Saku bulanan guru mengaji sukarela TPA Masjid Al Abrar untuk 150 santri.' },
  { id: 'ambulan', title: 'Layanan Pembelian Sparepart & Bensin Ambulan Siaga', target: 15000000, raised: 12200000, description: 'Pengelolaan operasional mobil jenazah & ambulan tanggap bencana gratis.' }
];

export default function DonationOpen({ 
  onDonationSuccess 
}: { 
  onDonationSuccess: (title: string, msg: string, amount: number) => void 
}) {
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>(CAMPAIGNS);
  const [selectedCampId, setSelectedCampId] = useState<string>('kubah');
  
  // Form states
  const [donorName, setDonorName] = useState<string>('');
  const [donateAmount, setDonateAmount] = useState<number>(50000);
  const [customAmountText, setCustomAmountText] = useState<string>('');
  const [donorMessage, setDonorMessage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'transfer'>('qris');
  
  // Realtime simulated database donors logs
  const [donors, setDonors] = useState<Donor[]>(() => {
    const saved = localStorage.getItem('abrar_donor_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // default list
      }
    }
    return [
      { id: 'd1', name: 'H. Rakhmadi Rahman', amount: 500000, timestamp: 'Hari Ini, 14:20 WITA', campaignId: 'kubah', message: 'Semoga menjadi amalan jariyah keluarga kami.', status: 'Diverifikasi' },
      { id: 'd2', name: 'Hamba Allah', amount: 100000, timestamp: 'Hari Ini, 11:05 WITA', campaignId: 'operasional', message: 'Bismillah berkah guru mengaji', status: 'Diverifikasi' },
      { id: 'd3', name: 'Zulkifli Lapadde', amount: 50000, timestamp: 'Kemarin, 19:40 WITA', campaignId: 'ambulan', message: 'Sukses operasional mobil ambulan Al Abrar', status: 'Diverifikasi' },
      { id: 'd4', name: 'H. Syamsuddin', amount: 250000, timestamp: 'Kemarin, 08:15 WITA', campaignId: 'kubah', message: '', status: 'Diverifikasi' }
    ];
  });

  const selectedCampaign = campaigns.find(c => c.id === selectedCampId) || campaigns[0];

  const handleQuickAmount = (val: number) => {
    setDonateAmount(val);
    setCustomAmountText('');
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomAmountText(val);
    const num = parseInt(val.replace(/\D/g, ''), 10);
    if (!isNaN(num) && num > 0) {
      setDonateAmount(num);
    }
  };

  const handleSimulatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = donorName.trim() || 'Hamba Allah';
    
    if (donateAmount <= 0) {
      alert('Nominal donasi harus lebih dari Rp 0!');
      return;
    }

    // Process Donation
    const newDonor: Donor = {
      id: 'donor_' + Date.now(),
      name: finalName,
      amount: donateAmount,
      timestamp: 'Baru Saja',
      campaignId: selectedCampId,
      message: donorMessage.trim() || undefined,
      status: 'Diverifikasi'
    };

    // Update Campaign Fund Raised
    const updatedCampaigns = campaigns.map(c => {
      if (c.id === selectedCampId) {
        return { ...c, raised: c.raised + donateAmount };
      }
      return c;
    });

    const updatedDonors = [newDonor, ...donors];

    setCampaigns(updatedCampaigns);
    setDonors(updatedDonors);
    localStorage.setItem('abrar_donor_logs', JSON.stringify(updatedDonors));

    // Callback to trigger system play gongs notification and database update if any
    onDonationSuccess(
      `Infaq Baru Masuk!`,
      `Donasi sebesar Rp ${donateAmount.toLocaleString('id-ID')} diterima dari ${finalName} untuk "${selectedCampaign.title}". Syukran Wa Jazaakumullah Khairan.`,
      donateAmount
    );

    // Reset Form
    setDonorName('');
    setDonorMessage('');
    setCustomAmountText('');
    setDonateAmount(50000);
    
    alert(`💐 Berhasil! Terima kasih ${finalName}, donasi Anda sebesar Rp ${donateAmount.toLocaleString('id-ID')} telah disimpan dan diverifikasi masuk kas masjid Al Abrar secara realtime!`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="donation_portal_view">
      
      {/* Left Area: Campaign List, Progress & Payment */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Campaigns selection view info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-5">
          <div className="space-y-1">
            <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Campaign Target Aktif</span>
            <h3 className="text-xl font-bold font-display text-slate-800 tracking-tight flex items-center gap-1.5 pt-1">
              <span>💖</span> Pilih Program Donasi Al Abrar
            </h3>
            <p className="text-slate-500 text-xs">Pilih program yang ingin Anda dukung dengan sedekah terbaik Anda.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.map(c => {
              const percent = Math.min(Math.round((c.raised / c.target) * 100), 100);
              const isActive = c.id === selectedCampId;
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCampId(c.id)}
                  className={`text-left p-4 rounded-2xl border transition duration-150 relative overflow-hidden flex flex-col justify-between h-52 outline-none ${
                    isActive 
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-600/10'
                      : 'border-slate-150 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5 z-10">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {c.id === 'kubah' ? 'Pembangunan' : c.id === 'operasional' ? 'Sosial & Dakwah' : 'Umum siaga'}
                    </span>
                    <h4 className="font-extrabold text-xs text-slate-800 line-clamp-2 leading-relaxed pt-1">{c.title}</h4>
                    <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{c.description}</p>
                  </div>

                  <div className="space-y-2 pt-2 z-10">
                    <div className="flex justify-between items-end text-[10px] font-bold">
                      <span className="text-slate-400">Terkumpul:</span>
                      <span className={isActive ? 'text-emerald-700' : 'text-slate-700'}>{percent}%</span>
                    </div>
                    
                    {/* Visual Progress Bar */}
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isActive ? 'bg-emerald-600' : 'bg-slate-400'}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>

                    <div className="text-[11px] font-mono font-bold text-slate-800">
                      Rp {c.raised.toLocaleString('id-ID')}
                      <span className="text-slate-400 font-normal font-sans text-[9px] block">dari target Rp {c.target.toLocaleString('id-ID')}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Donation transaction simulated form */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-6">
          <div className="flex gap-3.5 items-start">
            <div className="p-3 bg-red-50 text-red-700 rounded-2xl shadow-sm">
              <Heart className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-display text-slate-800 tracking-tight">Formulir Infaq & Sodaqoh Online</h3>
              <p className="text-xs text-slate-500">Semua nominal donasi diproses secara transparan dan diverifikasi langsung ke kas.</p>
            </div>
          </div>

          <form onSubmit={handleSimulatePayment} className="space-y-5">
            
            {/* Donor Name input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-sans">Nama Lengkap Donatur</label>
                <input
                  type="text"
                  placeholder="Isi 'Hamba Allah' jika ingin anonim"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-sans">Pesan / Doa Terbaik (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: Semoga dilancarkan rezekinya..."
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Quick Amount Choices */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-sans">Pilih Nominal Infaq</label>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {[10000, 20000, 50000, 100000, 250000, 500000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAmount(amt)}
                    className={`py-2 px-1 text-center font-bold font-mono text-xs rounded-xl border transition ${
                      donateAmount === amt && !customAmountText
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-500/20'
                        : 'border-slate-150 bg-slate-50 text-slate-600 hover:border-slate-200'
                    }`}
                  >
                    Rp {amt / 1000}K
                  </button>
                ))}
              </div>

              {/* Custom Selector Input */}
              <div className="pt-1.5">
                <div className="relative">
                  <span className="absolute left-3.5 top-3.5 text-xs font-black text-slate-400 font-sans">Rp</span>
                  <input
                    type="text"
                    placeholder="Masukkan nominal lain secara spesifik..."
                    value={customAmountText}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    className="w-full text-xs p-3 pl-9 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-emerald-600 font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Simulated Payment Methods */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider font-sans">Metode Penyaluran Kas</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                <button
                  type="button"
                  onClick={() => setPaymentMethod('qris')}
                  className={`p-4 rounded-2xl text-left border flex items-center justify-between transition-all ${
                    paymentMethod === 'qris'
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-slate-150 hover:border-slate-200'
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    <span className="text-3xl bg-white p-2 rounded-xl shadow-sm border border-slate-100">📱</span>
                    <div>
                      <span className="block text-xs font-black text-slate-800">QRIS Instan Otomatis (Scan & Verifikasi)</span>
                      <span className="block text-[10px] text-slate-400">Verifikasi instan tanpa perlu unggah bukti transfer.</span>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === 'qris'} readOnly className="h-4 w-4 accent-emerald-600 shrink-0 ml-2" />
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('transfer')}
                  className={`p-4 rounded-2xl text-left border flex items-center justify-between transition-all ${
                    paymentMethod === 'transfer'
                      ? 'border-emerald-600 bg-emerald-50/50'
                      : 'border-slate-150 hover:border-slate-200'
                  }`}
                >
                  <div className="flex gap-3 items-center">
                    <span className="text-3xl bg-white p-2 rounded-xl shadow-sm border border-slate-100">🏦</span>
                    <div>
                      <span className="block text-xs font-black text-slate-800">Rekening Kas Masjid Al Basyar/Abrar</span>
                      <span className="block text-[10px] text-slate-400">Transfer bank manual BSI No: 7111222339.</span>
                    </div>
                  </div>
                  <input type="radio" checked={paymentMethod === 'transfer'} readOnly className="h-4 w-4 accent-emerald-600 shrink-0 ml-2" />
                </button>

              </div>
            </div>

            {/* Action Trigger Card */}
            <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-0.5 text-left">
                <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">KONFIRMASI NOMINAL LAZIM</span>
                <span className="block text-lg font-black text-emerald-800 font-mono">
                  Rp {donateAmount.toLocaleString('id-ID')}
                </span>
                <span className="block text-[10px] text-slate-500 italic">Penyaluran: {selectedCampaign.title}</span>
              </div>
              
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-6 py-3 rounded-xl transition shadow flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-4 w-4" /> Proses Infaq Sekarang
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* Right Area: Interactive Live QRIS Panel & Donor log transparency table */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* QRIS Simulated Panel */}
        {paymentMethod === 'qris' ? (
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col items-center text-center space-y-4">
            <span className="absolute top-2 right-2 text-[9px] font-mono tracking-widest text-slate-500">AL-ABRAR DIGITAL</span>
            
            <div className="space-y-1">
              <div className="bg-white px-2 py-0.5 rounded text-[10px] font-extrabold text-red-600 uppercase border border-red-100 tracking-wider inline-block">
                QRIS NASIONAL
              </div>
              <h4 className="font-extrabold text-sm tracking-wide">MASJID JAMI AL ABRAR UNIT 021</h4>
              <p className="text-[10px] text-slate-400">Kode Merchant ID: NM-201889-ID99</p>
            </div>

            {/* Visual Simulated QRIS Image */}
            <div className="bg-white p-3 rounded-2xl shadow-inner relative group border-4 border-slate-850">
              <div className="w-48 h-48 bg-slate-100 flex items-center justify-center border-2 border-dashed border-slate-350 rounded-lg overflow-hidden relative">
                <QrCode className="h-40 w-40 text-slate-800" />
                {/* Simulated center scan light glow effect */}
                <span className="absolute inset-x-0 h-1 bg-emerald-500 opacity-60 top-0 animate-bounce"></span>
              </div>
              <span className="block text-[9px] font-bold text-slate-400 pt-2 font-mono uppercase tracking-wider">Metode Aman Bersertifikasi BI</span>
            </div>

            <div className="w-full bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-left space-y-1">
              <span className="block text-[8px] font-mono text-slate-500 uppercase tracking-widest">Invois Infaq Digital</span>
              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span>Nilai Transfer:</span>
                <span className="text-amber-400">Rp {donateAmount.toLocaleString('id-ID')}</span>
              </div>
              <p className="text-[9px] text-slate-400 leading-relaxed text-center pt-1 italic">
                Scan QR di atas menggunakan GoPay, OVO, ShopeePay, Dana, LinkAja, atau m-Banking Anda.
              </p>
            </div>
            
            <p className="text-[10px] text-slate-500 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Dijamin 100% Bebas Riba & Transparan
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono">🏦 REKENING BANK TRANSFER (BSI)</h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
              <span className="block text-[10px] font-bold text-slate-400">BANK SYARIAH INDONESIA (BSI)</span>
              <span className="block text-lg font-black text-emerald-800 font-mono tracking-wider">711 1222 339</span>
              <span className="block text-xs text-slate-600 font-bold">A/N: Kas Masjid Jami Al Abrar Lapadde</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Jika melakukan transfer bank secara manual, harap koordinasikan ke Bendahara Masjid agar dicatat secara langsung.
            </p>
          </div>
        )}

        {/* Recent Donors logs list */}
        <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span>📋</span> Donatur Terbaru
            </h4>
            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 py-1 px-2.5 rounded-full">Transparan</span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {donors.map(d => (
              <div key={d.id} className="bg-slate-50 p-3 rounded-xl border border-slate-105 flex flex-col gap-1.5 hover:bg-slate-100/60 transition">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block">{d.name}</span>
                    <span className="text-[9px] font-mono text-slate-400 block">{d.timestamp}</span>
                  </div>
                  <span className="font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg text-[10px]">
                    +Rp {d.amount.toLocaleString('id-ID')}
                  </span>
                </div>
                {d.message && (
                  <p className="text-[10px] text-slate-500 bg-white p-1.5 rounded-lg border border-slate-100 italic leading-relaxed">
                    "{d.message}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
