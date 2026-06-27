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
import EditorProfilMasjid from './EditorProfilMasjid';

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
  onAddPrayer,
  onDeletePrayer,
  slides,
  kajian,
  jumat,
  ramadan,
  routine,
  campaigns,
  onDonationSuccess,
  triggerAudioPlayback,
  detailedBoard,
  mosqueSettings,
  transactions = [],
  congregants = [],
  assets = []
}: AdminDashboardPortalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'beranda' | 'profil' | 'jadwal' | 'galeri' | 'donasi' | 'keuangan' | 'inventaris' | 'kontak' | 'keamanan'>('overview');
  const [localTime, setLocalTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Stats calculation
  const totalInfaq = (campaigns || []).reduce((acc, curr) => acc + ((curr && curr.raised) || 0), 0);
  const activeCampaignsCount = (campaigns || []).length;
  
  // Calculate Monthly Income
  const currentMonth = localTime.getMonth();
  const currentYear = localTime.getFullYear();
  const monthlyIncome = (transactions || []).reduce((acc, tx) => {
    const txDate = new Date(tx.date);
    if (tx.type === 'debit' && txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear) {
      return acc + (tx.amount || 0);
    }
    return acc;
  }, 0);

  // Jamaah Summary
  const totalJamaah = (congregants || []).length;
  const activeJamaah = (congregants || []).filter(c => c.attendanceStatus === 'Aktif Jamaah').length;

  // Inventory Summary
  const totalAssets = (assets || []).reduce((acc, asset) => acc + (asset.quantity || 0), 0);
  const goodAssets = (assets || []).filter(a => a.condition === 'Baik' || a.condition === 'Sangat Baik').length;
  const damagedAssets = (assets || []).filter(a => a.condition === 'Rusak Ringan' || a.condition === 'Rusak Berat').length;

  const recentLogs = (logs || []).slice(0, 10);

  useEffect(() => {
    const timer = setInterval(() => setLocalTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Dashboard Overview', shortLabel: 'Beranda', icon: <Layers className="h-4.5 w-4.5" />, mobileIcon: <Layers className="h-5 w-5" />, badge: null },
    { id: 'beranda', label: 'Manajemen Beranda', shortLabel: 'Media', icon: <Megaphone className="h-4.5 w-4.5" />, mobileIcon: <Megaphone className="h-5 w-5" />, badge: showAnnouncement ? 'Aktif' : null },
    { id: 'profil', label: 'Profil & Jamaah', shortLabel: 'Profil', icon: <Users className="h-4.5 w-4.5" />, mobileIcon: <Users className="h-5 w-5" />, badge: null },
    { id: 'jadwal', label: 'Jadwal & Syiar', shortLabel: 'Jadwal', icon: <Calendar className="h-4.5 w-4.5" />, mobileIcon: <Calendar className="h-5 w-5" />, badge: '5 Waktu' },
    { id: 'galeri', label: 'Galeri Foto', shortLabel: 'Galeri', icon: <ImageIcon className="h-4.5 w-4.5" />, mobileIcon: <ImageIcon className="h-5 w-5" />, badge: null },
    { id: 'donasi', label: 'Program Donasi', shortLabel: 'Donasi', icon: <Heart className="h-4.5 w-4.5" />, mobileIcon: <Heart className="h-5 w-5" />, badge: `${activeCampaignsCount} Program` },
    { id: 'keuangan', label: 'Laporan Keuangan', shortLabel: 'Keuangan', icon: <TrendingUp className="h-4.5 w-4.5" />, mobileIcon: <TrendingUp className="h-5 w-5" />, badge: null },
    { id: 'inventaris', label: 'Inventaris & Aset', shortLabel: 'Aset', icon: <Package className="h-4.5 w-4.5" />, mobileIcon: <Package className="h-5 w-5" />, badge: null },
    { id: 'kontak', label: 'Kontak & Pesan', shortLabel: 'Kontak', icon: <Phone className="h-4.5 w-4.5" />, mobileIcon: <Phone className="h-5 w-5" />, badge: null },
    { id: 'keamanan', label: 'Sistem & Keamanan', shortLabel: 'Sistem', icon: <ShieldCheck className="h-4.5 w-4.5" />, mobileIcon: <ShieldCheck className="h-5 w-5" />, badge: null },
  ] as const;

  return (
    <div className="min-h-screen bg-[#020b06] text-slate-100 flex flex-col xl:flex-row font-sans relative overflow-x-hidden select-none">
      
      {/* Mobile Header (Sleek Glass capsule design) */}
      <div className="xl:hidden bg-[#03110a]/90 backdrop-blur-xl border-b border-emerald-500/15 px-4 py-3.5 flex items-center justify-between w-full sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-all">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-sm shadow">🕌</div>
          <div>
            <span className="text-[11px] font-black tracking-widest text-emerald-400 uppercase block leading-none">AL ABRAR CONTROL</span>
            <span className="text-[8px] font-bold text-amber-400 tracking-wide block mt-0.5 uppercase">Admin Portal</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{localTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <button
            onClick={onLogout}
            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 rounded-full border border-rose-500/20 transition-all duration-200 active:scale-95"
            title="Keluar dari Panel Admin"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar Menu (Luxurious Glass Control Panel) */}
      <aside className={`
        hidden xl:flex fixed inset-y-0 left-0 z-50 w-72 bg-[#03110a]/95 backdrop-blur-2xl border-r border-emerald-500/10 flex-col justify-between p-5 
        xl:sticky xl:top-0 xl:h-screen xl:max-h-screen xl:z-0 overflow-hidden
      `}>
        <div className="flex-1 min-h-0 overflow-y-auto space-y-6 pr-1 sidebar-scrollbar">
          {/* Main Title Badge with gold touches */}
          <div className="text-left py-2.5 border-b border-emerald-500/10 flex items-center justify-between">
            <div>
              <h1 className="text-sm font-black tracking-widest text-white uppercase">AL ABRAR CONTROL</h1>
              <p className="text-[10px] text-emerald-400/80 font-bold tracking-wider mt-0.5 uppercase">Administrasi Utama</p>
            </div>
            <span className="bg-amber-400/10 border border-amber-400/30 text-amber-300 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full tracking-wide shadow-[0_0_10px_rgba(245,158,11,0.15)] uppercase">LIVE</span>
          </div>

          {/* Active Live Admin Profile Card (Elegant Dark Glass Card) */}
          <div className="bg-gradient-to-b from-[#041910] to-[#020e09] border border-emerald-500/15 rounded-2xl p-4 flex items-center gap-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-950 to-[#020b06] border border-emerald-500/30 flex items-center justify-center text-amber-300 text-lg shadow-[0_4px_12px_rgba(4,47,31,0.5)]">
              🕌
            </div>
            <div className="text-left">
              <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">Sesi Aktif</p>
              <p className="text-xs font-black text-white leading-none mt-1">Administrator Masjid</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[8px] text-emerald-400 font-black tracking-wider uppercase">AUTHORIZED ACCESS</span>
              </div>
            </div>
          </div>

          {/* Nav Categories */}
          <nav className="space-y-1.5">
            <span className="text-[9px] font-black uppercase text-emerald-400/30 tracking-widest pl-2 block mb-2.5">Menu Navigasi</span>
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-300 outline-none group text-xs relative ${
                    isActive
                      ? 'bg-emerald-500/10 border border-emerald-500/35 text-emerald-300 font-extrabold shadow-[inset_0_1px_2px_rgba(255,255,255,0.05),0_4px_20px_rgba(4,47,31,0.25)]'
                      : 'text-slate-300 hover:text-white hover:bg-emerald-500/5 hover:border-emerald-500/10 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 font-bold">
                    {isActive && (
                      <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-amber-400 rounded-r-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                    )}
                    <span className={`transition-all duration-300 ${isActive ? 'text-amber-300 scale-110' : 'text-emerald-500 group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    <span className={isActive ? 'pl-1 text-white font-black' : ''}>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wide ${
                      isActive 
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/30' 
                        : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/15'
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
        <div className="pt-4 border-t border-emerald-500/10 mt-6 space-y-3">
          {/* Real-time Digital Server Time */}
          <div className="flex items-center justify-between text-[9px] font-mono text-emerald-400/40 px-2 font-bold uppercase tracking-wider">
            <span>TIME SYNC: GMT+7</span>
            <span>{localTime.toLocaleTimeString('id-ID')}</span>
          </div>
          
          <button
            onClick={onLogout}
            className="w-full py-3 bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-transparent text-rose-400 hover:text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition active:scale-95 duration-300"
          >
            <LogOut className="h-4 w-4" />
            Sign Out / Kunci Panel
          </button>
        </div>
      </aside>

      {/* Main Panes Content */}
      <main className="flex-1 min-h-screen p-3 xs:p-4 md:p-6 lg:p-8 space-y-5 sm:space-y-6 overflow-y-auto pb-24 xl:pb-8">
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
                    💰
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-black text-emerald-400 uppercase tracking-widest truncate">Pemasukan Bulan Ini</p>
                  <p className="text-sm xs:text-base sm:text-2xl font-black text-white mt-1 sm:mt-1.5 break-all">Rp {monthlyIncome.toLocaleString('id-ID')}</p>
                  <p className="text-[8px] sm:text-[9px] text-slate-450 mt-1 leading-normal font-medium line-clamp-1">Total donasi {localTime.toLocaleDateString('id-ID', { month: 'long' })}.</p>
                </div>

                <div className="bg-[#03150d] border border-emerald-500/10 p-3 sm:p-5 rounded-2xl text-left shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 text-xs hidden sm:block">
                    👥
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-black text-blue-400 uppercase tracking-widest truncate">Jamaah Terdaftar</p>
                  <p className="text-sm xs:text-base sm:text-2xl font-black text-white mt-1 sm:mt-1.5">{totalJamaah} Orang</p>
                  <p className="text-[8px] sm:text-[9px] text-slate-450 mt-1 leading-normal font-medium line-clamp-1">{activeJamaah} jamaah aktif berkegiatan.</p>
                </div>

                <div className="bg-[#03150d] border border-emerald-500/10 p-3 sm:p-5 rounded-2xl text-left shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 text-xs hidden sm:block">
                    📦
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-black text-amber-400 uppercase tracking-widest truncate">Aset Inventaris</p>
                  <p className="text-sm xs:text-base sm:text-2xl font-black text-white mt-1 sm:mt-1.5">{totalAssets} Unit</p>
                  <p className="text-[8px] sm:text-[9px] text-slate-450 mt-1 leading-normal font-medium line-clamp-1">{goodAssets} kondisi baik, {damagedAssets} rusak.</p>
                </div>

                <div className="bg-[#03150d] border border-emerald-500/10 p-3 sm:p-5 rounded-2xl text-left shadow-lg relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-10 text-xs hidden sm:block">
                    📢
                  </div>
                  <p className="text-[9px] sm:text-[10px] font-black text-rose-400 uppercase tracking-widest truncate">Program Donasi</p>
                  <p className="text-sm xs:text-base sm:text-2xl font-black text-white mt-1 sm:mt-1.5">{activeCampaignsCount} Kategori</p>
                  <p className="text-[8px] sm:text-[9px] text-slate-450 mt-1 leading-normal font-medium line-clamp-1">Total donasi terkumpul Rp {totalInfaq.toLocaleString('id-ID')}.</p>
                </div>
              </div>

              {/* Management Shortcuts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div className="md:col-span-3 lg:col-span-4 bg-[#03150d] border border-emerald-500/10 p-4 rounded-2xl">
                  <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-emerald-400 mb-3 px-1">Akses Cepat Pengelolaan Landing Page</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {[
                      { id: 'beranda', label: 'Media Beranda', icon: <Megaphone className="h-4 w-4" />, color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
                      { id: 'profil', label: 'Profil Masjid', icon: <Users className="h-4 w-4" />, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
                      { id: 'jadwal', label: 'Jadwal Shalat', icon: <Calendar className="h-4 w-4" />, color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
                      { id: 'donasi', label: 'Program Donasi', icon: <Heart className="h-4 w-4" />, color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
                      { id: 'keuangan', label: 'Laporan Kas', icon: <TrendingUp className="h-4 w-4" />, color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
                      { id: 'galeri', label: 'Galeri Foto', icon: <ImageIcon className="h-4 w-4" />, color: 'bg-sky-500/10 text-sky-500 border-sky-500/20' },
                      { id: 'inventaris', label: 'Aset Masjid', icon: <Package className="h-4 w-4" />, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
                      { id: 'kontak', label: 'Kontak & Inbox', icon: <Phone className="h-4 w-4" />, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all hover:scale-[1.03] active:scale-95 group ${item.color}`}
                      >
                        <div className="mb-2 group-hover:animate-bounce">{item.icon}</div>
                        <span className="text-[10px] font-black uppercase tracking-tight">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile Quick Setup (Only visible on smaller screens or specifically highlighted) */}
              <div className="xl:hidden bg-[#03150d] border border-emerald-500/10 p-4 sm:p-5 rounded-2xl text-left space-y-3">
                <div className="text-left">
                  <h3 className="font-black text-sm uppercase flex items-center gap-1.5 tracking-tight text-white">
                    <Database className="h-4.5 w-4.5 text-amber-500" />
                    Manajemen Data Cepat
                  </h3>
                  <p className="text-[10px] text-slate-450 mt-1">Gunakan tombol di bawah untuk memuat data awal sistem secara instan.</p>
                </div>
                <button
                  onClick={seedDummyData}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black transition flex items-center justify-center gap-2 active:scale-95 uppercase tracking-wider"
                >
                  ⚡ Muat Data Dummy
                </button>
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
                            {(() => {
                              try {
                                return new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
                              } catch (e) {
                                return log.timestamp;
                              }
                            })()}
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
                    <h4 className="text-[11px] font-black text-amber-400 uppercase tracking-wider">● Manajemen Konten Profil & Sejarah</h4>
                    <p className="text-[10px] text-slate-400 font-medium">Perbarui teks informasi umum, sejarah, visi misi, dan daftar tanya jawab masjid.</p>
                  </div>
                  
                  <div className="p-1.5 bg-slate-950/20 border border-emerald-500/5 rounded-xl">
                    <EditorProfilMasjid 
                      mosqueSettings={mosqueSettings}
                      onAddLog={addLog}
                    />
                  </div>

                  <div className="border-t border-emerald-500/10 pt-4 mt-2">
                    <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-wider mb-2">Pratinjau Sandbox Landing Profil</h4>
                    <InfoMasjid activeSubTab="info_umum" detailedBoard={detailedBoard} mosqueSettings={mosqueSettings} />
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
                  onAddPrayer={onAddPrayer}
                  onDeletePrayer={onDeletePrayer}
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
                      onClick={() => {
                        console.log('Seed button clicked');
                        seedDummyData();
                      }}
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

      {/* Mobile Bottom Navigation Bar (Elegant Floating Glass Capsule) */}
      <div className="xl:hidden fixed bottom-4 left-4 right-4 z-40 bg-[#03110a]/90 backdrop-blur-xl border border-emerald-500/20 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.75)] transition-all">
        <div className="flex items-center justify-around px-2.5 py-2">
          {['overview', 'jadwal', 'keuangan', 'profil'].map(id => {
            const item = menuItems.find(m => m.id === id);
            if (!item) return null;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center justify-center w-14 h-13 gap-1 rounded-xl transition-all duration-300 relative ${
                  isActive ? 'text-amber-300' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <span className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl transition-all duration-300"></span>
                )}
                <div className={`transition-transform duration-300 z-10 ${isActive ? 'scale-110 mb-0.5' : 'scale-100'}`}>
                  {item.mobileIcon || item.icon}
                </div>
                <span className={`text-[9px] font-extrabold tracking-wide z-10 ${isActive ? 'text-white' : 'text-slate-400/80'}`}>
                  {item.shortLabel}
                </span>
                {isActive && (
                  <span className="absolute -bottom-1.5 w-6 h-1 rounded-t-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
                )}
              </button>
            );
          })}
          
          <button
            onClick={() => setIsSidebarOpen(true)}
            className={`flex flex-col items-center justify-center w-14 h-13 gap-1 rounded-xl transition-all duration-300 relative ${
              isSidebarOpen ? 'text-amber-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {isSidebarOpen && (
               <span className="absolute inset-0 bg-emerald-500/10 border border-emerald-500/20 rounded-xl transition-all duration-300"></span>
            )}
            <div className={`transition-transform duration-300 z-10 ${isSidebarOpen ? 'scale-110 mb-0.5' : 'scale-100'}`}>
              <Menu className="h-5 w-5" />
            </div>
            <span className="text-[9px] font-extrabold tracking-wide z-10 text-slate-400/80">Menu</span>
            {isSidebarOpen && (
               <span className="absolute -bottom-1.5 w-6 h-1 rounded-t-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Sheet (More Menu) */}
      <div 
        className={`xl:hidden fixed inset-0 z-50 flex flex-col justify-end transition-all duration-300 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div 
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
        <div 
          className={`relative bg-[#03110a] border-t border-emerald-500/25 rounded-t-[28px] shadow-[0_-8px_40px_rgba(0,0,0,0.8)] transition-transform duration-300 transform ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ maxHeight: '85vh' }}
        >
          {/* Grab Bar */}
          <div className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing animate-bounce-slow" onClick={() => setIsSidebarOpen(false)}>
            <div className="w-12 h-1.5 bg-emerald-500/20 rounded-full" />
          </div>
          
          <div className="px-5 pb-8 pt-2 flex flex-col h-full max-h-[calc(85vh-2rem)] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-xs font-black tracking-widest text-emerald-400 uppercase">KATEGORI ADMINISTRATOR</h3>
                <p className="text-[8px] text-slate-400 mt-0.5">Kelola data dan fungsionalitas masjid</p>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="p-2 bg-emerald-500/15 hover:bg-emerald-500/20 transition-colors text-emerald-400 rounded-full border border-emerald-500/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {menuItems.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsSidebarOpen(false);
                    }}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl group relative border transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-br from-[#062417] to-[#03110a] border-emerald-500/40 text-amber-300 shadow-[0_4px_20px_rgba(16,185,129,0.15)] scale-102' 
                        : 'bg-[#020b06]/60 border-emerald-500/5 text-slate-300 hover:bg-[#041910] hover:text-emerald-400'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-amber-400/10 text-amber-300' : 'bg-emerald-950/40 border border-emerald-500/15 text-emerald-400 group-hover:scale-110'}`}>
                      {item.mobileIcon || item.icon}
                    </div>
                    <span className={`text-[10px] font-black mt-2 text-center leading-tight transition-colors ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                      {item.shortLabel}
                    </span>
                    {item.badge && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)] border border-[#03110a]" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-8 pt-5 border-t border-emerald-500/10">
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  onLogout();
                }}
                className="w-full py-3.5 bg-rose-500/10 hover:bg-rose-600 border border-rose-500/20 hover:border-transparent text-rose-400 hover:text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2.5 shadow-lg transition duration-300 active:scale-95 uppercase tracking-wider"
              >
                <LogOut className="h-4 w-4" />
                Sign Out / Kunci Panel
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
