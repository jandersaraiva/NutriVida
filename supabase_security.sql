-- Habilitar RLS em todas as tabelas
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritionist_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela 'patients'
-- Usuários só podem ver/editar pacientes que eles criaram (user_id = auth.uid())
CREATE POLICY "Users can manage their own patients" ON patients
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Políticas para a tabela 'appointments'
CREATE POLICY "Users can manage their own appointments" ON appointments
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Políticas para a tabela 'nutritionist_profile'
CREATE POLICY "Users can manage their own profile" ON nutritionist_profile
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Políticas para a tabela 'check_ins' (Tabela filha de patients)
-- O acesso depende se o usuário é dono do paciente relacionado
CREATE POLICY "Users can manage check_ins of their patients" ON check_ins
FOR ALL
USING (
  "patientId" IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  "patientId" IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
);

-- Políticas para a tabela 'diet_plans' (Tabela filha de patients)
CREATE POLICY "Users can manage diet_plans of their patients" ON diet_plans
FOR ALL
USING (
  "patientId" IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  "patientId" IN (
    SELECT id FROM patients WHERE user_id = auth.uid()
  )
);
