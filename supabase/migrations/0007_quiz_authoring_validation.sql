create or replace function public.create_quiz_question(
  p_quiz_id uuid,
  p_topic text,
  p_text text,
  p_options jsonb,
  p_correct_label text,
  p_explanation text,
  p_points numeric default 10,
  p_code_snippet jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  quiz_course_id uuid;
  question_id uuid;
  option_rows jsonb;
  correct_option_id uuid;
begin
  select course_id into quiz_course_id
  from public.quizzes
  where id = p_quiz_id;

  if quiz_course_id is null or not public.owns_course(quiz_course_id) then
    raise exception 'Kuis tidak ditemukan atau bukan milik pengajar ini';
  end if;
  if p_points <= 0 or p_correct_label not in ('A', 'B', 'C', 'D') then
    raise exception 'Bobot atau kunci jawaban tidak valid';
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

  insert into public.questions (quiz_id, topic, text, code_snippet, position, points)
  select p_quiz_id, coalesce(nullif(trim(p_topic), ''), 'Umum'), trim(p_text),
    p_code_snippet, coalesce(max(position) + 1, 0), p_points
  from public.questions
  where quiz_id = p_quiz_id
  returning id into question_id;

  insert into public.question_options (question_id, label, text)
  select question_id, option_row.key, trim(option_row.value)
  from jsonb_each_text(p_options) option_row;

  select id into correct_option_id
  from public.question_options
  where question_id = create_quiz_question.question_id and label = p_correct_label;

  insert into public.question_keys (question_id, correct_option_id, explanation)
  values (question_id, correct_option_id, coalesce(trim(p_explanation), ''));

  return question_id;
end;
$$;

create or replace function public.validate_quiz_publication()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_published and not old.is_published then
    if not exists (select 1 from public.questions where quiz_id = new.id) then
      raise exception 'Tambahkan minimal satu soal sebelum menerbitkan kuis';
    end if;

    if exists (
      select 1
      from public.questions question_row
      left join public.question_options option_row on option_row.question_id = question_row.id
      left join public.question_keys key_row on key_row.question_id = question_row.id
      where question_row.quiz_id = new.id
      group by question_row.id, key_row.question_id
      having count(distinct option_row.id) <> 4 or key_row.question_id is null
    ) then
      raise exception 'Setiap soal harus memiliki empat opsi dan satu kunci jawaban';
    end if;
  end if;
  return new;
end;
$$;

create trigger quizzes_validate_publication
before update of is_published on public.quizzes
for each row execute function public.validate_quiz_publication();

revoke all on function public.create_quiz_question(uuid, text, text, jsonb, text, text, numeric, jsonb)
from public, anon;
grant execute on function public.create_quiz_question(uuid, text, text, jsonb, text, text, numeric, jsonb)
to authenticated;
