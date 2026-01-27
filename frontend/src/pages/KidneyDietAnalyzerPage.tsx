import { useMemo, useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const prettyJson = (data: unknown) => JSON.stringify(data, null, 2);

type Candidate = {
  name: string;
  confidence?: string | number;
  rationale?: string;
};

export default function KidneyDietAnalyzerPage() {
  const [activeTab, setActiveTab] = useState<'food' | 'voice' | 'menu'>('food');

  // Food photo state
  const [foodImage, setFoodImage] = useState<File | null>(null);
  const [foodContext, setFoodContext] = useState('');
  const [foodCandidates, setFoodCandidates] = useState<Candidate[]>([]);
  const [selectedDish, setSelectedDish] = useState('');
  const [portionDescription, setPortionDescription] = useState('');
  const [foodResult, setFoodResult] = useState<any>(null);
  const [nutrientResult, setNutrientResult] = useState<any>(null);

  // Voice state
  const [transcript, setTranscript] = useState('');
  const [voiceResult, setVoiceResult] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);

  // Menu state
  const [menuImage, setMenuImage] = useState<File | null>(null);
  const [menuContext, setMenuContext] = useState('');
  const [ckdStage, setCkdStage] = useState('');
  const [dialysis, setDialysis] = useState('no');
  const [menuResult, setMenuResult] = useState<any>(null);

  const disclaimer = useMemo(
    () =>
      'This is an estimate and not medical advice. Confirm with your clinician or dietitian.',
    [],
  );

  const canIdentifyFood = Boolean(foodImage);
  const canCompute = Boolean(selectedDish && portionDescription);
  const canAnalyzeVoice = Boolean(transcript.trim());
  const canAnalyzeMenu = Boolean(menuImage);

  const handleIdentifyFood = async () => {
    if (!foodImage) return;
    const formData = new FormData();
    formData.append('image', foodImage);
    if (foodContext) formData.append('optional_context_text', foodContext);

    const response = await fetch(`${API_BASE_URL}/identify_food`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    setFoodResult(data);
    setFoodCandidates(data.candidates || []);
  };

  const handleComputeNutrients = async () => {
    if (!selectedDish || !portionDescription) return;
    const response = await fetch(`${API_BASE_URL}/compute_nutrients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        confirmed_dish_name: selectedDish,
        portion_description: portionDescription,
        optional_clarifications: foodContext || undefined,
      }),
    });
    const data = await response.json();
    setNutrientResult(data);
  };

  const handleVoiceMeal = async () => {
    if (!transcript) return;
    const response = await fetch(`${API_BASE_URL}/voice_meal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript }),
    });
    const data = await response.json();
    setVoiceResult(data);
  };

  const handleMenuSuggestions = async () => {
    if (!menuImage) return;
    const formData = new FormData();
    formData.append('image', menuImage);
    if (menuContext) formData.append('optional_context_text', menuContext);
    formData.append(
      'user_profile',
      JSON.stringify({ ckd_stage: ckdStage || undefined, dialysis }),
    );

    const response = await fetch(`${API_BASE_URL}/menu_suggestions`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    setMenuResult(data);
  };

  const startRecording = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const spoken = event.results[0][0].transcript;
      setTranscript(spoken);
    };
    recognition.start();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-white safe-bottom">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-primary-600 font-semibold">Kidney Diet Analyzer MVP</p>
          <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900">Analyze meals in seconds</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Snap a photo, speak your meal, or scan a menu. {disclaimer}
          </p>
        </div>

        <div className="mt-6 bg-white shadow-sm rounded-2xl p-2 flex gap-2 sticky top-3 z-10">
          {(['food', 'voice', 'menu'] as const).map((tab) => (
            <button
              key={tab}
              className={`flex-1 px-3 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === tab
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-600'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'food' && 'Food Photo'}
              {tab === 'voice' && 'Voice Meal'}
              {tab === 'menu' && 'Menu Photo'}
            </button>
          ))}
        </div>

        {activeTab === 'food' && (
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Upload food photo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 text-sm"
                  onChange={(event) => setFoodImage(event.target.files?.[0] || null)}
                />
                <p className="text-xs text-gray-500">Tip: brighter images improve accuracy.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Optional context</label>
                <input
                  type="text"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2"
                  placeholder="e.g., home-cooked, no added salt"
                  value={foodContext}
                  onChange={(event) => setFoodContext(event.target.value)}
                />
              </div>
              <button className="btn btn-primary w-full" onClick={handleIdentifyFood} disabled={!canIdentifyFood}>
                Identify Dish Candidates
              </button>
            </div>

            {foodCandidates.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm p-6 space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">Select a dish</h2>
                <div className="space-y-2">
                  {foodCandidates.map((candidate) => (
                    <label key={candidate.name} className="flex items-center gap-2 text-sm text-gray-700">
                      <input
                        type="radio"
                        name="dish"
                        value={candidate.name}
                        checked={selectedDish === candidate.name}
                        onChange={() => setSelectedDish(candidate.name)}
                      />
                      {candidate.name} ({candidate.confidence ?? 'n/a'})
                      {candidate.rationale ? ` - ${candidate.rationale}` : ''}
                    </label>
                  ))}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Portion description</label>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2"
                    placeholder="e.g., 1 cup, 2 slices, 150g"
                    value={portionDescription}
                    onChange={(event) => setPortionDescription(event.target.value)}
                  />
                </div>
                <button className="btn btn-primary w-full" onClick={handleComputeNutrients} disabled={!canCompute}>
                  Compute Nutrients
                </button>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {foodResult && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Identify Response</h3>
                  <pre className="text-xs bg-gray-50 p-3 rounded-xl overflow-auto max-h-64">
                    {prettyJson(foodResult)}
                  </pre>
                </div>
              )}

              {nutrientResult && (
                <div className="bg-white rounded-2xl shadow-sm p-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Nutrient Estimate</h3>
                  <pre className="text-xs bg-gray-50 p-3 rounded-xl overflow-auto max-h-64">
                    {prettyJson(nutrientResult)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <button className="btn btn-primary w-full sm:w-auto" onClick={startRecording}>
                  {isRecording ? 'Recording…' : 'Start Voice Input'}
                </button>
                <p className="text-xs text-gray-500">
                  iOS Safari may not support speech recognition — you can type below.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transcript</label>
                <textarea
                  className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2 min-h-[120px]"
                  value={transcript}
                  onChange={(event) => setTranscript(event.target.value)}
                  placeholder="e.g., I had a grilled chicken sandwich with a side salad"
                />
              </div>
              <button className="btn btn-secondary w-full" onClick={handleVoiceMeal} disabled={!canAnalyzeVoice}>
                Analyze Voice Meal
              </button>
            </div>

            {voiceResult && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Voice Result</h3>
                <pre className="text-xs bg-gray-50 p-3 rounded-xl overflow-auto max-h-72">
                  {prettyJson(voiceResult)}
                </pre>
              </div>
            )}
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="mt-6 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Upload menu photo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="mt-1 text-sm"
                  onChange={(event) => setMenuImage(event.target.files?.[0] || null)}
                />
                <p className="text-xs text-gray-500">Try a flat photo with minimal glare.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Optional context</label>
                <input
                  type="text"
                  className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2"
                  placeholder="e.g., lunch menu, seafood restaurant"
                  value={menuContext}
                  onChange={(event) => setMenuContext(event.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">CKD Stage (optional)</label>
                  <input
                    type="text"
                    className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2"
                    placeholder="e.g., Stage 3"
                    value={ckdStage}
                    onChange={(event) => setCkdStage(event.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dialysis</label>
                  <select
                    className="mt-2 w-full rounded-xl border border-gray-200 px-3 py-2"
                    value={dialysis}
                    onChange={(event) => setDialysis(event.target.value)}
                  >
                    <option value="no">No</option>
                    <option value="yes">Yes</option>
                  </select>
                </div>
              </div>
              <button className="btn btn-primary w-full" onClick={handleMenuSuggestions} disabled={!canAnalyzeMenu}>
                Extract Menu + Suggest Options
              </button>
            </div>

            {menuResult && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Menu Suggestions</h3>
                <pre className="text-xs bg-gray-50 p-3 rounded-xl overflow-auto max-h-72">
                  {prettyJson(menuResult)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
