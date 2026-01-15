import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

// Handle validation errors
export function handleValidationErrors(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new AppError(400, 'Validation failed', 'INVALID_REQUEST', errors.array());
  }
  next();
}

// Registration validation
export const validateRegistration = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name required'),
  handleValidationErrors,
];

// Login validation
export const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  handleValidationErrors,
];

// Onboarding validation
export const validateOnboarding = [
  body('fullName').trim().isLength({ min: 2, max: 100 }),
  body('ckdStage').isIn(['1', '2', '3a', '3b', '4', '5', 'dialysis', 'transplant']),
  body('age').isInt({ min: 18, max: 120 }),
  body('dietaryPreference').isIn(['omnivore', 'vegetarian', 'vegan', 'pescatarian']),
  body('weight').isFloat({ min: 20, max: 300 }),
  body('cuisinePreferences').optional().isArray(),
  body('foodAllergies').optional().isArray(),
  handleValidationErrors,
];

// Meal logging validation
export const validateMealLog = [
  body('photoUrl').isURL(),
  body('foods').isArray({ min: 1 }),
  body('foods.*.foodId').isUUID(),
  body('foods.*.portionGrams').isInt({ min: 1, max: 5000 }),
  body('totalNutrients.potassium').isInt({ min: 0 }),
  body('totalNutrients.phosphorus').isInt({ min: 0 }),
  body('totalNutrients.protein').isFloat({ min: 0 }),
  body('mealType').optional().isIn(['breakfast', 'lunch', 'dinner', 'snack']),
  handleValidationErrors,
];

// Food search validation
export const validateFoodSearch = [
  query('q').optional().trim().isLength({ min: 1, max: 100 }),
  query('category').optional().isIn(['protein', 'vegetable', 'fruit', 'grain', 'dairy', 'beverage']),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors,
];

// UUID param validation
export const validateUUID = [
  param('id').isUUID().withMessage('Invalid ID format'),
  handleValidationErrors,
];
