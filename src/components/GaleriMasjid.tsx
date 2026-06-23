import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Play, 
  Pause, 
  Maximize2, 
  Plus, 
  Trash2, 
  Image as ImageIcon,
  Loader2,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { subscribeToCollection, addDocument, deleteDocument } from '../lib/db';

interface Album {
  id?: string;
  title: string;
  date: string; // Format: YYYY-MM-DD
  images: string[];
}

interface GaleriMasjidProps {
  isAdmin: boolean;
}

// Beautiful Indonesian Month list
const MONTHS_INDONESIAN = [
  { value: 'all', label: 'Semua Bulan' },
  { value: '01', label: 'Januari' },
  { value: '02', label: 'Februari' },
  { value: '03', label: 'Maret' },
  { value: '04', label: 'April' },
  { value: '05', label: 'Mei' },
  { value: '06', label: 'Juni' },
  { value: '07', label: 'Juli' },
  { value: '08', label: 'Agustus' },
  { value: '09', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' }
];

// Beautiful initial seed data to match the screenshots perfectly
const INITIAL_ALBUMS_SEED: Album[] = [
  {
    title: 'Masjid Al Abrar dan Kedubes AS Gelar Coaching Clinic Basket Bersama Jamarr Johnson',
    date: '2026-06-11',
    images: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=800',
      'https://images.unsplash.com/photo-1519766304817-4f37bda74a27?q=80&w=800',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=800',
      'https://images.unsplash.com/photo-1471295263379-6ca45cbe2907?q=80&w=800',
      'https://images.unsplash.com/photo-1505666287802-931dc83948e9?q=80&w=800'
    ]
  },
  {
    title: 'Gandeng Bank Muamalat, 50 Peserta Ikuti Pembinaan UMKM dan Pengembangan Ekonomi Umat di Al Abrar',
    date: '2026-06-11',
    images: [
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800',
      'https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=800',
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800',
      'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=800',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800',
      'https://images.unsplash.com/photo-1531535934027-667f6db87540?q=80&w=800'
    ]
  },
  {
    title: 'Peringatan Hari Besar Islam & Kajian Akbar Istiqomah bersama Takmir Masjid Jami Al Abrar',
    date: '2026-05-24',
    images: [
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=800',
      'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=800',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800',
      'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800'
    ]
  },
  {
    title: 'Pelepasan Calon Jemaah Haji Kecamatan Ujung Kota Parepare oleh Pengurus Al Abrar',
    date: '2026-05-10',
    images: [
      'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=800',
      'https://images.unsplash.com/photo-1565552645632-d725f8bfc19a?q=80&w=800',
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=800',
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800'
    ]
  }
];

export default function GaleriMasjid({ isAdmin }: GaleriMasjidProps) {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  
  // Real active filter set on clicking "CARI ALBUM"
  const [activeSearch, setActiveSearch] = useState('');
  const [activeMonthFilter, setActiveMonthFilter] = useState('all');

  // Lightbox / Detail Slider State
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Admin states for adding new gallery content
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newImages, setNewImages] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dropdown UI status
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);

  // Fetch albums on mount
  useEffect(() => {
    const unsub = subscribeToCollection<Album>('galleries', (data) => {
      if (data.length === 0) {
        // Auto-seed initial datasets if Firestore is empty to provide perfect illustration out-of-the-box
        INITIAL_ALBUMS_SEED.forEach(async (album) => {
          await addDocument('galleries', album);
        });
      } else {
        // Sort by date descending
        const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
        setAlbums(sorted);
      }
    });

    return () => unsub();
  }, []);

  // Autoplay handler in Lightbox
  useEffect(() => {
    if (!isPlaying || !activeAlbum) return;

    const interval = setInterval(() => {
      setActiveImageIdx((prev) => (prev + 1) % activeAlbum.images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPlaying, activeAlbum]);

  // Helper: Format Indonesian Date (e.g. "11 JUN 2026")
  const formatIndoDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      
      const day = String(d.getDate()).padStart(2, '0');
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MEI', 'JUN', 'JUL', 'AGS', 'SEP', 'OKT', 'NOV', 'DES'];
      const month = months[d.getMonth()];
      const year = d.getFullYear();
      
      return `${day} ${month} ${year}`;
    } catch {
      return dateStr;
    }
  };

  // Helper: Format Heading Group (e.g. "Juni 2026")
  const formatHeadingGroup = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      return `${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  // Apply visual filter
  const filteredAlbums = albums.filter((album) => {
    // Search keyword constraint
    const matchesKeyword = activeSearch === '' || 
      album.title.toLowerCase().includes(activeSearch.toLowerCase());
    
    // Month filter constraint
    let matchesMonth = true;
    if (activeMonthFilter !== 'all') {
      try {
        const parts = album.date.split('-');
        const monthPart = parts[1]; // YYYY-MM-DD
        matchesMonth = monthPart === activeMonthFilter;
      } catch {
        matchesMonth = false;
      }
    }

    return matchesKeyword && matchesMonth;
  });

  // Group by Month & Year for output headings
  const groupedAlbums: { [key: string]: Album[] } = {};
  filteredAlbums.forEach((album) => {
    const heading = formatHeadingGroup(album.date);
    if (!groupedAlbums[heading]) {
      groupedAlbums[heading] = [];
    }
    groupedAlbums[heading].push(album);
  });

  // Admin: handle dynamic input fields
  const handleAddImageUrlField = () => {
    setNewImages([...newImages, '']);
  };

  const handleRemoveImageUrlField = (index: number) => {
    const current = [...newImages];
    current.splice(index, 1);
    setNewImages(current);
  };

  const handleImageUrlChange = (index: number, val: string) => {
    const current = [...newImages];
    current[index] = val;
    setNewImages(current);
  };

  // Admin submit
  const handleAddNewAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    // Filter empty image URLs
    const validImages = newImages.filter(img => img.trim() !== '');
    if (validImages.length === 0) {
      alert("Harap masukkan minimal 1 URL Gambar");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDocument('galleries', {
        title: newTitle,
        date: newDate,
        images: validImages
      });

      // Reset
      setNewTitle('');
      setNewDate('');
      setNewImages(['']);
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAlbum = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Apakah Anda yakin ingin menghapus album galeri ini?")) {
      try {
        await deleteDocument('galleries', id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-16 w-full" id="galeri_masjid_container">
      
      {/* 1. Header Banner & Filter Area */}
      <section className="relative rounded-[2.5rem] bg-gradient-to-tr from-emerald-950 via-emerald-900 to-slate-900 text-white p-8 sm:p-12 shadow-2xl">
        {/* Abstract motif backdrop decoration wrapped inside overflow-hidden to allow dropdown to pop out nicely */}
        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_70%_20%,_var(--tw-gradient-stops))] from-yellow-400 via-transparent to-transparent"></div>
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative z-10 max-w-3xl space-y-6 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-800/40 border border-emerald-500/30 text-xs font-black text-emerald-300 uppercase tracking-widest">
            <Sparkles className="h-3.5 w-3.5" /> Galeri Dokumentasi
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight uppercase leading-none font-display">
            Galeri <span className="text-emerald-400 underline decoration-yellow-400 decoration-wavy">Visualisasi</span>
          </h1>
          <p className="text-emerald-100/70 text-xs sm:text-sm max-w-xl font-medium tracking-wide">
            Visualisasi kegiatan jamaah, syiar keagamaan Islam, pembinaan umat, serta dokumentasi sarana prasarana Masjid Jami Al Abrar Parepare.
          </p>
        </div>

        {/* Search Search Box (Persis Seperti Lampiran Foto) */}
        <div className="mt-10 bg-white text-slate-800 p-4 sm:p-6 rounded-[2rem] shadow-xl border border-slate-100 relative z-20 flex flex-col md:flex-row gap-4 items-end">
          
          {/* Key word Input */}
          <div className="w-full space-y-1.5 text-left">
            <label className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider block">
              Cari Nama Album
            </label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Ketik kata kunci..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white rounded-xl py-3 pl-11 pr-4 text-xs font-black outline-none tracking-tight transition"
              />
            </div>
          </div>

          {/* Month Selector with custom dropdown representation */}
          <div className="w-full md:w-80 space-y-1.5 text-left relative">
            <label className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-wider block">
              Semua Bulan
            </label>
            <button
              onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl py-3 px-4 text-xs font-black flex items-center justify-between outline-none transition"
            >
              <span>{MONTHS_INDONESIAN.find(m => m.value === selectedMonth)?.label}</span>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </button>

            {/* Custom overlay dropdown box */}
            <AnimatePresence>
              {showMonthDropdown && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowMonthDropdown(false)}></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-40 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto no-scrollbar"
                  >
                    {MONTHS_INDONESIAN.map((month) => (
                      <button
                        key={month.value}
                        type="button"
                        onClick={() => {
                          setSelectedMonth(month.value);
                          setShowMonthDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-emerald-50 hover:text-emerald-700 transition ${
                          selectedMonth === month.value ? 'bg-emerald-50 text-emerald-800 font-bold' : 'text-slate-700'
                        }`}
                      >
                        {month.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Search trigger command */}
          <button
            onClick={() => {
              setActiveSearch(searchKeyword);
              setActiveMonthFilter(selectedMonth);
            }}
            className="w-full md:w-56 bg-[#004d40] hover:bg-[#003d33] text-white font-black uppercase text-xs tracking-widest py-3 px-6 rounded-xl transition duration-300 shadow-md flex items-center justify-center gap-2"
          >
            Cari Album
          </button>
        </div>
      </section>

      {/* 2. Admin action area */}
      {isAdmin && (
        <section className="bg-amber-50/50 border border-amber-200/60 rounded-[2rem] p-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                🔒 Panel Admin: Kelola Album Galeri
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Tambahkan foto liputan baru, dokumentasi kunjungan syiar, atau hapus album lama.
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow-sm shrink-0 self-start sm:self-center"
            >
              {showAddForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {showAddForm ? 'Tutup Formulir' : 'Tambah Album Baru'}
            </button>
          </div>

          {/* Add form slider accordion */}
          {showAddForm && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-6 border-t border-amber-200/80 pt-6 space-y-4"
              onSubmit={handleAddNewAlbum}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block text-left">Judul Album</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Contoh: Pembagian Sembako Ramadhan Masjid Al Abrar"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-amber-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 block text-left">Tanggal Kegiatan</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Dynamic image input arrays */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-700 block text-left">URL Gambar (Mendukung JPG, PNG, atau Unsplash)</label>
                  <button
                    type="button"
                    onClick={handleAddImageUrlField}
                    className="text-xs text-emerald-800 hover:text-emerald-900 font-extrabold flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Tambah Kolom URL
                  </button>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1 no-scrollbar">
                  {newImages.map((img, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="url"
                        required
                        value={img}
                        onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                        placeholder="https://images.unsplash.com/photo-..."
                        className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium outline-none"
                      />
                      {newImages.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveImageUrlField(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right pt-2 border-t border-amber-200/50">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md transition ml-auto inline-flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Simpan Album di Database Cloud
                </button>
              </div>
            </motion.form>
          )}
        </section>
      )}

      {/* 3. Photos Grid List grouped by Months (Persis Seperti Lampiran Foto) */}
      <div className="space-y-12">
        {filteredAlbums.length === 0 ? (
          <div className="bg-white border border-slate-200/60 rounded-[2.5rem] py-16 px-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mx-auto text-3xl">
              📂
            </div>
            <h3 className="text-base font-black text-slate-800">Album Tidak Ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ada dokumentasi kegiatan dengan kata kunci "{activeSearch}" untuk filter terpilih.
            </p>
          </div>
        ) : (
          Object.keys(groupedAlbums).map((headingGroup) => (
            <div key={headingGroup} className="space-y-6 text-left">
              {/* Group Heading Line with deep-green style indicator line */}
              <div className="border-b-2 border-yellow-500/80 pb-2 inline-block">
                <h2 className="text-2xl sm:text-3xl font-black text-[#0c3c26] tracking-tight font-display">
                  {headingGroup}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {groupedAlbums[headingGroup].map((album) => {
                  const imageCount = album.images.length;
                  const firstImg = album.images[0] || 'https://images.unsplash.com/photo-1564507592333-c60657eea523?max-w=800';
                  const secondImg = album.images[1];
                  const thirdImg = album.images[2];
                  
                  return (
                    <div 
                      key={album.id}
                      onClick={() => {
                        setActiveAlbum(album);
                        setActiveImageIdx(0);
                        setIsPlaying(false);
                      }}
                      className="bg-white border border-slate-100 rounded-[2.5rem] p-5 shadow-sm hover:shadow-xl hover:border-emerald-700/20 transition-all duration-300 cursor-pointer text-left group flex flex-col justify-between"
                    >
                      {/* Image Layout Exactly Like Screenshot 1 & 2 */}
                      <div className="w-full relative">
                        {/* If we have at least 2 images, show split layout, else standard simple */}
                        {imageCount >= 2 ? (
                          <div className="grid grid-cols-3 gap-2.5 h-48 sm:h-56 rounded-3xl overflow-hidden">
                            {/* Main Large left side image */}
                            <div className="col-span-2 overflow-hidden relative">
                              <img 
                                src={firstImg} 
                                alt={album.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                            
                            {/* Smaller thumbnails right stacked side */}
                            <div className="col-span-1 grid grid-rows-2 gap-2.5 h-full">
                              {/* Second photo */}
                              <div className="overflow-hidden relative h-full">
                                <img 
                                  src={secondImg || firstImg} 
                                  alt="Preview"
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover"
                                />
                              </div>

                              {/* Third photo with remaining counts */}
                              <div className="overflow-hidden relative h-full bg-slate-900">
                                {thirdImg ? (
                                  <img 
                                    src={thirdImg} 
                                    alt="Preview 2"
                                    referrerPolicy="no-referrer"
                                    className="w-full h-full object-cover opacity-80"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-emerald-950 flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-emerald-400" />
                                  </div>
                                )}
                                
                                {imageCount > 2 && (
                                  <div className="absolute inset-0 bg-emerald-950/70 flex items-center justify-center backdrop-blur-[2px]">
                                    <span className="text-white text-base sm:text-lg font-black tracking-wider">
                                      +{imageCount - 2}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-48 sm:h-56 rounded-3xl overflow-hidden">
                            <img 
                              src={firstImg} 
                              alt={album.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        
                        {/* Admin delete badge overlay */}
                        {isAdmin && (
                          <button
                            onClick={(e) => handleDeleteAlbum(album.id!, e)}
                            className="absolute top-3 left-3 bg-red-650 hover:bg-red-750 text-white p-2 rounded-xl transition shadow-md z-10"
                            title="Hapus Album"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Content details under physical mockup frame */}
                      <div className="mt-5 space-y-2">
                        <span className="text-[10px] sm:text-[11px] font-black text-emerald-600 tracking-wider font-mono block">
                          {formatIndoDate(album.date)}
                        </span>
                        
                        {/* Bold green title resembling image 2 */}
                        <h4 className="text-sm sm:text-base font-extrabold text-slate-800 group-hover:text-emerald-800 transition-colors line-clamp-2 leading-snug">
                          {album.title}
                        </h4>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. Lightbox Detail Slider Modal (Persis Seperti Lampiran Foto 3) */}
      <AnimatePresence>
        {activeAlbum && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between"
          >
            {/* Header: Title and Close button (Persis Foto 3) */}
            <div className="w-full p-4 sm:p-6 bg-slate-950 text-white flex justify-between items-center border-b border-white/5 relative z-10">
              <h2 className="text-sm sm:text-lg font-bold text-yellow-400 tracking-tight max-w-[85%] truncate text-left">
                {activeAlbum.title}
              </h2>
              <button 
                onClick={() => {
                  setActiveAlbum(null);
                  setIsFullScreen(false);
                  setIsPlaying(false);
                }}
                className="p-2 sm:p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-transform active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Middle slider visualizer */}
            <div className="flex-1 flex items-center justify-center relative p-2 sm:p-8 select-none">
              
              {/* Left back arrows navigation */}
              <button
                onClick={() => setActiveImageIdx((prev) => (prev - 1 + activeAlbum.images.length) % activeAlbum.images.length)}
                className="absolute left-4 sm:left-8 z-10 p-3 sm:p-4 bg-slate-900/60 hover:bg-slate-850 text-white rounded-full border border-white/15 transition-all transform hover:scale-105 active:scale-90"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              {/* Large center graphic aspect frame */}
              <div className="max-w-4xl max-h-[60vh] sm:max-h-[68vh] w-full flex items-center justify-center p-1 relative">
                <motion.img 
                  key={activeImageIdx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  src={activeAlbum.images[activeImageIdx]} 
                  alt="Abrar Slides"
                  referrerPolicy="no-referrer"
                  className={`object-contain max-h-[58vh] sm:max-h-[66vh] rounded-2xl shadow-2xl transition-all ${isFullScreen ? 'w-screen h-screen max-w-none max-h-none object-contain fixed inset-0 z-50 bg-black' : ''}`}
                />

                {/* Exit full-screen escape triggers */}
                {isFullScreen && (
                  <button
                    onClick={() => setIsFullScreen(false)}
                    className="fixed top-6 right-6 z-50 bg-black/60 border border-white/10 text-white p-3 rounded-full hover:bg-black/90 transition"
                  >
                    <X className="h-6 w-6" />
                  </button>
                )}
              </div>

              {/* Right advances arrows navigation */}
              <button
                onClick={() => setActiveImageIdx((prev) => (prev + 1) % activeAlbum.images.length)}
                className="absolute right-4 sm:right-8 z-10 p-3 sm:p-4 bg-slate-900/60 hover:bg-slate-850 text-white rounded-full border border-white/15 transition-all transform hover:scale-105 active:scale-90"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>

            {/* Controls Bar: Autoplay, full-screen, thumbnails (Persis Foto 3) */}
            <div className="w-full bg-slate-950 p-4 sm:p-6 space-y-4 border-t border-white/5 relative z-10">
              
              {/* Media tools */}
              <div className="flex justify-center gap-4 text-xs font-bold text-white text-center">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 transition rounded-xl text-white outline-none active:scale-95"
                >
                  {isPlaying ? <Pause className="h-4 w-4 text-emerald-400" /> : <Play className="h-4 w-4" />}
                  <span>Auto Play</span>
                </button>

                <button
                  onClick={() => setIsFullScreen(!isFullScreen)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 transition rounded-xl text-white outline-none active:scale-95"
                >
                  <Maximize2 className="h-4 w-4 text-yellow-400" />
                  <span>Full Screen</span>
                </button>
              </div>

              {/* Thumbnails strip at bottom */}
              <div className="flex justify-center gap-2.5 overflow-x-auto py-1 max-w-lg mx-auto no-scrollbar">
                {activeAlbum.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveImageIdx(idx);
                      setIsPlaying(false);
                    }}
                    className={`w-14 h-11 rounded-lg overflow-hidden shrink-0 transition-all ${
                      idx === activeImageIdx 
                        ? 'ring-2 ring-emerald-500 scale-105 border-transparent' 
                        : 'opacity-40 hover:opacity-100 border border-white/15'
                    }`}
                  >
                    <img 
                      src={imgUrl} 
                      alt="Thumbnail" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
