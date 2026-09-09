import express from "express";
import { registerUser, loginUser } from "../controllers/AuthController.js";
const router = express.Router();

// Define the endpoints
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;