import React, { useState, useEffect } from 'react';
import { MosqueAsset } from '../types';
import { Package, PlusCircle, Search, Tag, ShieldCheck, Edit2, Trash2, Save, X, Image as IconImage, FileImage, UploadCloud, Eye } from 'lucide-react';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '../lib/db';
import { parseNumber } from '../lib/utils';

const CATEGORY_PRESETS: {[key: string]: string} = {
  'Alat Shalat': 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=600&q=80',
  'Sound System': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=600&q=80',
  'Elektronik & Pendingin': 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80',
  'Kebersihan': 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80',
  'Kitab Suci / Al-Quran': 'https://images.unsplash.com/photo-1609599006353-e629b1d500f3?auto=format&fit=crop&w=600&q=80',
  'Mebel & Lemari': 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'
};

export default function InventarisMasjid({ 
  isAdmin, 
  onAddLog, 
  onShowLogin 
}: { 
  isAdmin: boolean; 
  onAddLog: (title: string, msg: string, type: 'info' | 'success' | 'alert' | 'system') => void;
  onShowLogin: () => void;
}) {
  const [assets, setAssets] = useState<MosqueAsset[]>([]);

  useEffect(() => {
    const unsub = subscribeToCollection<MosqueAsset>('mosque_assets', (data) => {
      setAssets(data);
    }, 'name', 'asc');
    return () => unsub();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'Alat Shalat' | 'Sound System' | 'Elektronik & Pendingin' | 'Kebersihan' | 'Kitab Suci / Al-Quran' | 'Mebel & Lemari'>('all');

  // Input states for form
  const [inputName, setInputName] = useState('');
  const [inputCategory, setInputCategory] = useState<'Alat Shalat' | 'Sound System' | 'Elektronik & Pendingin' | 'Kebersihan' | 'Kitab Suci / Al-Quran' | 'Mebel & Lemari'>('Alat Shalat');
  const [inputQty, setInputQty] = useState('');
  const [inputUnit, setInputUnit] = useState('Unit');
  const [inputCondition, setInputCondition] = useState<'Sangat Baik' | 'Baik' | 'Rusak Ringan' | 'Rusak Berat'>('Sangat Baik');
  const [inputLocation, setInputLocation] = useState('');
  const [inputImageUrl, setInputImageUrl] = useState(CATEGORY_PRESETS['Alat Shalat']);

  // Auto preset preview recommendation
  useEffect(() => {
    if (!inputImageUrl || Object.values(CATEGORY_PRESETS).includes(inputImageUrl)) {
      setInputImageUrl(CATEGORY_PRESETS[inputCategory] || '');
    }
  }, [inputCategory]);

  // For full asset card/lightbox detail popups
  const [selectedAssetForView, setSelectedAssetForView] = useState<MosqueAsset | null>(null);

  // Editing state
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [editAssetForm, setEditAssetForm] = useState<Partial<MosqueAsset>>({});

  const handleAddAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      onShowLogin();
      return;
    }

    if (!inputName.trim()) {
      onAddLog('Gagal', 'Nama barang harus diisi!', 'alert');
      return;
    }

    const qtyVal = parseNumber(inputQty);
    if (isNaN(qtyVal) || qtyVal <= 0) {
      onAddLog('Gagal', 'Masukkan jumlah kuantitas barang yang valid!', 'alert');
      return;
    }

    if (!inputLocation.trim()) {
      onAddLog('Gagal', 'Lokasi penyimpanan barang harus diisi!', 'alert');
      return;
    }

    const newAsset = {
      name: inputName.trim(),
      category: inputCategory,
      quantity: qtyVal,
      unit: inputUnit.trim(),
      condition: inputCondition,
      location: inputLocation.trim(),
      registeredBy: 'Admin Al Abrar',
      imageUrl: inputImageUrl.trim() || CATEGORY_PRESETS[inputCategory] || ''
    };

    addDocument('mosque_assets', newAsset);

    // trigger system logs reporting
    onAddLog(
      `Inventaris Baru`,
      `Barang berhasil masuk daftar aset: "${inputName}" (${qtyVal} ${inputUnit}) dengan foto terlampir.`,
      'success'
    );

    // reset fields
    setInputName('');
    setInputQty('');
    setInputLocation('');
    setInputImageUrl(CATEGORY_PRESETS[inputCategory] || '');
  };

  const handleUpdateCondition = (id: string, nextCond: 'Sangat Baik' | 'Baik' | 'Rusak Ringan' | 'Rusak Berat') => {
    if (!isAdmin) {
      onShowLogin();
      return;
    }
    const asset = assets.find(a => a.id === id);
    if (asset && asset.id) {
       updateDocument('mosque_assets', asset.id, { condition: nextCond });
       onAddLog('Kandisi Aset Berubah', `Status inventaris barang "${asset.name}" diubah menjadi: "${nextCond}"`, 'success');
    }
  };

  const handleRemoveAsset = (id: string, name: string) => {
    if (!isAdmin) {
      onShowLogin();
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus barang "${name}" dari inventaris?`)) {
      const asset = assets.find(a => a.id === id);
      if (asset && asset.id) {
        deleteDocument('mosque_assets', asset.id);
        onAddLog('Aset Dihapus', `Barang "${name}" dikeluarkan dari inventaris masjid.`, 'success');
      }
    }
  };

  const startEditingAsset = (ast: MosqueAsset) => {
    setEditingAssetId(ast.id);
    setEditAssetForm(ast);
  };

  const saveEditAsset = () => {
    if (!editAssetForm.name || !editAssetForm.location) {
      onAddLog('Gagal', 'Nama dan Lokasi wajib diisi!', 'alert');
      return;
    }

    if (editingAssetId) {
       const existingAsset = assets.find(a => a.id === editingAssetId);
       if (existingAsset && existingAsset.id) {
         updateDocument('mosque_assets', existingAsset.id, editAssetForm);
         onAddLog('Data Aset Diubah', `Informasi inventaris "${editAssetForm.name}" telah diperbarui.`, 'success');
       }
    }

    setEditingAssetId(null);
    setEditAssetForm({});
  };

  // filter
  const filteredAssets = assets.filter(a => {
    const matchesCategory = selectedCategory === 'all' || a.category === selectedCategory;
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          a.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="inventory_assets_view">
      
      {/* Category Selection Filter & Search bar */}
      <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-700" /> Database Inventaris & Sarana Fisik
            </h3>
            <p className="text-slate-400 text-xs">Arsip barang inventaris Masjid Jami Al Abrar.</p>
          </div>

          <div className="relative w-full md:w-80">
            <span className="absolute left-3.5 top-3.5">
              <Search className="h-4 w-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Cari nama barang atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs p-3 pl-10 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-slate-400"
            />
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Quick Horizontal Tab Categories list */}
        <div className="flex flex-wrap gap-2">
          {['all', 'Alat Shalat', 'Elektronik & Pendingin', 'Sound System', 'Kitab Suci / Al-Quran', 'Mebel & Lemari', 'Kebersihan'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-50 border border-slate-150 text-slate-600 hover:border-slate-200'
              }`}
            >
              {cat === 'all' ? 'Semua Kategori' : cat}
            </button>
          ))}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Inventory Table List */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                    <th className="pb-3 w-16 text-center">Foto</th>
                    <th className="pb-3 w-44">Nama Barang (Aset)</th>
                    <th className="pb-3 w-32">Kategori</th>
                    <th className="pb-3 w-28">Kuantitas</th>
                    <th className="pb-3">Lokasi / Penolong</th>
                    <th className="pb-3 text-right">Kondisi / Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs text-left">
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map(ast => (
                      <tr key={ast.id} className="hover:bg-slate-50/50 transition">
                        {/* 1. Foto Column */}
                        <td className="py-3.5 text-center">
                          {ast.imageUrl ? (
                            <div 
                              onClick={() => setSelectedAssetForView(ast)}
                              className="relative w-12 h-12 rounded-xl overflow-hidden cursor-zoom-in border border-slate-150 inline-block group hover:scale-105 transition-all duration-300 shadow-sm"
                            >
                              <img 
                                src={ast.imageUrl} 
                                alt={ast.name} 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                                <Eye className="h-3 w-3 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div 
                              onClick={() => setSelectedAssetForView(ast)}
                              className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200 inline-flex cursor-zoom-in hover:bg-slate-200 transition duration-200"
                            >
                              <IconImage className="h-4 w-4" />
                            </div>
                          )}
                        </td>

                        {/* 2. Detail Data Columns */}
                        <td className="py-3.5">
                          {editingAssetId === ast.id ? (
                            <div className="space-y-1">
                              <input 
                                type="text"
                                value={editAssetForm.name || ''}
                                onChange={(e) => setEditAssetForm({...editAssetForm, name: e.target.value})}
                                className="w-full border rounded p-1 font-bold text-slate-800"
                                placeholder="Nama Barang"
                              />
                              <input 
                                type="text"
                                value={editAssetForm.imageUrl || ''}
                                onChange={(e) => setEditAssetForm({...editAssetForm, imageUrl: e.target.value})}
                                className="w-full border rounded p-1 text-[10px] text-slate-600 font-mono"
                                placeholder="URL Gambar / Base64"
                              />
                            </div>
                          ) : (
                            <>
                              <span className="block font-bold text-slate-800 leading-relaxed text-left">{ast.name}</span>
                              <span className="block text-[9px] text-slate-400 font-mono text-left">Kode ID: {ast.id}</span>
                            </>
                          )}
                        </td>
                        <td className="py-3.5">
                          {editingAssetId === ast.id ? (
                            <select
                              value={editAssetForm.category}
                              onChange={(e) => setEditAssetForm({...editAssetForm, category: e.target.value as any})}
                              className="w-full border rounded p-1"
                            >
                              <option value="Alat Shalat">Alat Shalat</option>
                              <option value="Sound System">Sound System</option>
                              <option value="Elektronik & Pendingin">Elektronik & Pendingin</option>
                              <option value="Kebersihan">Kebersihan</option>
                              <option value="Kitab Suci / Al-Quran">Kitab Suci / Al-Quran</option>
                              <option value="Mebel & Lemari">Mebel & Lemari</option>
                            </select>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded text-[10px] font-semibold">
                              <Tag className="h-2.5 w-2.5" /> {ast.category}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 font-bold font-mono text-slate-800">
                          {editingAssetId === ast.id ? (
                            <div className="flex gap-1">
                              <input 
                                type="number"
                                value={editAssetForm.quantity || 1}
                                onChange={(e) => setEditAssetForm({...editAssetForm, quantity: parseNumber(e.target.value)})}
                                className="w-12 border rounded p-1"
                              />
                              <input 
                                type="text"
                                value={editAssetForm.unit || ''}
                                onChange={(e) => setEditAssetForm({...editAssetForm, unit: e.target.value})}
                                className="w-12 border rounded p-1"
                              />
                            </div>
                          ) : (
                            <>{ast.quantity} {ast.unit}</>
                          )}
                        </td>
                        <td className="py-3.5">
                          {editingAssetId === ast.id ? (
                            <input 
                              type="text"
                              value={editAssetForm.location || ''}
                              onChange={(e) => setEditAssetForm({...editAssetForm, location: e.target.value})}
                              className="w-full border rounded p-1"
                            />
                          ) : (
                            <>
                              <span className="block font-medium text-slate-705 text-left">{ast.location}</span>
                              <span className="block text-[9px] text-slate-400 text-left">Dicatat: {ast.registeredBy}</span>
                            </>
                          )}
                        </td>
                        <td className="py-3.5 text-right space-y-1.5 w-40">
                          
                          {editingAssetId === ast.id ? (
                            <div className="flex justify-end gap-2 px-1">
                              <button onClick={saveEditAsset} className="p-1.5 bg-emerald-600 text-white rounded-lg" title="Simpan"><Save className="h-3.5 w-3.5"/></button>
                              <button onClick={() => setEditingAssetId(null)} className="p-1.5 bg-slate-200 text-slate-600 rounded-lg" title="Batal"><X className="h-3.5 w-3.5"/></button>
                            </div>
                          ) : (
                            <>
                              {/* Condition badge color coding */}
                              <div className="flex justify-end">
                                <select
                                  value={ast.condition}
                                  onChange={(e) => handleUpdateCondition(ast.id, e.target.value as any)}
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full border outline-none cursor-pointer ${
                                    ast.condition === 'Sangat Baik' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                    ast.condition === 'Baik' ? 'bg-teal-50 text-teal-800 border-teal-200' :
                                    ast.condition === 'Rusak Ringan' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                    'bg-rose-50 text-rose-800 border-rose-200'
                                  }`}
                                >
                                  <option value="Sangat Baik">🟢 Sangat Baik</option>
                                  <option value="Baik">🔵 Baik</option>
                                  <option value="Rusak Ringan">🟡 Rusak Ringan</option>
                                  <option value="Rusak Berat">🔴 Rusak Berat</option>
                                </select>
                              </div>

                              {/* Action buttons */}
                              {isAdmin && (
                                <div className="flex justify-end gap-3 text-[10px] font-bold">
                                  <button onClick={() => startEditingAsset(ast)} className="text-emerald-600 hover:scale-110 transition shrink-0" title="Edit"><Edit2 className="h-3.5 w-3.5"/></button>
                                  <button onClick={() => handleRemoveAsset(ast.id, ast.name)} className="text-rose-500 hover:scale-110 transition shrink-0" title="Hapus"><Trash2 className="h-3.5 w-3.5"/></button>
                                </div>
                              )}
                            </>
                          )}
                          
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400 text-xs">
                        Tidak ada barang inventaris yang cocok dengan penyaringan filter Anda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

            {/* Right Side: Admin register new asset form - ONLY VISIBLE TO ADMINS */}
        <div className="lg:col-span-4 space-y-6">
          
          {isAdmin && (
            <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
              <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
                <span>✍️</span> Daftarkan Aset Baru
              </h3>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Mendaftarkan pengadaan barang atau sumbangan sarana fisik tak-bergerak baru ke database Masjid.
              </p>

              <form onSubmit={handleAddAsset} className="space-y-4 pt-2">
                
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Nama Barang / Aset</label>
                  <input
                    type="text"
                    placeholder="Contoh: AC Sharp Plasma 1.5 PK"
                    value={inputName}
                    onChange={(e) => setInputName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  
                  <div className="space-y-1.5 col-span-2">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Kategori Aset</label>
                    <select
                      value={inputCategory}
                      onChange={(e) => setInputCategory(e.target.value as any)}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                    >
                      <option value="Alat Shalat">Alat Shalat</option>
                      <option value="Sound System">Sound System</option>
                      <option value="Elektronik & Pendingin">Elektronik & Pendingin</option>
                      <option value="Kebersihan">Kebersihan</option>
                      <option value="Kitab Suci / Al-Quran">Kitab Suci / Al-Quran</option>
                      <option value="Mebel & Lemari">Mebel & Lemari</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Jumlah Qty</label>
                    <input
                      type="text"
                      placeholder="Contoh: 12"
                      value={inputQty}
                      onChange={(e) => setInputQty(e.target.value.replace(/\D/g, ''))}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Satuan</label>
                    <input
                      type="text"
                      placeholder="Kotak / Unit / Buah"
                      value={inputUnit}
                      onChange={(e) => setInputUnit(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none"
                    />
                  </div>

                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Kondisi Awal</label>
                  <select
                    value={inputCondition}
                    onChange={(e) => setInputCondition(e.target.value as any)}
                    className="w-full text-xs p-2 px-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  >
                    <option value="Sangat Baik">🟢 Sangat Baik</option>
                    <option value="Baik">🔵 Baik</option>
                    <option value="Rusak Ringan">🟡 Rusak Ringan</option>
                    <option value="Rusak Berat">🔴 Rusak Berat</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Lokasi Penempatan Faktual</label>
                  <input
                    type="text"
                    placeholder="Contoh: Gudang utama lt. 2 belakang"
                    value={inputLocation}
                    onChange={(e) => setInputLocation(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none"
                  />
                </div>

                {/* Foto Barang Section */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Foto Inventaris Barang</label>
                  <div className="space-y-2">
                    {inputImageUrl ? (
                      <div className="relative h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shadow-sm">
                        <img 
                          src={inputImageUrl} 
                          alt="Pratinjau Aset Baru" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                        <button 
                          type="button"
                          onClick={() => setInputImageUrl('')}
                          className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition"
                          title="Hapus foto"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-28 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 bg-slate-50 p-4">
                        <IconImage className="h-6 w-6 text-slate-300 mb-1" />
                        <span className="text-[10px] font-bold text-slate-500">Belum Ada Foto Terpilih</span>
                        <span className="text-[9px] text-slate-400 text-center">Gunakan preset atau upload foto lokal</span>
                      </div>
                    )}

                    {/* Choose Preset vs Upload Local file vs Paste URL options */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold">
                      <label className="flex items-center justify-center gap-1 p-2 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition shadow-sm text-slate-700">
                        <UploadCloud className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Unggah Foto</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              const r = new FileReader();
                              r.onload = (ev) => {
                                if (ev.target?.result) {
                                  setInputImageUrl(ev.target.result as string);
                                  onAddLog('Foto Diproses', 'Foto lokal berhasil dibaca & diunggah.', 'success');
                                }
                              };
                              r.readAsDataURL(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const url = prompt('Tulis/Paste URL Gambar Online (misalnya Unsplash atau Imgur):');
                          if (url) {
                            setInputImageUrl(url);
                            onAddLog('Berhasil', 'URL gambar eksternal berhasil disimpan.', 'success');
                          }
                        }}
                        className="flex items-center justify-center gap-1 p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition text-slate-700 shadow-sm"
                      >
                        <FileImage className="h-3.5 w-3.5 text-blue-600" />
                        <span>Tulis Link URL</span>
                      </button>
                    </div>

                    <div className="space-y-1">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase">Input Link Gambar Manual</span>
                      <input 
                        type="text"
                        placeholder="https://images.unsplash.com/..."
                        value={inputImageUrl}
                        onChange={(e) => setInputImageUrl(e.target.value)}
                        className="w-full text-[10px] p-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-slate-450 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition duration-150 flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="h-4 w-4" /> Masukkan Data Aset
                </button>

              </form>
            </div>
          )}
        </div>

          {/* Quick static rules card */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">STANDAR OPERASIONAL (SOP)</span>
            <h4 className="font-bold text-xs">Aturan Pengadaan / Donasi Sarana Fisik</h4>
            <ul className="text-[11px] text-slate-400 space-y-2 leading-relaxed list-disc list-inside">
              <li>Penyumbang barang wajib mengisi bukti penyerahan barang di sekretariat masjid Al Abrar Lapadde.</li>
              <li>Barang berjenis elektronik akan diperiksa kelayakan dayanya agar tidak melebihi kapasitas gardu listrik internal.</li>
              <li>Setiap 3 bulan takmir melakukan kontrol audit aset berkala.</li>
            </ul>
            <p className="text-[9px] text-slate-500 leading-relaxed text-center italic flex items-center justify-center gap-1 pt-1 border-t border-slate-800">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Jurnal Aset Bersih & Terpercaya
            </p>
          </div>

        </div>

      </div>

      {/* Lightbox details modal overlay */}
      {selectedAssetForView && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] animate-scale-up">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-700" />
                <h3 className="font-black text-slate-800 text-xs uppercase tracking-wide">Spesifikasi Kartu Aset</h3>
              </div>
              <button 
                onClick={() => setSelectedAssetForView(null)} 
                className="p-1 px-2 text-xs bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 font-bold transition flex items-center justify-center gap-1"
              >
                <X className="h-4 w-4" /> Tutup
              </button>
            </div>

            {/* Photo preview segment */}
            <div className="relative w-full h-56 bg-slate-900 border-b border-slate-100">
              {selectedAssetForView.imageUrl ? (
                <img 
                  src={selectedAssetForView.imageUrl} 
                  alt={selectedAssetForView.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-950">
                  <IconImage className="h-10 w-10 text-slate-700 mb-2" />
                  <span className="text-xs font-bold text-slate-400">Belum Ada Foto</span>
                </div>
              )}
              {/* Category tag */}
              <span className="absolute bottom-4 left-4 bg-emerald-600 text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-xl shadow-lg flex items-center gap-1">
                <Tag className="h-3 w-3" /> {selectedAssetForView.category}
              </span>
            </div>

            {/* Details information segment */}
            <div className="p-6 space-y-4 overflow-y-auto text-left">
              <div>
                <h4 className="font-extrabold text-base text-slate-800 leading-tight">{selectedAssetForView.name}</h4>
                <p className="text-[10px] text-slate-400 font-mono mt-1">Kode Identifikasi: {selectedAssetForView.id}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-0.5">Jumlah Fisik</span>
                  <span className="font-extrabold text-slate-800">{selectedAssetForView.quantity} {selectedAssetForView.unit}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-0.5">Status Kelayakan</span>
                  <span className={`inline-block font-bold text-[10px] px-2 py-0.5 rounded-full ${
                    selectedAssetForView.condition === 'Sangat Baik' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    selectedAssetForView.condition === 'Baik' ? 'bg-teal-50 text-teal-800 border border-teal-200' :
                    selectedAssetForView.condition === 'Rusak Ringan' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                    'bg-rose-50 text-rose-800 border-rose-200'
                  }`}>
                    {selectedAssetForView.condition}
                  </span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 col-span-2">
                  <span className="block text-[9px] font-bold text-slate-450 uppercase tracking-wider mb-0.5">Penyimpanan / Lokasi Faktual</span>
                  <span className="font-bold text-slate-700">{selectedAssetForView.location}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 pt-3 border-t border-slate-100 flex justify-between">
                <span>Pencatat: <strong>{selectedAssetForView.registeredBy}</strong></span>
                <span>Masjid Al Abrar Lapadde</span>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 border-t border-slate-100">
              <button 
                onClick={() => setSelectedAssetForView(null)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow transition duration-150"
              >
                Tutup Detail Kartu
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
