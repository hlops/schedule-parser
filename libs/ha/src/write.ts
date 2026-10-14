import { CalendarEventDto } from '@schedule-parser/shared';

const HA_URL = 'http://192.168.31.210:8123';

export const createEvent = async (
  entityId: string,
  event: CalendarEventDto
): Promise<void> => {
  const payload = {
    entity_id: entityId,
    summary: event.summary,
    // HA требует либо пару start_date_time/end_date_time, либо пару start_date/end_date
    // [citation:3][citation:9]
    start_date_time: event.start_date_time,
    end_date_time: event.end_date_time,
    ...(event.location && { location: event.location }),
    ...(event.description && { description: event.description })
  };

  const res = await fetch(`${HA_URL}/api/services/calendar/create_event`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env['HA_TOKEN']}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `HA calendar create failed: ${res.status} ${res.statusText} — ${text}`
    );
  }
};

export const redrawScript = async (): Promise<void> => {
  const payload = {
    'entity_id': 'script.esl_update_display',
    'variables': {
      'user': 'dima'
    }
  };

  const res = await fetch(`${HA_URL}/api/services/script/turn_on`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env['HA_TOKEN']}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(
      `HA esl_update_display failed: ${res.status} ${res.statusText} — ${text}`
    );
  }
};
