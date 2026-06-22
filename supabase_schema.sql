
-- Core & Ibadah
CREATE TABLE prayer_times (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    time TIME NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE hadiths (
    id SERIAL PRIMARY KEY,
    text_arab TEXT NOT NULL,
    translation TEXT NOT NULL,
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE kajian_schedules (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    speaker TEXT NOT NULL,
    location TEXT DEFAULT 'Mesjid Jami Al Abrar',
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    category TEXT CHECK (category IN ('Tauhid', 'Fiqih', 'Tafsir', 'Hadits', 'Umum')),
    recurrence TEXT, -- e.g., 'Setiap Sabtu'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE mosque_facilities (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keuangan & Sosial
CREATE TABLE financial_reports (
    id SERIAL PRIMARY KEY,
    type TEXT CHECK (type IN ('income', 'expense')),
    category TEXT NOT NULL, -- Infaq, Zakat, Gaji, Pemeliharaan, etc.
    amount DECIMAL(15, 2) NOT NULL,
    description TEXT,
    transaction_date DATE DEFAULT CURRENT_DATE,
    receipt_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE kas_jumat (
    id SERIAL PRIMARY KEY,
    report_date DATE NOT NULL,
    amplop_detail JSONB,
    donatur_detail JSONB,
    pengeluaran_detail JSONB,
    total_inflow DECIMAL(15, 2),
    total_outflow DECIMAL(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE regular_donors (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    commitment_amount DECIMAL(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE donor_payments (
    id SERIAL PRIMARY KEY,
    donor_id INTEGER REFERENCES regular_donors(id),
    amount DECIMAL(15, 2) NOT NULL,
    month INTEGER CHECK (month BETWEEN 1 AND 12),
    year INTEGER,
    payment_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(donor_id, month, year)
);

-- Kelompok Jamaah
CREATE TABLE qurban_members (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    target_amount DECIMAL(15, 2) NOT NULL,
    type TEXT, -- Sapi, Kambing
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE qurban_transactions (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES qurban_members(id),
    amount DECIMAL(15, 2) NOT NULL,
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE arisan_groups (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    total_prize DECIMAL(15, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE arisan_members (
    id SERIAL PRIMARY KEY,
    group_id INTEGER REFERENCES arisan_groups(id),
    name TEXT NOT NULL,
    order_number INTEGER,
    has_received BOOLEAN DEFAULT FALSE,
    receive_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS POLICIES

-- Public Read Access
ALTER TABLE prayer_times ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON prayer_times FOR SELECT USING (true);

ALTER TABLE hadiths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON hadiths FOR SELECT USING (true);

ALTER TABLE kajian_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON kajian_schedules FOR SELECT USING (true);

ALTER TABLE mosque_facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON mosque_facilities FOR SELECT USING (true);

ALTER TABLE financial_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON financial_reports FOR SELECT USING (true);

ALTER TABLE kas_jumat ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON kas_jumat FOR SELECT USING (true);

ALTER TABLE qurban_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON qurban_members FOR SELECT USING (true);
CREATE POLICY "Public insert" ON qurban_members FOR INSERT WITH CHECK (true);

ALTER TABLE qurban_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON qurban_transactions FOR SELECT USING (true);

ALTER TABLE arisan_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON arisan_groups FOR SELECT USING (true);

ALTER TABLE arisan_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read" ON arisan_members FOR SELECT USING (true);

-- Admin Full Access (Authenticated users)
-- Example for prayer_times (repeat for others)
CREATE POLICY "Admin CRUD" ON prayer_times FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD" ON hadiths FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD" ON kajian_schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD" ON mosque_facilities FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD" ON financial_reports FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD" ON kas_jumat FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD" ON regular_donors FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD" ON donor_payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD" ON qurban_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD" ON qurban_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD" ON arisan_groups FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin CRUD" ON arisan_members FOR ALL TO authenticated USING (true) WITH CHECK (true);
