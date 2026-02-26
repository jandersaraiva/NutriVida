-- Adicionar coluna para vincular o login do paciente ao registro dele
alter table patients add column if not exists auth_user_id uuid references auth.users;

-- Remover políticas antigas para recriar com a nova lógica
drop policy if exists "Users can view their own patients" on patients;
drop policy if exists "Users can insert their own patients" on patients;
drop policy if exists "Users can update their own patients" on patients;
drop policy if exists "Users can delete their own patients" on patients;

-- Novas Políticas para Patients
-- Nutricionista vê seus pacientes (user_id = auth.uid())
create policy "Nutritionists can view their own patients" on patients
  for select using (auth.uid() = user_id);

create policy "Nutritionists can insert their own patients" on patients
  for insert with check (auth.uid() = user_id);

create policy "Nutritionists can update their own patients" on patients
  for update using (auth.uid() = user_id);

create policy "Nutritionists can delete their own patients" on patients
  for delete using (auth.uid() = user_id);

-- Paciente vê seu próprio registro (auth_user_id = auth.uid()) ou pelo email (para o primeiro login antes do vínculo)
-- Nota: Para segurança, o ideal é o vínculo via ID. O email é usado no backend/app para fazer o vínculo inicial.
-- Vamos permitir que o usuário veja o registro se o auth_user_id bater.
create policy "Patients can view their own record" on patients
  for select using (auth.uid() = auth_user_id);

-- Permitir update APENAS do campo auth_user_id para o próprio usuário se o email bater (Lógica de "Claim" do perfil)
-- Isso é complexo de fazer apenas com RLS seguro sem functions. 
-- Vamos fazer o update via Service Role ou assumir que o Nutri faz o cadastro inicial corretamente?
-- Melhor: O App (com usuário logado) tenta fazer o update. Se a política permitir...
-- Política de "Auto-Claim": Usuário pode atualizar auth_user_id de um paciente SE o email do paciente for igual ao email do usuário E auth_user_id for nulo.
create policy "Patients can claim their profile" on patients
  for update using (
    email = auth.email() AND auth_user_id IS NULL
  )
  with check (
    email = auth.email() AND auth_user_id = auth.uid()
  );


-- Check-ins
drop policy if exists "Users can view check_ins of their patients" on check_ins;
drop policy if exists "Users can insert check_ins for their patients" on check_ins;
drop policy if exists "Users can update check_ins of their patients" on check_ins;
drop policy if exists "Users can delete check_ins of their patients" on check_ins;

-- Nutricionista vê checkins dos seus pacientes
create policy "Nutritionists can view check_ins" on check_ins
  for select using (
    exists (select 1 from patients where patients.id = check_ins."patientId" and patients.user_id = auth.uid())
  );

create policy "Nutritionists can manage check_ins" on check_ins
  for all using (
    exists (select 1 from patients where patients.id = check_ins."patientId" and patients.user_id = auth.uid())
  );

-- Paciente vê seus próprios checkins
create policy "Patients can view own check_ins" on check_ins
  for select using (
    exists (select 1 from patients where patients.id = check_ins."patientId" and patients.auth_user_id = auth.uid())
  );

-- Diet Plans
drop policy if exists "Users can view diet_plans of their patients" on diet_plans;
drop policy if exists "Users can insert diet_plans for their patients" on diet_plans;
drop policy if exists "Users can update diet_plans of their patients" on diet_plans;
drop policy if exists "Users can delete diet_plans of their patients" on diet_plans;

create policy "Nutritionists can view diet_plans" on diet_plans
  for select using (
    exists (select 1 from patients where patients.id = diet_plans."patientId" and patients.user_id = auth.uid())
  );

create policy "Nutritionists can manage diet_plans" on diet_plans
  for all using (
    exists (select 1 from patients where patients.id = diet_plans."patientId" and patients.user_id = auth.uid())
  );

create policy "Patients can view own diet_plans" on diet_plans
  for select using (
    exists (select 1 from patients where patients.id = diet_plans."patientId" and patients.auth_user_id = auth.uid())
  );

-- Appointments
drop policy if exists "Users can view their own appointments" on appointments;
drop policy if exists "Users can insert their own appointments" on appointments;
drop policy if exists "Users can update their own appointments" on appointments;
drop policy if exists "Users can delete their own appointments" on appointments;

create policy "Nutritionists can manage appointments" on appointments
  for all using (auth.uid() = user_id);

-- Paciente vê agendamentos onde ele é o paciente
create policy "Patients can view own appointments" on appointments
  for select using (
    exists (select 1 from patients where patients.id = appointments."patientId" and patients.auth_user_id = auth.uid())
  );
