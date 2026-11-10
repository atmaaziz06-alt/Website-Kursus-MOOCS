import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Card, Button, ProgressBar, Avatar, Badge } from '../../components/ui';
import { getUserAvatar } from '../../config/media';
import { instructorStudents } from '../../data/instructorStudents';
import { downloadCSV } from '../../utils/download';

export const InstructorStudents: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredStudents = instructorStudents.filter((student) => {
    const query = search.trim().toLowerCase();
    return !query || [student.name, student.email, student.id].some((value) => value.toLowerCase().includes(query));
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-heading">Daftar Peserta</h1>
          <p className="text-xs text-slate-500 mt-1">Kelola dan bimbing peserta di bootcamp aktifmu</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => downloadCSV('daftar-peserta.csv', [
            ['ID', 'Nama', 'Email', 'Kursus', 'Progres', 'Nilai Rata-rata', 'Status'],
            ...filteredStudents.map((student) => [
              student.id,
              student.name,
              student.email,
              student.track,
              `${student.progress}%`,
              `${student.score}%`,
              student.status,
            ]),
          ])}
          leftIcon={<Download className="w-3.5 h-3.5" />}
        >
          Ekspor Daftar Peserta (.CSV)
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, email, atau ID peserta..."
            className="w-full max-w-sm bg-slate-50 border border-border rounded-xl text-xs px-3.5 py-2.5 focus:outline-none focus:border-blue"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">PESERTA</th>
                <th className="pb-3">PROGRAM YANG DIIKUTI</th>
                <th className="pb-3 w-36">PROGRES SILABUS</th>
                <th className="pb-3">RATA-RATA KUIS</th>
                <th className="pb-3">STATUS</th>
                <th className="pb-3">TINDAKAN</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={getUserAvatar(st.avatarId)} name={st.name} size="xs" />
                      <div>
                        <span className="font-bold text-text-heading block">{st.name}</span>
                        <span className="text-[10px] text-slate-400">{st.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-slate-600 font-medium">{st.track}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <ProgressBar progress={st.progress} color={st.progress === 100 ? 'green' : 'blue'} size="xs" />
                      <span className="font-bold text-slate-700 w-8">{st.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 font-bold text-navy">{st.score}%</td>
                  <td className="py-3.5">
                    <Badge variant={st.status === 'Completed' ? 'active' : st.status === 'At Risk' ? 'in-review' : 'preview-free'} size="xs">
                      {st.status === 'Completed' ? 'Selesai' : st.status === 'At Risk' ? 'Berisiko' : 'Aktif'}
                    </Badge>
                  </td>
                  <td className="py-3.5">
                    <button
                      type="button"
                      onClick={() => navigate(`/instructor/messages/${st.id}`)}
                      className="text-blue hover:text-navy font-bold"
                      aria-label={`Kirim pesan kepada ${st.name}`}
                    >
                      Pesan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">Tidak ada peserta yang cocok dengan pencarianmu.</p>
          )}
        </div>
      </Card>
    </div>
  );
};
