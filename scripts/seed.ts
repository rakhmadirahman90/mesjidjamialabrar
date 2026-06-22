
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL!;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const donors = [
  { name: "H/K", commitment_amount: 100000 },
  { name: "Hj. ATIRAH", commitment_amount: 50000 },
  { name: "Drs. ABD. RAHMAN SULO", commitment_amount: 50000 },
  { name: "Drs. H. AT SYAMSUL EIBER", commitment_amount: 100000 },
  { name: "Hj. NORMA", commitment_amount: 50000 },
  { name: "MUSTAFA LAIDDA", commitment_amount: 50000 },
  { name: "HAMBA ALLAH 1", commitment_amount: 100000 },
  { name: "ALMR. Drs. SYAMSUDDIN. P", commitment_amount: 50000 },
  { name: "AZIS", commitment_amount: 50000 },
  { name: "H. AMIR SABANA", commitment_amount: 100000 },
  { name: "DR. H. ABD. WAHID THAHIR", commitment_amount: 100000 },
  { name: "Hj. JUSNI", commitment_amount: 100000 },
  { name: "HAMBA ALLAH 2", commitment_amount: 100000 },
  { name: "NURDIN", commitment_amount: 100000 },
  { name: "SAJERA", commitment_amount: 100000 },
  { name: "FADILLAH JULIA NINGSIH", commitment_amount: 50000 },
  { name: "MUHAMMAD ALKAUTSAR", commitment_amount: 50000 },
  { name: "DARWIS RESSA & NYONYA", commitment_amount: 100000 },
  { name: "BURHAN", commitment_amount: 100000 },
  { name: "HAFIZHA", commitment_amount: 100000 },
  { name: "NUR ASMAN ASKAN", commitment_amount: 100000 },
  { name: "BAHAR DARENG", commitment_amount: 125000 },
  { name: "Hj. KARIAH", commitment_amount: 50000 },
  { name: "ABDULLAH JALIL", commitment_amount: 50000 },
  { name: "Drs. H. MUH. SABIR", commitment_amount: 100000 },
  { name: "SAYYED SUNARDJO", commitment_amount: 50000 },
  { name: "H. MUH. TAUFIK T", commitment_amount: 100000 },
  { name: "SYAMSIR N", commitment_amount: 50000 },
  { name: "ANISAH", commitment_amount: 50000 },
  { name: "NY. HJ. ANI DANIL HAYA", commitment_amount: 50000 },
  { name: "HJ. HASNAH ABBAS", commitment_amount: 100000 },
  { name: "H. YODI HAYA", commitment_amount: 50000 },
  { name: "DR. ARQAM MADID", commitment_amount: 50000 }
];

async function seed() {
  console.log('Starting seed...');

  // 1. Clear existing data (optional but helpful for repeated runs)
  // await supabase.from('donor_payments').delete().neq('id', 0);
  // await supabase.from('regular_donors').delete().neq('id', 0);

  // 2. Insert Donors
  const { data: insertedDonors, error: donorError } = await supabase
    .from('regular_donors')
    .insert(donors)
    .select();

  if (donorError) {
    console.error('Error inserting donors:', donorError);
    return;
  }
  console.log('Inserted donors:', insertedDonors.length);

  // Create lookup
  const donorMap = new Map(insertedDonors.map(d => [d.name, d.id]));

  // 3. Prepare Payments
  const payments: any[] = [];
  const year = 2026;

  // This is a bit tedious but matches the image
  // format: [name, [months]] where months are 1-based indices that are CHECKED
  const paymentMatrix: [string, number[]][] = [
    ["H/K", [1, 2, 3, 4, 5, 6]],
    ["Hj. ATIRAH", [1, 2, 3, 4, 5, 6]],
    ["Drs. ABD. RAHMAN SULO", [1, 2, 3, 4, 5, 6]],
    ["Drs. H. AT SYAMSUL EIBER", [1, 2, 3, 4, 5, 6]],
    ["Hj. NORMA", [1, 2, 3, 4, 5, 6]],
    ["MUSTAFA LAIDDA", [1, 2, 3, 4, 5, 6]],
    ["HAMBA ALLAH 1", [1, 2, 3, 4, 5, 6]],
    ["ALMR. Drs. SYAMSUDDIN. P", [1, 2, 3, 4, 5, 6]],
    ["AZIS", [1, 2, 3, 4, 5, 6]],
    ["H. AMIR SABANA", [1, 2, 3, 4, 5, 6]],
    ["DR. H. ABD. WAHID THAHIR", [1, 2, 3, 4, 5, 6]],
    ["Hj. JUSNI", [1, 2, 3, 4, 5, 6]],
    ["HAMBA ALLAH 2", [1, 2, 3, 4, 5, 6]],
    ["NURDIN", [1, 2, 3, 4, 5, 6]],
    ["SAJERA", [1, 2, 3, 4, 5, 6]],
    ["FADILLAH JULIA NINGSIH", [3, 4, 5, 6]],
    ["MUHAMMAD ALKAUTSAR", [3, 4, 5, 6]],
    ["DARWIS RESSA & NYONYA", [3, 4, 5, 6]],
    ["BURHAN", [3, 4, 5, 6]],
    ["HAFIZHA", [3, 4, 5, 6]],
    ["NUR ASMAN ASKAN", [6]],
    ["BAHAR DARENG", [4, 5, 6]],
    ["Hj. KARIAH", [1, 3, 5]],
    ["ABDULLAH JALIL", [3, 5]],
    ["Drs. H. MUH. SABIR", [3, 5]],
    ["SAYYED SUNARDJO", [4]],
    ["H. MUH. TAUFIK T", [1, 2, 3, 4]],
    ["SYAMSIR N", [3]],
    ["ANISAH", [1, 2, 3, 4]],
    ["NY. HJ. ANI DANIL HAYA", [4, 5, 6]],
    ["HJ. HASNAH ABBAS", [1, 2, 3, 4, 5, 6]],
    ["H. YODI HAYA", [4, 5, 6]],
    ["DR. ARQAM MADID", [1, 2, 3, 4, 5, 6]]
  ];

  for (const [name, months] of paymentMatrix) {
    const donorId = donorMap.get(name);
    if (!donorId) continue;
    const commitment = donors.find(d => d.name === name)?.commitment_amount || 0;

    for (const month of months) {
      payments.push({
        donor_id: donorId,
        month,
        year,
        amount: commitment,
        payment_date: `${year}-${String(month).padStart(2, '0')}-01`
      });
    }
  }

  const { error: paymentError } = await supabase
    .from('donor_payments')
    .upsert(payments, { onConflict: 'donor_id,month,year' });

  if (paymentError) {
    console.error('Error inserting payments:', paymentError);
  } else {
    console.log('Inserted payments:', payments.length);
  }

  // 4. Insert Kas Jumat
  const kas = [
    {
      report_date: '2026-06-12',
      total_inflow: 3003000,
      total_outflow: 2150000,
      details: {
        saldo_awal: 14711000,
        kotak_amal_jumat: 1210000,
        kotak_amal_harian: 918000,
        melalui_amplop: 50000,
        melalui_donatur: 825000
      },
      amplop_detail: [{ name: "Tanpa Nama", amount: 50000 }],
      pengeluaran_detail: [
        { desc: "Pembinaan Ibadah", amount: 1700000 },
        { desc: "Sumbangan Sosial", amount: 100000 },
        { desc: "Yasinan", amount: 350000 }
      ]
    },
    {
      report_date: '2026-06-19',
      total_inflow: 5279000,
      total_outflow: 6749000,
      details: {
        saldo_awal: 15554000,
        kotak_amal_jumat: 1044000,
        kotak_amal_harian: 967000,
        melalui_amplop: 2768000,
        melalui_donatur: 500000
      },
      amplop_detail: [
        { name: "Anggy", amount: 200000 },
        { name: "Kadir", amount: 20000 },
        { name: "Tanpa Nama", amount: 50000 },
        { name: "Tanpa Nama", amount: 50000 },
        { name: "Tanpa Nama", amount: 10000 },
        { name: "Isi Celengan Malam Syuhada", amount: 2438000 }
      ],
      pengeluaran_detail: [
        { desc: "Pembinaan Ibadah", amount: 1700000 },
        { desc: "Baliho Syuhada", amount: 100000 },
        { desc: "Beli Air (Mineral/Cebo/3dos/20 Dos/Gelas)", amount: 449000 },
        { desc: "Konsumsi Syuhada + Ceramah", amount: 4500000 }
      ]
    }
  ];

  const { error: kasError } = await supabase.from('kas_jumat').upsert(kas, { onConflict: 'report_date' });
  if (kasError) {
    console.error('Error inserting kas_jumat:', kasError);
  } else {
    console.log('Inserted kas_jumat:', kas.length);
  }

  // 5. Insert into financial_reports for generic visibility
  const financialReports: any[] = [];
  
  // Add some summaries as entries
  kas.forEach(k => {
    financialReports.push({
      type: 'income',
      category: 'Infaq Jum\'at',
      amount: k.total_inflow,
      description: `Total Pemasukan Kas Jumat ${k.report_date}`,
      transaction_date: k.report_date
    });
    financialReports.push({
      type: 'expense',
      category: 'Operasional',
      amount: k.total_outflow,
      description: `Total Pengeluaran Kas Jumat ${k.report_date}`,
      transaction_date: k.report_date
    });
  });

  const { error: frError } = await supabase.from('financial_reports').upsert(financialReports);
  if (frError) {
    console.error('Error inserting financial_reports:', frError);
  } else {
    console.log('Inserted financial_reports:', financialReports.length);
  }

  console.log('Seed complete!');
}

seed();
