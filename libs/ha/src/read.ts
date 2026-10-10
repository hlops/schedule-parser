import { CalendarEventDto } from '@schedule-parser/shared';
import { HaCalendarResponse } from './types';

async function getEventsForDate(
  haUrl: string,
  haToken: string,
  entityId: string,
  date: string
): Promise<CalendarEventDto[]> {
  // Границы дня: от 00:00 до 23:59:59
  const start = `${date}T00:00:00`;
  const end = `${date}T23:59:59`;

  const url = new URL(`${haUrl}/api/calendars/${entityId}`);
  url.searchParams.set('start', start);
  url.searchParams.set('end', end);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${haToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`HA calendar read failed: ${res.status} ${res.statusText}`);
  }

  const data: HaCalendarResponse = await res.json();
  const events = data[entityId] ?? [];

  // Преобразуем формат HA → наш CalendarEventDto
  return events.map((e) => ({
    summary: e.summary,
    // HA отдаёт "2026-09-29T08:30:00+07:00" — убираем таймзону
    start_date_time: (e.start.dateTime ?? e.start.date ?? '').slice(0, 19),
    end_date_time: (e.end.dateTime ?? e.end.date ?? '').slice(0, 19),
    location: e.location,
    description: e.description
  }));
}
