import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm p-6 bg-white rounded-3xl shadow-2xl z-50 border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-4 text-amber-600">
              <div className="p-2 bg-amber-50 rounded-full">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-black text-slate-800">{title}</h2>
            </div>
            
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              {message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-200 transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onCancel();
                }}
                className="flex-1 py-2.5 px-4 bg-rose-600 text-white font-bold text-sm rounded-xl hover:bg-rose-700 transition"
              >
                Ya, Lanjutkan
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
