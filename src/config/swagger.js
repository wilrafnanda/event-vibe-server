import swaggerJsdoc from 'swagger-jsdoc';

// ─────────────────────────────────────────────────────────────────────────────
// NOTE on glob paths (Windows gotcha):
//   path.join(__dirname, '../routes/*.js') produces backslashes on Windows
//   (e.g. src\routes\*.js) which swagger-jsdoc's internal `glob` cannot
//   resolve. We use a plain forward-slash CWD-relative string instead —
//   swagger-jsdoc resolves it from process.cwd(), which is always the project
//   root when you run `npm run dev` or `node src/server.js`.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * OpenAPI 3.0 definition object.
 * ─────────────────────────────────────────────────────────────
 * All reusable schemas and security schemes live here so route
 * annotations stay lean — just $ref pointers.
 */
const definition = {
  openapi: '3.0.0',

  // ── API Metadata ─────────────────────────────────────────────
  info: {
    title: 'Event-Vibe API',
    version: '1.0.0',
    description: `
## Event-Vibe REST API

A full-featured backend for the **Event-Vibe** platform — handling authentication,
user management, events, and ticketing.

### Authentication
This API uses **HTTP-only cookie** sessions. After a successful \`/auth/login\` or
\`/auth/register\` call, a signed JWT is stored in a \`token\` cookie automatically
by the browser. Protected routes validate this cookie server-side.

> For direct API testing via Swagger UI, use the **Authorize** button and supply
> your JWT token as a Bearer token — the auth middleware accepts both.
    `.trim(),
    contact: {
      name: 'Event-Vibe Team',
      email: 'support@event-vibe.com',
    },
    license: {
      name: 'ISC',
    },
  },

  // ── Servers ───────────────────────────────────────────────────
  servers: [
    {
      url: 'http://localhost:5000/api',
      description: 'Local Development Server',
    },
    {
      url: 'https://api.event-vibe.com/api',
      description: 'Production Server',
    },
  ],

  // ── Reusable Components ───────────────────────────────────────
  components: {

    // Security Schemes
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token (without the "Bearer " prefix). Obtained from /auth/login.',
      },
      CookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'token',
        description: 'HTTP-only cookie set automatically by the server after login.',
      },
    },

    // Reusable Schemas
    schemas: {

      // ── User ─────────────────────────────────────────────────
      User: {
        type: 'object',
        description: 'A registered Event-Vibe user (password hash never returned).',
        properties: {
          _id: {
            type: 'string',
            description: 'MongoDB ObjectId',
            example: '64f1c2e8a3b5c9d1e2f3a4b5',
          },
          name: {
            type: 'string',
            maxLength: 50,
            example: 'Jane Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'jane.doe@example.com',
          },
          role: {
            type: 'string',
            enum: ['user', 'admin', 'moderator'],
            default: 'user',
            example: 'user',
          },
          verify: {
            type: 'boolean',
            description: 'Whether the user\'s email has been verified',
            example: false,
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-01-15T10:30:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-06-20T14:45:00.000Z',
          },
        },
      },

      // ── Auth Request Bodies ───────────────────────────────────
      RegisterRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: {
            type: 'string',
            maxLength: 50,
            example: 'Jane Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'jane.doe@example.com',
          },
          password: {
            type: 'string',
            minLength: 6,
            format: 'password',
            example: 'SecurePass123!',
          },
          role: {
            type: 'string',
            enum: ['user', 'admin', 'moderator'],
            default: 'user',
            example: 'user',
          },
        },
      },

      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            format: 'email',
            example: 'jane.doe@example.com',
          },
          password: {
            type: 'string',
            format: 'password',
            example: 'SecurePass123!',
          },
        },
      },

      // ── Auth Responses ────────────────────────────────────────
      AuthSuccessResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Login successful' },
          data: {
            type: 'object',
            properties: {
              user: { $ref: '#/components/schemas/UserSummary' },
            },
          },
        },
      },

      UserSummary: {
        type: 'object',
        description: 'Minimal user object returned after auth operations.',
        properties: {
          _id: { type: 'string', example: '64f1c2e8a3b5c9d1e2f3a4b5' },
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane.doe@example.com' },
          role: { type: 'string', enum: ['user', 'admin', 'moderator'], example: 'user' },
        },
      },

      // ── Paginated Users ───────────────────────────────────────
      PaginatedUsersResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          count: { type: 'integer', description: 'Number of users in this page', example: 10 },
          pagination: {
            type: 'object',
            properties: {
              totalUsers: { type: 'integer', example: 87 },
              totalPages: { type: 'integer', example: 9 },
              currentPage: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 10 },
              hasNextPage: { type: 'boolean', example: true },
              hasPrevPage: { type: 'boolean', example: false },
            },
          },
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' },
          },
        },
      },

      // ── Error Responses ───────────────────────────────────────
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'An error occurred' },
        },
      },

      ValidationErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Please provide all required fields' },
        },
      },

      UnauthorizedResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Not authorized, no token' },
        },
      },

      NotFoundResponse: {
        type: 'object',
        properties: {
          message: { type: 'string', example: 'User no longer exists' },
        },
      },

      ForbiddenResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Access denied. Admin privileges required.' },
        },
      },

      InternalServerErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Internal server error' },
        },
      },
    },
  },
};

/**
 * swagger-jsdoc options.
 *
 * `apis` must use FORWARD SLASHES on Windows — backslashes break glob.
 * We use a CWD-relative path so this works regardless of where the file
 * lives in the src/ tree. The server is always started from the project root.
 */
const options = {
  definition,
  apis: [
    'src/routes/*.js', // Picks up all @openapi JSDoc blocks in route files
  ],
};

// Build the compiled OpenAPI spec
export const swaggerSpec = swaggerJsdoc(options);

// ── Startup diagnostic ────────────────────────────────────────────────────────
// If this prints 0 — swagger-jsdoc cannot find your route files.
const discoveredPaths = Object.keys(swaggerSpec.paths || {});
console.log(`[Swagger] ${discoveredPaths.length} route(s) documented:`, discoveredPaths);

