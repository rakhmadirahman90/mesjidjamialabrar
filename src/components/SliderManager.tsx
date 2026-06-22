import { useState, useRef } from 'react';
import { SlideItem } from '../types';
import { 
  Trash2, 
  Edit2, 
  Image as ImageIcon, 
  Save, 
  X,
  PlusCircle,
  Upload,
  Loader2
} from 'lucide-react';
import { compressImage } from '../lib/imageCompression';

interface SliderManagerProps {
  slides: SlideItem[];
  onUpdateSlides: (slides: SlideItem[]) => void;
  onAddLog: (title: string, msg: string, type: any) => void;
}

export default function SliderManager({ slides, onUpdateSlides, onAddLog }: SliderManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SlideItem>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = (slide: SlideItem) => {
    setEditingId(slide.id);
    setEditForm(slide);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Hanya file gambar yang diperbolehkan!');
      return;
    }

    try {
      setIsCompressing(true);
      const compressedDataUrl = await compressImage(file);
      setEditForm(prev => ({ ...prev, imageUrl: compressedDataUrl }));
    } catch (err) {
      console.error(err);
      alert('Gagal memproses gambar. Silakan coba lagi.');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (!editForm.title || !editForm.imageUrl) {
      alert('Judul dan Gambar wajib diisi!');
      return;
    }

    let updatedSlides: SlideItem[];
    if (isAdding) {
      const newSlide: SlideItem = {
        ...editForm,
        id: Date.now().toString(),
      } as SlideItem;
      updatedSlides = [...slides, newSlide];
      onAddLog('Slider Ditambah', `Konten slider baru "${editForm.title}" telah dipublikasikan.`, 'success');
    } else {
      updatedSlides = slides.map(s => s.id === editingId ? { ...s, ...editForm } as SlideItem : s);
      onAddLog('Slider Diperbarui', `Konten slider "${editForm.title}" telah diperbarui.`, 'info');
    }

    onUpdateSlides(updatedSlides);
    localStorage.setItem('abrar_mosque_slides', JSON.stringify(updatedSlides));
    setEditingId(null);
    setEditForm({});
    setIsAdding(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Hapus slide "${title}"?`)) {
      const updatedSlides = slides.filter(s => s.id !== id);
      onUpdateSlides(updatedSlides);
      localStorage.setItem('abrar_mosque_slides', JSON.stringify(updatedSlides));
      onAddLog('Slider Dihapus', `Konten slider "${title}" telah dihapus.`, 'alert');
    }
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditForm({
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      badge: 'Info Terbaru',
      badgeColor: 'bg-emerald-500/20 text-emerald-350 border border-emerald-500/30',
      actionText: 'Lihat Selengkapnya',
      actionTab: 'beranda',
      badgeIcon: 'Info',
      accentColor: 'text-emerald-400',
      detailedStory: {
        heading: '',
        paragraphs: [''],
        quickSpecs: [{ label: '', value: '' }]
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-800">Manajemen Konten Slider (Hero)</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Atur visual utama beranda masjid</p>
        </div>
        {!isAdding && !editingId && (
          <button 
            onClick={handleAddNew}
            className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-black flex items-center gap-2 shadow-lg shadow-emerald-200"
          >
            <PlusCircle className="h-4 w-4" />
            Tambah Slide
          </button>
        )}
      </div>

      {(isAdding || editingId) ? (
        <div className="bg-white border-2 border-emerald-100 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-scale-up">
          <div className="flex items-center justify-between border-b pb-4">
            <h4 className="font-black text-slate-800 flex items-center gap-2">
              {isAdding ? <PlusCircle className="text-emerald-600" /> : <Edit2 className="text-emerald-600" />}
              {isAdding ? 'Tambah Konten Slider Baru' : 'Edit Konten Slider'}
            </h4>
            <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="text-slate-400 hover:text-slate-600"><X /></button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Judul Utama Slide</label>
                <input 
                  type="text" 
                  value={editForm.title} 
                  onChange={e => setEditForm({...editForm, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Contoh: Kubah Emas & Arsitektur Megah"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Sub-judul / Tagline</label>
                <input 
                  type="text" 
                  value={editForm.subtitle} 
                  onChange={e => setEditForm({...editForm, subtitle: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="MASJID JAMI AL ABRAR • PAREPARE"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Deskripsi Singkat</label>
                <textarea 
                  value={editForm.description} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none h-24"
                  placeholder="Jelaskan secara singkat daya tarik slide ini..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Visual Slide (Upload Gambar)</label>
                <div className="flex flex-col gap-3">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-full h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                      editForm.imageUrl 
                        ? 'border-emerald-200 bg-emerald-50/50' 
                        : 'border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    {isCompressing ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase">Mengompresi Gambar...</span>
                      </div>
                    ) : editForm.imageUrl ? (
                      <div className="relative w-full h-full p-2 group">
                        <img src={editForm.imageUrl} className="w-full h-full object-cover rounded-xl shadow-md" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition rounded-xl flex items-center justify-center">
                          <Upload className="h-8 w-8 text-white" />
                          <span className="ml-2 text-white text-xs font-black">GANTI GAMBAR</span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="h-10 w-10 text-slate-300 mb-2" />
                        <span className="text-[10px] font-black text-slate-400 uppercase">Klik untuk Pilih Gambar</span>
                        <span className="text-[8px] text-slate-400 mt-1">High Compression Active</span>
                      </>
                    )}
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    accept="image/*"
                  />
                  <p className="text-[8px] text-slate-400 italic">
                    * Gambar akan secara otomatis dikompresi untuk kinerja maksimal tanpa mengurangi kualitas visual yang signifikan.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Teks Tombol Aksi</label>
                  <input 
                    type="text" 
                    value={editForm.actionText} 
                    onChange={e => setEditForm({...editForm, actionText: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Tujuan Tab Navigasi</label>
                  <select 
                    value={editForm.actionTab} 
                    onChange={e => setEditForm({...editForm, actionTab: e.target.value as any})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="beranda">Beranda</option>
                    <option value="profil">Profil</option>
                    <option value="donasi">Donasi</option>
                    <option value="keuangan">Keuangan</option>
                    <option value="inventaris">Inventaris</option>
                    <option value="jamaah">Jamaah</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Ikon Badge</label>
                  <select 
                    value={editForm.badgeIcon} 
                    onChange={e => setEditForm({...editForm, badgeIcon: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Info">Info (Standard)</option>
                    <option value="Compass">Compass (Sejarah)</option>
                    <option value="Tv">TV (Laporan)</option>
                    <option value="BookOpen">Book (Kajian)</option>
                    <option value="Sparkles">Sparkles (Event)</option>
                    <option value="Calendar">Calendar (Waktu)</option>
                    <option value="Layout">Layout (Dashboard)</option>
                  </select>
                </div>
                <div>
                   <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 tracking-widest">Warna Aksen</label>
                   <select 
                    value={editForm.accentColor} 
                    onChange={e => setEditForm({...editForm, accentColor: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="text-emerald-400">Emerald (Hijau)</option>
                    <option value="text-amber-300">Amber (Kuning)</option>
                    <option value="text-cyan-400">Cyan (Biru Muda)</option>
                    <option value="text-pink-300">Pink (Sosial)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t font-black">
            <button 
              onClick={() => { setIsAdding(false); setEditingId(null); }}
              className="px-6 py-3 bg-slate-100 text-slate-600 rounded-2xl text-xs hover:bg-slate-200 transition"
            >
              Batal
            </button>
            <button 
              onClick={handleSave}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-xs flex items-center gap-2 shadow-xl hover:bg-black transition"
            >
              <Save className="h-4 w-4" />
              Simpan Konten Slider
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map(slide => (
            <div key={slide.id} className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition group">
              <div className="h-40 w-full relative">
                <img src={slide.imageUrl} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${slide.badgeColor}`}>
                    {slide.badge}
                  </span>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <h5 className="font-black text-slate-800 text-sm line-clamp-1">{slide.title}</h5>
                <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{slide.description}</p>
                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tab: {slide.actionTab}</span>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleStartEdit(slide)}
                      className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-emerald-50 text-emerald-600 transition"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(slide.id, slide.title)}
                      className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-rose-50 text-rose-600 transition"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {slides.length === 0 && (
            <div className="col-span-full py-12 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
               <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
               <p className="text-slate-500 text-xs font-bold">Belum ada slide. Silakan tambah slide baru.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
