import { useNavigate } from 'react-router-dom';
import { Heart, Camera, TrendingUp, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useEffect } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <div className="container-mobile pt-12 pb-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary-500 p-4 rounded-3xl">
              <Heart className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            KidneyWise
          </h1>
          <p className="text-lg text-gray-600">
            AI-powered kidney disease management
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <div className="card">
            <div className="flex items-start space-x-4">
              <div className="bg-primary-100 p-3 rounded-xl flex-shrink-0">
                <Camera className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Photo Food Analysis
                </h3>
                <p className="text-sm text-gray-600">
                  Snap a photo of your meal and get instant nutrient breakdown with safety warnings
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start space-x-4">
              <div className="bg-primary-100 p-3 rounded-xl flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Track Your Progress
                </h3>
                <p className="text-sm text-gray-600">
                  Monitor daily nutrient intake and stay within your personalized CKD limits
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-start space-x-4">
              <div className="bg-primary-100 p-3 rounded-xl flex-shrink-0">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  AI-Powered Guidance
                </h3>
                <p className="text-sm text-gray-600">
                  Get personalized food alternatives and recommendations from our AI nutritionist
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => navigate('/register')}
            className="btn btn-primary w-full tap-target"
          >
            Get Started Free
          </button>
          <button
            onClick={() => navigate('/login')}
            className="btn btn-secondary w-full tap-target"
          >
            I Already Have an Account
          </button>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            HIPAA compliant • Trusted by kidney patients
          </p>
        </div>
      </div>
    </div>
  );
}
