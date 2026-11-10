import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clock,
  Edit,
  Trash2,
  Move,
  Plus,
  Play,
  FileText,
  Terminal,
  Download,
  Search,
  ExternalLink,
  Copy,
  ChevronDown,
  Sparkles,
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  Code,
  Link as LinkIcon,
  X,
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, ProgressBar, Avatar } from '../../components/ui';
import { primaryWebDevCourse } from '../../data/mockData';
import { getCourseMedia, getUserAvatar } from '../../config/media';
import { downloadCSV } from '../../utils/download';

type Module = { id: string; title: string; status: string; badgeColor: string };
type Material = { id: string; moduleId: string; title: string; type: 'video' | 'pdf' | 'lab'; detail: string };
type QuizItem = {
  id: string;
  prompt: string;
  options: { A: string; B: string; C: string; D: string };
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
};
type CreatedQuiz = { id: string; title: string; questions: number; duration: string; passingScore: number; items?: QuizItem[] };
type QuizItemDraft = Omit<QuizItem, 'id'>;
type EditorForm = {
  type: 'module' | 'material' | 'quiz';
  id?: string;
  moduleId: string;
  title: string;
  materialType: Material['type'];
  detail: string;
  questions: string;
  duration: string;
  passingScore: string;
};

const initialModules: Module[] = [
  { id: 'm-1', title: 'Modul 1: Dasar Web & Semantic HTML5', status: 'Selesai', badgeColor: 'active' },
  { id: 'm-2', title: 'Modul 2: JavaScript ES6+ Modern & Pemrograman Asinkron', status: 'Selesai', badgeColor: 'active' },
  { id: 'm-3', title: 'Modul 3: TypeScript untuk Aplikasi Frontend Modern', status: 'Selesai', badgeColor: 'active' },
  { id: 'm-4', title: 'Modul 4: Arsitektur React & Frontend (Angkatan Aktif)', status: 'Modul Aktif', badgeColor: 'preview-free' },
  { id: 'm-5', title: 'Modul 5: Microservices Backend dengan Node.js & Prisma', status: 'Sedang Ditinjau', badgeColor: 'in-review' },
  { id: 'm-6', title: 'Modul 6: Deployment Cloud & Pipeline CI/CD', status: 'Draf', badgeColor: 'draft' },
];

const initialMaterials: Material[] = [
  { id: 'material-video-15', moduleId: 'm-4', title: '15. Pendalaman useState, useEffect & Custom Hooks', type: 'video', detail: '28 menit' },
  { id: 'material-pdf-15', moduleId: 'm-4', title: 'Modul-15-Hooks-Cheatsheet.pdf', type: 'pdf', detail: '1,2 MB' },
  { id: 'material-lab-15', moduleId: 'm-4', title: 'Lab Interaktif: Sandbox Pengujian Custom Hook', type: 'lab', detail: 'Lab kode' },
];
const initialSyllabus = `### Bagian 1: Dasar Web dan DOM
- Elemen HTML semantik dan aksesibilitas
- CSS Grid dan Flexbox responsif

### Bagian 2: React dan Pengelolaan State
- Hooks React dan siklus pembaruan
- Praktik membangun aplikasi interaktif`;

const loadStoredArray = <T,>(key: string, fallback: T[], isValid: (value: unknown) => value is T): T[] => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.every(isValid)) {
      throw new Error(`Data tersimpan untuk ${key} tidak valid.`);
    }
    return parsed;
  } catch (error) {
    console.error(`Tidak dapat memuat ${key}.`, error);
    return fallback;
  }
};

const loadStoredCourseMeta = (key: string): { title?: string; synopsis?: string; syllabus?: string } => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved) return {};
    const parsed: unknown = JSON.parse(saved);
    if (typeof parsed !== 'object' || parsed === null) return {};
    const meta = parsed as Record<string, unknown>;
    return {
      ...(typeof meta.title === 'string' ? { title: meta.title } : {}),
      ...(typeof meta.synopsis === 'string' ? { synopsis: meta.synopsis } : {}),
      ...(typeof meta.syllabus === 'string' ? { syllabus: meta.syllabus } : {}),
    };
  } catch (error) {
    console.error(`Tidak dapat memuat ${key}.`, error);
    return {};
  }
};

const isModule = (value: unknown): value is Module => {
  if (typeof value !== 'object' || value === null) return false;
  const module = value as Record<string, unknown>;
  return typeof module.id === 'string' && typeof module.title === 'string' &&
    typeof module.status === 'string' && typeof module.badgeColor === 'string';
};

const isMaterial = (value: unknown): value is Material => {
  if (typeof value !== 'object' || value === null) return false;
  const material = value as Record<string, unknown>;
  return typeof material.id === 'string' && typeof material.moduleId === 'string' &&
    typeof material.title === 'string' && typeof material.detail === 'string' &&
    (material.type === 'video' || material.type === 'pdf' || material.type === 'lab');
};

const isCreatedQuiz = (value: unknown): value is CreatedQuiz => {
  if (typeof value !== 'object' || value === null) return false;
  const quiz = value as Record<string, unknown>;
  return typeof quiz.id === 'string' && typeof quiz.title === 'string' &&
    typeof quiz.questions === 'number' && typeof quiz.duration === 'string' &&
    typeof quiz.passingScore === 'number' &&
    (quiz.items === undefined || (Array.isArray(quiz.items) && quiz.items.every(isQuizItem)));
};

const isQuizItem = (value: unknown): value is QuizItem => {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  if (typeof item.options !== 'object' || item.options === null) return false;
  const options = item.options as Record<string, unknown>;
  return typeof item.id === 'string' && typeof item.prompt === 'string' &&
    ['A', 'B', 'C', 'D'].every((key) => typeof options[key] === 'string') &&
    ['A', 'B', 'C', 'D'].includes(String(item.correctOption)) &&
    typeof item.explanation === 'string';
};

export const InstructorCourseManage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = primaryWebDevCourse;
  const courseMedia = getCourseMedia(course.slug);
  const [storedCourseMeta] = useState(() => loadStoredCourseMeta(`eduspace_course_meta_${id ?? course.slug}`));

  const [activeTab, setActiveTab] = useState<'info' | 'curriculum' | 'quizzes' | 'students' | 'analytics'>('info');
  const [courseTitle, setCourseTitle] = useState(storedCourseMeta.title ?? course.title);
  const [synopsis, setSynopsis] = useState(storedCourseMeta.synopsis ??
    'Bootcamp komprehensif untuk mempelajari pengembangan web full-stack modern dengan React 18, TypeScript, Node.js, dan microservices berbasis container.'
  );
  const [syllabus, setSyllabus] = useState(storedCourseMeta.syllabus ?? initialSyllabus);
  const syllabusRef = useRef<HTMLTextAreaElement>(null);

  // Curriculum draggable modules state
  const [modules, setModules] = useState(() => loadStoredArray('eduspace_curriculum_modules', initialModules, isModule));
  const [materials, setMaterials] = useState(() => loadStoredArray('eduspace_curriculum_materials', initialMaterials, isMaterial));
  const [createdQuizzes, setCreatedQuizzes] = useState(() => loadStoredArray('eduspace_created_quizzes', [], isCreatedQuiz));
  const [editorForm, setEditorForm] = useState<EditorForm | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [courseFeedback, setCourseFeedback] = useState('');
  const [quizItemEditor, setQuizItemEditor] = useState<{ quizId: string; itemId?: string } | null>(null);
  const [quizItemDraft, setQuizItemDraft] = useState<QuizItemDraft>({
    prompt: '',
    options: { A: '', B: '', C: '', D: '' },
    correctOption: 'A',
    explanation: '',
  });

  const insertSyllabusFormat = (prefix: string, suffix = '') => {
    const textarea = syllabusRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = syllabus.slice(start, end) || 'teks';
    const replacement = `${prefix}${selected}${suffix}`;
    const updated = `${syllabus.slice(0, start)}${replacement}${syllabus.slice(end)}`;
    setSyllabus(updated);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(start + replacement.length, start + replacement.length);
    });
  };

  // Drag and drop handler
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('eduspace_curriculum_modules', JSON.stringify(modules));
  }, [modules]);

  useEffect(() => {
    localStorage.setItem('eduspace_curriculum_materials', JSON.stringify(materials));
  }, [materials]);

  useEffect(() => {
    localStorage.setItem('eduspace_created_quizzes', JSON.stringify(createdQuizzes));
  }, [createdQuizzes]);

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const newItems = [...modules];
    const item = newItems.splice(draggedIdx, 1)[0];
    newItems.splice(idx, 0, item);
    setDraggedIdx(idx);
    setModules(newItems);
  };

  const moveModule = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= modules.length) return;
    setModules((current) => {
      const reordered = [...current];
      [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
      return reordered;
    });
  };

  const openEditor = (form: Partial<EditorForm> & Pick<EditorForm, 'type'>) => {
    setEditorForm({
      type: form.type,
      id: form.id,
      moduleId: form.moduleId || modules[0]?.id || '',
      title: form.title || '',
      materialType: form.materialType || 'video',
      detail: form.detail || '',
      questions: form.questions || '10',
      duration: form.duration || '15',
      passingScore: form.passingScore || '70',
    });
  };

  const saveEditorForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editorForm || !editorForm.title.trim()) return;

    if (editorForm.type === 'module') {
      if (editorForm.id) {
        setModules((current) => current.map((module) => module.id === editorForm.id
          ? { ...module, title: editorForm.title.trim() }
          : module));
      } else {
        setModules((current) => [...current, {
          id: `m-${Date.now()}`,
          title: editorForm.title.trim(),
          status: 'Draf',
          badgeColor: 'draft',
        }]);
      }
    } else if (editorForm.type === 'material') {
      const savedMaterial: Material = {
        id: editorForm.id || `material-${Date.now()}`,
        moduleId: editorForm.moduleId,
        title: editorForm.title.trim(),
        type: editorForm.materialType,
        detail: editorForm.detail.trim() || (editorForm.materialType === 'video' ? 'Video' : editorForm.materialType === 'pdf' ? 'PDF' : 'Lab kode'),
      };
      setMaterials((current) => editorForm.id
        ? current.map((material) => material.id === editorForm.id ? savedMaterial : material)
        : [...current, savedMaterial]);
    } else {
      const questions = Number(editorForm.questions);
      const passingScore = Number(editorForm.passingScore);
      if (!Number.isInteger(questions) || questions < 1 || !Number.isFinite(passingScore) || passingScore < 0 || passingScore > 100) return;
      setCreatedQuizzes((current) => [...current, {
        id: `quiz-${Date.now()}`,
        title: editorForm.title.trim(),
        questions,
        duration: `${editorForm.duration} menit`,
        passingScore,
      }]);
    }
    setEditorForm(null);
  };

  const openQuizItemEditor = (quiz: CreatedQuiz, item?: QuizItem) => {
    setQuizItemDraft(item
      ? {
        prompt: item.prompt,
        options: { ...item.options },
        correctOption: item.correctOption,
        explanation: item.explanation,
      }
      : {
        prompt: '',
        options: { A: '', B: '', C: '', D: '' },
        correctOption: 'A',
        explanation: '',
      });
    setQuizItemEditor({ quizId: quiz.id, itemId: item?.id });
  };

  const saveQuizItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!quizItemEditor) return;
    const quiz = createdQuizzes.find((item) => item.id === quizItemEditor.quizId);
    if (!quiz) return;
    const currentItems = quiz.items ?? [];
    if (!quizItemEditor.itemId && currentItems.length >= quiz.questions) return;

    const savedItem: QuizItem = {
      ...quizItemDraft,
      id: quizItemEditor.itemId ?? `question-${Date.now()}`,
      prompt: quizItemDraft.prompt.trim(),
      options: {
        A: quizItemDraft.options.A.trim(),
        B: quizItemDraft.options.B.trim(),
        C: quizItemDraft.options.C.trim(),
        D: quizItemDraft.options.D.trim(),
      },
      explanation: quizItemDraft.explanation.trim(),
    };
    setCreatedQuizzes((current) => current.map((item) => {
      if (item.id !== quiz.id) return item;
      const items = item.items ?? [];
      return {
        ...item,
        items: quizItemEditor.itemId
          ? items.map((question) => question.id === quizItemEditor.itemId ? savedItem : question)
          : [...items, savedItem],
      };
    }));
    setQuizItemEditor(null);
  };

  const removeQuizItem = (quiz: CreatedQuiz, item: QuizItem) => {
    if (!window.confirm(`Hapus pertanyaan "${item.prompt}"?`)) return;
    setCreatedQuizzes((current) => current.map((entry) => entry.id === quiz.id
      ? { ...entry, items: (entry.items ?? []).filter((question) => question.id !== item.id) }
      : entry));
  };

  const removeModule = (moduleId: string) => {
    const module = modules.find((item) => item.id === moduleId);
    if (!module || !window.confirm(`Hapus "${module.title}" beserta seluruh materinya?`)) return;
    setModules((current) => current.filter((item) => item.id !== moduleId));
    setMaterials((current) => current.filter((item) => item.moduleId !== moduleId));
  };

  const removeMaterial = (materialId: string) => {
    const material = materials.find((item) => item.id === materialId);
    if (!material || !window.confirm(`Hapus materi "${material.title}"?`)) return;
    setMaterials((current) => current.filter((item) => item.id !== materialId));
  };

  // Student table filter state
  const [studentFilter, setStudentFilter] = useState<'all' | 'active' | 'completed' | 'at-risk'>('all');
  const [studentSearch, setStudentSearch] = useState('');

  const enrolledStudents = [
    { name: 'Dian Paramitha', avatarId: 'dian-paramitha', enrolledDate: '12 Jan 2025', progress: 85, quizAvg: 92.4, lastActive: '2 jam lalu' },
    { name: 'Ahmad Fauzi', avatarId: 'ahmad-fauzi', enrolledDate: '18 Jan 2025', progress: 65, quizAvg: 88.0, lastActive: 'Kemarin' },
    { name: 'Budi Santoso', avatarId: 'budi-santoso', enrolledDate: '05 Jan 2025', progress: 100, isCompleted: true, quizAvg: 95.0, lastActive: '3 hari lalu' },
    { name: 'Sarah Jenkins', avatarId: 'usr-84920', enrolledDate: '22 Feb 2025', progress: 40, quizAvg: 78.5, lastActive: '5 hari lalu', isAtRisk: true },
  ];
  const filteredEnrolledStudents = enrolledStudents.filter((student) => {
    const query = studentSearch.trim().toLowerCase();
    if (query && !student.name.toLowerCase().includes(query)) return false;
    if (studentFilter === 'completed' && !student.isCompleted) return false;
    if (studentFilter === 'at-risk' && !student.isAtRisk) return false;
    if (studentFilter === 'active' && (student.isCompleted || student.isAtRisk)) return false;
    return true;
  });

  const saveCourseStatus = (status: 'draft' | 'published') => {
    try {
      localStorage.setItem(`eduspace_course_meta_${id ?? course.slug}`, JSON.stringify({
        title: courseTitle,
        synopsis,
        syllabus,
        status,
        updatedAt: new Date().toISOString(),
      }));
      setCourseFeedback(status === 'draft' ? 'Draf kursus berhasil disimpan.' : 'Perubahan kursus berhasil diterbitkan.');
    } catch (error) {
      console.error('Gagal menyimpan perubahan kursus', error);
      setCourseFeedback('Perubahan kursus tidak dapat disimpan di perangkat ini.');
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* 1. TOP HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/instructor" className="hover:text-navy font-semibold">
              ← Kursus Saya
            </Link>
            <span>/</span>
            <span className="text-slate-400">Bootcamp Pengembangan Web 2025</span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-heading">
              Kelola Kursus: Web Dev Bootcamp
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-soft-blue text-blue text-xs font-bold uppercase">
              ANGKATAN 2025
            </span>
            <Badge variant="active" size="xs">
              Terbit (v2.4)
            </Badge>
          </div>
          <span className="text-xs text-slate-400 block mt-1">
            Terakhir diedit 15 menit lalu oleh John Smith
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/courses/web-development-bootcamp-2025')}
          >
            Pratinjau sebagai Peserta
          </Button>
          <Button variant="outline" size="sm" onClick={() => saveCourseStatus('draft')}>
            Simpan sebagai Draf
          </Button>
          <Button variant="orange" size="sm" onClick={() => saveCourseStatus('published')}>
            Terbitkan Perubahan
          </Button>
        </div>
      </div>
      {courseFeedback && <p role="status" className="text-xs font-semibold text-blue">{courseFeedback}</p>}

      {/* 2. TAB PILLS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border">
        {[
          { id: 'info', label: 'Info Kursus' },
          { id: 'curriculum', label: 'Kurikulum & Materi (38 Pelajaran)' },
          { id: 'quizzes', label: 'Kuis & Evaluasi (4 Kuis)' },
          { id: 'students', label: 'Peserta Terdaftar (1.450)' },
          { id: 'analytics', label: 'Analitik & Performa' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            aria-pressed={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-navy text-white shadow-sm'
                : 'text-slate-600 hover:text-navy hover:bg-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. MAIN WORKSPACE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Wide Cards */}
        <div className={['info', 'curriculum', 'students'].includes(activeTab) ? 'xl:col-span-12 space-y-8' : 'hidden'}>
          {/* CARD 1: Course Basic Information */}
          {activeTab === 'info' && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-blue" />
                <h3 className="text-base font-bold text-text-heading">
                  Informasi Dasar Kursus
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-soft-blue text-blue text-[11px] font-bold uppercase">
                Silabus Terakreditasi
              </span>
            </div>

            <div className="space-y-4">
              <Input
                label="Judul Kursus (Wajib)*"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Kategori"
                  options={[
                    { value: 'development', label: 'Pemrograman & Rekayasa' },
                    { value: 'technology', label: 'Teknologi & Cloud' },
                    { value: 'design', label: 'Desain & UX' },
                  ]}
                  defaultValue="development"
                />
                <Select
                  label="Tingkat Kesulitan"
                  options={[
                    { value: 'beginner', label: 'Pemula hingga Menengah' },
                    { value: 'intermediate', label: 'Menengah' },
                    { value: 'advanced', label: 'Lanjutan' },
                  ]}
                  defaultValue="beginner"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Perkiraan Durasi & Tempo"
                  defaultValue="24 Hours (8 Weeks recommended pacing)"
                />
                <Input
                  label="Bahasa Pengantar"
                  defaultValue="Bahasa Indonesia & English"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wide">
                  Short Synopsis
                </label>
                <textarea
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                  rows={3}
                  className="w-full bg-white text-xs sm:text-sm rounded-xl border border-border p-3 focus:outline-none focus:border-blue"
                />
                <div className="text-right text-[11px] text-slate-400 mt-1">
                  {synopsis.length} / 200 characters
                </div>
              </div>

              {/* Rich Text Style Editor for Comprehensive Syllabus */}
              <div>
                <label className="block text-xs font-semibold text-text-heading mb-1.5 uppercase tracking-wide">
                  Silabus Komprehensif & Capaian Pembelajaran
                </label>
                <div className="rounded-xl border border-border overflow-hidden bg-white">
                  {/* Toolbar */}
                  <div className="p-2 border-b border-border bg-slate-50 flex items-center gap-1 flex-wrap">
                    {[
                      { icon: <Bold className="w-3.5 h-3.5" />, title: 'Tebal', prefix: '**', suffix: '**' },
                      { icon: <Italic className="w-3.5 h-3.5" />, title: 'Miring', prefix: '*', suffix: '*' },
                      { icon: <Strikethrough className="w-3.5 h-3.5" />, title: 'Coret', prefix: '~~', suffix: '~~' },
                      { icon: <Heading2 className="w-3.5 h-3.5" />, title: 'Judul 2', prefix: '## ', suffix: '' },
                      { icon: <Heading3 className="w-3.5 h-3.5" />, title: 'Judul 3', prefix: '### ', suffix: '' },
                      { icon: <List className="w-3.5 h-3.5" />, title: 'Daftar Berpoin', prefix: '- ', suffix: '' },
                      { icon: <Code className="w-3.5 h-3.5" />, title: 'Blok kode', prefix: '```\n', suffix: '\n```' },
                      { icon: <LinkIcon className="w-3.5 h-3.5" />, title: 'Tautan', prefix: '[', suffix: '](url)' },
                    ].map((tool, idx) => (
                      <button
                        key={idx}
                        type="button"
                        title={tool.title}
                        aria-label={tool.title}
                        onClick={() => insertSyllabusFormat(tool.prefix, tool.suffix)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-navy hover:bg-white border border-transparent hover:border-border transition-colors"
                      >
                        {tool.icon}
                      </button>
                    ))}
                  </div>
                  <textarea
                    ref={syllabusRef}
                    rows={4}
                    value={syllabus}
                    onChange={(event) => setSyllabus(event.target.value)}
                    className="w-full p-4 text-xs sm:text-sm font-mono text-slate-700 focus:outline-none bg-white"
                  />
                </div>
              </div>

              {/* Course Showcase Banner & Thumbnail upload area */}
              <div className="pt-4 border-t border-border">
                <label className="block text-xs font-semibold text-text-heading mb-2 uppercase tracking-wide">
                  Banner & Gambar Mini Kursus
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl border border-dashed border-border bg-slate-50">
                  <div className="w-40 aspect-[16/9] rounded-lg overflow-hidden bg-slate-200 border border-border shadow-sm shrink-0">
                    <img
                      src={courseMedia.thumbnail}
                      alt="Pratinjau gambar mini"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <span className="text-xs font-bold text-text-heading block mb-0.5">
                      web-dev-bootcamp-showcase-2025.jpg
                    </span>
                    <span className="text-[11px] text-slate-400 block mb-3">
                      Resolusi tinggi 1920x1080 • Dikelola melalui repositori media terpusat
                    </span>
                    <p className="text-xs text-slate-500">
                      Gambar dikelola melalui repositori media, sehingga perubahan gambar tidak tersedia di editor demo ini.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
          )}

          {/* CARD 2: Course Curriculum & Learning Materials */}
          {activeTab === 'curriculum' && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-5 rounded-full bg-orange" />
                <div>
                  <h3 className="text-base font-bold text-text-heading">
                    Kurikulum Kursus & Materi Pembelajaran
                  </h3>
                  <span className="text-xs text-slate-400">
                    Total {modules.length} Bagian{isReordering ? ' • Seret atau gunakan tombol panah untuk mengurutkan' : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsReordering((value) => !value)}>
                  {isReordering ? 'Selesai Mengurutkan' : 'Urutkan Ulang Bagian'}
                </Button>
                <Button
                  variant="navy"
                  size="sm"
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                  onClick={() => openEditor({ type: 'material', moduleId: modules.find((module) => module.id === 'm-4')?.id || modules[0]?.id })}
                >
                  Tambah Materi
                </Button>
              </div>
            </div>

            {/* Draggable Module Rows */}
            <div className="space-y-3">
              {modules.map((m, idx) => (
                <div
                  key={m.id}
                  draggable={isReordering}
                  onDragStart={() => isReordering && handleDragStart(idx)}
                  onDragOver={(e) => isReordering && handleDragOver(e, idx)}
                  onDragEnd={() => setDraggedIdx(null)}
                  className={`border border-border rounded-xl p-4 bg-white hover:border-blue/40 transition-all shadow-sm ${isReordering ? 'cursor-move' : ''}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Move className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="text-xs sm:text-sm font-bold text-text-heading truncate">
                        {m.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {isReordering && (
                        <div className="flex items-center">
                          <button
                            type="button"
                            aria-label={`Pindahkan ${m.title} ke atas`}
                            disabled={idx === 0}
                            onClick={() => moveModule(idx, -1)}
                            className="rounded p-1 text-slate-400 hover:text-navy disabled:opacity-30"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Pindahkan ${m.title} ke bawah`}
                            disabled={idx === modules.length - 1}
                            onClick={() => moveModule(idx, 1)}
                            className="rounded p-1 text-slate-400 hover:text-navy disabled:opacity-30"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      <Badge variant={m.badgeColor as any} size="xs">
                        {m.status}
                      </Badge>
                      <button
                        type="button"
                        aria-label={`Ubah ${m.title}`}
                        onClick={() => openEditor({ type: 'module', id: m.id, title: m.title })}
                        className="text-slate-400 hover:text-navy p-1"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Hapus ${m.title}`}
                        onClick={() => removeModule(m.id)}
                        className="text-slate-400 hover:text-red p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {materials.some((material) => material.moduleId === m.id) && (
                    <div className="mt-4 pt-3 border-t border-border/60 space-y-2 pl-7">
                      {materials.filter((material) => material.moduleId === m.id).map((material) => (
                        <div key={material.id} className="flex items-center justify-between gap-3 text-xs p-2 rounded-lg bg-slate-50">
                          <div className="flex items-center gap-2 min-w-0">
                            {material.type === 'video' && <Play className="w-3.5 h-3.5 text-blue shrink-0" />}
                            {material.type === 'pdf' && <FileText className="w-3.5 h-3.5 text-orange shrink-0" />}
                            {material.type === 'lab' && <Terminal className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                            <span className="truncate">{material.title}</span>
                            <span className="px-1.5 py-0.5 rounded bg-soft-blue text-blue text-[9px] font-bold uppercase">
                              {material.type === 'video' ? 'Video' : material.type === 'pdf' ? 'PDF' : 'Lab'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-slate-400">{material.detail}</span>
                            <button
                              type="button"
                              aria-label={`Ubah materi ${material.title}`}
                              onClick={() => openEditor({
                                type: 'material',
                                id: material.id,
                                moduleId: material.moduleId,
                                title: material.title,
                                materialType: material.type,
                                detail: material.detail,
                              })}
                              className="text-slate-400 hover:text-navy"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              aria-label={`Hapus materi ${material.title}`}
                              onClick={() => removeMaterial(material.id)}
                              className="text-slate-400 hover:text-red"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
          )}

          {/* CARD 3: Enrolled Students Overview */}
          {activeTab === 'students' && (
          <Card className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-border">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-text-heading">
                    Enrolled Students Overview (Cohort 2025)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-soft-blue text-blue text-xs font-bold">
                    1,450 Total
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  Track individual pacing, submission rates, and cohort compliance
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadCSV('peserta-kursus.csv', [
                  ['Nama', 'Tanggal Daftar', 'Progres', 'Rata-rata Kuis', 'Aktif Terakhir'],
                  ...filteredEnrolledStudents.map((student) => [
                    student.name,
                    student.enrolledDate,
                    `${student.progress}%`,
                    `${student.quizAvg}%`,
                    student.lastActive,
                  ]),
                ])}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Ekspor CSV
              </Button>
            </div>

            {/* Toolbar: Search + Filter Pills */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setStudentFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    studentFilter === 'all' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Semua
                </button>
                <button
                  type="button"
                  onClick={() => setStudentFilter('active')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    studentFilter === 'active' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Aktif
                </button>
                <button
                  type="button"
                  onClick={() => setStudentFilter('completed')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    studentFilter === 'completed' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Selesai
                </button>
                <button
                  type="button"
                  onClick={() => setStudentFilter('at-risk')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    studentFilter === 'at-risk' ? 'bg-white text-navy shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Berisiko
                </button>
              </div>

              <div className="w-full sm:w-64">
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Cari nama peserta..."
                  className="w-full bg-slate-50 text-xs rounded-xl border border-border px-3 py-2 focus:outline-none focus:border-blue"
                />
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">PESERTA</th>
                    <th className="pb-3">TANGGAL DAFTAR</th>
                    <th className="pb-3 w-36">PROGRES</th>
                    <th className="pb-3">RATA-RATA KUIS</th>
                    <th className="pb-3">AKTIF TERAKHIR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredEnrolledStudents.map((st) => (
                    <tr key={st.name} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={getUserAvatar(st.avatarId)} name={st.name} size="xs" />
                          <span className="font-bold text-text-heading">{st.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 text-slate-500">{st.enrolledDate}</td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <ProgressBar
                            progress={st.progress}
                            color={st.isCompleted ? 'green' : 'blue'}
                            size="xs"
                          />
                          <span className="font-bold text-slate-700 w-8">{st.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 font-bold text-navy">{st.quizAvg}%</td>
                      <td className="py-3.5 text-slate-500">{st.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredEnrolledStudents.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-500">Tidak ada peserta yang cocok dengan filter.</p>
              )}
            </div>
          </Card>
          )}
        </div>

        {/* Right Column (4 cols): Module Quizzes, Health & Engagement, Office Hours */}
        <div className={['quizzes', 'analytics'].includes(activeTab) ? 'xl:col-span-12 space-y-6' : 'hidden'}>
          {/* Right Card 1: Module Quizzes */}
          {activeTab === 'quizzes' && (
          <Card className="p-6">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <h3 className="text-sm font-bold text-text-heading">Kuis Modul</h3>
              <Button
                variant="orange"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => openEditor({ type: 'quiz' })}
              >
                Tambah Kuis
              </Button>
            </div>

            <div className="space-y-4">
              {/* Quiz 1 */}
              <div className="p-4 rounded-xl border border-blue/30 bg-soft-blue/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-navy">
                    Quiz 1: React & Frontend Architecture
                  </span>
                  <Badge variant="active" size="xs">Aktif</Badge>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  10 Questions • 15 Mins Limit • Min Pass 80%
                </p>
                <div className="text-xs text-slate-600 font-semibold mb-3 flex items-center justify-between">
                  <span>Jawaban: <strong>1.420</strong></span>
                  <span>Rata-rata: <strong>86,5%</strong></span>
                  <span className="text-green">Lulus: <strong>92%</strong></span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-blue">
                  <button type="button" onClick={() => setActiveTab('analytics')} className="hover:underline">Lihat Analitik</button>
                  <span className="font-normal text-slate-400">Kuis contoh — tidak dapat diedit</span>
                </div>
              </div>

              {/* Quiz 2 */}
              <div className="p-4 rounded-xl border border-border bg-slate-50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-text-heading">
                    Quiz 2: JavaScript Modern ES6+ & Async
                  </span>
                  <Badge variant="active" size="xs">Aktif</Badge>
                </div>
                <p className="text-[11px] text-slate-500 mb-2">
                  12 Questions • 20 Mins Limit • Min Pass 75%
                </p>
                <div className="flex items-center gap-3 text-xs font-bold text-blue">
                  <button type="button" onClick={() => setActiveTab('analytics')} className="hover:underline">Lihat Analitik</button>
                  <span className="font-normal text-slate-400">Kuis contoh — tidak dapat diedit</span>
                </div>
              </div>

              {/* Quiz 3 */}
              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-text-heading">
                    Quiz 3: Full-Stack Node.js & Schemas
                  </span>
                  <Badge variant="draft" size="xs">Draf</Badge>
                </div>
                <p className="text-[11px] text-amber-800 mb-2 font-medium">
                  Unpublished changes • In preparation for Week 6
                </p>
                <div className="flex items-center gap-3 text-xs font-bold text-orange">
                  <span>Kuis contoh — tidak dapat diedit</span>
                </div>
              </div>

              {createdQuizzes.map((quiz) => (
                <div key={quiz.id} className="p-4 rounded-xl border border-border bg-white">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-text-heading">{quiz.title}</span>
                    <Badge variant={(quiz.items?.length ?? 0) === quiz.questions ? 'active' : 'draft'} size="xs">
                      {(quiz.items?.length ?? 0) === quiz.questions ? 'Siap' : 'Draf'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {quiz.items?.length ?? 0}/{quiz.questions} soal dibuat • Durasi {quiz.duration} • Nilai lulus {quiz.passingScore}%
                  </p>
                  <div className="mt-3 space-y-2">
                    {(quiz.items ?? []).map((item, index) => (
                      <div key={item.id} className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 p-2.5">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700">{index + 1}. {item.prompt}</p>
                          <p className="mt-1 text-[11px] font-semibold text-green">Kunci jawaban: {item.correctOption}. {item.options[item.correctOption]}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <button type="button" aria-label={`Ubah soal ${index + 1}`} onClick={() => openQuizItemEditor(quiz, item)} className="rounded p-1 text-slate-400 hover:text-blue">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button type="button" aria-label={`Hapus soal ${index + 1}`} onClick={() => removeQuizItem(quiz, item)} className="rounded p-1 text-slate-400 hover:text-red">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    disabled={(quiz.items?.length ?? 0) >= quiz.questions}
                    onClick={() => openQuizItemEditor(quiz)}
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                  >
                    Tambah Soal & Jawaban
                  </Button>
                </div>
              ))}
            </div>
          </Card>
          )}

          {/* Right Card 2: Course Health & Engagement */}
          {activeTab === 'analytics' && (
          <Card className="p-6">
            <h3 className="text-sm font-bold text-text-heading mb-2">
              Course Health & Engagement
            </h3>
            <div className="flex items-center gap-2 text-xs text-green font-bold mb-4">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse" />
              <span>Peserta Aktif Mingguan +18,4% dibanding minggu lalu</span>
            </div>

            <div className="space-y-3 pt-2 border-t border-border">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Rata-rata Durasi Tonton:</span>
                <strong className="text-navy">34,2 menit / sesi</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Pengumpulan Tugas:</span>
                <strong className="text-navy">94,8% tepat waktu</strong>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Pertanyaan Diajukan:</span>
                <strong className="text-navy">128 di forum tanya jawab</strong>
              </div>
            </div>
          </Card>
          )}

          {/* Right Card 3: Navy Card - Instructor Office Hours */}
          {activeTab === 'analytics' && (
          <div className="bg-navy rounded-2xl p-6 text-white shadow-soft flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange block mb-0.5">
                LIVE SESSION
              </span>
              <h4 className="text-xs sm:text-sm font-bold">
                Instructor Office Hours
              </h4>
              <p className="text-[11px] text-slate-300">
                Every Thursday • 19:00 WIB
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-white text-navy hover:bg-slate-100 font-bold border-none"
            >
              Manage
            </Button>
          </div>
          )}
        </div>
      </div>

      {editorForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-navy/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditorForm(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="curriculum-dialog-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-soft-lg"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 id="curriculum-dialog-title" className="text-lg font-bold text-text-heading">
                {editorForm.type === 'quiz'
                  ? 'Tambah Kuis'
                  : editorForm.type === 'material'
                  ? editorForm.id ? 'Ubah Materi' : 'Tambah Materi'
                  : editorForm.id ? 'Ubah Bagian' : 'Tambah Bagian'}
              </h2>
              <button
                type="button"
                aria-label="Tutup formulir"
                onClick={() => setEditorForm(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-navy"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={saveEditorForm} className="space-y-4">
              <label className="block text-xs font-semibold text-text-heading">
                {editorForm.type === 'quiz' ? 'Nama kuis' : editorForm.type === 'material' ? 'Nama materi' : 'Nama bagian'}
                <input
                  autoFocus
                  required
                  maxLength={120}
                  value={editorForm.title}
                  onChange={(event) => setEditorForm({ ...editorForm, title: event.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm font-normal text-slate-800 focus:border-blue focus:outline-none"
                  placeholder={editorForm.type === 'quiz' ? 'mis. Kuis Arsitektur React' : 'Masukkan judul'}
                />
              </label>

              {editorForm.type === 'material' && (
                <>
                  <label className="block text-xs font-semibold text-text-heading">
                    Bagian kursus
                    <select
                      value={editorForm.moduleId}
                      required
                      onChange={(event) => setEditorForm({ ...editorForm, moduleId: event.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-normal text-slate-800 focus:border-blue focus:outline-none"
                    >
                      {modules.map((module) => <option key={module.id} value={module.id}>{module.title}</option>)}
                    </select>
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-xs font-semibold text-text-heading">
                      Jenis materi
                      <select
                        value={editorForm.materialType}
                        onChange={(event) => {
                          const materialType = event.target.value;
                          if (materialType === 'video' || materialType === 'pdf' || materialType === 'lab') {
                            setEditorForm({ ...editorForm, materialType });
                          }
                        }}
                        className="mt-1.5 w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-normal text-slate-800 focus:border-blue focus:outline-none"
                      >
                        <option value="video">Video</option>
                        <option value="pdf">PDF</option>
                        <option value="lab">Lab interaktif</option>
                      </select>
                    </label>
                    <label className="block text-xs font-semibold text-text-heading">
                      Durasi / keterangan
                      <input
                        value={editorForm.detail}
                        onChange={(event) => setEditorForm({ ...editorForm, detail: event.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm font-normal text-slate-800 focus:border-blue focus:outline-none"
                        placeholder="mis. 20 menit"
                      />
                    </label>
                  </div>
                </>
              )}

              {editorForm.type === 'quiz' && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="block text-xs font-semibold text-text-heading">
                    Jumlah pertanyaan
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={editorForm.questions}
                      onChange={(event) => setEditorForm({ ...editorForm, questions: event.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm font-normal text-slate-800 focus:border-blue focus:outline-none"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-text-heading">
                    Durasi (menit)
                    <input
                      type="number"
                      min="1"
                      max="300"
                      required
                      value={editorForm.duration}
                      onChange={(event) => setEditorForm({ ...editorForm, duration: event.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm font-normal text-slate-800 focus:border-blue focus:outline-none"
                    />
                  </label>
                  <label className="block text-xs font-semibold text-text-heading">
                    Nilai lulus (%)
                    <input
                      type="number"
                      min="0"
                      max="100"
                      required
                      value={editorForm.passingScore}
                      onChange={(event) => setEditorForm({ ...editorForm, passingScore: event.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm font-normal text-slate-800 focus:border-blue focus:outline-none"
                    />
                  </label>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditorForm(null)}>Batal</Button>
                <Button type="submit" variant="navy">Simpan</Button>
              </div>
            </form>
          </section>
        </div>
      )}
      {quizItemEditor && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-navy/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setQuizItemEditor(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-item-dialog-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-soft-lg"
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 id="quiz-item-dialog-title" className="text-lg font-bold text-text-heading">
                  {quizItemEditor.itemId ? 'Ubah Soal' : 'Tambah Soal'}
                </h2>
                <p className="mt-1 text-xs text-slate-500">Isi pertanyaan, empat pilihan, lalu pilih jawaban yang benar.</p>
              </div>
              <button type="button" aria-label="Tutup editor soal" onClick={() => setQuizItemEditor(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={saveQuizItem} className="space-y-4">
              <label className="block text-xs font-semibold text-text-heading">
                Pertanyaan
                <textarea
                  autoFocus
                  required
                  maxLength={1000}
                  rows={3}
                  value={quizItemDraft.prompt}
                  onChange={(event) => setQuizItemDraft({ ...quizItemDraft, prompt: event.target.value })}
                  placeholder="Tulis pertanyaan kuis..."
                  className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm font-normal text-slate-800 focus:border-blue focus:outline-none"
                />
              </label>
              <fieldset className="space-y-3">
                <legend className="text-xs font-semibold text-text-heading">Pilihan jawaban</legend>
                {(['A', 'B', 'C', 'D'] as const).map((option) => (
                  <label key={option} className={`flex items-center gap-3 rounded-xl border p-3 ${quizItemDraft.correctOption === option ? 'border-green bg-green-tint/40' : 'border-border'}`}>
                    <input
                      type="radio"
                      name="correctQuizOption"
                      value={option}
                      checked={quizItemDraft.correctOption === option}
                      onChange={() => setQuizItemDraft({ ...quizItemDraft, correctOption: option })}
                      aria-label={`Tandai pilihan ${option} sebagai jawaban benar`}
                      className="h-4 w-4 accent-green"
                    />
                    <span className="w-5 shrink-0 text-xs font-bold text-slate-600">{option}.</span>
                    <input
                      required
                      maxLength={500}
                      value={quizItemDraft.options[option]}
                      onChange={(event) => setQuizItemDraft({
                        ...quizItemDraft,
                        options: { ...quizItemDraft.options, [option]: event.target.value },
                      })}
                      placeholder={`Isi pilihan ${option}`}
                      className="min-w-0 flex-1 bg-transparent text-sm font-normal text-slate-800 focus:outline-none"
                    />
                    {quizItemDraft.correctOption === option && <span className="text-[10px] font-bold text-green">JAWABAN BENAR</span>}
                  </label>
                ))}
              </fieldset>
              <label className="block text-xs font-semibold text-text-heading">
                Penjelasan jawaban (opsional)
                <textarea
                  maxLength={1000}
                  rows={2}
                  value={quizItemDraft.explanation}
                  onChange={(event) => setQuizItemDraft({ ...quizItemDraft, explanation: event.target.value })}
                  placeholder="Jelaskan mengapa pilihan tersebut benar..."
                  className="mt-1.5 w-full rounded-xl border border-border px-3 py-2.5 text-sm font-normal text-slate-800 focus:border-blue focus:outline-none"
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setQuizItemEditor(null)}>Batal</Button>
                <Button type="submit" variant="navy">Simpan Soal</Button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
