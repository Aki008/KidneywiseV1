import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { TokenPayload } from '../types';
import db from '../config/database';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

// Generate Access Token
export function generateAccessToken(userId: string, email: string): string {
  return jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
}

// Generate Refresh Token
export async function generateRefreshToken(userId: string): Promise<string> {
  const token = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY });
  const tokenHash = await hashPassword(token);

  // Store in database
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7); // 7 days

  await db('refresh_tokens').insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiryDate,
  });

  return token;
}

// Verify Access Token
export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Verify Refresh Token
export async function verifyRefreshToken(token: string): Promise<string> {
  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;

    // Check if token exists and is not revoked
    const tokenRecord = await db('refresh_tokens')
      .where({ user_id: payload.userId })
      .whereNull('revoked_at')
      .first();

    if (!tokenRecord) {
      throw new Error('Token revoked');
    }

    return payload.userId;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

// Revoke Refresh Token
export async function revokeRefreshToken(userId: string): Promise<void> {
  await db('refresh_tokens')
    .where({ user_id: userId })
    .update({ revoked_at: new Date() });
}

// Password Hashing
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

// Compare Password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate Password Reset Token
export async function generatePasswordResetToken(userId: string): Promise<string> {
  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
  const tokenHash = await hashPassword(token);

  const expiryDate = new Date();
  expiryDate.setHours(expiryDate.getHours() + 1); // 1 hour

  await db('password_reset_tokens').insert({
    user_id: userId,
    token_hash: tokenHash,
    expires_at: expiryDate,
  });

  return token;
}

// Verify Password Reset Token
export async function verifyPasswordResetToken(token: string): Promise<string> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload;

    const tokenRecord = await db('password_reset_tokens')
      .where({ user_id: payload.userId })
      .whereNull('used_at')
      .where('expires_at', '>', new Date())
      .first();

    if (!tokenRecord) {
      throw new Error('Invalid or expired reset token');
    }

    // Mark as used
    await db('password_reset_tokens')
      .where({ token_id: tokenRecord.token_id })
      .update({ used_at: new Date() });

    return payload.userId;
  } catch (error) {
    throw new Error('Invalid or expired reset token');
  }
}
