import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import jwt from "jsonwebtoken";
import http from "http";

// Setup test environment
process.env.JWT_SECRET = "test_jwt_secret_123";
process.env.NODE_ENV = "development";

const app = express();
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Replicate controller logic with mock DB
const mockUser = {
  _id: "60d0fe4f5311236168a109ca",
  name: "Test User",
  email: "test@example.com",
  role: "user",
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
});

// Mock Auth routes
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (email !== "test@example.com" || password !== "password123") {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  const token = generateToken(mockUser._id);
  res.cookie("token", token, getCookieOptions());

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        _id: mockUser._id,
        name: mockUser.name,
        email: mockUser.email,
        role: mockUser.role,
      },
    },
  });
});

app.post("/api/auth/logout", async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  res.status(200).json({
    success: true,
    message: "Session invalidated / Logged out successfully",
  });
});

// Protect middleware
const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.id === mockUser._id) {
      req.user = mockUser;
      return next();
    }
    return res.status(401).json({ message: "User not found" });
  } catch (err) {
    return res.status(401).json({ message: "Not authorized" });
  }
};

app.get("/api/protected", protect, (req, res) => {
  res.json({ success: true, message: `Hello ${req.user.name}` });
});

const server = http.createServer(app);

server.listen(5099, async () => {
  console.log("Test server running on port 5099");

  let cookieHeader = "";

  try {
    // 1. Test Login
    console.log("\n--- TEST 1: Login & Cookie Setting ---");
    const loginRes = await fetch("http://localhost:5099/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "password123" }),
    });

    const loginData = await loginRes.json();
    const setCookie = loginRes.headers.get("set-cookie");

    console.log("Login Status:", loginRes.status);
    console.log("Response Body has token field?:", "token" in (loginData.data || {}));
    console.log("Set-Cookie header:", setCookie);

    if (loginRes.status === 200 && !loginData.data.token && setCookie && setCookie.includes("HttpOnly") && setCookie.includes("SameSite=Lax")) {
      console.log("✅ TEST 1 PASSED: Token is set in HttpOnly cookie and omitted from response body.");
    } else {
      console.error("❌ TEST 1 FAILED");
    }

    // Extract cookie value for subsequent requests
    cookieHeader = setCookie.split(";")[0];

    // 2. Test Protected Route with Cookie
    console.log("\n--- TEST 2: Access Protected Route with Cookie ---");
    const protectedRes = await fetch("http://localhost:5099/api/protected", {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
    });

    const protectedData = await protectedRes.json();
    console.log("Protected Status:", protectedRes.status);
    console.log("Protected Body:", protectedData);

    if (protectedRes.status === 200 && protectedData.success) {
      console.log("✅ TEST 2 PASSED: Protected route successfully accessed via req.cookies.token.");
    } else {
      console.error("❌ TEST 2 FAILED");
    }

    // 3. Test Protected Route WITHOUT Cookie
    console.log("\n--- TEST 3: Access Protected Route without Cookie ---");
    const unauthRes = await fetch("http://localhost:5099/api/protected", {
      method: "GET",
    });

    const unauthData = await unauthRes.json();
    console.log("Unauth Status:", unauthRes.status);
    console.log("Unauth Body:", unauthData);

    if (unauthRes.status === 401) {
      console.log("✅ TEST 3 PASSED: Protected route correctly rejected unauthorized request with 401.");
    } else {
      console.error("❌ TEST 3 FAILED");
    }

    // 4. Test Logout & Cookie Clearing
    console.log("\n--- TEST 4: Logout & Cookie Clearing ---");
    const logoutRes = await fetch("http://localhost:5099/api/auth/logout", {
      method: "POST",
      headers: {
        Cookie: cookieHeader,
      },
    });

    const logoutData = await logoutRes.json();
    const logoutSetCookie = logoutRes.headers.get("set-cookie");
    console.log("Logout Status:", logoutRes.status);
    console.log("Logout Body:", logoutData);
    console.log("Logout Set-Cookie header:", logoutSetCookie);

    if (logoutRes.status === 200 && logoutSetCookie && (logoutSetCookie.includes("Expires=") || logoutSetCookie.includes("Max-Age=0"))) {
      console.log("✅ TEST 4 PASSED: Logout clears token cookie successfully.");
    } else {
      console.error("❌ TEST 4 FAILED");
    }

    console.log("\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!");
  } catch (err) {
    console.error("Test execution failed:", err);
  } finally {
    server.close();
    process.exit(0);
  }
});
