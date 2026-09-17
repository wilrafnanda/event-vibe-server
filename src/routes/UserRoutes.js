import express from "express";
import { getUsers, getUserById } from "../controllers/UserController.js";
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// OpenAPI 3.0 Annotations — picked up by swagger-jsdoc via src/config/swagger.js
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: >
 *       User management endpoints. All routes require a valid session cookie or
 *       Bearer JWT token. Admin-only routes additionally require the `admin` role.
 */

// ── Current User Profile ──────────────────────────────────────────────────────

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get the authenticated user's profile
 *     description: >
 *       Returns the full profile of the currently authenticated user.
 *       Useful for React Query auth state hydration — no ID needed in the path.
 *     operationId: getMyProfile
 *     security:
 *       - CookieAuth: []
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Authenticated user's profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               _id: 64f1c2e8a3b5c9d1e2f3a4b5
 *               name: Jane Doe
 *               email: jane.doe@example.com
 *               role: user
 *               verify: true
 *               createdAt: '2025-01-15T10:30:00.000Z'
 *               updatedAt: '2025-06-20T14:45:00.000Z'
 *       '401':
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *             example:
 *               success: false
 *               message: Not authorized, no token
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 *             example:
 *               success: false
 *               message: Internal server error
 */
router.get("/me", protect, getUserById);

/**
 * @openapi
 * /users/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get the authenticated user's profile (alias)
 *     description: >
 *       Alias for `GET /users/me`. Returns the same authenticated user profile.
 *       Provided for API consumers who prefer the `/profile` path convention.
 *     operationId: getUserProfile
 *     security:
 *       - CookieAuth: []
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Authenticated user's profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               _id: 64f1c2e8a3b5c9d1e2f3a4b5
 *               name: Jane Doe
 *               email: jane.doe@example.com
 *               role: user
 *               verify: true
 *               createdAt: '2025-01-15T10:30:00.000Z'
 *               updatedAt: '2025-06-20T14:45:00.000Z'
 *       '401':
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 */
router.get("/profile", protect, getUserById);

// ── Admin: List / Search All Users ───────────────────────────────────────────

/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: List and search all users (Admin only)
 *     description: >
 *       Returns a paginated list of all users. Supports fuzzy name search and
 *       role filtering. **Requires the `admin` role.**
 *     operationId: getUsers
 *     security:
 *       - CookieAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: "Search users by name (case-insensitive, partial match). Aliases: search, q."
 *         example: Jane
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: "Alias for name — search users by display name."
 *         example: Jane
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: "Alias for name — general search query."
 *         example: Jane
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [user, admin, moderator]
 *         description: Filter results by user role.
 *         example: admin
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination.
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of results per page (max 100).
 *         example: 10
 *     responses:
 *       '200':
 *         description: Paginated list of users returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsersResponse'
 *             example:
 *               success: true
 *               count: 2
 *               pagination:
 *                 totalUsers: 87
 *                 totalPages: 9
 *                 currentPage: 1
 *                 limit: 10
 *                 hasNextPage: true
 *                 hasPrevPage: false
 *               data:
 *                 - _id: 64f1c2e8a3b5c9d1e2f3a4b5
 *                   name: Jane Doe
 *                   email: jane.doe@example.com
 *                   role: user
 *                   verify: true
 *                   createdAt: '2025-01-15T10:30:00.000Z'
 *                   updatedAt: '2025-06-20T14:45:00.000Z'
 *                 - _id: 64f1c2e8a3b5c9d1e2f3a4c6
 *                   name: John Smith
 *                   email: john.smith@example.com
 *                   role: admin
 *                   verify: true
 *                   createdAt: '2024-11-02T08:00:00.000Z'
 *                   updatedAt: '2025-07-01T09:15:00.000Z'
 *       '401':
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *             example:
 *               success: false
 *               message: Not authorized, no token
 *       '403':
 *         description: Authenticated but not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenResponse'
 *             example:
 *               success: false
 *               message: Access denied. Admin privileges required.
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 *             example:
 *               success: false
 *               message: An error occurred while retrieving users
 */
router.get("/", protect, admin, getUsers);

/**
 * @openapi
 * /users/Allusers:
 *   get:
 *     tags:
 *       - Users
 *     summary: List all users — alternate path (Admin only)
 *     description: >
 *       Alias for `GET /users`. Returns the same paginated user list with the same
 *       query parameters. Provided for backward compatibility.
 *     operationId: getAllUsers
 *     security:
 *       - CookieAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         example: 10
 *     responses:
 *       '200':
 *         description: Paginated list of users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsersResponse'
 *       '401':
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *       '403':
 *         description: Not an admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForbiddenResponse'
 */
router.get("/Allusers", protect, admin, getUsers);

// ── Get User by ID ────────────────────────────────────────────────────────────

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get a user by ID
 *     description: >
 *       Retrieves the full public profile of a single user by their MongoDB ObjectId.
 *       Requires a valid session. The password hash is **never** returned.
 *     operationId: getUserById
 *     security:
 *       - CookieAuth: []
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[a-f\d]{24}$'
 *         description: MongoDB ObjectId of the target user.
 *         example: 64f1c2e8a3b5c9d1e2f3a4b5
 *     responses:
 *       '200':
 *         description: User found and returned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *             example:
 *               _id: 64f1c2e8a3b5c9d1e2f3a4b5
 *               name: Jane Doe
 *               email: jane.doe@example.com
 *               role: user
 *               verify: true
 *               createdAt: '2025-01-15T10:30:00.000Z'
 *               updatedAt: '2025-06-20T14:45:00.000Z'
 *       '400':
 *         description: The provided `id` is not a valid MongoDB ObjectId
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid user ID format
 *       '401':
 *         description: Not authenticated — missing or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *             example:
 *               success: false
 *               message: Not authorized, no token
 *       '404':
 *         description: No user exists with the given ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFoundResponse'
 *             example:
 *               message: User no longer exists
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
router.get("/:id", protect, getUserById);

export default router;