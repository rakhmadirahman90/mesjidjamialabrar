import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

const jamaahData = [
  { name: 'Senin', jamaah: 150 },
  { name: 'Selasa', jamaah: 180 },
  { name: 'Rabu', jamaah: 160 },
  { name: 'Kamis', jamaah: 210 },
  { name: 'Jumat', jamaah: 850 },
  { name: 'Sabtu', jamaah: 250 },
  { name: 'Minggu', jamaah: 320 },
];

const donasiData = [
  { name: 'Minggu 1', donasi: 2500000 },
  { name: 'Minggu 2', donasi: 3100000 },
  { name: 'Minggu 3', donasi: 2800000 },
  { name: 'Minggu 4', donasi: 4500000 },
];

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

export default function MasjidStatistics() {
  return (
    <section className="space-y-4 pt-4">
      <h3 className="text-xl font-black text-slate-900 tracking-tight px-1">Statistik & Laporan Mingguan</h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Tren Kehadiran Jamaah */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm"
        >
          <div className="mb-6 text-left">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Tren Kehadiran Jamaah</h4>
            <p className="text-xs text-slate-500 mt-1">Estimasi jumlah jamaah shalat 5 waktu sepekan terakhir.</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={jamaahData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorJamaah" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="jamaah" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorJamaah)" 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Ringkasan Donasi Mingguan */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm"
        >
          <div className="mb-6 text-left">
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Ringkasan Pemasukan</h4>
            <p className="text-xs text-slate-500 mt-1">Akumulasi donasi dan infaq per minggu dalam bulan ini.</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={donasiData}
                margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
                  tickFormatter={(value) => {
                    if (value === 0) return '0';
                    return (value / 1000000) + 'jt';
                  }}
                />
                <Tooltip 
                  formatter={(value: any) => [formatRupiah(Number(value)), 'Total']}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                  labelStyle={{ color: '#64748b', marginBottom: '4px', fontSize: '12px' }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar 
                  dataKey="donasi" 
                  fill="#0ea5e9" 
                  radius={[6, 6, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
