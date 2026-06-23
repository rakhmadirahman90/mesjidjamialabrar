import { useState, useEffect } from 'react';
import { 
  LogOut, 
  Megaphone, 
  Layers, 
  Calendar, 
  Image as ImageIcon, 
  Heart, 
  TrendingUp, 
  Package, 
  Phone, 
  ShieldCheck, 
  Users, 
  Bell, 
  Clock, 
  RefreshCw, 
  Database,
  Menu,
  X
} from 'lucide-react';

import InfoMasjid from './InfoMasjid';
import DonationOpen from './DonationOpen';
import KeuanganMasjid from './KeuanganMasjid';
import InventarisMasjid from './InventarisMasjid';
import ManajemenJamaah from './ManajemenJamaah';
import JadwalHub from './JadwalHub';
import AudioUploader from './AudioUploader';
import QrisUploader from './QrisUploader';
import GaleriMasjid from './GaleriMasjid';
import KontakMasjid from './KontakMasjid';
import { AdminDashboardPortalProps } from '../types';
import ManajemenPengurusLengkap from './ManajemenPengurusLengkap';

export default function AdminDashboardPortal({
  onLogout,
  announcement,
  announcementInput,
  setAnnouncementInput,
  showAnnouncement,
  onUpdateAnnouncement,
  onToggleAnnouncement,
  adminPin,
  showPinChange,
  setShowPinChange,
  newPinValue,
  setNewPinValue,
  onPinChange,
  onResetDefaults,
  onResetAllData,
  seedDummyData,
  onClearLogs,
  addLog,
  logs,
  prayers,
  nextDetails,
  notificationPermission,
  selectedAudio,
  isMuted,
  volume,
  isAudioPlaying,
  testNotificationTimeLeft,
  showConfigInfo,
  editingPrayer,
  editTimeValue,
  onSetShowConfigInfo,
  onTriggerQuickTest,
  onRequestNotificationPermission,
  onSetSelectedAudio,
  onSetIsMuted,
  onSetVolume,
  onToggleSoundPlay,
  onStartEditing,
  onSetEditTimeValue,
  onSavePrayerEdit,
  onCancelEdit,
  onDeleteLog,
  slides,
  kajian,
  jumat,
  ramadan,
  routine,
  campaigns,
  onDonationSuccess,
  triggerAudioPlayback,
  detailedBoard
}: AdminDashboardPortalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'beranda' | 'profil' | 'jadwal' | 'galeri' | 'donasi' | 'keuangan' | 'inventaris' | 'kontak' | 'keamanan'>('overview');
  const [localTime, setLocalTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Stats calculation
  const totalInfaq = campaigns.reduce((acc, curr) => acc + (curr.raised || 0), 0);
  const activeCampaignsCount = campaigns.length;
  const recentLogs = logs.slice(0, 10);

  useEffect(() => {
    const timer = setInterval(() => setLocalTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', icon: <Layers className="h-4.5 w-4.5" />, badge: null },
    { id: 'beranda', label: 'Broadcast & Media', icon: <Megaphone className="h-4.5 w-4.5" />, badge: showAnnouncement ? 'Aktif' : null },
    { id: 'profil', label: 'Profil & Jamaah', icon: <Users className="h-4.5 w-4.5" />, badge: null },
    { id: 'jadwal', label: 'Jadwal & Syiar', icon: <Calendar className="h-4.5 w-4.5" />, badge: '5 Waktu' },
    { id: 'galeri', label: 'Dokumentasi Galeri', icon: <ImageIcon className="h-4.5 w-4.5" />, badge: null },
    { id: 'donasi', label: 'Zakat & Donasi', icon: <Heart className="h-4.5 w-4.5" />, badge: `${activeCampaignsCount} Kategori` },
    { id: 'keuangan', label: 'Kas & Infaq', icon: <TrendingUp className="h-4.5 w-4.5" />, badge: null },
    { id: 'inventaris', label: 'Aset Inventaris', icon: <Package className="h-4.5 w-4.5" />, badge: null },
    { id: 'kontak', label: 'Direct Messages', icon: <Phone className="h-4.5 w-4.5" />, badge: null },
    { id: 'keamanan', label: 'Sistem & Kunci Security', icon: <ShieldCheck className="h-4.5 w-4.5" />, badge: null },
  ] as const;

  return (
    <div className="min-h-screen bg-[#020b06] text-slate-100 flex flex-col xl:flex-row font-sans relative overflow-x-hidden select-none">
      
      {/* Mobile Header Nav Trigger */}
      <div className="xl:hidden bg-[#041d11] border-b border-emerald-950 px-4 py-3 flex items-center justify-between w-full sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="text-[11px] font-black tracking-widest text-emerald-400 uppercase">ADMIN PORTAL</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-xl bg-white/5 border border-white/5 focus:outline-none"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Overlay Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-45 bg-black/75 backdrop-blur-sm xl:hidden transition-opacity duration-350"
        />
      )}

      {/* Left Sidebar Menu */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#04150d] border-r border-emerald-500/10 flex flex-col justify-between p-5 transition-transform duration-300 transform 
        xl:translate-x-0 xl:sticky xl:top-0 xl:h-screen xl:max-h-screen xl:z-0 overflow-hidden
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-6 pr-1.5 sidebar-scrollbar">
          {/* Main Title Badge */}
          <div className="text-left py-2 border-b border-emerald-500/10 flex items-center justify-between">
            <div>
              <h1 className="text-base font-black tracking-tight text-white uppercase">AL ABRAR CONTROL</h1>
              <p className="text-[10px] text-emerald-400/85 font-bold tracking-wider mt-0.5">Sistem Administrasi Utama</p>
            </div>
            <span className="bg-amber-400 text-slate-950 font-black text-[8px] px-2 py-0.5 rounded shadow">LIVE</span>
          </div>

          {/* Active Live Admin Profile Card */}
          <div className="bg-[#020c07] border border-emerald-500/10 rounded-2xl p-3.5 flex items-center gap-3 shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/35 flex items-center justify-center text-amber-300 text-lg shadow">
              🕌
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">MEMBER STATUS</p>
              <p className="text-xs font-black text-white leading-none mt-0.5">Administrator Masjid</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[9px] text-emerald-400 font-bold font-mono">AUTHORIZED SESSION</span>
              </div>
            </div>
          </div>

          {/* Nav Categories */}
          <nav className="space-y-1">
            <span className="text-[9px] font-black uppercase text-emerald-400/40 tracking-widest pl-2 block mb-2">MENU ADMIN</span>
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                   key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all duration-200 outline-none group text-xs ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-black shadow-lg shadow-emerald-950/40'
                      : 'text-slate-300 hover:bg-white/5 active:bg-white/10 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 font-bold">
                    <span className={isActive ? 'text-slate-950' : 'text-emerald-500 group-hover:scale-110 transition'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${
                      isActive ? 'bg-slate-950 text-emerald-450' : 'bg-emerald-950 text-emerald-400 border border-emerald-500/10'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout Button */}
        <div className="pt-4 border-t border-emerald-500/10 mt-6 space-y-2">
          {/* Real-time Digital Server Time */}
          <div className="flex items-center justify-between text-[9px] font-mono text-emerald-400/50 px-2 py-1">
            <span>TIME SYNC: GMT+7</span>
            <span>{localTime.toLocaleTimeString('id-ID')}</span>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full py-3 bg-red-650/80 hover:bg-red-600 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 duration-200"
          >
            <LogOut className="h-4 w-4" />
            Sign Out / Kunci Panel
          </button>
        </div>
      </aside>

      {/* Main Panes Content */}
      <main className="flex-1 min-h-screen p-3 xs:p-4 md:p-6 lg:p-8 space-y-5 sm:space-y-6 overflow-y-auto">
        {/* Upper Breadcrumbs & Quick Settings Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-500/10">
          <div className="text-left">
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest pl-0.5">DASHBOARD ADMINISTRASI</span>
            <div className="flex items-center gap-2 mt-0.5">
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight uppercase">
                {menuItems.find(m => m.id === activeTab)?.label}
              </h2>
            </div>
          </div>
          {/* Quick status actions */}
          <div className="flex items-center gap-2 max-w-fit sm:self-end">
            <span className="text-[10px] font-mono font-bold bg-[#04160d] border border-emerald-500/15 text-amber-300 px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Parepare Auto-Sync: {localTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
            </span>
          </div>
        </div>

        {/* Dashboard Active View router */}
        <div className="animate-fade-in">
          
          {/* TAB 1: OVERVIEW PANEL */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Quick statistics cards widgets in Bento Grid Style */}
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-[#03150d] border border-emerald-500/10 p-3 sm:p-5 rounded-2xl text-left shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 text-xs hidden sm:block">
                    💲
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-widest truncate">Infaq & Donasi Digital</p>
                  <p className="text-sm xs:text-base sm:text-2xl font-black text-white mt-1 sm:mt-1.5 break-all">Rp {totalInfaq.toLocaleString('id-ID')}</p>
                  <p className="text-[8px] sm:text-[9px] text-slate-450 mt-1 leading-normal font-medium line-clamp-1">Akumulasi aktif terdaftar.</p>
                </div>

                <div className="bg-[#03150d] border border-emerald-500/10 p-3 sm:p-5 rounded-2xl text-left shadow-lg relative overflow-hidden group">
                  <p className="text-[9px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-widest truncate">Kategori Donasi</p>
                  <p className="text-sm xs:text-base sm:text-2xl font-black text-white mt-1 sm:mt-1.5">{activeCampaignsCount} Program</p>
                  <p className="text-[8px] sm:text-[9px] text-slate-450 mt-1 leading-normal font-medium line-clamp-1">Bantuan sedekah produktif.</p>
                </div>

                <div className="bg-[#03150d] border border-emerald-500/10 p-3 sm:p-5 rounded-2xl text-left shadow-lg relative overflow-hidden group">
                  <p className="text-[9px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-widest truncate">Jadwal Shalat</p>
                  <p className="text-sm xs:text-base sm:text-2xl font-black text-white mt-1 sm:mt-1.5">5 Waktu</p>
                  <p className="text-[8px] sm:text-[9px] text-slate-450 mt-1 leading-normal font-medium line-clamp-1">Terintegrasi otomatis.</p>
                </div>

                <div className="bg-[#03150d] border border-emerald-500/10 p-3 sm:p-5 rounded-2xl text-left shadow-lg relative overflow-hidden group">
                  <p className="text-[9px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-widest truncate">Aktivitas Hari Ini</p>
                  <p className="text-sm xs:text-base sm:text-2xl font-black text-white mt-1 sm:mt-1.5">{logs.length} Log</p>
                  <p className="text-[8px] sm:text-[9px] text-slate-450 mt-1 leading-normal font-medium line-clamp-1">Log terdaftar hari ini.</p>
                </div>
              </div>

              {/* Lower Section split into Quick Controller & Audio Config */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left panel: Quick Broadcast */}
                <div className="bg-[#03150d] border border-emerald-500/10 p-3.5 xs:p-5 sm:p-6 rounded-2xl lg:col-span-2 space-y-4">
                  <div className="text-left border-b border-emerald-500/10 pb-3">
                    <h3 className="font-black text-sm uppercase flex items-center gap-1.5 tracking-tight text-white">
                      <Megaphone className="h-4.5 w-4.5 text-amber-500 text-left" />
                      Quick Broadcast Pengumuman
                    </h3>
                    <p className="text-[10px] text-slate-450 mt-1">Ganti Running Text Pengumuman pada banner di beranda masjid secara instan.</p>
                  </div>

                  <div className="space-y-3.5 pt-1.5">
                    {announcement && (
                      <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/10 text-[10px] text-emerald-300">
                        <span className="font-bold uppercase tracking-wider text-[8px] text-emerald-400 block mb-0.5">Pengumuman Aktif Sekarang:</span>
                        "{announcement}"
                      </div>
                    )}

                    <textarea 
                      rows={3}
                      className="w-full p-4 bg-[#020b06] border border-emerald-500/20 rounded-xl text-xs text-white placeholder-slate-600 font-sans leading-relaxed focus:border-amber-400 outline-none transition"
                      placeholder="Tulis pengumuman resmi di sini..."
                      value={announcementInput}
                      onChange={(e) => setAnnouncementInput(e.target.value)}
                    />
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                      <div className="flex items-center justify-between sm:justify-start gap-4">
                        <span className="text-[10px] font-black text-white uppercase">Status Display:</span>
                        <button
                          onClick={() => onToggleAnnouncement(!showAnnouncement)}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition ${
                            showAnnouncement 
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {showAnnouncement ? '● AKTIF / TAMPIL' : '○ NONAKTIF / SEMBUNYI'}
                        </button>
                      </div>

                      <button
                        onClick={() => onUpdateAnnouncement(announcementInput)}
                        className="w-full sm:w-auto py-2.5 px-6 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-[11px] rounded-xl transition shadow active:scale-95 uppercase tracking-wider"
                      >
                        Publish Pengumuman
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right panel: Live Logs feed */}
                <div className="bg-[#03150d] border border-emerald-500/10 p-3.5 xs:p-5 sm:p-6 rounded-2xl text-left space-y-4">
                  <div className="border-b border-emerald-500/10 pb-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-black text-sm uppercase flex items-center gap-1.5 tracking-tight text-white">
                        <Bell className="h-4.5 w-4.5 text-emerald-400" />
                        Live Alarm & Notifikasi LOGS
                      </h3>
                      <p className="text-[10px] text-slate-400 mt-1">Audit jejak aktivitas sistem.</p>
                    </div>
                    <button 
                      onClick={onClearLogs}
                      className="text-[9px] font-black text-red-400 bg-red-950/20 border border-red-900/30 px-2 py-1 rounded hover:bg-red-900/40 transition active:scale-95"
                    >
                      CLEAR
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[195px] overflow-y-auto pr-1 no-scrollbar text-xs">
                    {recentLogs.length === 0 ? (
                      <div className="py-8 text-center text-slate-500 font-medium">Tidak ada log aktivitas sistem terbaru.</div>
                    ) : (
                      recentLogs.map((log: any, idx) => (
                        <div key={log.id || idx} className="p-2.5 bg-[#020a05] rounded-xl border border-emerald-500/5 flex items-center justify-between gap-3">
                          <div className="space-y-0.5">
                            <p className="font-extrabold text-[10px] text-white flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                log.type === 'success' ? 'bg-emerald-500' :
                                log.type === 'alert' ? 'bg-rose-500' :
                                log.type === 'system' ? 'bg-indigo-500' : 'bg-amber-450'
                              }`}></span>
                              {log.title}
                            </p>
                            <p className="text-[9px] text-slate-400 leading-normal font-medium">{log.message}</p>
                          </div>
                          <span className="text-[8px] font-mono font-bold text-slate-500 shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BROADCAST & ANNOUNCEMENTS / SLIDER MEDIA */}
          {activeTab === 'beranda' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* QRIS / Audio Configuration Box */}
                <div className="bg-[#03150d] border border-emerald-500/10 p-3.5 xs:p-5 sm:p-6 rounded-2xl text-left space-y-6">
                  {/* QRIS */}
                  <div className="space-y-3">
                    <div className="border-b border-emerald-500/10 pb-2">
                       <h3 className="font-black text-xs uppercase text-slate-300">Konfigurasi Gambar QRIS</h3>
                      <p className="text-[10px] text-slate-500 leading-normal">Ganti gambar kode QR Donasi Masjid Jami Al Abrar.</p>
                    </div>
                    <div className="bg-[#020b06]/60 p-4 border border-emerald-500/10 rounded-2xl">
                      <QrisUploader onAddLog={addLog} />
                    </div>
                  </div>

                  {/* Audio */}
                  <div className="space-y-3">
                    <div className="border-b border-emerald-500/10 pb-2">
                      <h3 className="font-black text-xs uppercase text-slate-300">Suara Adzan Dan Alarm Masjid</h3>
                      <p className="text-[10px] text-slate-500 leading-normal">Pasang file audio kustom untuk alarm pengingat adzan otomatis.</p>
                    </div>
                    <div className="bg-[#020b06]/60 p-4 border border-emerald-500/10 rounded-2xl space-y-3.5">
                      <AudioUploader 
                        onAddLog={addLog} 
                        onUpload={(_dataUrl: string) => {
                          addLog('Audio Uploaded', 'Berkas audio Adzan kustom diupload berhasil.', 'success');
                        }}
                      />
                      <button
                        onClick={() => {
                          triggerAudioPlayback();
                          addLog('Uji Audio Sirene', 'Memulai pengujian suara sirine adzan.', 'system');
                        }}
                        className="w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-400 font-bold rounded-lg text-[10px] uppercase transition tracking-wider active:scale-95"
                      >
                        🔔 Uji Coba Playback Audio
                      </button>
                    </div>
                  </div>
                </div>

                {/* Media Slider banner management */}
                <div className="bg-[#03150d] border border-emerald-500/10 p-3.5 xs:p-5 sm:p-6 rounded-2xl text-left space-y-4">
                  <div className="border-b border-emerald-500/10 pb-3">
                    <h3 className="font-black text-xs uppercase text-slate-300">Papan Banner Media Informasi (Slider Beranda)</h3>
                    <p className="text-[10px] text-slate-500 leading-normal">Seluruh slide banner media dapat dikelola dengan mengaktifkan tab manajemen media di Jadwal Hub subtab "Manajemen Media".</p>
                  </div>
                  
                  {/* Preview Slides */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {slides.length === 0 ? (
                      <div className="col-span-2 py-10 text-center text-slate-500 text-xs font-semibold">Tidak ada banner informasi terpasang.</div>
                    ) : (
                      slides.map((s, i) => (
                        <div key={s.id || i} className="relative rounded-xl overflow-hidden border border-emerald-500/10 aspect-video shadow-md bg-black">
                          <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover opacity-80" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30 p-2.5 flex flex-col justify-between">
                            <span className="text-[8px] font-mono font-black text-amber-300 bg-black/60 px-2 py-0.5 rounded-full border border-amber-500/10 self-start">SLIDE {s.order || i + 1}</span>
                            <div className="text-left">
                              <p className="text-[10px] font-black text-white truncate leading-none">{s.title}</p>
                              <p className="text-[8px] text-slate-300 truncate font-semibold mt-0.5">{s.description}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => setActiveTab('jadwal')}
                    className="w-full py-3 bg-[#020b06]/85 text-emerald-450 rounded-xl text-xs font-bold ring-1 ring-emerald-500/10 active:scale-95 duration-200 mt-2 block"
                  >
                    Buka Editor Jadwal Hub & Media Banner
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROFIL & JAMAAH */}
          {activeTab === 'profil' && (
            <div className="space-y-6 bg-[#03150d] border border-emerald-500/10 p-3 xs:p-5 sm:p-6 rounded-2xl">
              <div className="flex border-b border-emerald-500/10 pb-4 mb-4 items-center justify-between">
                <div className="text-left">
                  <h3 className="font-black text-sm uppercase text-slate-300">Profil Struktur Yayasan & Agenda Jamaah</h3>
                  <p className="text-[10px] text-slate-500">Form pengeditan data sejarah masjid, pengurus, struktur, dan pencatatan registrasi kartu keluarga jamaah.</p>
                </div>
              </div>
              
              <div className="space-y-6 sm:space-y-8">
                {/* Section Jamaah */}
                <div className="p-3 xs:p-4 sm:p-5 bg-[#020d08] border border-emerald-500/10 rounded-2xl space-y-4">
                  <div className="border-b border-emerald-500/10 pb-2 text-left">
                    <h4 className="text-[11px] font-black text-amber-400 uppercase tracking-wider">● Database Keluarga & Data Jamaah (CRUD)</h4>
                    <p className="text-[10px] text-slate-400">Panel penambahan, pengubahan, dan pemrosesan hapus data jamaah masjid Al Abrar secara terintegrasi.</p>
                  </div>
                  
                  <div className="p-1 rounded-xl bg-slate-950/50">
                    <ManajemenJamaah 
                      isAdmin={true}
                      onAddLog={addLog} 
                      onShowLogin={() => {}}
                    />
                  </div>
                </div>

                {/* Section Pengurus Lengkap */}
                <div className="p-3 xs:p-4 sm:p-5 bg-[#020d08] border border-emerald-500/10 rounded-2xl space-y-4">
                  <div className="border-b border-emerald-500/10 pb-2 text-left">
                    <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">● Database Pengurus Lengkap & Foto</h4>
                    <p className="text-[10px] text-slate-400">Manajemen struktur organisasi lengkap dengan dukungan unggah foto profil tiap bidang.</p>
                  </div>
                  
                  <div className="p-1 rounded-xl bg-slate-950/50">
                    <ManajemenPengurusLengkap 
                      detailedBoard={detailedBoard}
                      onAddLog={addLog}
                    />
                  </div>
                </div>

                {/* Section Sejarah, Visi Misi, Pengurus */}
                <div className="p-3 xs:p-4 sm:p-5 bg-[#020d08] border border-emerald-500/10 rounded-2xl text-left space-y-4">
                  <div className="border-b border-emerald-500/10 pb-2">
                    <h4 className="text-[11px] font-black text-amber-400 uppercase tracking-wider">● Edit Tentang & Struktur Yayasan Masjid</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Gunakan modul interaktif di bawah ini untuk melihat pratinjau data teks (Pengurus, Sejarah, Visi Misi).</p>
                  </div>
                  
                  <div className="p-1.5 bg-slate-950/20 border border-emerald-500/5 rounded-xl">
                    <span className="text-[9px] font-bold text-amber-500 uppercase bg-amber-500/10 border border-amber-550/10 px-2 py-0.5 rounded-full inline-block mb-3">Live Sandbox View</span>
                    <InfoMasjid activeSubTab="info_umum" detailedBoard={detailedBoard} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: JADWAL & SHYAR (SCHEDULER JADWALHUB) */}
          {activeTab === 'jadwal' && (
            <div className="bg-[#03150d] border border-emerald-500/10 p-3 sm:p-5 rounded-2xl">
              <div className="text-left border-b border-emerald-500/10 pb-4 mb-5">
                <h3 className="font-black text-sm uppercase text-slate-300">Pusat Jadwal Waktu Shalat, Syiar Kajian, dan Acara</h3>
                <p className="text-[10px] text-slate-500 mt-1">Gunakan simulator subtab dan modul scheduler di bawah ini untuk mengakses fungsionalitas CRUD secara menyeluruh.</p>
              </div>

              <div className="p-2 sm:p-4 bg-slate-950/40 rounded-2xl border border-emerald-500/5">
                <JadwalHub 
                  prayers={prayers}
                  nextDetails={nextDetails}
                  logs={logs}
                  notificationPermission={notificationPermission as any}
                  selectedAudio={selectedAudio as any}
                  isMuted={isMuted}
                  volume={volume}
                  isAudioPlaying={isAudioPlaying}
                  testNotificationTimeLeft={testNotificationTimeLeft}
                  showConfigInfo={showConfigInfo}
                  editingPrayer={editingPrayer}
                  editTimeValue={editTimeValue}
                  onSetShowConfigInfo={onSetShowConfigInfo}
                  onTriggerQuickTest={onTriggerQuickTest}
                  onRequestNotificationPermission={onRequestNotificationPermission}
                  onSetSelectedAudio={onSetSelectedAudio}
                  onSetIsMuted={onSetIsMuted}
                  onSetVolume={onSetVolume}
                  onToggleSoundPlay={onToggleSoundPlay}
                  onResetDefaults={onResetDefaults}
                  onStartEditing={onStartEditing}
                  onSetEditTimeValue={onSetEditTimeValue}
                  onSavePrayerEdit={onSavePrayerEdit}
                  onCancelEdit={onCancelEdit}
                  onClearLogs={onClearLogs}
                  onNavigate={() => {}}
                  onDeleteLog={onDeleteLog}
                  isAdmin={true}
                  slides={slides}
                  onUpdateSlides={async () => {}}
                  onAddLog={addLog}
                  kajian={kajian}
                  onUpdateKajian={() => {}}
                  jumat={jumat}
                  onUpdateJumat={() => {}}
                  ramadan={ramadan}
                  routine={routine}
                />
              </div>
            </div>
          )}

          {/* TAB 5: GALERI MASJID */}
          {activeTab === 'galeri' && (
            <div className="bg-[#03150d] border border-emerald-500/10 p-3.5 xs:p-5 sm:p-6 rounded-2xl">
              <div className="text-left border-b border-emerald-500/10 pb-3 mb-5">
                <h3 className="font-black text-sm uppercase text-slate-300">Manajemen Album Galeri Foto Dokumentasi</h3>
                <p className="text-[10px] text-slate-500">Tambahkan atau hapus foto, serta kelola deskripsi/keterangan visual di galeri utama masjid.</p>
              </div>

              <div className="p-2 rounded-2xl bg-slate-950/55">
                <GaleriMasjid isAdmin={true} />
              </div>
            </div>
          )}

          {/* TAB 6: DONASI & AMAL JARIYAH */}
          {activeTab === 'donasi' && (
            <div className="bg-[#03150d] border border-emerald-500/10 p-3.5 xs:p-5 sm:p-6 rounded-2xl">
              <div className="text-left border-b border-emerald-500/10 pb-3 mb-5">
                <h3 className="font-black text-sm uppercase text-slate-300">Manajemen Program Donasi Digital (Zakat, Sedekah, Infaq)</h3>
                <p className="text-[10px] text-slate-500">Buat program kampanye baru, edit target pencapaian dana, pantau donatur aktif, dan kelola status pencairan donasi.</p>
              </div>

              <div className="p-2 rounded-2xl bg-[#020b05]/65 border border-emerald-500/5">
                <DonationOpen 
                  isAdmin={true}
                  campaigns={campaigns}
                  onUpdateCampaigns={() => {}}
                  onDonationSuccess={onDonationSuccess}
                  onAddLog={addLog}
                />
              </div>
            </div>
          )}

          {/* TAB 7: KAS & KEUANGAN */}
          {activeTab === 'keuangan' && (
            <div className="bg-[#03150d] border border-emerald-500/10 p-3.5 xs:p-5 sm:p-6 rounded-2xl">
              <div className="text-left border-b border-emerald-500/10 pb-3 mb-5">
                <h3 className="font-black text-sm uppercase text-slate-300">Sistem Keuangan, Pembukuan Kas, & Donatur Tetap</h3>
                <p className="text-[10px] text-slate-550">Catat transaksi debit/kredit, verifikasi slip setoran, audit rekap donatur tahunan bulanan lengkap.</p>
              </div>

              <div className="p-2 rounded-2xl bg-slate-950/60">
                <KeuanganMasjid 
                  isAdmin={true} 
                  onAddLog={addLog} 
                  onShowLogin={() => {}} 
                />
              </div>
            </div>
          )}

          {/* TAB 8: INVENTARIS / ASET */}
          {activeTab === 'inventaris' && (
            <div className="bg-[#03150d] border border-emerald-500/10 p-3.5 xs:p-5 sm:p-6 rounded-2xl">
              <div className="text-left border-b border-emerald-500/10 pb-3 mb-5">
                <h3 className="font-black text-sm uppercase text-slate-330">Sensus Logistik, Aset, Dan Inventaris Masjid</h3>
                <p className="text-[10px] text-slate-500">Kontrol stok ketersediaan, update status kondisi barang (baik, rusak), input kode seri inventaris milik masjid.</p>
              </div>

              <div className="p-2 rounded-2xl bg-slate-950/70 border border-emerald-500/5">
                <InventarisMasjid 
                  isAdmin={true} 
                  onAddLog={addLog} 
                  onShowLogin={() => {}} 
                />
              </div>
            </div>
          )}

          {/* TAB 9: INBOX / CONTACT FEEDBACK */}
          {activeTab === 'kontak' && (
            <div className="bg-[#03150d] border border-emerald-500/10 p-3.5 xs:p-5 sm:p-6 rounded-2xl">
              <div className="text-left border-b border-emerald-500/10 pb-3 mb-5">
                <h3 className="font-black text-sm uppercase text-slate-330">Pemberitahuan Guest Messages & Hubungi Kami</h3>
                <p className="text-[10px] text-slate-500">Monitor pesan langsung, saran jamaah, formulir konsultasi syariah, serta edit kontak pengurus masjid.</p>
              </div>

              <div className="p-2 rounded-2xl bg-slate-950/65">
                <KontakMasjid isAdmin={true} />
              </div>
            </div>
          )}

          {/* TAB 10: KEAMANAN & UTILITIES */}
          {activeTab === 'keamanan' && (
            <div className="space-y-6">
              
              {/* Reset Utilities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Advanced Security Forms */}
                <div className="bg-[#03150d] border border-emerald-500/10 p-3.5 xs:p-5 sm:p-6 rounded-2xl text-left space-y-4">
                  <h3 className="font-black text-sm uppercase tracking-tight text-white flex items-center gap-1.5 border-b border-emerald-500/10 pb-3">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    Kunci Otentikasi & PIN
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium">Password/PIN default saat ini disimpan di cloud. Untuk keamanan total, disarankan memperbaruinya secara terjadwal.</p>

                  {adminPin && (
                    <div className="p-3 bg-blue-950/20 rounded-xl border border-blue-500/10 text-[10px] text-blue-300">
                      <span className="font-bold uppercase tracking-wider text-[8px] text-blue-400 block mb-0.5">Status Proteksi PIN:</span>
                      Aktif ({adminPin.length} digit terbukti aman)
                    </div>
                  )}

                  <div className="pt-2">
                    {showPinChange ? (
                      <div className="space-y-3">
                        <input
                          type="password"
                          placeholder="Masukkan PIN baru"
                          value={newPinValue}
                          onChange={(e) => setNewPinValue(e.target.value)}
                          className="w-full p-3 bg-slate-950 text-slate-100 rounded-xl text-xs border border-emerald-500/10 focus:border-blue-400 outline-none font-mono text-center tracking-widest text-base"
                        />
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              onPinChange(newPinValue);
                              setShowPinChange(false);
                              setNewPinValue('');
                            }} 
                            className="flex-1 py-2.5 bg-blue-650 hover:bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase transition shadow shadow-blue-950/40"
                          >
                            Setujui Update
                          </button>
                          <button 
                            onClick={() => setShowPinChange(false)} 
                            className="flex-1 py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-black text-slate-400 uppercase transition"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowPinChange(true)}
                        className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white border border-blue-500/10 rounded-xl text-xs font-black transition active:scale-95 text-center uppercase tracking-wider"
                      >
                        Ubah Kode PIN Password Admin
                      </button>
                    )}
                  </div>
                </div>

                {/* Utilitas Advanced */}
                <div className="bg-[#03150d] border border-emerald-500/10 p-3.5 xs:p-5 sm:p-6 rounded-2xl text-left space-y-4">
                  <h3 className="font-black text-sm uppercase tracking-tight text-white flex items-center gap-1.5 border-b border-emerald-500/10 pb-3">
                    <Database className="w-5 h-5 text-amber-500" />
                    Manajemen Basis Data & Sandbox
                  </h3>
                  <p className="text-[10px] text-slate-400 font-medium font-sans">Tombol pintas pemulihan instan jika terjadi inkonsitensi database.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={onResetDefaults}
                      className="py-3 bg-slate-950 border border-slate-850 hover:bg-slate-900/60 text-slate-350 rounded-xl text-[10px] font-black transition flex items-center justify-center gap-2 active:scale-95 uppercase tracking-wider"
                    >
                      <RefreshCw className="h-3.5 w-3.5 text-emerald-400" />
                      Reset Jadwal Sholat
                    </button>
                    
                    <button
                      onClick={seedDummyData}
                      className="py-3 bg-emerald-600 hover:bg-emerald-500 hover:text-slate-950 text-white rounded-xl text-[10px] font-black transition flex items-center justify-center gap-2 active:scale-95 uppercase tracking-wider"
                    >
                      ⚡ Muat Data Dummy
                    </button>

                    <button
                      onClick={onResetAllData}
                      className="py-3 bg-red-650 hover:bg-red-600 text-white rounded-xl text-[10px] font-black transition flex items-center justify-center gap-2 active:scale-95 uppercase tracking-wider sm:col-span-2"
                    >
                      ⚠️ Reset Total Seluruh Data (Cloud)
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
