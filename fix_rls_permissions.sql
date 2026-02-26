-- Corrigir erro de permissão "permission denied for table users"
-- O erro ocorre porque a política anterior tentava ler a tabela auth.users diretamente.
-- Vamos usar auth.jwt() ->> 'email' que pega o email do token de sessão, sem ler a tabela.

-- 1. Remover as políticas problemáticas
DROP POLICY IF EXISTS "Users can find their patient record by email" ON patients;
DROP POLICY IF EXISTS "Users can link themselves to patient record" ON patients;

-- 2. Recriar políticas usando auth.jwt() (Seguro e Performático)

-- Permitir que usuários encontrem seu registro de paciente pelo e-mail do token
CREATE POLICY "Users can find their patient record by email" ON patients
FOR SELECT
USING (email = (auth.jwt() ->> 'email'));

-- Permitir que usuários se vinculem ao registro (Update do auth_user_id)
CREATE POLICY "Users can link themselves to patient record" ON patients
FOR UPDATE
USING (email = (auth.jwt() ->> 'email'))
WITH CHECK (email = (auth.jwt() ->> 'email'));
