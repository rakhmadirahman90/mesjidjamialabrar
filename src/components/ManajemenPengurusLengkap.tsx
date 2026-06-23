import React, { useState } from 'react';
import { DetailedBoardMember } from '../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  Edit2, 
  X, 
  Save, 
  UploadCloud, 
  FolderMinus
} from 'lucide-react';
import { addDocument, updateDocument, deleteDocument } from '../lib/db';
import { compressImage } from '../lib/imageCompression';

interface ManajemenPengurusLengkapProps {
  detailedBoard: DetailedBoardMember[];
  onAddLog: (title: string, message: string, type: 'info' | 'success' | 'alert' | 'system') => void;
}

export default function ManajemenPengurusLengkap({ detailedBoard, onAddLog }: ManajemenPengurusLengkapProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  // Form states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<DetailedBoardMember>>({});
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<Partial<DetailedBoardMember>>({
    name: '',
    role: '',
    category: 'idarah',
    sectionName: '',
    imageUrl: '',
    phone: ''
  });
  const [isCompressing, setIsCompressing] = useState(false);

  // Filter categories
  const categoriesMap = [
    { label: 'Semua Bidang', key: 'all' },
    { label: 'Dewan Penasehat', key: 'penasehat' },
    { label: 'Harian / Inti', key: 'inti' },
    { label: 'Idarah (Admin & Dana)', key: 'idarah' },
    { label: 'Imarah (Ibadah & Majelis)', key: 'imarah' },
    { label: 'Riayah (Aset & Umum)', key: 'riayah' }
  ];

  const filteredMembers = (detailedBoard || []).filter(m => {
    if (!m) return false;
    const matchesSearch = 
      (m.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
      (m.role || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
      ((m.sectionName || '').toLowerCase().includes((searchTerm || '').toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || m.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleStartEdit = (m: DetailedBoardMember) => {
    setEditingId(m.id || null);
    setEditForm(m);
  };

  const handleSaveEdit = async () => {
    if (!editForm.id) return;
    if (!editForm.name || !editForm.role) {
      onAddLog('Gagal Menyimpan', 'Nama dan peranan wajib diisi lengkap.', 'alert');
      return;
    }

    try {
      await updateDocument('mosque_detailed_board', editForm.id, editForm);
      onAddLog('Pengurus Diperbarui', `Informasi pengurus "${editForm.name}" berhasil disimpan.`, 'success');
      setEditingId(null);
      setEditForm({});
    } catch {
      onAddLog('Gagal Terhubung', 'Gagal memperbarui data pengurus di server.', 'alert');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name || !addForm.role) {
      onAddLog('Gagal Menambah', 'Nama dan peranan wajib diisi lengkap.', 'alert');
      return;
    }

    try {
      await addDocument('mosque_detailed_board', {
        name: addForm.name,
        role: addForm.role,
        category: addForm.category || 'idarah',
        sectionName: addForm.sectionName || 'Struktur Pelaksana',
        imageUrl: addForm.imageUrl || '',
        phone: addForm.phone || ''
      });

      onAddLog('Pengurus Ditambahkan', `Pengurus baru atas nama "${addForm.name}" berhasil terdaftar.`, 'success');
      
      // Reset
      setAddForm({
        name: '',
        role: '',
        category: 'idarah',
        sectionName: '',
        imageUrl: '',
        phone: ''
      });
      setIsAdding(false);
    } catch {
      onAddLog('Gagal Terhubung', 'Gagal menambahkan pengurus ke database.', 'alert');
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (window.confirm(`Hapus pengurus "${name}" dari jajaran komite lengkap?`)) {
      try {
        await deleteDocument('mosque_detailed_board', id);
        onAddLog('Pengurus Dihapus', `Data pengurus "${name}" dicabut dari database.`, 'alert');
      } catch {
        onAddLog('Gagal Menghapus', 'Gagal menghapus pengurus dari database.', 'alert');
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'edit' | 'add') => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onAddLog('Format Gagal', 'Hanya gambar yang diizinkan.', 'alert');
      return;
    }

    try {
      setIsCompressing(true);
      const url = await compressImage(file);
      if (type === 'edit') {
        setEditForm(prev => ({ ...prev, imageUrl: url }));
      } else {
        setAddForm(prev => ({ ...prev, imageUrl: url }));
      }
      onAddLog('Pemberitahuan Gambar', 'Foto profil berhasil diproses & dikompresi.', 'success');
    } catch {
      onAddLog('Kompresi Gagal', 'Gagal mengubah ukuran foto profil.', 'alert');
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-4 text-left">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="text-left">
          <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Users className="h-4 w-4 text-emerald-500" /> Manajemen Penyelenggara Lengkap
          </h4>
          <span className="text-[10px] text-slate-400">Total terdaftar: <strong>{detailedBoard.length}</strong> orang pengurus</span>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5 transition ml-auto border border-emerald-500/20 shadow-lg"
        >
          {isAdding ? <X className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
          {isAdding ? 'Tutup Formulir' : 'Tambah Pengurus'}
        </button>
      </div>

      {/* Adding Member Form */}
      {isAdding && (
        <form onSubmit={handleAddMember} className="bg-slate-900/60 p-4 rounded-xl border border-emerald-500/10 space-y-3 animate-slide-in">
          <span className="block text-[10px] font-black uppercase text-amber-400">● Registrasi Anggota Pengurus Baru</span>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Nama Lengkap</label>
              <input 
                type="text"
                required
                value={addForm.name}
                onChange={e => setAddForm({...addForm, name: e.target.value})}
                placeholder="Nama & Gelar pengurus..."
                className="w-full text-xs p-2.5 rounded-lg bg-slate-950/80 border border-emerald-500/20 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Peranan / Jabatan</label>
                <input 
                  type="text"
                  required
                  value={addForm.role}
                  onChange={e => setAddForm({...addForm, role: e.target.value})}
                  placeholder="Contoh: Koordinator PHBI"
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-950/80 border border-emerald-500/20 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Telepon (Opsional)</label>
                <input 
                  type="text"
                  value={addForm.phone}
                  onChange={e => setAddForm({...addForm, phone: e.target.value})}
                  placeholder="0812-xxxx-xxxx"
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-950/80 border border-emerald-500/20 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Kategori Bidang</label>
                <select
                  value={addForm.category}
                  onChange={e => setAddForm({...addForm, category: e.target.value as any})}
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-950/80 border border-emerald-500/20 text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="penasehat">Dewan Penasehat</option>
                  <option value="inti">Harian / Inti</option>
                  <option value="idarah">Idarah (Admin & Dana)</option>
                  <option value="imarah">Imarah (Ibadah & TPA)</option>
                  <option value="riayah">Riayah (Aset & Umum)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase">Nama Sub-Seksi (Opsional)</label>
                <input 
                  type="text"
                  value={addForm.sectionName}
                  onChange={e => setAddForm({...addForm, sectionName: e.target.value})}
                  placeholder="Contoh: Seksi Hari Besar Islam"
                  className="w-full text-xs p-2.5 rounded-lg bg-slate-950/80 border border-emerald-500/20 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-400 uppercase">Foto Profil</label>
              <div className="flex items-center gap-3">
                <label className="p-2 bg-emerald-600/15 border border-emerald-500/30 rounded-xl cursor-pointer hover:bg-emerald-600/35 transition text-emerald-400 text-[10px] flex items-center gap-1">
                  <UploadCloud className="h-4 w-4" />
                  <span>Unggah Gambar ({isCompressing ? 'Proses...' : 'Pilih'})</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={e => handleImageUpload(e, 'add')} 
                  />
                </label>
                <input 
                  type="text"
                  placeholder="Atau tempel link URL foto..."
                  value={addForm.imageUrl}
                  onChange={e => setAddForm({...addForm, imageUrl: e.target.value})}
                  className="flex-1 text-[10px] p-2 bg-slate-950/80 border border-emerald-500/20 text-white rounded-lg"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2 bg-[#d97706] hover:bg-[#b45309] text-white font-black text-xs uppercase tracking-wider rounded-xl transition shadow"
            >
              Simpan Sebagai Pengurus
            </button>
          </div>
        </form>
      )}

      {/* Filter Category & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="flex items-center gap-2 bg-slate-950/40 border border-emerald-500/10 px-3 py-2 rounded-xl md:col-span-1">
          <Search className="h-4 w-4 text-emerald-500" />
          <input 
            type="text"
            placeholder="Cari pengurus..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-transparent text-white placeholder-slate-500 text-xs w-full focus:outline-none"
          />
        </div>

        <div className="flex gap-1 overflow-x-auto pb-1 md:col-span-2">
          {categoriesMap.map(cat => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-[10px] uppercase font-black whitespace-nowrap tracking-wide leading-none transition border ${
                activeCategory === cat.key 
                  ? 'bg-amber-500 border-amber-400 text-slate-950' 
                  : 'bg-emerald-950/30 border-emerald-500/10 text-emerald-400 hover:bg-emerald-900/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Structured Board Table/List */}
      <div className="bg-slate-950/50 border border-emerald-500/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-sans text-xs select-none">
            <thead>
              <tr className="bg-emerald-950/40 border-b border-emerald-500/10 text-emerald-400 text-[9px] uppercase font-bold">
                <th className="p-3 w-16 text-center">Profil</th>
                <th className="p-3">Identitas Pengurus</th>
                <th className="p-3">Bidang Tugas</th>
                <th className="p-3">Telepon</th>
                <th className="p-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-500/5">
              {filteredMembers.length > 0 ? (
                filteredMembers.map(m => {
                  const isEditing = editingId === m.id;
                  
                  return (
                    <tr key={m.id} className="hover:bg-emerald-950/10 transition">
                      {/* Avatar */}
                      <td className="p-3 text-center">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-emerald-500/15 inline-block bg-emerald-950/30 shadow-inner">
                          <img 
                            src={isEditing ? (editForm.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`) : (m.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}`)}
                            alt={m.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      </td>

                      {/* Info & Inputs */}
                      <td className="p-3 font-medium">
                        {isEditing ? (
                          <div className="space-y-1.5 p-1 bg-slate-900/30 rounded-lg">
                            <input 
                              type="text"
                              value={editForm.name || ''}
                              onChange={e => setEditForm({...editForm, name: e.target.value})}
                              className="w-full bg-slate-950 border border-emerald-500/20 text-white p-1 rounded font-bold text-xs"
                              placeholder="Nama & Gelar"
                            />
                            <div className="flex gap-2">
                              <label className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded cursor-pointer text-[9px] flex items-center gap-1 font-bold">
                                <UploadCloud className="h-3 w-3" /> Foto
                                <input 
                                  type="file" 
                                  accept="image/*" 
                                  className="hidden" 
                                  onChange={e => handleImageUpload(e, 'edit')} 
                                />
                              </label>
                              <input 
                                type="text"
                                value={editForm.imageUrl || ''}
                                onChange={e => setEditForm({...editForm, imageUrl: e.target.value})}
                                className="flex-1 bg-slate-950 border border-emerald-500/20 text-slate-400 p-1 rounded text-[9px] font-mono"
                                placeholder="Tautan Foto URL"
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="block font-black text-slate-200 text-sm leading-snug">{m.name}</span>
                            <span className="inline-block text-[9px] font-black text-emerald-400 uppercase tracking-widest font-mono mt-0.5">{m.role}</span>
                          </div>
                        )}
                      </td>

                      {/* Bidang/Category */}
                      <td className="p-3">
                        {isEditing ? (
                          <div className="space-y-1">
                            <select
                              value={editForm.category}
                              onChange={e => setEditForm({...editForm, category: e.target.value as any})}
                              className="w-full bg-slate-950 border border-emerald-500/20 text-white p-1 rounded text-xs"
                            >
                              <option value="penasehat">Dewan Penasehat</option>
                              <option value="inti">Harian / Inti</option>
                              <option value="idarah">Idarah (Admin & Dana)</option>
                              <option value="imarah">Imarah (Ibadah & TPA)</option>
                              <option value="riayah">Riayah (Aset & Umum)</option>
                            </select>
                            
                            <input 
                              type="text"
                              value={editForm.sectionName || ''}
                              onChange={e => setEditForm({...editForm, sectionName: e.target.value})}
                              className="w-full bg-slate-950 border border-emerald-500/20 text-white p-1 rounded text-[10px]"
                              placeholder="Nama Sub-Seksi"
                            />
                          </div>
                        ) : (
                          <div>
                            <span className="block font-extrabold text-amber-500 text-[10px] uppercase tracking-wide">
                              {categoriesMap.find(cat => cat.key === m.category)?.label || m.category}
                            </span>
                            {m.sectionName && (
                              <span className="block text-[10px] text-slate-400 mt-0.5">{m.sectionName}</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="p-3">
                        {isEditing ? (
                          <input 
                            type="text"
                            value={editForm.phone || ''}
                            onChange={e => setEditForm({...editForm, phone: e.target.value})}
                            className="w-full bg-slate-950 border border-emerald-500/20 text-white p-1 rounded font-mono text-xs"
                            placeholder="Telepon"
                          />
                        ) : (
                          <span className="font-mono text-slate-300 font-bold">{m.phone || '-'}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right">
                        {isEditing ? (
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={handleSaveEdit}
                              className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold uppercase text-[9px] flex items-center gap-1 transition"
                            >
                              <Save className="h-3 w-3" /> Simpan
                            </button>
                            <button
                              onClick={() => { setEditingId(null); setEditForm({}); }}
                              className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold uppercase text-[9px] flex items-center gap-1 transition"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => handleStartEdit(m)}
                              className="p-1.5 bg-[#d97706]/10 hover:bg-[#d97706]/20 text-[#fbbf24] border border-[#d97706]/20 rounded transition"
                              title="Sunting data"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteMember(m.id || '', m.name)}
                              className="p-1.5 bg-rose-950/20 hover:bg-rose-900/30 text-rose-400 border border-rose-500/20 rounded transition"
                              title="Hapus pengurus"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <FolderMinus className="h-8 w-8 mx-auto text-slate-600 mb-2" />
                    <span className="block font-bold text-slate-400 text-xs">Belum Ada Anggota Pengurus</span>
                    <span className="block text-[10px] text-slate-500 mt-1">Cari dengan keyword lain atau tambahkan pengurus baru.</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
