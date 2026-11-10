import { UserRole } from '../types';

export type NotificationKind = 'course' | 'achievement' | 'community' | 'system';

export interface NotificationItem {
  id: string;
  kind: NotificationKind;
  title: string;
  description: string;
  time: string;
}

export const notificationsByRole: Record<UserRole, NotificationItem[]> = {
  participant: [
    {
      id: 'course-progress',
      kind: 'course',
      title: 'Lanjutkan kursus Pengembangan Web',
      description: 'Progres belajarmu sangat baik. Lanjutkan materi React Hooks dari bagian terakhir.',
      time: '2 jam lalu',
    },
    {
      id: 'quiz-score',
      kind: 'achievement',
      title: 'Hasil kuismu tersedia',
      description: 'Nilai evaluasi terbarumu telah ditambahkan ke riwayat belajar.',
      time: 'Kemarin',
    },
    {
      id: 'weekly-goal',
      kind: 'system',
      title: 'Target belajar mingguan menantimu',
      description: 'Selesaikan satu pelajaran lagi untuk mencapai target belajarmu minggu ini.',
      time: '2 hari lalu',
    },
  ],
  instructor: [
    {
      id: 'new-enrollments',
      kind: 'community',
      title: 'Peserta baru bergabung di kursusmu',
      description: '12 peserta mendaftar Bootcamp Pengembangan Web minggu ini.',
      time: '1 jam lalu',
    },
    {
      id: 'grading-queue',
      kind: 'course',
      title: 'Jawaban evaluasi siap ditinjau',
      description: 'Ada jawaban kuis baru yang menunggu penilaian.',
      time: '4 jam lalu',
    },
    {
      id: 'course-review',
      kind: 'system',
      title: 'Pembaruan tinjauan kursus',
      description: 'Pembaruan kursus terakhirmu telah diterima dan sedang ditinjau.',
      time: 'Kemarin',
    },
    {
      id: 'student-question',
      kind: 'community',
      title: 'Peserta mengajukan pertanyaan',
      description: 'Peserta mengirim pertanyaan baru dalam diskusi kursusmu.',
      time: '2 hari lalu',
    },
  ],
  admin: [
    {
      id: 'pending-courses',
      kind: 'course',
      title: 'Kursus menunggu peninjauanmu',
      description: '12 kursus menunggu persetujuan di antrean peninjauan.',
      time: '30 menit lalu',
    },
    {
      id: 'new-instructors',
      kind: 'community',
      title: 'Permintaan verifikasi pengajar',
      description: '8 akun pengajar menunggu verifikasi.',
      time: '3 jam lalu',
    },
    {
      id: 'system-status',
      kind: 'system',
      title: 'Laporan kondisi sistem tersedia',
      description: 'Laporan operasional platform terbaru siap ditinjau.',
      time: 'Kemarin',
    },
  ],
};
