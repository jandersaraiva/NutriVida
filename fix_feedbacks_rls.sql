-- Garante que a coluna auth_user_id existe na tabela patients
ALTER TABLE patients ADD COLUMN IF NOT EXISTS auth_user_id uuid;

-- Cria a tabela feedbacks se não existir (com patient_id como TEXT)
create table if not exists feedbacks (
  id uuid default gen_random_uuid() primary key,
  patient_id text references patients(id) on delete cascade,
  message text not null,
  created_at timestamp with time zone default now(),
  read boolean default false
);

-- Habilita RLS
alter table feedbacks enable row level security;

-- Remove políticas antigas para evitar duplicidade/conflito
drop policy if exists "Patients can insert their own feedbacks" on feedbacks;
drop policy if exists "Patients can view their own feedbacks" on feedbacks;
drop policy if exists "Nutritionists can view feedbacks of their patients" on feedbacks;
drop policy if exists "Nutritionists can update feedbacks of their patients" on feedbacks;

-- Política 1: Pacientes podem INSERIR feedbacks para si mesmos
create policy "Patients can insert their own feedbacks" on feedbacks
  for insert with check (
    exists (
      select 1 from patients 
      where patients.id = feedbacks.patient_id 
      and patients.auth_user_id = auth.uid()
    )
  );

-- Política 2: Pacientes podem VER seus próprios feedbacks
create policy "Patients can view their own feedbacks" on feedbacks
  for select using (
    exists (
      select 1 from patients 
      where patients.id = feedbacks.patient_id 
      and patients.auth_user_id = auth.uid()
    )
  );

-- Política 3: Nutricionistas podem VER feedbacks dos seus pacientes
create policy "Nutritionists can view feedbacks of their patients" on feedbacks
  for select using (
    exists (
      select 1 from patients 
      where patients.id = feedbacks.patient_id 
      and patients.user_id = auth.uid()
    )
  );

-- Política 4: Nutricionistas podem ATUALIZAR feedbacks (marcar como lido)
create policy "Nutritionists can update feedbacks of their patients" on feedbacks
  for update using (
    exists (
      select 1 from patients 
      where patients.id = feedbacks.patient_id 
      and patients.user_id = auth.uid()
    )
  );
