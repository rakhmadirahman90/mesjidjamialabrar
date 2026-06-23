import { Info, ShieldCheck, HelpCircle, ChevronDown, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function InfoMasjid() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Bagaimana cara berdonasi secara digital?",
      a: "Anda dapat masuk ke menu 'Donasi Digital', pilih program yang ingin didukung, lalu lakukan pembayaran via QRIS otomatis atau transfer ke rekening BSI resmi masjid."
    },
    {
      q: "Apakah laporan keuangan masjid transparan?",
      a: "Ya, seluruh data pemasukan dan pengeluaran dicatat secara realtime dan dapat dipantau oleh siapa saja melalui menu 'Laporan Kas' di aplikasi ini."
    },
    {
      q: "Bagaimana cara menghubungi pengurus masjid?",
      a: "Untuk keperluan administrasi, pendaftaran jamaah, atau konsultasi, Anda dapat mengunjungi Sekretariat Masjid Al Abrar atau menghubungi nomor pengurus di menu 'Profil Masjid'."
    },
    {
      q: "Apakah data donatur saya aman?",
      a: "Sistem kami menggunakan enkripsi standar industri. Anda juga memiliki opsi untuk berdonasi sebagai 'Hamba Allah' jika ingin menjaga privasi (Anonim)."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-4 animate-fade-in" id="info_masjid_view">
      
      {/* Contact Section */}
      <section className="bg-white rounded-[2rem] p-8 border border-slate-150 shadow-sm space-y-6">
        <h3 className="text-sm font-bold font-display text-slate-800 tracking-tight flex items-center gap-2">
           <MapPin className="h-5 w-5 text-emerald-600" /> Informasi Kontak & Akses
        </h3>
        <div className="text-xs text-slate-600 space-y-3 leading-relaxed">
          <div className="flex gap-3">
             <span className="font-semibold text-slate-800 w-24">Sekretariat:</span>
             <span>Kantor Takmir Lt. 1 Al Abrar</span>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold text-slate-800 w-24">E-mail:</span>
            <span className="underline text-emerald-700">takmir@alabrar-parepare.or.id</span>
          </div>
          <div className="flex gap-3">
            <span className="font-semibold text-slate-800 w-24">Google Map:</span>
            <span className="text-slate-500 italic">5.021° S, 119.645° E (Lapadde)</span>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700">
          <Info className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Pusat Informasi Digital Al Abrar</span>
        </div>
        <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight uppercase font-display">
          Satu Sistem Untuk <br />
          <span className="text-emerald-600">Semua Layanan.</span>
        </h2>
        <p className="text-slate-500 text-base leading-relaxed max-w-xl mx-auto font-medium">
          Aplikasi Masjid Jami Al Abrar Lapadde adalah platform terpadu untuk transparansi keuangan, penjadwalan ibadah, dan kemudahan sedekah bagi seluruh jamaah.
        </p>
      </section>

      {/* Grid of 3 Main Pillars (Combined) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            title: 'Ibadah & Agenda', 
            desc: 'Jadwal shalat realtime, petugas Jumat, dan pengumuman kajian rutin harian.',
            icon: '🕌'
          },
          { 
            title: 'Kas & Transparansi', 
            desc: 'Laporan pemasukan dan pengeluaran kas masjid yang dapat dipantau setiap saat.',
            icon: '📊'
          },
          { 
            title: 'Zakat & Infaq', 
            desc: 'Saluran donasi digital dan manajemen bantuan sosial bagi warga yang membutuhkan.',
            icon: '🤝'
          }
        ].map((item, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-4 shadow-sm hover:border-emerald-200 transition-colors text-left group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center text-2xl group-hover:scale-110 transition">
              {item.icon}
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">{item.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {item.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Security Statement (Simplified) */}
      <section className="bg-emerald-950 text-white rounded-[3rem] p-10 relative overflow-hidden flex flex-col md:flex-row items-center gap-8 shadow-2xl">
        <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center shrink-0">
          <ShieldCheck className="w-10 h-10 text-emerald-400" />
        </div>
        <div className="space-y-2 text-center md:text-left">
          <h4 className="text-xl font-black tracking-tight">Kerahasiaan & Keamanan 100%</h4>
          <p className="text-[11px] text-emerald-200/50 leading-relaxed font-mono uppercase tracking-widest">
            Seluruh transaksi dan data pribadi jamaah diproses melalui sistem cloud terenkripsi standar industri.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center gap-3 px-1">
          <div className="p-2 bg-slate-900 text-white rounded-xl">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Tanya Jawab (FAQ)</h3>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Informasi Umum Layanan Masjid</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {faqs.map((faq, idx) => (
            <div 
              key={idx}
              className={`bg-white border rounded-3xl overflow-hidden transition-all duration-300 ${
                activeFaq === idx ? 'border-emerald-500 ring-4 ring-emerald-500/5' : 'border-slate-150 hover:border-slate-300'
              }`}
            >
              <button 
                onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between p-6 text-left outline-none"
              >
                <span className="font-bold text-slate-800 text-sm">{faq.q}</span>
                <ChevronDown className={`h-5 w-5 text-slate-300 transition-transform duration-300 ${activeFaq === idx ? 'rotate-180 text-emerald-500' : ''}`} />
              </button>
              
              <div className={`transition-all duration-300 ease-in-out px-6 overflow-hidden ${activeFaq === idx ? 'max-h-40 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-slate-500 text-xs leading-relaxed border-t border-slate-50 pt-4 text-left">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Version Status */}
      <footer className="pt-8 border-t border-slate-100 text-center">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center justify-center gap-2">
          Takmir Masjid Jami Al Abrar Lapadde • Parepare • 2026
        </p>
      </footer>
    </div>
  );
}
