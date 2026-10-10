import { type Static, type TObject, type TUnion, Type } from '@sinclair/typebox';
import { CalendarJobDtoSchema, CheckJobDtoSchema, ParseJobDtoSchema, ScheduleJobDtoSchema } from './generated';


// Вспомогательная функция для создания OneOf с дискриминатором
function OneOf<T extends TObject[]>(
  variants: [...T],
  discriminator: string
) {
  return Type.Unsafe<Static<TUnion<T>>>({
    type: 'object',
    discriminator: { propertyName: discriminator },
    required: [discriminator],
    oneOf: variants
  });
}

// Обертка для замены поля в схеме
function withLiteral<T extends TObject>(
  schema: T,
  propertyName: string,
  value: string
): TObject {
  return Type.Object({
    ...schema.properties,
    [propertyName]: Type.Literal(value)
  }, {
    ...schema,
    properties: {
      ...schema.properties,
      [propertyName]: Type.Literal(value)
    }
  });
}

export const AnyJobDtoSchema = OneOf(
  [
    withLiteral(CheckJobDtoSchema, 'type', 'check'),
    withLiteral(ParseJobDtoSchema, 'type', 'parse'),
    withLiteral(ScheduleJobDtoSchema, 'type', 'schedule'),
    withLiteral(CalendarJobDtoSchema, 'type', 'calendar')
  ],
  'type'
);
