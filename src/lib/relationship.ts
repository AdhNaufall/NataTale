// Shared Relationship Start Date and Duration Calculation Logic
export const RELATIONSHIP_START_DATE = new Date('2026-05-23T00:00:00+07:00');

export interface RelationshipDuration {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isStarted: boolean;
}

export function calculateRelationshipDuration(
  startDate: Date = RELATIONSHIP_START_DATE,
  now: Date = new Date()
): RelationshipDuration {
  if (now.getTime() < startDate.getTime()) {
    return {
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isStarted: false,
    };
  }

  // Exact calendar-aware calculation
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();

  if (days < 0) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  let hours = now.getHours() - startDate.getHours();
  if (hours < 0) {
    hours += 24;
  }

  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  return {
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    isStarted: true,
  };
}
