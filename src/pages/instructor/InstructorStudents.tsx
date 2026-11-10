import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { Card, Button, ProgressBar, Avatar, Badge } from '../../components/ui';
import { getUserAvatar } from '../../config/media';
import { instructorStudents } from '../../data/instructorStudents';

export const InstructorStudents: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const filteredStudents = instructorStudents.filter((student) => {
    const query = search.trim().toLowerCase();
    return !query || [student.name, student.email, student.id].some((value) => value.toLowerCase().includes(query));
  });

  return (
    <div className="max-w-[1200px] mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-text-heading">Students Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Manage and mentor learners enrolled in your active bootcamps</p>
        </div>
        <Button variant="outline" size="sm" leftIcon={<Download className="w-3.5 h-3.5" />}>
          Export Student List (.CSV)
        </Button>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name, email, or ID..."
            className="w-full max-w-sm bg-slate-50 border border-border rounded-xl text-xs px-3.5 py-2.5 focus:outline-none focus:border-blue"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3">STUDENT</th>
                <th className="pb-3">ENROLLED TRACK</th>
                <th className="pb-3 w-36">SYLLABUS PROGRESS</th>
                <th className="pb-3">QUIZ AVG</th>
                <th className="pb-3">STATUS</th>
                <th className="pb-3">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <Avatar src={getUserAvatar(st.avatarId)} name={st.name} size="xs" />
                      <div>
                        <span className="font-bold text-text-heading block">{st.name}</span>
                        <span className="text-[10px] text-slate-400">{st.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 text-slate-600 font-medium">{st.track}</td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-2">
                      <ProgressBar progress={st.progress} color={st.progress === 100 ? 'green' : 'blue'} size="xs" />
                      <span className="font-bold text-slate-700 w-8">{st.progress}%</span>
                    </div>
                  </td>
                  <td className="py-3.5 font-bold text-navy">{st.score}%</td>
                  <td className="py-3.5">
                    <Badge variant={st.status === 'Completed' ? 'active' : st.status === 'At Risk' ? 'in-review' : 'preview-free'} size="xs">
                      {st.status}
                    </Badge>
                  </td>
                  <td className="py-3.5">
                    <button
                      type="button"
                      onClick={() => navigate(`/instructor/messages/${st.id}`)}
                      className="text-blue hover:text-navy font-bold"
                      aria-label={`Message ${st.name}`}
                    >
                      Message
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">No students match your search.</p>
          )}
        </div>
      </Card>
    </div>
  );
};
