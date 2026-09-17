import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/AuthController.js";

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// OpenAPI 3.0 Annotations — picked up by swagger-jsdoc via src/config/swagger.js
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @openapi
 * tags:
 *   - name: Auth
 *     description: >
 *       Authentication endpoints. Login and register set an HTTP-only `token`
 *       cookie on the response. Logout clears it. No Authorization header needed
 *       for browser clients — the cookie is forwarded automatically.
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register a new user
 *     description: >
 *       Creates a new user account. On success the server sets a signed, HTTP-only
 *       `token` cookie valid for **1 day** and returns the new user's public profile.
 *     operationId: registerUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             name: Jane Doe
 *             email: jane.doe@example.com
 *             password: SecurePass123!
 *             role: user
 *     responses:
 *       '201':
 *         description: User registered successfully
 *         headers:
 *           Set-Cookie:
 *             description: Signed HTTP-only JWT cookie (`token`), expires in 1 day.
 *             schema:
 *               type: string
 *               example: token=eyJhbGci...; Path=/; HttpOnly; SameSite=Lax
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *             example:
 *               success: true
 *               message: Registration successful
 *               data:
 *                 user:
 *                   _id: 64f1c2e8a3b5c9d1e2f3a4b5
 *                   name: Jane Doe
 *                   email: jane.doe@example.com
 *                   role: user
 *       '400':
 *         description: Validation error — missing fields, invalid email, weak password, or duplicate email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   message: Please provide all required fields
 *               invalidEmail:
 *                 summary: Malformed email
 *                 value:
 *                   success: false
 *                   message: Please provide a valid email
 *               weakPassword:
 *                 summary: Password too short
 *                 value:
 *                   success: false
 *                   message: Password must be at least 6 characters
 *               duplicateEmail:
 *                 summary: Email already registered
 *                 value:
 *                   success: false
 *                   message: An account with this email already exists
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 *             example:
 *               success: false
 *               message: Registration failed. Please try again.
 */
router.post("/register", registerUser);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login with email and password
 *     description: >
 *       Authenticates the user and sets a signed, HTTP-only `token` cookie on the
 *       response. The cookie is automatically sent on all subsequent requests by
 *       the browser — no manual token handling required on the client.
 *     operationId: loginUser
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: jane.doe@example.com
 *             password: SecurePass123!
 *     responses:
 *       '200':
 *         description: Login successful — JWT cookie is set
 *         headers:
 *           Set-Cookie:
 *             description: Signed HTTP-only JWT cookie (`token`), expires in 1 day.
 *             schema:
 *               type: string
 *               example: token=eyJhbGci...; Path=/; HttpOnly; SameSite=Lax
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *             example:
 *               success: true
 *               message: Login successful
 *               data:
 *                 user:
 *                   _id: 64f1c2e8a3b5c9d1e2f3a4b5
 *                   name: Jane Doe
 *                   email: jane.doe@example.com
 *                   role: user
 *       '400':
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *             example:
 *               success: false
 *               message: Please provide email and password
 *       '401':
 *         description: Invalid credentials (user not found or wrong password)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UnauthorizedResponse'
 *             example:
 *               success: false
 *               message: Invalid credentials
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 *             example:
 *               success: false
 *               message: Login failed. Please try again.
 */
router.post("/login", loginUser);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Logout — invalidate the session cookie
 *     description: >
 *       Clears the HTTP-only `token` cookie by setting its `maxAge` to 0.
 *       The browser will discard the cookie immediately. No request body is needed.
 *     operationId: logoutUser
 *     security:
 *       - CookieAuth: []
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Session invalidated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Session invalidated / Logged out successfully
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InternalServerErrorResponse'
 *             example:
 *               success: false
 *               message: Failed to invalidate session
 */
router.post("/logout", logoutUser);

export default router;