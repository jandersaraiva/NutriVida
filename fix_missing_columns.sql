-- Adiciona colunas de medidas corporais na tabela check_ins se não existirem
-- Usando aspas duplas para preservar o camelCase, conforme definido no supabase_setup.sql original
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS "waistCircumference" numeric;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS "hipCircumference" numeric;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS "chestCircumference" numeric;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS "abdomenCircumference" numeric;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS "armCircumference" numeric;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS "forearmCircumference" numeric;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS "wristCircumference" numeric;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS "thighCircumference" numeric;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS "calfCircumference" numeric;

-- Adiciona outras colunas que podem estar faltando
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS "visceralFat" numeric;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS "bodyAge" numeric;

-- Adiciona activityFactor na tabela patients se não existir
ALTER TABLE patients ADD COLUMN IF NOT EXISTS "activityFactor" numeric;

-- Adiciona waterTarget na tabela diet_plans se não existir
ALTER TABLE diet_plans ADD COLUMN IF NOT EXISTS "waterTarget" numeric;
