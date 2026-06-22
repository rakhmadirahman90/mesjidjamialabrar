import { ReactNode } from 'react';
import { AlertCircle, Key, ExternalLink } from 'lucide-react';
import { isSupabaseConfigured } from '@/src/lib/supabase';

interface Props {
  children: ReactNode;
}

export default function SupabaseGuard({ children }: Props) {
  const configured = isSupabaseConfigured();

  if (!configured) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-red-50 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="h-8 w-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-forest mb-2">Konfigurasi Dibutuhkan</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Aplikasi ini memerlukan koneksi ke database Supabase. Silakan tambahkan kunci API berikut di panel <strong>Secrets</strong> (Ikon Gembok) di sebelah kiri:
          </p>
          
          <div className="space-y-3 mb-8 text-left">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <code className="text-xs font-mono text-gray-600">VITE_SUPABASE_URL</code>
              <Key className="h-4 w-4 text-gray-300" />
            </div>
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
              <code className="text-xs font-mono text-gray-600">VITE_SUPABASE_ANON_KEY</code>
              <Key className="h-4 w-4 text-gray-300" />
            </div>
          </div>
          
          <div className="flex flex-col gap-3">
            <a 
              href="https://supabase.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-forest text-white rounded-xl font-bold hover:bg-forest/90 transition-all"
            >
              Buka Supabase <ExternalLink className="h-4 w-4" />
            </a>
            <p className="text-[10px] text-gray-400">
              Setelah menambahkan secret, aplikasi akan otomatis memuat ulang.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
