import React, { useState, useEffect } from 'react';
import { Congregant } from '../types';
import { Users, UserPlus, Search, ShieldCheck, HeartPulse, MapPin, PhoneCall, Trash2, Edit2, X, Save } from 'lucide-react';
import { subscribeToCollection, addDocument, updateDocument, deleteDocument } from '../lib/db';
import { parseNumber } from '../lib/utils';

export default function ManajemenJamaah({ 
  isAdmin,
  onAddLog,
  onShowLogin
}: { 
  isAdmin: boolean;
  onAddLog: (title: string, msg: string, type: 'info' | 'success' | 'alert' | 'system') => void;
  onShowLogin: () => void;
}) {
  const [jamaahList, setJamaahList] = useState<Congregant[]>([]);

  useEffect(() => {
    const unsub = subscribeToCollection<Congregant>('mosque_congregants', (data) => {
      setJamaahList(data);
    }, 'fullName', 'asc');
    return () => unsub();
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Warga Tetap' | 'Pendatang' | 'Musafir'>('all');
  const [filterAttendance, setFilterAttendance] = useState<'all' | 'Aktif Jamaah' | 'Jarang' | 'Sakit'>('all');

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Congregant>>({});

  // Input states for registering
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [rtRw, setRtRw] = useState('');
  const [familyCount, setFamilyCount] = useState('3');
  const [status, setStatus] = useState<'Warga Tetap' | 'Pendatang' | 'Musafir'>('Warga Tetap');
  const [attendance, setAttendance] = useState<'Aktif Jamaah' | 'Jarang' | 'Sakit'>('Aktif Jamaah');

  const handleRegisterJamaah = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      onAddLog('Validasi Gagal', 'Lengkapi Nama, No HP, dan Alamat Anda!', 'alert');
      return;
    }

    const amt = parseNumber(familyCount);
    const validFamily = isNaN(amt) ? 1 : amt;

    const newCon = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      rtRw: rtRw.trim() || 'RT 000 / RW 000',
      familyMembersCount: validFamily,
      status: status,
      attendanceStatus: attendance,
      registeredDate: new Date().toISOString().substring(0, 10)
    };

    addDocument('mosque_congregants', newCon);

    // trigger system logs
    onAddLog(
      `Jamaah Baru Terdaftar`,
      `Registrasi mandiri atas nama "${fullName}" (${status}) dari alamat ${address} berhasil diverifikasi.`,
      'success'
    );

    // reset fields
    setFullName('');
    setPhone('');
    setAddress('');
    setRtRw('');
  };

  const handleUpdateAttendance = (id: string, nextAtt: 'Aktif Jamaah' | 'Jarang' | 'Sakit') => {
    if (!isAdmin) {
      onShowLogin();
      return;
    }
    const jamaah = jamaahList.find(j => j.id === id);
    if (jamaah && jamaah.id) {
       updateDocument('mosque_congregants', jamaah.id, { attendanceStatus: nextAtt });
       onAddLog('Presensi Jamaah Di-update', `Status keakrifan ibadah "${jamaah.fullName}" diubah menjadi "${nextAtt}".`, 'success');
    }
  };
   
  const handleRemoveJamaah = (id: string, name: string) => {
    if (!isAdmin) {
      onShowLogin();
      return;
    }
    if (confirm(`Hapus data jamaah "${name}" secara permanen?`)) {
      const jamaah = jamaahList.find(j => j.id === id);
      if (jamaah && jamaah.id) {
        deleteDocument('mosque_congregants', jamaah.id);
        onAddLog('Jamaah Dihapus', `Data jamaah "${name}" telah dihapus oleh Admin.`, 'success');
      }
    }
  };

  const startEditing = (j: Congregant) => {
    setEditingId(j.id);
    setEditForm(j);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (!editForm.fullName || !editForm.phone || !editForm.address) {
      onAddLog('Validasi Gagal', 'Nama, Telepon, dan Alamat wajib diisi!', 'alert');
      return;
    }
    if (editingId) {
      const existing = jamaahList.find(j => j.id === editingId);
      if (existing && existing.id) {
        updateDocument('mosque_congregants', existing.id, editForm);
        onAddLog('Data Jamaah Diubah', `Profil jamaah "${editForm.fullName}" telah diperbarui.`, 'success');
      }
    }
    setEditingId(null);
    setEditForm({});
  };

  // Math metrics
  const totalCon = jamaahList.reduce((sum, j) => sum + j.familyMembersCount, 0);
  const sickCount = jamaahList.filter(j => j.attendanceStatus === 'Sakit').length;
  const activePercent = Math.round((jamaahList.filter(j => j.attendanceStatus === 'Aktif Jamaah').length / jamaahList.length) * 100);

  // filter
  const filteredJamaah = jamaahList.filter(j => {
    const matchStatus = filterStatus === 'all' || j.status === filterStatus;
    const matchAtt = filterAttendance === 'all' || j.attendanceStatus === filterAttendance;
    const matchSearch = j.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        j.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        j.phone.includes(searchQuery);
    return matchStatus && matchAtt && matchSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in" id="congregant_management_view">
      
      {/* Visual statistic metrics header row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm flex items-center justify-between">
          <div className="space-y-1 text-left">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">ESTIMASI JIWA JAMAAH AKTIF</span>
            <span className="block text-2xl font-black text-emerald-950 font-mono">
              {totalCon} Jiwa
            </span>
            <span className="block text-[11px] text-slate-400">Terakumulasi beserta keluarga terdaftar</span>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-700 rounded-2xl">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm flex items-center justify-between">
          <div className="space-y-1 text-left">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">RASIO KEAKTIFAN JAMA'AH</span>
            <span className="block text-2xl font-black text-emerald-700 font-mono">
              {activePercent}% Aktif
            </span>
            <span className="block text-[11px] text-slate-400">Hadir minimal shalat Subuh atau Jumat</span>
          </div>
          <div className="p-4 bg-teal-50 text-teal-800 rounded-2xl">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm flex items-center justify-between">
          <div className="space-y-1 text-left">
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">PROGRAM SOSIAL UTAMA</span>
            <span className="block text-2xl font-black text-amber-600 font-mono">
              {sickCount} Menunggu Jengukan
            </span>
            <span className="block text-[11px] text-slate-400">Jamaah berhalangan / sedang sakit</span>
          </div>
          <div className="p-4 bg-amber-50 text-amber-700 rounded-2xl relative">
            <HeartPulse className="h-6 w-6 animate-pulse" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Congregants directory searchable listing */}
        <div className="lg:col-span-8 space-y-4">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-1.5">
                  📁 Buku Induk Sensus Jamaah Masjid
                </h3>
                <p className="text-slate-400 text-xs font-sans">Direktori kependudukan warga pelindung sekitar Masjid Al Abrar.</p>
              </div>

              <div className="relative w-full md:w-64">
                <span className="absolute left-3 top-3">
                  <Search className="h-4 w-4 text-slate-400" />
                </span>
                <input
                  type="text"
                  placeholder="Cari nama, no tlp, alamat..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs p-2.5 pl-9 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Quick dropdown filter strip */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Filter Status:</span>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="bg-slate-50 border border-slate-205 rounded-xl px-2 py-1 outline-none text-xs text-slate-600 font-bold"
                >
                  <option value="all">Semua Status Tinggal</option>
                  <option value="Warga Tetap">Warga Tetap</option>
                  <option value="Pendatang">Pendatang</option>
                  <option value="Musafir">Musafir</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Filter Presensi:</span>
                <select
                  value={filterAttendance}
                  onChange={(e) => setFilterAttendance(e.target.value as any)}
                  className="bg-slate-50 border border-slate-205 rounded-xl px-2 py-1 outline-none text-xs text-slate-600 font-bold"
                >
                  <option value="all">Semua Presensi</option>
                  <option value="Aktif Jamaah">Aktif Shalat Berjamaah</option>
                  <option value="Jarang">Jarang Hadir</option>
                  <option value="Sakit">Sakit / Butuh Jengukan</option>
                </select>
              </div>
            </div>

            {/* Table layout of sensor jamaah */}
            <div className="overflow-x-auto text-left pt-2">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                    <th className="pb-3 w-40">Identitas Jamaah</th>
                    <th className="pb-3 w-32">Status Hunian</th>
                    <th className="pb-3 w-28">Jumlah Tanggungan</th>
                    <th className="pb-3">Hubungi / Alamat</th>
                    <th className="pb-3 text-right">Keaktifan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-55 text-xs">
                  {filteredJamaah.length > 0 ? (
                    filteredJamaah.map(jm => (
                      <tr key={jm.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5">
                          {editingId === jm.id ? (
                            <input 
                              type="text"
                              value={editForm.fullName || ''}
                              onChange={(e) => setEditForm({...editForm, fullName: e.target.value})}
                              className="w-full border rounded p-1 font-bold text-slate-800"
                            />
                          ) : (
                            <>
                              <span className="block font-bold text-slate-800 leading-relaxed">{jm.fullName}</span>
                              <span className="block text-[9px] text-slate-400 font-mono">Kode ID: {jm.id}</span>
                            </>
                          )}
                        </td>
                        <td className="py-3.5">
                          {editingId === jm.id ? (
                            <select
                              value={editForm.status}
                              onChange={(e) => setEditForm({...editForm, status: e.target.value as any})}
                              className="w-full border rounded p-1"
                            >
                              <option value="Warga Tetap">Warga Tetap</option>
                              <option value="Pendatang">Pendatang</option>
                              <option value="Musafir">Musafir</option>
                            </select>
                          ) : (
                            <span className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${
                              jm.status === 'Warga Tetap' ? 'bg-sky-50 text-sky-850 border border-sky-100' :
                              jm.status === 'Pendatang' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                              'bg-purple-50 text-purple-800 border border-purple-100'
                            }`}>
                              {jm.status}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 font-bold font-mono text-slate-800">
                          {editingId === jm.id ? (
                            <input 
                              type="number"
                              value={editForm.familyMembersCount || 1}
                              onChange={(e) => setEditForm({...editForm, familyMembersCount: parseNumber(e.target.value)})}
                              className="w-16 border rounded p-1"
                            />
                          ) : (
                            <>{jm.familyMembersCount} Jiwa</>
                          )}
                        </td>
                        <td className="py-3.5">
                          {editingId === jm.id ? (
                            <div className="space-y-1">
                              <input 
                                type="text"
                                placeholder="Alamat"
                                value={editForm.address || ''}
                                onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                                className="w-full border rounded p-1"
                              />
                              <input 
                                type="text"
                                placeholder="Telepon"
                                value={editForm.phone || ''}
                                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                className="w-full border rounded p-1"
                              />
                            </div>
                          ) : (
                            <>
                              <p className="font-semibold text-slate-700 flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-slate-400" /> {jm.address} 
                                <span className="text-[10px] text-slate-400 font-mono">({jm.rtRw})</span>
                              </p>
                              <a href={`tel:${jm.phone}`} className="text-[10px] text-emerald-800 hover:underline flex items-center gap-1 font-mono pt-0.5">
                                <PhoneCall className="h-3 w-3" /> {jm.phone}
                              </a>
                            </>
                          )}
                        </td>
                        <td className="py-3.5 text-right w-40">
                          {editingId === jm.id ? (
                            <div className="flex justify-end gap-2 text-[10px]">
                              <button onClick={saveEdit} className="p-1.5 bg-emerald-600 text-white rounded-lg" title="Simpan"><Save className="h-3.5 w-3.5"/></button>
                              <button onClick={cancelEditing} className="p-1.5 bg-slate-200 text-slate-600 rounded-lg" title="Batal"><X className="h-3.5 w-3.5"/></button>
                            </div>
                          ) : (
                            <div className="flex flex-col items-end gap-2">
                              <select
                                value={jm.attendanceStatus}
                                onChange={(e) => handleUpdateAttendance(jm.id, e.target.value as any)}
                                className={`text-[9px] font-bold px-2.5 py-1 rounded-full border outline-none cursor-pointer focus:ring-1 ${
                                  jm.attendanceStatus === 'Aktif Jamaah' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                                  jm.attendanceStatus === 'Jarang' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                                  'bg-rose-100 text-rose-800 border-rose-300'
                                }`}
                              >
                                <option value="Aktif Jamaah">🟢 Aktif Ibadah</option>
                                <option value="Jarang">🟡 Jarang Hadir</option>
                                <option value="Sakit">🔴 Sakit / Jenguk</option>
                              </select>
                              
                              {isAdmin && (
                                <div className="flex gap-2 text-[10px] font-bold">
                                  <button onClick={() => startEditing(jm)} className="text-emerald-600 hover:underline flex items-center gap-0.5"><Edit2 className="h-2.5 w-2.5"/>Edit</button>
                                  <button onClick={() => handleRemoveJamaah(jm.id, jm.fullName)} className="text-rose-500 hover:underline flex items-center gap-0.5"><Trash2 className="h-2.5 w-2.5"/>Hapus</button>
                                </div>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400 text-xs">
                        Tidak ada jemaah terekam yang cocok dengan filter kriteria pencarian Anda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>

        {/* Right Side: Quick registration form for congregant */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-150 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-1.5 uppercase tracking-wide">
              <span><UserPlus className="h-5 w-5 text-emerald-700" /></span> Registrasi Anggota Baru
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Mendaftarkan data keluarga atau diri Anda sebagai jamaah Masjid Al Abrar untuk pembinaan sosial dan zakat terintegrasi.
            </p>

            <form onSubmit={handleRegisterJamaah} className="space-y-4 pt-2 text-left">
              
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Nama Lengkap Kepala Keluarga</label>
                <input
                  type="text"
                  placeholder="Contoh: Muhammad Yusuf"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">No. Handphone (WA Aktif)</label>
                <input
                  type="text"
                  placeholder="Contoh: 0812-4455-XXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-500 uppercase">Alamat Domisili Lengkap</label>
                <input
                  type="text"
                  placeholder="Nama Jalan, Blok Rumah, Gg., No."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">RT / RW</label>
                  <input
                    type="text"
                    placeholder="RT 002 / RW 004"
                    value={rtRw}
                    onChange={(e) => setRtRw(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Jumlah Jiwa KK</label>
                  <input
                    type="number"
                    min={1}
                    value={familyCount}
                    onChange={(e) => setFamilyCount(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:border-slate-400 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Status Tinggal</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  >
                    <option value="Warga Tetap">Warga Tetap</option>
                    <option value="Pendatang">Pendatang</option>
                    <option value="Musafir">Musafir</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Tingkat Ibadah</label>
                  <select
                    value={attendance}
                    onChange={(e) => setAttendance(e.target.value as any)}
                    className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 outline-none"
                  >
                    <option value="Aktif Jamaah">🟢 Aktif Ibadah</option>
                    <option value="Jarang">🟡 Jarang Hadir</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-emerald-950 text-white font-black text-xs rounded-xl shadow transition duration-150 flex items-center justify-center gap-1.5"
              >
                💾 Daftarkan Sebagai Jamaah
              </button>

            </form>
          </div>

          {/* Social service outreach call for support */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-4">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest font-mono">SOLIDARITAS JAMAAH</span>
            <h4 className="font-bold text-xs leading-relaxed">Kepedulian Jenguk Ikhlas Al Abrar</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Sensus jamaah memungkinkan takmir mengidentifikasi tetangga atau jamaah masjid yang tertimpa musibah sakit secara langsung.
            </p>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-300 leading-normal">
              <strong>Zakat & Santunan:</strong> Dana santunan senilai Rp 150.000 / keluarga disalurkan otomatis setiap pekan bagi jamaah berstatus Sakit melalui Kas Pemberdayaan Yatim & Duafa.
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
