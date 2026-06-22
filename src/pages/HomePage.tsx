import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/src/lib/supabase';
import { HadithWidget, PrayerTimesWidget } from '@/src/components';
import { 
  Youtube, 
  Heart, 
  Users, 
  Newspaper, 
  ArrowRight, 
  Building2, 
  History, 
  Target, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight, 
  Compass,
  Zap,
  BookOpen,
  Coffee,
  Home,
  Sparkles,
  Award,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { MosqueProfile, AktivitasItem } from '../types';
import { LocalDb, HomeSlider, LivestreamConfig } from '../lib/localStorageDb';

const getIconComponent = (name?: string) => {
  switch (name) {
    case 'book': return BookOpen;
    case 'coffee': return Coffee;
    case 'home': return Home;
    case 'users': return Users;
    case 'heart': return Heart;
    case 'zap': return Zap;
    case 'sparkles': return Sparkles;
    case 'award': return Award;
    default: return Sparkles;
  }
};

export default function HomePage() {
  const [profile, setProfile] = useState<MosqueProfile>(LocalDb.getProfile());
  const [sliders, setSliders] = useState<HomeSlider[]>(LocalDb.getSliders());
  const [livestream, setLivestream] = useState<LivestreamConfig>(LocalDb.getLivestream());
  const [activities, setActivities] = useState<AktivitasItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const slideInterval = useRef<NodeJS.Timeout | null>(null);

  const loadData = () => {
    setProfile(LocalDb.getProfile());
    setSliders(LocalDb.getSliders());
    setLivestream(LocalDb.getLivestream());
    setActivities(LocalDb.getActivities());
  };

  useEffect(() => {
    loadData();

    // Listen for realtime storage updates from Admin
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener('db-update', handleUpdate);

    // Auto play sliders
    startSlideTimer();

    return () => {
      window.removeEventListener('db-update', handleUpdate);
      stopSlideTimer();
    };
  }, []);

  const startSlideTimer = () => {
    stopSlideTimer();
    slideInterval.current = setInterval(() => {
      setCurrentSlide(prev => (sliders.length > 0 ? (prev + 1) % sliders.length : 0));
    }, 6000); // Slide every 6 seconds
  };

  const stopSlideTimer = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
    }
  };

  const nextSlide = () => {
    stopSlideTimer();
    setCurrentSlide(prev => (prev + 1) % sliders.length);
    startSlideTimer();
  };

  const prevSlide = () => {
    stopSlideTimer();
    setCurrentSlide(prev => (prev - 1 + sliders.length) % sliders.length);
    startSlideTimer();
  };

  return (
    <div className="space-y-8 pb-20 bg-cream/20">
      {/* Hero Sliders Section */}
      <section className="relative h-[460px] sm:h-[500px] lg:h-[550px] flex items-center justify-center text-white overflow-hidden bg-gradient-to-br from-terracotta to-terracotta-dark">
        {sliders.length > 0 ? (
          <div className="absolute inset-0 w-full h-full z-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 w-full h-full"
              >
                <div className="absolute inset-0 bg-black/55 z-10" />
                <img 
                  src={sliders[currentSlide]?.image || "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=2070"} 
                  alt={sliders[currentSlide]?.title} 
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        ) : (
          <div className="absolute inset-0 bg-slate-900" />
        )}
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-cream/95 via-transparent to-black/40 z-10" />
        
        {/* Dynamic Slide Content */}
        <div className="relative z-20 text-center px-4 max-w-4xl mt-[-30px] sm:mt-[-50px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.5 }}
              className="space-y-4 sm:space-y-6"
            >
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight drop-shadow-md leading-tight text-white px-2">
                {sliders[currentSlide]?.title || profile.name}
              </h1>
              <p className="text-xs sm:text-lg md:text-xl text-cream/90 font-medium max-w-2xl mx-auto drop-shadow-sm font-sans italic px-4">
                "{sliders[currentSlide]?.description || "Tempat Teduh Meniti Cahaya Ilahi di Jantung Kota"}"
              </p>
            </motion.div>
          </AnimatePresence>
 
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-6 sm:mt-8 px-4"
          >
            <Link to="/qurban" className="w-full sm:w-auto text-center bg-gold text-terracotta-dark hover:bg-gold/90 border border-gold px-6 py-3 sm:px-8 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold shadow-lg transition-all transform active:scale-95">
              Daftar Tabungan Qurban
            </Link>
            <Link to="/keuangan" className="w-full sm:w-auto text-center bg-terracotta/85 hover:bg-terracotta backdrop-blur-md text-white px-6 py-3 sm:px-8 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold border border-white/20 shadow-lg transition-all transform active:scale-95">
              Transparansi Keuangan
            </Link>
          </motion.div>
        </div>

        {/* Carousel arrows */}
        {sliders.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all border border-white/10 hidden md:block"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/20 hover:bg-black/40 text-white rounded-full transition-all border border-white/10 hidden md:block"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-16 sm:bottom-24 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {sliders.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setCurrentSlide(i); startSlideTimer(); }}
                  className={`w-2 h-2 rounded-full transition-all ${currentSlide === i ? 'bg-gold w-5' : 'bg-white/40 hover:bg-white/70'}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 -mt-12 sm:-mt-20 relative z-30">
        <div className="lg:col-span-2 space-y-8">
          <PrayerTimesWidget />
          <HadithWidget />

          {/* Layanan & Aktivitas Unggulan Section */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-terracotta/5 rounded-2xl">
                  <Zap className="h-6 w-6 text-terracotta" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-terracotta tracking-tight">Layanan & Aktivitas Unggulan</h2>
                  <p className="text-xs sm:text-sm text-gray-500">Program keagamaan, pelayanan sosial, dan pendidikan kami</p>
                </div>
              </div>
              <Link to="/aktivitas" className="group self-start sm:self-auto text-xs font-bold text-terracotta flex items-center gap-1 hover:underline">
                Lihat Semua Kegiatan <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activities.slice(0, 4).map((act) => {
                const Icon = getIconComponent(act.iconName);
                return (
                  <Link 
                    key={act.id} 
                    to={`/aktivitas?id=${act.id}`}
                    className="flex flex-col justify-between bg-cream/15 hover:bg-cream/35 border border-cream/35 rounded-3xl p-5 hover:border-gold/30 hover:shadow-md active:scale-98 transition-all duration-300 group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className={`w-10 h-10 rounded-xl ${act.iconColor || 'text-terracotta bg-cream'} flex items-center justify-center border shrink-0`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-[9px] font-sans font-extrabold tracking-wider uppercase text-terracotta bg-terracotta/10 px-2.5 py-1 rounded-lg">
                          {act.badge}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-gray-800 leading-snug group-hover:text-terracotta transition-colors">
                          {act.title}
                        </h3>
                        <p className="text-[10px] text-amber-600 font-extrabold uppercase tracking-wide">{act.subtitle}</p>
                      </div>

                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                        {act.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 mt-4 border-t border-cream/40 text-[10px] text-gray-400 font-medium">
                      <span className="flex items-center gap-1 font-serif text-terracotta/80 shrink-0">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-amber-600" />
                        {act.schedule}
                      </span>
                      <span className="text-xs font-bold text-terracotta group-hover:translate-x-1 transition-transform flex items-center gap-0.5 shrink-0">
                        Detail <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>


          
          {/* Livestreaming Kajian */}
          {livestream.isActive && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-xl flex items-center gap-2 text-terracotta tracking-tight">
                    <Youtube className="h-6 w-6 text-red-600 animate-pulse" />
                    {livestream.title || "Live Streaming Jami Al-Abrar"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Saksikan majelis ilmu secara online langsung dari Kota Parepare</p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 px-3 py-1.5 rounded-full animate-pulse self-start sm:self-auto border border-red-100">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
                  LIVE STREAMING
                </span>
              </div>
              <div className="aspect-video bg-gray-950 rounded-2xl overflow-hidden ring-4 ring-gray-100 shadow-inner">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src={`https://www.youtube.com/embed/${livestream.videoId}`} 
                  title={livestream.title}
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-terracotta text-white rounded-3xl p-8 shadow-lg relative overflow-hidden group">
            <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-gold/10 blur-3xl rounded-full" />
            <Heart className="h-10 w-10 text-gold mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-2xl font-bold mb-2 uppercase tracking-tight">Infaq Masjid</h3>
            <p className="text-sm text-cream/80 mb-6 leading-relaxed italic">
              "Sedekah tidak akan mengurangi harta kamu, melainkan melipatgandakannya."
            </p>
            <div className="space-y-3 bg-black/25 p-5 rounded-2xl border border-white/5 backdrop-blur-sm shadow-inner font-mono">
              <div className="flex justify-between items-center text-xs">
                <span className="text-cream/60 uppercase tracking-widest font-bold">BANK MANDIRI</span>
                <span className="font-bold tracking-wider text-gold">152-00123-45678</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-cream/60 uppercase tracking-widest font-bold">BANK BSI</span>
                <span className="font-bold tracking-wider text-gold">714-5556-7778</span>
              </div>
              <div className="text-[10px] text-center pt-3 border-t border-white/10 text-cream/70 font-sans tracking-tight font-bold">
                Menerima Zakat, Infaq, Sedekah & Wakaf — A.n Mesjid Jami Al Abrar
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-terracotta text-lg">Warta Masjid</h3>
              <Link to="/fasilitas" className="text-xs text-terracotta font-bold flex items-center gap-1 hover:underline">
                Lihat Semua <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-5">
              {[
                { title: 'Persiapan Tabungan Qurban 1447H dibuka', date: '21 Juni 2026', tag: 'Qurban' },
                { title: 'Kajian Rutin Tafsir Jalalain Parepare', date: '19 Juni 2026', tag: 'Kajian' },
                { title: 'Penyusunan Rincian Kas Bulanan Terbuka', date: 'Kemarin', tag: 'Keuangan' }
              ].map((news, i) => (
                <div key={i} className="flex gap-4 items-center group cursor-pointer border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                  <div className="w-12 h-12 rounded-xl bg-terracotta/5 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 group-hover:scale-110 transition-all duration-300">
                    <Newspaper className="h-6 w-6 text-terracotta" />
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-terracotta tracking-widest mb-0.5 block">{news.tag}</span>
                    <h4 className="text-sm font-bold text-gray-800 leading-tight group-hover:text-terracotta transition-colors">{news.title}</h4>
                    <span className="text-xs text-gray-400 font-medium">{news.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-terracotta to-terracotta-dark text-white rounded-3xl p-8 shadow-lg border border-terracotta-dark">
            <h3 className="font-bold text-lg mb-4 text-gold/90 uppercase tracking-wide">Hubungi Pengurus</h3>
            <div className="space-y-4 text-sm font-sans">
              <div className="flex gap-3 items-start">
                <Building2 className="h-5 w-5 text-gold shrink-0 mt-0.5" />
                <p className="text-cream/80 leading-relaxed text-xs">{profile.address}</p>
              </div>
              <div className="flex gap-3 items-center">
                <Users className="h-5 w-5 text-gold shrink-0" />
                <div>
                  <p className="text-white font-bold text-sm">{profile.phone}</p>
                  <p className="text-cream/50 text-[10px]">{profile.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
