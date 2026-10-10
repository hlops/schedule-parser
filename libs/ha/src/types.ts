// Ответ от HA: поля start и end — это объекты
interface HaCalendarEvent {
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  description?: string;
}

// Обёртка ответа: ключ — entity_id календаря
export type HaCalendarResponse = Record<string, HaCalendarEvent[]>;
