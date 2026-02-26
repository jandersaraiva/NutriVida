-- 1. Adicionar a coluna user_id nas tabelas que faltam
-- Usamos 'IF NOT EXISTS' para evitar erros se já tiverem sido criadas parcialmente
ALTER TABLE patients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE nutritionist_profile ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Habilitar RLS (Row Level Security) em todas as tabelas
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritionist_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;

-- 3. Remover políticas antigas para evitar conflitos ao recriar
DROP POLICY IF EXISTS "Users can manage their own patients" ON patients;
DROP POLICY IF EXISTS "Users can manage their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can manage their own profile" ON nutritionist_profile;
DROP POLICY IF EXISTS "Users can manage check_ins of their patients" ON check_ins;
DROP POLICY IF EXISTS "Users can manage diet_plans of their patients" ON diet_plans;

-- 4. Criar novas políticas de segurança

-- Pacientes: Usuário só acessa se user_id for igual ao seu ID de login
CREATE POLICY "Users can manage their own patients" ON patients
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Agendamentos: Mesmo princípio
CREATE POLICY "Users can manage their own appointments" ON appointments
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Perfil: Mesmo princípio
CREATE POLICY "Users can manage their own profile" ON nutritionist_profile
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Avaliações (Check-ins): Acesso permitido se o paciente dono da avaliação pertencer ao usuário
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

-- Planos Alimentares: Acesso permitido se o paciente dono do plano pertencer ao usuário
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
