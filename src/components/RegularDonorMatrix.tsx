import { Check, User, Info } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import type { RegularDonor, DonorPayment } from '@/src/types';

interface Props {
  donors: RegularDonor[];
  payments: DonorPayment[];
  year: number;
}

export default function RegularDonorMatrix({ donors, payments, year }: Props) {
  const months = ['JAN', 'PEB', 'MARET', 'APRIL', 'MEI', 'JUN', 'JUL', 'AGUST', 'SEPT', 'OKT', 'NOP', 'DES'];

  const getPaymentStatus = (donorId: number, month: number) => {
    return payments.some(p => p.donor_id === donorId && p.month === month + 1 && p.year === year);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
      <div className="bg-forest p-6 text-white text-center">
        <h3 className="text-xl font-bold tracking-tight">DAFTAR NAMA DONATUR TETAP</h3>
        <p className="text-gold font-bold text-lg">MASJID JAMI AL-ABRAR</p>
        <p className="text-white/60 text-xs mt-1">PERIODE JAN - DES {year}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-cream/50 text-[10px] sm:text-xs">
              <th className="border-b border-r border-gray-200 p-2 text-center font-bold text-gray-500 w-10">NO.</th>
              <th className="border-b border-r border-gray-200 p-2 text-left font-bold text-gray-500 min-w-[150px]">NAMA DONATUR</th>
              <th className="border-b border-r border-gray-200 p-2 text-right font-bold text-gray-500 min-w-[100px]">JUMLAH (Rp)</th>
              {months.map(m => (
                <th key={m} className="border-b border-r border-gray-200 p-1 text-center font-bold text-gray-500 min-w-[40px]">{m}</th>
              ))}
              <th className="border-b border-gray-200 p-2 text-center font-bold text-gray-500 min-w-[60px]">KET.</th>
            </tr>
          </thead>
          <tbody className="text-[10px] sm:text-xs">
            {donors.length === 0 ? (
              <tr>
                <td colSpan={16} className="p-10 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <User className="h-8 w-8 opacity-20" />
                    <span>Belum ada data donatur tetap</span>
                  </div>
                </td>
              </tr>
            ) : (
              donors.map((donor, idx) => (
                <tr key={donor.id} className="hover:bg-cream/20 transition-colors">
                  <td className="border-b border-r border-gray-100 p-2 text-center text-gray-400">{idx + 1}</td>
                  <td className="border-b border-r border-gray-100 p-2 font-bold text-gray-700">{donor.name}</td>
                  <td className="border-b border-r border-gray-100 p-2 text-right font-mono text-gray-600 pr-4">
                    {donor.commitment_amount.toLocaleString('id-ID')}
                  </td>
                  {months.map((_, mIdx) => {
                    const paid = getPaymentStatus(donor.id, mIdx);
                    return (
                      <td key={mIdx} className="border-b border-r border-gray-100 p-1 text-center">
                        {paid && (
                          <div className="flex items-center justify-center">
                            <Check className="h-4 w-4 text-forest stroke-[3]" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                  <td className="border-b border-gray-100 p-2">
                    {/* Placeholder for notes */}
                  </td>
                </tr>
              ))
            )}
            
            {/* Summary Row */}
            <tr className="bg-forest/5 font-bold">
              <td colSpan={2} className="p-3 text-right text-forest uppercase tracking-widest text-xs">Jumlah</td>
              <td className="border-l border-forest/10 p-3 text-right text-forest font-mono">
                {donors.reduce((acc, d) => acc + d.commitment_amount, 0).toLocaleString('id-ID')}
              </td>
              {months.map((_, mIdx) => (
                <td key={mIdx} className="border-l border-forest/10 p-1 text-center text-forest">
                  {payments.filter(p => p.month === mIdx + 1 && p.year === year).length}
                </td>
              ))}
              <td className="border-l border-forest/10"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center text-[10px] text-gray-500 space-y-4 sm:space-y-0">
        <div className="flex gap-8">
          <div className="text-center">
            <p className="font-bold text-gray-400 mb-6 uppercase tracking-wider">Ketua</p>
            <p className="font-bold text-gray-600 border-t border-gray-300 pt-1">H. AMIR SABANA</p>
          </div>
          <div className="text-center">
             <p className="font-bold text-gray-400 mb-6 uppercase tracking-wider italic opacity-50">Mengetahui</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-gray-400 mb-6 uppercase tracking-wider">Bendahara</p>
            <p className="font-bold text-gray-600 border-t border-gray-300 pt-1 uppercase">SADIK</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-blue-50 text-blue-600 p-2 rounded-lg border border-blue-100">
          <Info className="h-3 w-3" />
          <span>Status per {new Date().toLocaleDateString('id-ID')}</span>
        </div>
      </div>
    </div>
  );
}
