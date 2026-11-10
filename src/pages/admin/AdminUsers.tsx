import React, { useState } from 'react';
import {
  Users,
  Search,
  Download,
  Plus,
  Edit,
  MoreVertical,
  CheckCircle2,
  FolderTree,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card, Button, Badge, Avatar } from '../../components/ui';
import { getUserAvatar } from '../../config/media';

export const AdminUsers: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'categories'>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Indonesian user rows
  const [users, setUsers] = useState([
    {
      id: 'USR-84920',
      name: 'Dian Paramitha',
      avatarId: 'dian-paramitha',
      email: 'dian.paramitha@eduspace.ac.id',
      role: 'Peserta',
      status: 'Aktif',
      joined: '12 Jan 2025',
    },
    {
      id: 'USR-84921',
      name: 'Dr. Siti Nurhaliza M.Cs.',
      avatarId: 'dr-siti',
      email: 'siti.nurhaliza@eduspace.ac.id',
      role: 'Instruktur',
      status: 'Aktif',
      joined: '08 Feb 2024',
    },
    {
      id: 'USR-84922',
      name: 'Rian Hidayat',
      avatarId: 'rian-hidayat',
      email: 'rian.hidayat@eduspace.ac.id',
      role: 'Peserta',
      status: 'Aktif',
      joined: '15 Mar 2025',
    },
    {
      id: 'USR-84923',
      name: 'Michael Wong',
      avatarId: 'michael-wong',
      email: 'michael.wong@eduspace.ac.id',
      role: 'Admin',
      status: 'Aktif',
      joined: '01 Jan 2024',
    },
    {
      id: 'USR-84924',
      name: 'Ahmad Fauzi',
      avatarId: 'ahmad-fauzi',
      email: 'ahmad.fauzi@eduspace.ac.id',
      role: 'Peserta',
      status: 'Aktif',
      joined: '20 Apr 2025',
    },
    {
      id: 'USR-84925',
      name: 'Budi Santoso',
      avatarId: 'budi-santoso',
      email: 'budi.santoso@eduspace.ac.id',
      role: 'Peserta',
      status: 'Aktif',
      joined: '05 Jan 2025',
    },
  ]);

  // Categories list for tab 2
  const [categories, setCategories] = useState([
    { id: 'cat-1', name: 'Teknologi & Cloud', slug: 'technology', courseCount: 24, status: 'Aktif' },
    { id: 'cat-2', name: 'Pengembangan Perangkat Lunak', slug: 'development', courseCount: 20, status: 'Aktif' },
    { id: 'cat-3', name: 'Bisnis & Manajemen', slug: 'business', courseCount: 18, status: 'Aktif' },
    { id: 'cat-4', name: 'UI/UX & Desain Produk', slug: 'design', courseCount: 16, status: 'Aktif' },
    { id: 'cat-5', name: 'Pemasaran Digital & Pertumbuhan', slug: 'marketing', courseCount: 14, status: 'Aktif' },
    { id: 'cat-6', name: 'Pengembangan Diri & Kepemimpinan', slug: 'personal-growth', courseCount: 12, status: 'Aktif' },
  ]);

  // Filtering users
  const filteredUsers = users.filter((u) => {
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match = u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (roleFilter !== 'all' && u.role.toLowerCase() !== roleFilter.toLowerCase()) return false;
    if (statusFilter !== 'all' && u.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
    return true;
  });

  const getRoleBadgeVariant = (r: string) => {
    if (r === 'Admin') return 'navy';
    if (r === 'Instruktur') return 'orange';
    return 'preview-free'; // Peserta
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* 1. HEADER (Indonesian Copy) */}
      <div>
        <div className="text-xs font-semibold text-slate-400 mb-1">
          Pusat Admin / Pengelolaan
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading mb-1.5">
          Kelola Pengguna & Kategori
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-3xl leading-relaxed">
          Kelola direktori seluruh pengguna platform, penugasan peran hak akses, serta taksonomi kategori kurikulum.
        </p>

        {/* Stat Chips */}
        <div className="flex items-center gap-3 mt-4 flex-wrap">
          <div className="px-3 py-1.5 rounded-full bg-soft-blue text-blue text-xs font-bold flex items-center gap-1.5 border border-blue/20">
            <span>TOTAL PENGGUNA:</span>
            <strong>24,850</strong>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-green-tint text-green text-xs font-bold flex items-center gap-1.5 border border-green/20">
            <span>KATEGORI:</span>
            <strong>18 Aktif</strong>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-orange-tint text-orange-dark text-xs font-bold flex items-center gap-1.5 border border-orange/20">
            <span>MENUNGGU:</span>
            <strong>3 Menunggu</strong>
          </div>
        </div>
      </div>

      {/* 2. TABS: Manajemen Pengguna 24,850 / Kategori Kursus 18 */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'users'
              ? 'bg-navy text-white shadow-sm'
              : 'text-slate-600 hover:text-navy hover:bg-white'
          }`}
        >
          Manajemen Pengguna (24,850)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === 'categories'
              ? 'bg-navy text-white shadow-sm'
              : 'text-slate-600 hover:text-navy hover:bg-white'
          }`}
        >
          Kategori Kursus (18)
        </button>
      </div>

      {activeTab === 'users' ? (
        <Card className="p-6 sm:p-8 space-y-6">
          {/* Toolbar: Search, Roles Select, Status Select, Export CSV, Orange Button */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Cari nama, email, atau ID pengguna..."
                  className="w-full bg-slate-50 border border-border text-xs rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-blue"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="bg-slate-50 border border-border text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:border-blue cursor-pointer w-full sm:w-auto"
              >
                <option value="all">Semua Peran</option>
                <option value="peserta">Peserta</option>
                <option value="instruktur">Instruktur</option>
                <option value="admin">Admin</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-border text-xs font-semibold rounded-xl px-3 py-2.5 text-slate-700 focus:outline-none focus:border-blue cursor-pointer w-full sm:w-auto"
              >
                <option value="all">Semua Status</option>
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>

            <div className="flex items-center gap-2.5">
              <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
                Ekspor CSV
              </Button>
              <Button variant="orange" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                + Tambah Pengguna Baru
              </Button>
            </div>
          </div>

          {/* Table: PENGGUNA, ALAMAT EMAIL, PERAN (ROLE), STATUS AKUN, BERGABUNG, TINDAKAN */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">PENGGUNA</th>
                  <th className="pb-3">ALAMAT EMAIL</th>
                  <th className="pb-3">PERAN</th>
                  <th className="pb-3">STATUS AKUN</th>
                  <th className="pb-3">BERGABUNG</th>
                  <th className="pb-3 text-right">TINDAKAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar src={getUserAvatar(u.avatarId)} name={u.name} size="sm" />
                        <div>
                          <span className="font-bold text-text-heading block">{u.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-600 font-medium">{u.email}</td>
                    <td className="py-3.5">
                      <Badge variant={getRoleBadgeVariant(u.role) as any} size="xs">
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex items-center gap-1 text-green font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-green" />
                        <span>{u.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 text-slate-500">{u.joined}</td>
                    <td className="py-3.5 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button type="button" className="text-slate-400 hover:text-blue p-1" title="Edit Pengguna">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button type="button" className="text-slate-400 hover:text-navy p-1" title="Opsi lainnya">
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-slate-500">
            <span>Menampilkan 1-6 dari 24,850 pengguna</span>
            <div className="flex items-center gap-1.5">
              <button type="button" className="p-1.5 rounded-lg border border-border bg-white text-slate-600 disabled:opacity-40" disabled>
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button type="button" className="w-8 h-8 rounded-lg bg-navy text-white font-bold">1</button>
              <button type="button" className="w-8 h-8 rounded-lg border border-border bg-white text-slate-600">2</button>
              <button type="button" className="w-8 h-8 rounded-lg border border-border bg-white text-slate-600">3</button>
              <button type="button" className="p-1.5 rounded-lg border border-border bg-white text-slate-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </Card>
      ) : (
        /* Kategori Kursus Tab */
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border">
            <div>
              <h3 className="text-base font-bold text-text-heading">
                Taksonomi Kategori Kurikulum
              </h3>
              <p className="text-xs text-slate-500">Atur hierarki topik untuk katalog kursus global</p>
            </div>
            <Button variant="orange" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
              + Tambah Kategori
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">NAMA KATEGORI</th>
                  <th className="pb-3">SLUG URL</th>
                  <th className="pb-3">JUMLAH KURSUS</th>
                  <th className="pb-3">STATUS</th>
                  <th className="pb-3 text-right">TINDAKAN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 font-bold text-text-heading">{cat.name}</td>
                    <td className="py-3.5 font-mono text-slate-500">/courses?category={cat.slug}</td>
                    <td className="py-3.5 font-bold text-navy">{cat.courseCount} Kursus</td>
                    <td className="py-3.5">
                      <Badge variant="active" size="xs">
                        {cat.status}
                      </Badge>
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
      )}
    </div>
  );
};
