-- Script de Correção Forçada de Permissões
-- Execute este script no SQL Editor do Supabase

-- 1. Garantir que as colunas de vínculo com usuário existem
ALTER TABLE patients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
ALTER TABLE nutritionist_profile ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 2. Remover TODAS as políticas antigas para evitar o erro "policy already exists"
-- O comando DROP POLICY IF EXISTS deve resolver, mas vamos garantir.
DROP POLICY IF EXISTS "Users can manage their own patients" ON patients;
DROP POLICY IF EXISTS "Users can manage their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can manage their own profile" ON nutritionist_profile;
DROP POLICY IF EXISTS "Users can manage check_ins of their patients" ON check_ins;
DROP POLICY IF EXISTS "Users can manage diet_plans of their patients" ON diet_plans;

-- 3. Habilitar RLS (Segurança) nas tabelas
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritionist_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;

-- 4. Criar as Políticas de Segurança Novamente

-- Pacientes
CREATE POLICY "Users can manage their own patients" ON patients
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Agendamentos
CREATE POLICY "Users can manage their own appointments" ON appointments
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Perfil
CREATE POLICY "Users can manage their own profile" ON nutritionist_profile
FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Avaliações (Check-ins) - Baseado no dono do paciente
CREATE POLICY "Users can manage check_ins of their patients" ON check_ins
FOR ALL USING (
  "patientId" IN (SELECT id FROM patients WHERE user_id = auth.uid())
)
WITH CHECK (
  "patientId" IN (SELECT id FROM patients WHERE user_id = auth.uid())
);

-- Dietas - Baseado no dono do paciente
CREATE POLICY "Users can manage diet_plans of their patients" ON diet_plans
FOR ALL USING (
  "patientId" IN (SELECT id FROM patients WHERE user_id = auth.uid())
)
WITH CHECK (
  "patientId" IN (SELECT id FROM patients WHERE user_id = auth.uid())
);
