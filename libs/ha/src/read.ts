import { CalendarEventDto } from '@schedule-parser/shared';
import dayjs from 'dayjs';
import { HaCalendarEvent } from './types';

const HA_URL = "http://192.168.31.210:8123";

export async function getEventsForDate(
  entityId: string,
  date: number
): Promise<CalendarEventDto[]> {
  // Границы дня: от 00:00 до 23:59:59
  const start = dayjs(date).startOf('day').toISOString();
  const end = dayjs(date).endOf('day').toISOString();

  const url = new URL(`${HA_URL}/api/calendars/${entityId}`);
  url.searchParams.set('start', start);
  url.searchParams.set('end', end);

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${process.env['HA_TOKEN']}`,
      'Content-Type': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`HA calendar read failed: ${res.status} ${res.statusText}`);
  }

  const events: HaCalendarEvent[] = await res.json();
  console.log(entityId)

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
