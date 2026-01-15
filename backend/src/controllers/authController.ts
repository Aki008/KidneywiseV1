import { Request, Response } from 'express';
import db from '../config/database';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
} from '../utils/auth';
import { AppError } from '../middleware/errorHandler';

// Register new user
export async function register(req: Request, res: Response): Promise<void> {
  const { email, password, fullName } = req.body;

  // Check if user exists
  const existingUser = await db('users').where({ email }).first();
  if (existingUser) {
    throw new AppError(409, 'Email already registered', 'EMAIL_EXISTS');
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user with minimal info (will complete in onboarding)
  const [user] = await db('users')
    .insert({
      email,
      password_hash: passwordHash,
      full_name: fullName,
      ckd_stage: '3b', // Default, will be updated in onboarding
      weight: 70, // Default, will be updated in onboarding
      dietary_preference: 'omnivore', // Default
      cuisine_preferences: [],
      food_allergies: [],
    })
    .returning(['user_id', 'email', 'full_name']);

  // Generate tokens
  const accessToken = generateAccessToken(user.user_id, user.email);
  const refreshToken = await generateRefreshToken(user.user_id);

  res.status(201).json({
    success: true,
    data: {
      userId: user.user_id,
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes
    },
  });
}

// Login
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  // Find user
  const user = await db('users').where({ email }).first();
  if (!user) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // Verify password
  const isValid = await comparePassword(password, user.password_hash);
  if (!isValid) {
    throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
  }

  // Update last active
  await db('users').where({ user_id: user.user_id }).update({ last_active_at: new Date() });

  // Generate tokens
  const accessToken = generateAccessToken(user.user_id, user.email);
  const refreshToken = await generateRefreshToken(user.user_id);

  res.json({
    success: true,
    data: {
      userId: user.user_id,
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes
    },
  });
}

// Refresh token
export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new AppError(400, 'Refresh token required', 'MISSING_REFRESH_TOKEN');
  }

  // Verify refresh token
  const userId = await verifyRefreshToken(refreshToken);

  // Get user
  const user = await db('users').where({ user_id: userId }).first();
  if (!user) {
    throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
  }

  // Generate new access token
  const accessToken = generateAccessToken(user.user_id, user.email);

  res.json({
    success: true,
    data: {
      accessToken,
      expiresIn: 900,
    },
  });
}

// Logout
export async function logout(req: Request, res: Response): Promise<void> {
  const { userId } = req.body;

  if (userId) {
    await revokeRefreshToken(userId);
  }

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
}
