import { useState } from 'react';
import { Settings, Lock, X } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (pin: string) => void;
  loginError: string;
  onClose: () => void;
}

export default function AdminLogin({ onLogin, loginError, onClose }: AdminLoginProps) {
  const [pin, setPin] = useState('');

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
        <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition"
              >
                <X className="h-6 w-6" />
              </button>
      <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-2xl border border-slate-100 flex flex-col items-center text-center max-w-md w-full space-y-8 animate-slide-up">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center text-4xl shadow-inner">
          <Lock className="h-10 w-10" />
        </div>
        
        <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">Admin Authentication</h2>
            <p className="text-sm text-slate-500 font-medium">Input PIN untuk mengakses dashboard konfigurasi masjid.</p>
        </div>
                    
        <div className="w-full space-y-4">
          <input
            type="password"
            placeholder="••••••••"
            maxLength={10}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') onLogin(pin);
            }}
            className="w-full text-center tracking-[0.5em] font-mono text-3xl py-5 bg-slate-50 border-2 border-slate-100 focus:border-emerald-500 focus:bg-white rounded-2xl outline-none transition-all shadow-sm"
            autoFocus
          />
          {loginError && (
            <div className="text-xs text-rose-600 font-bold bg-rose-50 py-3 px-4 rounded-xl border border-rose-100 animate-shake flex items-center gap-2 justify-center">
              <span>⚠️</span> {loginError}
            </div>
          )}
          
          <button
            onClick={() => onLogin(pin)}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl shadow-slate-900/20 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Konfirmasi Kode Akses
          </button>
        </div>
      </div>
    </div>
  );
}
