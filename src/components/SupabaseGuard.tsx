import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { isSupabaseConfigured } from '@/src/lib/supabase';

interface Props {
  children: ReactNode;
}

export default function SupabaseGuard({ children }: Props) {
  const configured = isSupabaseConfigured();
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin');

  // We automatically bypass the full-screen database configuration block so that:
  // 1. Visitors to the live deployed website get a fully active, functioning website immediately.
  // 2. The client-side localStorage/LocalDb engine handles all data, schedules, and calculations beautifully.
  // 3. For admins, we will transparently show status notifications directly inside the Admin Panel.
  return (
    <div className="flex-1 flex flex-col relative">
      {!configured && isAdminPage && (
        <div className="bg-amber-500/10 text-amber-800 border-b border-amber-500/15 px-4 py-3 text-xs flex flex-col sm:flex-row gap-2 justify-between items-center sm:px-6 md:px-8 font-sans relative z-50">
          <div className="flex items-center gap-2">
            <span className="text-sm">⚠️</span>
            <p>
              <strong>Mode Demo & Penyimpanan Lokal Aktif:</strong> Database Supabase Cloud belum dihubungkan. Data yang Anda ubah akan tersimpan di browser ini secara lokal.
            </p>
          </div>
          <a
            href="https://supabase.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-wider bg-amber-600 hover:bg-amber-700 transition-all text-white px-3 py-1.5 rounded-lg font-bold whitespace-nowrap"
          >
            Hubungkan Supabase
          </a>
        </div>
      )}
      {children}
    </div>
  );
}

