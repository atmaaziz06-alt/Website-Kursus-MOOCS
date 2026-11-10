import React, { useState } from 'react';
import { ArrowLeft, BookOpen, CheckCircle2, CircleDollarSign, FileText, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Input, Select } from '../../components/ui';
import { useCourses } from '../../context/CourseContext';
import { CourseCategory, CourseLevel } from '../../types';

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
      setErrorMessage('Please provide a title, description, duration, and a valid non-negative price.');
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
          Instructor dashboard
        </Link>
        <p className="text-xs font-bold uppercase tracking-wider text-blue mb-1">Course authoring</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading">Create a course</h1>
        <p className="text-sm text-slate-500 mt-1">
          Add the course details. You can save it as a draft or publish it to your instructor course list.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-5 sm:p-7 space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-soft-blue text-blue">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-text-heading">Course information</h2>
              <p className="text-xs text-slate-500">Basic details learners will see about your course.</p>
            </div>
          </div>

          <Input
            name="title"
            label="Course title"
            placeholder="e.g. Modern React and TypeScript"
            maxLength={100}
            required
          />

          <div>
            <label htmlFor="course-description" className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wide">
              Course description
            </label>
            <textarea
              id="course-description"
              name="description"
              rows={5}
              minLength={20}
              maxLength={1000}
              required
              placeholder="Explain what learners will study and what skills they will gain."
              className="w-full rounded-xl border border-border bg-white px-3.5 py-3 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue/20 focus:border-blue"
            />
            <p className="mt-1 text-xs text-slate-400">Write at least 20 characters.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              name="category"
              label="Category"
              options={categories.map((category) => ({ value: category, label: category }))}
              defaultValue="Development"
              required
            />
            <Select
              name="level"
              label="Difficulty level"
              options={levels.map((level) => ({ value: level, label: level }))}
              defaultValue="Beginner"
              required
            />
            <Input
              name="duration"
              label="Estimated duration"
              placeholder="e.g. 8 hours or 4 weeks"
              maxLength={40}
              required
            />
            <Input
              name="price"
              label="Price (USD)"
              type="number"
              min="0"
              step="0.01"
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
            Drafts and published courses are saved on this device.
          </p>
          <div className="flex flex-col-reverse sm:flex-row gap-2">
            <Button type="submit" name="status" value="Draft" variant="outline">
              Save as draft
            </Button>
            <Button type="submit" name="status" value="Published" variant="orange" leftIcon={<Send className="w-4 h-4" />}>
              Publish course
            </Button>
          </div>
        </div>
      </form>

      <div className="flex items-start gap-2 rounded-xl border border-green/20 bg-green-tint/50 px-4 py-3 text-xs leading-relaxed text-slate-600">
        <CheckCircle2 className="w-4 h-4 shrink-0 text-green" />
        Courses you create will appear in your instructor dashboard and remain saved when you reload the page.
      </div>
    </div>
  );
};
