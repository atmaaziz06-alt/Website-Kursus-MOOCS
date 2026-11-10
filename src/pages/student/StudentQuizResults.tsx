import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, CheckCircle2, Clock, ArrowRight, RotateCcw } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';

export const StudentQuizResults: React.FC = () => {
  const navigate = useNavigate();

  const quizzes = [
    {
      id: 'quiz-react-hooks',
      title: 'Kuis 1: Dasar React & Frontend',
      course: 'Bootcamp Pengembangan Web 2025',
      module: 'Modul 4: Arsitektur React & Frontend',
      score: 80,
      total: 100,
      grade: 'B+',
      status: 'Passed',
      date: '28 Mei 2025',
      timeTaken: '12:30 / 20:00',
    },
    {
      id: 'quiz-mod-1',
      title: 'Kuis 01: Dasar Web & DOM Tree',
      course: 'Bootcamp Pengembangan Web 2025',
      module: 'Modul 1: Dasar Web Modern',
      score: 90,
      total: 100,
      grade: 'A',
      status: 'Passed',
      date: '14 Mei 2025',
      timeTaken: '10:45 / 15:00',
    },
    {
      id: 'quiz-py-1',
      title: 'Kuis 01: Pola Pemrograman Berorientasi Objek Python',
      course: 'Belajar Pemrograman Python dari Nol',
      module: 'Modul 3: Kelas & Pewarisan',
      score: 100,
      total: 100,
      grade: 'A+',
      status: 'Passed',
      date: '22 April 2025',
      timeTaken: '14:10 / 20:00',
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-heading">Evaluasi & Riwayat Kuis</h1>
          <p className="text-xs text-slate-500 mt-1">Lihat kuis modul yang telah diselesaikan, rincian nilai, dan masukan pengajar</p>
        </div>
      </div>

      <div className="space-y-4">
        {quizzes.map((q) => (
          <Card key={q.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-tint text-green flex items-center justify-center shrink-0 border border-green/20">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Badge variant="active" size="xs">
                    {q.status === 'Passed' ? 'Lulus' : 'Belum Lulus'} (Nilai: {q.grade})
                  </Badge>
                  <span className="text-xs text-slate-400">• Diselesaikan pada {q.date}</span>
                </div>
                <h3 className="text-base font-bold text-text-heading mb-1">{q.title}</h3>
                <p className="text-xs text-slate-500">{q.course} • {q.module}</p>
                <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Waktu: {q.timeTaken}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 self-end sm:self-center">
              <div className="text-right">
                <span className="text-2xl font-extrabold text-navy block leading-none">{q.score}</span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">/ {q.total} Poin</span>
              </div>
              <Button
                variant="navy"
                size="sm"
                onClick={() => navigate(`/quiz/${q.id}/result`)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Lihat Rincian Nilai
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
