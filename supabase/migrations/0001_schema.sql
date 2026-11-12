create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type public.user_role as enum ('participant', 'instructor', 'admin');
create type public.course_status as enum ('draft', 'pending_review', 'published', 'archived');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'participant',
  instructor_requested boolean not null default false,
  avatar_path text,
  preferences jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text not null default '',
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles (id),
  category_id uuid references public.categories (id),
  title text not null check (length(trim(title)) between 1 and 160),
  slug text not null unique,
  subtitle text not null default '',
  description text not null default '',
  level text not null default 'Beginner'
    check (level in ('Beginner', 'Intermediate', 'Advanced', 'All Levels')),
  language text not null default 'id',
  learning_outcomes text[] not null default '{}',
  requirements text[] not null default '{}',
  thumbnail_path text,
  banner_path text,
  price numeric(12, 2) not null default 0 check (price >= 0),
  original_price numeric(12, 2) not null default 0
    check (original_price >= price),
  max_participants integer check (max_participants is null or max_participants > 0),
  status public.course_status not null default 'draft',
  admin_locked boolean not null default false,
  review_note text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  position integer not null check (position >= 0),
  created_at timestamptz not null default now(),
  unique (course_id, position) deferrable initially immediate,
  unique (id, course_id)
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null,
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null check (length(trim(title)) > 0),
  type text not null check (type in ('video', 'pdf', 'lab', 'text')),
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  is_preview boolean not null default false,
  position integer not null check (position >= 0),
  created_at timestamptz not null default now(),
  foreign key (module_id, course_id) references public.modules (id, course_id) on delete cascade,
  unique (module_id, position) deferrable initially immediate,
  unique (id, course_id)
);

create table public.lesson_contents (
  lesson_id uuid primary key references public.lessons (id) on delete cascade,
  content text,
  video_url text,
  file_path text,
  updated_at timestamptz not null default now()
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  last_lesson_id uuid references public.lessons (id) on delete set null,
  last_accessed_at timestamptz not null default now(),
  unique (course_id, student_id),
  unique (id, course_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null,
  course_id uuid not null references public.courses (id) on delete cascade,
  completed_at timestamptz not null default now(),
  foreign key (lesson_id, course_id) references public.lessons (id, course_id) on delete cascade,
  unique (student_id, lesson_id)
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null unique references public.enrollments (id) on delete cascade,
  amount numeric(12, 2) not null check (amount >= 0),
  method text not null default 'simulasi',
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'rejected')),
  paid_at timestamptz
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  module_id uuid references public.modules (id) on delete set null,
  title text not null check (length(trim(title)) > 0),
  time_limit_minutes integer not null default 20 check (time_limit_minutes > 0),
  passing_score numeric(5, 2) not null default 80 check (passing_score between 0 and 100),
  max_attempts integer not null default 3 check (max_attempts >= 1),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  topic text not null default '',
  text text not null check (length(trim(text)) > 0),
  code_snippet jsonb,
  position integer not null check (position >= 0),
  points numeric(8, 2) not null default 10 check (points > 0),
  unique (quiz_id, position),
  unique (id, quiz_id)
);

create table public.question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.questions (id) on delete cascade,
  label text not null check (label in ('A', 'B', 'C', 'D')),
  text text not null check (length(trim(text)) > 0),
  unique (question_id, label),
  unique (id, question_id)
);

create table public.question_keys (
  question_id uuid primary key references public.questions (id) on delete cascade,
  correct_option_id uuid not null,
  explanation text not null default '',
  foreign key (correct_option_id, question_id)
    references public.question_options (id, question_id) deferrable initially deferred
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  attempt_no integer not null check (attempt_no > 0),
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted')),
  score numeric(5, 2) check (score between 0 and 100),
  passed boolean,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  time_taken_seconds integer check (time_taken_seconds is null or time_taken_seconds >= 0),
  unique (quiz_id, student_id, attempt_no)
);

create table public.attempt_answers (
  attempt_id uuid not null references public.quiz_attempts (id) on delete cascade,
  question_id uuid not null references public.questions (id) on delete cascade,
  selected_option_id uuid,
  is_correct boolean,
  flagged boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (attempt_id, question_id),
  foreign key (selected_option_id, question_id)
    references public.question_options (id, question_id)
);

create table public.saved_courses (
  student_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (student_id, course_id)
);

create table public.lesson_notes (
  student_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  note text not null default '',
  is_bookmarked boolean not null default false,
  sandbox_code text not null default '',
  updated_at timestamptz not null default now(),
  primary key (student_id, lesson_id)
);

create table public.lesson_questions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  question text not null check (length(trim(question)) > 0),
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null default 'general',
  title text not null,
  body text not null default '',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (length(trim(body)) > 0),
  sent_at timestamptz not null default now()
);

create table public.course_reviews (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  student_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  created_at timestamptz not null default now(),
  unique (course_id, student_id)
);

create index courses_status_category_idx on public.courses (status, category_id);
create index courses_title_trgm_idx on public.courses using gin (title gin_trgm_ops);
create index enrollments_student_idx on public.enrollments (student_id);
create index lesson_progress_student_course_idx on public.lesson_progress (student_id, course_id);
create index quiz_attempts_student_quiz_idx on public.quiz_attempts (student_id, quiz_id);
create index messages_recipient_sent_idx on public.messages (recipient_id, sent_at desc);
create index notifications_user_created_idx on public.notifications (user_id, created_at desc);
