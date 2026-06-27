import { useState, useRef, useEffect } from 'react';
import { SlideItem } from '../types';
import { 
  Trash2, 
  Edit2, 
  Image as ImageIcon, 
  Save, 
  PlusCircle,
  Upload,
  Loader2,
  Eye,
  X
} from 'lucide-react';
import { motion } from 'motion/react';
import { compressImage } from '../lib/imageCompression';
import { addDocument, updateDocument, deleteDocument } from '../lib/db';

interface SliderManagerProps {
  slides: SlideItem[];
  onAddLog: (title: string, msg: string, type: any) => void;
  initialEditId?: string | null;
  onClearInitialEditId?: () => void;
}

export default function SliderManager({ slides, onAddLog, initialEditId, onClearInitialEditId }: SliderManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SlideItem>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [previewSlide, setPreviewSlide] = useState<SlideItem | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialEditId && slides.length > 0) {
      const slideToEdit = slides.find(s => s.id === initialEditId);
      if (slideToEdit) {
        handleStartEdit(slideToEdit);
        if (onClearInitialEditId) onClearInitialEditId();
      }
    }
  }, [initialEditId, slides]);

  const handleStartEdit = (slide: SlideItem) => {
    setEditingId(slide.id);
    setEditForm(slide);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onAddLog('Format File Salah', 'Hanya file gambar (JPG, PNG, WebP) yang diperbolehkan!', 'alert');
      return;
    }

    try {
      setIsCompressing(true);
      const compressedDataUrl = await compressImage(file);
      setEditForm(prev => ({ ...prev, imageUrl: compressedDataUrl }));
    } catch (err) {
      console.error(err);
      onAddLog('Gagal Memproses', 'Terjadi kesalahan saat mengompresi gambar. Silakan coba lagi.', 'alert');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    if (!editForm.title || !editForm.imageUrl) {
      onAddLog('Data Kurang', 'Judul dan Gambar visual wajib diisi untuk menyimpan slide!', 'alert');
      return;
    }

    const { id: _, ...dataToSave } = editForm;

    if (isAdding) {
      const newSlide = {
        ...dataToSave,
        order: slides.length + 1,
        isActive: true
      };
      addDocument('slides', newSlide);
      onAddLog('Slider Ditambah', `Konten slider baru "${editForm.title}" telah dipublikasikan.`, 'success');
    } else {
      if (editingId) {
         const slideToUpdate = slides.find(s => s.id === editingId);
         if (slideToUpdate && slideToUpdate.id) {
                       const { id: _, ...dataToSave } = editForm;
            updateDocument('slides', (slideToUpdate as any).id, dataToSave);
           onAddLog('Slider Diperbarui', `Konten slider "${editForm.title}" telah diperbarui.`, 'info');
         }
      }
    }

    setEditingId(null);
    setEditForm({});
    setIsAdding(false);
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`Hapus slide "${title}"? Tindakan ini tidak dapat dibatalkan.`)) {
      const slideToDelete = slides.find(s => s.id === id);
      if (slideToDelete && slideToDelete.id) {
        deleteDocument('slides', slideToDelete.id);
        onAddLog('Slider Dihapus', `Konten slider "${title}" telah dihapus secara permanen.`, 'alert');
      }
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
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h4 className="text-2xl font-black text-white tracking-tight uppercase font-display">Slider Media Hub</h4>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em]">Management of mosque information banners</p>
        </div>
        {!isAdding && !editingId && (
          <button 
            onClick={handleAddNew}
            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-3 shadow-xl shadow-emerald-950/40 hover:bg-emerald-500 transition-all active:scale-95 uppercase tracking-widest"
          >
            <PlusCircle className="h-5 w-5" />
            Tambah Slide Baru
          </button>
        )}
      </div>

      {(editingId || isAdding) ? (
        <div className="bg-primary-900/20 border border-primary-800/50 rounded-[3rem] p-8 lg:p-12 shadow-2xl animate-fade-in space-y-10 border-t-emerald-500/20">
          <div className="flex items-center gap-4 border-b border-primary-800/50 pb-8">
             <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
               {isAdding ? <PlusCircle className="w-7 h-7" /> : <Edit2 className="w-7 h-7" />}
             </div>
             <div>
               <h3 className="text-xl font-black text-white uppercase tracking-tight">{isAdding ? 'Konfigurasi Slide Baru' : 'Edit Konten Slide'}</h3>
               <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Lengkapi parameter visual dan informasi</p>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
            <div className="space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Judul Utama Slide</label>
                  <input 
                    type="text" 
                    value={editForm.title} 
                    onChange={e => setEditForm({...editForm, title: e.target.value})}
                    className="w-full bg-primary-950/50 border border-primary-800/50 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700"
                    placeholder="Contoh: Kubah Emas & Arsitektur Megah"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Sub-judul / Tagline</label>
                  <input 
                    type="text" 
                    value={editForm.subtitle} 
                    onChange={e => setEditForm({...editForm, subtitle: e.target.value})}
                    className="w-full bg-primary-950/50 border border-primary-800/50 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700"
                    placeholder="MASJID JAMI AL ABRAR • PAREPARE"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Deskripsi Singkat</label>
                  <textarea 
                    value={editForm.description} 
                    onChange={e => setEditForm({...editForm, description: e.target.value})}
                    className="w-full bg-primary-950/50 border border-primary-800/50 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all placeholder:text-slate-700 h-32 resize-none"
                    placeholder="Jelaskan secara singkat daya tarik slide ini..."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest text-left">Visual Slide (Upload Gambar)</label>
                <div className="flex flex-col gap-4">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative w-full aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-500 ${
                      editForm.imageUrl 
                        ? 'border-emerald-500/50 bg-emerald-500/5' 
                        : 'border-primary-800/50 bg-primary-950/30 hover:border-emerald-500/50 hover:bg-emerald-500/5'
                    }`}
                  >
                    {isCompressing ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Processing Image...</span>
                      </div>
                    ) : editForm.imageUrl ? (
                      <div className="relative w-full h-full p-3 group">
                        <img src={editForm.imageUrl} className="w-full h-full object-cover rounded-2xl shadow-2xl" />
                        <div className="absolute inset-0 bg-primary-950/60 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                          <div className="flex flex-col items-center gap-3">
                            <Upload className="h-10 w-10 text-white" />
                            <span className="text-white text-[10px] font-black uppercase tracking-[0.2em]">Change Artwork</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-primary-900/50 rounded-full flex items-center justify-center mb-4 text-slate-600">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select High-Res Image</span>
                        <span className="text-[8px] text-slate-600 mt-2 font-bold uppercase tracking-widest">Auto-Compression Enabled</span>
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
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest text-left">Label Tombol Aksi</label>
                  <input 
                    type="text" 
                    value={editForm.actionText} 
                    onChange={e => setEditForm({...editForm, actionText: e.target.value})}
                    className="w-full bg-primary-950/50 border border-primary-800/50 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    placeholder="Pelajari"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest text-left">Navigasi Tab</label>
                  <select 
                    value={editForm.actionTab} 
                    onChange={e => setEditForm({...editForm, actionTab: e.target.value as any})}
                    className="w-full bg-primary-950/50 border border-primary-800/50 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
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

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest text-left">Visual Badge Ikon</label>
                  <select 
                    value={editForm.badgeIcon} 
                    onChange={e => setEditForm({...editForm, badgeIcon: e.target.value})}
                    className="w-full bg-primary-950/50 border border-primary-800/50 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
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
                  <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest text-left">Tema Warna Aksen</label>
                  <select 
                    value={editForm.accentColor} 
                    onChange={e => setEditForm({...editForm, accentColor: e.target.value})}
                    className="w-full bg-primary-950/50 border border-primary-800/50 rounded-2xl px-6 py-4 text-sm text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none"
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

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-10 border-t border-primary-800/50">
                <button 
                  onClick={() => { setPreviewSlide({...editForm, id: editingId || 'preview'} as any); }}
                  className="px-8 py-5 bg-primary-800/30 text-emerald-400 rounded-[2rem] text-xs font-black hover:bg-emerald-500/10 transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Live Preview
                </button>
                <button 
                  onClick={() => { setIsAdding(false); setEditingId(null); }}
                  className="px-10 py-5 bg-primary-900/50 text-slate-400 rounded-[2rem] text-xs font-black hover:bg-primary-800 hover:text-white transition-all uppercase tracking-[0.2em]"
                >
                  Cancel Operation
                </button>
                <button 
                  onClick={handleSave}
                  className="px-12 py-5 bg-emerald-600 text-white rounded-[2rem] text-xs font-black flex items-center justify-center gap-3 shadow-2xl shadow-emerald-950/40 hover:bg-emerald-500 transition-all active:scale-95 uppercase tracking-[0.2em]"
                >
                  <Save className="h-5 w-5" />
                  Publish Slider Data
                </button>
              </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {slides.map(slide => (
            <div key={slide.id} className="group relative bg-primary-950/30 border border-primary-800/50 rounded-[2.5rem] overflow-hidden shadow-xl transition-all duration-700 hover:border-emerald-500/30 hover:bg-primary-950/50 hover:-translate-y-2">
              <div className="aspect-video w-full relative overflow-hidden text-left">
                <img 
                  src={slide.imageUrl} 
                  className="w-full h-full object-cover transition duration-1000 group-hover:scale-110" 
                  alt={slide.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/20 to-transparent opacity-80" />
                
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-black/40 backdrop-blur-md border border-white/10 ${slide.badgeColor || 'text-emerald-400'}`}>
                    {slide.badge || 'Slide Info'}
                  </span>
                </div>

                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                  <button 
                    onClick={() => setPreviewSlide(slide)}
                    className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl flex items-center justify-center hover:bg-emerald-500 hover:border-emerald-400 transition-all shadow-xl"
                    title="Preview Slide"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleStartEdit(slide)}
                    className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl flex items-center justify-center hover:bg-amber-500 hover:border-amber-400 transition-all shadow-xl"
                    title="Edit Slide"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(slide.id, slide.title)}
                    className="w-10 h-10 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl flex items-center justify-center hover:bg-rose-600 hover:border-rose-500 transition-all shadow-xl"
                    title="Delete Slide"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="p-8 space-y-4 text-left">
                <div className="space-y-1">
                  <h5 className="font-black text-white text-lg tracking-tight line-clamp-1 uppercase font-display">{slide.title}</h5>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{slide.subtitle}</p>
                </div>
                
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-medium">
                  {slide.description || 'No description provided for this media asset.'}
                </p>
                
                <div className="pt-4 flex items-center justify-between border-t border-primary-800/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active: {slide.actionTab}</span>
                  </div>
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest bg-primary-900/50 px-2 py-1 rounded-lg">Order #{slide.order}</span>
                </div>
              </div>
            </div>
          ))}

          {slides.length === 0 && (
            <div className="col-span-full py-24 text-center bg-primary-950/20 rounded-[4rem] border-2 border-dashed border-primary-800/30 flex flex-col items-center gap-6">
               <div className="w-20 h-20 bg-primary-900/50 rounded-[2rem] flex items-center justify-center text-slate-700">
                 <ImageIcon className="h-10 w-10" />
               </div>
               <div className="space-y-2">
                 <h5 className="text-xl font-black text-slate-600 uppercase tracking-tight">Empty Media Gallery</h5>
                 <p className="text-xs text-slate-700 font-bold uppercase tracking-widest">Start by adding your first promotional banner</p>
               </div>
               <button 
                 onClick={handleAddNew}
                 className="mt-4 px-10 py-5 bg-primary-900/50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-primary-800/50 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 transition-all"
               >
                 Add First Slide
               </button>
            </div>
          )}
        </div>
      )}

      {/* Slide Preview Modal */}
      {previewSlide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-12">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-primary-950/95 backdrop-blur-2xl" 
            onClick={() => setPreviewSlide(null)}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-5xl aspect-video rounded-[3rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.9)] border border-white/10"
          >
            <img 
              src={previewSlide.imageUrl} 
              className="w-full h-full object-cover" 
              alt="Preview"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary-950/90 via-primary-950/20 to-transparent" />
            
            <div className="absolute inset-0 flex flex-col justify-end p-8 lg:p-16 text-left">
              <div className="max-w-2xl space-y-6">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center gap-3"
                >
                  <div className={`px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.25em] ${previewSlide.accentColor || 'text-emerald-400'}`}>
                    {previewSlide.badge || 'Banner Preview'}
                  </div>
                </motion.div>
                
                <div className="space-y-3">
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl lg:text-6xl font-black text-white tracking-tighter uppercase font-display leading-[0.9]"
                  >
                    {previewSlide.title}
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-sm lg:text-xl font-bold text-slate-400 uppercase tracking-widest"
                  >
                    {previewSlide.subtitle}
                  </motion.p>
                </div>

                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-slate-400/80 text-xs lg:text-base max-w-lg leading-relaxed font-medium"
                >
                  {previewSlide.description}
                </motion.p>

                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 }}
                  className="pt-4"
                >
                  <button className="px-10 py-4 bg-white text-primary-950 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl">
                    {previewSlide.actionText}
                  </button>
                </motion.div>
              </div>
            </div>

            <button 
              onClick={() => setPreviewSlide(null)}
              className="absolute top-8 right-8 w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-2xl flex items-center justify-center hover:bg-rose-600 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
