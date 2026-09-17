import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import connectDB from './config/db.js';
import { swaggerSpec } from './config/swagger.js';
import AuthRoutes from './routes/AuthRoutes.js';
import UserRoutes from './routes/UserRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', AuthRoutes);
app.use('/api/users', UserRoutes);

// API Documentation — available at http://localhost:5000/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Event-Vibe API Docs',
  swaggerOptions: {
    persistAuthorization: true, // Keeps JWT in the Authorize modal across page refreshes
  },
}));

// Database Connection & Server Listen
connectDB();

const PORT = Number(process.env.PORT) || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});