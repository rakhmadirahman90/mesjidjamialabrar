import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  ShieldAlert, 
  X 
} from 'lucide-react';
import { NotificationLog } from '../types';

interface ToastProps {
  logs: NotificationLog[];
  onRemove: (id: string) => void;
}

export default function ProfessionalToasts({ logs, onRemove }: ToastProps) {
  // Only show the most recent 3 toasts to avoid clutter
  const recentToasts = logs.slice(0, 3);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case 'alert': return <ShieldAlert className="h-5 w-5 text-amber-500" />;
      case 'info': return <Info className="h-5 w-5 text-blue-500" />;
      default: return <AlertCircle className="h-5 w-5 text-slate-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-50 border-emerald-100';
      case 'alert': return 'bg-amber-50 border-amber-100';
      case 'info': return 'bg-blue-50 border-blue-100';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      <AnimatePresence mode="popLayout">
        {recentToasts.map((log) => (
          <motion.div
            key={log.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border shadow-2xl backdrop-blur-md ${getBgColor(log.type)}`}
          >
            <div className="shrink-0 mt-0.5">
              {getIcon(log.type)}
            </div>
            <div className="flex-1 min-w-0 space-y-0.5">
              <h5 className="text-[11px] font-black uppercase tracking-[0.1em] text-slate-800">
                {log.title}
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {log.message}
              </p>
            </div>
            <button 
              onClick={() => onRemove(log.id)}
              className="shrink-0 p-1 hover:bg-black/5 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
