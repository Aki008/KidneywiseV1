import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import BottomNav from './components/BottomNav';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import FoodAnalysisPage from './pages/FoodAnalysisPage';
import MealsHistoryPage from './pages/MealsHistoryPage';
import SymptomsPage from './pages/SymptomsPage';
import KidneyDietAnalyzerPage from './pages/KidneyDietAnalyzerPage';
import SnakeGamePage from './pages/SnakeGamePage';

// Protected Route wrapper with bottom nav
function ProtectedRoute({ children, showBottomNav = true }: { children: React.ReactNode; showBottomNav?: boolean }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      {children}
      {showBottomNav && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/kidney-diet-analyzer" element={<KidneyDietAnalyzerPage />} />
          <Route path="/snake-game" element={<SnakeGamePage />} />

          {/* Protected routes */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute showBottomNav={false}>
                <OnboardingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/food-analysis"
            element={
              <ProtectedRoute>
                <FoodAnalysisPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/meals-history"
            element={
              <ProtectedRoute>
                <MealsHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/symptoms"
            element={
              <ProtectedRoute>
                <SymptomsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;
