create or replace function public.admin_list_users(
  p_search text default '',
  p_role public.user_role default null,
  p_active boolean default null,
  p_limit integer default 50,
  p_offset integer default 0
)
returns table (
  id uuid,
  email text,
  full_name text,
  role public.user_role,
  instructor_requested boolean,
  is_active boolean,
  created_at timestamptz,
  total_count bigint
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat melihat daftar pengguna';
  end if;
  return query
  select profile.id, auth_user.email::text, profile.full_name, profile.role,
    profile.instructor_requested, profile.is_active, profile.created_at,
    count(*) over () as total_count
  from public.profiles profile
  join auth.users auth_user on auth_user.id = profile.id
  where (p_search is null or p_search = ''
    or profile.full_name ilike '%' || p_search || '%'
    or auth_user.email ilike '%' || p_search || '%'
    or profile.id::text ilike '%' || p_search || '%')
    and (p_role is null or profile.role = p_role)
    and (p_active is null or profile.is_active = p_active)
  order by profile.created_at desc
  limit greatest(1, least(coalesce(p_limit, 50), 100))
  offset greatest(0, coalesce(p_offset, 0));
end;
$$;

revoke all on function public.admin_list_users(text, public.user_role, boolean, integer, integer)
from public, anon;
grant execute on function public.admin_list_users(text, public.user_role, boolean, integer, integer)
to authenticated;
