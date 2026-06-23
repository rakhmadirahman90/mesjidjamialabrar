import { useState } from 'react';
import { Settings, Lock, User, X, ShieldAlert } from 'lucide-react';

interface AdminLoginProps {
  onLogin: (username: string, pin: string) => void;
  loginError: string;
  onClose: () => void;
}

export default function AdminLogin({ onLogin, loginError, onClose }: AdminLoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    onLogin(username, password);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center p-4 animate-fade-in">
      <button 
        onClick={onClose} 
        className="absolute top-4 right-4 p-2.5 bg-white/10 text-slate-300 hover:text-white rounded-full hover:bg-white/20 transition-all duration-200 outline-none active:scale-95 border border-white/5"
        title="Kembali ke Beranda"
      >
        <X className="h-5 w-5" />
      </button>
      
      <div className="bg-[#04150e]/95 rounded-[2.5rem] p-6 sm:p-10 shadow-[0_25px_60px_rgba(4,47,31,0.4)] border border-emerald-500/20 flex flex-col items-center text-center max-w-md w-full space-y-6 animate-slide-up">
        {/* Animated Icon Badge */}
        <div className="relative group">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl group-hover:scale-125 transition-all duration-500"></div>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-950 to-emerald-900 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-2xl">
            <Lock className="h-7 w-7 animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-white tracking-tight uppercase">Sistem Administrasi</h2>
          <p className="text-xs text-slate-400 font-medium max-w-[280px] mx-auto leading-relaxed">
            Silakan masukkan Username & Password Anda untuk masuk ke Dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-4 pt-2">
          {/* Username Input Field */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black uppercase text-emerald-400 tracking-wider ml-1">Username</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-emerald-500/60">
                <User className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Masukkan username admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] text-white border border-white/10 focus:border-emerald-500 focus:bg-[#030e0a] rounded-xl text-xs outline-none transition-all placeholder-slate-600 font-medium font-sans"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Password Input Field */}
          <div className="space-y-1 text-left">
            <label className="text-[10px] font-black uppercase text-emerald-400 tracking-wider ml-1">Password / PIN</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-emerald-500/60">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] text-white border border-white/10 focus:border-emerald-500 focus:bg-[#030e0a] rounded-xl text-xs outline-none transition-all placeholder-slate-600 font-medium font-mono"
                required
              />
            </div>
          </div>

          {/* Error Message Box */}
          {loginError && (
            <div className="text-[10px] text-rose-300 font-bold bg-rose-950/40 py-3 px-4 rounded-xl border border-rose-900/30 animate-shake flex items-end gap-2.5 text-left leading-relaxed">
              <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0" />
              <div>{loginError}</div>
            </div>
          )}

          {/* Credentials Info Note */}
          <div className="bg-emerald-950/20 rounded-xl p-3 border border-emerald-500/5 text-left">
            <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
              💡 <span className="text-emerald-400 font-bold">Default Kredensial:</span> Gunakan username <span className="text-white font-bold">`admin`</span> dengan password/PIN default <span className="text-white font-bold">`123456`</span>. Password dapat diubah di panel keamanan.
            </p>
          </div>
          
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-950/60 hover:shadow-emerald-500/10 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 select-none text-xs uppercase tracking-wider"
          >
            <Settings className="h-4 w-4" />
            Autentikasi & Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
