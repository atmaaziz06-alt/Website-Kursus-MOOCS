import React, { useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, CircleDollarSign, FileText, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Input, Select } from '../../components/ui';
import { useCourses } from '../../context/CourseContext';
import { CourseCategory, CourseLevel } from '../../types';
import { translateCategory, translateLevel } from '../../config/locale';

const categories: CourseCategory[] = [
  'Technology',
  'Business',
  'Design',
  'Development',
  'Marketing',
  'Personal Growth',
  'Data & AI',
];

const levels: CourseLevel[] = ['Beginner', 'Intermediate', 'Advanced', 'All Levels'];

export const InstructorCourseCreate: React.FC = () => {
  const navigate = useNavigate();
  const { createInstructorCourse } = useCourses();
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const title = String(formData.get('title') || '').trim();
    const description = String(formData.get('description') || '').trim();
    const duration = String(formData.get('duration') || '').trim();
    const priceValue = Number(formData.get('price'));

    if (!title || !description || !duration || !Number.isFinite(priceValue) || priceValue < 0) {
      setErrorMessage('Masukkan judul, deskripsi, durasi, dan harga nol atau lebih yang valid.');
      return;
    }

    const newCourse = createInstructorCourse({
      title,
      description,
      duration,
      price: priceValue,
      category: formData.get('category') as CourseCategory,
      level: formData.get('level') as CourseLevel,
      status: submitter instanceof HTMLButtonElement && submitter.value === 'Published'
        ? 'Published'
        : 'Draft',
    });

    navigate(`/instructor?created=${encodeURIComponent(newCourse.id)}`);
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6">
      <div>
        <Link
          to="/instructor"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Dasbor Pengajar
        </Link>
        <p className="text-xs font-bold uppercase tracking-wider text-blue mb-1">Pembuatan kursus</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading">Buat Kursus</h1>
        <p className="text-sm text-slate-500 mt-1">
          Lengkapi detail kursus. Kamu dapat menyimpannya sebagai draf atau menerbitkannya.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-5 sm:p-7 space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-soft-blue text-blue">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-text-heading">Informasi Kursus</h2>
              <p className="text-xs text-slate-500">Informasi dasar kursus yang akan dilihat peserta.</p>
            </div>
          </div>

          <Input
            name="title"
            label="Judul Kursus"
            placeholder="mis. React Modern dan TypeScript"
            maxLength={100}
            required
          />

          <div>
            <label htmlFor="course-description" className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wide">
              Deskripsi kursus
            </label>
            <textarea
              id="course-description"
              name="description"
              rows={5}
              minLength={20}
              maxLength={1000}
              required
              placeholder="Jelaskan materi yang akan dipelajari dan keterampilan yang akan diperoleh."
              className="w-full rounded-xl border border-border bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue"
            />
            <p className="mt-1 text-xs text-slate-400">Tuliskan minimal 20 karakter.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              name="category"
              label="Kategori"
              options={categories.map((category) => ({ value: category, label: translateCategory(category) }))}
              defaultValue="Development"
              required
            />
            <Select
              name="level"
              label="Tingkat Kesulitan"
              options={levels.map((level) => ({ value: level, label: translateLevel(level) }))}
              defaultValue="Beginner"
              required
            />
            <Input
              name="duration"
              label="Perkiraan Durasi"
              placeholder="mis. 8 jam atau 4 minggu"
              maxLength={40}
              required
            />
            <Input
              name="price"
              label="Harga (Rupiah)"
              type="number"
              min="0"
              step="1000"
              defaultValue="0"
              leftIcon={<CircleDollarSign className="w-4 h-4" />}
              required
            />
          </div>
        </Card>

        {errorMessage && (
          <p role="alert" className="rounded-xl border border-red/20 bg-red/5 px-4 py-3 text-sm text-red">
            {errorMessage}
          </p>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="flex items-center gap-1.5 text-xs text-slate-500">
            <FileText className="w-4 h-4" />
            Draf dan kursus terbit disimpan di perangkat ini.
          </p>
          <div className="flex flex-col-reverse sm:flex-row gap-2">
            <Button type="submit" name="status" value="Draft" variant="outline">
              Simpan sebagai Draf
            </Button>
            <Button type="submit" name="status" value="Published" variant="orange" leftIcon={<Send className="w-4 h-4" />}>
              Terbitkan Kursus
            </Button>
          </div>
        </div>
      </form>

      <div className="flex items-start gap-2 rounded-xl border border-green/20 bg-green-tint/50 px-4 py-3 text-xs leading-relaxed text-slate-600">
        <CheckCircle2 className="w-4 h-4 shrink-0 text-green" />
        Kursus yang kamu buat akan muncul di dasbor pengajar dan tetap tersimpan saat halaman dimuat ulang.
      </div>
    </div>
  );
};
