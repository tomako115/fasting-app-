import type { TemplateKey } from './templates';

export interface ScheduledMessage {
  key: TemplateKey;
  title: string;
  emoji: string;
  scheduledDate: string; // YYYY-MM-DD
  dayLabel: string;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function buildSchedule(fastingStartDate: string, plan: number): ScheduledMessage[] {
  const s = fastingStartDate;
  const schedules: ScheduledMessage[] = [
    { key: 'prep_notice',     title: '準備食スタート前日案内',   emoji: '🌿', scheduledDate: addDays(s, -2), dayLabel: '準備食1日目' },
    { key: 'prep_menu',       title: '準備食献立（2日分）',       emoji: '🍽️', scheduledDate: addDays(s, -2), dayLabel: '準備食1日目' },
    { key: 'day_before_night',title: '前日夜・最終確認',          emoji: '🌙', scheduledDate: addDays(s, -1), dayLabel: '前日夜' },
    { key: 'fast_day1',       title: '本番1日目',                 emoji: '🎉', scheduledDate: addDays(s,  0), dayLabel: 'ファスティング1日目' },
    { key: 'fast_day2',       title: '本番2日目',                 emoji: '🔥', scheduledDate: addDays(s,  1), dayLabel: 'ファスティング2日目' },
    { key: 'fast_day3plus',   title: '本番3日目以降',             emoji: '💪', scheduledDate: addDays(s,  2), dayLabel: 'ファスティング3日目' },
  ];

  const recoveryStart = plan === 5 ? addDays(s, 5) : addDays(s, 3);

  schedules.push(
    { key: 'recovery_start', title: '回復食スタート案内',       emoji: '🌸', scheduledDate: recoveryStart,          dayLabel: '回復食1日目' },
    { key: 'recovery_day2',  title: '回復食2日目（腸内細菌）', emoji: '🦠', scheduledDate: addDays(recoveryStart, 1), dayLabel: '回復食2日目' },
    { key: 'recovery_done',  title: '回復食完了・振り返り',     emoji: '🥹', scheduledDate: addDays(recoveryStart, 3), dayLabel: '回復食完了' },
    { key: 'next_plan',      title: '次回プラン提案',           emoji: '🌟', scheduledDate: addDays(recoveryStart, 4), dayLabel: '次回提案' },
  );

  return schedules;
}

export function getTodayMessages(fastingStartDate: string, plan: number, today: string): ScheduledMessage[] {
  return buildSchedule(fastingStartDate, plan).filter((m) => m.scheduledDate === today);
}
