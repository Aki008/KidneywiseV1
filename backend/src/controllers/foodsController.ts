import { Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

// Search foods by name with similarity search
export async function searchFoods(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { q, category, cuisine, limit = 20 } = req.query;

    if (!q || typeof q !== 'string') {
      throw new AppError(400, 'Search query is required', 'INVALID_QUERY');
    }

    let query = db('foods')
      .select('*')
      .whereRaw('similarity(food_name, ?) > 0.2', [q])
      .orderByRaw('similarity(food_name, ?) DESC', [q])
      .limit(Number(limit));

    if (category) {
      query = query.where('category', category);
    }

    if (cuisine) {
      query = query.where('cuisine', cuisine);
    }

    const foods = await query;

    const formattedFoods = foods.map((food) => ({
      foodId: food.food_id,
      foodName: food.food_name,
      foodNameLocal: food.food_name_local,
      category: food.category,
      cuisine: food.cuisine,
      imageUrl: food.image_url,
      description: food.description,
      nutrientsPer100g: {
        potassium: food.potassium_per_100g,
        phosphorus: food.phosphorus_per_100g,
        protein: food.protein_per_100g,
        sodium: food.sodium_per_100g,
        calories: food.calories_per_100g,
        fluids: food.water_content_per_100g,
      },
      servingSizeGrams: food.serving_size_grams || 100,
      isVerified: food.is_verified,
    }));

    res.json({
      success: true,
      data: {
        foods: formattedFoods,
        query: q,
        count: formattedFoods.length,
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Search foods error:', error);
    throw new AppError(500, 'Failed to search foods', 'SEARCH_FAILED');
  }
}

// Get food by ID
export async function getFoodById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    const food = await db('foods')
      .where({ food_id: id })
      .first();

    if (!food) {
      throw new AppError(404, 'Food not found', 'FOOD_NOT_FOUND');
    }

    res.json({
      success: true,
      data: {
        foodId: food.food_id,
        foodName: food.food_name,
        foodNameLocal: food.food_name_local,
        category: food.category,
        cuisine: food.cuisine,
        imageUrl: food.image_url,
        description: food.description,
        nutrientsPer100g: {
          potassium: food.potassium_per_100g,
          phosphorus: food.phosphorus_per_100g,
          protein: food.protein_per_100g,
          sodium: food.sodium_per_100g,
          calories: food.calories_per_100g,
          fluids: food.water_content_per_100g,
        },
        servingSizeGrams: food.serving_size_grams || 100,
        isVerified: food.is_verified,
        createdAt: food.created_at,
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Get food error:', error);
    throw new AppError(500, 'Failed to get food', 'GET_FOOD_FAILED');
  }
}

// Get similar foods (for alternatives)
export async function getSimilarFoods(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;

    const originalFood = await db('foods')
      .where({ food_id: id })
      .first();

    if (!originalFood) {
      throw new AppError(404, 'Food not found', 'FOOD_NOT_FOUND');
    }

    // Find similar foods in the same category with lower potassium/phosphorus
    const similarFoods = await db('foods')
      .select('*')
      .where('food_id', '!=', id)
      .where('category', originalFood.category)
      .where(function() {
        this.where('potassium_per_100g', '<', originalFood.potassium_per_100g)
          .orWhere('phosphorus_per_100g', '<', originalFood.phosphorus_per_100g);
      })
      .orderBy([
        { column: 'potassium_per_100g', order: 'asc' },
        { column: 'phosphorus_per_100g', order: 'asc' },
      ])
      .limit(Number(limit));

    const formattedFoods = similarFoods.map((food) => ({
      foodId: food.food_id,
      foodName: food.food_name,
      foodNameLocal: food.food_name_local,
      category: food.category,
      cuisine: food.cuisine,
      imageUrl: food.image_url,
      nutrientsPer100g: {
        potassium: food.potassium_per_100g,
        phosphorus: food.phosphorus_per_100g,
        protein: food.protein_per_100g,
        sodium: food.sodium_per_100g,
        calories: food.calories_per_100g,
        fluids: food.water_content_per_100g,
      },
      comparison: {
        potassiumDiff: originalFood.potassium_per_100g - food.potassium_per_100g,
        phosphorusDiff: originalFood.phosphorus_per_100g - food.phosphorus_per_100g,
        potassiumPercent: Math.round(
          ((originalFood.potassium_per_100g - food.potassium_per_100g) /
            originalFood.potassium_per_100g) * 100
        ),
        phosphorusPercent: Math.round(
          ((originalFood.phosphorus_per_100g - food.phosphorus_per_100g) /
            originalFood.phosphorus_per_100g) * 100
        ),
      },
    }));

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
        similarFoods: formattedFoods,
        count: formattedFoods.length,
      },
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error('Get similar foods error:', error);
    throw new AppError(500, 'Failed to get similar foods', 'SIMILAR_FOODS_FAILED');
  }
}
