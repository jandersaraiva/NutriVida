-- Script para corrigir problemas de dados existentes e permissões

-- 1. Garantir que a coluna user_id exista na tabela patients
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'patients' and column_name = 'user_id') then
        alter table patients add column user_id uuid references auth.users;
    end if;
end $$;

-- 2. Desabilitar RLS temporariamente para permitir correções
alter table patients disable row level security;
alter table check_ins disable row level security;
alter table diet_plans disable row level security;
alter table appointments disable row level security;
alter table nutritionist_profile disable row level security;

-- 3. Associar pacientes órfãos (sem user_id) ao usuário que está executando este script (se executado via SQL Editor do Supabase, auth.uid() pode ser nulo, então vamos usar uma política permissiva primeiro)
-- ATENÇÃO: Se você rodar isso no SQL Editor do Supabase, o auth.uid() pode não funcionar como esperado.
-- O ideal é rodar um comando que atualize TUDO para o seu usuário específico se você souber o UUID.
-- Mas como paliativo, vamos permitir que user_id seja nulo temporariamente se não for.
alter table patients alter column user_id drop not null;

-- 4. Reabilitar RLS
alter table patients enable row level security;
alter table check_ins enable row level security;
alter table diet_plans enable row level security;
alter table appointments enable row level security;
alter table nutritionist_profile enable row level security;

-- 5. Criar política de emergência para ver TODOS os pacientes (apenas para debug, remova depois!)
-- Isso permite que você veja pacientes mesmo que o user_id esteja errado ou nulo.
drop policy if exists "Emergency view all" on patients;
create policy "Emergency view all" on patients for select using (true);

-- 6. Política para permitir atualizar pacientes sem dono (para você poder "adotar" eles)
drop policy if exists "Emergency adopt orphans" on patients;
create policy "Emergency adopt orphans" on patients for update using (user_id is null or user_id = auth.uid()) with check (true);

-- Instruções:
-- Após rodar este script:
-- 1. Recarregue a página.
-- 2. Você deverá ver o paciente "Jander".
-- 3. Edite o paciente e salve (isso deve associar ele ao seu usuário se o app estiver configurado para enviar o user_id no update).
