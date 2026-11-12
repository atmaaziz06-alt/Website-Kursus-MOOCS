create or replace function public.is_public_instructor(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.courses
    where teacher_id = p_user_id and status = 'published' and not admin_locked
      and exists (select 1 from public.profiles p where p.id = p_user_id
        and p.role = 'instructor' and p.is_active)
  );
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_contents enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.payments enable row level security;
alter table public.quizzes enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.question_keys enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.attempt_answers enable row level security;
alter table public.saved_courses enable row level security;
alter table public.lesson_notes enable row level security;
alter table public.lesson_questions enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;
alter table public.course_reviews enable row level security;

create policy profiles_select on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.is_admin() or public.can_view_student(id));
create policy profiles_update on public.profiles for update to authenticated
using (id = (select auth.uid()) or public.is_admin())
with check (id = (select auth.uid()) or public.is_admin());

create policy categories_public_select on public.categories for select
using (is_active or public.is_admin());
create policy categories_admin_insert on public.categories for insert to authenticated
with check (public.is_admin());
create policy categories_admin_update on public.categories for update to authenticated
using (public.is_admin()) with check (public.is_admin());
create policy categories_admin_delete on public.categories for delete to authenticated
using (public.is_admin());

create policy courses_select on public.courses for select
using (
  (status = 'published' and not admin_locked)
  or public.owns_course(id)
  or public.is_enrolled(id)
  or public.is_admin()
);
create policy courses_insert on public.courses for insert to authenticated
with check (
  teacher_id = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'instructor' and p.is_active
  )
  and status = 'draft'
);
create policy courses_update on public.courses for update to authenticated
using ((public.owns_course(id) and not admin_locked) or public.is_admin())
with check (teacher_id = (select auth.uid()) or public.is_admin());
create policy courses_delete on public.courses for delete to authenticated
using ((public.owns_course(id) and status = 'draft') or public.is_admin());

create policy modules_select on public.modules for select
using (
  exists (
    select 1 from public.courses c where c.id = course_id
      and ((c.status = 'published' and not c.admin_locked)
        or public.owns_course(c.id) or public.is_enrolled(c.id) or public.is_admin())
  )
);
create policy modules_write on public.modules for all to authenticated
using (public.owns_course(course_id) or public.is_admin())
with check (public.owns_course(course_id) or public.is_admin());

create policy lessons_select on public.lessons for select
using (
  exists (
    select 1 from public.courses c where c.id = course_id
      and ((c.status = 'published' and not c.admin_locked)
        or public.owns_course(c.id) or public.is_enrolled(c.id) or public.is_admin())
  )
);
create policy lessons_write on public.lessons for all to authenticated
using (public.owns_course(course_id) or public.is_admin())
with check (public.owns_course(course_id) or public.is_admin());

create policy lesson_contents_select on public.lesson_contents for select
using (
  exists (
    select 1 from public.lessons l
    where l.id = lesson_id
      and (public.is_enrolled(l.course_id) or public.owns_course(l.course_id) or public.is_admin())
  )
);
create policy lesson_contents_write on public.lesson_contents for all to authenticated
using (
  exists (select 1 from public.lessons l where l.id = lesson_id
    and (public.owns_course(l.course_id) or public.is_admin()))
)
with check (
  exists (select 1 from public.lessons l where l.id = lesson_id
    and (public.owns_course(l.course_id) or public.is_admin()))
);

create policy enrollments_select on public.enrollments for select to authenticated
using (
  student_id = (select auth.uid()) or public.owns_course(course_id) or public.is_admin()
);

create policy lesson_progress_select on public.lesson_progress for select to authenticated
using (
  student_id = (select auth.uid()) or public.owns_course(course_id) or public.is_admin()
);

create policy payments_select on public.payments for select to authenticated
using (
  exists (
    select 1 from public.enrollments e
    where e.id = enrollment_id
      and (e.student_id = (select auth.uid()) or public.owns_course(e.course_id) or public.is_admin())
  )
);

create policy quizzes_select on public.quizzes for select
using (
  (is_published and public.is_enrolled(course_id))
  or public.owns_course(course_id)
  or public.is_admin()
);
create policy quizzes_write on public.quizzes for all to authenticated
using (public.owns_course(course_id) or public.is_admin())
with check (public.owns_course(course_id) or public.is_admin());

create policy questions_select on public.questions for select
using (
  exists (
    select 1 from public.quizzes q where q.id = quiz_id
      and ((q.is_published and public.is_enrolled(q.course_id))
        or public.owns_course(q.course_id) or public.is_admin())
  )
);
create policy questions_write on public.questions for all to authenticated
using (
  exists (select 1 from public.quizzes q where q.id = quiz_id
    and (public.owns_course(q.course_id) or public.is_admin()))
)
with check (
  exists (select 1 from public.quizzes q where q.id = quiz_id
    and (public.owns_course(q.course_id) or public.is_admin()))
);

create policy question_options_select on public.question_options for select
using (
  exists (
    select 1 from public.questions question_row
    join public.quizzes quiz_row on quiz_row.id = question_row.quiz_id
    where question_row.id = question_id
      and ((quiz_row.is_published and public.is_enrolled(quiz_row.course_id))
        or public.owns_course(quiz_row.course_id) or public.is_admin())
  )
);
create policy question_options_write on public.question_options for all to authenticated
using (
  exists (select 1 from public.questions question_row
    join public.quizzes quiz_row on quiz_row.id = question_row.quiz_id
    where question_row.id = question_id
      and (public.owns_course(quiz_row.course_id) or public.is_admin()))
)
with check (
  exists (select 1 from public.questions question_row
    join public.quizzes quiz_row on quiz_row.id = question_row.quiz_id
    where question_row.id = question_id
      and (public.owns_course(quiz_row.course_id) or public.is_admin()))
);

create policy question_keys_select on public.question_keys for select to authenticated
using (
  exists (
    select 1 from public.questions question_row
    join public.quizzes quiz_row on quiz_row.id = question_row.quiz_id
    where question_row.id = question_id
      and (public.owns_course(quiz_row.course_id) or public.is_admin())
  )
);
create policy question_keys_write on public.question_keys for all to authenticated
using (
  exists (select 1 from public.questions question_row
    join public.quizzes quiz_row on quiz_row.id = question_row.quiz_id
    where question_row.id = question_id
      and (public.owns_course(quiz_row.course_id) or public.is_admin()))
)
with check (
  exists (select 1 from public.questions question_row
    join public.quizzes quiz_row on quiz_row.id = question_row.quiz_id
    where question_row.id = question_id
      and (public.owns_course(quiz_row.course_id) or public.is_admin()))
);

create policy quiz_attempts_select on public.quiz_attempts for select to authenticated
using (
  student_id = (select auth.uid())
  or exists (select 1 from public.quizzes q where q.id = quiz_id and public.owns_course(q.course_id))
  or public.is_admin()
);

create policy attempt_answers_select on public.attempt_answers for select to authenticated
using (
  exists (
    select 1 from public.quiz_attempts a
    join public.quizzes q on q.id = a.quiz_id
    where a.id = attempt_id
      and (a.student_id = (select auth.uid()) or public.owns_course(q.course_id) or public.is_admin())
  )
);

create policy saved_courses_owner on public.saved_courses for all to authenticated
using (
  student_id = (select auth.uid())
  and exists (select 1 from public.courses c where c.id = course_id and c.status = 'published' and not c.admin_locked)
)
with check (
  student_id = (select auth.uid())
  and exists (select 1 from public.courses c where c.id = course_id and c.status = 'published' and not c.admin_locked)
);

create policy lesson_notes_owner on public.lesson_notes for all to authenticated
using (student_id = (select auth.uid()) and public.is_enrolled(
  (select l.course_id from public.lessons l where l.id = lesson_id)
))
with check (student_id = (select auth.uid()) and public.is_enrolled(
  (select l.course_id from public.lessons l where l.id = lesson_id)
));

create policy lesson_questions_select on public.lesson_questions for select to authenticated
using (
  student_id = (select auth.uid())
  or exists (select 1 from public.lessons l where l.id = lesson_id and public.owns_course(l.course_id))
  or public.is_admin()
);
create policy lesson_questions_insert on public.lesson_questions for insert to authenticated
with check (
  student_id = (select auth.uid())
  and public.is_enrolled((select l.course_id from public.lessons l where l.id = lesson_id))
);

create policy notifications_owner on public.notifications for all to authenticated
using (user_id = (select auth.uid()) or public.is_admin())
with check (user_id = (select auth.uid()) or public.is_admin());

create policy messages_participants on public.messages for select to authenticated
using (sender_id = (select auth.uid()) or recipient_id = (select auth.uid()) or public.is_admin());
create policy messages_send on public.messages for insert to authenticated
with check (sender_id = (select auth.uid()) and exists (
  select 1 from public.enrollments e
  join public.courses c on c.id = e.course_id
  where e.status in ('active', 'completed')
    and ((e.student_id = sender_id and c.teacher_id = recipient_id)
      or (e.student_id = recipient_id and c.teacher_id = sender_id))
));

create policy course_reviews_public_select on public.course_reviews for select
using (exists (select 1 from public.courses c where c.id = course_id and c.status = 'published' and not c.admin_locked));
create policy course_reviews_student_insert on public.course_reviews for insert to authenticated
with check (student_id = (select auth.uid()) and public.is_enrolled(course_id));
create policy course_reviews_student_update on public.course_reviews for update to authenticated
using (student_id = (select auth.uid()) and public.is_enrolled(course_id))
with check (student_id = (select auth.uid()) and public.is_enrolled(course_id));

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.courses, public.modules, public.lessons, public.course_reviews
to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.owns_course(uuid) to anon, authenticated;
grant execute on function public.is_enrolled(uuid, uuid) to anon, authenticated;
grant execute on function public.can_view_student(uuid) to authenticated;
grant execute on function public.is_public_instructor(uuid) to anon, authenticated;

revoke all on function public.enroll_in_course(uuid, text) from public, anon;
revoke all on function public.mark_lesson_complete(uuid) from public, anon;
revoke all on function public.start_quiz_attempt(uuid) from public, anon;
revoke all on function public.save_quiz_answer(uuid, uuid, uuid, boolean) from public, anon;
revoke all on function public.submit_quiz_attempt(uuid, jsonb) from public, anon;
revoke all on function public.get_attempt_review(uuid) from public, anon;
revoke all on function public.submit_course_for_review(uuid) from public, anon;
revoke all on function public.review_course(uuid, boolean, text) from public, anon;
revoke all on function public.admin_set_user(uuid, public.user_role, boolean) from public, anon;

grant execute on function public.enroll_in_course(uuid, text) to authenticated;
grant execute on function public.mark_lesson_complete(uuid) to authenticated;
grant execute on function public.start_quiz_attempt(uuid) to authenticated;
grant execute on function public.save_quiz_answer(uuid, uuid, uuid, boolean) to authenticated;
grant execute on function public.submit_quiz_attempt(uuid, jsonb) to authenticated;
grant execute on function public.get_attempt_review(uuid) to authenticated;
grant execute on function public.submit_course_for_review(uuid) to authenticated;
grant execute on function public.review_course(uuid, boolean, text) to authenticated;
grant execute on function public.admin_set_user(uuid, public.user_role, boolean) to authenticated;
