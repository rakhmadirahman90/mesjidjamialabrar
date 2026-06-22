import { formatCurrency } from '@/src/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, ArrowDownRight, ArrowUpRight, ClipboardList } from 'lucide-react';
import type { KasJumat } from '@/src/types';

interface Props {
  report: KasJumat;
}

export default function WeeklyReportDetail({ report }: Props) {
  const details = report.details as any || {};
  
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden max-w-2xl mx-auto border-t-4 border-t-gold">
      <div className="p-8 space-y-8">
        <div className="text-center space-y-1">
          <h3 className="text-lg font-bold text-forest uppercase tracking-widest">Kas Masjid Jami Al Abrar</h3>
          <p className="text-xs text-gray-500 font-medium">KEL. LAPADDE KEC. UJUNG KOTA PAREPARE</p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Calendar className="h-4 w-4 text-gold" />
            <span className="text-sm font-bold text-gray-700 bg-cream px-3 py-1 rounded-full">
              {format(new Date(report.report_date), 'dd MMMM yyyy', { locale: id })}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* PEMASUKAN */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 font-bold border-b border-green-50 pb-2">
              <ArrowUpRight className="h-5 w-5" />
              <h4 className="text-sm uppercase tracking-wider">Pemasukan</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 italic">1. Saldo Jumat Lalu</span>
                <span className="font-mono text-gray-700">{formatCurrency(details.saldo_awal || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">2. Kotak Amal Jumat</span>
                <span className="font-mono text-gray-700">{formatCurrency(details.kotak_amal_jumat || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">3. Kotak Amal Harian</span>
                <span className="font-mono text-gray-700">{formatCurrency(details.kotak_amal_harian || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">4. Melalui Amplop</span>
                <span className="font-mono text-gray-700">{formatCurrency(details.melalui_amplop || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-bold">5. Melalui Donatur Tetap</span>
                <span className="font-mono text-gray-900 border-b-2 border-green-200">{formatCurrency(details.melalui_donatur || 0)}</span>
              </div>
              
              <div className="flex justify-between pt-2 border-t border-dashed border-gray-200 bg-green-50/50 p-2 rounded-lg">
                <span className="font-bold text-green-700 text-sm">TOTAL PEMASUKAN + SALDO</span>
                <span className="font-mono font-bold text-green-700">{formatCurrency(report.total_inflow + (details.saldo_awal || 0))}</span>
              </div>
            </div>
          </div>

          {/* PENGELUARAN */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-600 font-bold border-b border-red-50 pb-2">
              <ArrowDownRight className="h-5 w-5" />
              <h4 className="text-sm uppercase tracking-wider">Pengeluaran</h4>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">a. Pembinaan Ibadah</span>
                <span className="font-mono text-gray-700">{formatCurrency(details.pembinaan_ibadah || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">b. Sumbangan Sosal</span>
                <span className="font-mono text-gray-700">{formatCurrency(details.sumbangan_sosial || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">c. Yasinan</span>
                <span className="font-mono text-gray-700">{formatCurrency(details.yasinan || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">d. Konsumsi Syuhada / Ceramah</span>
                <span className="font-mono text-gray-700">{formatCurrency(details.konsumsi || 0)}</span>
              </div>
              
              <div className="flex justify-between pt-2 border-t border-dashed border-gray-200 bg-red-50/50 p-2 rounded-lg">
                <span className="font-bold text-red-700 text-sm">TOTAL PENGELUARAN</span>
                <span className="font-mono font-bold text-red-700">{formatCurrency(report.total_outflow)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SALDO AKHIR */}
        <div className="pt-6 border-t border-gray-100">
          <div className="bg-forest p-4 rounded-2xl flex justify-between items-center text-white shadow-lg shadow-forest/20">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-gold" />
              <span className="font-bold uppercase tracking-widest text-sm">Saldo Hari Jumat Ini</span>
            </div>
            <span className="text-xl font-mono font-bold">
              {formatCurrency(report.total_inflow + (details.saldo_awal || 0) - report.total_outflow)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="px-8 py-4 bg-gray-50 flex justify-center items-center text-[10px] text-gray-400 font-bold uppercase tracking-widest italic border-t border-gray-100">
        Parepare, {format(new Date(report.report_date), 'dd MMMM yyyy', { locale: id })}
      </div>
    </div>
  );
}
