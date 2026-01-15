import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validateRegistration, validateLogin } from '../middleware/validation';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', validateRegistration, authController.register);

// POST /api/v1/auth/login
router.post('/login', validateLogin, authController.login);

// POST /api/v1/auth/refresh
router.post('/refresh', authController.refreshToken);

// POST /api/v1/auth/logout
router.post('/logout', authController.logout);

export default router;
