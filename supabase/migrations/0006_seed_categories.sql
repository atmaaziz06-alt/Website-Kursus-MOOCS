insert into public.categories (name, slug, description)
values
  ('Technology', 'technology', 'Kursus teknologi dan komputasi.'),
  ('Business', 'business', 'Kursus bisnis, manajemen, dan kewirausahaan.'),
  ('Design', 'design', 'Kursus desain visual dan pengalaman pengguna.'),
  ('Development', 'development', 'Kursus pengembangan perangkat lunak.'),
  ('Marketing', 'marketing', 'Kursus pemasaran digital dan strategi merek.'),
  ('Personal Growth', 'personal-growth', 'Kursus pengembangan keterampilan pribadi.'),
  ('Data & AI', 'data-ai', 'Kursus data, machine learning, dan kecerdasan buatan.')
on conflict do nothing;

update public.categories
set is_active = true,
    description = case name
      when 'Technology' then 'Kursus teknologi dan komputasi.'
      when 'Business' then 'Kursus bisnis, manajemen, dan kewirausahaan.'
      when 'Design' then 'Kursus desain visual dan pengalaman pengguna.'
      when 'Development' then 'Kursus pengembangan perangkat lunak.'
      when 'Marketing' then 'Kursus pemasaran digital dan strategi merek.'
      when 'Personal Growth' then 'Kursus pengembangan keterampilan pribadi.'
      when 'Data & AI' then 'Kursus data, machine learning, dan kecerdasan buatan.'
    end
where name in (
  'Technology', 'Business', 'Design', 'Development', 'Marketing', 'Personal Growth', 'Data & AI'
);
