import express from "express";
import { getUsers, getUserById } from "../controllers/UserController.js";
import { admin, protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Current user profile (for React Query auth state): GET /api/users/me or GET /api/users/profile
router.get("/me", protect, getUserById);
router.get("/profile", protect, getUserById);

// Search & list all users: GET /api/users or GET /api/users/Allusers (Admin only)
router.get("/", protect, admin, getUsers);
router.get("/Allusers", protect, admin, getUsers);

// Get single user by ID: GET /api/users/:id
router.get("/:id", protect, getUserById);

export default router;