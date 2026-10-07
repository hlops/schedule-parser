import { Type } from "@sinclair/typebox";

export const ScheduleEventSchema = Type.Object({
  summary: Type.String(),
  start_date_time: Type.String(),
  end_date_time: Type.String(),
  location: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
});

export const ClassScheduleSchema = Type.Object({
  grade: Type.String(),
  events: Type.Array(ScheduleEventSchema),
});

export const ParsedScheduleSchema = Type.Object({
  date: Type.String(),
  classes: Type.Array(ClassScheduleSchema),
});
