import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, TrendingUp, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface SymptomType {
  id: string;
  name: string;
  displayName: string;
  description: string;
  icon: string;
  requiresMedicalAttention: boolean;
}

interface Symptom {
  symptomId: string;
  symptomType: string;
  displayName: string;
  icon: string;
  severity: number;
  notes: string;
  loggedAt: string;
  requiresMedicalAttention: boolean;
}

interface SymptomStats {
  totalSymptoms: number;
  averageSeverity: number;
  topSymptoms: Array<{
    name: string;
    displayName: string;
    icon: string;
    count: number;
  }>;
  severityDistribution: {
    mild: number;
    moderate: number;
    severe: number;
  };
  requiresAttention: number;
}

export default function SymptomsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'log' | 'stats'>('list');
  const [loading, setLoading] = useState(false);

  const [symptomTypes, setSymptomTypes] = useState<Record<string, SymptomType[]>>({});
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [stats, setStats] = useState<SymptomStats | null>(null);

  // Log symptom form
  const [selectedType, setSelectedType] = useState('');
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadSymptomTypes();
    loadSymptoms();
    loadStats();
  }, []);

  const loadSymptomTypes = async () => {
    try {
      const response = await api.get('/symptoms/types');
      if (response.success && response.data) {
        setSymptomTypes(response.data.symptomTypes);
      }
    } catch (error) {
      console.error('Load symptom types error:', error);
    }
  };

  const loadSymptoms = async () => {
    try {
      const response = await api.get('/symptoms');
      if (response.success && response.data) {
        setSymptoms(response.data.symptoms);
      }
    } catch (error) {
      console.error('Load symptoms error:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await api.get('/symptoms/stats?days=7');
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const handleLogSymptom = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedType) {
      toast.error('Please select a symptom');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/symptoms', {
        symptomType: selectedType,
        severity,
        notes: notes || undefined,
      });

      if (response.success) {
        toast.success('Symptom logged successfully');

        if (response.data?.requiresMedicalAttention) {
          toast.error(
            'This symptom may require medical attention. Please consult your doctor.',
            { duration: 6000 }
          );
        }

        setSelectedType('');
        setSeverity(5);
        setNotes('');
        setView('list');
        loadSymptoms();
        loadStats();
      }
    } catch (error: any) {
      console.error('Log symptom error:', error);
      toast.error('Failed to log symptom');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSymptom = async (id: string) => {
    if (!confirm('Are you sure you want to delete this symptom?')) return;

    try {
      const response = await api.delete(`/symptoms/${id}`);
      if (response.success) {
        toast.success('Symptom deleted');
        loadSymptoms();
        loadStats();
      }
    } catch (error) {
      console.error('Delete symptom error:', error);
      toast.error('Failed to delete symptom');
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-primary-500';
    if (severity <= 6) return 'bg-warning-500';
    return 'bg-danger-500';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 3) return 'Mild';
    if (severity <= 6) return 'Moderate';
    return 'Severe';
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
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 safe-bottom">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 safe-top">
        <div className="container-mobile py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={() => navigate('/dashboard')} className="mr-4 tap-target">
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Symptoms</h1>
            </div>
            <button
              onClick={() => setView('log')}
              className="btn btn-primary py-2 px-4 text-sm"
            >
              <Plus className="w-4 h-4 mr-1 inline" />
              Log
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setView('list')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                view === 'list'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setView('stats')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition ${
                view === 'stats'
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4 mr-1 inline" />
              Stats
            </button>
          </div>
        </div>
      </div>

      {/* Log Symptom View */}
      {view === 'log' && (
        <div className="container-mobile py-6">
          <form onSubmit={handleLogSymptom} className="space-y-6">
            <div className="card">
              <h2 className="text-lg font-bold text-gray-900 mb-4">How are you feeling?</h2>

              {/* Symptom Type Selection */}
              <div className="space-y-4">
                {Object.entries(symptomTypes).map(([category, types]) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 capitalize">
                      {category}
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {types.map((type) => (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => setSelectedType(type.name)}
                          className={`p-3 rounded-xl border-2 text-left transition tap-target ${
                            selectedType === type.name
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-2xl">{type.icon}</span>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {type.displayName}
                              </div>
                              {type.requiresMedicalAttention && (
                                <div className="text-xs text-danger-600">⚠️ Alert</div>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Severity */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Severity: {severity}/10
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {getSeverityLabel(severity)}
              </p>
              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${
                    severity <= 3
                      ? '#10b981'
                      : severity <= 6
                      ? '#f59e0b'
                      : '#ef4444'
                  } 0%, ${
                    severity <= 3
                      ? '#10b981'
                      : severity <= 6
                      ? '#f59e0b'
                      : '#ef4444'
                  } ${(severity / 10) * 100}%, #e5e7eb ${(severity / 10) * 100}%, #e5e7eb 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Mild</span>
                <span>Moderate</span>
                <span>Severe</span>
              </div>
            </div>

            {/* Notes */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Additional Notes (Optional)
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional details..."
                className="input"
                rows={3}
              />
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setView('list')}
                className="btn btn-secondary flex-1 tap-target"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedType || loading}
                className="btn btn-primary flex-1 tap-target"
              >
                {loading ? 'Logging...' : 'Log Symptom'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Symptoms List View */}
      {view === 'list' && (
        <div className="container-mobile py-6">
          {symptoms.length === 0 ? (
            <div className="card text-center py-8">
              <p className="text-gray-600 mb-4">No symptoms logged yet</p>
              <button
                onClick={() => setView('log')}
                className="btn btn-primary"
              >
                <Plus className="w-5 h-5 mr-2 inline" />
                Log Your First Symptom
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {symptoms.map((symptom) => (
                <div
                  key={symptom.symptomId}
                  className={`card ${
                    symptom.requiresMedicalAttention
                      ? 'border-2 border-danger-500 bg-danger-50'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <span className="text-3xl">{symptom.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-gray-900">
                            {symptom.displayName}
                          </h3>
                          <span
                            className={`text-xs px-2 py-1 rounded-full text-white ${getSeverityColor(
                              symptom.severity
                            )}`}
                          >
                            {symptom.severity}/10
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(symptom.loggedAt)}
                        </p>
                        {symptom.notes && (
                          <p className="text-sm text-gray-700 mt-2">
                            {symptom.notes}
                          </p>
                        )}
                        {symptom.requiresMedicalAttention && (
                          <div className="flex items-center space-x-1 mt-2 text-danger-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              May require medical attention
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteSymptom(symptom.symptomId)}
                      className="text-gray-400 hover:text-danger-500 ml-4"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Stats View */}
      {view === 'stats' && stats && (
        <div className="container-mobile py-6 space-y-4">
          {/* Overview */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Last 7 Days Overview
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {stats.totalSymptoms}
                </div>
                <div className="text-sm text-gray-600">Total Symptoms</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">
                  {stats.averageSeverity}
                </div>
                <div className="text-sm text-gray-600">Avg Severity</div>
              </div>
            </div>
          </div>

          {/* Severity Distribution */}
          <div className="card">
            <h3 className="font-bold text-gray-900 mb-4">Severity Distribution</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Mild (1-3)</span>
                  <span className="font-medium">{stats.severityDistribution.mild}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500"
                    style={{
                      width: `${
                        (stats.severityDistribution.mild / stats.totalSymptoms) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Moderate (4-6)</span>
                  <span className="font-medium">{stats.severityDistribution.moderate}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning-500"
                    style={{
                      width: `${
                        (stats.severityDistribution.moderate / stats.totalSymptoms) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Severe (7-10)</span>
                  <span className="font-medium">{stats.severityDistribution.severe}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-danger-500"
                    style={{
                      width: `${
                        (stats.severityDistribution.severe / stats.totalSymptoms) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Top Symptoms */}
          {stats.topSymptoms.length > 0 && (
            <div className="card">
              <h3 className="font-bold text-gray-900 mb-4">Most Common</h3>
              <div className="space-y-3">
                {stats.topSymptoms.map((symptom, index) => (
                  <div
                    key={symptom.name}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{symptom.icon}</span>
                      <span className="font-medium text-gray-900">
                        {symptom.displayName}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-600">
                      {symptom.count}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medical Attention Alert */}
          {stats.requiresAttention > 0 && (
            <div className="card border-2 border-danger-500 bg-danger-50">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-6 h-6 text-danger-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-danger-900 mb-1">
                    Medical Attention Recommended
                  </h3>
                  <p className="text-sm text-danger-800">
                    You've logged {stats.requiresAttention} severe symptom(s) that may
                    require medical attention. Please consult your doctor.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
