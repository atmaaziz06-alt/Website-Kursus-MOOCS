import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Search, ArrowRight, Download, Award, CheckCircle2 } from 'lucide-react';
import { Card, Button, ProgressBar, Badge, Avatar } from '../../components/ui';
import { useCourses } from '../../context/CourseContext';
import { mockCourses } from '../../data/mockData';
import { getCourseMedia, getInstructorPhoto } from '../../config/media';
import { downloadPrintableCertificate } from '../../utils/download';
import { useAuth } from '../../context/AuthContext';

export const StudentCourses: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { enrolledCourses } = useCourses();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filtered = enrolledCourses.filter((item) => {
    const course = mockCourses.find((c) => c.slug === item.courseSlug);
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!course?.title.toLowerCase().includes(q)) return false;
    }
    if (filter === 'active' && item.isCompleted) return false;
    if (filter === 'completed' && !item.isCompleted) return false;
    return true;
  });
  const enrolledCourseTitle = (location.state as { enrolledCourse?: string } | null)?.enrolledCourse;
  const activeCount = enrolledCourses.filter((course) => !course.isCompleted).length;
  const completedCount = enrolledCourses.filter((course) => course.isCompleted).length;

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      {enrolledCourseTitle && (
        <div role="status" className="flex items-start gap-3 rounded-2xl border border-green/20 bg-green-tint/50 p-4">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-green" />
          <div>
            <p className="text-sm font-bold text-text-heading">Kursus ditambahkan ke Kursus Saya</p>
            <p className="mt-0.5 text-xs text-slate-600">{enrolledCourseTitle}</p>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-heading">Kursus Saya</h1>
          <p className="text-xs text-slate-500 mt-1">Kelola dan pantau perkembangan kursus yang kamu ikuti</p>
        </div>
        <Button variant="orange" size="md" onClick={() => navigate('/courses')}>
          Jelajahi Kursus Baru
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-border">
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
              filter === 'all' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
            }`}
          >
            Semua Kursus ({enrolledCourses.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('active')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
              filter === 'active' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
            }`}
          >
            Berlangsung ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg transition-all ${
              filter === 'completed' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
            }`}
          >
            Selesai ({completedCount})
          </button>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kursus yang diikuti..."
            className="w-full bg-slate-50 text-xs rounded-xl border border-border px-3.5 py-2 focus:outline-none focus:border-blue"
          />
        </div>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => {
          const course = mockCourses.find((c) => c.slug === item.courseSlug);
          const courseMedia = getCourseMedia(item.courseSlug);
          const instructorPhoto = getInstructorPhoto(course?.instructor.id || 'john-smith');

          return (
            <Card key={item.courseId} className="flex flex-col overflow-hidden">
              <div className="relative aspect-[16/9] w-full bg-slate-100">
                <img
                  src={courseMedia.thumbnail}
                  alt={course?.title || item.courseSlug}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant={item.isCompleted ? 'active' : 'technology'} size="xs">
                    {item.isCompleted ? 'SELESAI' : 'SEDANG BERLANGSUNG'}
                  </Badge>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar src={instructorPhoto} name={course?.instructor.name || 'John Smith'} size="xs" />
                    <span className="text-xs font-semibold text-slate-500">
                      {course?.instructor.name || 'John Smith'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-text-heading mb-1 line-clamp-2">
                    {course?.title}
                  </h3>

                  <p className="text-xs text-blue font-semibold mb-3 truncate">
                    {item.isCompleted ? 'Semua 38 modul telah diselesaikan' : item.currentLessonTitle}
                  </p>

                  <ProgressBar
                    progress={item.progressPercent}
                    color={item.isCompleted ? 'green' : 'blue'}
                    size="xs"
                    className="mb-2"
                  />

                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{item.progressPercent}% Selesai</span>
                    <span>{item.completedLessons}/{item.totalLessons} Pelajaran</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border mt-4 flex items-center justify-between">
                  {item.isCompleted ? (
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      onClick={() => downloadPrintableCertificate(user?.name || 'Peserta EduSpace', course?.title || item.courseSlug)}
                      leftIcon={<Download className="w-3.5 h-3.5 text-blue" />}
                    >
                      Unduh Sertifikat
                    </Button>
                  ) : (
                    <Button
                      variant="navy"
                      size="sm"
                      fullWidth
                      onClick={() => navigate(`/learn/${item.courseSlug}/${item.currentLessonId}`)}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Lanjutkan Belajar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <p className="rounded-xl border border-border bg-white py-10 text-center text-sm text-slate-500">
          {search ? 'Tidak ada kursus yang cocok dengan pencarianmu.' : 'Belum ada kursus pada kategori ini.'}
        </p>
      )}
    </div>
  );
};
