import { JobDto } from './generic';

/**
 * Событие в расписании — один урок.
 */
export interface CalendarEventDto {
  /**
   * Название предмета.
   * @example "Математика"
   */
  summary: string;

  /**
   * Время начала в формате ISO 8601 без таймзоны.
   * @example "2026-09-29T08:30:00"
   */
  start_date_time: string;

  /**
   * Время окончания в формате ISO 8601 без таймзоны.
   * @example "2026-09-29T09:10:00"
   */
  end_date_time: string;

  /**
   * Кабинет. Если урок разбит на подгруппы — номера кабинетов через слэш.
   * @example "114/115"
   */
  location?: string;

  /**
   * Произвольное описание урока.
   * @example "Урок: Математика"
   */
  description?: string;
}

/**
 * Расписание одного класса на день.
 */
export interface ClassScheduleDto {
  /**
   * Название класса.
   * @example "5А"
   */
  grade: string;

  /**
   * Список уроков этого класса, отсортированный по времени начала.
   */
  events: CalendarEventDto[];
}

/**
 * Расписание на один день по всем классам.
 */
export interface ParsedScheduleDto {
  /**
   * Дата расписания в формате YYYY-MM-DD.
   * @example "2026-09-29"
   */
  date: string;

  /**
   * Список классов с их уроками.
   */
  classes: ClassScheduleDto[];
}

export interface ScheduleJobDto extends JobDto {
  date: number;
  classes: ClassScheduleDto[];
}
