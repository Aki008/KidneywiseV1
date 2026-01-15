import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { onboardingApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

type Step = 1 | 2 | 3 | 4;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    age: '',
    weight: '',
    height: '',
    ckdStage: '',
    dialysisType: '',
    dietaryPreference: '',
    cuisinePreferences: [] as string[],
    foodAllergies: [] as string[],
    permissions: {
      camera: false,
      notifications: false,
      microphone: false,
    },
  });

  const ckdStages = [
    { value: '1', label: 'Stage 1 (GFR ≥ 90)' },
    { value: '2', label: 'Stage 2 (GFR 60-89)' },
    { value: '3a', label: 'Stage 3a (GFR 45-59)' },
    { value: '3b', label: 'Stage 3b (GFR 30-44)' },
    { value: '4', label: 'Stage 4 (GFR 15-29)' },
    { value: '5', label: 'Stage 5 (GFR < 15)' },
    { value: 'dialysis', label: 'On Dialysis' },
    { value: 'transplant', label: 'Post Transplant' },
  ];

  const dietaryTypes = [
    { value: 'omnivore', label: 'Omnivore', emoji: '🍖' },
    { value: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
    { value: 'vegan', label: 'Vegan', emoji: '🌱' },
    { value: 'pescatarian', label: 'Pescatarian', emoji: '🐟' },
  ];

  const cuisineOptions = [
    'American', 'Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese',
    'Mediterranean', 'Thai', 'Korean', 'Middle Eastern'
  ];

  const nextStep = () => {
    if (step < 4) setStep((step + 1) as Step);
  };

  const prevStep = () => {
    if (step > 1) setStep((step - 1) as Step);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const response = await onboardingApi.complete(formData);

      if (response.success) {
        toast.success('Profile completed! Welcome to KidneyWise');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.response?.data?.error?.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  const toggleCuisine = (cuisine: string) => {
    setFormData((prev) => ({
      ...prev,
      cuisinePreferences: prev.cuisinePreferences.includes(cuisine)
        ? prev.cuisinePreferences.filter((c) => c !== cuisine)
        : [...prev.cuisinePreferences, cuisine],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      <div className="container-mobile py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {step} of 4
            </span>
            <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Let's get to know you
            </h2>
            <p className="text-gray-600 mb-6">
              Tell us a bit about yourself so we can personalize your experience
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  required
                  min="18"
                  max="120"
                  className="input"
                  placeholder="35"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    required
                    min="20"
                    max="300"
                    step="0.1"
                    className="input"
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="250"
                    className="input"
                    placeholder="170"
                    value={formData.height}
                    onChange={(e) =>
                      setFormData({ ...formData, height: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: CKD Stage */}
        {step === 2 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your CKD Stage
            </h2>
            <p className="text-gray-600 mb-6">
              Select your current chronic kidney disease stage
            </p>

            <div className="space-y-3">
              {ckdStages.map((stage) => (
                <button
                  key={stage.value}
                  onClick={() => setFormData({ ...formData, ckdStage: stage.value })}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all tap-target ${
                    formData.ckdStage === stage.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="font-medium text-gray-900">{stage.label}</span>
                </button>
              ))}
            </div>

            {formData.ckdStage === 'dialysis' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dialysis Type
                </label>
                <select
                  className="input"
                  value={formData.dialysisType}
                  onChange={(e) =>
                    setFormData({ ...formData, dialysisType: e.target.value })
                  }
                >
                  <option value="">Select type</option>
                  <option value="hemodialysis">Hemodialysis</option>
                  <option value="peritoneal">Peritoneal Dialysis</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Dietary Preferences */}
        {step === 3 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Dietary Preferences
            </h2>
            <p className="text-gray-600 mb-6">
              Help us personalize your food recommendations
            </p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Dietary Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {dietaryTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() =>
                        setFormData({ ...formData, dietaryPreference: type.value })
                      }
                      className={`p-4 rounded-xl border-2 text-center transition-all tap-target ${
                        formData.dietaryPreference === type.value
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-3xl mb-1">{type.emoji}</div>
                      <div className="font-medium text-sm text-gray-900">
                        {type.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Favorite Cuisines (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {cuisineOptions.map((cuisine) => (
                    <button
                      key={cuisine}
                      onClick={() => toggleCuisine(cuisine)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all tap-target ${
                        formData.cuisinePreferences.includes(cuisine)
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Food Allergies (optional)
                </label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., peanuts, shellfish (comma-separated)"
                  onChange={(e) => {
                    const allergies = e.target.value
                      .split(',')
                      .map((a) => a.trim())
                      .filter(Boolean);
                    setFormData({ ...formData, foodAllergies: allergies });
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Permissions */}
        {step === 4 && (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              App Permissions
            </h2>
            <p className="text-gray-600 mb-6">
              Enable features to get the most out of KidneyWise
            </p>

            <div className="space-y-4">
              <div className="card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Camera Access</h3>
                    <p className="text-sm text-gray-600">
                      Required for photo food analysis
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={formData.permissions.camera}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            camera: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Notifications
                    </h3>
                    <p className="text-sm text-gray-600">
                      Meal reminders and health tips
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={formData.permissions.notifications}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            notifications: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      Microphone (Optional)
                    </h3>
                    <p className="text-sm text-gray-600">
                      For voice commands and AI chat
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={formData.permissions.microphone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          permissions: {
                            ...formData.permissions,
                            microphone: e.target.checked,
                          },
                        })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="btn btn-secondary flex-1 tap-target"
            >
              <ChevronLeft className="w-5 h-5 mr-1 inline" />
              Back
            </button>
          )}

          {step < 4 ? (
            <button
              onClick={nextStep}
              disabled={
                (step === 1 && (!formData.fullName || !formData.age || !formData.weight)) ||
                (step === 2 && !formData.ckdStage) ||
                (step === 3 && !formData.dietaryPreference)
              }
              className="btn btn-primary flex-1 tap-target"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1 inline" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn btn-primary flex-1 tap-target"
            >
              {loading ? 'Completing...' : 'Complete Setup'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
