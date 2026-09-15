import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

dotenv.config();

// Express Backend Middleware for Protected Routes
export const protect = async (req, res, next) => {
  try {
    // 1. Get token directly from incoming cookies (with fallback to Authorization header)
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token provided, authorization denied" });
    }

    // 2. Verify the token using JWT Secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_jwt_secret");

    // 3. Find the user by ID from decoded token
    req.userId = decoded.id
    
    next(); // Pass control to the next function (the Controller)
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: "Not authorized" });
  }
};

// 2. Second middleware: Checks if user is an Admin
export const admin = async (req, res, next) => {
  try {
    const user = req.user || (req.userId ? await User.findById(req.userId).select("role") : null);
    if (user && user.role?.toLowerCase() === "admin") {
      req.user = user;
      next(); // User is admin, proceed to the controller
    } else {
      res.status(403).json({ message: "Not authorized as admin" });
    }
  } catch (error) {
    console.error("Admin check error:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};