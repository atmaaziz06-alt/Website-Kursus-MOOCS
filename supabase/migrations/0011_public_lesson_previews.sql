grant select on public.lesson_contents to anon;

drop policy if exists lesson_contents_select on public.lesson_contents;
create policy lesson_contents_select on public.lesson_contents for select
using (
  exists (
    select 1
    from public.lessons l
    join public.courses c on c.id = l.course_id
    where l.id = lesson_id
      and (
        (l.is_preview and c.status = 'published' and not c.admin_locked)
        or public.is_enrolled(l.course_id)
        or public.owns_course(l.course_id)
        or public.is_admin()
      )
  )
);

drop policy if exists lesson_files_authorized_read on storage.objects;
create policy lesson_files_authorized_read on storage.objects for select
using (
  bucket_id = 'lesson-files'
  and (
    public.owns_course((storage.foldername(name))[1]::uuid)
    or public.is_admin()
    or public.is_enrolled((storage.foldername(name))[1]::uuid)
    or exists (
      select 1
      from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id::text = (storage.foldername(name))[2]
        and c.id::text = (storage.foldername(name))[1]
        and l.is_preview
        and c.status = 'published'
        and not c.admin_locked
    )
  )
);

create or replace function public.course_has_reviewable_materials(p_course_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.modules m
    join public.lessons l on l.module_id = m.id
    where m.course_id = p_course_id
  )
  and not exists (
    select 1
    from public.lessons l
    left join public.lesson_contents lc on lc.lesson_id = l.id
    where l.course_id = p_course_id
      and not coalesce(
        case
          when l.type = 'video' then nullif(trim(lc.video_url), '') is not null or lc.file_path is not null
          when l.type = 'pdf' then lc.file_path is not null
          else nullif(trim(lc.content), '') is not null or lc.file_path is not null
        end,
        false
      )
  );
$$;

revoke all on function public.course_has_reviewable_materials(uuid) from public, anon, authenticated;

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
  if new.status = 'pending_review' and old.status is distinct from 'pending_review' then
    if new.description = '' or new.thumbnail_path is null then
      raise exception 'Kursus membutuhkan deskripsi dan thumbnail';
    end if;
    if not public.course_has_reviewable_materials(new.id) then
      raise exception 'Kursus membutuhkan minimal satu materi dengan isi atau berkas yang valid';
    end if;
  end if;
  return new;
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
  select * into course_row
  from public.courses
  where id = p_course_id and teacher_id = (select auth.uid())
  for update;
  if not found or course_row.admin_locked then raise exception 'Kursus tidak dapat diajukan'; end if;
  if course_row.status not in ('draft', 'pending_review') then raise exception 'Status kursus tidak dapat diajukan'; end if;
  if course_row.description = '' or course_row.thumbnail_path is null then
    raise exception 'Kursus membutuhkan deskripsi dan thumbnail';
  end if;
  if not public.course_has_reviewable_materials(p_course_id) then
    raise exception 'Kursus membutuhkan minimal satu materi dengan isi atau berkas yang valid';
  end if;

  update public.courses set status = 'pending_review'
  where id = p_course_id returning * into course_row;
  return course_row;
end;
$$;
