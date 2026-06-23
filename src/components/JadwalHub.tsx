import { useState } from 'react';
import { 
  Clock, 
  BookOpen, 
  Star, 
  Users, 
  Bell, 
  Database, 
  History, 
  RefreshCw, 
  Play, 
  Square,
  Volume2, 
  VolumeX, 
  Settings, 
  Calendar,
  Layout,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { PrayerTime, NotificationLog, SlideItem, KajianEntry, JumatEntry, RamadanEntry } from '../types';
import SliderManager from './SliderManager';
import { addDocument, updateDocument, deleteDocument } from '../lib/db';

interface JadwalHubProps {
  prayers: PrayerTime[];
  nextDetails: any;
  logs: NotificationLog[];
  notificationPermission: NotificationPermission;
  selectedAudio: 'chime' | 'gong' | 'adzan';
  isMuted: boolean;
  volume: number;
  isAudioPlaying: boolean;
  testNotificationTimeLeft: number | null;
  showConfigInfo: boolean;
  editingPrayer: PrayerTime | null;
  editTimeValue: string;
  onSetShowConfigInfo: (show: boolean) => void;
  onTriggerQuickTest: () => void;
  onRequestNotificationPermission: () => void;
  onSetSelectedAudio: (audio: 'chime' | 'gong' | 'adzan') => void;
  onSetIsMuted: (muted: boolean) => void;
  onSetVolume: (volume: number) => void;
  onToggleSoundPlay: () => void;
  onResetDefaults: () => void;
  onStartEditing: (prayer: PrayerTime) => void;
  onSetEditTimeValue: (value: string) => void;
  onSavePrayerEdit: () => void;
  onCancelEdit: () => void;
  onClearLogs: () => void;
  onNavigate: (tab: string) => void;
  isAdmin?: boolean;
  slides?: SlideItem[];
  onUpdateSlides?: () => void;
  onAddLog: (title: string, msg: string, type: any) => void;
  kajian: KajianEntry[];
  onUpdateKajian: () => void;
  jumat: JumatEntry[];
  onUpdateJumat: () => void;
  ramadan: RamadanEntry[];
  onDeleteLog: (id: string) => void;
}

export default function JadwalHub({
  prayers,
  nextDetails,
  logs,
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
  onResetDefaults,
  onStartEditing,
  onSetEditTimeValue,
  onSavePrayerEdit,
  onCancelEdit,
  onClearLogs,
  onNavigate,
  isAdmin,
  slides,
  onAddLog,
  kajian,
  jumat,
  ramadan,
  onDeleteLog
}: JadwalHubProps) {
  const [activeSubTab, setActiveSubTab] = useState<'sholat' | 'kajian' | 'ramadan' | 'jumat' | 'slider' | 'log'>('sholat');

  // Admin CRUD states for Kajian and Jumat
  const [editingKajian, setEditingKajian] = useState<KajianEntry | null>(null);
  const [selectedKajianDetail, setSelectedKajianDetail] = useState<KajianEntry | null>(null);
  const [kajianForm, setKajianForm] = useState<Partial<KajianEntry>>({});
  const [editingJumat, setEditingJumat] = useState<JumatEntry | null>(null);
  const [jumatForm, setJumatForm] = useState<Partial<JumatEntry>>({});
  const [editingRamadan, setEditingRamadan] = useState<RamadanEntry | null>(null);
  const [ramadanForm, setRamadanForm] = useState<Partial<RamadanEntry>>({});

  const handleEditKajian = (k: KajianEntry) => {
    setEditingKajian(k);
    setKajianForm(k);
  };

  const handleAddKajian = () => {
    const newKajian: KajianEntry = {
      id: Math.random().toString(36).substr(2, 9),
      day: '',
      time: '',
      title: '',
      lecturer: '',
      theme: '',
      category: 'Lainnya'
    };
    setEditingKajian(newKajian);
    setKajianForm(newKajian);
  };

  const saveKajian = () => {
    if (!kajianForm.title || !kajianForm.lecturer) {
      onAddLog('Gagal', 'Judul dan Pemateri wajib diisi!', 'alert');
      return;
    }
    
    if (editingKajian && editingKajian.id) {
       const existingKajian = kajian.find(k => k.id === editingKajian.id);
       if (existingKajian && existingKajian.id) {
         updateDocument('kajian_schedule', existingKajian.id, kajianForm);
         onAddLog('Kajian Diperbarui', `Jadwal ${kajianForm.title} berhasil diperbarui.`, 'success');
       }
    } else {
       addDocument('kajian_schedule', kajianForm);
       onAddLog('Kajian Ditambah', `Jadwal ${kajianForm.title} berhasil ditambahkan.`, 'success');
    }
    setEditingKajian(null);
  };

  const deleteKajian = (id: string) => {
    if (confirm('Hapus jadwal kajian ini?')) {
      const kToDelete = kajian.find(k => k.id === id);
      if (kToDelete && kToDelete.id) {
        deleteDocument('kajian_schedule', kToDelete.id);
        onAddLog('Kajian Dihapus', 'Jadwal kajian berhasil dihapus.', 'alert');
      }
    }
  };

  const handleEditJumat = (j: JumatEntry) => {
    setEditingJumat(j);
    setJumatForm(j);
  };

  const handleAddJumat = () => {
    const newJumat: JumatEntry = {
      id: Math.random().toString(36).substr(2, 9),
      date: '',
      khatib: '',
      imam: '',
      muazin: '',
      month: jumat.length > 0 ? jumat[jumat.length - 1].month : ''
    };
    setEditingJumat(newJumat);
    setJumatForm(newJumat);
  };

  const saveJumat = () => {
    if (!jumatForm.date || !jumatForm.khatib) {
      onAddLog('Gagal', 'Tanggal dan Khatib wajib diisi!', 'alert');
      return;
    }
    
    if (editingJumat && editingJumat.id) {
       const existingJumat = jumat.find(j => j.id === editingJumat.id);
       if (existingJumat && existingJumat.id) {
         updateDocument('jumat_schedule', existingJumat.id, jumatForm);
         onAddLog('Jadwal Jumat Diperbarui', `Jadwal tanggal ${jumatForm.date} berhasil diperbarui.`, 'success');
       }
    } else {
       addDocument('jumat_schedule', jumatForm);
       onAddLog('Jadwal Jumat Ditambah', `Jadwal tanggal ${jumatForm.date} berhasil ditambahkan.`, 'success');
    }
    setEditingJumat(null);
  };

  const deleteJumat = (id: string) => {
    if (confirm('Hapus jadwal jumat ini?')) {
      const jToDelete = jumat.find(j => j.id === id);
      if (jToDelete && jToDelete.id) {
        deleteDocument('jumat_schedule', jToDelete.id);
        onAddLog('Jadwal Jumat Dihapus', 'Jadwal jumat berhasil dihapus.', 'alert');
      }
    }
  };

  const handleEditRamadan = (r: RamadanEntry) => {
    setEditingRamadan(r);
    setRamadanForm(r);
  };

  const handleAddRamadan = () => {
    const newRam: RamadanEntry = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      time: '',
      description: '',
      icon: '🌙',
      category: 'Ibadah'
    };
    setEditingRamadan(newRam);
    setRamadanForm(newRam);
  };

  const saveRamadan = () => {
    if (!ramadanForm.title || !ramadanForm.time) {
      onAddLog('Gagal', 'Judul dan Waktu wajib diisi!', 'alert');
      return;
    }
    
    if (editingRamadan && editingRamadan.id) {
       const existing = ramadan.find(r => r.id === editingRamadan.id);
       if (existing && existing.id) {
         updateDocument('ramadan_schedule', existing.id, ramadanForm);
         onAddLog('Ramadan Diperbarui', `Kegiatan ${ramadanForm.title} berhasil diperbarui.`, 'success');
       }
    } else {
       addDocument('ramadan_schedule', ramadanForm);
       onAddLog('Ramadan Ditambah', `Kegiatan ${ramadanForm.title} berhasil ditambahkan.`, 'success');
    }
    setEditingRamadan(null);
  };

  const deleteRamadan = (id: string) => {
    if (confirm('Hapus kegiatan ramadan ini?')) {
      const rToDelete = ramadan.find(r => r.id === id);
      if (rToDelete && rToDelete.id) {
        deleteDocument('ramadan_schedule', rToDelete.id);
        onAddLog('Kegiatan Dihapus', 'Kegiatan ramadan berhasil dihapus.', 'alert');
      }
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="jadwal_hub_container">
      
      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl sm:rounded-2xl w-full max-w-4xl mx-auto md:mx-0">
        <button
          onClick={() => setActiveSubTab('sholat')}
          className={`flex-1 min-w-[90px] sm:min-w-[120px] py-2 sm:py-3 text-center text-[10px] sm:text-xs font-black rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
            activeSubTab === 'sholat'
              ? 'bg-white text-slate-900 shadow border border-slate-200/40'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clock className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${activeSubTab === 'sholat' ? 'text-emerald-600' : ''}`} />
          <span>Sholat</span>
        </button>
        <button
          onClick={() => setActiveSubTab('kajian')}
          className={`flex-1 min-w-[90px] sm:min-w-[120px] py-2 sm:py-3 text-center text-[10px] sm:text-xs font-black rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
            activeSubTab === 'kajian'
              ? 'bg-white text-slate-900 shadow border border-slate-200/40'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${activeSubTab === 'kajian' ? 'text-amber-600' : ''}`} />
          <span>Kajian</span>
        </button>
        <button
          onClick={() => setActiveSubTab('jumat')}
          className={`flex-1 min-w-[90px] sm:min-w-[120px] py-2 sm:py-3 text-center text-[10px] sm:text-xs font-black rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
            activeSubTab === 'jumat'
              ? 'bg-white text-slate-900 shadow border border-slate-200/40'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${activeSubTab === 'jumat' ? 'text-blue-600' : ''}`} />
          <span>Jumat</span>
        </button>
        <button
          onClick={() => setActiveSubTab('ramadan')}
          className={`flex-1 min-w-[90px] sm:min-w-[120px] py-2 sm:py-3 text-center text-[10px] sm:text-xs font-black rounded-lg sm:rounded-xl transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
            activeSubTab === 'ramadan'
              ? 'bg-white text-slate-900 shadow border border-slate-200/40'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${activeSubTab === 'ramadan' ? 'text-rose-600' : ''}`} />
          <span className="hidden sm:inline">Ramadan 1447H</span>
          <span className="sm:hidden">Ramadan</span>
        </button>

        {isAdmin && (
          <button
            onClick={() => setActiveSubTab('slider')}
            className={`flex-1 min-w-[120px] py-3 text-center text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'slider'
                ? 'bg-white text-slate-900 shadow border border-slate-200/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layout className={`h-4 w-4 ${activeSubTab === 'slider' ? 'text-emerald-600' : ''}`} />
            <span>Kelola Slider</span>
          </button>
        )}

        {isAdmin && (
          <button
            onClick={() => setActiveSubTab('log')}
            className={`flex-1 min-w-[120px] py-3 text-center text-xs font-black rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSubTab === 'log'
                ? 'bg-white text-slate-900 shadow border border-slate-200/40'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className={`h-4 w-4 ${activeSubTab === 'log' ? 'text-emerald-600' : ''}`} />
            <span>Riwayat Log</span>
          </button>
        )}
      </div>

      {activeSubTab === 'sholat' && (
        <div className="space-y-6">
          {/* Banner Infomasi Database Firestore */}
          {showConfigInfo && (
            <div className="bg-emerald-500/10 text-emerald-800 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden" id="db_connected_banner">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-700 shrink-0 text-sm">
                ✨
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-bold text-sm text-emerald-900">Database Real-time Terintegrasi</h4>
                <p className="text-xs text-emerald-700 leading-relaxed md:max-w-4xl">
                  Alhamdulillah, sistem kami menggunakan penyimpanan cloud aman serta redundansi database berbasis localStorage. Perangkat Anda akan terus mendapatkan notifikasi tepat waktu.
                </p>
              </div>
              <button 
                onClick={() => onSetShowConfigInfo(false)}
                className="text-xs text-emerald-700 hover:text-emerald-900 hover:bg-emerald-500/10 w-6 h-6 rounded-full flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-gradient-to-br from-emerald-900 to-emerald-800 text-white rounded-3xl shadow-xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between border-b-4 border-amber-400">
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-emerald-950/40 text-emerald-300 border border-emerald-700 font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                      ACUAN JADWAL TERDEKAT
                    </span>
                    {nextDetails ? (
                      <h2 className="text-2xl font-black tracking-wide mt-2">
                        Shalat {nextDetails.prayer.name} berikutnya pukul {nextDetails.prayer.time} WITA
                      </h2>
                    ) : (
                      <h2 className="text-2xl font-black tracking-wide mt-2">Memuat Waktu Shalat...</h2>
                    )}
                  </div>
                  <div className="p-3 bg-emerald-950/40 backdrop-blur rounded-2xl border border-emerald-700 animate-bounce">
                    <Bell className="h-6 w-6 text-amber-400" />
                  </div>
                </div>

                {nextDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 mb-6 border-t border-b border-emerald-700/60 py-6">
                    <div>
                      <span className="block text-xs text-emerald-300 tracking-wide font-medium uppercase">COUNTDOWN ADZAN</span>
                      <div className="text-3xl font-black text-amber-300 tracking-wide mt-1 font-mono">
                        {nextDetails.countdownPrayer}
                      </div>
                    </div>
                    <div className="border-t md:border-t-0 md:border-l border-emerald-700/60 pt-4 md:pt-0 md:pl-6">
                      <span className="block text-xs text-emerald-300 tracking-wide font-medium uppercase">🔔 PERINGATAN 10 MENIT</span>
                      <div className="text-3xl font-black text-white tracking-wide mt-1 font-mono">
                        {nextDetails.countdownAlert}
                      </div>
                    </div>
                  </div>
                )}

                {isAdmin && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-emerald-950/40 backdrop-blur-md p-4 rounded-2xl border border-emerald-700">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">📣</span>
                      <p className="text-[10px] text-emerald-300">Gunakan simulator instan ini untuk memicu alarm 10 menit sebelum waktu simulasi.</p>
                    </div>
                    <button
                      onClick={onTriggerQuickTest}
                      disabled={testNotificationTimeLeft !== null}
                      className="sm:ml-auto px-5 py-2 w-full sm:w-auto bg-amber-400 hover:bg-amber-500 disabled:bg-amber-400/40 text-emerald-950 font-black rounded-xl shadow text-[11px] uppercase transition active:scale-95 whitespace-nowrap"
                    >
                      {testNotificationTimeLeft !== null 
                        ? `Menguji (${testNotificationTimeLeft}s)...`
                        : '🔥 Uji Notifikasi (5 Detik)'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-3xl shadow-lg border border-slate-100 p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5 text-emerald-600" /> Koneksi
                </h3>
                <div className={`p-4 rounded-2xl border ${notificationPermission === 'granted' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-amber-50 border-amber-100 text-amber-800'}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1">NOTIFIKASI DESKTOP</p>
                  <p className="text-xs font-semibold leading-relaxed">
                    {notificationPermission === 'granted' ? 'Izin Aktif! Notifikasi akan muncul otomatis.' : 'Izin Belum Diberikan. Aktifkan agar pengingat berbunyi.'}
                  </p>
                  {notificationPermission !== 'granted' && (
                    <button onClick={onRequestNotificationPermission} className="mt-3 w-full py-2 bg-emerald-600 text-white font-bold rounded-xl text-xs shadow">Aktifkan Notifikasi</button>
                  )}
                </div>
                <div className="space-y-3">
                  <span className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">VOLUME & NADA</span>
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <button onClick={() => onSetIsMuted(!isMuted)} className="p-2 text-slate-600">{isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</button>
                    <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => onSetVolume(parseFloat(e.target.value))} className="flex-1 accent-emerald-600" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['chime', 'gong', 'adzan'] as const).map(audio => (
                      <button
                        key={audio}
                        onClick={() => onSetSelectedAudio(audio)}
                        className={`py-1.5 rounded-xl border text-[9px] font-black uppercase transition ${
                          selectedAudio === audio 
                            ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                        }`}
                      >
                        {audio}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button 
                onClick={onToggleSoundPlay} 
                className={`w-full py-3 mt-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 border transition ${isAudioPlaying ? 'bg-amber-500 text-white border-amber-600' : 'bg-emerald-50 text-emerald-800 border-emerald-200'}`}
              >
                {isAudioPlaying ? <Square className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                {isAudioPlaying ? 'HENTIKAN TES' : 'PUTAR TES ALARM'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-white rounded-3xl shadow-lg border border-slate-100 p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2.5">
                  <Database className="h-5 w-5 text-emerald-600" /> Jadwal Waktu Shalat
                </h3>
                {isAdmin && (
                  <button onClick={onResetDefaults} className="text-[10px] text-amber-700 bg-amber-50 font-black px-3 py-1.5 rounded-xl border border-amber-200 transition flex items-center gap-1.5">
                    <RefreshCw className="h-3 w-3" /> RESET DEFAULT
                  </button>
                )}
              </div>
              <div className="overflow-x-auto -mx-6 px-6">
              <table className="w-full text-left border-collapse min-w-[550px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="py-3 px-3">Nama Shalat</th>
                      <th className="py-3 px-3">Waktu</th>
                      <th className="py-3 px-3">Peringatan (-10m)</th>
                      {isAdmin && <th className="py-3 px-3 text-right">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {prayers.map((prayer) => {
                      const isEditingThis = editingPrayer?.id === prayer.id;
                      const [h, m] = prayer.time.split(':').map(Number);
                      let remM = m - 10;
                      let remH = h;
                      if (remM < 0) { remM += 60; remH -= 1; if (remH < 0) remH += 24; }
                      const alertTime = `${String(remH).padStart(2, '0')}:${String(remM).padStart(2, '0')}`;

                      return (
                        <tr key={prayer.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-4 px-3 flex items-center gap-3">
                            <span className="text-xl w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">{prayer.icon}</span>
                            <span className="font-extrabold text-slate-800 text-sm">{prayer.name}</span>
                          </td>
                          <td className="py-4 px-3">
                            {isEditingThis ? (
                              <input type="time" value={editTimeValue} onChange={(e) => onSetEditTimeValue(e.target.value)} className="px-3 py-1.5 bg-slate-50 border border-emerald-500 rounded-lg text-sm font-black font-mono" />
                            ) : (
                              <span className="font-black text-slate-800 font-mono text-sm bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{prayer.time}</span>
                            )}
                          </td>
                          <td className="py-4 px-3">
                            <span className="text-xs font-black text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-100/50 inline-flex items-center gap-1.5 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span> {alertTime}
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="py-4 px-3 text-right">
                              {isEditingThis ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button onClick={onSavePrayerEdit} className="p-1 px-3 bg-emerald-600 text-white rounded-lg text-xs font-black">SIMPAN</button>
                                  <button onClick={onCancelEdit} className="p-1 px-3 bg-slate-100 text-slate-600 rounded-lg text-xs font-black">BATAL</button>
                                </div>
                              ) : (
                                <button onClick={() => onStartEditing(prayer)} className="text-[10px] text-emerald-700 bg-emerald-50 font-black px-3 py-1.5 rounded-lg border border-emerald-100 transition">EDIT</button>
                              )}
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="lg:col-span-4 bg-white rounded-3xl shadow-lg border border-slate-100 p-6 flex flex-col">
              <div className="flex items-center justify-between mb-4 text-left">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <History className="h-5 w-5 text-emerald-600" /> Riwayat
                </h3>
                {isAdmin && <button onClick={onClearLogs} className="text-[10px] font-black text-slate-400 hover:text-red-500">BERSIHKAN</button>}
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {logs.length === 0 ? (
                  <div className="py-12 text-center text-slate-400"><p className="text-2xl">⏳</p><p className="text-xs font-bold mt-2 text-left">Belum ada riwayat alarm.</p></div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="p-3.5 rounded-2xl border text-[11px] bg-slate-50 border-slate-100 relative pl-4">
                      <span className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600" />
                      <div className="flex justify-between items-start mb-1 text-left">
                        <span className="font-black text-slate-800 text-left">{log.title}</span>
                        <span className="font-mono text-[9px] text-slate-400 font-black whitespace-nowrap ml-2">{log.timestamp}</span>
                      </div>
                      <p className="text-slate-600 text-left leading-relaxed">{log.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'kajian' && (
        <div className="space-y-6">
          {isAdmin && (
            <div className="flex justify-end">
              <button 
                onClick={handleAddKajian}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-slate-800 transition shadow-lg"
              >
                <Plus className="h-4 w-4 text-emerald-400" /> Tambah Jadwal Kajian
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in text-left">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-6 border-t-4 border-amber-400">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black font-mono uppercase bg-amber-500/10 text-amber-700 border border-amber-500/20">
                  BA'DA SUBUH & PAGI
                </span>
                <h3 className="text-xl font-display font-black text-slate-800 tracking-tight leading-none uppercase text-left">Kajian Rutin & Tabligh</h3>
                <p className="text-slate-400 text-xs text-left">Jadwal pembinaan iman khusus di waktu subuh dan pagi hari.</p>
              </div>
              <div className="space-y-4">
                {kajian.filter(k => k.category === 'Ba\'da Subuh').map((item) => (
                  <div key={item.id} onClick={() => setSelectedKajianDetail(item)} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white transition-all shadow-sm cursor-pointer space-y-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-amber-100 rounded-xl flex flex-col items-center justify-center shrink-0 border border-amber-200">
                        <span className="text-[10px] font-black text-amber-700 uppercase">{item.day}</span>
                      </div>
                      <div className="space-y-1 flex-1">
                        <h4 className="font-black text-sm text-slate-900">{item.title}</h4>
                        <p className="text-xs font-bold text-emerald-700">{item.lecturer}</p>
                        <div className="flex items-center gap-3 pt-1">
                          <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {item.time} WITA
                          </span>
                          <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{item.theme}</span>
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <button onClick={(e) => { e.stopPropagation(); handleEditKajian(item); }} className="p-2 bg-slate-100 text-slate-600 hover:text-emerald-600 rounded-xl flex-1 text-[10px] font-black uppercase">EDIT</button>
                        <button onClick={(e) => { e.stopPropagation(); deleteKajian(item.id); }} className="p-2 bg-slate-100 text-slate-600 hover:text-rose-600 rounded-xl flex-1 text-[10px] font-black uppercase">HAPUS</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-6 border-t-4 border-emerald-600">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black font-mono uppercase bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                  BA'DA MAGHRIB
                </span>
                <h3 className="text-xl font-display font-black text-slate-800 tracking-tight leading-none uppercase text-left">Kajian Kitab & Fiqh</h3>
                <p className="text-slate-400 text-xs text-left">Pendalaman ilmu syariat di antara waktu Maghrib dan Isya.</p>
              </div>
              <div className="space-y-4">
                {kajian.filter(k => k.category === 'Ba\'da Maghrib' || k.category === 'Lainnya').map((item) => (
                  <div key={item.id} onClick={() => setSelectedKajianDetail(item)} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white transition-all shadow-sm cursor-pointer space-y-4">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex flex-col items-center justify-center shrink-0 border border-emerald-200">
                        <span className="text-[10px] font-black text-emerald-700 uppercase">{item.day}</span>
                      </div>
                      <div className="space-y-1 flex-1">
                        <h4 className="font-black text-sm text-slate-900">{item.title}</h4>
                        <p className="text-xs font-bold text-amber-700">{item.lecturer}</p>
                        <div className="flex items-center gap-3 pt-1">
                          <span className="text-[10px] font-black text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {item.time} WITA
                          </span>
                          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{item.theme || item.category}</span>
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <button onClick={(e) => { e.stopPropagation(); handleEditKajian(item); }} className="p-2 bg-slate-100 text-slate-600 hover:text-emerald-600 rounded-xl flex-1 text-[10px] font-black uppercase">EDIT</button>
                        <button onClick={(e) => { e.stopPropagation(); deleteKajian(item.id); }} className="p-2 bg-slate-100 text-slate-600 hover:text-rose-600 rounded-xl flex-1 text-[10px] font-black uppercase">HAPUS</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'jumat' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-8 animate-fade-in text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-1 text-left">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black font-mono uppercase bg-blue-500/10 text-blue-700 border border-blue-500/20">
                  Pusat Informasi
                </span>
                {isAdmin && (
                  <button 
                    onClick={handleAddJumat}
                    className="flex items-center gap-2 px-4 py-1.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-blue-700 transition"
                  >
                    <Plus className="h-4 w-4" /> Tambah
                  </button>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-black text-slate-800 tracking-tight leading-tight uppercase text-left">Petugas Shalat Jumat</h3>
              <p className="text-slate-400 text-[10px] sm:text-xs text-left">Daftar petugas khatib dan imam Jumat di Masjid Jami Al-Abrar.</p>
            </div>
            <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl flex items-center gap-4">
              <Calendar className="h-6 w-6 text-blue-400" />
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Bulan Aktif</p>
                <p className="text-sm font-black uppercase">{jumat.length > 0 ? jumat[0].month : 'Belum Ditentukan'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {jumat.map((j, i) => (
              <div key={j.id} className={`p-6 rounded-3xl border transition-all group relative ${i === jumat.length - 1 ? 'bg-blue-600 text-white border-blue-700 shadow-xl shadow-blue-200 lg:-translate-y-2' : 'bg-slate-50 border-slate-100 hover:bg-white'}`}>
                <p className={`text-[10px] font-black font-mono uppercase tracking-widest mb-3 ${i === jumat.length - 1 ? 'text-blue-200' : 'text-slate-400'}`}>{j.date}</p>
                <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <span className={`block text-[9px] font-black uppercase ${i === jumat.length - 1 ? 'text-blue-100' : 'text-blue-600/80'}`}>Khatib</span>
                    <p className={`font-black text-sm leading-tight ${i === jumat.length - 1 ? 'text-white' : 'text-slate-900'}`}>{j.khatib}</p>
                  </div>
                  <div className="space-y-1">
                    <span className={`block text-[9px] font-black uppercase ${i === jumat.length - 1 ? 'text-blue-100' : 'text-blue-600/80'}`}>Imam</span>
                    <p className={`font-bold text-xs ${i === jumat.length - 1 ? 'text-white' : 'text-slate-700'}`}>{j.imam}</p>
                  </div>
                  <div className="pt-2 border-t border-current opacity-20"></div>
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${i === jumat.length - 1 ? 'bg-blue-300' : 'bg-blue-500'}`}></div>
                    <span className={`text-[10px] font-bold ${i === jumat.length - 1 ? 'text-blue-100' : 'text-slate-500'}`}>Muazin: {j.muazin}</span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-2">
                    <button onClick={() => handleEditJumat(j)} className={`p-2 rounded-xl border flex-1 text-[10px] font-black ${i === jumat.length - 1 ? 'bg-blue-50 text-blue-700 border-blue-400' : 'bg-white text-slate-600 hover:text-emerald-600 border-slate-200'}`}>EDIT</button>
                    <button onClick={() => deleteJumat(j.id)} className={`p-2 rounded-xl border flex-1 text-[10px] font-black ${i === jumat.length - 1 ? 'bg-white text-rose-600 border-rose-400' : 'bg-white text-slate-600 hover:text-rose-600 border-slate-200'}`}>HAPUS</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'ramadan' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-12 relative overflow-hidden border-b-4 border-amber-400 shadow-2xl shadow-emerald-950/20">
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-emerald-500/10 transform skew-x-[30deg] translate-x-20"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center md:text-left">
                <span className="inline-block px-4 py-1 bg-amber-400 text-emerald-950 font-black text-[10px] uppercase tracking-widest rounded-full shadow-lg shadow-amber-400/20">Semarak Ramadan</span>
                <h3 className="text-2xl sm:text-5xl font-display font-black tracking-tight leading-none uppercase text-center md:text-left">Ramadan <span className="text-amber-400">1447 H</span></h3>
                <p className="text-emerald-300/80 text-xs sm:text-base font-medium max-w-2xl mx-auto md:mx-0">Mari persiapkan diri di bulan mulia dengan semangat ibadah dan berderma di Masjid Al-Abrar.</p>
              </div>
              {isAdmin && (
                <button 
                  onClick={handleAddRamadan}
                  className="px-6 py-3 bg-white text-emerald-950 font-black rounded-2xl shadow-xl transition active:scale-95 uppercase text-[10px] flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" /> Tambah Agenda
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {ramadan.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4 text-left group hover:border-emerald-500 transition-colors relative">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition">{item.icon}</div>
                <div className="space-y-1 text-left">
                  <h4 className="font-black text-lg text-slate-800 text-left">{item.title}</h4>
                  <p className="text-xs font-black text-emerald-600 font-mono text-left">{item.time}</p>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed text-left">{item.description}</p>
                
                {isAdmin && (
                  <div className="flex gap-2 mt-4 pt-2 border-t border-slate-100">
                    <button onClick={() => handleEditRamadan(item)} className="p-2 bg-slate-100 text-slate-600 hover:text-emerald-600 rounded-xl flex-1 text-[10px] font-black uppercase">EDIT</button>
                    <button onClick={() => deleteRamadan(item.id)} className="p-2 bg-slate-100 text-slate-600 hover:text-rose-600 rounded-xl flex-1 text-[10px] font-black uppercase">HAPUS</button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-emerald-900 rounded-3xl p-8 border border-emerald-800 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-5 text-left">
              <div className="p-4 bg-emerald-950 rounded-2xl border border-emerald-800 animate-pulse">
                <Star className="h-8 w-8 text-amber-400" />
              </div>
              <div className="text-left">
                <h4 className="text-xl font-black uppercase tracking-tight text-left">Infaq Takjil Ramadan</h4>
                <p className="text-emerald-300/80 text-xs">Donasikan Rp 25.000 / paket berkah buka puasa jamaah.</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('donasi')}
              className="px-8 py-3 bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black rounded-2xl shadow-xl transition active:scale-95 uppercase text-xs"
            >
              Donasi Sekarang
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'slider' && isAdmin && slides && (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl animate-fade-in text-left">
          <SliderManager 
            slides={slides} 
            onAddLog={onAddLog}
          />
        </div>
      )}

      {/* Enhanced Admin Modals Section */}
      {editingKajian && (
        <div className="fixed inset-0 z-50 bg-emerald-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl flex flex-col space-y-6 text-left border border-indigo-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-800">Manajemen Jadwal Kajian</h4>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Alur Dakwah Digital</p>
              </div>
              <button 
                onClick={() => setEditingKajian(null)} 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Judul / Tema Kajian</label>
                <input 
                  type="text" 
                  value={kajianForm.title} 
                  onChange={e => setKajianForm({...kajianForm, title: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 transition"
                  placeholder="e.g. Fiqih Shalahul Lail"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Pemateri / Ustadz</label>
                <input 
                  type="text" 
                  value={kajianForm.lecturer} 
                  onChange={e => setKajianForm({...kajianForm, lecturer: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 transition"
                  placeholder="e.g. KH. Abdurrahman bin Auf"
                />
              </div>
              <div className="space-y-1 col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hari / Frekuensi</label>
                <input 
                  type="text" 
                  value={kajianForm.day} 
                  onChange={e => setKajianForm({...kajianForm, day: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 outline-none focus:border-indigo-500 transition"
                  placeholder="e.g. Setiap Senin"
                />
              </div>
              <div className="space-y-1 col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu (Jam)</label>
                <input 
                  type="text" 
                  value={kajianForm.time} 
                  onChange={e => setKajianForm({...kajianForm, time: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 outline-none focus:border-indigo-500 transition"
                  placeholder="e.g. 19:30"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Jadwal</label>
                <select 
                  value={kajianForm.category}
                  onChange={e => setKajianForm({...kajianForm, category: e.target.value as any})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-indigo-500 transition"
                >
                  <option value="Ba'da Subuh">Ba'da Subuh</option>
                  <option value="Ba'da Maghrib">Ba'da Maghrib</option>
                  <option value="Rutin">Rutin (Pagi/Siang)</option>
                  <option value="Khusus">Tabligh Akbar / Khusus</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
            </div>
            <button 
              onClick={saveKajian}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] transition shadow-xl shadow-indigo-200 active:scale-95"
            >
              Simpan Jadwal Kajian
            </button>
          </div>
        </div>
      )}

      {selectedKajianDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] max-w-sm w-full p-8 shadow-2xl flex flex-col space-y-6 text-left border border-slate-100">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
               <h4 className="text-lg font-black text-slate-800">Detail Kajian</h4>
               <button onClick={() => setSelectedKajianDetail(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                 <X className="h-5 w-5" />
               </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <p className="text-[10px] uppercase font-black text-emerald-700 tracking-wider">Topik/Tema</p>
                <h4 className="text-md font-black text-emerald-950">{selectedKajianDetail.title}</h4>
                <p className="text-xs font-semibold text-emerald-800/80 mt-1">{selectedKajianDetail.theme}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                   <p className="text-slate-400 font-bold uppercase tracking-wider">Pemateri</p>
                   <p className="font-bold text-slate-800">{selectedKajianDetail.lecturer}</p>
                </div>
                <div className="space-y-1">
                   <p className="text-slate-400 font-bold uppercase tracking-wider">Hari & Waktu</p>
                   <p className="font-bold text-slate-800">{selectedKajianDetail.day}, {selectedKajianDetail.time} WITA</p>
                </div>
              </div>
            </div>

            <button onClick={() => setSelectedKajianDetail(null)} className="w-full py-3 bg-slate-900 text-white font-black rounded-xl text-xs hover:bg-slate-800 transition">
              Tutup
            </button>
          </div>
        </div>
      )}

      {editingJumat && (
        <div className="fixed inset-0 z-50 bg-emerald-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl flex flex-col space-y-6 text-left border border-emerald-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-800">Agenda Petugas Jumat</h4>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Manajemen Ibadah Mingguan</p>
              </div>
              <button 
                onClick={() => setEditingJumat(null)} 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Khatib</label>
                <input 
                  type="text" 
                  value={jumatForm.khatib} 
                  onChange={e => setJumatForm({...jumatForm, khatib: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Imam</label>
                <input 
                  type="text" 
                  value={jumatForm.imam} 
                  onChange={e => setJumatForm({...jumatForm, imam: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Muazin</label>
                <input 
                  type="text" 
                  value={jumatForm.muazin} 
                  onChange={e => setJumatForm({...jumatForm, muazin: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 transition"
                />
              </div>
              <div className="space-y-1 col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</label>
                <input 
                  type="text" 
                  value={jumatForm.date} 
                  onChange={e => setJumatForm({...jumatForm, date: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 outline-none focus:border-emerald-500 transition"
                  placeholder="e.g. 15 Juni"
                />
              </div>
              <div className="space-y-1 col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Header Bulan</label>
                <input 
                  type="text" 
                  value={jumatForm.month} 
                  onChange={e => setJumatForm({...jumatForm, month: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 outline-none focus:border-emerald-500 transition"
                  placeholder="e.g. Juni 2026"
                />
              </div>
            </div>
            <button 
              onClick={saveJumat}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] transition shadow-xl shadow-emerald-200 active:scale-95"
            >
              Simpan Jadwal Jumat
            </button>
          </div>
        </div>
      )}

      {activeSubTab === 'log' && isAdmin && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-150 shadow-sm animate-fade-in space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6 text-left">
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-display text-slate-800 tracking-tight">Log Aktivitas Sistem</h3>
              <p className="text-slate-500 text-xs">Riwayat lengkap notifikasi dan perubahan sistem penyiaran digital.</p>
            </div>
            <button 
              onClick={onClearLogs}
              className="px-6 py-2.5 bg-rose-50 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-rose-600 hover:text-white transition flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" /> Bersihkan Seluruh Log
            </button>
          </div>

          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <History className="h-12 w-12 mx-auto opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">Belum ada riwayat aktivitas</p>
              </div>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id} 
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-start gap-4 hover:bg-white hover:border-emerald-200 transition group relative text-left"
                >
                  <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center text-lg ${
                    log.type === 'success' ? 'bg-emerald-50 text-emerald-600 font-bold' :
                    log.type === 'alert' ? 'bg-rose-50 text-rose-600' :
                    'bg-slate-100 text-slate-400'
                  }`}>
                    {log.type === 'success' ? '✓' : log.type === 'alert' ? '!' : '•'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-bold text-xs text-slate-900 uppercase tracking-tight">{log.title}</h4>
                      <span className="text-[10px] font-mono text-slate-400">{log.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{log.message}</p>
                  </div>
                  <button 
                    onClick={() => onDeleteLog(log.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {editingRamadan && (
        <div className="fixed inset-0 z-50 bg-emerald-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl flex flex-col space-y-6 text-left border border-emerald-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <h4 className="text-xl font-black text-slate-800">Agenda Ramadan</h4>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Detail Kegiatan Masjid</p>
              </div>
              <button 
                onClick={() => setEditingRamadan(null)} 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nama Kegiatan</label>
                <input 
                  type="text" 
                  value={ramadanForm.title} 
                  onChange={e => setRamadanForm({...ramadanForm, title: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500 transition"
                  placeholder="e.g. Tarawih Berjamaah"
                />
              </div>
              <div className="space-y-1 col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Waktu / Jam</label>
                <input 
                  type="text" 
                  value={ramadanForm.time} 
                  onChange={e => setRamadanForm({...ramadanForm, time: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-black text-slate-800 font-mono outline-none focus:border-emerald-500 transition"
                  placeholder="e.g. 19:30"
                />
              </div>
              <div className="space-y-1 col-span-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ikon / Emoji</label>
                <input 
                  type="text" 
                  value={ramadanForm.icon} 
                  onChange={e => setRamadanForm({...ramadanForm, icon: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xl text-center outline-none focus:border-emerald-500 transition"
                  placeholder="🌙"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deskripsi Ringkas</label>
                <textarea 
                  rows={3}
                  value={ramadanForm.description} 
                  onChange={e => setRamadanForm({...ramadanForm, description: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600 outline-none focus:border-emerald-500 transition resize-none"
                  placeholder="Jelaskan detail singkat kegiatan..."
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori</label>
                <div className="flex gap-2">
                  {(['Ibadah', 'Sosial', 'Edukasi'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setRamadanForm({...ramadanForm, category: cat})}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition border ${
                        ramadanForm.category === cat 
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' 
                          : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button 
              onClick={saveRamadan}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] transition shadow-xl shadow-emerald-200 active:scale-95"
            >
              Simpan Agenda Ramadan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
