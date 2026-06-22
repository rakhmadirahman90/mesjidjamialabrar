
import { useEffect, useState } from 'react';
import { supabase } from '@/src/lib/supabase';
import type { FinancialReport, KasJumat, RegularDonor, DonorPayment } from '@/src/types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, FileText, Download, UserCheck, Calendar } from 'lucide-react';
import { formatCurrency, cn } from '@/src/lib/utils';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import RegularDonorMatrix from '@/src/components/RegularDonorMatrix';
import WeeklyReportDetail from '@/src/components/WeeklyReportDetail';
import { MOCK_REPORTS, MOCK_KAS_JUMAT, MOCK_DONORS, MOCK_PAYMENTS } from '@/src/data/mockData';
import { LocalDb } from '../lib/localStorageDb';

type Tab = 'overview' | 'weekly' | 'donors';

export default function LaporanKeuangan() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [reports, setReports] = useState<FinancialReport[]>([]);
  const [kasJumat, setKasJumat] = useState<KasJumat[]>([]);
  const [donors, setDonors] = useState<RegularDonor[]>([]);
  const [payments, setPayments] = useState<DonorPayment[]>([]);
  const [selectedWeekly, setSelectedWeekly] = useState<KasJumat | null>(null);
  const [loading, setLoading] = useState(true);

  const loadLocalData = () => {
    setReports(LocalDb.getFinancials());
  };

  useEffect(() => {
    async function fetchData() {
      const [reportsRes, kasRes, donorsRes, paymentsRes] = await Promise.all([
        supabase.from('financial_reports').select('*').order('transaction_date', { ascending: false }),
        supabase.from('kas_jumat').select('*').order('report_date', { ascending: false }),
        supabase.from('regular_donors').select('*').order('name'),
        supabase.from('donor_payments').select('*')
      ]);
      
      // Use DB data if available, otherwise fallback to mock data defined in the request
      const finalReports = (reportsRes.data && reportsRes.data.length > 0) ? reportsRes.data : LocalDb.getFinancials();
      const finalKas = (kasRes.data && kasRes.data.length > 0) ? kasRes.data : MOCK_KAS_JUMAT;
      const finalDonors = (donorsRes.data && donorsRes.data.length > 0) ? donorsRes.data : MOCK_DONORS;
      const finalPayments = (paymentsRes.data && paymentsRes.data.length > 0) ? paymentsRes.data : MOCK_PAYMENTS;

      setReports(finalReports);
      setKasJumat(finalKas);
      if (finalKas.length > 0) setSelectedWeekly(finalKas[0]);
      setDonors(finalDonors);
      setPayments(finalPayments);
      
      setLoading(false);
    }
    fetchData();

    window.addEventListener('db-update', loadLocalData);
    return () => window.removeEventListener('db-update', loadLocalData);
  }, []);

  const totalIncome = reports.filter(r => r.type === 'income').reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpense = reports.filter(r => r.type === 'expense').reduce((acc, curr) => acc + Number(curr.amount), 0);

  const chartData = [
    { name: 'Pemasukan', value: totalIncome, color: '#2D5A27' },
    { name: 'Pengeluaran', value: totalExpense, color: '#B35C44' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 py-10 space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-forest mb-2">Transparansi Keuangan</h2>
        <p className="text-gray-600">Amanah Jamaah, Kemaslahatan Ummat</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 p-1 bg-cream rounded-2xl w-fit mx-auto border border-brown-100">
        {[
          { id: 'overview', name: 'Ringkasan', icon: Wallet },
          { id: 'weekly', name: 'Kas Mingguan', icon: FileText },
          { id: 'donors', name: 'Donatur Tetap', icon: UserCheck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all",
              activeTab === tab.id 
                ? "bg-forest text-white shadow-lg" 
                : "text-forest/60 hover:text-forest hover:bg-white"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Wallet className="h-16 w-16 text-forest" />
              </div>
              <div className="relative z-10">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Saldo Kas Saat Ini</span>
                <p className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(totalIncome - totalExpense)}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Total Pemasukan</span>
              <p className="text-3xl font-bold text-green-600 mt-2">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Total Pengeluaran</span>
              <p className="text-3xl font-bold text-red-600 mt-2">{formatCurrency(totalExpense)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-forest mb-6 flex items-center gap-2 uppercase tracking-wider text-sm">
                <TrendingUp className="h-4 w-4 text-gold" /> Ratio Kas Global
              </h3>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-3">
                {chartData.map(item => (
                  <div key={item.name} className="flex items-center justify-between text-sm p-2 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-gray-600 font-bold">{item.name}</span>
                    </div>
                    <span className="font-mono font-bold text-forest">
                      {((item.value / Math.max(1, totalIncome + totalExpense)) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
               <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-forest flex items-center gap-2 uppercase tracking-wider text-sm">
                  <FileText className="h-4 w-4 text-gold" /> Transaksi Terakhir
                </h3>
              </div>
              <div className="space-y-4">
                {reports.slice(0, 5).map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 rounded-2xl bg-cream/30 border border-cream/50 transition-all hover:border-gold/30">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-3 rounded-xl",
                        report.type === 'income' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                      )}>
                        {report.type === 'income' ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 text-sm leading-tight">{report.description}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">
                          {format(new Date(report.transaction_date), 'dd MMM yyyy', { locale: id })}
                        </p>
                      </div>
                    </div>
                    <p className={cn(
                      "font-mono font-bold",
                      report.type === 'income' ? "text-green-600" : "text-red-600"
                    )}>
                      {report.type === 'income' ? '+' : '-'}{formatCurrency(report.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'weekly' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-2 mb-4">Arsip Laporan</h3>
            <div className="space-y-2 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {kasJumat.map((kas) => (
                <button
                  key={kas.id}
                  onClick={() => setSelectedWeekly(kas)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between group",
                    selectedWeekly?.id === kas.id 
                      ? "bg-forest border-forest text-white shadow-xl translate-x-2" 
                      : "bg-white border-gray-100 hover:border-gold/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className={cn(
                      "h-5 w-5 transition-colors",
                      selectedWeekly?.id === kas.id ? "text-gold" : "text-gray-300"
                    )} />
                    <div>
                      <p className="font-bold text-sm">
                        {format(new Date(kas.report_date), 'dd MMMM yyyy', { locale: id })}
                      </p>
                      <p className={cn(
                        "text-[10px] uppercase font-bold tracking-tighter opacity-60",
                        selectedWeekly?.id === kas.id ? "text-white" : "text-gray-400"
                      )}>
                        Masjid Al Abrar
                      </p>
                    </div>
                  </div>
                  <TrendingUp className={cn(
                    "h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity",
                    selectedWeekly?.id === kas.id ? "text-gold" : "text-forest"
                  )} />
                </button>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-8">
            {selectedWeekly ? (
              <WeeklyReportDetail report={selectedWeekly} />
            ) : (
              <div className="bg-white rounded-3xl border border-gray-100 h-full flex flex-col items-center justify-center p-20 text-center space-y-4">
                <FileText className="h-16 w-16 text-gray-100" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Pilih laporan di samping untuk melihat detail</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'donors' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <RegularDonorMatrix 
            donors={donors} 
            payments={payments} 
            year={2026} 
          />
        </div>
      )}
    </div>
  );
}
