import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Camera,
  Upload,
  X,
  AlertTriangle,
  CheckCircle,
  Minus,
  Plus,
  Lightbulb,
} from 'lucide-react';
import { mealsApi } from '@/lib/api';
import {
  DetectedFood,
  NutrientAnalysis,
  NutrientWarning,
} from '@/types';
import toast from 'react-hot-toast';

type Step = 'capture' | 'detected' | 'adjust' | 'analysis' | 'log';

export default function FoodAnalysisPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [step, setStep] = useState<Step>('capture');
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [detectedFoods, setDetectedFoods] = useState<DetectedFood[]>([]);
  const [foodPortions, setFoodPortions] = useState<
    Record<string, number>
  >({});
  const [analysis, setAnalysis] = useState<NutrientAnalysis | null>(null);
  const [showAlternatives, setShowAlternatives] = useState<string | null>(null);
  const [alternatives, setAlternatives] = useState<any[]>([]);

  // Camera handling
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast.error('Could not access camera. Please allow camera permissions.');
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
            handlePhotoSelected(file);
          }
        }, 'image/jpeg');
      }

      // Stop camera
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoSelected(file);
    }
  };

  const handlePhotoSelected = async (file: File) => {
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setLoading(true);
    setUploadProgress(0);

    try {
      // Upload and analyze photo
      const response = await mealsApi.uploadPhoto(file, (progress) => {
        setUploadProgress(progress);
      });

      if (response.success && response.data) {
        setPhotoUrl(response.data.photoUrl);
        setDetectedFoods(response.data.detectedFoods || []);

        // Initialize portions
        const portions: Record<string, number> = {};
        response.data.detectedFoods?.forEach((food: DetectedFood) => {
          portions[food.foodId] = food.defaultPortionGrams;
        });
        setFoodPortions(portions);

        setStep('detected');
        toast.success(`Detected ${response.data.detectedFoods?.length || 0} foods!`);
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to analyze photo. Please try again.');
      setStep('capture');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const adjustPortion = (foodId: string, delta: number) => {
    setFoodPortions((prev) => ({
      ...prev,
      [foodId]: Math.max(10, Math.min(1000, prev[foodId] + delta)),
    }));
  };

  const analyzeNutrients = async () => {
    setLoading(true);

    try {
      const foods = detectedFoods.map((food) => ({
        foodId: food.foodId,
        portionGrams: foodPortions[food.foodId],
      }));

      const response = await mealsApi.analyzeNutrients(foods);

      if (response.success && response.data) {
        setAnalysis(response.data);
        setStep('analysis');
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error('Failed to analyze nutrients');
    } finally {
      setLoading(false);
    }
  };

  const loadAlternatives = async (foodId: string) => {
    try {
      const response = await mealsApi.getAlternatives(foodId);
      if (response.success && response.data) {
        setAlternatives(response.data.alternatives || []);
        setShowAlternatives(foodId);
      }
    } catch (error) {
      console.error('Alternatives error:', error);
      toast.error('Failed to load alternatives');
    }
  };

  const logMeal = async () => {
    if (!analysis) return;

    setLoading(true);

    try {
      const foods = detectedFoods.map((food) => ({
        foodId: food.foodId,
        portionGrams: foodPortions[food.foodId],
      }));

      const response = await mealsApi.logMeal({
        photoUrl,
        mealType: 'lunch',
        foods,
      });

      if (response.success) {
        toast.success('Meal logged successfully!');
        navigate('/dashboard');
      }
    } catch (error: any) {
      console.error('Log meal error:', error);
      toast.error('Failed to log meal');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: 'warning' | 'danger') => {
    return severity === 'danger'
      ? 'bg-danger-50 border-danger-500 text-danger-900'
      : 'bg-warning-50 border-warning-500 text-warning-900';
  };

  return (
    <div className="min-h-screen bg-gray-50 safe-bottom">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 safe-top">
        <div className="container-mobile py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard')}
              className="mr-4 tap-target"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Food Analysis</h1>
          </div>
        </div>
      </div>

      {/* Step: Capture Photo */}
      {step === 'capture' && (
        <div className="container-mobile py-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Scan Your Meal
            </h2>
            <p className="text-gray-600">
              Take a photo or upload an image of your food
            </p>
          </div>

          {/* Camera Preview */}
          <div className="card mb-4 p-0 overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full aspect-video bg-gray-900"
              onLoadedMetadata={() => console.log('Video loaded')}
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={capturePhoto}
              onFocus={startCamera}
              className="btn btn-primary w-full tap-target"
            >
              <Camera className="w-5 h-5 mr-2 inline" />
              Capture Photo
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary w-full tap-target"
            >
              <Upload className="w-5 h-5 mr-2 inline" />
              Upload from Gallery
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && step === 'capture' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm mx-4">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
              <p className="text-gray-900 font-medium mb-2">Analyzing your meal...</p>
              {uploadProgress > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step: Detected Foods */}
      {step === 'detected' && (
        <div className="container-mobile py-6">
          <div className="mb-6">
            <img
              src={photoPreview}
              alt="Your meal"
              className="w-full rounded-2xl shadow-medium"
            />
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Detected Foods ({detectedFoods.length})
          </h2>

          <div className="space-y-3 mb-6">
            {detectedFoods.map((food) => (
              <div key={food.foodId} className="card">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{food.foodName}</h3>
                    <p className="text-sm text-gray-500">{food.category}</p>
                  </div>
                  <button
                    onClick={() =>
                      setDetectedFoods((prev) =>
                        prev.filter((f) => f.foodId !== food.foodId)
                      )
                    }
                    className="text-gray-400 hover:text-danger-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <button
                    onClick={() => adjustPortion(food.foodId, -10)}
                    className="p-2 hover:bg-gray-200 rounded-lg tap-target"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-gray-900">
                    {foodPortions[food.foodId]}g
                  </span>
                  <button
                    onClick={() => adjustPortion(food.foodId, 10)}
                    className="p-2 hover:bg-gray-200 rounded-lg tap-target"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={analyzeNutrients}
            disabled={detectedFoods.length === 0 || loading}
            className="btn btn-primary w-full tap-target"
          >
            {loading ? 'Analyzing...' : 'Analyze Nutrients'}
          </button>
        </div>
      )}

      {/* Step: Analysis Results */}
      {step === 'analysis' && analysis && (
        <div className="container-mobile py-6">
          {/* Safety Status */}
          <div
            className={`card mb-6 ${
              analysis.isSafe
                ? 'bg-primary-50 border-2 border-primary-500'
                : 'bg-danger-50 border-2 border-danger-500'
            }`}
          >
            <div className="flex items-start space-x-3">
              {analysis.isSafe ? (
                <CheckCircle className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-danger-600 flex-shrink-0 mt-1" />
              )}
              <div>
                <h3 className="font-bold text-lg mb-1">
                  {analysis.isSafe ? 'Safe to Eat!' : 'Warning: Exceeds Limits'}
                </h3>
                <p className="text-sm">
                  {analysis.isSafe
                    ? 'This meal is within your daily nutrient limits.'
                    : 'This meal will exceed your daily limits for some nutrients.'}
                </p>
              </div>
            </div>
          </div>

          {/* Warnings */}
          {analysis.warnings.length > 0 && (
            <div className="mb-6 space-y-3">
              {analysis.warnings.map((warning: NutrientWarning, index) => (
                <div
                  key={index}
                  className={`card border-l-4 ${getSeverityColor(warning.severity)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold capitalize">{warning.nutrient}</h4>
                    <span className="text-sm font-bold">
                      {warning.percentOfLimit}%
                    </span>
                  </div>
                  <p className="text-sm mb-2">{warning.message}</p>
                  <div className="text-xs space-y-1">
                    <div>Current: {warning.currentIntake}mg</div>
                    <div>This meal: +{warning.mealAmount}mg</div>
                    <div>Limit: {warning.dailyLimit}mg</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Food Breakdown */}
          <div className="card mb-6">
            <h3 className="font-bold text-gray-900 mb-4">Nutrient Breakdown</h3>
            <div className="space-y-4">
              {analysis.foodBreakdown.map((food) => (
                <div key={food.foodId} className="pb-4 border-b border-gray-200 last:border-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{food.foodName}</h4>
                      <p className="text-sm text-gray-500">{food.portionGrams}g</p>
                    </div>
                    <button
                      onClick={() => loadAlternatives(food.foodId)}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                    >
                      <Lightbulb className="w-4 h-4 mr-1" />
                      Alternatives
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500">K:</span>{' '}
                      <span className="font-medium">{food.nutrients.potassium}mg</span>
                    </div>
                    <div>
                      <span className="text-gray-500">P:</span>{' '}
                      <span className="font-medium">{food.nutrients.phosphorus}mg</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Na:</span>{' '}
                      <span className="font-medium">{food.nutrients.sodium}mg</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {analysis.isSafe ? (
              <button
                onClick={logMeal}
                disabled={loading}
                className="btn btn-primary w-full tap-target"
              >
                {loading ? 'Logging...' : 'Log This Meal'}
              </button>
            ) : (
              <>
                <button
                  onClick={logMeal}
                  disabled={loading}
                  className="btn btn-outline w-full tap-target"
                >
                  Log Anyway
                </button>
                <button
                  onClick={() => setStep('detected')}
                  className="btn btn-secondary w-full tap-target"
                >
                  Adjust Portions
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Alternatives Modal */}
      {showAlternatives && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="bg-white rounded-t-3xl w-full max-h-[80vh] overflow-y-auto safe-bottom">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">Safer Alternatives</h3>
                <button
                  onClick={() => setShowAlternatives(null)}
                  className="tap-target"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {alternatives.map((alt, index) => (
                <div key={index} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-900">{alt.foodName}</h4>
                    <div className="text-right">
                      <div className="text-xs text-primary-600 font-medium">
                        ↓{alt.comparison.potassiumReduction}% K
                      </div>
                      <div className="text-xs text-primary-600 font-medium">
                        ↓{alt.comparison.phosphorusReduction}% P
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{alt.explanation}</p>
                  <button
                    onClick={() => {
                      toast.success('Alternative selected!');
                      setShowAlternatives(null);
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Use This Instead
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
