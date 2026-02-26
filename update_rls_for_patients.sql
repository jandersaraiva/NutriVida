-- Políticas de Segurança Atualizadas para Permitir Login de Pacientes

-- 1. Permitir que pacientes vejam seus próprios dados (Leitura)
CREATE POLICY "Patients can view their own data" ON patients
FOR SELECT
USING (auth.uid() = auth_user_id);

-- 2. Permitir que usuários encontrem seu registro de paciente pelo e-mail (para o primeiro acesso)
CREATE POLICY "Users can find their patient record by email" ON patients
FOR SELECT
USING (email = (select email from auth.users where id = auth.uid()));

-- 3. Permitir que usuários se vinculem ao registro de paciente (Atualização do ID)
CREATE POLICY "Users can link themselves to patient record" ON patients
FOR UPDATE
USING (email = (select email from auth.users where id = auth.uid()))
WITH CHECK (email = (select email from auth.users where id = auth.uid()));

-- 4. Políticas para tabelas relacionadas (CheckIns, Dietas, Agendamentos)
-- Permitir que pacientes vejam seus próprios check-ins
CREATE POLICY "Patients can view their own check_ins" ON check_ins
FOR SELECT
USING (
  "patientId" IN (
    SELECT id FROM patients WHERE auth_user_id = auth.uid()
  )
);

-- Permitir que pacientes vejam suas próprias dietas
CREATE POLICY "Patients can view their own diet_plans" ON diet_plans
FOR SELECT
USING (
  "patientId" IN (
    SELECT id FROM patients WHERE auth_user_id = auth.uid()
  )
);

-- Permitir que pacientes vejam seus próprios agendamentos
CREATE POLICY "Patients can view their own appointments" ON appointments
FOR SELECT
USING (
  "patientId" IN (
    SELECT id FROM patients WHERE auth_user_id = auth.uid()
  )
);
