import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'FIT3162 CS-06 API',
      version: '1.0.0',
      description: 'API documentation for the backend service.',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT ?? 5000}`,
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', example: 'Alice' },
            email: {
              type: 'string',
              format: 'email',
              example: 'alice@example.com',
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'StrongPass123',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            user_id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            name: { type: 'string', example: 'Alice' },
            email: { type: 'string', example: 'alice@example.com' },
            profile_pic_url: { type: 'string', nullable: true, example: null },
            wants_email_reminders: { type: 'boolean', example: false },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'alice@example.com',
            },
            password: { type: 'string', example: 'StrongPass123' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Internal server error' },
          },
        },
        CreateClubRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Running Club' },
            description: {
              type: 'string',
              example: 'Running Club description',
            },
            shared_drive_link: {
              type: 'string',
              example: 'https://drive.google.com/running',
            },
          },
        },
        ClubResponse: {
          type: 'object',
          properties: {
            club_id: {
              type: 'string',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            name: { type: 'string', example: 'Running Club' },
            description: {
              type: 'string',
              example: 'Running Club description',
            },
            shared_drive_link: {
              type: 'string',
              example: 'https://drive.google.com/running',
            },
            club_color: { type: 'string', example: '#FF5733' },
          },
        },
        ClubWithStats: {
          type: 'object',
          properties: {
            club_id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            name: { type: 'string', example: 'Running Club' },
            description: {
              type: 'string',
              nullable: true,
              example: 'Running Club description',
            },
            shared_drive_link: {
              type: 'string',
              nullable: true,
              example: 'https://drive.google.com/running',
            },
            club_color: {
            type: 'string',
            nullable: true,
            example: '#FF5733',
            },
            member_count: {
              type: 'number',
              example: 10,
            },
            ongoing_event_count: {
              type: 'number',
              example: 2,
            },
          },
        },
        CreateEventRequest: {
          type: 'object',
          required: ['club_id', 'title'],
          properties: {
            club_id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            title: { type: 'string', example: 'Morning Run' },
            description: {
              type: 'string',
              example: 'Join us for a refreshing morning run!',
              nullable: true,
            },
            type: {
              type: 'string',
              example: 'In-Person',
              nullable: true,
            },
            date: {
              type: 'string',
              format: 'date-time',
              example: '2026-10-15T07:00:00Z',
              nullable: true,
            },
            end_date: {
              type: 'string',
              format: 'date-time',
              example: '2026-10-16T07:00:00Z',
              nullable: true,
            },
            location: {
              type: 'string',
              example: 'Monash Oval',
              nullable: true,
            },
            banner_url: {
              type: 'string',
              example: 'https://example.com/event-banner.jpg',
              nullable: true,
            },
            budget: {
              type: 'number',
              example: 100,
              nullable: true,
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
              example: 'draft',
              nullable: true,
            }
          },
        },
        UpdateEventRequest: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Morning Run' },
            description: {
              type: 'string',
              example: 'Join us for a refreshing morning run!',
            },
            type: {
              type: 'string',
              example: 'In-Person',
            },
            date: {
              type: 'string',
              format: 'date-time',
              example: '2026-10-15T07:00:00Z',
            },
            end_date: {
              type: 'string',
              format: 'date-time',
              example: '2026-10-16T07:00:00Z',
            },
            location: {
              type: 'string',
              example: 'Monash Oval',
            },
            banner_url: {
              type: 'string',
              example: 'https://example.com/event-banner.jpg',
            },
            budget: {
              type: 'number',
              example: 100,
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
              example: 'draft',
            }
          },
        },
        EventResponse: {
          type: 'object',
          properties: {
            event_id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            club_id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            title: { type: 'string', example: 'Morning Run' },
            description: {
              type: 'string',
              example: 'Join us for a refreshing morning run!',
              nullable: true,
            },
            type: {
              type: 'string',
              example: 'In-Person',
              nullable: true,
            },
            date: {
              type: 'string',
              format: 'date-time',
              example: '2026-10-15T07:00:00Z',
              nullable: true,
            },
            end_date: {
              type: 'string',
              format: 'date-time',
              example: '2026-10-16T07:00:00Z',
              nullable: true,
            },
            location: {
              type: 'string',
              example: 'Monash Oval',
              nullable: true,
            },
            banner_url: {
              type: 'string',
              example: 'https://example.com/event-banner.jpg',
              nullable: true,
            },
            budget: {
              type: 'number',
              example: 100,
              nullable: true,
            },
            status: {
              type: 'string',
              enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
              example: 'draft',
            },
            money_used: {
              type: 'number',
              example: 50,
              nullable: true,
            },
            created_by: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-10-01T12:00:00Z',
            }
          },
        },
        EventWithClubName: {
          allOf: [
            { $ref: '#/components/schemas/EventResponse' },
            {
              type: 'object',
              properties: {
                club_name: { type: 'string', example: 'Running Club' },
                attendee_count: { type: 'number', example: 20 },
              },
            },
          ],
        },
        CreateTaskRequest: {
          type: 'object',
          required: ['title'],
          properties: {
            title: { type: 'string', example: 'Book venue for event' },
            parent_task_id: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              example: null,
            },
            due_date: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: '2026-10-10T17:00:00Z',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              nullable: true,
              example: 'medium',
            },
            status: {
              type: 'string',
              enum: ['todo', 'in_progress', 'done', 'blocked'],
              nullable: true,
              example: 'todo',
            },
            is_public: {
              type: 'boolean',
              nullable: true,
              example: false,
            },
            tag: {
              type: 'string',
              nullable: true,
              example: 'logistics',
            },
            description: {
              type: 'string',
              nullable: true,
              example: 'Confirm booking with venue manager and pay deposit.',
            },
          },
        },
        UpdateTaskRequest: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Book venue for event' },
            parent_task_id: {
              type: 'string',
              format: 'uuid',
              nullable: true,
            },
            due_date: {
              type: 'string',
              format: 'date-time',
              nullable: true,
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              nullable: true,
            },
            status: {
              type: 'string',
              enum: ['todo', 'in_progress', 'done', 'blocked'],
              nullable: true,
            },
            is_public: {
              type: 'boolean',
              nullable: true,
            },
            tag: {
              type: 'string',
              nullable: true,
            },
            description: {
              type: 'string',
              nullable: true,
            },
          },
        },
        TaskResponse: {
          type: 'object',
          properties: {
            task_id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            event_id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            parent_task_id: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              example: null,
            },
            title: {
              type: 'string',
              nullable: true,
              example: 'Book venue for event',
            },
            description: {
              type: 'string',
              nullable: true,
              example: 'Confirm booking with venue manager and pay deposit.',
            },
            tag: {
              type: 'string',
              nullable: true,
              example: 'logistics',
            },
            due_date: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: '2026-10-10T17:00:00Z',
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              nullable: true,
              example: 'medium',
            },
            status: {
              type: 'string',
              enum: ['todo', 'in_progress', 'done', 'blocked'],
              nullable: true,
              example: 'todo',
            },
            is_public: {
              type: 'boolean',
              example: false,
            },
            created_by: {
              type: 'string',
              format: 'uuid',
              nullable: true,
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2026-10-01T12:00:00Z',
            },
          },
        },
        TaskAssignee: {
          type: 'object',
          properties: {
            user_id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            name: { type: 'string', example: 'Alice' },
            email: { type: 'string', example: 'alice@example.com' },
            profile_pic_url: {
              type: 'string',
              nullable: true,
              example: null,
            },
          },
        },
        TaskWithAssignees: {
          allOf: [
            { $ref: '#/components/schemas/TaskResponse' },
            {
              type: 'object',
              properties: {
                assignees: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/TaskAssignee' },
                },
              },
            },
          ],
        },
        AssignUserRequest: {
          type: 'object',
          required: ['user_id'],
          properties: {
            user_id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
