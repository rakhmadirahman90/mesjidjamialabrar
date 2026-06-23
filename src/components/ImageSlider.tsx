import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause, 
  Compass, 
  Tv, 
  BookOpen, 
  Sparkles, 
  Calendar, 
  X, 
  Layout,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SlideItem } from '../types';

const IconMap: Record<string, React.ReactNode> = {
  Compass: <Compass className="h-3.5 w-3.5" />,
  Tv: <Tv className="h-3.5 w-3.5" />,
  BookOpen: <BookOpen className="h-3.5 w-3.5" />,
  Sparkles: <Sparkles className="h-3.5 w-3.5" />,
  Calendar: <Calendar className="h-3.5 w-3.5" />,
  Layout: <Layout className="h-3.5 w-3.5" />,
  Info: <Info className="h-3.5 w-3.5" />
};

export default function ImageSlider({
  slides,
  onNavigate
}: {
  slides: SlideItem[];
  onNavigate: (tab: any) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showTourModal, setShowTourModal] = useState<SlideItem | null>(null);
  const autoplayTimer = useRef<any>(null);

  // Fallback to empty slides if none provided
  const activeSlides = slides && slides.length > 0 ? slides : [];

  const clearAutoplay = () => {
    if (autoplayTimer.current) {
      clearInterval(autoplayTimer.current);
      autoplayTimer.current = null;
    }
  };

  const startAutoplay = () => {
    clearAutoplay();
    if (isPlaying && activeSlides.length > 0) {
      autoplayTimer.current = setInterval(() => {
        setCurrent((prev) => (prev + 1) % activeSlides.length);
      }, 6500);
    }
  };

  useEffect(() => {
    startAutoplay();
    return () => clearAutoplay();
  }, [isPlaying, current, activeSlides.length]);

  const handleNext = () => {
    if (activeSlides.length === 0) return;
    setCurrent((prev) => (prev + 1) % activeSlides.length);
  };

  const handlePrev = () => {
    if (activeSlides.length === 0) return;
    setCurrent((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleDotClick = (index: number) => {
    setCurrent(index);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const activeSlide = activeSlides[current];

  if (!activeSlide) return <div className="h-[450px] bg-slate-900 rounded-3xl flex items-center justify-center text-slate-500">Belum ada slider tersedia.</div>;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-950 shadow-md">
      
      {/* Decorative backdrop glow */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -translate-y-20 -translate-x-20"></div>
      
      {/* Primary Slide Window */}
      <div className="relative h-[520px] sm:h-[580px] lg:h-[650px] w-full overflow-hidden">
        
        {/* Slide Image Background Layer */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 0.65, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.7 }}
            className="absolute inset-0 w-full h-full"
          >
            <img 
              src={activeSlide.imageUrl} 
              alt={activeSlide.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </AnimatePresence>

        {/* Gradient Shadow Mask For Premium Contrast Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/45 to-slate-950/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-transparent to-transparent hidden md:block"></div>

        {/* Slide Foreground Content Overlays */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-10 z-10 text-left">
          
          {/* Top Line Action Header */}
          <div className="flex items-center justify-between">
            <span className={`px-3 py-1 flex items-center gap-1.5 rounded-full text-[10px] font-bold font-mono tracking-widest ${activeSlide.badgeColor || 'bg-slate-500/20 text-slate-350 border border-slate-500/30'} uppercase text-left`}>
              {IconMap[activeSlide.badgeIcon || 'Info'] || <Info className="h-3.5 w-3.5" />}
              <span>{activeSlide.badge || 'Informasi'}</span>
            </span>

            {/* Live Autoplay play/pause controller */}
            <button
              onClick={togglePlay}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition border border-white/10 select-none cursor-pointer"
              title={isPlaying ? "Jeda Transisi Otomatis" : "Mulai Transisi Otomatis"}
            >
              {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            </button>
          </div>

          {/* Middle Body Layout */}
          <div className="space-y-4 max-w-3xl mt-auto pb-6 sm:pb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-[2px] bg-amber-400"></div>
              <span className="text-[10px] sm:text-xs font-black tracking-[0.25em] text-amber-400 uppercase font-sans">
                {activeSlide.subtitle}
              </span>
            </div>
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="space-y-3 sm:space-y-4 text-left"
              >
                <h2 className="text-2xl sm:text-5xl lg:text-7xl font-serif font-black text-white tracking-tight leading-[1.1] pt-1">
                  {activeSlide.title}
                </h2>
                
                {/* Premium quote accent strip mimicking the Istiqlal design */}
                <div className="text-sm sm:text-2xl lg:text-3xl tracking-tight leading-snug font-serif font-semibold italic">
                  <span className="text-emerald-400 block sm:inline">Menyinari Negeri, </span>
                  <span className="text-amber-400 block sm:inline mt-0.5 sm:mt-0">Menjaga Harmoni.</span>
                </div>

                <p className="text-slate-200/90 text-[11px] sm:text-sm md:text-base leading-relaxed max-w-2xl font-light line-clamp-3 sm:line-clamp-none">
                  {activeSlide.description}
                </p>

                {/* Highly-styled call to action buttons directly within the Hero Slide layout */}
                <div className="pt-1.5 flex flex-wrap gap-2.5 sm:gap-4 items-center">
                  <button
                    onClick={() => {
                      const target = document.getElementById('main_content_anchor');
                      if (target) {
                        target.scrollIntoView({ behavior: 'smooth' });
                      }
                      if (activeSlide.actionTab) {
                        onNavigate(activeSlide.actionTab);
                      }
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-full px-4.5 py-2.5 sm:px-6 sm:py-3 text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-wider shadow-lg transform active:scale-95 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer border border-emerald-500/10"
                  >
                    <span>{activeSlide.actionText || 'Eksplorasi Layanan'}</span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => setShowTourModal(activeSlide)}
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-4 py-2.5 sm:px-5 sm:py-3 text-[10px] sm:text-xs md:text-sm font-extrabold uppercase tracking-wider backdrop-blur-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse shrink-0" />
                    <span>Detail Informasi</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>

        </div>

        {/* Carousel Arrow Navigation Controls */}
        <button
          onClick={handlePrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/35 hover:bg-slate-900/75 border border-white/5 hover:border-white/20 text-white/70 hover:text-white backdrop-blur-md transition-all z-20 cursor-pointer hidden sm:block"
          title="Slide Sebelumnya"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-900/35 hover:bg-slate-900/75 border border-white/5 hover:border-white/20 text-white/70 hover:text-white backdrop-blur-md transition-all z-20 cursor-pointer hidden sm:block"
          title="Slide Berikutnya"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

      </div>

      {/* Under-slider visual pagination bar and telemetry status */}
      <div className="bg-slate-950 border-t border-slate-900 p-4 flex items-center justify-between gap-4">
        
        {/* Standard Info Pairings */}
        <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-500 font-mono">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>DOKUMENTASI INTERAKTIF MASJID JAMI AL ABRAR PAREPARE ONLINE</span>
        </div>

        {/* Bullet Paginations */}
        <div className="flex gap-2 mx-auto md:mx-0">
          {activeSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Buka Slide ${i + 1}`}
            />
          ))}
        </div>

        <div className="text-[10px] text-slate-400 font-bold font-mono">
          {current + 1} / {activeSlides.length}
        </div>

      </div>

      {/* Tour Modal Overlay Layer */}
      <AnimatePresence>
        {showTourModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4" id="virtual-tour-modal">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]"
            >
              {/* Modal Banner Image */}
              <div className="h-44 sm:h-52 w-full relative">
                <img 
                  src={showTourModal.imageUrl} 
                  alt={showTourModal.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent"></div>
                <button
                  onClick={() => setShowTourModal(null)}
                  className="absolute right-4 top-4 p-2 rounded-full bg-slate-950/65 hover:bg-slate-950 text-white/80 hover:text-white transition border border-white/10"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="absolute bottom-4 left-4 sm:left-6 text-left">
                  <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${showTourModal.badgeColor}`}>
                    {showTourModal.badge}
                  </span>
                  <h3 className="text-white font-display font-extrabold text-base sm:text-lg tracking-tight mt-1">
                    {showTourModal.title}
                  </h3>
                </div>
              </div>

              {/* Scrollable Contents */}
              <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-left">
                
                {/* Paragraph Descriptions */}
                <div className="space-y-4">
                   <h4 className="font-display font-extrabold text-sm text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600" /> Profil Eksklusif Al Abrar
                  </h4>
                  {showTourModal.detailedStory?.paragraphs.map((p, idx) => (
                    <p key={idx} className="text-slate-600 text-xs leading-relaxed">
                      {p}
                    </p>
                  ))}
                </div>

                <hr className="border-slate-100" />

                {/* Grid of specs/specifications of this category */}
                <div className="space-y-3">
                  <h4 className="font-display font-extrabold text-sm text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-emerald-600" /> Detail Sistem & Informasi Teknis
                  </h4>
                  <div className="grid grid-cols-2 gap-3.5">
                    {showTourModal.detailedStory?.quickSpecs.map((spec, sIdx) => (
                      <div key={sIdx} className="bg-slate-50 border border-slate-100 p-3 rounded-2xl">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                          {spec.label}
                        </span>
                        <span className="block text-xs font-semibold text-slate-800 mt-0.5">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Guide action triggers */}
                <div className="bg-emerald-50 border border-emerald-100/65 py-4 px-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-950">
                  <div className="flex items-center gap-2.5 text-left self-start sm:self-center">
                    <span className="text-xl">🕌</span>
                    <div>
                      <p className="text-xs font-bold text-emerald-950">Sistem Terintegrasi</p>
                      <p className="text-[10px] text-emerald-800 leading-snug">
                        Terus jalin kebersamaan bersama jamaah Masjid Jami Al Abrar Lapadde.
                      </p>
                    </div>
                  </div>
                  
                  {showTourModal.actionTab && (
                    <button
                      onClick={() => {
                        setShowTourModal(null);
                        onNavigate(showTourModal.actionTab!);
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95"
                    >
                      Buka Fitur Ini
                    </button>
                  )}
                </div>

              </div>

              {/* Bottom footer button close */}
              <div className="bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
                <button
                  onClick={() => setShowTourModal(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700 font-bold text-xs transition"
                >
                  Tutup Tur Virtual
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
