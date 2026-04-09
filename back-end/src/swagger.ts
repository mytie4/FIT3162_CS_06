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
      },
    },
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
