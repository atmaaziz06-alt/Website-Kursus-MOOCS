create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin' and is_active
  );
$$;

create or replace function public.owns_course(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
  select 1 from public.courses c
  join public.profiles p on p.id = c.teacher_id
  where c.id = p_course_id and c.teacher_id = (select auth.uid())
    and p.role = 'instructor' and p.is_active
);
$$;

create or replace function public.is_enrolled(p_course_id uuid, p_student_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
  select 1 from public.enrollments e
  join public.profiles p on p.id = e.student_id
  where e.course_id = p_course_id and e.student_id = p_student_id
    and e.status in ('active', 'completed')
    and p.role = 'participant' and p.is_active
);
$$;

create or replace function public.can_view_student(p_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.is_admin() or exists (
    select 1
    from public.enrollments e
    join public.courses c on c.id = e.course_id
    where e.student_id = p_student_id and public.owns_course(c.id)
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, instructor_requested)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'wants_instructor' = 'true', false)
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (new.role is distinct from old.role or new.is_active is distinct from old.is_active
      or new.instructor_requested is distinct from old.instructor_requested)
     and (select auth.uid()) is not null and not public.is_admin() then
    raise exception 'Role, status, dan permintaan pengajar hanya dapat diubah admin';
  end if;
  return new;
end;
$$;

create trigger profiles_guard_update
before update on public.profiles
for each row execute function public.guard_profile_update();

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger courses_set_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

create or replace function public.guard_course_status()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status is distinct from old.status
     and (select auth.uid()) is not null and not public.is_admin()
     and not (new.status in ('draft', 'pending_review') and old.status in ('draft', 'pending_review')) then
    raise exception 'Perubahan status ini hanya dapat dilakukan admin';
  end if;
  if new.status = 'pending_review' and old.status is distinct from 'pending_review'
     and (new.description = '' or new.thumbnail_path is null
       or not exists (
         select 1 from public.modules m join public.lessons l on l.module_id = m.id
         where m.course_id = new.id
       )) then
    raise exception 'Kursus membutuhkan deskripsi, thumbnail, minimal satu modul, dan satu materi';
  end if;
  return new;
end;
$$;

create trigger courses_guard_status
before update on public.courses
for each row execute function public.guard_course_status();

create or replace function public.enroll_in_course(p_course_id uuid, p_method text default 'simulasi')
returns public.enrollments
language plpgsql
security definer
set search_path = ''
as $$
declare
  c public.courses;
  e public.enrollments;
  enrolled_count integer;
begin
  if not exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'participant' and is_active
  ) then
    raise exception 'Hanya peserta aktif yang dapat mendaftar';
  end if;

  select * into c from public.courses where id = p_course_id for update;
  if not found or c.status <> 'published' or c.admin_locked then
    raise exception 'Kursus tidak tersedia';
  end if;

  select * into e from public.enrollments where course_id = p_course_id and student_id = (select auth.uid());
  if found then
    if e.status = 'cancelled' then
      update public.enrollments set status = 'active', enrolled_at = now(), completed_at = null
      where id = e.id returning * into e;
    else
      return e;
    end if;
  end if;

  if c.max_participants is not null then
    select count(*) into enrolled_count from public.enrollments
    where course_id = p_course_id and status <> 'cancelled';
    if enrolled_count >= c.max_participants then raise exception 'Kuota penuh'; end if;
  end if;

  if e.id is null then
    insert into public.enrollments (course_id, student_id)
    values (p_course_id, (select auth.uid())) returning * into e;
  end if;

  if c.price > 0 then
    insert into public.payments (enrollment_id, amount, method, status, paid_at)
    values (e.id, c.price, p_method, 'confirmed', now())
    on conflict (enrollment_id) do update set amount = excluded.amount, method = excluded.method,
      status = 'confirmed', paid_at = now();
  end if;
  return e;
end;
$$;

create or replace function public.mark_lesson_complete(p_lesson_id uuid)
returns public.lesson_progress
language plpgsql
security definer
set search_path = ''
as $$
declare
  lesson_row public.lessons;
  progress_row public.lesson_progress;
  remaining_lessons integer;
begin
  select * into lesson_row from public.lessons where id = p_lesson_id;
  if not found or not public.is_enrolled(lesson_row.course_id) then
    raise exception 'Materi tidak tersedia untuk akun ini';
  end if;

  insert into public.lesson_progress (student_id, lesson_id, course_id)
  values ((select auth.uid()), p_lesson_id, lesson_row.course_id)
  on conflict (student_id, lesson_id) do update set completed_at = excluded.completed_at
  returning * into progress_row;

  update public.enrollments set last_lesson_id = p_lesson_id, last_accessed_at = now()
  where course_id = lesson_row.course_id and student_id = (select auth.uid()) and status = 'active';

  select count(*) into remaining_lessons
  from public.lessons l
  where l.course_id = lesson_row.course_id
    and not exists (
      select 1 from public.lesson_progress lp
      where lp.lesson_id = l.id and lp.student_id = (select auth.uid())
    );

  if remaining_lessons = 0 then
    update public.enrollments set status = 'completed', completed_at = coalesce(completed_at, now())
    where course_id = lesson_row.course_id and student_id = (select auth.uid());
  end if;
  return progress_row;
end;
$$;

create or replace function public.start_quiz_attempt(p_quiz_id uuid)
returns public.quiz_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  q public.quizzes;
  attempt_row public.quiz_attempts;
  next_attempt integer;
begin
  select * into q from public.quizzes where id = p_quiz_id and is_published for update;
  if not found or not public.is_enrolled(q.course_id) then
    raise exception 'Kuis tidak tersedia untuk akun ini';
  end if;

  select * into attempt_row from public.quiz_attempts
  where quiz_id = p_quiz_id and student_id = (select auth.uid()) and status = 'in_progress'
  order by attempt_no desc limit 1;
  if found then return attempt_row; end if;

  select count(*) + 1 into next_attempt from public.quiz_attempts
  where quiz_id = p_quiz_id and student_id = (select auth.uid());
  if next_attempt > q.max_attempts then raise exception 'Batas percobaan kuis tercapai'; end if;

  insert into public.quiz_attempts (quiz_id, student_id, attempt_no)
  values (p_quiz_id, (select auth.uid()), next_attempt)
  returning * into attempt_row;
  return attempt_row;
end;
$$;

create or replace function public.save_quiz_answer(
  p_attempt_id uuid,
  p_question_id uuid,
  p_option_id uuid default null,
  p_flagged boolean default false
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  attempt_row public.quiz_attempts;
  quiz_row public.quizzes;
begin
  select * into attempt_row from public.quiz_attempts
  where id = p_attempt_id and student_id = (select auth.uid()) for update;
  if not found or attempt_row.status <> 'in_progress' then raise exception 'Percobaan tidak aktif'; end if;

  select q.* into quiz_row from public.quizzes q where q.id = attempt_row.quiz_id;
  if now() > attempt_row.started_at + make_interval(mins => quiz_row.time_limit_minutes) then
    raise exception 'Waktu kuis telah habis';
  end if;
  if not exists (select 1 from public.questions where id = p_question_id and quiz_id = attempt_row.quiz_id) then
    raise exception 'Soal tidak ditemukan pada kuis ini';
  end if;
  if p_option_id is not null and not exists (
    select 1 from public.question_options where id = p_option_id and question_id = p_question_id
  ) then
    raise exception 'Opsi jawaban tidak valid';
  end if;

  insert into public.attempt_answers (attempt_id, question_id, selected_option_id, flagged)
  values (p_attempt_id, p_question_id, p_option_id, p_flagged)
  on conflict (attempt_id, question_id) do update set
    selected_option_id = excluded.selected_option_id,
    flagged = excluded.flagged,
    updated_at = now();
end;
$$;

create or replace function public.submit_quiz_attempt(p_attempt_id uuid, p_answers jsonb default '[]'::jsonb)
returns public.quiz_attempts
language plpgsql
security definer
set search_path = ''
as $$
declare
  attempt_row public.quiz_attempts;
  quiz_row public.quizzes;
  total_points numeric;
  earned_points numeric;
begin
  select * into attempt_row from public.quiz_attempts
  where id = p_attempt_id and student_id = (select auth.uid()) for update;
  if not found then raise exception 'Percobaan tidak ditemukan'; end if;
  if attempt_row.status = 'submitted' then return attempt_row; end if;

  select * into quiz_row from public.quizzes where id = attempt_row.quiz_id;
  if jsonb_typeof(p_answers) <> 'array' then raise exception 'Format jawaban tidak valid'; end if;

  if now() <= attempt_row.started_at + make_interval(mins => quiz_row.time_limit_minutes) + interval '30 seconds' then
    insert into public.attempt_answers (attempt_id, question_id, selected_option_id)
    select attempt_row.id, answer.question_id, answer.option_id
    from jsonb_to_recordset(p_answers) as answer(question_id uuid, option_id uuid)
    join public.questions q on q.id = answer.question_id and q.quiz_id = attempt_row.quiz_id
    join public.question_options o on o.id = answer.option_id and o.question_id = answer.question_id
    on conflict (attempt_id, question_id) do update
      set selected_option_id = excluded.selected_option_id, updated_at = now();
  end if;

  update public.attempt_answers aa set is_correct = (k.correct_option_id = aa.selected_option_id)
  from public.question_keys k, public.questions q
  where aa.attempt_id = attempt_row.id and q.id = aa.question_id
    and q.quiz_id = attempt_row.quiz_id and k.question_id = q.id;

  select coalesce(sum(points), 0) into total_points
  from public.questions where quiz_id = attempt_row.quiz_id;
  select coalesce(sum(q.points), 0) into earned_points
  from public.attempt_answers aa join public.questions q on q.id = aa.question_id
  where aa.attempt_id = attempt_row.id and aa.is_correct;

  update public.quiz_attempts set
    status = 'submitted',
    score = case when total_points = 0 then 0 else round(earned_points / total_points * 100, 2) end,
    passed = case when total_points = 0 then false else earned_points / total_points * 100 >= quiz_row.passing_score end,
    submitted_at = now(),
    time_taken_seconds = greatest(0, floor(extract(epoch from (now() - attempt_row.started_at)))::integer)
  where id = attempt_row.id returning * into attempt_row;
  return attempt_row;
end;
$$;

create or replace function public.get_attempt_review(p_attempt_id uuid)
returns table (
  question_id uuid,
  selected_option_id uuid,
  correct_option_id uuid,
  is_correct boolean,
  explanation text
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.quiz_attempts a
    join public.quizzes q on q.id = a.quiz_id
    where a.id = p_attempt_id and a.status = 'submitted'
      and (a.student_id = (select auth.uid()) or public.is_admin() or public.owns_course(q.course_id))
  ) then
    raise exception 'Hasil kuis belum tersedia';
  end if;

  return query
  select question_row.id, aa.selected_option_id, k.correct_option_id, aa.is_correct, k.explanation
  from public.quiz_attempts attempt_row
  join public.questions question_row on question_row.quiz_id = attempt_row.quiz_id
  join public.question_keys k on k.question_id = question_row.id
  left join public.attempt_answers aa
    on aa.attempt_id = attempt_row.id and aa.question_id = question_row.id
  where attempt_row.id = p_attempt_id;
end;
$$;

create or replace function public.submit_course_for_review(p_course_id uuid)
returns public.courses
language plpgsql
security definer
set search_path = ''
as $$
declare course_row public.courses;
begin
  select * into course_row from public.courses where id = p_course_id and teacher_id = (select auth.uid()) for update;
  if not found or course_row.admin_locked then raise exception 'Kursus tidak dapat diajukan'; end if;
  if course_row.status not in ('draft', 'pending_review') then raise exception 'Status kursus tidak dapat diajukan'; end if;
  if course_row.description = '' or course_row.thumbnail_path is null or not exists (
    select 1 from public.modules m join public.lessons l on l.module_id = m.id where m.course_id = p_course_id
  ) then
    raise exception 'Kursus membutuhkan deskripsi, thumbnail, minimal satu modul, dan satu materi';
  end if;

  update public.courses set status = 'pending_review' where id = p_course_id returning * into course_row;
  return course_row;
end;
$$;

create or replace function public.review_course(p_course_id uuid, p_approve boolean, p_note text default null)
returns public.courses
language plpgsql
security definer
set search_path = ''
as $$
declare course_row public.courses;
begin
  if not public.is_admin() then raise exception 'Hanya admin yang dapat meninjau kursus'; end if;
  update public.courses set
    status = case when p_approve then 'published'::public.course_status else 'draft'::public.course_status end,
    published_at = case when p_approve then now() else null end,
    review_note = p_note
  where id = p_course_id and status = 'pending_review'
  returning * into course_row;
  if not found then raise exception 'Kursus tidak menunggu persetujuan'; end if;
  return course_row;
end;
$$;

create or replace function public.admin_set_user(p_user_id uuid, p_role public.user_role, p_is_active boolean)
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare profile_row public.profiles;
begin
  if not public.is_admin() then raise exception 'Hanya admin yang dapat mengelola akun'; end if;
  update public.profiles set
    role = p_role,
    is_active = p_is_active,
    instructor_requested = case when p_role = 'instructor' then false else instructor_requested end
  where id = p_user_id returning * into profile_row;
  if not found then raise exception 'Pengguna tidak ditemukan'; end if;
  return profile_row;
end;
$$;
