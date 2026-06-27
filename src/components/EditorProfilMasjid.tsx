import { useState } from 'react';
import { Save, History, Target, Info, HelpCircle, Plus, Trash2 } from 'lucide-react';
import { upsertDocument } from '../lib/db';

interface EditorProfilMasjidProps {
  mosqueSettings: any;
  onAddLog: (title: string, msg: string, type: 'info' | 'success' | 'alert' | 'system') => void;
}

export default function EditorProfilMasjid({ mosqueSettings, onAddLog }: EditorProfilMasjidProps) {
  const [formData, setFormData] = useState({
    history: mosqueSettings?.history || 'Masjid Jami Al Abrar didirikan pertama kali pada tahun 1961...',
    vision: mosqueSettings?.vision || 'Terwujudnya Masjid Al Abrar sebagai pusat ibadah yang suci, makmur, mandiri...',
    mision: mosqueSettings?.mision || [
      'Menyelenggarakan kegiatan ibadah fardhu 5 waktu...',
      'Meningkatkan pembinaan aqidah, ibadah, dan akhlak...'
    ],
    faqs: mosqueSettings?.faqs || [
      { q: "Bagaimana cara berdonasi secara digital?", a: "Anda dapat masuk ke menu 'Donasi Digital'..." }
    ]
  });

  const handleSave = async () => {
    try {
      await upsertDocument('settings', 'config', formData);
      onAddLog('Profil Diperbarui', 'Data Sejarah, Visi, Misi, dan FAQ berhasil disimpan ke Cloud.', 'success');
    } catch (error) {
      onAddLog('Gagal Menyimpan', 'Terjadi kesalahan saat menyimpan data profil.', 'alert');
    }
  };

  const updateMision = (index: number, value: string) => {
    const newMision = [...formData.mision];
    newMision[index] = value;
    setFormData({ ...formData, mision: newMision });
  };

  const addMision = () => {
    setFormData({ ...formData, mision: [...formData.mision, ''] });
  };

  const removeMision = (index: number) => {
    setFormData({ ...formData, mision: formData.mision.filter((_: any, i: number) => i !== index) });
  };

  const updateFaq = (index: number, field: 'q' | 'a', value: string) => {
    const newFaqs = [...formData.faqs];
    newFaqs[index][field] = value;
    setFormData({ ...formData, faqs: newFaqs });
  };

  const addFaq = () => {
    setFormData({ ...formData, faqs: [...formData.faqs, { q: '', a: '' }] });
  };

  const removeFaq = (index: number) => {
    setFormData({ ...formData, faqs: formData.faqs.filter((_: any, i: number) => i !== index) });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      <div className="flex items-center justify-between border-b border-primary-500/10 pb-4">
        <div>
          <h3 className="font-black text-sm uppercase text-white flex items-center gap-2">
            <Info className="h-4 w-4 text-primary-400" />
            Editor Konten Profil & Informasi
          </h3>
          <p className="text-[10px] text-slate-400 mt-1">Kelola data Sejarah, Visi, Misi, dan FAQ yang tampil di halaman landing.</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition active:scale-95 shadow-lg shadow-primary-900/40"
        >
          <Save className="h-3.5 w-3.5" />
          Simpan Perubahan
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sejarah */}
        <div className="bg-[#020b06]/60 border border-primary-500/10 p-5 rounded-2xl space-y-3">
          <label className="text-[10px] font-black text-accent-gold uppercase tracking-widest flex items-center gap-1.5">
            <History className="h-3.5 w-3.5" />
            Sejarah Singkat Masjid
          </label>
          <textarea
            value={formData.history}
            onChange={(e) => setFormData({ ...formData, history: e.target.value })}
            rows={8}
            className="w-full bg-[#010603] border border-primary-500/10 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-700 outline-none focus:border-primary-500/40 transition leading-relaxed"
            placeholder="Tuliskan sejarah lengkap masjid di sini..."
          />
        </div>

        {/* Visi */}
        <div className="bg-[#020b06]/60 border border-primary-500/10 p-5 rounded-2xl space-y-3">
          <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest flex items-center gap-1.5">
            <Target className="h-3.5 w-3.5" />
            Visi Utama Masjid
          </label>
          <textarea
            value={formData.vision}
            onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
            rows={8}
            className="w-full bg-[#010603] border border-primary-500/10 rounded-xl p-4 text-xs text-slate-200 placeholder-slate-700 outline-none focus:border-primary-500/40 transition leading-relaxed italic"
            placeholder="Tuliskan visi masjid..."
          />
        </div>

        {/* Misi */}
        <div className="bg-[#020b06]/60 border border-primary-500/10 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Misi Masjid (Daftar Poin)</label>
            <button onClick={addMision} className="text-[9px] font-black text-primary-400 hover:text-white transition uppercase flex items-center gap-1">
              <Plus className="h-3 w-3" /> Tambah Poin
            </button>
          </div>
          <div className="space-y-2">
            {formData.mision.map((m: string, i: number) => (
              <div key={i} className="flex gap-2">
                <input
                  value={m}
                  onChange={(e) => updateMision(i, e.target.value)}
                  className="flex-1 bg-[#010603] border border-primary-500/10 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-primary-500/40 transition"
                  placeholder={`Misi ke-${i + 1}`}
                />
                <button onClick={() => removeMision(i)} className="p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-xl transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-[#020b06]/60 border border-primary-500/10 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-accent-gold uppercase tracking-widest flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5" />
              Tanya Jawab (FAQ)
            </label>
            <button onClick={addFaq} className="text-[9px] font-black text-primary-400 hover:text-white transition uppercase flex items-center gap-1">
              <Plus className="h-3 w-3" /> Tambah FAQ
            </button>
          </div>
          <div className="space-y-4 overflow-y-auto max-h-[300px] pr-2 no-scrollbar">
            {formData.faqs.map((faq: any, i: number) => (
              <div key={i} className="bg-[#010603] border border-primary-500/5 rounded-2xl p-4 space-y-3 relative group">
                <button onClick={() => removeFaq(i)} className="absolute top-2 right-2 p-1.5 text-rose-500 opacity-0 group-hover:opacity-100 transition">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <input
                  value={faq.q}
                  onChange={(e) => updateFaq(i, 'q', e.target.value)}
                  className="w-full bg-transparent border-b border-primary-500/10 pb-1 text-xs font-bold text-white outline-none focus:border-primary-400 transition"
                  placeholder="Pertanyaan..."
                />
                <textarea
                  value={faq.a}
                  onChange={(e) => updateFaq(i, 'a', e.target.value)}
                  className="w-full bg-transparent text-[11px] text-slate-400 outline-none focus:text-slate-200 transition"
                  rows={2}
                  placeholder="Jawaban..."
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
