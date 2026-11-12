import React, { useCallback, useEffect, useState } from 'react';
import { Edit, Plus, Trash2, X } from 'lucide-react';
import { Badge, Button, Card } from '../../components/ui';
import { getErrorMessage } from '../../lib/errors';
import { requireSupabase } from '../../lib/supabase';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_active: boolean;
  courseCount: number;
};

const slugify = (value: string) => value.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editor, setEditor] = useState<{ id?: string; name: string; description: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const reload = useCallback(async () => {
    const client = requireSupabase();
    const [categoriesResult, coursesResult] = await Promise.all([
      client.from('categories').select('id, name, slug, description, is_active').order('name'),
      client.from('courses').select('category_id'),
    ]);
    if (categoriesResult.error) throw new Error(getErrorMessage(categoriesResult.error));
    if (coursesResult.error) throw new Error(getErrorMessage(coursesResult.error));
    const countByCategory = new Map<string, number>();
    (coursesResult.data ?? []).forEach((course) => {
      if (course.category_id) countByCategory.set(course.category_id, (countByCategory.get(course.category_id) ?? 0) + 1);
    });
    setCategories((categoriesResult.data ?? []).map((category) => ({
      ...category,
      courseCount: countByCategory.get(category.id) ?? 0,
    })));
  }, []);

  useEffect(() => {
    void reload().catch((loadError: unknown) => setError(loadError instanceof Error ? loadError.message : getErrorMessage(loadError)))
      .finally(() => setIsLoading(false));
  }, [reload]);

  const saveCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor) return;
    setIsSaving(true);
    setError('');
    setNotice('');
    const client = requireSupabase();
    const category = {
      name: editor.name.trim(),
      slug: slugify(editor.name.trim()),
      description: editor.description.trim(),
    };
    const result = editor.id
      ? await client.from('categories').update(category).eq('id', editor.id)
      : await client.from('categories').insert(category);
    if (result.error) {
      setError(getErrorMessage(result.error));
    } else {
      setEditor(null);
      setNotice(editor.id ? 'Kategori diperbarui.' : 'Kategori ditambahkan.');
      try {
        await reload();
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      }
    }
    setIsSaving(false);
  };

  const toggleActive = async (category: Category) => {
    setIsSaving(true);
    setError('');
    const { error: updateError } = await requireSupabase().from('categories')
      .update({ is_active: !category.is_active }).eq('id', category.id);
    if (updateError) setError(getErrorMessage(updateError));
    else {
      setCategories((current) => current.map((item) =>
        item.id === category.id ? { ...item, is_active: !item.is_active } : item));
      setNotice(category.is_active ? 'Kategori dinonaktifkan.' : 'Kategori diaktifkan.');
    }
    setIsSaving(false);
  };

  const deleteCategory = async (category: Category) => {
    if (!window.confirm(`Hapus kategori "${category.name}"? Kategori yang dipakai kursus akan ditolak database.`)) return;
    setIsSaving(true);
    setError('');
    const { error: deleteError } = await requireSupabase().from('categories').delete().eq('id', category.id);
    if (deleteError) setError(getErrorMessage(deleteError));
    else {
      setCategories((current) => current.filter((item) => item.id !== category.id));
      setNotice('Kategori dihapus.');
    }
    setIsSaving(false);
  };

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-text-heading">Kategori Kursus</h1>
          <p className="mt-1 text-sm text-slate-500">Kategori disimpan dan dikelola di Supabase.</p>
        </div>
        <Button variant="orange" onClick={() => setEditor({ name: '', description: '' })} leftIcon={<Plus className="h-4 w-4" />}>Tambah kategori</Button>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red/20 bg-red/5 p-3 text-sm text-red">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-green/20 bg-green-tint p-3 text-sm text-green">{notice}</p>}
      <Card className="overflow-x-auto p-5 sm:p-7">
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead><tr className="border-b border-border text-xs uppercase text-slate-400">
            <th className="pb-3">Nama</th><th className="pb-3">Slug</th><th className="pb-3">Deskripsi</th><th className="pb-3">Kursus</th><th className="pb-3">Status</th><th className="pb-3 text-right">Tindakan</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {isLoading && <tr><td colSpan={6} className="py-8 text-center text-slate-500">Memuat kategori...</td></tr>}
            {!isLoading && !categories.length && <tr><td colSpan={6} className="py-8 text-center text-slate-500">Belum ada kategori.</td></tr>}
            {categories.map((category) => (
              <tr key={category.id}>
                <td className="py-4 font-bold text-text-heading">{category.name}</td>
                <td className="py-4 font-mono text-xs text-slate-500">{category.slug}</td>
                <td className="max-w-[280px] py-4 text-slate-600">{category.description}</td>
                <td className="py-4">{category.courseCount}</td>
                <td className="py-4"><Badge variant={category.is_active ? 'active' : 'in-review'}>{category.is_active ? 'Aktif' : 'Nonaktif'}</Badge></td>
                <td className="py-4">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" disabled={isSaving} onClick={() => setEditor({ id: category.id, name: category.name, description: category.description })} aria-label={`Ubah ${category.name}`}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" disabled={isSaving} onClick={() => void toggleActive(category)}>{category.is_active ? 'Nonaktifkan' : 'Aktifkan'}</Button>
                    <Button size="sm" variant="outline" disabled={isSaving} onClick={() => void deleteCategory(category)} aria-label={`Hapus ${category.name}`}><Trash2 className="h-4 w-4 text-red" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {editor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="category-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft-lg">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="category-title" className="text-lg font-bold text-text-heading">{editor.id ? 'Ubah kategori' : 'Tambah kategori'}</h2>
              <button type="button" onClick={() => setEditor(null)} aria-label="Tutup"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={saveCategory} className="space-y-4">
              <label className="block text-xs font-semibold">Nama
                <input value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })} maxLength={80} required className="mt-1.5 w-full rounded-xl border border-border p-3 text-sm" />
              </label>
              <label className="block text-xs font-semibold">Deskripsi
                <textarea value={editor.description} onChange={(event) => setEditor({ ...editor, description: event.target.value })} maxLength={240} rows={3} className="mt-1.5 w-full rounded-xl border border-border p-3 text-sm" />
              </label>
              {error && <p role="alert" className="text-xs text-red">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditor(null)}>Batal</Button>
                <Button type="submit" variant="navy" disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan'}</Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
