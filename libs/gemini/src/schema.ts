export const RESPONSE_SCHEMA: Record<string, unknown> = {
    type: 'object',
    properties: {
        date: { type: 'string' },
        classes: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    grade: { type: 'string' },
                    events: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                summary:         { type: 'string' },
                                start_date_time: { type: 'string' },
                                end_date_time:   { type: 'string' },
                                location:        { type: 'string' },
                                description:     { type: 'string' },
                            },
                            required: ['summary', 'start_date_time', 'end_date_time'],
                        },
                    },
                },
                required: ['grade', 'events'],
            },
        },
    },
    required: ['date', 'classes'],
};