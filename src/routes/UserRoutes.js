import express from "express";
import { getUsers, getUserById } from "../controllers/UserController.js";
import { admin, protect } from '../middleware/authMiddleware.js'

const router = express.Router();

// Search & list users: GET /api/users?name=John
router.get("/email",protect,admin, getUsers);


export default router;