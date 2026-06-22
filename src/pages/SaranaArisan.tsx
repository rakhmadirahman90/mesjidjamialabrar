
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import type { MosqueFacility, ArisanGroup, ArisanMember } from '@/src/types';
import { Wifi, Droplets, Home, Accessibility, Users, Trophy } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { MOCK_FACILITIES, MOCK_ARISAN_GROUPS, MOCK_ARISAN_MEMBERS } from '@/src/data/mockData';

export default function SaranaArisan() {
  const [facilities, setFacilities] = useState<MosqueFacility[]>([]);
  const [arisanGroups, setArisanGroups] = useState<ArisanGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<number | null>(null);
  const [members, setMembers] = useState<ArisanMember[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [facRes, groupRes] = await Promise.all([
          supabase.from('mosque_facilities').select('*'),
          supabase.from('arisan_groups').select('*')
        ]);
        
        if (facRes.data && facRes.data.length > 0) {
          setFacilities(facRes.data);
        } else {
          setFacilities(MOCK_FACILITIES as any);
        }

        if (groupRes.data && groupRes.data.length > 0) {
          setArisanGroups(groupRes.data);
          if (groupRes.data.length > 0) setSelectedGroup(groupRes.data[0].id);
        } else {
          setArisanGroups(MOCK_ARISAN_GROUPS as any);
          setSelectedGroup(MOCK_ARISAN_GROUPS[0].id);
        }
      } catch (e) {
        setFacilities(MOCK_FACILITIES as any);
        setArisanGroups(MOCK_ARISAN_GROUPS as any);
        setSelectedGroup(MOCK_ARISAN_GROUPS[0].id);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      supabase.from('arisan_members')
        .select('*')
        .eq('group_id', selectedGroup)
        .order('order_number', { ascending: true })
        .then(({ data }) => {
          if (data && data.length > 0) {
            setMembers(data);
          } else if (selectedGroup === 1) {
            setMembers(MOCK_ARISAN_MEMBERS as any);
          } else {
            setMembers([]);
          }
        });
    }
  }, [selectedGroup]);

  return (
    <div className="max-w-6xl mx-auto p-4 py-12 space-y-16">
      {/* Infrastructure Section */}
      <section>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-forest mb-2">Fasilitas Masjid</h2>
          <p className="text-gray-600">Sarana penunjang kenyamanan ibadah Anda</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((fac) => (
            <div key={fac.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:scale-[1.02] transition-all">
              <div className="w-12 h-12 rounded-xl bg-forest/10 flex items-center justify-center text-forest mb-4">
                {/* Dynamically mapping icons could be complex, using generic for now */}
                {fac.icon_name === 'wifi' ? <Wifi /> : 
                 fac.icon_name === 'wudhu' ? <Droplets /> : 
                 fac.icon_name === 'musafir' ? <Home /> : <Accessibility />}
              </div>
              <h3 className="font-bold text-gray-800 mb-2">{fac.name}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{fac.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Arisan Section */}
      <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-12 border-b border-gray-50 bg-cream">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-terracotta rounded-2xl text-white">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-forest">Arisan Majelis Taklim</h2>
                <p className="text-gray-600">Kegiatan Rutin Ibu-ibu jamaah Al Abrar</p>
              </div>
            </div>
            <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-gray-200">
              {arisanGroups.map(group => (
                <button
                  key={group.id}
                  onClick={() => setSelectedGroup(group.id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                    selectedGroup === group.id ? "bg-forest text-white shadow-md" : "text-gray-500 hover:bg-cream"
                  )}
                >
                  {group.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Members List */}
          <div className="lg:col-span-2">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              Daftar Anggota & Urutan Kocokan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {members.map(m => (
                <div 
                  key={m.id} 
                  className={cn(
                    "p-4 rounded-2xl border transition-all flex items-center justify-between",
                    m.has_received 
                      ? "bg-green-50 border-green-100 opacity-60" 
                      : "bg-white border-gray-100 hover:border-gold"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center text-xs font-bold">
                      {m.order_number}
                    </span>
                    <span className="font-bold text-gray-700">{m.name}</span>
                  </div>
                  {m.has_received && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded uppercase">Sudah Menang</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Winner History / Stats */}
          <div className="space-y-6">
            <div className="bg-forest text-white p-6 rounded-2xl">
              <Trophy className="h-10 w-10 text-gold mb-4" />
              <h4 className="text-lg font-bold mb-1">Total Pemenang</h4>
              <p className="text-3xl font-bold mb-4">{members.filter(m => m.has_received).length} / {members.length}</p>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gold" 
                  style={{ width: `${(members.filter(m => m.has_received).length / members.length) * 100}%` }}
                />
              </div>
            </div>
            
            <div className="p-6 bg-cream rounded-2xl border border-forest/10">
              <h4 className="font-bold text-forest mb-4">Pemenang Terakhir</h4>
              <div className="space-y-4">
                {members.filter(m => m.has_received).sort((a,b) => new Date(b.receive_date).getTime() - new Date(a.receive_date).getTime()).slice(0, 3).map(m => (
                  <div key={m.id} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <span className="font-medium text-gray-700">{m.name}</span>
                    <span className="text-gray-400 font-mono text-[10px]">{m.receive_date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
