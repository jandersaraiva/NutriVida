-- Habilita a extensão UUID se ainda não estiver habilitada
create extension if not exists "uuid-ossp";

-- 1. Tabela de Pacientes
create table if not exists patients (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  email text,
  gender text,
  age integer,
  profession text,
  phone text,
  instagram text,
  address text,
  "birthDate" text, -- Usando aspas pois no código está camelCase
  objective text,
  "avatarColor" text,
  status text default 'active',
  "activityFactor" numeric,
  anamnesis jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Avaliações (Check-ins)
create table if not exists check_ins (
  id uuid default uuid_generate_v4() primary key,
  "patientId" uuid references patients(id) on delete cascade not null,
  date text not null,
  height numeric,
  weight numeric,
  imc numeric,
  "bodyFat" numeric,
  "muscleMass" numeric,
  bmr numeric,
  age numeric,
  "bodyAge" numeric,
  "visceralFat" numeric,
  "waistCircumference" numeric,
  "hipCircumference" numeric,
  "chestCircumference" numeric,
  "abdomenCircumference" numeric,
  "armCircumference" numeric,
  "forearmCircumference" numeric,
  "wristCircumference" numeric,
  "thighCircumference" numeric,
  "calfCircumference" numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabela de Planos Alimentares
create table if not exists diet_plans (
  id uuid default uuid_generate_v4() primary key,
  "patientId" uuid references patients(id) on delete cascade not null,
  name text not null,
  status text default 'active',
  "createdAt" text,
  "lastUpdated" text,
  "totalCalories" numeric,
  "waterTarget" numeric,
  macros jsonb,
  meals jsonb,
  days jsonb,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabela de Agendamentos
create table if not exists appointments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  "patientId" uuid references patients(id) on delete cascade not null,
  date text not null,
  time text not null,
  type text,
  status text default 'Agendado',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabela de Perfil do Nutricionista
create table if not exists nutritionist_profile (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null unique,
  name text,
  crn text,
  email text,
  phone text,
  "birthDate" text,
  photo text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Habilitar RLS (Row Level Security) em todas as tabelas
alter table patients enable row level security;
alter table check_ins enable row level security;
alter table diet_plans enable row level security;
alter table appointments enable row level security;
alter table nutritionist_profile enable row level security;

-- Políticas de Segurança (RLS)

-- Patients: Usuários só podem ver/editar seus próprios pacientes
create policy "Users can view their own patients" on patients
  for select using (auth.uid() = user_id);

create policy "Users can insert their own patients" on patients
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own patients" on patients
  for update using (auth.uid() = user_id);

create policy "Users can delete their own patients" on patients
  for delete using (auth.uid() = user_id);

-- Check-ins: Acesso via paciente (que pertence ao usuário)
create policy "Users can view check_ins of their patients" on check_ins
  for select using (
    exists (select 1 from patients where patients.id = check_ins."patientId" and patients.user_id = auth.uid())
  );

create policy "Users can insert check_ins for their patients" on check_ins
  for insert with check (
    exists (select 1 from patients where patients.id = check_ins."patientId" and patients.user_id = auth.uid())
  );

create policy "Users can update check_ins of their patients" on check_ins
  for update using (
    exists (select 1 from patients where patients.id = check_ins."patientId" and patients.user_id = auth.uid())
  );

create policy "Users can delete check_ins of their patients" on check_ins
  for delete using (
    exists (select 1 from patients where patients.id = check_ins."patientId" and patients.user_id = auth.uid())
  );

-- Diet Plans: Acesso via paciente
create policy "Users can view diet_plans of their patients" on diet_plans
  for select using (
    exists (select 1 from patients where patients.id = diet_plans."patientId" and patients.user_id = auth.uid())
  );

create policy "Users can insert diet_plans for their patients" on diet_plans
  for insert with check (
    exists (select 1 from patients where patients.id = diet_plans."patientId" and patients.user_id = auth.uid())
  );

create policy "Users can update diet_plans of their patients" on diet_plans
  for update using (
    exists (select 1 from patients where patients.id = diet_plans."patientId" and patients.user_id = auth.uid())
  );

create policy "Users can delete diet_plans of their patients" on diet_plans
  for delete using (
    exists (select 1 from patients where patients.id = diet_plans."patientId" and patients.user_id = auth.uid())
  );

-- Appointments: Usuários só podem ver/editar seus próprios agendamentos
create policy "Users can view their own appointments" on appointments
  for select using (auth.uid() = user_id);

create policy "Users can insert their own appointments" on appointments
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own appointments" on appointments
  for update using (auth.uid() = user_id);

create policy "Users can delete their own appointments" on appointments
  for delete using (auth.uid() = user_id);

-- Nutritionist Profile: Usuários só podem ver/editar seu próprio perfil
create policy "Users can view their own profile" on nutritionist_profile
  for select using (auth.uid() = user_id);

create policy "Users can insert their own profile" on nutritionist_profile
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own profile" on nutritionist_profile
  for update using (auth.uid() = user_id);
