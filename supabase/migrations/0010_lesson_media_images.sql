update storage.buckets
set allowed_mime_types = array[
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm'
]
where id = 'lesson-files';

drop policy if exists lesson_files_course_owner_insert on storage.objects;
create policy lesson_files_course_owner_insert on storage.objects for insert to authenticated
with check (
  bucket_id = 'lesson-files'
  and public.owns_course((storage.foldername(name))[1]::uuid)
  and storage.extension(name) in ('pdf', 'mp4', 'webm', 'jpg', 'jpeg', 'png', 'webp')
);
