
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import type { KajianSchedule } from '@/src/types';
import { Calendar, User, MapPin, Tag } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/src/lib/utils';
import { MOCK_KAJIAN } from '@/src/data/mockData';

export default function JadwalKajian() {
  const [kajian, setKajian] = useState<KajianSchedule[]>([]);
  const [filter, setFilter] = useState('Semua');
  const [loading, setLoading] = useState(true);

  const categories = ['Semua', 'Tauhid', 'Fiqih', 'Tafsir', 'Hadits', 'Umum'];

  useEffect(() => {
    async function fetchKajian() {
      try {
        const { data, error } = await supabase.from('kajian_schedules')
          .select('*')
          .order('start_time', { ascending: true });
        
        if (data && data.length > 0 && !error) {
          setKajian(data);
        } else {
          setKajian(MOCK_KAJIAN as any);
        }
      } catch (e) {
        setKajian(MOCK_KAJIAN as any);
      }
      setLoading(false);
    }
    fetchKajian();
  }, []);

  const filteredKajian = filter === 'Semua' 
    ? kajian 
    : kajian.filter(k => k.category === filter);

  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-forest mb-2">Jadwal Kajian Islam</h2>
        <p className="text-gray-600">Terbuka untuk Umum di Mesjid Jami Al Abrar</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm",
              filter === cat 
                ? "bg-forest text-white" 
                : "bg-white text-gray-600 hover:bg-cream border border-gray-100"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <div key={i} className="h-32 bg-white animate-pulse rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredKajian.map((k) => (
            <div key={k.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow">
              <div className="md:w-32 flex flex-col items-center justify-center bg-cream rounded-xl p-4 text-forest border border-forest/10">
                <span className="text-sm font-bold uppercase">{format(new Date(k.start_time), 'EEE', { locale: id })}</span>
                <span className="text-3xl font-bold">{format(new Date(k.start_time), 'dd')}</span>
                <span className="text-xs">{format(new Date(k.start_time), 'MMM yy')}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-terracotta/10 text-terracotta text-[10px] font-bold rounded uppercase">
                    {k.category}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1 font-medium italic">
                    {k.recurrence}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{k.title}</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-forest" />
                    <span>Ustadz {k.speaker}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-forest" />
                    <span>{k.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-forest" />
                    <span>Jam {format(new Date(k.start_time), 'HH:mm')} WIB</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center">
                <button className="w-full md:w-auto px-6 py-2 bg-forest text-cream rounded-lg text-sm font-bold hover:bg-forest/90 transition-colors">
                  Ingatkan Saya
                </button>
              </div>
            </div>
          ))}
          {filteredKajian.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada jadwal kajian untuk kategori ini.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
