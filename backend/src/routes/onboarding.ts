import { Router } from 'express';
import * as onboardingController from '../controllers/onboardingController';
import { authenticateUser } from '../middleware/auth';
import { validateOnboarding } from '../middleware/validation';

const router = Router();

// POST /api/v1/onboarding - Complete user onboarding
router.post('/', authenticateUser, validateOnboarding, onboardingController.completeOnboarding);

// GET /api/v1/onboarding/status - Check if user completed onboarding
router.get('/status', authenticateUser, onboardingController.getOnboardingStatus);

export default router;
