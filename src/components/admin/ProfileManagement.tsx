import React, { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { MosqueProfile, AktivitasItem } from '@/src/types';
import { Save, Loader2, Plus, Trash2, Sliders, Play, Volume2, Youtube, Radio, FileText, Globe, Upload, Image as ImageIcon, Sparkles, Clock, Users, ArrowRight } from 'lucide-react';
import { LocalDb, HomeSlider, LivestreamConfig, AudioConfig } from '@/src/lib/localStorageDb';

// Multi-tier high compression image resizer to avoid large storage weights
const compressImage = (file: File, maxWidth = 1024, maxHeight = 768, quality = 0.55): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // high compression jpeg format output
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function ProfileManagement() {
  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'sliders' | 'livestream' | 'audio' | 'activities'>('profile');
  
  // States
  const [profile, setProfile] = useState<MosqueProfile>(LocalDb.getProfile());
  const [sliders, setSliders] = useState<HomeSlider[]>(LocalDb.getSliders());
  const [livestream, setLivestream] = useState<LivestreamConfig>(LocalDb.getLivestream());
  const [audioConfig, setAudioConfig] = useState<AudioConfig>(LocalDb.getAudioConfig());
  const [activities, setActivities] = useState<AktivitasItem[]>(LocalDb.getActivities());
  
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [compressing, setCompressing] = useState<number | null>(null); // tracks activity_id under compression

  useEffect(() => {
    // Sync initially
    setProfile(LocalDb.getProfile());
    setSliders(LocalDb.getSliders());
    setLivestream(LocalDb.getLivestream());
    setAudioConfig(LocalDb.getAudioConfig());
    setActivities(LocalDb.getActivities());
  }, []);

  const showStatus = (type: 'success' | 'error', msg: string) => {
    setStatus({ type, msg });
    setTimeout(() => {
      setStatus(null);
    }, 4000);
  };

  // --- Profile handlers ---
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      LocalDb.saveProfile(profile);
      showStatus('success', 'Profil Masjid Jami Al Abrar sukses diperbarui!');
    } catch (e: any) {
      showStatus('error', e.message || 'Gagal menyimpan profil');
    } finally {
      setSaving(false);
    }
  };

  const handleMissionChange = (index: number, value: string) => {
    const newMission = [...profile.mission];
    newMission[index] = value;
    setProfile({ ...profile, mission: newMission });
  };

  const addMission = () => {
    setProfile({ ...profile, mission: [...profile.mission, ''] });
  };

  const removeMission = (index: number) => {
    setProfile({ ...profile, mission: profile.mission.filter((_, i) => i !== index) });
  };

  // --- Sliders handlers ---
  const handleAddSlider = () => {
    const newSlider: HomeSlider = {
      id: Date.now(),
      image: "https://images.unsplash.com/photo-1590075865003-e48277adc558?auto=format&fit=crop&q=80&w=1600&h=600",
      title: "Slide Banner Baru",
      description: "Deskripsi singkat banner"
    };
    const updated = [...sliders, newSlider];
    setSliders(updated);
    LocalDb.saveSliders(updated);
    showStatus('success', 'Slide banner baru berhasil ditambahkan!');
  };

  const handleUpdateSlider = (id: number, field: keyof HomeSlider, value: string) => {
    const updated = sliders.map(s => {
      if (s.id === id) {
        return { ...s, [field]: value };
      }
      return s;
    });
    setSliders(updated);
    LocalDb.saveSliders(updated);
  };

  const handleRemoveSlider = (id: number) => {
    const updated = sliders.filter(s => s.id !== id);
    setSliders(updated);
    LocalDb.saveSliders(updated);
    showStatus('success', 'Slide banner berhasil dihapus!');
  };

  // --- Livestream handlers ---
  const handleLivestreamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      LocalDb.saveLivestream(livestream);
      showStatus('success', 'Konfigurasi Livestreaming YouTube sukses disimpan!');
    } catch (e: any) {
      showStatus('error', 'Gagal menyimpan konfigurasi livestream');
    } finally {
      setSaving(false);
    }
  };

  // --- Audio / Adzan notifications handlers ---
  const handleAudioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      LocalDb.saveAudioConfig(audioConfig);
      showStatus('success', 'Jadwal Audio Pengeras Suara Adzan berhasil dikonfigurasi!');
    } catch (e: any) {
      showStatus('error', 'Gagal memperbarui konfigurasi audio');
    } finally {
      setSaving(false);
    }
  };

  // --- Activities handlers ---
  const handleAddActivity = () => {
    const newAct: AktivitasItem = {
      id: Date.now(),
      title: "Kajian Rutin Baru Al-Abrar",
      subtitle: "Keterangan program kegiatan",
      description: "Menyelenggarakan kegiatan syiar Islam berkala di Masjid Jami Al Abrar untuk mempererat ukhuwah islamiyah.",
      schedule: "Setiap Malam Sabtu",
      beneficiary: "Seluruh Jamaah Masjid Jami Al Abrar",
      badge: "Keagamaan",
      iconName: "sparkles",
      image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800",
      colorGradient: "from-amber-50 to-orange-50/50",
      iconColor: "text-amber-700 bg-amber-100",
      borderColor: "border-amber-100"
    };
    const updated = [newAct, ...activities];
    setActivities(updated);
    LocalDb.saveActivities(updated);
    showStatus('success', 'Kegiatan baru berhasil ditambahkan!');
  };

  const handleUpdateActivity = (id: number, field: keyof AktivitasItem, value: any) => {
    const updated = activities.map(act => {
      if (act.id === id) {
        return { ...act, [field]: value };
      }
      return act;
    });
    setActivities(updated);
    LocalDb.saveActivities(updated);
  };

  const handleDeleteActivity = (id: number) => {
    if (!confirm("Hapus kegiatan & dokumentasi ini?")) return;
    const updated = activities.filter(act => act.id !== id);
    setActivities(updated);
    LocalDb.saveActivities(updated);
    showStatus('success', 'Kegiatan berhasil dihapus!');
  };

  const triggerFileUpload = async (id: number, file: File) => {
    if (!file) return;
    setCompressing(id);
    try {
      // Extremely high-compression: max dimensions 900x600, quality 0.52
      const compressedDataUrl = await compressImage(file, 900, 600, 0.52);
      handleUpdateActivity(id, 'image', compressedDataUrl);
      showStatus('success', 'Foto dokumentasi berhasil dikompresi (tingkat tinggi) & diunggah!');
    } catch (e) {
      showStatus('error', 'Gagal memproses gambar');
    } finally {
      setCompressing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-100 pb-4">
        {[
          { id: 'profile', name: 'Identitas Masjid', icon: Globe },
          { id: 'sliders', name: 'Banner Promo (Sliders)', icon: Sliders },
          { id: 'activities', name: 'Dokumentasi Kegiatan', icon: FileText },
          { id: 'livestream', name: 'YouTube Livestream', icon: Youtube },
          { id: 'audio', name: 'Pengeras Adzan & Audio', icon: Radio },
        ].map(sub => (
          <button
            key={sub.id}
            onClick={() => setActiveSubTab(sub.id as any)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all border ${
              activeSubTab === sub.id 
                ? "bg-forest border-forest text-white" 
                : "bg-white border-gray-200 text-gray-500 hover:text-forest"
            }`}
          >
            <sub.icon className="h-4 w-4" />
            {sub.name}
          </button>
        ))}
        
        {status && (
          <div className={`ml-auto px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
            status.type === 'success' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'
          }`}>
            {status.msg}
          </div>
        )}
      </div>

      {activeSubTab === 'profile' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 animate-in fade-in">
          <div className="mb-6">
            <h4 className="text-lg font-bold text-forest">Profil Masjid Jami Al Abrar</h4>
            <p className="text-xs text-gray-500">Edit data alamat, kapasitas, visi, misi, dan kontak masjid secara lengkap</p>
          </div>
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nama Masjid</label>
                <input 
                  type="text" 
                  value={profile.name} 
                  onChange={e => setProfile({...profile, name: e.target.value})}
                  className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-forest transition-all font-medium text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kapasitas Jamaah</label>
                <input 
                  type="number" 
                  value={profile.capacity} 
                  onChange={e => setProfile({...profile, capacity: parseInt(e.target.value) || 0})}
                  className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-forest transition-all font-medium text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tahun Berdiri</label>
                <input 
                  type="number" 
                  value={profile.established_year} 
                  onChange={e => setProfile({...profile, established_year: parseInt(e.target.value) || 0})}
                  className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-forest transition-all font-medium text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Kontak</label>
                <input 
                  type="email" 
                  value={profile.email} 
                  onChange={e => setProfile({...profile, email: e.target.value})}
                  className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-forest transition-all font-medium text-sm"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Alamat Lengkap</label>
                <input 
                  type="text" 
                  value={profile.address} 
                  onChange={e => setProfile({...profile, address: e.target.value})}
                  className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-forest transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sejarah Singkat</label>
              <textarea 
                rows={3}
                value={profile.history} 
                onChange={e => setProfile({...profile, history: e.target.value})}
                className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-forest transition-all font-medium text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Visi Masjid</label>
              <textarea 
                rows={2}
                value={profile.vision} 
                onChange={e => setProfile({...profile, vision: e.target.value})}
                className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-forest transition-all font-medium text-xs leading-relaxed"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Misi Masjid</label>
                <button 
                  type="button" 
                  onClick={addMission}
                  className="text-xs font-bold text-forest flex items-center gap-1 hover:underline px-2 py-1 rounded bg-forest/5"
                >
                  <Plus className="h-3 w-3" /> Tambah Misi
                </button>
              </div>
              <div className="space-y-2">
                {profile.mission.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <input 
                      type="text" 
                      value={m} 
                      onChange={e => handleMissionChange(i, e.target.value)}
                      className="flex-1 p-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-forest transition-all text-xs"
                      placeholder={`Misi ke-${i+1}`}
                    />
                    <button 
                      type="button" 
                      onClick={() => removeMission(i)}
                      className="p-3 text-red-400 hover:text-red-600 transition-colors bg-red-50 hover:bg-red-100 rounded-xl"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="w-full py-4 bg-forest text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all text-sm"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Identitas Masjid Jami Al Abrar
            </button>
          </form>
        </div>
      )}

      {activeSubTab === 'sliders' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 animate-in fade-in space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-50">
            <div>
              <h4 className="text-lg font-bold text-forest">Banner Promo Karosel (Sliders)</h4>
              <p className="text-xs text-gray-500">Sesuaikan beberapa poster, judul, dan sub-teks di bagian paling atas beranda</p>
            </div>
            <button
              onClick={handleAddSlider}
              className="px-4 py-2.5 bg-forest text-white rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-forest/90"
            >
              <Plus className="h-4 w-4" /> Tambah Slide Banner
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sliders.map((slide, index) => (
              <div key={slide.id} className="bg-gray-50/50 rounded-2xl p-5 border border-gray-100 relative group space-y-4">
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => handleRemoveSlider(slide.id)}
                    className="p-2.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition-colors shadow-sm"
                    title="Hapus Slide Banner"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="h-32 w-full bg-gray-200 rounded-xl overflow-hidden shadow-inner flex items-center justify-center relative">
                  <img 
                    src={slide.image} 
                    alt={slide.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    onError={(e) => {
                      (e.target as any).src = "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=600";
                    }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-[9px] text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">
                    Slide #{index + 1}
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Judul Utama</label>
                    <input 
                      type="text"
                      value={slide.title}
                      onChange={e => handleUpdateSlider(slide.id, 'title', e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:border-forest text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">Deskripsi / Terjemahan</label>
                    <textarea 
                      rows={2}
                      value={slide.description}
                      onChange={e => handleUpdateSlider(slide.id, 'description', e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:border-forest text-xs leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">URL Gambar (Unsplash/Direct Link)</label>
                    <input 
                      type="text"
                      value={slide.image}
                      onChange={e => handleUpdateSlider(slide.id, 'image', e.target.value)}
                      className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:border-forest text-xs font-mono text-gray-600 truncate"
                    />
                  </div>
                </div>
              </div>
            ))}

            {sliders.length === 0 && (
              <div className="col-span-2 text-center p-12 py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <Sliders className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-400">Belum ada slide banner poster</p>
                <button
                  onClick={handleAddSlider}
                  className="mt-3 px-4 py-2 bg-forest text-white rounded-xl text-xs font-bold"
                >
                  Tambah Banner Pertama
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'activities' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 animate-in fade-in space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-gray-100">
            <div>
              <h4 className="text-lg font-bold text-forest">Galeri Dokumentasi & Kegiatan Masjid</h4>
              <p className="text-xs text-gray-500">Kelola daftar program layanan publik, lengkap dengan dokumentasi foto berkompresi tinggi</p>
            </div>
            <button
              onClick={handleAddActivity}
              className="px-4 py-2.5 bg-forest text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-forest/90 active:scale-95 transition-all"
            >
              <Plus className="h-4 w-4" /> Tambah Kegiatan
            </button>
          </div>

          <div className="space-y-8">
            {activities.map((act, index) => (
              <div key={act.id} className="bg-gray-50/60 rounded-3xl p-6 md:p-8 border border-gray-100 relative space-y-6">
                <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                  <span className="text-[10px] bg-forest/10 text-forest border border-forest/20 font-bold px-2.5 py-1 rounded-lg">
                    Kegiatan #{index + 1}
                  </span>
                  <button
                    onClick={() => handleDeleteActivity(act.id)}
                    className="p-2.5 bg-red-50 text-red-600 hover:bg-red-105 rounded-xl transition-all shadow-sm border border-red-200/20"
                    title="Hapus Kegiatan"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4">
                  {/* Form fields */}
                  <div className="md:col-span-8 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Judul Utama</label>
                        <input 
                          type="text"
                          value={act.title}
                          onChange={e => handleUpdateActivity(act.id, 'title', e.target.value)}
                          className="w-full p-3.5 rounded-xl bg-white border border-gray-200 focus:border-forest text-xs font-bold text-gray-800"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Sub-Judul</label>
                        <input 
                          type="text"
                          value={act.subtitle}
                          onChange={e => handleUpdateActivity(act.id, 'subtitle', e.target.value)}
                          className="w-full p-3.5 rounded-xl bg-white border border-gray-200 focus:border-forest text-xs font-semibold text-amber-700"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Pilih Kategori (Badge)</label>
                        <select
                          value={act.badge}
                          onChange={e => handleUpdateActivity(act.id, 'badge', e.target.value)}
                          className="w-full p-3.5 rounded-xl bg-white border border-gray-200 focus:border-forest text-xs font-bold text-gray-700"
                        >
                          <option value="Pendidikan">Pendidikan</option>
                          <option value="Sosial & Layanan">Sosial & Layanan</option>
                          <option value="Keagamaan">Keagamaan</option>
                          <option value="Dakwah & Kajian">Dakwah & Kajian</option>
                          <option value="Pemberdayaan Akhwat">Pemberdayaan Akhwat</option>
                          <option value="Lainnya">Lainnya</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Waktu / Jadwal</label>
                        <input 
                          type="text"
                          value={act.schedule}
                          onChange={e => handleUpdateActivity(act.id, 'schedule', e.target.value)}
                          className="w-full p-3.5 rounded-xl bg-white border border-gray-200 focus:border-forest text-xs font-bold text-gray-700"
                          placeholder="e.g. Setiap Senin Sore"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Sasaran Penerima Manfaat</label>
                        <input 
                          type="text"
                          value={act.beneficiary}
                          onChange={e => handleUpdateActivity(act.id, 'beneficiary', e.target.value)}
                          className="w-full p-3.5 rounded-xl bg-white border border-gray-200 focus:border-forest text-xs font-bold text-gray-700"
                          placeholder="e.g. Kaum Muslimin / Dhuafa"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Ikon Representasi</label>
                        <select
                          value={act.iconName || "sparkles"}
                          onChange={e => {
                            const val = e.target.value;
                            let details = {
                              iconName: val,
                              iconColor: "text-forest bg-cream",
                              borderColor: "border-forest/20",
                              colorGradient: "from-cream to-cream/20"
                            };

                            if (val === 'book') {
                              details.iconColor = "text-emerald-700 bg-emerald-100";
                              details.borderColor = "border-emerald-100";
                              details.colorGradient = "from-emerald-50 to-teal-50/50";
                            } else if (val === 'coffee') {
                              details.iconColor = "text-amber-700 bg-amber-100";
                              details.borderColor = "border-amber-100";
                              details.colorGradient = "from-amber-50 to-orange-50/50";
                            } else if (val === 'home') {
                              details.iconColor = "text-sky-700 bg-sky-100";
                              details.borderColor = "border-sky-100";
                              details.colorGradient = "from-sky-50 to-blue-50/50";
                            } else if (val === 'users') {
                              details.iconColor = "text-rose-700 bg-rose-100 w-12 h-12";
                              details.borderColor = "border-rose-100";
                              details.colorGradient = "from-rose-50 to-red-50/40";
                            } else if (val === 'heart') {
                              details.iconColor = "text-purple-700 bg-purple-100";
                              details.borderColor = "border-purple-100";
                              details.colorGradient = "from-purple-50 to-fuchsia-50/40";
                            } else if (val === 'zap') {
                              details.iconColor = "text-amber-600 bg-amber-50";
                              details.borderColor = "border-amber-150";
                              details.colorGradient = "from-amber-50/50 to-yellow-50/30";
                            } else if (val === 'award') {
                              details.iconColor = "text-teal-700 bg-teal-100";
                              details.borderColor = "border-teal-100";
                              details.colorGradient = "from-teal-50 to-emerald-50/40";
                            }

                            // Batch apply styles
                            handleUpdateActivity(act.id, 'iconName', val);
                            handleUpdateActivity(act.id, 'iconColor', details.iconColor);
                            handleUpdateActivity(act.id, 'borderColor', details.borderColor);
                            handleUpdateActivity(act.id, 'colorGradient', details.colorGradient);
                          }}
                          className="w-full p-3.5 rounded-xl bg-white border border-gray-200 focus:border-forest text-xs font-bold text-gray-700"
                        >
                          <option value="sparkles">✨ Sparkles (Menarik)</option>
                          <option value="book">📚 Book (Pendidikan / TPA)</option>
                          <option value="coffee">☕ Coffee (Musafir / Tamu)</option>
                          <option value="home">🏠 Home (Ibadah / Penginapan)</option>
                          <option value="users">👥 Users (Kajian / Sosial)</option>
                          <option value="heart">💖 Heart (Keluarga / Akhwat)</option>
                          <option value="zap">⚡ Zap (Layanan Aktif / Cepat)</option>
                          <option value="award">🏆 Award (Prestasi / Berizin)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Atau Masukkan URL Gambar Manual</label>
                        <input 
                          type="text"
                          value={act.image || ""}
                          onChange={e => handleUpdateActivity(act.id, 'image', e.target.value)}
                          className="w-full p-3.5 rounded-xl bg-white border border-gray-200 focus:border-forest text-xs font-mono text-gray-500 truncate"
                          placeholder="https://..."
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider">Penjelasan Lengkap Kegiatan</label>
                      <textarea 
                        rows={3}
                        value={act.description}
                        onChange={e => handleUpdateActivity(act.id, 'description', e.target.value)}
                        className="w-full p-3.5 rounded-xl bg-white border border-gray-200 focus:border-forest text-xs leading-relaxed"
                        placeholder="Deskripsikan secara detail program dakwah atau pelayanan sosial yang diselenggarakan ini..."
                      />
                    </div>
                  </div>

                  {/* Foto dokumentasi uploader (highly compressed) */}
                  <div className="md:col-span-4 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider text-center md:text-left">Foto Dokumentasi</span>
                      <div className="relative group border-2 border-dashed border-gray-200 hover:border-forest rounded-3xl p-3 bg-white flex flex-col items-center justify-center text-center overflow-hidden min-h-48 transition-all shadow-inner">
                        {act.image ? (
                          <div className="absolute inset-0 w-full h-full z-0">
                            <img 
                              src={act.image} 
                              alt={act.title} 
                              className="w-full h-full object-cover rounded-2xl group-hover:blur-sm transition-all"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex flex-col items-center justify-center text-white p-4">
                              <Upload className="h-6 w-6 text-gold mb-1 animate-bounce" />
                              <span className="text-[10px] font-bold uppercase tracking-wider">Seret atau Klik untuk Ganti</span>
                            </div>
                          </div>
                        ) : null}

                        {/* Uploader instructions */}
                        <div className={`z-10 ${act.image ? 'opacity-0 group-hover:opacity-100 pointer-events-none' : ''} transition-opacity flex flex-col items-center p-4`}>
                          <div className="w-12 h-12 bg-forest/5 text-forest rounded-2xl flex items-center justify-center mb-3 border border-forest/15">
                            <ImageIcon className="h-6 w-6" />
                          </div>
                          <span className="text-[11px] font-bold text-gray-700">Pilih Foto Dokumentasi</span>
                          <span className="text-[9px] text-gray-400 leading-normal mt-1.5 px-2">Format JPEG/PNG. Kompresi otomatis tingkat tinggi diaktifkan.</span>
                        </div>

                        {/* Compression Overlay spinner */}
                        {compressing === act.id && (
                          <div className="absolute inset-0 bg-forest/90 z-20 backdrop-blur-sm flex flex-col items-center justify-center text-white text-center p-4">
                            <Loader2 className="h-8 w-8 text-gold animate-spin mb-2" />
                            <span className="text-xs font-bold uppercase tracking-wider text-gold">Kompresi Gambar</span>
                            <span className="text-[9px] text-cream/85 mt-2">Mengecilkan bobot piksel demi menghemat beban penyimpanan...</span>
                          </div>
                        )}

                        {/* File input covers entire card */}
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) triggerFileUpload(act.id, file);
                          }}
                          className="absolute inset-0 cursor-pointer opacity-0 z-30" 
                        />
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-105 p-4 rounded-2xl text-[10px] text-amber-800 leading-normal font-medium flex items-start gap-2.5 shadow-sm">
                      <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block uppercase tracking-wider text-amber-900 mb-0.5">ℹ️ Kompresor Al-Abrar</span>
                        Setiap foto yang diunggah akan otomatis dikompres ke resolusi optimal 900x600 dengan kualitas visual tinggi serta ukuran berkas rendah (rata-rata &lt; 90KB) agar performa website hemat kuota 24 jam.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {activities.length === 0 && (
              <div className="text-center p-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-gray-400">Belum ada daftar program kegiatan</p>
                <button
                  onClick={handleAddActivity}
                  className="mt-3 px-4 py-2 bg-forest text-white rounded-xl text-xs font-bold"
                >
                  Tambah Kegiatan Pertama
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'livestream' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 animate-in fade-in space-y-6">
          <div>
            <h4 className="text-lg font-bold text-forest">Pengaturan YouTube Livestream</h4>
            <p className="text-xs text-gray-500">Ubah URL streaming aktif dan perubahannya akan langsung tersinkron di Beranda</p>
          </div>

          <form onSubmit={handleLivestreamSubmit} className="space-y-4 max-w-2xl">
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-450 uppercase tracking-widest">Status Tampilkan di Beranda</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={livestream.isActive} 
                    onChange={() => setLivestream({ ...livestream, isActive: true })}
                    className="text-forest focus:ring-forest"
                  />
                  Tampilkan Panel Live
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-600 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={!livestream.isActive} 
                    onChange={() => setLivestream({ ...livestream, isActive: false })}
                    className="text-forest focus:ring-forest"
                  />
                  Sembunyikan Panel Live
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Judul Live Video</label>
              <input 
                type="text" 
                value={livestream.title} 
                onChange={e => setLivestream({...livestream, title: e.target.value})}
                placeholder="Contoh: Kajian Fiqih Maghrib Live Al-Abrar"
                className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-forest transition-all font-medium text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">YouTube Video ID atau Channel ID</label>
              <input 
                type="text" 
                value={livestream.videoId} 
                onChange={e => setLivestream({...livestream, videoId: e.target.value})}
                placeholder="Id video (contoh: K-R-nQ0K-OQ)"
                className="w-full p-4 rounded-2xl bg-gray-50 border-transparent focus:bg-white focus:border-forest transition-all font-medium font-mono text-sm"
              />
              <p className="text-[10px] text-gray-400">Video ID dapat diambil dari parameter "v" di URL Youtube, misal: `youtube.com/watch?v=K-R-nQ0K-OQ`</p>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="px-6 py-4 bg-forest text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-95 text-sm"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Setelan YouTube Livestream
            </button>
          </form>
        </div>
      )}

      {activeSubTab === 'audio' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 animate-in fade-in space-y-6">
          <div>
            <h4 className="text-lg font-bold text-forest">Pengontrol Jadwal Adzan & Audio Masjid</h4>
            <p className="text-xs text-gray-500">Konfigurasi file instrumen Murottal di T-15 menit, Tarhim di T-10 menit, dan adzan di T-0 menit</p>
          </div>

          <form onSubmit={handleAudioSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-105/50 space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider">📿 Audio Murottal (T-15)</span>
                  <span className="text-[9px] bg-gold/20 text-forest font-bold px-2 py-0.5 rounded-full">Quran MP3</span>
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-extrabold text-gray-400 uppercase">URL File MP3</label>
                  <input 
                    type="text" 
                    value={audioConfig.quranUrl} 
                    onChange={e => setAudioConfig({...audioConfig, quranUrl: e.target.value})}
                    className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:border-forest text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold text-gray-400">
                    <span>VOLUME AUDIO</span>
                    <span>{Math.round(audioConfig.quranVolume * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.05"
                    value={audioConfig.quranVolume} 
                    onChange={e => setAudioConfig({...audioConfig, quranVolume: parseFloat(e.target.value)})}
                    className="w-full accent-forest"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-105/50 space-y-3">
                <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider">🎵 Shalawat Tarhim (T-10)</span>
                  <span className="text-[9px] bg-amber-500/10 text-amber-600 font-bold px-2 py-0.5 rounded-full">Lagu Masjid</span>
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-extrabold text-gray-400">URL File MP3</label>
                  <input 
                    type="text" 
                    value={audioConfig.songUrl} 
                    onChange={e => setAudioConfig({...audioConfig, songUrl: e.target.value})}
                    className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:border-forest text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold text-gray-400">
                    <span>VOLUME AUDIO</span>
                    <span>{Math.round(audioConfig.songVolume * 100)}%</span>
                  </div>
                  <input 
                    type="range" min="0" max="1" step="0.05"
                    value={audioConfig.songVolume} 
                    onChange={e => setAudioConfig({...audioConfig, songVolume: parseFloat(e.target.value)})}
                    className="w-full accent-forest"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-105/50 space-y-3 md:col-span-2">
                <div className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                  <span className="text-xs font-bold text-forest uppercase tracking-wider">🕋 Rekaman Suara Adzan Jami (T-0)</span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded-full">Adzan MP3</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-[9px] font-extrabold text-gray-400">URL File MP3</label>
                    <input 
                      type="text" 
                      value={audioConfig.azanUrl} 
                      onChange={e => setAudioConfig({...audioConfig, azanUrl: e.target.value})}
                      className="w-full p-3 rounded-xl bg-white border border-gray-200 focus:border-forest text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] font-bold text-gray-400 mt-2">
                      <span>VOLUME AUDIO</span>
                      <span>{Math.round(audioConfig.azanVolume * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.05"
                      value={audioConfig.azanVolume} 
                      onChange={e => setAudioConfig({...audioConfig, azanVolume: parseFloat(e.target.value)})}
                      className="w-full accent-forest"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 text-amber-700 p-4 border border-amber-200 rounded-2xl text-xs space-y-1.5 leading-relaxed">
              <p className="font-bold">💡 Informasi Sinkronisasi Adzan:</p>
              <p>Adzan & audio ini akan diputar otomatis pada browser yang membuka halaman utama Masjid Jami Al-Abrar sesuai waktu shalat lokal. Pastikan URL MP3 di atas valid dan berakhiran berkas `.mp3`.</p>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="px-6 py-4 bg-forest text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-95 text-sm"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Setelan Audio & Pengeras Suara
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
