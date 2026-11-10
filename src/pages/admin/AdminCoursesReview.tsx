import React from 'react';
import { FileCheck2, Check, X, Eye, Download } from 'lucide-react';
import { Card, Button, Badge, Avatar } from '../../components/ui';
import { getCourseMedia, getInstructorPhoto } from '../../config/media';

export const AdminCoursesReview: React.FC = () => {
  const reviews = [
    {
      id: 'rev-1',
      title: 'Full-Stack Next.js 15 & AI Agents',
      slug: 'full-stack-nextjs-ai',
      instructor: 'John Smith',
      instructorId: 'john-smith',
      category: 'Development',
      submittedDate: '10 May 2025',
      lessonsCount: 36,
      duration: '18.5 hrs',
      status: 'Pending QA',
    },
    {
      id: 'rev-2',
      title: 'Deep Learning with PyTorch: From Tensors to LLMs',
      slug: 'deep-learning-pytorch',
      instructor: 'Dr. Siti Nurhaliza M.Cs.',
      instructorId: 'dr-siti',
      category: 'Technology',
      submittedDate: '08 May 2025',
      lessonsCount: 30,
      duration: '28.0 hrs',
      status: 'Pending QA',
    },
    {
      id: 'rev-3',
      title: 'Figma Design System Architecture: Variables & Tokens',
      slug: 'figma-design-system',
      instructor: 'Sarah Jenkins',
      instructorId: 'sarah-jenkins',
      category: 'Design',
      submittedDate: '05 May 2025',
      lessonsCount: 24,
      duration: '16.0 hrs',
      status: 'In Review',
    },
    {
      id: 'rev-4',
      title: 'Cloud DevOps with Kubernetes: GitOps Workflows',
      slug: 'cloud-devops-kubernetes',
      instructor: 'Marcus Vance',
      instructorId: 'marcus-vance',
      category: 'Technology',
      submittedDate: '02 May 2025',
      lessonsCount: 29,
      duration: '24.0 hrs',
      status: 'In Review',
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-heading">Courses Awaiting QA & Accreditation</h1>
          <p className="text-xs text-slate-500 mt-1">Review syllabus compliance, video assets, and interactive quizzes before publishing</p>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => {
          const cMedia = getCourseMedia(r.slug);
          const instPhoto = getInstructorPhoto(r.instructorId);

          return (
            <Card key={r.id} className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                  <img src={cMedia.thumbnail} alt={r.title} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant="in-review" size="xs">{r.status}</Badge>
                    <span className="text-xs text-slate-400">Submitted {r.submittedDate}</span>
                  </div>
                  <h3 className="text-base font-bold text-text-heading mb-1">{r.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Avatar src={instPhoto} name={r.instructor} size="xs" />
                      <span>{r.instructor}</span>
                    </div>
                    <span>•</span>
                    <span>{r.lessonsCount} Lessons</span>
                    <span>•</span>
                    <span>{r.duration}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 self-end lg:self-center">
                <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                  Inspect Syllabus
                </Button>
                <Button variant="orange" size="sm" leftIcon={<Check className="w-3.5 h-3.5" />}>
                  Approve & Publish
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

