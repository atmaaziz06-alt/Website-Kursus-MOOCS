# EduSpace - Online Learning Platform (LMS) Frontend

A modern, responsive, enterprise-grade online course and bootcamp learning platform (LMS) built with **React 18**, **Vite**, **TypeScript**, **React Router v6**, **Tailwind CSS v3**, **Lucide React**, and **Recharts**.

---

## 🚀 Quick Start & How to Run

### Prerequisites
- Node.js (v18+ or v20+)
- npm or pnpm

### Installation & Development Server
```bash
# 1. Install dependencies
npm install

# 2. Run the Vite development server
npm run dev

# 3. Production build & type validation
npm run build

# 4. Preview production build locally
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Supabase setup

The application targets Supabase project `ctgkckzluxsaiehabmaz`. Copy `.env.example` to `.env.local` and set the project's URL and **anon/public** key:

```powershell
Copy-Item .env.example .env.local
```

Never put `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`, Vercel, or any `VITE_*` variable. If you run the local seed script, put the service-role key only in the ignored `.env.seed.local` file described below; the Vite app does not load that file. Apply migrations in `supabase/migrations/` in filename order using the project's Supabase SQL Editor. SQL Editor execution does not register those files in the Supabase CLI migration history; do not run `supabase db push` against this already-migrated project until that history is reconciled. Configure Email Auth and the deployed site's Site URL/redirect URLs in Supabase before testing sign-up and password recovery.

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as Vercel environment variables and redeploy after configuring them. The SPA route rewrite is in `vercel.json`.

### Current backend implementation status

The core Supabase-backed authentication, course, learning, quiz, and admin flows are implemented. The application is not yet a complete implementation of every PRD item; see the remaining limitations below.

- Supabase Auth is used for registration, login, password recovery, and role/profile lookup. Public registration always creates a participant account; instructor access requires admin approval.
- The public course catalog reads published courses from Supabase. Course enrollment and lesson-progress writes use database RPC functions.
- Instructors can create a course draft. Publishing is intentionally not offered from the initial course form: a course must have a thumbnail and learning materials before it can be submitted for admin review.
- Instructors can edit course details and thumbnails, add/reorder/delete modules, add/rename/reorder/delete lessons, and manage lesson video links (YouTube/Vimeo), video/PDF/image files, and Markdown text. Lesson media is stored in the private `lesson-files` bucket, while learners receive signed URLs; Markdown is sanitized when rendered. Instructors can also create quizzes and questions, and submit courses for review. Quiz questions can be edited or deleted only before any attempt has been submitted for that quiz, preserving historical results.
- Learners can access enrolled course content, save notes/bookmarks and lesson progress, take quizzes, and view server-scored attempt reviews and submitted-attempt history. Student dashboard hours are estimated from completed lesson durations; quiz averages use submitted attempts; weekly activity and category breakdowns use completion timestamps. Saved courses and notifications are stored in Supabase.
- Instructor student rosters, course progress, quiz summaries/submissions, and instructor-to-student messages read/write Supabase data under RLS. Instructor dashboard totals and enrollment charts are derived from that instructor's courses and participant records. Participants can also view their instructor conversations and reply from the student inbox. Admin course review, user management, categories, dashboard totals, review queue, recent-user list, monthly account growth, monthly active learner activity, and one-/two-month participant cohort retention are Supabase-backed. Retention counts a participant as active when they complete a lesson or submit a quiz in the follow-up month.
- `npm run seed` creates/reuses test users and seeds six courses (five published with two modules, four lessons, and five questions each), uploads sample thumbnails/PDFs, and adds representative enrollments, progress, quiz attempts, payments, saved courses, notes, notifications, messages, and reviews. It is repeatable for the fixed demo IDs; rerunning it refreshes demo rows.
- To seed, copy `.env.seed.example` to `.env.seed.local`, then fill in `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SEED_PASSWORD` (minimum 12 characters). The seed script reads that file only; keep it private and never commit or deploy it. `npm run seed -- --dry-run` prints planned counts without connecting to Supabase.
- Migrations `0001`–`0010` must be applied in order before using all instructor course-management features. Migration `0009` adds guarded quiz-question update/delete RPCs; `0010` allows lesson images in the private `lesson-files` bucket and its instructor upload policy. The SQL Editor setup creates categories but no test accounts or sample courses.

---

## 🗺️ Complete Route Directory

### 1. Public & Marketing Pages
| Path | Page Description |
|---|---|
| `/` | **Landing Page**: Hero with metrics, Featured Courses, 3x2 Category Grid, How It Works (4 steps), Navy Stats Band, CTA Banner |
| `/courses` | **Course Catalog**: Search bar, popular tags, sticky sidebar filters (categories, level, price, rating), sorting, active filter chips, 3-column grid & pagination |
| `/courses/:slug` | **Course Detail Page** (e.g. `/courses/web-development-bootcamp-2025`): Gradient hero, sticky purchase card with countdown, tab bar with scroll-spy, curriculum accordions, instructor profile & review breakdown |

### 2. Authentication
| Path | Page Description |
|---|---|
| `/login` | **Member Access Login**: Supabase email/password sign-in, remember me, and error alerts |
| `/register` | **Quick Enrollment**: Supabase sign-up, password validation, and an instructor-access request that requires admin approval |
| `/forgot-password` | **Password Recovery**: Request a password-reset email |
| `/reset-password` | **Set New Password**: Choose a new password from the email recovery link |

### 3. Student Area
| Path | Page Description |
|---|---|
| `/student` | **Student Dashboard**: Enrollment-backed course list and filters, completion-based study hours/streak/category breakdown, submitted-quiz average, notifications, and course-resume actions |
| `/student/courses` | **My Courses**: Enrolled courses directory with filter tabs, progress bars, and resume buttons |
| `/student/quiz-results` | **Quiz Evaluations**: Submitted quiz attempt history and individual server-scored reviews from Supabase |
| `/student/messages` | **Messages**: Conversations with instructors of enrolled courses; participants can reply through Supabase |

### 4. Interactive Learning & Timed Exam Rooms
| Path | Page Description |
|---|---|
| `/learn/:courseSlug/:lessonId` | **Learning Room**: Lesson content and private lesson files are loaded from Supabase; learner notes, bookmarks, and progress are persisted |
| `/quiz/:quizId` | **Timed Exam Environment**: Quiz questions and attempts are loaded from Supabase; answers and review flags are saved, and submission is scored server-side |
| `/quiz/:quizId/result` | **Quiz Evaluation Report**: Displays the persisted attempt score and server-provided question review |

### 5. Instructor Hub
| Path | Page Description |
|---|---|
| `/instructor` | **Instructor Hub**: Instructor-owned courses, enrollment totals/history, published/pending course counts, and quiz averages/submission totals from Supabase |
| `/instructor/courses/new` | **Create Course**: Create a Supabase course draft |
| `/instructor/courses/:id` | **Course Manager**: Edit course details and lesson content, manage modules and lessons, upload files, create and manage quiz questions, and submit the course for review |
| `/instructor/students` | **Student Roster**: Learners enrolled in the instructor's courses, syllabus progress, average quiz score, CSV export, and messaging |
| `/instructor/quiz-results` | **Gradebook Analytics**: Per-quiz submissions, averages, pass rates, learner results, and CSV export |

### 6. Admin Control Center
| Path | Page Description |
|---|---|
| `/admin` | **Admin Control Center**: Supabase-backed platform totals, course-category distribution, review queue, recent users, monthly user registrations, and monthly active learners. Formal cohort-retention analysis is not available. |
| `/admin/users` | **User Management**: Supabase-backed user directory and role/status controls |
| `/admin/categories` | **Category Taxonomy**: Global subject category management |
| `/admin/courses-review` | **Course QA & Accreditation**: Review and approval pipeline for newly submitted bootcamps |

---

## 🖼️ How to Change Images (Centralized Media)

**CRITICAL ARCHITECTURAL CONVENTION**:
All images and media assets across the entire application are strictly centralized in a single file:
👉 [`src/config/media.ts`](file:///D:/Documents/project/EduSpace/src/config/media.ts)

**No bare image URLs or direct image imports exist inside components, data, or pages.**

### 1. Structure of `src/config/media.ts`
The file exports a single typed `media` object structured as follows:
```typescript
export const media: MediaConfig = {
  brand: { logoMark, logoFull, favicon },
  hero: { mainImage, studentPortrait },
  courses: {
    "web-development-bootcamp-2025": { thumbnail, banner, previewPoster },
    "digital-marketing-masterclass": { thumbnail, banner, previewPoster },
    // ... all other course slugs
  },
  people: {
    instructors: { "john-smith": photo, "marcus-vance": photo, ... },
    users: { "dian-paramitha": avatar, "usr-84920": avatar, ... }
  },
  categories: { technology, business, design, development, marketing, "personal-growth", "data-ai" },
  auth: { loginPanel, registerPanel },
  lesson: { videoPoster },
  fallback: { course, avatar, banner }
};
```

### 2. Using Local Images
To use your own local photos instead of placeholder URLs:
1. Place your image files in `/public/media/` (e.g. `/public/media/hero.jpg`, `/public/media/instructor-john.png`).
2. Open `src/config/media.ts`.
3. Update the corresponding string value:
   ```typescript
   // Example:
   hero: {
     mainImage: "/media/hero.jpg", // Changed from Unsplash URL
     studentPortrait: "/media/student.jpg"
   }
   ```

### 3. Using Helper Functions
Components retrieve assets safely via typed helpers that fall back gracefully if an asset is missing:
- `getCourseMedia(slug)`: Returns `{ thumbnail, banner, previewPoster }` or fallback course banner.
- `getInstructorPhoto(instructorId)`: Returns instructor photo or fallback avatar.
- `getUserAvatar(userId)`: Returns user profile photo or fallback avatar.
- Avatars without an image automatically render a colored circle with the user's initials.

---

## 🎨 Design Tokens & UI System

Configured strictly in `tailwind.config.js`:
- **Navy**: `#0B1F8F` (hover `#081670`) - Sidebar, footer, top contact bar, primary buttons
- **Blue**: `#2F4BDB` - Active states, selected answers, progress indicators, links
- **Orange**: `#E08A00` (hover `#C97A00`) - Primary CTAs (Enroll Now, Publish Changes, Finalize Exam)
- **Green**: `#16A34A` - Completed, correct answers, passed status
- **Red**: `#DC2626` - Incorrect answers, errors, warnings
- **App Background**: `#EFF1FD` (Lavender-tinted surface)
- **Card**: `#FFFFFF` with `rounded-2xl` and 1px `#E5E8F5` borders
- **Typography**: Google Font **Plus Jakarta Sans** with extrabold hero headers and clear overlines
