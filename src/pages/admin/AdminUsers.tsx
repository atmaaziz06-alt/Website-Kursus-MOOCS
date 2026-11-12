import React, { useCallback, useEffect, useState } from 'react';
import { Download, Plus, Search, UserCog } from 'lucide-react';
import { Avatar, Badge, Button, Card } from '../../components/ui';
import { UserRole } from '../../types';
import { getErrorMessage } from '../../lib/errors';
import { requireSupabase } from '../../lib/supabase';
import { downloadCSV } from '../../utils/download';

type AdminUser = {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  instructor_requested: boolean;
  is_active: boolean;
  created_at: string;
};
type UserFilters = { role: UserRole | null; active: boolean | null };

const pageSize = 25;
const roleLabels: Record<UserRole, string> = {
  participant: 'Peserta',
  instructor: 'Pengajar',
  admin: 'Admin',
};

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [newInstructor, setNewInstructor] = useState<{ fullName: string; email: string; password: string } | null>(null);

  const filters: UserFilters = {
    role: roleFilter === 'all' ? null : roleFilter,
    active: activeFilter === 'all' ? null : activeFilter === 'active',
  };

  const loadUsers = useCallback(async () => {
    const { data, error: loadError } = await requireSupabase().rpc('admin_list_users', {
      p_search: search.trim(),
      p_role: filters.role,
      p_active: filters.active,
      p_limit: pageSize,
      p_offset: page * pageSize,
    });
    if (loadError) throw new Error(getErrorMessage(loadError));
    setUsers(data ?? []);
    setTotal(data?.[0]?.total_count ?? 0);
  }, [filters.active, filters.role, page, search]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');
    const timer = window.setTimeout(() => {
      void loadUsers().catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : getErrorMessage(loadError));
      }).finally(() => {
        if (active) setIsLoading(false);
      });
    }, search.trim() ? 250 : 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [loadUsers, search]);

  const changeUser = async (target: AdminUser, role: UserRole, isActive: boolean) => {
    setIsSaving(true);
    setError('');
    const { error: updateError } = await requireSupabase().rpc('admin_set_user', {
      p_user_id: target.id,
      p_role: role,
      p_is_active: isActive,
    });
    if (updateError) setError(getErrorMessage(updateError));
    else {
      setNotice(`Akun ${target.email} berhasil diperbarui.`);
      setEditUser(null);
      try {
        await loadUsers();
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      }
    }
    setIsSaving(false);
  };

  const createInstructor = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newInstructor) return;
    setIsSaving(true);
    setError('');
    const { error: createError } = await requireSupabase().functions.invoke('admin-create-user', {
      body: newInstructor,
    });
    if (createError) {
      setError(getErrorMessage(createError));
    } else {
      setNewInstructor(null);
      setNotice('Akun pengajar berhasil dibuat.');
      try {
        await loadUsers();
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      }
    }
    setIsSaving(false);
  };

  const exportUsers = async () => {
    setIsSaving(true);
    setError('');
    try {
      const allUsers: AdminUser[] = [];
      let offset = 0;
      while (offset < total) {
        const { data, error: exportError } = await requireSupabase().rpc('admin_list_users', {
          p_search: search.trim(),
          p_role: filters.role,
          p_active: filters.active,
          p_limit: 100,
          p_offset: offset,
        });
        if (exportError) throw new Error(getErrorMessage(exportError));
        if (!data?.length) break;
        allUsers.push(...data);
        offset += data.length;
      }
      downloadCSV('pengguna-eduspace.csv', [
        ['ID', 'Nama', 'Email', 'Peran', 'Status', 'Permintaan Pengajar', 'Tanggal Bergabung'],
        ...allUsers.map((user) => [
          user.id,
          user.full_name,
          user.email,
          roleLabels[user.role],
          user.is_active ? 'Aktif' : 'Nonaktif',
          user.instructor_requested ? 'Ya' : 'Tidak',
          new Date(user.created_at).toLocaleDateString('id-ID'),
        ]),
      ]);
    } catch (exportError) {
      setError(getErrorMessage(exportError));
    } finally {
      setIsSaving(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="mx-auto max-w-[1300px] space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-wider text-blue">Pusat admin</p>
        <h1 className="mt-1 text-2xl font-extrabold text-text-heading">Kelola pengguna</h1>
        <p className="mt-1 text-sm text-slate-500">Pencarian, status, role, dan permintaan pengajar dibaca dari Supabase.</p>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red/20 bg-red/5 p-3 text-sm text-red">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-green/20 bg-green-tint p-3 text-sm text-green">{notice}</p>}
      <Card className="space-y-5 p-5 sm:p-7">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => { setSearch(event.target.value); setPage(0); }}
                placeholder="Cari nama, email, atau ID" className="w-full rounded-xl border border-border bg-slate-50 py-2.5 pl-9 pr-3 text-sm sm:w-72" />
            </label>
            <select value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value as UserRole | 'all'); setPage(0); }}
              className="rounded-xl border border-border bg-slate-50 px-3 py-2.5 text-sm">
              <option value="all">Semua role</option><option value="participant">Peserta</option><option value="instructor">Pengajar</option><option value="admin">Admin</option>
            </select>
            <select value={activeFilter} onChange={(event) => { setActiveFilter(event.target.value as typeof activeFilter); setPage(0); }}
              className="rounded-xl border border-border bg-slate-50 px-3 py-2.5 text-sm">
              <option value="all">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" disabled={isSaving || !total} onClick={() => void exportUsers()} leftIcon={<Download className="h-4 w-4" />}>Ekspor CSV</Button>
            <Button variant="orange" disabled={isSaving} onClick={() => setNewInstructor({ fullName: '', email: '', password: '' })} leftIcon={<Plus className="h-4 w-4" />}>Buat akun pengajar</Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left text-sm">
            <thead><tr className="border-b border-border text-xs uppercase text-slate-400">
              <th className="pb-3">Pengguna</th><th className="pb-3">Email</th><th className="pb-3">Role</th><th className="pb-3">Status</th><th className="pb-3">Bergabung</th><th className="pb-3 text-right">Tindakan</th>
            </tr></thead>
            <tbody className="divide-y divide-border">
              {isLoading && <tr><td colSpan={6} className="py-8 text-center text-slate-500">Memuat pengguna...</td></tr>}
              {!isLoading && !users.length && <tr><td colSpan={6} className="py-8 text-center text-slate-500">Tidak ada pengguna yang cocok.</td></tr>}
              {!isLoading && users.map((user) => (
                <tr key={user.id}>
                  <td className="py-3"><div className="flex items-center gap-3"><Avatar name={user.full_name} size="sm" /><span><strong className="block">{user.full_name}</strong><small className="font-mono text-slate-400">{user.id.slice(0, 8)}</small></span></div></td>
                  <td className="py-3 text-slate-600">{user.email}</td>
                  <td className="py-3"><Badge variant={user.role === 'admin' ? 'navy' : user.role === 'instructor' ? 'orange' : 'technology'}>{roleLabels[user.role]}</Badge></td>
                  <td className="py-3"><Badge variant={user.is_active ? 'active' : 'in-review'}>{user.is_active ? 'Aktif' : 'Nonaktif'}</Badge></td>
                  <td className="py-3 text-slate-500">{new Date(user.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="py-3 text-right">
                    <div className="inline-flex flex-wrap justify-end gap-2">
                      {user.instructor_requested && <Button size="sm" variant="orange" disabled={isSaving} onClick={() => void changeUser(user, 'instructor', user.is_active)}>Setujui pengajar</Button>}
                      <Button size="sm" variant="outline" disabled={isSaving} onClick={() => setEditUser(user)} leftIcon={<UserCog className="h-4 w-4" />}>Ubah</Button>
                      <Button size="sm" variant="outline" disabled={isSaving} onClick={() => void changeUser(user, user.role, !user.is_active)}>{user.is_active ? 'Nonaktifkan' : 'Aktifkan'}</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <footer className="flex items-center justify-between gap-3 text-sm text-slate-500">
          <span>{total ? `${page * pageSize + 1}-${Math.min(total, (page + 1) * pageSize)} dari ${total}` : '0 pengguna'}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0 || isLoading} onClick={() => setPage((value) => value - 1)}>Sebelumnya</Button>
            <span className="self-center text-xs">{page + 1}/{totalPages}</span>
            <Button variant="outline" size="sm" disabled={page + 1 >= totalPages || isLoading} onClick={() => setPage((value) => value + 1)}>Berikutnya</Button>
          </div>
        </footer>
      </Card>

      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4">
          <section role="dialog" aria-modal="true" className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6">
            <h2 className="text-lg font-bold text-text-heading">Ubah akun {editUser.full_name}</h2>
            <label className="block text-xs font-semibold">Role
              <select id="edit-user-role" defaultValue={editUser.role} className="mt-2 w-full rounded-xl border border-border p-3 text-sm">
                <option value="participant">Peserta</option><option value="instructor">Pengajar</option><option value="admin">Admin</option>
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm"><input id="edit-user-active" type="checkbox" defaultChecked={editUser.is_active} /> Akun aktif</label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditUser(null)}>Batal</Button>
              <Button variant="navy" disabled={isSaving} onClick={() => {
                const role = document.getElementById('edit-user-role') as HTMLSelectElement;
                const active = document.getElementById('edit-user-active') as HTMLInputElement;
                void changeUser(editUser, role.value as UserRole, active.checked);
              }}>{isSaving ? 'Menyimpan...' : 'Simpan'}</Button>
            </div>
          </section>
        </div>
      )}

      {newInstructor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4">
          <section role="dialog" aria-modal="true" className="w-full max-w-md rounded-2xl bg-white p-6">
            <h2 className="text-lg font-bold text-text-heading">Buat akun pengajar</h2>
            <form onSubmit={createInstructor} className="mt-4 space-y-4">
              <label className="block text-xs font-semibold">Nama lengkap
                <input value={newInstructor.fullName} onChange={(event) => setNewInstructor({ ...newInstructor, fullName: event.target.value })} required className="mt-1.5 w-full rounded-xl border border-border p-3 text-sm" />
              </label>
              <label className="block text-xs font-semibold">Email
                <input type="email" value={newInstructor.email} onChange={(event) => setNewInstructor({ ...newInstructor, email: event.target.value })} required className="mt-1.5 w-full rounded-xl border border-border p-3 text-sm" />
              </label>
              <label className="block text-xs font-semibold">Kata sandi sementara (min. 8 karakter)
                <input type="password" minLength={8} value={newInstructor.password} onChange={(event) => setNewInstructor({ ...newInstructor, password: event.target.value })} required className="mt-1.5 w-full rounded-xl border border-border p-3 text-sm" />
              </label>
              {error && <p role="alert" className="text-xs text-red">{error}</p>}
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setNewInstructor(null)}>Batal</Button><Button type="submit" variant="navy" disabled={isSaving}>{isSaving ? 'Membuat...' : 'Buat akun'}</Button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
