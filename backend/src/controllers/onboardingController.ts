import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import db from '../config/database';
import { AppError } from '../middleware/errorHandler';

// Complete onboarding
export async function completeOnboarding(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  const {
    fullName,
    ckdStage,
    age,
    dietaryPreference,
    cuisinePreferences,
    foodAllergies,
    weight,
    height,
    dialysisType,
    permissionCamera,
    permissionNotifications,
    permissionMicrophone,
  } = req.body;

  // Calculate date of birth from age
  const dateOfBirth = new Date();
  dateOfBirth.setFullYear(dateOfBirth.getFullYear() - age);

  // Update user with onboarding data
  const [updatedUser] = await db('users')
    .where({ user_id: userId })
    .update({
      full_name: fullName,
      ckd_stage: ckdStage,
      date_of_birth: dateOfBirth,
      dietary_preference: dietaryPreference,
      cuisine_preferences: cuisinePreferences || [],
      food_allergies: foodAllergies || [],
      weight,
      height,
      dialysis_type: dialysisType,
      permission_camera: permissionCamera || false,
      permission_notifications: permissionNotifications || false,
      permission_microphone: permissionMicrophone || false,
      updated_at: new Date(),
    })
    .returning('*');

  // Get daily limits (automatically calculated by trigger)
  const dailyLimits = await db('daily_limits').where({ user_id: userId }).first();

  res.json({
    success: true,
    data: {
      userId: updatedUser.user_id,
      dailyLimits: {
        potassium: dailyLimits.potassium,
        phosphorus: dailyLimits.phosphorus,
        protein: dailyLimits.protein,
        sodium: dailyLimits.sodium,
        fluids: dailyLimits.fluids,
      },
    },
  });
}

// Get onboarding status
export async function getOnboardingStatus(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  const user = await db('users').where({ user_id: userId }).first();

  if (!user) {
    throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
  }

  // Check if onboarding is complete (has date_of_birth and height)
  const isComplete = !!(user.date_of_birth && user.height);

  res.json({
    success: true,
    data: {
      isComplete,
      user: {
        fullName: user.full_name,
        ckdStage: user.ckd_stage,
        dietaryPreference: user.dietary_preference,
      },
    },
  });
}
