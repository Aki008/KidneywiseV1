import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import authRoutes from './routes/auth';
import onboardingRoutes from './routes/onboarding';
import dashboardRoutes from './routes/dashboard';
import mealsRoutes from './routes/meals';
import foodsRoutes from './routes/foods';
import symptomsRoutes from './routes/symptoms';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 8080;
const API_VERSION = process.env.API_VERSION || 'v1';

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API Routes
const apiPrefix = `/api/${API_VERSION}`;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/onboarding`, onboardingRoutes);
app.use(`${apiPrefix}/dashboard`, dashboardRoutes);
app.use(`${apiPrefix}/meals`, mealsRoutes);
app.use(`${apiPrefix}/foods`, foodsRoutes);
app.use(`${apiPrefix}/symptoms`, symptomsRoutes);

// 404 Handler
app.use(notFoundHandler);

// Error Handler
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    app.listen(PORT, () => {
      console.log(`
╔═══════════════════════════════════════╗
║     KidneyWise API Server Running     ║
║                                       ║
║  🚀 Port: ${PORT}                    ║
║  🌍 Environment: ${process.env.NODE_ENV || 'development'}     ║
║  📡 API: ${apiPrefix}                    ║
║  💚 Status: Healthy                  ║
╚═══════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

startServer();

export default app;
