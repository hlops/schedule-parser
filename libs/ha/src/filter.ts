import type { CalendarEventDto } from '@schedule-parser/shared';

/**
 * Приводит дату-время к формату "YYYY-MM-DDTHH:MM:SS" без таймзоны.
 * Отрезает всё после секунд, чтобы "T08:30:00+07:00" и "T08:30:00" совпали.
 */
function toComparableTimestamp(value: string): number {
  return new Date(value).getMilliseconds();
}

/**
 * Ключ события для сравнения.
 * Нормализуем время: убираем возможные секунды и таймзону, приводим к одному формату.
 */
function makeEventKey(event: CalendarEventDto): string {
  return [
    event.summary.trim(),
    toComparableTimestamp(event.start_date_time),
    toComparableTimestamp(event.end_date_time)
  ].join('|');
}

/**
 * Убирает из списка событий те, что уже существуют в календаре.
 * Сравнение по summary + start_date_time + end_date_time.
 */
export const excludeExistingEvents = (
  toCreate: CalendarEventDto[],
  existing: CalendarEventDto[]
): CalendarEventDto[] => {
  // Строим Set ключей существующих событий для O(1) поиска
  const existingKeys = new Set(
    existing.map((e) => makeEventKey(e))
  );

  return toCreate.filter((e) => !existingKeys.has(makeEventKey(e)));
};
