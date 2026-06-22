
import { BrowserRouter, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProfilMasjid from './pages/ProfilMasjid';
import AktivitasMasjid from './pages/AktivitasMasjid';
import JadwalKajian from './pages/JadwalKajian';
import LaporanKeuangan from './pages/LaporanKeuangan';
import TabunganQurban from './pages/TabunganQurban';
import SaranaArisan from './pages/SaranaArisan';
import AdminDashboard from './pages/AdminDashboard';
import SupabaseGuard from './components/SupabaseGuard';
import PageTransition from './components/PageTransition';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        {/* Admin route */}
        <Route 
          path="/admin" 
          element={
            <PageTransition>
              <AdminDashboard />
            </PageTransition>
          } 
        />
        
        {/* Public routes wrapper */}
        <Route
          path="*"
          element={
            <div className="flex-1 flex flex-col">
              <Navbar />
              <main className="flex-1">
                <AnimatePresence mode="wait">
                  <Routes location={location}>
                    <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
                    <Route path="/profil" element={<Navigate to="/profil/sejarah" replace />} />
                    <Route path="/profil/sejarah" element={<PageTransition><ProfilMasjid initialTab="sejarah" /></PageTransition>} />
                    <Route path="/profil/pengurus" element={<PageTransition><ProfilMasjid initialTab="pengurus" /></PageTransition>} />
                    <Route path="/aktivitas" element={<PageTransition><AktivitasMasjid /></PageTransition>} />
                    <Route path="/kajian" element={<PageTransition><JadwalKajian /></PageTransition>} />
                    <Route path="/keuangan" element={<PageTransition><LaporanKeuangan /></PageTransition>} />
                    <Route path="/qurban" element={<PageTransition><TabunganQurban /></PageTransition>} />
                    <Route path="/fasilitas" element={<PageTransition><SaranaArisan /></PageTransition>} />
                  </Routes>
                </AnimatePresence>
              </main>
              <footer className="bg-gray-900 text-[#f5d9d2]/40 py-6 border-t border-gray-800 text-center text-xs font-mono tracking-wider">
                © 2026 MESJID JAMI AL ABRAR. ALL RIGHTS RESERVED.
              </footer>
            </div>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-white">
        <SupabaseGuard>
          <AnimatedRoutes />
        </SupabaseGuard>
      </div>
    </BrowserRouter>
  );
}
