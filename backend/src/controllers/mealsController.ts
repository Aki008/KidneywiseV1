import { Response } from 'express';
import { Request } from 'express';
import db from '../config/database';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import { NutrientValues } from '../types';
import { generateAlternativeExplanation } from '../services/openaiService';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';

// Upload and analyze photo
export async function uploadAndAnalyzePhoto(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    if (!req.file) {
      throw new AppError(400, 'No photo uploaded', 'NO_PHOTO');
    }

    // Process image with sharp (compress and resize)
    const processedImage = await sharp(req.file.buffer)
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Save to local storage (in production, upload to S3)
    const uploadsDir = path.join(__dirname, '../../uploads/meals');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filename = `${userId}_${Date.now()}_${uuidv4()}.jpg`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, processedImage);

    const photoUrl = `/uploads/meals/${filename}`;

    // TODO: Call LogMeal API for food detection
    // For now, return mock detected foods for MVP
    const detectedFoods = await detectFoodsFromImage(processedImage);

    // Match detected foods with database
    const matchedFoods = await matchFoodsWithDatabase(detectedFoods);

    res.json({
      success: true,
      data: {
        photoUrl,
        detectedFoods: matchedFoods,
        message: matchedFoods.length > 0
          ? 'Foods detected successfully'
          : 'No foods detected. Try uploading a clearer image.',
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Photo upload error:', error);
    throw new AppError(500, 'Failed to process photo', 'PHOTO_UPLOAD_FAILED');
  }
}

// Helper: Detect foods from image (mock for MVP, will integrate LogMeal API)
async function detectFoodsFromImage(imageBuffer: Buffer): Promise<string[]> {
  // Mock detection for MVP - in production, call LogMeal API
  // For now, we'll return some common foods
  // In real implementation:
  // const formData = new FormData();
  // formData.append('image', imageBuffer);
  // const response = await axios.post('https://api.logmeal.es/v2/recognition/dish', formData);

  return ['chicken breast', 'white rice', 'broccoli'];
}

// Helper: Match detected foods with database
async function matchFoodsWithDatabase(detectedNames: string[]): Promise<any[]> {
  const matchedFoods = [];

  for (const name of detectedNames) {
    // Use similarity search with pg_trgm
    const food = await db('foods')
      .select('*')
      .whereRaw('similarity(food_name, ?) > 0.3', [name])
      .orderByRaw('similarity(food_name, ?) DESC', [name])
      .first();

    if (food) {
      matchedFoods.push({
        foodId: food.food_id,
        foodName: food.food_name,
        category: food.category,
        cuisine: food.cuisine,
        imageUrl: food.image_url,
        defaultPortionGrams: 100,
        nutrientsPer100g: {
          potassium: food.potassium_per_100g,
          phosphorus: food.phosphorus_per_100g,
          protein: food.protein_per_100g,
          sodium: food.sodium_per_100g,
          calories: food.calories_per_100g,
          fluids: food.water_content_per_100g,
        },
      });
    }
  }

  return matchedFoods;
}

// Analyze nutrients for adjusted portions
export async function analyzeNutrients(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { foods } = req.body; // Array of { foodId, portionGrams }

    if (!foods || !Array.isArray(foods) || foods.length === 0) {
      throw new AppError(400, 'Foods array is required', 'INVALID_INPUT');
    }

    // Get user's daily limits
    const dailyLimits = await db('daily_limits')
      .where({ user_id: userId })
      .first();

    if (!dailyLimits) {
      throw new AppError(404, 'Daily limits not found', 'LIMITS_NOT_FOUND');
    }

    // Get today's current totals
    const today = new Date().toISOString().split('T')[0];
    const todayTotals = await db('daily_nutrient_totals')
      .where({ user_id: userId, date: today })
      .first();

    const currentIntake: NutrientValues = todayTotals ? {
      potassium: todayTotals.potassium,
      phosphorus: todayTotals.phosphorus,
      protein: todayTotals.protein,
      sodium: todayTotals.sodium,
      calories: todayTotals.calories,
      fluids: todayTotals.fluids,
    } : {
      potassium: 0,
      phosphorus: 0,
      protein: 0,
      sodium: 0,
      calories: 0,
      fluids: 0,
    };

    // Calculate nutrients for each food
    const foodBreakdown = [];
    const totalNutrients: NutrientValues = {
      potassium: 0,
      phosphorus: 0,
      protein: 0,
      sodium: 0,
      calories: 0,
      fluids: 0,
    };

    for (const item of foods) {
      const food = await db('foods')
        .where({ food_id: item.foodId })
        .first();

      if (!food) {
        throw new AppError(404, `Food not found: ${item.foodId}`, 'FOOD_NOT_FOUND');
      }

      const multiplier = item.portionGrams / 100;
      const nutrients: NutrientValues = {
        potassium: Math.round(food.potassium_per_100g * multiplier),
        phosphorus: Math.round(food.phosphorus_per_100g * multiplier),
        protein: parseFloat((food.protein_per_100g * multiplier).toFixed(1)),
        sodium: Math.round(food.sodium_per_100g * multiplier),
        calories: Math.round(food.calories_per_100g * multiplier),
        fluids: Math.round(food.water_content_per_100g * multiplier),
      };

      foodBreakdown.push({
        foodId: food.food_id,
        foodName: food.food_name,
        portionGrams: item.portionGrams,
        nutrients,
      });

      // Add to totals
      totalNutrients.potassium += nutrients.potassium;
      totalNutrients.phosphorus += nutrients.phosphorus;
      totalNutrients.protein += nutrients.protein;
      totalNutrients.sodium += nutrients.sodium;
      totalNutrients.calories += nutrients.calories;
      totalNutrients.fluids += nutrients.fluids;
    }

    // Calculate totals after this meal
    const totalAfterMeal: NutrientValues = {
      potassium: currentIntake.potassium + totalNutrients.potassium,
      phosphorus: currentIntake.phosphorus + totalNutrients.phosphorus,
      protein: currentIntake.protein + totalNutrients.protein,
      sodium: currentIntake.sodium + totalNutrients.sodium,
      calories: currentIntake.calories + totalNutrients.calories,
      fluids: currentIntake.fluids + totalNutrients.fluids,
    };

    // Generate warnings
    const warnings = [];

    if (totalAfterMeal.potassium > dailyLimits.potassium) {
      const excess = totalAfterMeal.potassium - dailyLimits.potassium;
      const percent = Math.round((totalAfterMeal.potassium / dailyLimits.potassium) * 100);
      warnings.push({
        nutrient: 'potassium',
        severity: percent > 120 ? 'danger' : 'warning',
        currentIntake: currentIntake.potassium,
        mealAmount: totalNutrients.potassium,
        totalAfterMeal: totalAfterMeal.potassium,
        dailyLimit: dailyLimits.potassium,
        percentOfLimit: percent,
        message: `This meal will put you ${excess}mg over your potassium limit (${percent}% of daily limit)`,
      });
    }

    if (totalAfterMeal.phosphorus > dailyLimits.phosphorus) {
      const excess = totalAfterMeal.phosphorus - dailyLimits.phosphorus;
      const percent = Math.round((totalAfterMeal.phosphorus / dailyLimits.phosphorus) * 100);
      warnings.push({
        nutrient: 'phosphorus',
        severity: percent > 120 ? 'danger' : 'warning',
        currentIntake: currentIntake.phosphorus,
        mealAmount: totalNutrients.phosphorus,
        totalAfterMeal: totalAfterMeal.phosphorus,
        dailyLimit: dailyLimits.phosphorus,
        percentOfLimit: percent,
        message: `This meal will exceed your phosphorus limit by ${excess}mg (${percent}% of daily limit)`,
      });
    }

    if (totalAfterMeal.sodium > dailyLimits.sodium) {
      const excess = totalAfterMeal.sodium - dailyLimits.sodium;
      const percent = Math.round((totalAfterMeal.sodium / dailyLimits.sodium) * 100);
      warnings.push({
        nutrient: 'sodium',
        severity: percent > 120 ? 'danger' : 'warning',
        currentIntake: currentIntake.sodium,
        mealAmount: totalNutrients.sodium,
        totalAfterMeal: totalAfterMeal.sodium,
        dailyLimit: dailyLimits.sodium,
        percentOfLimit: percent,
        message: `This meal will exceed your sodium limit by ${excess}mg (${percent}% of daily limit)`,
      });
    }

    if (totalAfterMeal.protein > dailyLimits.protein) {
      const excess = totalAfterMeal.protein - dailyLimits.protein;
      const percent = Math.round((totalAfterMeal.protein / dailyLimits.protein) * 100);
      warnings.push({
        nutrient: 'protein',
        severity: percent > 120 ? 'danger' : 'warning',
        currentIntake: currentIntake.protein,
        mealAmount: totalNutrients.protein,
        totalAfterMeal: totalAfterMeal.protein,
        dailyLimit: dailyLimits.protein,
        percentOfLimit: percent,
        message: `This meal will exceed your protein limit by ${excess}g (${percent}% of daily limit)`,
      });
    }

    res.json({
      success: true,
      data: {
        foodBreakdown,
        totalNutrients,
        currentIntake,
        totalAfterMeal,
        dailyLimits: {
          potassium: dailyLimits.potassium,
          phosphorus: dailyLimits.phosphorus,
          protein: dailyLimits.protein,
          sodium: dailyLimits.sodium,
          calories: dailyLimits.calories,
          fluids: dailyLimits.fluids,
        },
        warnings,
        isSafe: warnings.length === 0,
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Nutrient analysis error:', error);
    throw new AppError(500, 'Failed to analyze nutrients', 'ANALYSIS_FAILED');
  }
}

// Get safer food alternatives
export async function getAlternatives(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { foodId } = req.body;

    if (!foodId) {
      throw new AppError(400, 'Food ID is required', 'INVALID_INPUT');
    }

    // Get original food
    const originalFood = await db('foods')
      .where({ food_id: foodId })
      .first();

    if (!originalFood) {
      throw new AppError(404, 'Food not found', 'FOOD_NOT_FOUND');
    }

    // Find alternatives with lower potassium and phosphorus
    const alternatives = await db('foods')
      .select('*')
      .where('food_id', '!=', foodId)
      .where('category', originalFood.category)
      .where('potassium_per_100g', '<', originalFood.potassium_per_100g)
      .where('phosphorus_per_100g', '<', originalFood.phosphorus_per_100g)
      .orderBy('potassium_per_100g', 'asc')
      .limit(5);

    // Generate AI explanations for each alternative
    const alternativesWithExplanations = await Promise.all(
      alternatives.map(async (alt) => {
        const explanation = await generateAlternativeExplanation(
          originalFood.food_name,
          alt.food_name
        );

        return {
          foodId: alt.food_id,
          foodName: alt.food_name,
          category: alt.category,
          cuisine: alt.cuisine,
          imageUrl: alt.image_url,
          nutrientsPer100g: {
            potassium: alt.potassium_per_100g,
            phosphorus: alt.phosphorus_per_100g,
            protein: alt.protein_per_100g,
            sodium: alt.sodium_per_100g,
            calories: alt.calories_per_100g,
            fluids: alt.water_content_per_100g,
          },
          comparison: {
            potassiumReduction: Math.round(
              ((originalFood.potassium_per_100g - alt.potassium_per_100g) /
              originalFood.potassium_per_100g) * 100
            ),
            phosphorusReduction: Math.round(
              ((originalFood.phosphorus_per_100g - alt.phosphorus_per_100g) /
              originalFood.phosphorus_per_100g) * 100
            ),
          },
          explanation,
        };
      })
    );

    res.json({
      success: true,
      data: {
        originalFood: {
          foodId: originalFood.food_id,
          foodName: originalFood.food_name,
          nutrientsPer100g: {
            potassium: originalFood.potassium_per_100g,
            phosphorus: originalFood.phosphorus_per_100g,
            protein: originalFood.protein_per_100g,
            sodium: originalFood.sodium_per_100g,
          },
        },
        alternatives: alternativesWithExplanations,
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Alternatives error:', error);
    throw new AppError(500, 'Failed to get alternatives', 'ALTERNATIVES_FAILED');
  }
}

// Log meal to database
export async function logMeal(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { photoUrl, mealType, foods, notes } = req.body;

    if (!photoUrl || !foods || !Array.isArray(foods) || foods.length === 0) {
      throw new AppError(400, 'Photo URL and foods array are required', 'INVALID_INPUT');
    }

    // Calculate total nutrients
    const totalNutrients: NutrientValues = {
      potassium: 0,
      phosphorus: 0,
      protein: 0,
      sodium: 0,
      calories: 0,
      fluids: 0,
    };

    const foodDetails = [];

    for (const item of foods) {
      const food = await db('foods')
        .where({ food_id: item.foodId })
        .first();

      if (!food) {
        throw new AppError(404, `Food not found: ${item.foodId}`, 'FOOD_NOT_FOUND');
      }

      const multiplier = item.portionGrams / 100;
      const nutrients: NutrientValues = {
        potassium: Math.round(food.potassium_per_100g * multiplier),
        phosphorus: Math.round(food.phosphorus_per_100g * multiplier),
        protein: parseFloat((food.protein_per_100g * multiplier).toFixed(1)),
        sodium: Math.round(food.sodium_per_100g * multiplier),
        calories: Math.round(food.calories_per_100g * multiplier),
        fluids: Math.round(food.water_content_per_100g * multiplier),
      };

      totalNutrients.potassium += nutrients.potassium;
      totalNutrients.phosphorus += nutrients.phosphorus;
      totalNutrients.protein += nutrients.protein;
      totalNutrients.sodium += nutrients.sodium;
      totalNutrients.calories += nutrients.calories;
      totalNutrients.fluids += nutrients.fluids;

      foodDetails.push({
        foodId: food.food_id,
        foodName: food.food_name,
        portionGrams: item.portionGrams,
        nutrients,
      });
    }

    // Start transaction
    await db.transaction(async (trx) => {
      // Insert meal
      const [meal] = await trx('meals')
        .insert({
          user_id: userId,
          photo_url: photoUrl,
          meal_type: mealType || null,
          consumed_at: new Date(),
          potassium: totalNutrients.potassium,
          phosphorus: totalNutrients.phosphorus,
          protein: totalNutrients.protein,
          sodium: totalNutrients.sodium,
          calories: totalNutrients.calories,
          fluids: totalNutrients.fluids,
          notes: notes || null,
        })
        .returning('*');

      // Insert meal foods
      const mealFoods = foods.map((item) => {
        const food = foodDetails.find((f) => f.foodId === item.foodId);
        return {
          meal_id: meal.meal_id,
          food_id: item.foodId,
          food_name: food!.foodName,
          portion_grams: item.portionGrams,
          potassium: food!.nutrients.potassium,
          phosphorus: food!.nutrients.phosphorus,
          protein: food!.nutrients.protein,
          sodium: food!.nutrients.sodium,
          calories: food!.nutrients.calories,
          fluids: food!.nutrients.fluids,
        };
      });

      await trx('meal_foods').insert(mealFoods);

      // Update daily totals
      const today = new Date().toISOString().split('T')[0];
      const existingTotal = await trx('daily_nutrient_totals')
        .where({ user_id: userId, date: today })
        .first();

      if (existingTotal) {
        await trx('daily_nutrient_totals')
          .where({ user_id: userId, date: today })
          .update({
            potassium: existingTotal.potassium + totalNutrients.potassium,
            phosphorus: existingTotal.phosphorus + totalNutrients.phosphorus,
            protein: existingTotal.protein + totalNutrients.protein,
            sodium: existingTotal.sodium + totalNutrients.sodium,
            calories: existingTotal.calories + totalNutrients.calories,
            fluids: existingTotal.fluids + totalNutrients.fluids,
            updated_at: new Date(),
          });
      } else {
        await trx('daily_nutrient_totals').insert({
          user_id: userId,
          date: today,
          potassium: totalNutrients.potassium,
          phosphorus: totalNutrients.phosphorus,
          protein: totalNutrients.protein,
          sodium: totalNutrients.sodium,
          calories: totalNutrients.calories,
          fluids: totalNutrients.fluids,
        });
      }

      res.status(201).json({
        success: true,
        data: {
          mealId: meal.meal_id,
          photoUrl: meal.photo_url,
          mealType: meal.meal_type,
          consumedAt: meal.consumed_at,
          nutrients: totalNutrients,
          foods: foodDetails,
        },
        message: 'Meal logged successfully!',
      });
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Log meal error:', error);
    throw new AppError(500, 'Failed to log meal', 'LOG_MEAL_FAILED');
  }
}

// Get user's meals history
export async function getMeals(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { startDate, endDate, limit = 20, offset = 0 } = req.query;

    let query = db('meals')
      .where({ user_id: userId })
      .orderBy('consumed_at', 'desc')
      .limit(Number(limit))
      .offset(Number(offset));

    if (startDate) {
      query = query.where('consumed_at', '>=', new Date(startDate as string));
    }

    if (endDate) {
      query = query.where('consumed_at', '<=', new Date(endDate as string));
    }

    const meals = await query;

    // Get foods for each meal
    const mealsWithFoods = await Promise.all(
      meals.map(async (meal) => {
        const foods = await db('meal_foods')
          .where({ meal_id: meal.meal_id })
          .select('*');

        return {
          mealId: meal.meal_id,
          photoUrl: meal.photo_url,
          mealType: meal.meal_type,
          consumedAt: meal.consumed_at,
          nutrients: {
            potassium: meal.potassium,
            phosphorus: meal.phosphorus,
            protein: meal.protein,
            sodium: meal.sodium,
            calories: meal.calories,
            fluids: meal.fluids,
          },
          foods: foods.map((f) => ({
            foodId: f.food_id,
            foodName: f.food_name,
            portionGrams: f.portion_grams,
            nutrients: {
              potassium: f.potassium,
              phosphorus: f.phosphorus,
              protein: f.protein,
              sodium: f.sodium,
              calories: f.calories,
              fluids: f.fluids,
            },
          })),
          notes: meal.notes,
          createdAt: meal.created_at,
        };
      })
    );

    res.json({
      success: true,
      data: {
        meals: mealsWithFoods,
        pagination: {
          limit: Number(limit),
          offset: Number(offset),
          total: meals.length,
        },
      },
    });
  } catch (error) {
    console.error('Get meals error:', error);
    throw new AppError(500, 'Failed to get meals', 'GET_MEALS_FAILED');
  }
}

// Get single meal by ID
export async function getMealById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const meal = await db('meals')
      .where({ meal_id: id, user_id: userId })
      .first();

    if (!meal) {
      throw new AppError(404, 'Meal not found', 'MEAL_NOT_FOUND');
    }

    const foods = await db('meal_foods')
      .where({ meal_id: meal.meal_id })
      .select('*');

    res.json({
      success: true,
      data: {
        mealId: meal.meal_id,
        photoUrl: meal.photo_url,
        mealType: meal.meal_type,
        consumedAt: meal.consumed_at,
        nutrients: {
          potassium: meal.potassium,
          phosphorus: meal.phosphorus,
          protein: meal.protein,
          sodium: meal.sodium,
          calories: meal.calories,
          fluids: meal.fluids,
        },
        foods: foods.map((f) => ({
          foodId: f.food_id,
          foodName: f.food_name,
          portionGrams: f.portion_grams,
          nutrients: {
            potassium: f.potassium,
            phosphorus: f.phosphorus,
            protein: f.protein,
            sodium: f.sodium,
            calories: f.calories,
            fluids: f.fluids,
          },
        })),
        notes: meal.notes,
        createdAt: meal.created_at,
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Get meal error:', error);
    throw new AppError(500, 'Failed to get meal', 'GET_MEAL_FAILED');
  }
}

// Delete meal
export async function deleteMeal(req: AuthRequest, res: Response): Promise<void> {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const meal = await db('meals')
      .where({ meal_id: id, user_id: userId })
      .first();

    if (!meal) {
      throw new AppError(404, 'Meal not found', 'MEAL_NOT_FOUND');
    }

    // Start transaction
    await db.transaction(async (trx) => {
      // Delete meal foods
      await trx('meal_foods')
        .where({ meal_id: id })
        .del();

      // Delete meal
      await trx('meals')
        .where({ meal_id: id })
        .del();

      // Update daily totals (subtract this meal's nutrients)
      const mealDate = new Date(meal.consumed_at).toISOString().split('T')[0];
      const dailyTotal = await trx('daily_nutrient_totals')
        .where({ user_id: userId, date: mealDate })
        .first();

      if (dailyTotal) {
        await trx('daily_nutrient_totals')
          .where({ user_id: userId, date: mealDate })
          .update({
            potassium: Math.max(0, dailyTotal.potassium - meal.potassium),
            phosphorus: Math.max(0, dailyTotal.phosphorus - meal.phosphorus),
            protein: Math.max(0, dailyTotal.protein - meal.protein),
            sodium: Math.max(0, dailyTotal.sodium - meal.sodium),
            calories: Math.max(0, dailyTotal.calories - meal.calories),
            fluids: Math.max(0, dailyTotal.fluids - meal.fluids),
            updated_at: new Date(),
          });
      }
    });

    res.json({
      success: true,
      message: 'Meal deleted successfully',
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Delete meal error:', error);
    throw new AppError(500, 'Failed to delete meal', 'DELETE_MEAL_FAILED');
  }
}
