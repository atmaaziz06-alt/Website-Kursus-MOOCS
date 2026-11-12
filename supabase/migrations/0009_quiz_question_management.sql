create or replace function public.update_quiz_question(
  p_question_id uuid,
  p_topic text,
  p_text text,
  p_options jsonb,
  p_correct_label text,
  p_explanation text,
  p_points numeric default 10,
  p_code_snippet jsonb default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  question_quiz_id uuid;
  quiz_course_id uuid;
  selected_option_id uuid;
begin
  select question_row.quiz_id, quiz_row.course_id
  into question_quiz_id, quiz_course_id
  from public.questions question_row
  join public.quizzes quiz_row on quiz_row.id = question_row.quiz_id
  where question_row.id = p_question_id;

  if question_quiz_id is null or not public.owns_course(quiz_course_id) then
    raise exception 'Soal tidak ditemukan atau bukan milik pengajar ini';
  end if;
  if exists (select 1 from public.quiz_attempts where quiz_id = question_quiz_id) then
    raise exception 'Soal tidak dapat diubah setelah peserta memulai kuis';
  end if;
  if length(trim(coalesce(p_text, ''))) = 0 or p_points is null or p_points <= 0
     or p_correct_label not in ('A', 'B', 'C', 'D') then
    raise exception 'Pertanyaan, bobot, atau kunci jawaban tidak valid';
  end if;
  if jsonb_typeof(p_options) <> 'object'
     or (select count(*) from jsonb_object_keys(p_options)) <> 4
     or not (p_options ?& array['A', 'B', 'C', 'D'])
     or exists (
       select 1 from jsonb_each_text(p_options) option_row
       where length(trim(option_row.value)) = 0
     ) then
    raise exception 'Soal harus memiliki empat opsi A sampai D yang terisi';
  end if;

  update public.questions
  set topic = coalesce(nullif(trim(p_topic), ''), 'Umum'),
      text = trim(p_text),
      points = p_points,
      code_snippet = p_code_snippet
  where id = p_question_id;

  update public.question_options option_row
  set text = trim(option_input.value)
  from jsonb_each_text(p_options) option_input
  where option_row.question_id = p_question_id
    and option_row.label = option_input.key;

  select id into selected_option_id
  from public.question_options
  where question_id = p_question_id and label = p_correct_label;

  if selected_option_id is null then
    raise exception 'Opsi jawaban soal tidak lengkap';
  end if;

  update public.question_keys
  set correct_option_id = selected_option_id,
      explanation = coalesce(trim(p_explanation), '')
  where question_id = p_question_id;

  if not found then
    raise exception 'Kunci jawaban soal tidak ditemukan';
  end if;
end;
$$;

create or replace function public.delete_quiz_question(p_question_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  question_quiz_id uuid;
  quiz_course_id uuid;
begin
  select question_row.quiz_id, quiz_row.course_id
  into question_quiz_id, quiz_course_id
  from public.questions question_row
  join public.quizzes quiz_row on quiz_row.id = question_row.quiz_id
  where question_row.id = p_question_id;

  if question_quiz_id is null or not public.owns_course(quiz_course_id) then
    raise exception 'Soal tidak ditemukan atau bukan milik pengajar ini';
  end if;
  if exists (select 1 from public.quiz_attempts where quiz_id = question_quiz_id) then
    raise exception 'Soal tidak dapat dihapus setelah peserta memulai kuis';
  end if;

  delete from public.questions where id = p_question_id;
end;
$$;

revoke all on function public.update_quiz_question(uuid, text, text, jsonb, text, text, numeric, jsonb)
from public, anon;
revoke all on function public.delete_quiz_question(uuid) from public, anon;
grant execute on function public.update_quiz_question(uuid, text, text, jsonb, text, text, numeric, jsonb)
to authenticated;
grant execute on function public.delete_quiz_question(uuid) to authenticated;
