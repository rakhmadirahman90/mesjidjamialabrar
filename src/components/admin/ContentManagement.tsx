
import { useState, useEffect } from 'react';
import { supabase } from '@/src/lib/supabase';
import { Hadith, KajianSchedule } from '@/src/types';
import { Quote, Calendar, Plus, Trash2, Loader2, Save } from 'lucide-react';
import { MOCK_HADITHS, MOCK_KAJIAN } from '@/src/data/mockData';

export default function ContentManagement() {
  const [hadiths, setHadiths] = useState<Hadith[]>([]);
  const [kajian, setKajian] = useState<KajianSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'hadith' | 'kajian'>('hadith');

  useEffect(() => {
    async function fetchData() {
      try {
        const [hRes, kRes] = await Promise.all([
          supabase.from('hadiths').select('*'),
          supabase.from('kajian_schedules').select('*').order('start_time', { ascending: true })
        ]);

        if (hRes.data && hRes.data.length > 0) setHadiths(hRes.data);
        else setHadiths(MOCK_HADITHS as any);

        if (kRes.data && kRes.data.length > 0) setKajian(kRes.data);
        else setKajian(MOCK_KAJIAN as any);
      } catch (e) {
        setHadiths(MOCK_HADITHS as any);
        setKajian(MOCK_KAJIAN as any);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const addHadith = async () => {
    const newHadith = {
      text_arab: 'Baru...',
      translation: 'Terjemahan...',
      source: 'HR. ...',
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase.from('hadiths').insert([newHadith]).select();
    if (data) setHadiths([data[0], ...hadiths]);
  };

  const removeHadith = async (id: number) => {
    if (!confirm('Hapus hadits ini?')) return;
    await supabase.from('hadiths').delete().eq('id', id);
    setHadiths(hadiths.filter(h => h.id !== id));
  };

  const addKajian = async () => {
    const newKajian = {
      title: 'Judul Kajian...',
      speaker: 'Ustadz...',
      location: 'Mesjid...',
      start_time: new Date().toISOString(),
      category: 'Umum'
    };
    const { data, error } = await supabase.from('kajian_schedules').insert([newKajian]).select();
    if (data) setKajian([data[0], ...kajian]);
  };

  const removeKajian = async (id: number) => {
    if (!confirm('Hapus jadwal ini?')) return;
    await supabase.from('kajian_schedules').delete().eq('id', id);
    setKajian(kajian.filter(k => k.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex gap-2">
        <button 
          onClick={() => setActiveTab('hadith')}
          className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'hadith' ? 'bg-forest text-gold shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <Quote className="h-4 w-4" /> Manajemen Hadits
        </button>
        <button 
          onClick={() => setActiveTab('kajian')}
          className={`flex-1 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'kajian' ? 'bg-forest text-gold shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}
        >
          <Calendar className="h-4 w-4" /> Jadwal Kajian
        </button>
      </div>

      {activeTab === 'hadith' ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-4">
            <h3 className="font-bold text-forest">Daftar Hadits Harian</h3>
            <button onClick={addHadith} className="bg-terracotta text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:opacity-90">
              <Plus className="h-4 w-4" /> Tambah Hadits
            </button>
          </div>
          <div className="grid gap-6">
            {hadiths.map((h) => (
              <div key={h.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm group">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-right flex-1 px-4">
                    <p className="text-2xl font-arab text-forest font-bold leading-loose mb-4">{h.text_arab}</p>
                    <p className="text-sm text-gray-600 italic leading-relaxed">"{h.translation}"</p>
                    <p className="text-xs font-bold text-gold mt-2">-- {h.source}</p>
                  </div>
                  <button onClick={() => removeHadith(h.id)} className="p-2 text-red-300 hover:text-red-500 transition-colors">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-4">
            <h3 className="font-bold text-forest">Jadwal Kajian Masjid</h3>
            <button onClick={addKajian} className="bg-terracotta text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:opacity-90">
              <Plus className="h-4 w-4" /> Tambah Jadwal
            </button>
          </div>
          <div className="grid gap-4">
            {kajian.map((k) => (
              <div key={k.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between group">
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 bg-cream rounded-2xl flex flex-col items-center justify-center border border-gold/20">
                    <span className="text-[10px] font-bold text-terracotta uppercase">Kajian</span>
                    <Calendar className="h-5 w-5 text-forest" />
                  </div>
                  <div>
                    <h4 className="font-bold text-forest text-lg">{k.title}</h4>
                    <p className="text-sm text-gray-500 font-medium">Bersama: {k.speaker}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-[10px] bg-forest/5 text-forest px-2 py-0.5 rounded-full font-bold uppercase">{k.category}</span>
                      <span className="text-[10px] text-gray-400 font-bold">{k.location}</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => removeKajian(k.id)} className="p-2 text-red-300 hover:text-red-500 transition-colors">
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
