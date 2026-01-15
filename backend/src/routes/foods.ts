import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import { validateFoodSearch, validateUUID } from '../middleware/validation';
import {
  searchFoods,
  getFoodById,
  getSimilarFoods,
} from '../controllers/foodsController';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// Search foods by name
router.get('/search', validateFoodSearch, searchFoods);

// Get food by ID
router.get('/:id', validateUUID('id'), getFoodById);

// Get similar foods (for alternatives)
router.get('/:id/similar', validateUUID('id'), getSimilarFoods);

export default router;
