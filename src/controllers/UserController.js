import mongoose from "mongoose";
import User from "../models/userModel.js";

/**
 * Escapes special regex characters to prevent ReDoS (Regular Expression Denial of Service)
 */
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// @desc    Get/Search users with query filters and pagination
// @route   GET /api/users
// @access  Public / Protected
export const getUsers = async (req, res) => {
  try {
    const { name, search, q, role, page = 1, limit = 10 } = req.query;

    const query = {};

    // 1. Search by User Name specifically
    const targetName = (name || search || q)?.trim();
    if (targetName) {
      query.name = { $regex: escapeRegex(targetName), $options: "i" };
    }

    // 2. Filter by role if provided
    if (role?.trim()) {
      query.role = role.trim().toLowerCase();
    }

    // 3. Pagination sanitization
    const parsedPage = Math.max(1, parseInt(page, 10) || 1);
    const parsedLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (parsedPage - 1) * parsedLimit;

    // 4. Parallel execution for high performance
    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select("-password") // Never expose hashed passwords
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parsedLimit)
        .lean(),
      User.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalUsers / parsedLimit);

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: parsedPage,
        limit: parsedLimit,
        hasNextPage: parsedPage < totalPages,
        hasPrevPage: parsedPage > 1,
      },
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving users",
    });
  }
};


export const getUserById = async (req, res) => {
  try {
    const targetId = req.params?.id || req.userId;

    if (!targetId || !mongoose.Types.ObjectId.isValid(targetId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    // Fetch the user from the database. 
    // .select('-password') ensures we don't accidentally leak the password hash
    const user = await User.findById(targetId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User no longer exists' });
    }

    // Return the safe user data to React Query
    res.json(user);

  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

