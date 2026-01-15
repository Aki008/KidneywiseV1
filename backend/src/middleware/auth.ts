import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/auth';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export async function authenticateUser(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid authorization header',
        },
      });
      return;
    }

    const token = authHeader.substring(7);
    const payload = verifyAccessToken(token);

    req.user = { userId: payload.userId, email: payload.email };

    next();
  } catch (error) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      },
    });
  }
}

// Optional auth - doesn't fail if no token provided
export async function optionalAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      req.user = { userId: payload.userId, email: payload.email };
    } catch (error) {
      // Silently fail - user will be treated as unauthenticated
    }
  }

  next();
}
