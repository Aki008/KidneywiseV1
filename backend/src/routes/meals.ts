import { Router } from 'express';
import * as mealsController from '../controllers/mealsController';
import { authenticateUser } from '../middleware/auth';
import { validateMealLog } from '../middleware/validation';
import multer from 'multer';

const router = Router();

// Configure multer for photo uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// POST /api/v1/meals/upload-photo - Upload and analyze food photo
router.post('/upload-photo', authenticateUser, upload.single('photo'), mealsController.uploadAndAnalyzePhoto);

// POST /api/v1/meals/analyze-nutrients - Calculate nutrients for adjusted portions
router.post('/analyze-nutrients', authenticateUser, mealsController.analyzeNutrients);

// POST /api/v1/meals/alternatives - Get food alternatives
router.post('/alternatives', authenticateUser, mealsController.getAlternatives);

// POST /api/v1/meals/log - Log meal to database
router.post('/log', authenticateUser, validateMealLog, mealsController.logMeal);

// GET /api/v1/meals - Get user's meals
router.get('/', authenticateUser, mealsController.getMeals);

// GET /api/v1/meals/:id - Get meal by ID
router.get('/:id', authenticateUser, mealsController.getMealById);

// DELETE /api/v1/meals/:id - Delete meal
router.delete('/:id', authenticateUser, mealsController.deleteMeal);

export default router;
