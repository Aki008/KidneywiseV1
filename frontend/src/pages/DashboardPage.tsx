import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, TrendingUp, LogOut, Flame, Droplet, History, Activity } from 'lucide-react';
import { dashboardApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { DashboardData } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardApi.get();
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error('Dashboard error:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const getNutrientColor = (percent: number) => {
    if (percent >= 100) return 'bg-danger-500';
    if (percent >= 80) return 'bg-warning-500';
    return 'bg-primary-500';
  };

  const getNutrientIcon = (nutrient: string) => {
    if (nutrient === 'calories') return <Flame className="w-4 h-4" />;
    if (nutrient === 'fluids') return <Droplet className="w-4 h-4" />;
    return <TrendingUp className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Failed to load dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 safe-bottom">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white safe-top">
        <div className="container-mobile py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold">
                Welcome back, {data.user.fullName.split(' ')[0]}!
              </h1>
              <p className="text-primary-100 text-sm">
                CKD Stage {data.user.ckdStage} • {data.user.streakDays} day streak 🔥
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-lg transition tap-target"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* AI Message */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-white/90 text-sm leading-relaxed">
              {data.aiPersonalMessage.message}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-mobile py-6 space-y-6">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/food-analysis')}
            className="card hover:shadow-medium transition-all tap-target active:scale-95"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 p-3 rounded-full mb-2">
                <Camera className="w-6 h-6 text-primary-600" />
              </div>
              <span className="font-semibold text-gray-900">Scan Food</span>
              <span className="text-xs text-gray-500 mt-1">Photo analysis</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/symptoms')}
            className="card hover:shadow-medium transition-all tap-target active:scale-95"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 p-3 rounded-full mb-2">
                <Activity className="w-6 h-6 text-primary-600" />
              </div>
              <span className="font-semibold text-gray-900">Symptoms</span>
              <span className="text-xs text-gray-500 mt-1">Track health</span>
            </div>
          </button>

          <button
            onClick={() => navigate('/meals-history')}
            className="card hover:shadow-medium transition-all tap-target active:scale-95"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 p-3 rounded-full mb-2">
                <History className="w-6 h-6 text-primary-600" />
              </div>
              <span className="font-semibold text-gray-900">Meal History</span>
              <span className="text-xs text-gray-500 mt-1">View past meals</span>
            </div>
          </button>

          <button
            onClick={() => toast('Coming soon!')}
            className="card hover:shadow-medium transition-all tap-target active:scale-95"
          >
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary-100 p-3 rounded-full mb-2">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              <span className="font-semibold text-gray-900">View Trends</span>
              <span className="text-xs text-gray-500 mt-1">7-day analytics</span>
            </div>
          </button>
        </div>

        {/* Today's Nutrients */}
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Today's Nutrient Intake
          </h2>

          <div className="space-y-4">
            {Object.entries(data.nutrientsToday).map(([nutrient, values]) => (
              <div key={nutrient}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="text-gray-500">{getNutrientIcon(nutrient)}</div>
                    <span className="font-medium text-gray-900 capitalize">
                      {nutrient}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {values.consumed} / {values.limit}
                    {nutrient === 'fluids' ? ' ml' : nutrient === 'calories' ? '' : ' mg'}
                  </span>
                </div>
                <div className="nutrient-bar">
                  <div
                    className={`nutrient-bar-fill ${getNutrientColor(values.percent)}`}
                    style={{ width: `${Math.min(values.percent, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500">
                    {values.percent}% of daily limit
                  </span>
                  {values.percent >= 100 && (
                    <span className="text-xs font-medium text-danger-600">
                      Limit exceeded
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contextual Cards */}
        {data.contextualCards.length > 0 && (
          <div className="space-y-3">
            {data.contextualCards.map((card, index) => (
              <div
                key={index}
                className={`card border-l-4 ${
                  card.type === 'warning'
                    ? 'border-warning-500 bg-warning-50'
                    : card.type === 'meal_suggestion'
                    ? 'border-primary-500'
                    : 'border-gray-300'
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-1">{card.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{card.description}</p>
                {card.actionLabel && (
                  <button
                    onClick={() => {
                      if (card.actionUrl === '/food-analysis') {
                        navigate('/food-analysis');
                      } else {
                        toast('Coming soon!');
                      }
                    }}
                    className="text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    {card.actionLabel} →
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {data.nutrientsToday.potassium.consumed === 0 && (
          <div className="card text-center py-8">
            <p className="text-gray-600 mb-4">
              No meals logged today. Start by scanning your first meal!
            </p>
            <button
              onClick={() => navigate('/food-analysis')}
              className="btn btn-primary"
            >
              <Camera className="w-5 h-5 mr-2 inline" />
              Scan Food Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
