import { useState, useRef, useEffect } from 'react';
import { MosqueProfileDetail, MosqueStructure } from '../types';
import { Building, MapPin, Award, Calendar, Edit2, Save, X, Plus, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { compressImage } from '../lib/imageCompression';
import { subscribeToDocument, upsertDocument } from '../lib/db';

interface MosqueProfileProps {
  isAdmin?: boolean;
  onAddLog?: (title: string, msg: string, type: any) => void;
}

// Standard high-quality details for Al Abrar
const DEFAULT_PROFILE: MosqueProfileDetail = {
  history: 'Masjid Jami Al Abrar didirikan pada tahun 1985 sebagai pusat peradaban dan ibadah warga Lapadde, Parepare. Bermula dari bangunan bersahaja, kini Masjid Al Abrar telah berkembang menjadi bangunan megah dua lantai yang mampu menampung lebih dari 1.200 jamaah secara bersamaan dan menjadi model masjid ramah dan bersih di Sulawesi Selatan.',
  vision: 'Terwujudnya Masjid Al Abrar sebagai pusat ibadah yang suci, makmur, mandiri, dan berdaya guna dalam mendidik jamaah yang bertakwa dan berakhlakul karimah.',
  mision: [
    'Menyelenggarakan pelayanan ibadah fardhu & sunnah secara tertib dan nyaman.',
    'Meningkatkan pembinaan aqidah, ibadah, dan akhlak melalui kajian rutin & madrasah dhuha.',
    'Mengelola keuangan masjid secara akuntabel, transparan, dan profesional.',
    'Mengembangkan program pemberdayaan ekonomi jamaah berbasis infaq dan sedekah.',
    'Fasilitasi kegiatan kemanusiaan dan kepemudaan Remaja Masjid (PRISMA).'
  ],
  facilities: [
    { name: 'Ruang Utama Shalat AC', icon: '🕌', status: 'Baik', description: 'Kapasitas 800 jamaah di lantai utama berpendingin udara penuh.' },
    { name: 'Ruang Shalat Wanita (Selasar)', icon: '🌸', status: 'Baik', description: 'Area lantai dua berkapasitas 400 jamaah khusus akhwat.' },
    { name: 'Tempat Wudhu & Toilet Higienis', icon: '💧', status: 'Baik', description: 'Dilengkapi kran stainless otomatis, sanitasi bersih kelas premium.' },
    { name: 'Sistem Akustik Sound Toa', icon: '📢', status: 'Baik', description: 'Konfigurasi 8 speaker indoor & 4 horn outdoor dengan mixer canggih.' },
    { name: 'Perpustakaan & Kelas Mengaji', icon: '📖', status: 'Baik', description: 'Koleksi mushaf quran dan buku fiqih lengkap bagi anak-anak TPA.' },
    { name: 'Layanan Ambulans Masjid', icon: '🚑', status: 'Baik', description: 'Siaga 24 jam untuk melayani kebutuhan gawat darurat jamaah gratis.' }
  ],
  structure: [
    { role: 'Ketua Umum', name: 'Kapt. Purn. H. Amir Sabana', phone: '0812-4455-1211', imageUrl: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=256&h=256&auto=format&fit=crop' },
    { role: 'Sekretaris Umum', name: 'M. Darwis, SE', phone: '0852-1122-3344', imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=256&h=256&auto=format&fit=crop' },
    { role: 'Bendahara Umum', name: 'Hardika', phone: '0811-9988-7766', imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop' }
  ]
};

// Detailed committee data for the full board
const DETAILED_STRUCTURE = {
  penasehat: [
    'Camat Ujung', 'Kepala KUA Kec. Ujung', 'Lurah Lapadde', 
    'dr. H. Nurdin Samad, Sp.PD., FINASIM', 'Prof. Dr. Drs. H. Amaluddin, M.Hum',
    'Drs. H. AT. Syamsul Eyber', 'Dr. H. Surianto Abdul Muijib, S.Ag., MM.', 'Dr. H. Muh Natsir, M.Pd'
  ],
  idarah: {
    harian: [
      { role: 'Ketua Umum', name: 'Kapt.Purn.H. Amir Sabana' },
      { role: 'Wakil Ketua I', name: 'Abdullah Jalil, SE., SH., M.Si' },
      { role: 'Wakil Ketua II', name: 'Drs. H. Muh. Sabir' },
      { role: 'Sekretaris', name: 'M. Darwis, SE' },
      { role: 'Wakil Sekretaris', name: 'Muhazil' },
      { role: 'Bendahara', name: 'Hardika' },
      { role: 'Wakil Bendahara', name: 'Ismail Majju, S.Pd.' }
    ],
    seksi_dana: ['H. Mistang Hamid, SE', 'H. Yodi Haya, S.E., M.M', 'H. Ade Musytahun Wahid, S.Si., M.M', 'Askar', 'Mujetahidin', 'Abd. Aziz', 'A. Maappasessu', 'Supriadi'],
    seksi_ekonomi: ['Darwis Ressa', 'Ruslan, S.E', 'Drs. Kusnan Sossong, M.Si', 'Nasruddin, S.E', 'Darnawan, S.E', 'Akbar'],
    seksi_kemasyarakatan: {
      koordinator: 'Amiruddin, SE',
      members: [
        { label: 'Zakat', name: "Pegawai Syara'" },
        { label: 'Kesehatan', name: 'Ekawati, Amd.Keb' },
        { label: 'Anggota', name: 'Hj. Helmyria Mappasessu, Amd.Keb' },
        { label: 'PRISMA', name: 'M. Rafly Jafar, Muh. Aswan, Muh. Saki, Risma' }
      ]
    }
  },
  imarah: {
    peribadatan: [
      { role: 'Iman Masjid', name: 'Drs. Abd. Hakim Latief, M.Pd.I' },
      { role: 'Iman Rawatib', name: 'Nurdin Nawawi' },
      { role: 'Khatib', name: 'M. Darwis, SE' },
      { role: 'Muadzin', name: 'Rahman B Umar' },
      { role: 'Pelayan', name: 'Anas, Hardika' }
    ],
    hbi: ['Endeng Suparman', 'Basri Bas', 'Arsyad Adam', 'Amir Lawang', 'Muh. Ilham', 'Sayyed Sunarjo', 'Bahar'],
    pendidikan: [
      { label: 'Madrasah/Sekolah', name: 'H. Ahmad Toufik Tahir, S.Ag., MM., Drs. Buneyamin Firdaus, S.Pd.' },
      { label: 'Pustaka', name: 'Abdullah, S.Pd., Muaris' },
      { label: 'RKA/TPQ', name: 'Mariyani, S.Ag., M.Pd.I, Hj. Norma' }
    ],
    akhwat: {
      koordinator: 'Nurhayati, S.Pd.',
      members: ['Hj. Sudarti Baha, S.Pd', 'Dra. Hj. Anisa', 'Dra. Hj. Saribanong', 'Hj. Nurhayati Husain', 'Hj. Ida', 'Siti Rahmah', 'Pengurus Majelis Taklim']
    }
  },
  riayah: {
    pembangunan: ['Drs. Muhammadong', 'Syamsir Nali', 'Syarif', 'H. Muh. Yunus', 'Sultan, S.Pd'],
    perlengkapan: ['Arifin', 'Adam', 'Bahar Dareng', 'Burhan', 'H. Supu', 'Muhammad Adha'],
    kebersihan: ['Anas', 'Abd. Hamid', 'Burhan', 'Langgoe', 'Abdulla Rajab'],
    keamanan: ['H. Syahrir', 'Darwis Baha', 'Nurdin', 'Mustamin', 'Hasnawati Sakka', 'Muh. Yasin', 'Bambang']
  }
};

// Member card component for the committee board
function MemberCard({ name, role, imageUrl, onEdit, onDelete, isAdmin }: { name: string; role?: string; imageUrl?: string; onEdit?: () => void; onDelete?: () => void; isAdmin?: boolean }) {
  const avatarUrl = imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
  
  return (
    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-white transition shadow-sm group relative">
      <img 
        src={avatarUrl} 
        alt={name}
        referrerPolicy="no-referrer"
        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md group-hover:scale-105 transition shrink-0"
      />
      <div className="min-w-0 flex-1">
        {role && <span className="block text-[8px] font-black text-emerald-700 uppercase font-mono tracking-widest mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{role}</span>}
        <h4 className="font-bold text-[11px] text-slate-800 truncate tracking-tight">{name}</h4>
      </div>
      {isAdmin && onEdit && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="p-1.5 bg-white text-slate-400 hover:text-emerald-600 rounded-lg shadow-sm border border-slate-100"><Edit2 className="h-3 w-3" /></button>
          {onDelete && <button onClick={onDelete} className="p-1.5 bg-white text-slate-400 hover:text-rose-600 rounded-lg shadow-sm border border-slate-100"><Trash2 className="h-3 w-3" /></button>}
        </div>
      )}
    </div>
  );
}

export default function MosqueProfile({ isAdmin, onAddLog }: MosqueProfileProps) {
  const [activeBoard, setActiveBoard] = useState<'idarah' | 'imarah' | 'riayah'>('idarah');
  const [profile, setProfile] = useState<MosqueProfileDetail>(DEFAULT_PROFILE);

  const [isEditingMain, setIsEditingMain] = useState(false);
  const [editForm, setEditForm] = useState<MosqueProfileDetail>(profile);
  const [editingMemberIndex, setEditingMemberIndex] = useState<number | null>(null);
  const [memberForm, setMemberForm] = useState<Partial<MosqueStructure>>({});
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Facility CRUD states
  const [editingFacilityIndex, setEditingFacilityIndex] = useState<number | null>(null);
  const [facilityForm, setFacilityForm] = useState<Partial<MosqueProfileDetail['facilities'][0]>>({});

  // Sync with Firestore
  useEffect(() => {
    const unsub = subscribeToDocument<MosqueProfileDetail>('settings', 'mosque_profile', (data) => {
      if (data) {
        setProfile(data);
        setEditForm(data);
      } else {
        // Seed default
        upsertDocument('settings', 'mosque_profile', DEFAULT_PROFILE);
      }
    });
    return () => unsub();
  }, []);

  const saveProfile = (newProfile: MosqueProfileDetail) => {
    setProfile(newProfile);
    upsertDocument('settings', 'mosque_profile', newProfile);
  };

  const handleSaveMain = () => {
    saveProfile(editForm);
    setIsEditingMain(false);
    onAddLog?.('Profil Diperbarui', 'Informasi sejarah, visi, dan misi masjid berhasil diperbarui.', 'success');
  };

  const handleEditFacility = (index: number) => {
    setEditingFacilityIndex(index);
    setFacilityForm(profile.facilities[index]);
  };

  const handleAddFacility = () => {
    setEditingFacilityIndex(-1);
    setFacilityForm({ name: '', icon: '🕌', status: 'Baik', description: '' });
  };

  const handleSaveFacility = () => {
    if (!facilityForm.name || !facilityForm.description) {
      onAddLog?.('Gagal', 'Nama dan Deskripsi fasilitas wajib diisi.', 'alert');
      return;
    }
    let updatedFacilities = [...profile.facilities];
    if (editingFacilityIndex === -1) {
      updatedFacilities.push(facilityForm as MosqueProfileDetail['facilities'][0]);
      onAddLog?.('Fasilitas Ditambah', `Berhasil menambah fasilitas ${facilityForm.name}.`, 'success');
    } else if (editingFacilityIndex !== null) {
      updatedFacilities[editingFacilityIndex] = facilityForm as MosqueProfileDetail['facilities'][0];
      onAddLog?.('Fasilitas Diperbarui', `Informasi ${facilityForm.name} berhasil diperbarui.`, 'success');
    }
    saveProfile({ ...profile, facilities: updatedFacilities });
    setEditingFacilityIndex(null);
  };

  const handleDeleteFacility = (index: number) => {
    if (window.confirm(`Hapus fasilitas ${profile.facilities[index].name}?`)) {
      const updatedFacilities = profile.facilities.filter((_, i) => i !== index);
      saveProfile({ ...profile, facilities: updatedFacilities });
      onAddLog?.('Fasilitas Dihapus', 'Data fasilitas berhasil dihapus.', 'alert');
    }
  };

  const handleEditMember = (index: number) => {
    setEditingMemberIndex(index);
    setMemberForm(profile.structure[index]);
  };

  const handleAddMember = () => {
    setEditingMemberIndex(-1);
    setMemberForm({ role: '', name: '', phone: '', imageUrl: '' });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      onAddLog?.('Format Gagal', 'Hanya file gambar yang diizinkan.', 'alert');
      return;
    }
    try {
      setIsCompressing(true);
      const compressed = await compressImage(file);
      setMemberForm(prev => ({ ...prev, imageUrl: compressed }));
    } catch (e) {
      onAddLog?.('Gagal Kompresi', 'Gagal memproses gambar.', 'alert');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSaveMember = () => {
    if (!memberForm.name || !memberForm.role) {
      onAddLog?.('Data Gagal', 'Nama dan Jabatan wajib diisi.', 'alert');
      return;
    }

    let updatedStructure = [...profile.structure];
    if (editingMemberIndex === -1) {
      updatedStructure.push(memberForm as MosqueStructure);
      onAddLog?.('Anggota Ditambah', `Berhasil menambah ${memberForm.name} ke pengurus inti.`, 'success');
    } else if (editingMemberIndex !== null) {
      updatedStructure[editingMemberIndex] = memberForm as MosqueStructure;
      onAddLog?.('Anggota Diperbarui', `Informasi ${memberForm.name} berhasil diperbarui.`, 'success');
    }

    saveProfile({ ...profile, structure: updatedStructure });
    setEditingMemberIndex(null);
    setMemberForm({});
  };

  const handleDeleteMember = (index: number) => {
    if (window.confirm(`Hapus ${profile.structure[index].name} dari pengurus inti?`)) {
      const updatedStructure = profile.structure.filter((_, i) => i !== index);
      saveProfile({ ...profile, structure: updatedStructure });
      onAddLog?.('Anggota Dihapus', 'Data pengurus inti berhasil dihapus.', 'alert');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in" id="profile_mosque_view">
      
      {/* Editorial Header Banner Card */}
      <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-10 relative overflow-hidden shadow-xl border-b-4 border-amber-400">
        <div className="absolute right-0 bottom-0 top-0 w-2/5 opacity-10 select-none hidden md:block" style={{ backgroundImage: `radial-gradient(circle, #fbbf24 1px, transparent 1px)`, backgroundSize: '12px 12px' }}></div>
        
        <div className="max-w-2xl space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-emerald-800/60 border border-emerald-700 text-amber-300 font-bold text-xs uppercase px-3 py-1.5 rounded-full tracking-wider">
            <Building className="h-4 w-4" /> Profil Peradaban
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-display text-white">
            Masjid Jami <span className="text-amber-400">Al Abrar</span> Lapadde
          </h1>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Jl. Jenderal Sudirman No. 45, Kel. Lapadde, Kecamatan Ujung, Kota Parepare, Sulawesi Selatan.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-2 text-xs">
            <span className="flex items-center gap-1.5 bg-emerald-950/40 px-3 py-2 rounded-xl text-emerald-200">
              <MapPin className="h-3.5 w-3.5 text-amber-400" /> Parepare, Sulsel
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-950/40 px-3 py-2 rounded-xl text-emerald-200">
              <Calendar className="h-3.5 w-3.5 text-amber-400" /> Berdiri Sejak 1985
            </span>
            <span className="flex items-center gap-1.5 bg-emerald-950/40 px-3 py-2 rounded-xl text-emerald-200">
              <Award className="h-3.5 w-3.5 text-amber-400" /> Sertifikasi Masjid Jami
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Sejarah, Visi Misi */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Sejarah Camp */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold font-display text-slate-800 tracking-tight flex items-center gap-2">
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">🕌</span> Sejarah Singkat Masjid
              </h3>
              {isAdmin && !isEditingMain && (
                <button 
                  onClick={() => { setIsEditingMain(true); setEditForm(profile); }}
                  className="p-2 bg-slate-100 text-slate-600 rounded-xl hover:bg-emerald-600 hover:text-white transition shadow-sm"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              )}
            </div>

            {isEditingMain ? (
              <div className="space-y-4 animate-fade-in">
                <textarea 
                  value={editForm.history}
                  onChange={e => setEditForm({...editForm, history: e.target.value})}
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none h-48"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setIsEditingMain(false)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold font-mono">BATAL</button>
                  <button onClick={handleSaveMain} className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg"><Save className="h-3 w-3" /> SIMPAN PERUBAHAN</button>
                </div>
              </div>
            ) : (
              <p className="text-slate-600 text-sm leading-relaxed text-justify">
                {profile.history}
              </p>
            )}
            
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/50 flex gap-3.5">
              <div className="text-2xl text-amber-500 shrink-0 select-none">💡</div>
              <p className="text-xs text-amber-900 leading-relaxed">
                <strong>Nilai Historis:</strong> Nama <em>Al Abrar</em> memiliki arti "Orang-orang pilihan yang berbuat kebajikan". Semangat gotong royong warga Lapadde Parepare senantiasa diabadikan dalam setiap rekonstruksi fisik dan sosial masjid kami.
              </p>
            </div>
          </div>

          {/* Visi & Misi */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-5">
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-display text-slate-800 tracking-tight flex items-center gap-2">
                <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">🎯</span> Visi & Misi Masjid
              </h3>
              <p className="text-slate-500 text-xs">Arah perjuangan Takmir Masjid Jami Al Abrar Lapadde.</p>
            </div>
            
            {isEditingMain ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Visi Masjid</label>
                  <input 
                    type="text" 
                    value={editForm.vision}
                    onChange={e => setEditForm({...editForm, vision: e.target.value})}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Misi Strategis (Baris per Baris)</label>
                  {editForm.mision.map((m, idx) => (
                    <div key={idx} className="flex gap-2">
                       <input 
                        type="text" 
                        value={m}
                        onChange={e => {
                          const newMissions = [...editForm.mision];
                          newMissions[idx] = e.target.value;
                          setEditForm({...editForm, mision: newMissions});
                        }}
                        className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <button 
                        onClick={() => {
                          const newMissions = editForm.mision.filter((_, i) => i !== idx);
                          setEditForm({...editForm, mision: newMissions});
                        }}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => setEditForm({...editForm, mision: [...editForm.mision, '']})}
                    className="w-full py-3 border-2 border-dashed border-emerald-100 rounded-2xl text-xs font-black text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300 transition flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> TAMBAH MISI
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50/50 rounded-2xl p-5 border border-emerald-100/50">
                  <span className="block text-xs font-bold text-emerald-800/80 uppercase tracking-widest font-mono mb-1.5">VISI UTAMA</span>
                  <p className="text-base font-extrabold text-emerald-950 font-display italic">
                    "{profile.vision}"
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-mono mb-2">MISI STRATEGIS</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {profile.mision.map((m, idx) => (
                      <div key={idx} className="flex gap-2.5 items-start bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-medium text-slate-700 leading-relaxed">
                          {m}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

        {/* Right Column: Key Facilities, Organizational Structure */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Top Key Positions with Pictures */}
          <div className="bg-white rounded-2xl p-6 border border-slate-150 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-display text-slate-800 tracking-tight flex items-center gap-2">
                <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-xl">👥</span> Tokoh Pengurus Inti
              </h3>
              {isAdmin && (
                <button 
                  onClick={handleAddMember}
                  className="p-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-600 hover:text-white transition shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>

            {editingMemberIndex !== null && (
              <div className="bg-slate-900 text-white p-6 rounded-3xl space-y-4 animate-scale-up border-b-4 border-amber-400 shadow-2xl relative z-20">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <h4 className="font-black text-xs uppercase tracking-widest text-amber-300">
                    {editingMemberIndex === -1 ? 'Tambah Pengurus' : 'Edit Pengurus'}
                  </h4>
                  <button onClick={() => setEditingMemberIndex(null)} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="relative w-24 h-24 rounded-full border-2 border-dashed border-white/20 overflow-hidden cursor-pointer group hover:border-amber-400 transition"
                    >
                      {isCompressing ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                          <Loader2 className="h-6 w-6 text-amber-400 animate-spin" />
                        </div>
                      ) : memberForm.imageUrl ? (
                        <img src={memberForm.imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 text-[8px] font-black uppercase text-center p-2">
                          <ImageIcon className="h-5 w-5 mb-1" />
                          <span>Ganti Foto</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-[8px] font-black">
                        UPLOAD
                      </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                  </div>

                  <div className="space-y-3">
                    <input 
                      type="text" 
                      placeholder="Nama Lengkap & Gelar" 
                      value={memberForm.name} 
                      onChange={e => setMemberForm({...memberForm, name: e.target.value})}
                      className="w-full p-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs outline-none focus:border-amber-400"
                    />
                    <input 
                      type="text" 
                      placeholder="Jabatan (e.g. Bendahara)" 
                      value={memberForm.role} 
                      onChange={e => setMemberForm({...memberForm, role: e.target.value})}
                      className="w-full p-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs outline-none focus:border-amber-400"
                    />
                    <input 
                      type="text" 
                      placeholder="Nomor HP/WA" 
                      value={memberForm.phone} 
                      onChange={e => setMemberForm({...memberForm, phone: e.target.value})}
                      className="w-full p-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSaveMember}
                  className="w-full py-3 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black rounded-2xl text-xs transition active:scale-95 shadow-xl shadow-amber-900/20"
                >
                  SIMPAN ANGGOTA
                </button>
              </div>
            )}
            
            <div className="space-y-4">
              {profile.structure.map((s, idx) => (
                <MemberCard 
                  key={idx} 
                  name={s.name} 
                  role={s.role} 
                  imageUrl={s.imageUrl} 
                  isAdmin={isAdmin}
                  onEdit={() => handleEditMember(idx)}
                  onDelete={() => handleDeleteMember(idx)}
                />
              ))}
            </div>
          </div>

          {/* Location Interactive Information */}
          <div className="bg-white rounded-2xl p-6 border border-slate-150 shadow-sm space-y-3">
            <h3 className="text-sm font-bold font-display text-slate-800 tracking-tight flex items-center gap-1.5">
              <span>📍</span> Informasi Kontak & Akses
            </h3>
            <div className="text-xs text-slate-600 space-y-2 leading-relaxed">
              <div className="flex gap-2">
                <span className="font-semibold text-slate-800 w-16">Sekretariat:</span>
                <span>Kantor Takmir Lt. 1 Al Abrar</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-slate-800 w-16">E-mail:</span>
                <span className="underline text-emerald-700">takmir@alabrar-parepare.or.id</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold text-slate-800 w-16">Google Map:</span>
                <span className="text-slate-500 italic">5.021° S, 119.645° E (Lapadde)</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Full Organizational Board (Bagan Struktur) section */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-150 shadow-sm space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-8">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-mono uppercase bg-amber-500/10 text-amber-700 border border-amber-500/20">
              Periode 2025 - 2028
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-800 tracking-tight leading-none uppercase">
              Susunan Pengurus Masjid Jami <span className="text-emerald-700">Al-Abrar</span>
            </h2>
            <p className="text-slate-500 text-sm">Kelurahan Lapadde, Kecamatan Ujung, Kota Parepare — Lengkap Sesuai Ketetapan Panitia.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {(['idarah', 'imarah', 'riayah'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveBoard(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  activeBoard === tab
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Pelindung / Penasehat Header */}
        <div className="bg-emerald-950 text-white p-6 rounded-3xl relative overflow-hidden shadow-lg">
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-amber-400 transform skew-x-12 translate-x-16 opacity-20"></div>
          <div className="relative z-10 text-center space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-[0.3em] text-amber-400">PELINDUNG / PENASEHAT</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {DETAILED_STRUCTURE.penasehat.map((name, i) => (
                <div key={i} className="space-y-1">
                  <p className="text-[11px] font-bold text-white tracking-tight leading-tight">{name}</p>
                   <div className="h-0.5 w-8 bg-amber-400/30 mx-auto rounded-full mt-1.5"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Section Board Based on Selected Tab */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {activeBoard === 'idarah' && (
            <>
              {/* Seksi Idarah Sections */}
              <div className="space-y-6">
                <div className="border-l-4 border-emerald-600 pl-4 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Pengurus Harian</h4>
                  <div className="space-y-3">
                    {DETAILED_STRUCTURE.idarah.harian.map((p, i) => (
                      <MemberCard key={i} name={p.name} role={p.role} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-emerald-600 pl-4 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Seksi Dana</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {DETAILED_STRUCTURE.idarah.seksi_dana.map((name, i) => (
                      <MemberCard key={i} name={name} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-emerald-600 pl-4 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Seksi Ekonomi & Usaha</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {DETAILED_STRUCTURE.idarah.seksi_ekonomi.map((name, i) => (
                      <MemberCard key={i} name={name} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-emerald-600 pl-4 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Seksi Kemasyarakatan</h4>
                  <div className="space-y-4">
                    <div className="bg-slate-900 text-white p-3 rounded-xl border-b-2 border-amber-400">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">KOORDINATOR</span>
                      <span className="font-black text-xs">{DETAILED_STRUCTURE.idarah.seksi_kemasyarakatan.koordinator}</span>
                    </div>
                    {DETAILED_STRUCTURE.idarah.seksi_kemasyarakatan.members.map((m, i) => (
                      <MemberCard key={i} name={m.name} role={m.label} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeBoard === 'imarah' && (
            <>
              {/* Seksi Imarah Sections */}
              <div className="space-y-6">
                <div className="border-l-4 border-teal-600 pl-4 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Seksi Peribadatan</h4>
                  <div className="space-y-3">
                    {DETAILED_STRUCTURE.imarah.peribadatan.map((p, i) => (
                      <MemberCard key={i} name={p.name} role={p.role} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-teal-600 pl-4 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Seksi PHBI</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {DETAILED_STRUCTURE.imarah.hbi.map((name, i) => (
                      <MemberCard key={i} name={name} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-teal-600 pl-4 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Seksi Pendidikan</h4>
                  <div className="space-y-4">
                    {DETAILED_STRUCTURE.imarah.pendidikan.map((p, i) => (
                      <MemberCard key={i} name={p.name} role={p.label} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-teal-600 pl-4 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Seksi Akhwat / Perempuan</h4>
                  <div className="space-y-4">
                    <div className="bg-slate-900 text-white p-3 rounded-xl border-b-2 border-emerald-400">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">KOORDINATOR</span>
                      <span className="font-black text-xs">{DETAILED_STRUCTURE.imarah.akhwat.koordinator}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {DETAILED_STRUCTURE.imarah.akhwat.members.map((name, i) => (
                        <MemberCard key={i} name={name} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeBoard === 'riayah' && (
            <>
              {/* Seksi Riayah Sections */}
              <div className="space-y-6">
                <div className="border-l-4 border-amber-600 pl-4 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Seksi Pembangunan</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {DETAILED_STRUCTURE.riayah.pembangunan.map((name, i) => (
                      <MemberCard key={i} name={name} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-amber-600 pl-4 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Perlengkapan & Teknis</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {DETAILED_STRUCTURE.riayah.perlengkapan.map((name, i) => (
                      <MemberCard key={i} name={name} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-emerald-800/80 pl-4 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Seksi Kebersihan</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {DETAILED_STRUCTURE.riayah.kebersihan.map((name, i) => (
                      <MemberCard key={i} name={name} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border-l-4 border-slate-800 pl-4 space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest font-mono">Seksi Keamanan</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {DETAILED_STRUCTURE.riayah.keamanan.map((name, i) => (
                      <MemberCard key={i} name={name} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

        </div>

        {/* Footer of the Board */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-150 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-black text-slate-800 font-display uppercase tracking-tight">Kanal Informasi Resmi PRISMA</h4>
            <p className="text-[11px] text-slate-500">Seluruh nama di atas telah terverifikasi melalui rapat tahunan Takmir Masjid Al Abrar.</p>
          </div>
          <div className="flex -space-x-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <img 
                key={i} 
                src={`https://ui-avatars.com/api/?name=User+Round+${i}&background=random&color=fff&size=64`} 
                alt="Pengurus" 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
              />
            ))}
            <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">+85</div>
          </div>
        </div>
      </div>

      {/* Facilities Grid System */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-150 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1 text-left">
            <h3 className="text-xl font-bold font-display text-slate-800 tracking-tight flex items-center gap-2">
              <span className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">🛠️</span> Sarana & Prasana Masjid
            </h3>
            <p className="text-slate-500 text-xs">Sarana fisik penunjang kemudahan ibadah dan kebersihan di Masjid Al Abrar.</p>
          </div>
          {isAdmin && (
            <button 
              onClick={handleAddFacility}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-wider hover:bg-slate-800 transition shadow-lg"
            >
              <Plus className="h-4 w-4 text-emerald-400" /> Tambah Fasilitas
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {profile.facilities.map((fac, idx) => (
            <div key={idx} className="p-4 rounded-xl border border-slate-150 bg-slate-50 flex items-start gap-3.5 hover:border-emerald-300 transition duration-150 relative overflow-hidden group">
              <span className="text-3xl bg-white p-2 rounded-xl shadow-sm border border-slate-100 block group-hover:scale-110 transition">{fac.icon}</span>
              <div className="space-y-1 z-10 text-left">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-xs text-slate-800">{fac.name}</h4>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    fac.status === 'Baik' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {fac.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{fac.description}</p>
              </div>
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleEditFacility(idx)} className="p-1 px-2 bg-white text-slate-400 hover:text-emerald-600 rounded-lg shadow-sm border border-slate-100 text-[10px] font-bold">EDIT</button>
                  <button onClick={() => handleDeleteFacility(idx)} className="p-1 px-2 bg-white text-slate-400 hover:text-rose-600 rounded-lg shadow-sm border border-slate-100 text-[10px] font-bold">HAPUS</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Editing Modal for Facility */}
      {editingFacilityIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b pb-4">
              <h4 className="text-lg font-black text-slate-800">Edit Fasilitas Masjid</h4>
              <button onClick={() => setEditingFacilityIndex(null)} className="text-slate-400 hover:text-slate-800"><X /></button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Nama Fasilitas</label>
                  <input 
                    type="text" 
                    value={facilityForm.name} 
                    onChange={e => setFacilityForm({...facilityForm, name: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase">Icon (Emoji)</label>
                  <input 
                    type="text" 
                    value={facilityForm.icon} 
                    onChange={e => setFacilityForm({...facilityForm, icon: e.target.value})}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs"
                    placeholder="e.g. 🕌"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Status Kondisi</label>
                <select 
                  value={facilityForm.status}
                  onChange={e => setFacilityForm({...facilityForm, status: e.target.value as any})}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs font-bold"
                >
                  <option value="Baik">Baik</option>
                  <option value="Perbaikan">Perbaikan</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Deskripsi</label>
                <textarea 
                  value={facilityForm.description} 
                  onChange={e => setFacilityForm({...facilityForm, description: e.target.value})}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl text-xs h-24"
                />
              </div>
            </div>
            <button 
              onClick={handleSaveFacility}
              className="w-full py-3 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase shadow-xl"
            >
              Simpan Fasilitas
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
