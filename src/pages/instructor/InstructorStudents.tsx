import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Card, Button, ProgressBar, Avatar, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { requireSupabase } from '../../lib/supabase';
import { downloadCSV } from '../../utils/download';
import { getInstructorStudents, InstructorStudentRow } from '../../services/learningAnalyticsService';

export const InstructorStudents: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [students, setStudents] = useState<InstructorStudentRow[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!user) return;
    setIsLoading(true);
    setError('');
    void getInstructorStudents(user.id)
      .then((rows) => { if (active) setStudents(rows); })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : 'Daftar peserta gagal dimuat.');
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [user]);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    return students.filter((student) =>
      !query || [student.name, student.courseTitle, student.id].some((value) => value.toLowerCase().includes(query)),
    );
  }, [search, students]);

  const avatarUrl = (path: string | null) => path
    ? requireSupabase().storage.from('avatars').getPublicUrl(path).data.publicUrl
    : undefined;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-text-heading">Daftar Peserta</h1>
          <p className="mt-1 text-xs text-slate-500">Peserta aktif di kursus yang kamu kelola, beserta progres dan hasil kuis.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={!filteredStudents.length}
          onClick={() => downloadCSV('daftar-peserta.csv', [
            ['ID Peserta', 'Nama', 'Kursus', 'Progres', 'Nilai Rata-rata', 'Status'],
            ...filteredStudents.map((student) => [
              student.id,
              student.name,
              student.courseTitle,
              `${student.progress.toFixed(1)}%`,
              student.score === null ? '' : `${student.score.toFixed(1)}%`,
              student.status,
            ]),
          ])}
          leftIcon={<Download className="h-3.5 w-3.5" />}
        >
          Ekspor Daftar Peserta (.CSV)
        </Button>
      </div>

      {error && <p role="alert" className="rounded-xl border border-red/20 bg-red/5 p-3 text-sm text-red">{error}</p>}
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama, kursus, atau ID peserta..."
            aria-label="Cari peserta"
            className="w-full max-w-sm rounded-xl border border-border bg-slate-50 px-3.5 py-2.5 text-xs focus:border-blue focus:outline-none"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3">Peserta</th>
                <th className="pb-3">Kursus</th>
                <th className="w-36 pb-3">Progres</th>
                <th className="pb-3">Rata-rata kuis</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStudents.map((student) => (
                <tr key={`${student.courseId}:${student.id}`} className="transition-colors hover:bg-slate-50">
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={avatarUrl(student.avatarPath)} name={student.name} size="xs" />
                      <div>
                        <span className="block font-bold text-text-heading">{student.name}</span>
                        <span className="text-[10px] text-slate-400">{student.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 font-medium text-slate-600">{student.courseTitle}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <ProgressBar progress={student.progress} color={student.progress === 100 ? 'green' : 'blue'} size="xs" />
                      <span className="w-10 font-bold text-slate-700">{student.progress.toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 font-bold text-navy">
                    {student.score === null ? '—' : `${student.score.toFixed(1)}%`}
                  </td>
                  <td className="py-3.5">
                    <Badge variant={student.status === 'Completed' ? 'active' : 'preview-free'} size="xs">
                      {student.status === 'Completed' ? 'Selesai' : 'Aktif'}
                    </Badge>
                  </td>
                  <td className="py-3.5">
                    <button
                      type="button"
                      onClick={() => navigate(`/instructor/messages/${student.id}`)}
                      className="font-bold text-blue hover:text-navy"
                      aria-label={`Kirim pesan kepada ${student.name}`}
                    >
                      Pesan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && filteredStudents.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              {students.length ? 'Tidak ada peserta yang cocok dengan pencarianmu.' : 'Belum ada peserta yang terdaftar di kursusmu.'}
            </p>
          )}
          {isLoading && <p className="py-8 text-center text-sm text-slate-500">Memuat daftar peserta...</p>}
        </div>
      </Card>
    </div>
  );
};
