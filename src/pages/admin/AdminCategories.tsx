import React, { useState } from 'react';
import { FolderTree, Plus, Edit, Trash2, X } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { translateCategory } from '../../config/locale';

const loadCategories = () => {
  try {
    const saved = localStorage.getItem('eduspace_admin_categories');
    if (!saved) return [
      { id: 'cat-1', name: 'Teknologi & Cloud', slug: 'technology', courseCount: 24, count: 24, description: 'Cloud, infrastruktur, DevOps', status: 'Aktif' },
      { id: 'cat-2', name: 'Pengembangan Perangkat Lunak', slug: 'development', courseCount: 20, count: 20, description: 'Frontend, backend, aplikasi seluler', status: 'Aktif' },
      { id: 'cat-3', name: 'Bisnis & Manajemen', slug: 'business', courseCount: 18, count: 18, description: 'Manajemen, kepemimpinan, kewirausahaan', status: 'Aktif' },
      { id: 'cat-4', name: 'UI/UX & Desain Produk', slug: 'design', courseCount: 16, count: 16, description: 'Desain UI/UX dan sistem desain', status: 'Aktif' },
      { id: 'cat-5', name: 'Pemasaran Digital & Pertumbuhan', slug: 'marketing', courseCount: 14, count: 14, description: 'Iklan performa dan SEO', status: 'Aktif' },
      { id: 'cat-6', name: 'Pengembangan Diri & Kepemimpinan', slug: 'personal-growth', courseCount: 12, count: 12, description: 'Produktivitas dan pengembangan karier', status: 'Aktif' },
    ];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new TypeError('Data kategori bukan daftar.');
    return parsed.map((item) => ({
      ...item,
      count: item.count ?? item.courseCount ?? 0,
      description: item.description ?? '',
      status: item.status ?? 'Aktif',
    }));
  } catch (error) {
    console.error('Gagal membaca data kategori', error);
    return [];
  }
};

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState(loadCategories);
  const [editor, setEditor] = useState<{ id?: string; name: string; description: string } | null>(null);

  React.useEffect(() => {
    try {
      localStorage.setItem('eduspace_admin_categories', JSON.stringify(categories));
    } catch (error) {
      console.error('Gagal menyimpan data kategori', error);
    }
  }, [categories]);

  const saveCategory = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editor || !editor.name.trim() || !editor.description.trim()) return;
    if (editor.id) {
      setCategories((current) => current.map((category) => category.id === editor.id
        ? { ...category, name: editor.name.trim(), description: editor.description.trim() }
        : category));
    } else {
      setCategories((current) => [...current, {
        id: `category-${Date.now()}`,
        name: editor.name.trim(),
        slug: editor.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        courseCount: 0,
        description: editor.description.trim(),
        count: 0,
        status: 'Aktif',
      }]);
    }
    setEditor(null);
  };

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-heading">Taksonomi & Kategori Kurikulum</h1>
          <p className="text-xs text-slate-500 mt-1">Kelola kategori pembelajaran dan hierarki topik platform</p>
        </div>
        <Button variant="orange" size="sm" onClick={() => setEditor({ name: '', description: '' })} leftIcon={<Plus className="w-3.5 h-3.5" />}>
          + Buat Kategori Baru
        </Button>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">KATEGORI</th>
                <th className="pb-3">DESKRIPSI</th>
                <th className="pb-3">KURSUS</th>
                <th className="pb-3">STATUS</th>
                <th className="pb-3 text-right">TINDAKAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 font-bold text-text-heading">{translateCategory(c.name)}</td>
                  <td className="py-3.5 text-slate-500">{c.description}</td>
                  <td className="py-3.5 font-bold text-navy">{c.count} Kursus</td>
                  <td className="py-3.5">
                    <Badge variant="active" size="xs">Aktif</Badge>
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button type="button" aria-label={`Ubah kategori ${c.name}`} onClick={() => setEditor({ id: c.id, name: translateCategory(c.name), description: c.description })} className="text-slate-400 hover:text-blue p-1">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Hapus kategori ${c.name}`}
                        onClick={() => {
                          if (window.confirm(`Hapus kategori "${translateCategory(c.name)}"?`)) {
                            setCategories((current) => current.filter((category) => category.id !== c.id));
                          }
                        }}
                        className="text-slate-400 hover:text-red p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {editor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setEditor(null);
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="category-editor-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft-lg">
            <div className="mb-5 flex items-center justify-between">
              <h2 id="category-editor-title" className="text-lg font-bold text-text-heading">{editor.id ? 'Ubah Kategori' : 'Buat Kategori'}</h2>
              <button type="button" aria-label="Tutup formulir" onClick={() => setEditor(null)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <form onSubmit={saveCategory} className="space-y-4">
              <label className="block text-xs font-semibold text-text-heading">
                Nama kategori
                <input required maxLength={80} value={editor.name} onChange={(event) => setEditor({ ...editor, name: event.target.value })} className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm font-normal focus:border-blue focus:outline-none" />
              </label>
              <label className="block text-xs font-semibold text-text-heading">
                Deskripsi
                <textarea required maxLength={240} rows={3} value={editor.description} onChange={(event) => setEditor({ ...editor, description: event.target.value })} className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm font-normal focus:border-blue focus:outline-none" />
              </label>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setEditor(null)}>Batal</Button>
                <Button type="submit" variant="navy">Simpan</Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
