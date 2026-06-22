
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import type { Hadith } from '@/src/types';
import { Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_HADITHS } from '@/src/data/mockData';

export default function HadithWidget() {
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHadiths() {
      try {
        const { data, error } = await supabase.from('hadiths').select('*');
        if (data && data.length > 0 && !error) {
          setHadiths(data);
        } else {
          setHadiths(MOCK_HADITHS as any);
        }
      } catch (e) {
        setHadiths(MOCK_HADITHS as any);
      }
      setLoading(false);
    }
    fetchHadiths();
  }, []);


  useEffect(() => {
    if (hadiths.length > 0) {
      const timer = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % hadiths.length);
      }, 10000);
      return () => clearInterval(timer);
    }
  }, [hadiths]);

  if (loading) return <div className="h-48 bg-white/50 animate-pulse rounded-xl" />;
  if (hadiths.length === 0) return null;

  const current = hadiths[currentIndex];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5">
        <Quote className="h-24 w-24 text-forest" />
      </div>
      
      <div className="relative z-10">
        <h3 className="text-terracotta font-bold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
          <Quote className="h-4 w-4" />
          Hadits Hari Ini
        </h3>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            <p className="text-right text-2xl font-serif text-forest leading-relaxed leading-arabic" dir="rtl">
              {current.text_arab}
            </p>
            <p className="text-gray-600 italic font-medium">
              "{current.translation}"
            </p>
            {current.source && (
              <p className="text-xs text-gray-400 font-mono">
                Sumber: {current.source}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
