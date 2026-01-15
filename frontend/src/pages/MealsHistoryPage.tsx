import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Trash2, Camera } from 'lucide-react';
import { mealsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Meal {
  mealId: string;
  photoUrl: string;
  mealType: string;
  consumedAt: string;
  nutrients: {
    potassium: number;
    phosphorus: number;
    protein: number;
    sodium: number;
    calories: number;
    fluids: number;
  };
  foods: Array<{
    foodId: string;
    foodName: string;
    portionGrams: number;
  }>;
  notes: string;
  createdAt: string;
}

export default function MealsHistoryPage() {
  const navigate = useNavigate();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      const response = await mealsApi.getMeals({ limit: 50 });
      if (response.success && response.data) {
        setMeals(response.data.meals);
      }
    } catch (error) {
      console.error('Load meals error:', error);
      toast.error('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meal?')) return;

    try {
      const response = await mealsApi.deleteMeal(id);
      if (response.success) {
        toast.success('Meal deleted');
        loadMeals();
      }
    } catch (error) {
      console.error('Delete meal error:', error);
      toast.error('Failed to delete meal');
    }
  };

  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return `Today, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (d.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      });
    }
  };

  const getMealTypeEmoji = (type: string) => {
    switch (type) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 safe-bottom pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 safe-top">
        <div className="container-mobile py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={() => navigate('/dashboard')} className="mr-4 tap-target">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Meal History</h1>
            </div>
            <button
              onClick={() => navigate('/food-analysis')}
              className="btn btn-primary py-2 px-4 text-sm"
            >
              <Camera className="w-4 h-4 mr-1 inline" />
              New
            </button>
          </div>
        </div>
      </div>

      {/* Meals List */}
      <div className="container-mobile py-6">
        {meals.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-gray-600 mb-4">No meals logged yet</p>
            <button
              onClick={() => navigate('/food-analysis')}
              className="btn btn-primary"
            >
              <Camera className="w-5 h-5 mr-2 inline" />
              Log Your First Meal
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {meals.map((meal) => (
              <div key={meal.mealId} className="card">
                <div className="flex gap-4">
                  {/* Photo */}
                  <img
                    src={meal.photoUrl}
                    alt="Meal"
                    className="w-24 h-24 rounded-lg object-cover flex-shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {meal.mealType && (
                          <span className="text-xl">
                            {getMealTypeEmoji(meal.mealType)}
                          </span>
                        )}
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {meal.mealType || 'Meal'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteMeal(meal.mealId)}
                        className="text-gray-400 hover:text-danger-500 tap-target"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 mb-2">
                      {formatDate(meal.consumedAt)}
                    </p>

                    {/* Foods */}
                    <div className="text-sm text-gray-700 mb-3">
                      {meal.foods.map((food, index) => (
                        <span key={food.foodId}>
                          {food.foodName} ({food.portionGrams}g)
                          {index < meal.foods.length - 1 && ', '}
                        </span>
                      ))}
                    </div>

                    {/* Nutrients Summary */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">K:</span>{' '}
                        <span className="font-medium">{meal.nutrients.potassium}mg</span>
                      </div>
                      <div>
                        <span className="text-gray-500">P:</span>{' '}
                        <span className="font-medium">{meal.nutrients.phosphorus}mg</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Na:</span>{' '}
                        <span className="font-medium">{meal.nutrients.sodium}mg</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Protein:</span>{' '}
                        <span className="font-medium">{meal.nutrients.protein}g</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Cal:</span>{' '}
                        <span className="font-medium">{meal.nutrients.calories}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Fluids:</span>{' '}
                        <span className="font-medium">{meal.nutrients.fluids}ml</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {meal.notes && (
                      <p className="text-xs text-gray-600 mt-2 italic">
                        "{meal.notes}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
