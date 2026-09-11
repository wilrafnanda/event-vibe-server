import express from "express";
import { registerUser, loginUser, logoutUser } from "../controllers/AuthController.js";
const router = express.Router();

// Define the endpoints
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

export default router;