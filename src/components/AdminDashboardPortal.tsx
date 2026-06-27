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
  congregants = [],
  assets = []
}: AdminDashboardPortalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'beranda' | 'profil' | 'jadwal' | 'galeri' | 'donasi' | 'keuangan' | 'inventaris' | 'kontak' | 'keamanan'>('overview');
  const [localTime, setLocalTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Stats calculation
  const totalInfaq = (campaigns || []).reduce((acc, curr) => acc + ((curr && curr.raised) || 0), 0);
  const activeCampaignsCount = (campaigns || []).length;
  
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
    { id: 'beranda', label: 'Beranda (Media)', shortLabel: 'Media', icon: <Megaphone className="h-4.5 w-4.5" />, mobileIcon: <Megaphone className="h-5 w-5" />, badge: showAnnouncement ? 'Aktif' : null },
    { id: 'profil', label: 'Profil Jami Al Abrar', shortLabel: 'Profil', icon: <Users className="h-4.5 w-4.5" />, mobileIcon: <Users className="h-5 w-5" />, badge: null },
    { id: 'jadwal', label: 'Jadwal & Syiar', shortLabel: 'Jadwal', icon: <Calendar className="h-4.5 w-4.5" />, mobileIcon: <Calendar className="h-5 w-5" />, badge: '5 Waktu' },
    { id: 'galeri', label: 'Galeri Dokumentasi', shortLabel: 'Galeri', icon: <ImageIcon className="h-4.5 w-4.5" />, mobileIcon: <ImageIcon className="h-5 w-5" />, badge: null },
    { id: 'keuangan', label: 'Laporan Keuangan', shortLabel: 'Keuangan', icon: <TrendingUp className="h-4.5 w-4.5" />, mobileIcon: <TrendingUp className="h-5 w-5" />, badge: null },
    { id: 'donasi', label: 'Portal Donasi Digital', shortLabel: 'Donasi', icon: <Heart className="h-4.5 w-4.5" />, mobileIcon: <Heart className="h-5 w-5" />, badge: `${activeCampaignsCount} Program` },
    { id: 'inventaris', label: 'Inventaris & Aset', shortLabel: 'Aset', icon: <Package className="h-4.5 w-4.5" />, mobileIcon: <Package className="h-5 w-5" />, badge: null },
    { id: 'kontak', label: 'Kontak Masjid (Inbox)', shortLabel: 'Kontak', icon: <Phone className="h-4.5 w-4.5" />, mobileIcon: <Phone className="h-5 w-5" />, badge: null },
    { id: 'keamanan', label: 'Sistem & Keamanan', shortLabel: 'Sistem', icon: <ShieldCheck className="h-4.5 w-4.5" />, mobileIcon: <ShieldCheck className="h-5 w-5" />, badge: null },
  ] as const;

  return (
    <div className="min-h-screen bg-[#020d09] text-slate-100 flex flex-col lg:flex-row font-sans selection:bg-primary-500/30">
      
      {/* Mobile Top Navigation */}
      <header className="lg:hidden sticky top-0 z-50 bg-primary-950/80 backdrop-blur-xl border-b border-primary-800/50 px-5 py-4 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-800 to-primary-950 border border-primary-700/50 flex items-center justify-center text-xl shadow-inner">
            🕌
          </div>
          <div className="text-left">
            <h1 className="text-xs font-black tracking-[0.2em] text-white uppercase font-display leading-tight">AL ABRAR</h1>
            <p className="text-[9px] font-bold text-emerald-400/80 tracking-widest uppercase">Admin Panel</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-primary-900/50 border border-primary-800/50 px-3 py-1.5 rounded-full flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              {localTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2.5 bg-primary-800/50 hover:bg-primary-700/50 rounded-xl border border-primary-700/50 text-white transition-all active:scale-90"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Modern Glass Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 inset-y-0 left-0 z-[60] lg:z-40 w-72 lg:h-screen
        bg-primary-950/95 lg:bg-primary-950/50 backdrop-blur-3xl border-r border-primary-800/30
        flex flex-col transition-all duration-500 ease-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Sidebar Header */}
        <div className="p-8 hidden lg:block text-left">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-3xl bg-gradient-to-br from-primary-800 to-primary-950 border border-primary-700/50 flex items-center justify-center text-2xl shadow-2xl">
              🕌
            </div>
            <div>
              <h1 className="text-sm font-black tracking-[0.25em] text-white uppercase font-display">AL ABRAR</h1>
              <p className="text-[10px] font-bold text-emerald-500 tracking-[0.15em] uppercase mt-0.5">Control Center</p>
            </div>
          </div>

          <div className="bg-gradient-to-br from-primary-900/80 to-primary-950/80 border border-primary-800/50 rounded-[2rem] p-5 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-primary-800 border border-primary-700 flex items-center justify-center text-lg shadow-inner">
                  👤
                </div>
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-primary-950 rounded-full animate-pulse"></span>
              </div>
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Admin Mode</p>
                <h3 className="text-xs font-black text-white mt-1.5 uppercase tracking-wide">Administrator</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 px-4 lg:px-6 space-y-1.5 overflow-y-auto no-scrollbar py-4 lg:py-0">
          <div className="text-[10px] font-black uppercase text-primary-600/60 tracking-[0.2em] pl-4 mb-4 flex items-center gap-2">
            <span className="w-4 h-px bg-primary-800/50"></span>
            Main Navigation
          </div>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-5 py-3.5 rounded-2xl text-left 
                  transition-all duration-300 group relative overflow-hidden
                  ${isActive 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40 translate-x-1' 
                    : 'text-slate-400 hover:text-white hover:bg-primary-900/50 hover:translate-x-1'}
                `}
              >
                <div className="flex items-center gap-4 relative z-10">
                  <span className={`
                    p-2 rounded-xl transition-all duration-300
                    ${isActive ? 'bg-white/20' : 'bg-primary-900/50 text-emerald-500 group-hover:bg-emerald-500/20 group-hover:text-emerald-400'}
                  `}>
                    {item.icon}
                  </span>
                  <span className={`text-[11px] font-black uppercase tracking-widest ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform`}>
                    {item.label}
                  </span>
                </div>
                {item.badge && (
                  <span className={`
                    text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter relative z-10
                    ${isActive ? 'bg-white/20 text-white' : 'bg-primary-900/80 text-emerald-500 border border-primary-800/50'}
                  `}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-6 lg:p-8 space-y-4">
          <div className="bg-primary-900/30 border border-primary-800/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="text-left">
              <p className="text-[8px] font-black text-primary-600 uppercase tracking-widest">Server Status</p>
              <p className="text-[10px] font-mono font-bold text-emerald-500/80 mt-0.5">Parepare, ID</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-primary-600 uppercase tracking-widest">Active Sync</p>
              <p className="text-[10px] font-mono font-bold text-emerald-500/80 mt-0.5">{localTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="
              w-full py-4 bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white
              border border-rose-500/20 hover:border-rose-500/10 rounded-2xl
              text-xs font-black uppercase tracking-[0.15em]
              flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-rose-950/20 active:scale-95
            "
          >
            <LogOut className="w-4 h-4" />
            Security Sign Out
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 min-h-screen bg-[#020d09] overflow-y-auto no-scrollbar relative">
        {/* Header Breadcrumbs Area */}
        <div className="sticky top-0 z-30 bg-[#020d09]/80 backdrop-blur-xl px-6 lg:px-10 py-6 lg:py-8 border-b border-primary-800/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="text-left">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
              <p className="text-[10px] font-black text-emerald-500/80 uppercase tracking-[0.3em]">Administrator / Control Center</p>
            </div>
            <h2 className="text-2xl lg:text-4xl font-black text-white font-display uppercase tracking-tight">
              {menuItems.find(m => m.id === activeTab)?.label}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-4 bg-primary-900/40 border border-primary-800/50 p-2 rounded-2xl px-5">
               <div className="text-right">
                  <p className="text-[8px] font-black text-primary-500 uppercase tracking-widest">Calendar Access</p>
                  <p className="text-[10px] font-bold text-white uppercase mt-0.5">
                    {localTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
               </div>
               <div className="w-px h-6 bg-primary-800/50"></div>
               <Clock className="w-5 h-5 text-emerald-500" />
            </div>
            <button className="p-3 bg-primary-800/50 hover:bg-primary-700/50 text-white rounded-2xl border border-primary-700/50 transition-all relative group">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-primary-800"></span>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 lg:p-10 pb-32 lg:pb-10 animate-fade-in relative z-10">
          {/* Active Tab View Rendering */}
          <div className="max-w-7xl mx-auto space-y-10">
            {activeTab === 'overview' && (
              <>
                {/* Modern Bento Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: 'Jamaah Aktif', value: `${activeJamaah} / ${totalJamaah}`, sub: 'Total kartu keluarga', icon: <Users className="w-6 h-6" />, color: 'from-blue-600 to-blue-800', shadow: 'shadow-blue-900/40' },
                  { label: 'Donasi Digital', value: `Rp ${totalInfaq.toLocaleString('id-ID')}`, sub: `${activeCampaignsCount} program aktif`, icon: <Heart className="w-6 h-6" />, color: 'from-rose-600 to-rose-800', shadow: 'shadow-rose-900/40' },
                  { label: 'Aset Inventaris', value: `${goodAssets} Unit`, sub: `${totalAssets} total tercatat`, icon: <Package className="w-6 h-6" />, color: 'from-amber-600 to-amber-800', shadow: 'shadow-amber-900/40' },
                  { label: 'Status Sistem', value: 'ONLINE', sub: 'Semua modul aktif', icon: <ShieldCheck className="w-6 h-6" />, color: 'from-emerald-600 to-emerald-800', shadow: 'shadow-emerald-900/40' },
                ].map((stat, i) => (
                  <div key={i} className={`bg-gradient-to-br ${stat.color} p-6 rounded-[2.5rem] shadow-2xl ${stat.shadow} relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}>
                    <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform duration-500"></div>
                    <div className="relative z-10 space-y-4">
                      <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                        {stat.icon}
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">{stat.label}</p>
                        <h4 className="text-xl font-black text-white mt-1 uppercase font-display">{stat.value}</h4>
                        <p className="text-[9px] font-bold text-white/50 mt-1 uppercase tracking-wider">{stat.sub}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Modules Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Quick Actions Grid */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="flex items-center justify-between px-2">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.25em] flex items-center gap-3 font-display">
                      <Layers className="w-5 h-5 text-emerald-500" />
                      Management Modules
                    </h3>
                    <span className="text-[10px] font-black text-primary-500 bg-primary-900/50 px-3 py-1 rounded-full uppercase tracking-widest border border-primary-800/50">Full CRUD Enabled</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {menuItems.filter(i => i.id !== 'overview' && i.id !== 'keamanan').map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className="bg-primary-900/30 border border-primary-800/30 p-6 rounded-[2rem] text-left hover:bg-primary-800/50 hover:border-emerald-500/30 transition-all group relative overflow-hidden active:scale-95"
                      >
                        <div className="w-12 h-12 bg-primary-800/50 rounded-2xl flex items-center justify-center text-emerald-500 mb-4 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-xl">
                          {item.icon}
                        </div>
                        <h4 className="text-[11px] font-black text-white uppercase tracking-widest leading-tight">{item.label}</h4>
                        <p className="text-[9px] text-slate-500 mt-2 uppercase font-bold tracking-tighter">Open Dashboard →</p>
                        <div className="absolute top-4 right-4 text-emerald-500/20 group-hover:text-emerald-500/40 transition-colors">
                           <ShieldCheck className="w-10 h-10" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Security & Systems */}
                <div className="space-y-6">
                  <h3 className="text-sm font-black text-white uppercase tracking-[0.25em] flex items-center gap-3 px-2 font-display">
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                    Security Hub
                  </h3>
                  
                  <div className="bg-primary-950/50 border border-primary-800/50 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
                    <div className="space-y-4">
                      <div className="p-5 bg-primary-900/40 border border-primary-800/50 rounded-2xl text-left">
                        <p className="text-[9px] font-black text-primary-500 uppercase tracking-widest mb-1">Database Integrity</p>
                        <p className="text-[10px] text-slate-400 leading-relaxed">Sistem sinkronisasi otomatis dengan Firestore setiap 15 menit.</p>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <button 
                          onClick={seedDummyData}
                          className="w-full py-4 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl"
                        >
                          ⚡ Muat Data Awal (Seeding)
                        </button>
                        <button 
                          onClick={() => setActiveTab('keamanan')}
                          className="w-full py-4 bg-amber-600/10 hover:bg-amber-600 text-amber-500 hover:text-white border border-amber-500/20 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xl"
                        >
                          🔐 Manajemen PIN & Akses
                        </button>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-primary-800/50">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Recent Logs</span>
                        <button onClick={onClearLogs} className="text-[8px] font-black text-rose-500 uppercase hover:underline">Clear History</button>
                      </div>
                      <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
                        {recentLogs.map((log: any, idx) => (
                          <div key={idx} className="p-3 bg-primary-900/20 border border-primary-800/30 rounded-xl flex items-center justify-between gap-3 text-left">
                            <div className="flex items-center gap-3">
                              <div className={`w-1.5 h-1.5 rounded-full ${log.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></div>
                              <div className="max-w-[120px]">
                                <p className="text-[9px] font-black text-white uppercase truncate">{log.title}</p>
                                <p className="text-[8px] text-slate-500 truncate">{log.message}</p>
                              </div>
                            </div>
                            <span className="text-[8px] font-mono text-primary-500 font-bold">{new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: BROADCAST & ANNOUNCEMENTS / SLIDER MEDIA */}
          {activeTab === 'beranda' && (
            <div className="space-y-10 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* QRIS & Audio Configuration */}
                <div className="bg-primary-950/50 border border-primary-800/50 p-8 rounded-[2.5rem] shadow-2xl space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                      <Settings className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest font-display">System Assets</h3>
                      <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight mt-0.5">Manage QRIS & Audio Signals</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* QRIS Section */}
                    <div className="p-6 bg-primary-900/20 border border-primary-800/30 rounded-2xl space-y-4">
                      <div className="text-left">
                        <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                           <QrCode className="w-4 h-4" />
                           QRIS Donation Code
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1">Upload the QRIS code for mosque donations.</p>
                      </div>
                      <QrisUploader onAddLog={addLog} />
                    </div>

                    {/* Audio Section */}
                    <div className="p-6 bg-primary-900/20 border border-primary-800/30 rounded-2xl space-y-4">
                      <div className="text-left">
                        <h4 className="text-[11px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2">
                           <Music className="w-4 h-4" />
                           Adzan & Alarm Signal
                        </h4>
                        <p className="text-[10px] text-slate-400 mt-1">Configure audio files for automated adzan alerts.</p>
                      </div>
                      <div className="space-y-4">
                        <AudioUploader 
                          onAddLog={addLog} 
                          onUpload={(_dataUrl: string) => {
                            addLog('Audio Uploaded', 'Custom adzan signal updated successfully.', 'success');
                          }}
                        />
                        <button
                          onClick={() => {
                            triggerAudioPlayback();
                            addLog('Audio Test', 'Triggered adzan signal playback test.', 'system');
                          }}
                          className="w-full py-4 bg-primary-800/50 hover:bg-emerald-600 text-emerald-500 hover:text-white border border-emerald-500/20 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                          🔔 Test Signal Playback
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Media Slider Banner Management */}
                <div className="bg-primary-950/50 border border-primary-800/50 p-8 rounded-[2.5rem] shadow-2xl space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                        <ImageIcon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-black text-white uppercase tracking-widest font-display">Media Slider</h3>
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tight mt-0.5">Homepage Hero Banners</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab('jadwal')}
                      className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-colors"
                    >
                      Open Editor
                    </button>
                  </div>
                  
                  {/* Preview Slides Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
                    {slides.length === 0 ? (
                      <div className="col-span-2 py-20 text-center bg-primary-900/20 border border-dashed border-primary-800/50 rounded-3xl">
                        <ImageIcon className="w-12 h-12 text-primary-800 mx-auto mb-4" />
                        <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest">No active banners detected</p>
                      </div>
                    ) : (
                      slides.map((s, i) => (
                        <div key={s.id || i} className="group relative aspect-video rounded-[2rem] overflow-hidden border border-primary-800/50 bg-black shadow-2xl">
                          <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/20 to-transparent p-5 flex flex-col justify-end">
                            <span className="absolute top-4 left-4 text-[8px] font-black text-amber-500 bg-primary-950/80 px-2.5 py-1 rounded-full border border-amber-500/20 backdrop-blur-md uppercase tracking-widest">
                              Slide {s.order || i + 1}
                            </span>
                            <div className="text-left">
                              <h4 className="text-[10px] font-black text-white uppercase tracking-wider truncate mb-1">{s.title}</h4>
                              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter truncate">{s.description}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-6 bg-primary-900/10 border border-primary-800/30 rounded-2xl">
                     <p className="text-[9px] text-slate-500 uppercase font-bold leading-relaxed text-center italic">
                       *All slides can be managed in detail within the "Management Media" subtab in Jadwal Hub.
                     </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROFIL & JAMAAH */}
          {activeTab === 'profil' && (
            <div className="space-y-10 animate-fade-in">
              <div className="bg-primary-950/50 border border-primary-800/50 p-8 rounded-[2.5rem] shadow-2xl space-y-8 text-left">
                <div className="flex items-center gap-4 border-b border-primary-800/50 pb-6">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">Jamaah & Organization</h3>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-0.5">Manage historical data, community members, and structural board</p>
                  </div>
                </div>
                
                <div className="space-y-10">
                  {/* Database Jamaah Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                       <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                       <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Community Registry (CRUD)</h4>
                    </div>
                    <div className="bg-primary-900/10 border border-primary-800/30 rounded-[2rem] p-8 shadow-inner overflow-hidden">
                      <ManajemenJamaah 
                        isAdmin={true}
                        onAddLog={addLog} 
                      />
                    </div>
                  </div>

                  {/* Organization Board Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                       <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Mosque Structural Board</h4>
                    </div>
                    <div className="bg-primary-900/10 border border-primary-800/30 rounded-[2rem] p-8 shadow-inner overflow-hidden">
                      <ManajemenPengurusLengkap 
                        detailedBoard={detailedBoard}
                        onAddLog={addLog}
                      />
                    </div>
                  </div>

                  {/* Profile Settings Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                       <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                       <h4 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">Mosque Information Editor</h4>
                    </div>
                    <div className="bg-primary-900/10 border border-primary-800/30 rounded-[2rem] p-8 shadow-inner overflow-hidden">
                      <EditorProfilMasjid 
                        mosqueSettings={mosqueSettings}
                        onAddLog={addLog}
                      />
                    </div>
                  </div>

                  {/* Preview Sandbox */}
                  <div className="pt-8 border-t border-primary-800/30">
                    <div className="flex items-center justify-between mb-6 px-2">
                      <h4 className="text-[11px] font-black text-primary-500 uppercase tracking-[0.2em]">Live Landing Preview (Sandbox)</h4>
                      <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest bg-primary-900/50 px-3 py-1 rounded-full border border-primary-800/50">Read Only View</span>
                    </div>
                    <div className="bg-primary-950/80 rounded-[2.5rem] border border-primary-800/50 p-1 overflow-hidden shadow-2xl">
                      <div className="max-h-[600px] overflow-y-auto no-scrollbar rounded-[2.2rem]">
                        <InfoMasjid activeSubTab="info_umum" detailedBoard={detailedBoard} mosqueSettings={mosqueSettings} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: JADWAL & SHYAR (SCHEDULER JADWALHUB) */}
          {activeTab === 'jadwal' && (
            <div className="space-y-10 animate-fade-in">
              <div className="bg-primary-950/50 border border-primary-800/50 p-8 rounded-[2.5rem] shadow-2xl space-y-8 text-left">
                <div className="flex items-center gap-4 border-b border-primary-800/50 pb-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">Religious Scheduler</h3>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-0.5">Control prayer times, study sessions, and special events</p>
                  </div>
                </div>

                <div className="bg-primary-900/10 border border-primary-800/30 rounded-[2rem] p-4 lg:p-8 shadow-inner">
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
            </div>
          )}

          {/* TAB 5: GALERI MASJID */}
          {activeTab === 'galeri' && (
            <div className="space-y-10 animate-fade-in">
              <div className="bg-primary-950/50 border border-primary-800/50 p-8 rounded-[2.5rem] shadow-2xl space-y-8 text-left">
                <div className="flex items-center gap-4 border-b border-primary-800/50 pb-6">
                  <div className="w-12 h-12 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">Media Gallery</h3>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-0.5">Curate documentation, events, and mosque visuals</p>
                  </div>
                </div>

                <div className="bg-primary-900/10 border border-primary-800/30 rounded-[2rem] p-4 lg:p-8 shadow-inner overflow-hidden">
                  <GaleriMasjid isAdmin={true} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DONASI & AMAL JARIYAH */}
          {activeTab === 'donasi' && (
            <div className="space-y-10 animate-fade-in">
              <div className="bg-primary-950/50 border border-primary-800/50 p-8 rounded-[2.5rem] shadow-2xl space-y-8 text-left">
                <div className="flex items-center gap-4 border-b border-primary-800/50 pb-6">
                  <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-500">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">Donation Hub</h3>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-0.5">Manage digital fundraising, campaigns, and charity programs</p>
                  </div>
                </div>

                <div className="bg-primary-900/10 border border-primary-800/30 rounded-[2rem] p-4 lg:p-8 shadow-inner overflow-hidden">
                  <DonationOpen 
                    isAdmin={true}
                    campaigns={campaigns}
                    onUpdateCampaigns={() => {}}
                    onDonationSuccess={onDonationSuccess}
                    onAddLog={addLog}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: KAS & KEUANGAN */}
          {activeTab === 'keuangan' && (
            <div className="space-y-10 animate-fade-in">
              <div className="bg-primary-950/50 border border-primary-800/50 p-8 rounded-[2.5rem] shadow-2xl space-y-8 text-left">
                <div className="flex items-center gap-4 border-b border-primary-800/50 pb-6">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">Financial Center</h3>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-0.5">Audit transaction logs, cash flow, and donor reports</p>
                  </div>
                </div>

                <div className="bg-primary-900/10 border border-primary-800/30 rounded-[2rem] p-4 lg:p-8 shadow-inner overflow-hidden">
                  <KeuanganMasjid 
                    isAdmin={true} 
                    onAddLog={addLog} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: INVENTARIS / ASET */}
          {activeTab === 'inventaris' && (
            <div className="space-y-10 animate-fade-in">
              <div className="bg-primary-950/50 border border-primary-800/50 p-8 rounded-[2.5rem] shadow-2xl space-y-8 text-left">
                <div className="flex items-center gap-4 border-b border-primary-800/50 pb-6">
                  <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                    <Package className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">Asset Management</h3>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-0.5">Track mosque logistics, condition census, and equipment inventory</p>
                  </div>
                </div>

                <div className="bg-primary-900/10 border border-primary-800/30 rounded-[2rem] p-4 lg:p-8 shadow-inner overflow-hidden">
                  <InventarisMasjid 
                    isAdmin={true} 
                    onAddLog={addLog} 
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: INBOX / CONTACT FEEDBACK */}
          {activeTab === 'kontak' && (
            <div className="space-y-10 animate-fade-in">
              <div className="bg-primary-950/50 border border-primary-800/50 p-8 rounded-[2.5rem] shadow-2xl space-y-8 text-left">
                <div className="flex items-center gap-4 border-b border-primary-800/50 pb-6">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-500">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight font-display">Communications Hub</h3>
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-0.5">Review guest messages, feedback, and emergency contacts</p>
                  </div>
                </div>

                <div className="bg-primary-900/10 border border-primary-800/30 rounded-[2rem] p-4 lg:p-8 shadow-inner overflow-hidden">
                  <KontakMasjid isAdmin={true} />
                </div>
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
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Floating Premium Capsule) */}
      <div className="xl:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] w-[92%] max-w-lg animate-slide-up">
        <div className="bg-primary-950/90 backdrop-blur-2xl border border-primary-800/50 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.8)] px-2 py-2 flex items-center justify-around">
          {menuItems.slice(0, 4).map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`
                  flex flex-col items-center justify-center w-14 h-14 rounded-2xl transition-all duration-500 relative
                  ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'}
                `}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeTabMobile"
                    className="absolute inset-0 bg-emerald-600 rounded-2xl shadow-lg shadow-emerald-900/40"
                  />
                )}
                <div className={`transition-all duration-500 relative z-10 ${isActive ? 'scale-110 -translate-y-1' : 'scale-100'}`}>
                  {item.mobileIcon || item.icon}
                </div>
                {isActive && (
                  <span className="text-[8px] font-black uppercase tracking-widest mt-1 relative z-10 animate-fade-in">
                    {item.shortLabel}
                  </span>
                )}
              </button>
            );
          })}
          
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl text-slate-500 hover:text-white transition-all relative"
          >
            <div className="bg-primary-900/50 w-10 h-10 rounded-xl flex items-center justify-center border border-primary-800/50">
              <Menu className="h-5 w-5" />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Bottom Sheet (More Menu) */}
      <div 
        className={`xl:hidden fixed inset-0 z-[80] flex flex-col justify-end transition-all duration-700 ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      >
        <div 
          className="absolute inset-0 bg-primary-950/80 backdrop-blur-md"
          onClick={() => setIsSidebarOpen(false)}
        />
        <div 
          className={`relative bg-primary-950 border-t border-primary-800/50 rounded-t-[3rem] shadow-[0_-20px_60px_rgba(0,0,0,0.9)] transition-all duration-700 transform ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full'}`}
          style={{ maxHeight: '85vh' }}
        >
          {/* Grab Bar */}
          <div className="flex justify-center pt-5 pb-2 cursor-grab active:cursor-grabbing" onClick={() => setIsSidebarOpen(false)}>
            <div className="w-16 h-1.5 bg-primary-800/50 rounded-full" />
          </div>
          
          <div className="px-8 pb-12 pt-6 flex flex-col h-full max-h-[calc(85vh-3rem)] overflow-y-auto no-scrollbar">
            <div className="flex items-center justify-between mb-8">
              <div className="text-left">
                <h3 className="text-sm font-black tracking-[0.25em] text-emerald-500 uppercase font-display">System Hub</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Select administrative module</p>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="w-12 h-12 bg-primary-900/50 hover:bg-primary-800 transition-colors text-white rounded-2xl border border-primary-800/50 flex items-center justify-center"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {menuItems.map(item => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsSidebarOpen(false);
                    }}
                    className={`
                      flex flex-col items-start p-6 rounded-3xl border transition-all duration-500 text-left
                      ${isActive 
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-950/40 scale-[1.02]' 
                        : 'bg-primary-900/40 border-primary-800/50 text-slate-400 hover:border-primary-700 hover:bg-primary-900'}
                    `}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${isActive ? 'bg-white/20 text-white' : 'bg-primary-800/50 text-emerald-500'}`}>
                      {item.mobileIcon || item.icon}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.15em] leading-tight">
                      {item.label}
                    </span>
                    {item.badge && !isActive && (
                      <span className="mt-2 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary-800 text-emerald-500 border border-primary-700/50">
                        {item.badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <div className="mt-10 pt-8 border-t border-primary-800/50">
              <button
                onClick={() => {
                  setIsSidebarOpen(false);
                  onLogout();
                }}
                className="w-full py-5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-[2rem] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 uppercase tracking-[0.2em]"
              >
                <LogOut className="h-5 w-5" />
                Sign Out & Lock Panel
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
