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

---

## 🗺️ Complete Route Directory

### 1. Public & Marketing Pages
| Path | Page Description |
|---|---|
| `/` | **Landing Page**: Hero with metrics, Featured Courses, 3x2 Category Grid, How It Works (4 steps), Navy Stats Band, CTA Banner |
| `/courses` | **Course Catalog**: Search bar, popular tags, sticky sidebar filters (categories, level, price, rating), sorting, active filter chips, 3-column grid & pagination |
| `/courses/:slug` | **Course Detail Page** (e.g. `/courses/web-development-bootcamp-2025`): Gradient hero, sticky purchase card with countdown, tab bar with scroll-spy, curriculum accordions, instructor profile & review breakdown |

### 2. Authentication & Role Switcher
| Path | Page Description |
|---|---|
| `/login` | **Member Access Login**: Email/password with visibility toggle, remember me, error alerts, social buttons, and **⚡ Dev Role Switcher** (`participant`, `instructor`, `admin`) |
| `/register` | **Quick Enrollment**: Role selection ("Participant" vs "Instructor"), real-time password strength meter, password match validation, terms agreement |

### 3. Student Area
| Path | Page Description |
|---|---|
| `/student` | **Student Dashboard**: Welcome banner with 14-day streak, 4 stat cards, enrolled courses tabs (All/In Progress/Completed), deadlines, alerts, Recharts weekly study donut chart, and dev empty state toggle |
| `/student/courses` | **My Courses**: Enrolled courses directory with filter tabs, progress bars, and resume buttons |
| `/student/quiz-results` | **Quiz Evaluations**: Complete history of module quiz scores, grades, and review links |

### 4. Interactive Learning & Timed Exam Rooms
| Path | Page Description |
|---|---|
| `/learn/:courseSlug/:lessonId` | **Distraction-Free Learning Room**: Custom video player controls, synchronized code stream indicator, interactive notes/sandbox tabs, action bar, downloadable assets, collapsible section syllabus |
| `/quiz/:quizId` | **Timed Exam Environment**: Real countdown timer from 20:00, 10-question matrix navigator with flag-for-review, code snippet samples, auto-save notice, confirmation modal |
| `/quiz/:quizId/result` | **Quiz Evaluation Report**: Circular 80/100 score, criteria pass badge, question-by-question review with instructor notes, expandable questions 5-10 |

### 5. Instructor Hub
| Path | Page Description |
|---|---|
| `/instructor` | **Instructor Hub**: Total metrics, Recharts area chart for student enrollments with 30D/6M/YTD toggle, cohort attention queue |
| `/instructor/courses/:id` | **Course Manager**: Basic info editor with rich text formatting toolbar, drag-and-drop module reordering, student roster table with search/filters, module quizzes manager |
| `/instructor/students` | **Student Roster**: Directory of learners with syllabus progress and direct messaging actions |
| `/instructor/quiz-results` | **Gradebook Analytics**: Cohort pass rates and submission stats |

### 6. Admin Control Center
| Path | Page Description |
|---|---|
| `/admin` | **Admin Control Center**: Multi-line growth chart (Students & Instructors), category donut distribution, courses awaiting review table, live user registration feed |
| `/admin/users` | **User & Category Management (Indonesian copy)**: "Kelola Pengguna & Kategori", filterable user table by role/status, category taxonomy manager |
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
