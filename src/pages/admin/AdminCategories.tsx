import React from 'react';
import { FolderTree, Plus, Edit, Trash2 } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { translateCategory } from '../../config/locale';

export const AdminCategories: React.FC = () => {
  const categories = [
    { id: '1', name: 'Technology', count: 24, description: 'Cloud, infrastruktur, DevOps, keamanan siber', status: 'Active' },
    { id: '2', name: 'Development', count: 20, description: 'Frontend, backend, aplikasi seluler, basis data', status: 'Active' },
    { id: '3', name: 'Business', count: 18, description: 'Manajemen, kepemimpinan, kewirausahaan', status: 'Active' },
    { id: '4', name: 'Design', count: 16, description: 'Desain UI/UX, sistem desain, token Figma', status: 'Active' },
    { id: '5', name: 'Marketing', count: 14, description: 'Pemasaran pertumbuhan, iklan performa, SEO', status: 'Active' },
    { id: '6', name: 'Personal Growth', count: 12, description: 'Produktivitas, pengembangan karier, soft skill', status: 'Active' },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-heading">Taksonomi & Kategori Kurikulum</h1>
          <p className="text-xs text-slate-500 mt-1">Kelola kategori pembelajaran dan hierarki topik platform</p>
        </div>
        <Button variant="orange" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
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
                      <button type="button" className="text-slate-400 hover:text-blue p-1">
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button type="button" className="text-slate-400 hover:text-red p-1">
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
    </div>
  );
};
