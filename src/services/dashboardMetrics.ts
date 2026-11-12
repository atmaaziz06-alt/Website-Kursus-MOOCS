export const getCurrentStreak = (dates: string[], now = new Date()): number => {
  const completedDays = [...new Set(dates.map((value) => value.slice(0, 10)))].sort().reverse();
  if (!completedDays.length) return 0;

  const today = new Date(now);
  today.setUTCHours(0, 0, 0, 0);
  const todayKey = today.toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setUTCDate(yesterday.getUTCDate() - 1);
  const yesterdayKey = yesterday.toISOString().slice(0, 10);
  if (completedDays[0] !== todayKey && completedDays[0] !== yesterdayKey) return 0;

  let streak = 0;
  const expected = new Date(`${completedDays[0]}T00:00:00.000Z`);
  for (const day of completedDays) {
    if (day !== expected.toISOString().slice(0, 10)) break;
    streak += 1;
    expected.setUTCDate(expected.getUTCDate() - 1);
  }
  return streak;
};

export const calculateAverageScore = (scores: number[]): number | null => {
  if (!scores.length) return null;
  const average = scores.reduce((total, score) => total + score, 0) / scores.length;
  return Math.round(average * 10) / 10;
};

export const calculateRetentionRate = (cohortUserIds: string[], activeUserIds: Set<string>): number | null => {
  if (!cohortUserIds.length) return null;
  const retainedUsers = cohortUserIds.filter((userId) => activeUserIds.has(userId)).length;
  return Math.round((retainedUsers / cohortUserIds.length) * 1000) / 10;
};
