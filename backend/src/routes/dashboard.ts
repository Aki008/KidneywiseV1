import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// GET /api/v1/dashboard - Get dashboard data
router.get('/', authenticateUser, dashboardController.getDashboard);

export default router;
