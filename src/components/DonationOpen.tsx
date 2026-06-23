import React, { useState, useEffect } from 'react';
import { DonationCampaign, Donor } from '../types';
import { Heart, ShieldCheck, QrCode, CheckCircle, Plus, X, Trash } from 'lucide-react';
import { subscribeToCollection, subscribeToDocument, addDocument, updateDocument, deleteDocument, clearCollection } from '../lib/db';
import { ConfirmationModal } from './ConfirmationModal';

interface DonationOpenProps {
  onDonationSuccess: (title: string, msg: string, amount: number) => void;
  isAdmin?: boolean;
  campaigns: DonationCampaign[];
  onUpdateCampaigns: () => void;
  onAddLog: (title: string, msg: string, type: any) => void;
}

export default function DonationOpen({ 
  onDonationSuccess,
  isAdmin,
  campaigns,
  onAddLog
}: DonationOpenProps) {
  const [selectedCampId, setSelectedCampId] = useState<string>(campaigns[0]?.id || '');
  const [qrisUrl, setQrisUrl] = useState<string | null>(null);

  // Admin states
  const [editingCampaign, setEditingCampaign] = useState<DonationCampaign | null>(null);
  const [campaignForm, setCampaignForm] = useState<Partial<DonationCampaign>>({});
  
  // Form states
  const [donorName, setDonorName] = useState<string>('');
  const [donateAmount, setDonateAmount] = useState<number>(50000);
  const [customAmountText, setCustomAmountText] = useState<string>('');
  const [donorMessage, setDonorMessage] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'transfer'>('qris');
  
  // Realtime simulated database donors logs
  const [donors, setDonors] = useState<Donor[]>([]);

  useEffect(() => {
    const unsub = subscribeToCollection<Donor>('donor_logs', (data) => {
      setDonors(data);
    }, 'timestamp', 'desc');
    
    // Subscribe to Qris URL
    const unsubQris = subscribeToDocument('settings', 'qris', (data: any) => {
      console.log("Firebase QRIS Update:", data);
      if (data && data.url) {
        setQrisUrl(data.url);
      }
    });

    return () => {
      unsub();
      unsubQris();
    };
  }, []);

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
      return;
    }

    // Process Donation
    const newDonor: Donor = {
      id: 'donor_' + Date.now(),
      name: finalName,
      amount: donateAmount,
      timestamp: new Date().toISOString(),
      campaignId: selectedCampId,
      message: donorMessage.trim() || undefined,
      status: 'Diverifikasi'
    };

    // Update Campaign Fund Raised in Firestore
    const campToUpdate = campaigns.find(c => c.id === selectedCampId);
    if (campToUpdate && campToUpdate.id) {
       updateDocument('campaigns', campToUpdate.id, { raised: campToUpdate.raised + donateAmount });
    }

    addDocument('donor_logs', newDonor);

    // Callback to trigger system play gongs notification and database update if any
    onDonationSuccess(
      `Infaq Baru Masuk!`,
      `Donasi sebesar Rp ${donateAmount.toLocaleString('id-ID')} diterima dari ${finalName} untuk "${selectedCampaign?.title || 'Program Masjid'}". Syukran Wa Jazaakumullah Khairan.`,
      donateAmount
    );

    // Reset Form
    setDonorName('');
    setDonorMessage('');
    setCustomAmountText('');
    setDonateAmount(50000);
  };

  const handleAddCampaign = () => {
    const newCamp: DonationCampaign = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      target: 1000000,
      raised: 0,
      description: ''
    };
    setEditingCampaign(newCamp);
    setCampaignForm(newCamp);
  };

  const handleEditCampaign = (c: DonationCampaign) => {
    setEditingCampaign(c);
    setCampaignForm(c);
  };

  const saveCampaign = () => {
    if (!campaignForm.title || !campaignForm.target) {
      onAddLog('Gagal', 'Judul dan Target wajib diisi!', 'alert');
      return;
    }
    
    if (editingCampaign && editingCampaign.id) {
       updateDocument('campaigns', editingCampaign.id, campaignForm);
       onAddLog('Program Diperbarui', `Program ${campaignForm.title} berhasil diperbarui.`, 'success');
    } else {
       addDocument('campaigns', campaignForm);
       onAddLog('Program Ditambah', `Program ${campaignForm.title} berhasil ditambahkan.`, 'success');
    }
    setEditingCampaign(null);
  };

  const deleteCampaign = (id: string) => {
    const campToDelete = campaigns.find(c => c.id === id);
    if (confirm('Hapus program donasi ini? Data donasi terkumpul akan hilang.')) {
      if (campToDelete && campToDelete.id) {
        deleteDocument('campaigns', campToDelete.id);
        onAddLog('Program Dihapus', 'Program donasi berhasil dihapus.', 'alert');
      }
    }
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const clearDonors = () => {
    const ids = donors.map(d => d.id).filter(Boolean);
    clearCollection('donor_logs', ids);
    onAddLog('Riwayat Dibersihkan', 'Daftar donatur berhasil dikosongkan.', 'system');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in" id="donation_portal_view">
      <ConfirmationModal 
        isOpen={showClearConfirm}
        title="Bersihkan Riwayat"
        message="Anda yakin akan menghapus seluruh riwayat donatur? Tindakan ini tidak dapat dibatalkan."
        onConfirm={clearDonors}
        onCancel={() => setShowClearConfirm(false)}
      />
      
      {/* Left Area: Campaign List, Progress & Payment */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Campaigns selection view info */}
        <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1 text-left">
              <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Campaign Target Aktif</span>
              <h3 className="text-xl font-bold font-display text-slate-800 tracking-tight flex items-center gap-1.5 pt-1">
                <span>💖</span> Pilih Program Donasi Al Abrar
              </h3>
              <p className="text-slate-500 text-xs">Pilih program yang ingin Anda dukung dengan sedekah terbaik Anda.</p>
            </div>
            {isAdmin && (
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    if (confirm('Anda yakin ingin mereset total donasi menjadi 0 dan menghapus riwayat donatur?')) {
                      // 1. Clear donor_logs
                      const ids = donors.map(d => d.id).filter(Boolean);
                      clearCollection('donor_logs', ids);
                      
                      // 2. Reset campaigns raised to 0
                      campaigns.forEach(c => {
                        if (c.id) {
                          updateDocument('campaigns', c.id, { raised: 0 });
                        }
                      });

                      onAddLog('Data Direset', 'Seluruh data donasi telah dikosongkan.', 'system');
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-rose-700 transition shadow-lg"
                >
                  <Trash className="h-4 w-4" /> Reset Semua
                </button>
                <button 
                  onClick={handleAddCampaign}
                  className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-slate-800 transition shadow-lg"
                >
                  <Plus className="h-4 w-4 text-emerald-400" /> Tambah Program
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.map(c => {
              const percent = Math.min(Math.round((c.raised / c.target) * 100), 100);
              const isActive = c.id === selectedCampId;
              return (
                <div key={c.id} className="relative group">
                  <button
                    onClick={() => setSelectedCampId(c.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition duration-150 relative overflow-hidden flex flex-col justify-between h-52 outline-none ${
                      isActive 
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-sm ring-2 ring-emerald-600/10'
                        : 'border-slate-150 bg-white hover:border-slate-200'
                    }`}
                  >
                    <div className="space-y-1.5 z-10">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        isActive ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {percent === 100 ? 'Target Tercapai' : 'Donasi Aktif'}
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
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditCampaign(c)} className="p-1 px-2 bg-white text-slate-400 hover:text-emerald-600 rounded-lg shadow-sm border border-slate-100 text-[10px] font-bold">EDIT</button>
                      <button onClick={() => deleteCampaign(c.id)} className="p-1 px-2 bg-white text-slate-400 hover:text-rose-600 rounded-lg shadow-sm border border-slate-100 text-[10px] font-bold">HAPUS</button>
                    </div>
                  )}
                </div>
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

          <form onSubmit={handleSimulatePayment} className="space-y-5 text-left">
            
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
                    <div className="text-left">
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
                    <div className="text-left">
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
                <span className="block text-[10px] text-slate-500 italic">Penyaluran: {selectedCampaign?.title || 'Memuat...'}</span>
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
              <h4 className="font-extrabold text-sm tracking-wide">MASJID JAMI AL ABRAR</h4>
              <p className="text-[10px] text-slate-400">Kode Merchant ID: NM-201889-ID99</p>
            </div>

            {/* Visual Simulated QRIS Image */}
            <div className="bg-white p-3 rounded-2xl shadow-inner relative group border-4 border-slate-850">
              <div className="w-48 h-48 bg-white flex items-center justify-center border border-slate-100 rounded-lg overflow-hidden relative">
                {qrisUrl ? (
                  <img src={qrisUrl} alt="QRIS Masjid" className="w-full h-full object-cover" />
                ) : (
                  <QrCode className="h-40 w-40 text-slate-800" />
                )}
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
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider font-mono text-left">🏦 REKENING BANK TRANSFER (BSI)</h4>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-left">
              <span className="block text-[10px] font-bold text-slate-400">BANK SYARIAH INDONESIA (BSI)</span>
              <span className="block text-lg font-black text-emerald-800 font-mono tracking-wider">711 1222 339</span>
              <span className="block text-xs text-slate-600 font-bold">A/N: Kas Masjid Jami Al Abrar Lapadde</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed text-left">
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
            {isAdmin ? (
              <button 
                onClick={() => setShowClearConfirm(true)} 
                className="text-[9px] font-bold text-slate-400 hover:text-rose-600 flex items-center gap-1"
              >
                <Trash className="h-3 w-3" /> Bersihkan
              </button>
            ) : (
              <span className="text-[9px] font-bold text-slate-400 bg-slate-100 py-1 px-2.5 rounded-full">Transparan</span>
            )}
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-left">
            {donors.map(d => (
              <div key={d.id} className="bg-slate-50 p-3 rounded-xl border border-slate-105 flex flex-col gap-1.5 hover:bg-slate-100/60 transition relative group text-left">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <span className="font-bold text-slate-800 block text-left">{d.name}</span>
                    <span className="text-[9px] font-mono text-slate-400 block text-left">{d.timestamp}</span>
                  </div>
                  <span className="font-bold font-mono text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg text-[10px]">
                    +Rp {d.amount.toLocaleString('id-ID')}
                  </span>
                </div>
                {d.message && (
                  <p className="text-[10px] text-slate-500 bg-white p-1.5 rounded-lg border border-slate-100 italic leading-relaxed text-left">
                    "{d.message}"
                  </p>
                )}
                {isAdmin && (
                  <button 
                    onClick={() => {
                      if (confirm('Hapus log donatur ini?')) {
                        if (d.id) {
                          deleteDocument('donor_logs', d.id);
                        }
                      }
                    }}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-rose-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Editing Modals for Campaign */}
      {editingCampaign && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <h4 className="text-lg font-black text-slate-800">Edit Program Donasi</h4>
              <button onClick={() => setEditingCampaign(null)} className="text-slate-400 hover:text-slate-800"><X /></button>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Judul Program</label>
                <input 
                  type="text" 
                  value={campaignForm.title} 
                  onChange={e => setCampaignForm({...campaignForm, title: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                  placeholder="e.g. Perbaikan Kubah"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Target Penyaluran (Rp)</label>
                <input 
                  type="number" 
                  value={campaignForm.target} 
                  onChange={e => setCampaignForm({...campaignForm, target: parseInt(e.target.value) || 0})}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Dana Terkumpul Saat Ini (Rp)</label>
                <input 
                  type="number" 
                  value={campaignForm.raised} 
                  onChange={e => setCampaignForm({...campaignForm, raised: parseInt(e.target.value) || 0})}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-bold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Deskripsi Singkat</label>
                <textarea 
                  value={campaignForm.description} 
                  onChange={e => setCampaignForm({...campaignForm, description: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs h-24"
                  placeholder="Jelaskan tujuan program ini..."
                />
              </div>
            </div>
            <button 
              onClick={saveCampaign}
              className="w-full py-3 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase shadow-xl"
            >
              Simpan Program
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
