const categoryLabels: Record<string, string> = {
  Technology: 'Teknologi',
  Business: 'Bisnis',
  Design: 'Desain',
  Development: 'Pemrograman',
  Marketing: 'Pemasaran',
  'Personal Growth': 'Pengembangan Diri',
  'Data & AI': 'Data & AI',
};

const levelLabels: Record<string, string> = {
  Beginner: 'Pemula',
  Intermediate: 'Menengah',
  Advanced: 'Lanjutan',
  'All Levels': 'Semua Tingkat',
};

export const translateCategory = (category: string): string =>
  categoryLabels[category] || category;

export const translateLevel = (level: string): string =>
  levelLabels[level] || level;
