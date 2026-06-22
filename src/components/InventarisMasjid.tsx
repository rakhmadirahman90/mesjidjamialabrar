import React, { useState, useEffect } from 'react';
import { MosqueAsset } from '../types';
import { Package, PlusCircle, Search, Tag, ShieldCheck, Edit2, Trash2, Save, X } from 'lucide-react';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '../lib/db';

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

    const qtyVal = parseInt(inputQty, 10);
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
      registeredBy: 'Admin Al Abrar'
    };

    addDocument('mosque_assets', newAsset);

    // trigger system logs reporting
    onAddLog(
      `Inventaris Baru`,
      `Barang berhasil masuk daftar aset: "${inputName}" (${qtyVal} ${inputUnit}) di "${inputLocation}". Kondisi: ${inputCondition}.`,
      'success'
    );

    // reset fields
    setInputName('');
    setInputQty('');
    setInputLocation('');
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
                    <th className="pb-3 w-44">Nama Barang (Aset)</th>
                    <th className="pb-3 w-32">Kategori</th>
                    <th className="pb-3 w-28">Kuantitas</th>
                    <th className="pb-3">Lokasi / Penolong</th>
                    <th className="pb-3 text-right">Kondisi / Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map(ast => (
                      <tr key={ast.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5">
                          {editingAssetId === ast.id ? (
                            <input 
                              type="text"
                              value={editAssetForm.name || ''}
                              onChange={(e) => setEditAssetForm({...editAssetForm, name: e.target.value})}
                              className="w-full border rounded p-1 font-bold text-slate-800"
                            />
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
                                onChange={(e) => setEditAssetForm({...editAssetForm, quantity: parseInt(e.target.value)})}
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

        </div>

        {/* Right Side: Admin register new asset form */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <span>✍️</span> Daftarkan Aset Baru
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Mendaftarkan pengadaan barang atau sumbangan sarana fisik tak-bergerak baru ke database Masjid.
            </p>

            {isAdmin ? (
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

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition duration-150 flex items-center justify-center gap-1.5"
                >
                  <PlusCircle className="h-4 w-4" /> Masukkan Data Aset
                </button>

              </form>
            ) : (
              <div className="pt-4 pb-2 text-center text-slate-500 space-y-4">
                <p className="text-xs bg-slate-50 p-4 border border-dashed border-slate-200 rounded-2xl leading-relaxed">
                  🔐 Pendaftaran maupun modifikasi kondisi inventaris baru hanya diizinkan bagi <strong>Admin Pelaksana Masjid Al Abrar</strong>.
                </p>
                <button
                  onClick={onShowLogin}
                  className="py-2.5 px-6 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-emerald-950 transition inline-block shadow"
                >
                  Masuk Sebagai Admin
                </button>
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

    </div>
  );
}
