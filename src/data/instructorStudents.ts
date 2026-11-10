export interface InstructorStudent {
  id: string;
  name: string;
  avatarId: string;
  email: string;
  track: string;
  progress: number;
  score: number;
  status: 'Active' | 'Completed' | 'At Risk';
}

export const instructorStudents: InstructorStudent[] = [
  { id: 'USR-84920', name: 'Dian Paramitha', avatarId: 'dian-paramitha', email: 'dian.paramitha@eduspace.ac.id', track: 'Web Development Bootcamp 2025', progress: 85, score: 92.4, status: 'Active' },
  { id: 'USR-84921', name: 'Ahmad Fauzi', avatarId: 'ahmad-fauzi', email: 'ahmad.fauzi@eduspace.ac.id', track: 'Web Development Bootcamp 2025', progress: 65, score: 88.0, status: 'Active' },
  { id: 'USR-84922', name: 'Budi Santoso', avatarId: 'budi-santoso', email: 'budi.santoso@eduspace.ac.id', track: 'Web Development Bootcamp 2025', progress: 100, score: 95.0, status: 'Completed' },
  { id: 'USR-84923', name: 'Rian Hidayat', avatarId: 'rian-hidayat', email: 'rian.hidayat@eduspace.ac.id', track: 'Web Development Bootcamp 2025', progress: 55, score: 82.5, status: 'Active' },
  { id: 'USR-84924', name: 'Sarah Jenkins', avatarId: 'usr-84920', email: 'sarah.jenkins@eduspace.ac.id', track: 'Web Development Bootcamp 2025', progress: 40, score: 78.5, status: 'At Risk' },
];
