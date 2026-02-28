-- Política 5: Nutricionistas podem DELETAR feedbacks dos seus pacientes
create policy "Nutritionists can delete feedbacks of their patients" on feedbacks
  for delete using (
    exists (
      select 1 from patients 
      where patients.id = feedbacks.patient_id 
      and patients.user_id = auth.uid()
    )
  );
