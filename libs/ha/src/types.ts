// Ответ от HA: поля start и end — это объекты
export interface HaCalendarEvent {
  summary: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
  description?: string;
}
