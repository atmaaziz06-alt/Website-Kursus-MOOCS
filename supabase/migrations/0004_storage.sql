insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('course-thumbnails', 'course-thumbnails', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp']),
  ('lesson-files', 'lesson-files', false, 10485760, array['application/pdf', 'video/mp4', 'video/webm']),
  ('private-docs', 'private-docs', false, 10485760, array['application/pdf'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy public_course_thumbnails_read on storage.objects for select
using (bucket_id = 'course-thumbnails');
create policy course_thumbnails_owner_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'course-thumbnails'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (storage.extension(name) in ('jpg', 'jpeg', 'png', 'webp'))
);
create policy course_thumbnails_owner_update on storage.objects for update to authenticated
using (bucket_id = 'course-thumbnails' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'course-thumbnails' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy course_thumbnails_owner_delete on storage.objects for delete to authenticated
using (bucket_id = 'course-thumbnails' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy public_avatars_read on storage.objects for select
using (bucket_id = 'avatars');
create policy avatar_owner_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'avatars'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and (storage.extension(name) in ('jpg', 'jpeg', 'png', 'webp'))
);
create policy avatar_owner_update on storage.objects for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy avatar_owner_delete on storage.objects for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy lesson_files_authorized_read on storage.objects for select to authenticated
using (
  bucket_id = 'lesson-files'
  and (
    public.owns_course((storage.foldername(name))[1]::uuid)
    or public.is_admin()
    or public.is_enrolled((storage.foldername(name))[1]::uuid)
  )
);
create policy lesson_files_course_owner_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'lesson-files'
  and public.owns_course((storage.foldername(name))[1]::uuid)
  and storage.extension(name) in ('pdf', 'mp4', 'webm')
);
create policy lesson_files_course_owner_update on storage.objects for update to authenticated
using (bucket_id = 'lesson-files' and public.owns_course((storage.foldername(name))[1]::uuid))
with check (bucket_id = 'lesson-files' and public.owns_course((storage.foldername(name))[1]::uuid));
create policy lesson_files_course_owner_delete on storage.objects for delete to authenticated
using (bucket_id = 'lesson-files' and (public.owns_course((storage.foldername(name))[1]::uuid) or public.is_admin()));

create policy private_docs_owner_read on storage.objects for select to authenticated
using (
  bucket_id = 'private-docs'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin())
);
create policy private_docs_owner_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'private-docs'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and storage.extension(name) = 'pdf'
);
create policy private_docs_owner_update on storage.objects for update to authenticated
using (
  bucket_id = 'private-docs'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin())
)
with check (
  bucket_id = 'private-docs'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin())
);
create policy private_docs_owner_delete on storage.objects for delete to authenticated
using (
  bucket_id = 'private-docs'
  and ((storage.foldername(name))[1] = (select auth.uid())::text or public.is_admin())
);
