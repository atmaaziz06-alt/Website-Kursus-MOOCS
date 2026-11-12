import { describe, expect, it } from 'vitest';
import { calculateAverageScore, calculateRetentionRate, getCurrentStreak } from './dashboardMetrics';

describe('getCurrentStreak', () => {
  const today = new Date('2026-11-12T12:00:00.000Z');

  it('counts consecutive completion days including today', () => {
    expect(getCurrentStreak([
      '2026-11-12T08:00:00.000Z',
      '2026-11-11T08:00:00.000Z',
      '2026-11-10T08:00:00.000Z',
    ], today)).toBe(3);
  });

  it('keeps a streak alive when the latest activity was yesterday', () => {
    expect(getCurrentStreak([
      '2026-11-11T08:00:00.000Z',
      '2026-11-10T08:00:00.000Z',
    ], today)).toBe(2);
  });

  it('stops at a missing day and ignores stale activity', () => {
    expect(getCurrentStreak([
      '2026-11-12T08:00:00.000Z',
      '2026-11-10T08:00:00.000Z',
    ], today)).toBe(1);
    expect(getCurrentStreak(['2026-11-08T08:00:00.000Z'], today)).toBe(0);
    expect(getCurrentStreak([], today)).toBe(0);
  });
});

describe('calculateAverageScore', () => {
  it('returns a one-decimal average for submitted quiz scores', () => {
    expect(calculateAverageScore([80, 90, 93])).toBe(87.7);
  });

  it('returns null when the learner has no submitted quiz attempts', () => {
    expect(calculateAverageScore([])).toBeNull();
  });
});

describe('calculateRetentionRate', () => {
  it('calculates the share of a signup cohort active in the following month', () => {
    expect(calculateRetentionRate(['a', 'b', 'c', 'd'], new Set(['a', 'c']))).toBe(50);
  });

  it('returns null when the cohort month is not yet available', () => {
    expect(calculateRetentionRate([], new Set(['a']))).toBeNull();
  });
});
