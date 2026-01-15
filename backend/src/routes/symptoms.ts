import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import {
  logSymptom,
  getSymptoms,
  getSymptomTypes,
  deleteSymptom,
  getSymptomStats,
} from '../controllers/symptomsController';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// Get symptom types
router.get('/types', getSymptomTypes);

// Log symptom
router.post('/', logSymptom);

// Get symptoms history
router.get('/', getSymptoms);

// Get symptom statistics
router.get('/stats', getSymptomStats);

// Delete symptom
router.delete('/:id', deleteSymptom);

export default router;
