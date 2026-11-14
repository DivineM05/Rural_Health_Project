import { CheckupSchedule } from '@/lib/profile';

function addInterval(date: Date, schedule: CheckupSchedule, repetitions: number): Date {
  const result = new Date(date);
  const amount = schedule.interval * repetitions;
  if (schedule.unit === 'days') result.setDate(result.getDate() + amount);
  if (schedule.unit === 'weeks') result.setDate(result.getDate() + amount * 7);
  if (schedule.unit === 'months') result.setMonth(result.getMonth() + amount);
  if (schedule.unit === 'years') result.setFullYear(result.getFullYear() + amount);
  return result;
}

export function nextCheckupDate(schedule: CheckupSchedule, today = new Date()): Date {
  const [year, month, day] = schedule.startDate.split('-').map(Number);
  const startDate = new Date(year, month - 1, day);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  let repetitions = 0;
  let candidate = startDate;
  while (candidate < startOfToday) {
    repetitions += 1;
    candidate = addInterval(startDate, schedule, repetitions);
  }
  return candidate;
}

export function describeSchedule(schedule: CheckupSchedule): string {
  const unit = schedule.interval === 1 ? schedule.unit.slice(0, -1) : schedule.unit;
  const every = schedule.interval === 1 ? `every ${unit}` : `every ${schedule.interval} ${unit}`;
  return every;
}
