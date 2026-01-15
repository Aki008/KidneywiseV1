import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import db from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { DashboardData, NutrientValues } from '../types';

// Get dashboard data
export async function getDashboard(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError(401, 'Unauthorized', 'UNAUTHORIZED');
  }

  // Get user info
  const user = await db('users').where({ user_id: userId }).first();
  if (!user) {
    throw new AppError(404, 'User not found', 'USER_NOT_FOUND');
  }

  // Get daily limits
  const dailyLimits = await db('daily_limits').where({ user_id: userId }).first();

  // Get today's nutrient totals
  const today = new Date().toISOString().split('T')[0];
  let todayTotals = await db('daily_nutrient_totals')
    .where({ user_id: userId, date: today })
    .first();

  // If no data for today, initialize with zeros
  if (!todayTotals) {
    todayTotals = {
      potassium: 0,
      phosphorus: 0,
      protein: 0,
      sodium: 0,
      calories: 0,
      fluids: 0,
    };
  }

  // Calculate nutrient percentages
  const nutrientsToday: Record<keyof NutrientValues, { consumed: number; limit: number; percent: number }> = {
    potassium: {
      consumed: todayTotals.potassium,
      limit: dailyLimits.potassium,
      percent: Math.round((todayTotals.potassium / dailyLimits.potassium) * 100),
    },
    phosphorus: {
      consumed: todayTotals.phosphorus,
      limit: dailyLimits.phosphorus,
      percent: Math.round((todayTotals.phosphorus / dailyLimits.phosphorus) * 100),
    },
    protein: {
      consumed: parseFloat(todayTotals.protein),
      limit: parseFloat(dailyLimits.protein),
      percent: Math.round((parseFloat(todayTotals.protein) / parseFloat(dailyLimits.protein)) * 100),
    },
    sodium: {
      consumed: todayTotals.sodium,
      limit: dailyLimits.sodium,
      percent: Math.round((todayTotals.sodium / dailyLimits.sodium) * 100),
    },
    calories: {
      consumed: todayTotals.calories,
      limit: 2000, // Default
      percent: Math.round((todayTotals.calories / 2000) * 100),
    },
    fluids: {
      consumed: todayTotals.fluids,
      limit: dailyLimits.fluids,
      percent: Math.round((todayTotals.fluids / dailyLimits.fluids) * 100),
    },
  };

  // Generate AI personal message
  const aiPersonalMessage = generateAIMessage(
    user.full_name.split(' ')[0],
    user.ckd_stage,
    user.streak_days,
    nutrientsToday
  );

  // Generate contextual cards
  const contextualCards = generateContextualCards(nutrientsToday, dailyLimits);

  // Count unread notifications (placeholder - we'll implement notifications later)
  const notificationsUnread = 0;

  const dashboardData: DashboardData = {
    user: {
      fullName: user.full_name,
      ckdStage: user.ckd_stage,
      streakDays: user.streak_days,
    },
    aiPersonalMessage,
    nutrientsToday,
    contextualCards,
    notificationsUnread,
  };

  res.json({
    success: true,
    data: dashboardData,
  });
}

// Generate AI personal message
function generateAIMessage(
  firstName: string,
  ckdStage: string,
  streakDays: number,
  nutrients: Record<string, { consumed: number; limit: number; percent: number }>
): { message: string; sentiment: 'positive' | 'neutral' | 'encouraging' } {
  const exceededCount = Object.values(nutrients).filter(n => n.percent >= 100).length;
  const nearLimitCount = Object.values(nutrients).filter(n => n.percent >= 80 && n.percent < 100).length;

  let message: string;
  let sentiment: 'positive' | 'neutral' | 'encouraging';

  if (exceededCount === 0 && nearLimitCount === 0) {
    message = `Great job, ${firstName}! 🎉 You're staying well within your limits today. Keep up the excellent work!`;
    sentiment = 'positive';
  } else if (exceededCount === 0 && nearLimitCount > 0) {
    message = `Hey ${firstName}! You're doing well, but getting close to your limits on ${nearLimitCount} nutrient${nearLimitCount > 1 ? 's' : ''}. Let's plan lighter meals for the rest of the day.`;
    sentiment = 'encouraging';
  } else if (streakDays >= 7) {
    message = `${firstName}, you have a ${streakDays}-day streak! That's amazing. Let's stay balanced today.`;
    sentiment = 'encouraging';
  } else {
    message = `Hi ${firstName}! Remember, every day is a fresh start. Let's focus on staying within limits today.`;
    sentiment = 'neutral';
  }

  return { message, sentiment };
}

// Generate contextual cards
function generateContextualCards(
  nutrients: Record<string, { consumed: number; limit: number; percent: number }>,
  dailyLimits: any
): Array<{
  type: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionUrl?: string;
  priority: number;
}> {
  const cards: any[] = [];

  // Check potassium
  if (nutrients.potassium.percent < 50) {
    const remaining = dailyLimits.potassium - nutrients.potassium.consumed;
    cards.push({
      type: 'meal_suggestion',
      title: 'You Have Room for Potassium',
      description: `You have ${remaining}mg of potassium left today. Here are some safe options!`,
      actionLabel: 'See Foods',
      actionUrl: '/foods?filter=potassium',
      priority: 2,
    });
  }

  // Check if approaching limits
  const nutrientsNearLimit = Object.entries(nutrients)
    .filter(([key, value]) => value.percent >= 80 && value.percent < 100)
    .map(([key]) => key);

  if (nutrientsNearLimit.length > 0) {
    cards.push({
      type: 'warning',
      title: 'Watch Your Intake',
      description: `You're approaching limits for: ${nutrientsNearLimit.join(', ')}`,
      actionLabel: 'See Alternatives',
      actionUrl: '/ai-chat',
      priority: 1,
    });
  }

  // Check if exceeded
  const nutrientsExceeded = Object.entries(nutrients)
    .filter(([key, value]) => value.percent >= 100)
    .map(([key]) => key);

  if (nutrientsExceeded.length > 0) {
    cards.push({
      type: 'alert',
      title: 'Daily Limit Exceeded',
      description: `You've exceeded limits for: ${nutrientsExceeded.join(', ')}. Talk to your dietitian if this happens frequently.`,
      priority: 0,
    });
  }

  // Add educational content card
  cards.push({
    type: 'education',
    title: 'Learn About Kidney Health',
    description: 'Discover tips and recipes for managing CKD',
    actionLabel: 'Explore',
    actionUrl: '/education',
    priority: 3,
  });

  // Sort by priority
  return cards.sort((a, b) => a.priority - b.priority);
}
