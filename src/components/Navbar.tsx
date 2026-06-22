
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Calendar, 
  CreditCard, 
  LayoutDashboard, 
  Menu, 
  X, 
  Info, 
  HeartHandshake, 
  Compass, 
  Clock, 
  MapPin, 
  Sparkles,
  History,
  UserCheck,
  Zap,
  BookOpen,
  Coffee,
  Home,
  Users,
  Heart,
  Award
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { LocalDb } from '../lib/localStorageDb';

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

const navItems = [
  { name: 'Beranda', path: '/', icon: Building2 },
  { 
    name: 'Profil', 
    icon: Compass,
    submenu: [
      { name: 'Visi & Sejarah', path: '/profil/sejarah', icon: History },
      { name: 'Struktur Pengurus', path: '/profil/pengurus', icon: UserCheck }
    ]
  },
  { name: 'Aktivitas Masjid', path: '/aktivitas', icon: Zap },
  { name: 'Jadwal Kajian', path: '/kajian', icon: Calendar },
  { name: 'Laporan Kas', path: '/keuangan', icon: CreditCard },
  { name: 'Sarana & Arisan', path: '/fasilitas', icon: Info },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [time, setTime] = useState('');
  const [activities, setActivities] = useState<any[]>([]);
  const location = useLocation();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WITA');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    const loadActivities = () => {
      setActivities(LocalDb.getActivities());
    };
    loadActivities();
    window.addEventListener('db-update', loadActivities);

    return () => {
      clearInterval(interval);
      window.removeEventListener('db-update', loadActivities);
    };
  }, []);

  // Build dynamic nav items
  const dynamicNavItems = navItems.map(item => {
    if (item.name === 'Aktivitas Masjid' && activities.length > 0) {
      return {
        ...item,
        submenu: activities.map(act => ({
          name: act.title,
          path: `/aktivitas?id=${act.id}`,
          icon: getIconComponent(act.iconName)
        }))
      };
    }
    return item;
  });

  return (
    <header className="sticky top-0 z-50 w-full shadow-lg">
      {/* Premium Top Announcement / Utility Bar */}
      <div className="bg-terracotta-dark text-[#f5d9d2] border-b border-terracotta/30 text-[11px] md:text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 font-sans">
              <MapPin className="h-3.5 w-3.5 text-gold shrink-0" />
              Parepare, Sulawesi Selatan
            </span>
            <span className="hidden md:inline-block h-3 w-[1px] bg-terracotta-light/25"></span>
            <span className="hidden md:flex items-center gap-1.5 font-sans animate-pulse text-gold font-medium">
              <Sparkles className="h-3 w-3 shrink-0" />
              Masjid Buka 24 Jam & Kamar Musafir Ramah
            </span>
          </div>
          <div className="flex items-center space-x-2 font-mono font-bold tracking-wider text-gold">
            <Clock className="h-3.5 w-3.5 text-[#f5d9d2]" />
            <span>{time}</span>
          </div>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <nav className="bg-terracotta text-white border-b border-terracotta-dark/40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2.5 group">
                <div className="w-10 h-10 bg-gradient-to-br from-terracotta-light to-terracotta-dark rounded-xl flex items-center justify-center border border-gold/40 shadow-inner group-hover:border-gold/70 transition-colors">
                  <Building2 className="h-5 w-5 text-gold" />
                </div>
                <div className="flex flex-col">
                  <span className="font-sans font-extrabold text-white text-base tracking-normal uppercase leading-tight">
                    JAMI AL ABRAR
                  </span>
                  <span className="text-[9px] text-cream-dark tracking-widest font-sans font-bold uppercase leading-none mt-0.5">
                    Pusat Keteduhan & Sosial
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1.5">
              {dynamicNavItems.map((item) => {
                const hasSubmenu = "submenu" in item && !!item.submenu;

                if (hasSubmenu) {
                  const subItems = (item as any).submenu;
                  const isAnySubActive = subItems.some((sub: any) => {
                    const fullPath = location.pathname + location.search;
                    return location.pathname === sub.path || fullPath === sub.path;
                  });
                  return (
                    <div 
                      key={item.name} 
                      className="relative group py-2"
                      onMouseEnter={() => setHoveredMenu(item.name)}
                      onMouseLeave={() => setHoveredMenu(null)}
                    >
                      <Link
                        to={item.path || "/profil/sejarah"}
                        className={cn(
                          "relative px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all flex items-center gap-1.5 h-11",
                          isAnySubActive 
                            ? "text-white bg-terracotta-dark shadow-[inset_0_-2px_0_0_#e5b23b]" 
                            : "text-[#fcded7] hover:text-white hover:bg-terracotta-light/45"
                        )}
                      >
                        <item.icon className={cn("h-4 w-4 shrink-0", isAnySubActive ? "text-gold" : "text-[#f2afa1]")} />
                        <span>{item.name}</span>
                        <svg className="w-3 h-3 text-[#f2afa1] group-hover:text-white transition-colors ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                        </svg>
                        {isAnySubActive && (
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                        )}
                      </Link>

                      {/* Dropdown list */}
                      <AnimatePresence>
                        {hoveredMenu === item.name && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 mt-1 w-64 bg-terracotta-dark border border-terracotta-light/40 rounded-xl shadow-2xl overflow-hidden py-1.5 z-55"
                          >
                            {subItems.map((sub: any) => {
                              const fullPath = location.pathname + location.search;
                              const isSubActive = location.pathname === sub.path || fullPath === sub.path;
                              const SubIcon = sub.icon;
                              return (
                                <Link
                                  key={sub.name}
                                  to={sub.path}
                                  onClick={() => setHoveredMenu(null)}
                                  className={cn(
                                    "flex items-center gap-2.5 px-4 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b border-white/5 last:border-0",
                                    isSubActive 
                                      ? "text-gold bg-terracotta-light/40 font-extrabold" 
                                      : "text-[#fcded7] hover:text-white hover:bg-terracotta-light/30"
                                  )}
                                >
                                  <SubIcon className="h-4 w-4 text-gold shrink-0 animate-in fade-in" />
                                  <span className="truncate">{sub.name}</span>
                                </Link>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={cn(
                      "relative px-3.5 py-2.5 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all flex items-center gap-1.5 h-11",
                      isActive 
                        ? "text-white bg-terracotta-dark shadow-[inset_0_-2px_0_0_#e5b23b]" 
                        : "text-[#fcded7] hover:text-white hover:bg-terracotta-light/45"
                    )}
                  >
                    <item.icon className={cn("h-4 w-4 shrink-0", isActive ? "text-gold" : "text-[#f2afa1]")} />
                    <span>{item.name}</span>
                    {isActive && (
                      <motion.span 
                        layoutId="activeTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}

              <span className="w-[1px] h-6 bg-terracotta-dark mx-1"></span>

              <Link
                to="/admin"
                className="bg-gold hover:bg-gold-hover text-terracotta-dark font-sans font-extrabold text-xs uppercase px-4 h-11 rounded-lg transition-all active:scale-95 flex items-center gap-2 border border-gold/15 shadow-sm"
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span>Admin</span>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex lg:hidden items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle navigation menu"
                className="inline-flex items-center justify-center p-2.5 rounded-xl text-[#fcded7] hover:bg-terracotta-light/45 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gold/30 h-11 w-11"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu Drawer */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="lg:hidden bg-terracotta-dark border-t border-terracotta-light/35"
            >
              <div className="px-4 py-5 space-y-2.5">
                {dynamicNavItems.map((item) => {
                  const hasSubmenu = "submenu" in item && !!item.submenu;

                  if (hasSubmenu) {
                    const subItems = (item as any).submenu;
                    return (
                      <div key={item.name} className="space-y-1 bg-black/15 p-2.5 rounded-2xl border border-white/5">
                        <Link 
                          to={item.path || "/profil/sejarah"}
                          onClick={() => setIsOpen(false)}
                          className="px-3.5 py-1.5 text-[10px] font-extrabold text-[#fcded7] uppercase tracking-widest border-b border-white/5 flex items-center justify-between gap-2 group hover:text-white"
                        >
                          <div className="flex items-center gap-2">
                            <item.icon className="h-3.5 w-3.5 text-gold" />
                            <span>{item.name}</span>
                          </div>
                          <span className="text-[9px] bg-gold/15 text-gold px-2 py-0.5 rounded-lg">Masuk</span>
                        </Link>
                        {subItems.map((sub: any) => {
                          const fullPath = location.pathname + location.search;
                          const isSubActive = location.pathname === sub.path || fullPath === sub.path;
                          const SubIcon = sub.icon;
                          return (
                            <Link
                              key={sub.name}
                              to={sub.path}
                              onClick={() => setIsOpen(false)}
                              className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                                isSubActive 
                                  ? "bg-terracotta text-white border-l-4 border-gold shadow-md" 
                                  : "text-[#fcded7] hover:bg-terracotta/40 hover:text-white"
                              )}
                            >
                              <SubIcon className="h-4 w-4 text-gold shrink-0" />
                              <span>{sub.name}</span>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  }

                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold uppercase tracking-wide transition-all",
                        isActive 
                          ? "bg-terracotta text-white border-l-4 border-gold shadow-md" 
                          : "text-[#fcded7] hover:bg-terracotta/40 hover:text-white"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-gold" : "text-[#f2afa1]")} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}

                <div className="pt-4 border-t border-white/10 mt-4">
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-4 rounded-xl text-sm font-bold bg-gold hover:bg-gold-hover text-[#3e140d] shadow-md transition-all active:scale-98"
                  >
                    <LayoutDashboard className="h-5 w-5 shrink-0" />
                    <span>DASHBOARD PORTAL ADMIN</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
