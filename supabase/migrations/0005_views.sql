create or replace view public.v_public_instructors
with (security_barrier = true)
as
select distinct p.id, p.full_name, p.avatar_path
from public.profiles p
join public.courses c on c.teacher_id = p.id
where c.status = 'published' and not c.admin_locked and p.is_active;

create or replace view public.v_enrollment_progress
with (security_invoker = true)
as
select
  e.id as enrollment_id,
  e.student_id,
  e.course_id,
  e.status,
  count(l.id)::integer as total_lessons,
  count(lp.lesson_id)::integer as completed_lessons,
  case when count(l.id) = 0 then 0
    else round(count(lp.lesson_id)::numeric / count(l.id) * 100, 2) end as progress_percent
from public.enrollments e
left join public.lessons l on l.course_id = e.course_id
left join public.lesson_progress lp on lp.lesson_id = l.id and lp.student_id = e.student_id
group by e.id, e.student_id, e.course_id, e.status;

create or replace view public.v_public_course_stats
with (security_barrier = true)
as
select
  c.id as course_id,
  count(distinct e.id)::integer as enrolled_count,
  round(avg(r.rating), 2) as average_rating,
  count(distinct r.id)::integer as review_count
from public.courses c
left join public.enrollments e on e.course_id = c.id and e.status in ('active', 'completed')
left join public.course_reviews r on r.course_id = c.id
where c.status = 'published' and not c.admin_locked
group by c.id;

create or replace view public.v_public_courses
with (security_barrier = true)
as
select
  c.id, c.teacher_id, c.category_id, c.title, c.slug, c.subtitle, c.description,
  c.level, c.language, c.learning_outcomes, c.requirements, c.thumbnail_path,
  c.banner_path, c.price, c.original_price, c.max_participants, c.published_at, c.created_at,
  category.name as category_name,
  instructor.full_name as instructor_name,
  instructor.avatar_path as instructor_avatar_path,
  coalesce(course_stats.enrolled_count, 0) as enrolled_count,
  coalesce(course_stats.average_rating, 0) as average_rating,
  coalesce(course_stats.review_count, 0) as review_count,
  coalesce(lesson_stats.lessons_count, 0) as lessons_count,
  coalesce(lesson_stats.total_duration_minutes, 0) as total_duration_minutes,
  coalesce(instructor_stats.courses_count, 0) as instructor_courses_count,
  coalesce(instructor_stats.students_count, 0) as instructor_students_count
from public.courses c
join public.profiles instructor on instructor.id = c.teacher_id
left join public.categories category on category.id = c.category_id
left join public.v_public_course_stats course_stats on course_stats.course_id = c.id
left join (
  select course_id, count(*)::integer as lessons_count, sum(duration_minutes)::integer as total_duration_minutes
  from public.lessons
  group by course_id
) lesson_stats on lesson_stats.course_id = c.id
left join (
  select teacher_courses.teacher_id,
    count(distinct teacher_courses.id)::integer as courses_count,
    count(distinct enrollments.student_id)::integer as students_count
  from public.courses teacher_courses
  left join public.enrollments enrollments
    on enrollments.course_id = teacher_courses.id and enrollments.status in ('active', 'completed')
  where teacher_courses.status = 'published' and not teacher_courses.admin_locked
  group by teacher_courses.teacher_id
) instructor_stats on instructor_stats.teacher_id = c.teacher_id
where c.status = 'published' and not c.admin_locked and instructor.is_active and instructor.role = 'instructor';

create or replace view public.v_teacher_courses
with (security_invoker = true)
as
select
  c.id, c.teacher_id, c.title, c.slug, c.status, c.price, c.created_at,
  count(distinct e.id)::integer as enrolled_count,
  count(distinct qa.id)::integer as submitted_attempts
from public.courses c
left join public.enrollments e on e.course_id = c.id and e.status in ('active', 'completed')
left join public.quizzes q on q.course_id = c.id
left join public.quiz_attempts qa on qa.quiz_id = q.id and qa.status = 'submitted'
where c.teacher_id = (select auth.uid())
group by c.id;

create or replace view public.v_teacher_course_stats
with (security_invoker = true)
as
select
  c.id as course_id,
  c.teacher_id,
  count(distinct e.student_id)::integer as student_count,
  count(distinct qa.id)::integer as quiz_submission_count,
  round(avg(qa.score), 2) as average_quiz_score
from public.courses c
left join public.enrollments e on e.course_id = c.id and e.status in ('active', 'completed')
left join public.quizzes q on q.course_id = c.id
left join public.quiz_attempts qa on qa.quiz_id = q.id and qa.status = 'submitted'
where c.teacher_id = (select auth.uid())
group by c.id, c.teacher_id;

grant select on public.v_public_instructors to anon, authenticated;
grant select on public.v_public_course_stats to anon, authenticated;
grant select on public.v_public_courses to anon, authenticated;
grant select on public.v_enrollment_progress to authenticated;
grant select on public.v_teacher_courses to authenticated;
grant select on public.v_teacher_course_stats to authenticated;

create or replace function public.admin_dashboard_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then raise exception 'Hanya admin yang dapat melihat ringkasan'; end if;
  return jsonb_build_object(
    'users_by_role', (
      select coalesce(jsonb_object_agg(role, total), '{}'::jsonb)
      from (select role, count(*)::integer as total from public.profiles group by role) roles
    ),
    'courses_by_status', (
      select coalesce(jsonb_object_agg(status, total), '{}'::jsonb)
      from (select status, count(*)::integer as total from public.courses group by status) courses
    ),
    'enrollments', (select count(*)::integer from public.enrollments where status <> 'cancelled')
  );
end;
$$;

revoke all on function public.admin_dashboard_summary() from public, anon;
grant execute on function public.admin_dashboard_summary() to authenticated;
