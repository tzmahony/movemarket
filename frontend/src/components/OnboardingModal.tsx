import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api';
import CityInput from './CityInput';

interface Props {
  onComplete: () => void;
}

type MoveType = 'moving_out' | 'moving_in' | 'settled';

export default function OnboardingModal({ onComplete }: Props) {
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [city, setCity] = useState('');
  const [moveType, setMoveType] = useState<MoveType | ''>('');
  const [moveDate, setMoveDate] = useState('');
  const [saving, setSaving] = useState(false);

  const showDatePicker = moveType === 'moving_out' || moveType === 'moving_in';

  const handleSaveAndContinue = async () => {
    setSaving(true);
    try {
      const data: any = {};
      if (city) data.city = city;
      if (moveType) data.move_type = moveType;
      if (moveDate && showDatePicker) data.move_date = moveDate;
      await updateProfile(data);
      await refreshUser();
    } catch {
      // non-blocking — continue anyway
    } finally {
      setSaving(false);
      setStep(3);
    }
  };

  const goTo = (path: string) => {
    onComplete();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg relative">
        {/* Close / skip button */}
        <button
          onClick={onComplete}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Step dots */}
        <div className="flex justify-center gap-2 pt-6 pb-2">
          {([1, 2, 3] as const).map((s) => (
            <div
              key={s}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                s === step ? 'bg-indigo-600' : s < step ? 'bg-indigo-300' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="px-8 pb-8 pt-4">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="text-center">
              <div className="text-6xl mb-4">📦</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to MoveMarket!</h2>
              <p className="text-gray-500 mb-8">
                The marketplace built for people on the move. In 2 quick steps we'll get you set up.
              </p>
              <button
                onClick={() => setStep(2)}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-lg"
              >
                Let's Get Started →
              </button>
            </div>
          )}

          {/* Step 2: Your Move */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Tell us about your move</h2>
              <p className="text-gray-500 text-sm mb-6">
                This helps us show you the most relevant listings and people.
              </p>

              <div className="space-y-5">
                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <CityInput value={city} onChange={setCity} placeholder="Your current or destination city" />
                </div>

                {/* Move Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Move Status</label>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { value: 'moving_out', label: 'Moving Out', emoji: '🚚' },
                      { value: 'moving_in', label: 'Moving In', emoji: '🏠' },
                      { value: 'settled', label: 'Settled', emoji: '✅' },
                    ] as { value: MoveType; label: string; emoji: string }[]).map(({ value, label, emoji }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setMoveType(value)}
                        className={`flex flex-col items-center gap-1.5 p-3 border-2 rounded-lg transition-colors text-sm font-medium ${
                          moveType === value
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-xl">{emoji}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Move Date — only for moving in/out */}
                {showDatePicker && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Move Date</label>
                    <input
                      type="date"
                      value={moveDate}
                      onChange={(e) => setMoveDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleSaveAndContinue}
                  disabled={saving}
                  className="flex-1 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save & Continue'}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Ready */}
          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">You're all set! 🎉</h2>
              <p className="text-gray-500 text-sm mb-6">Here's what you can do:</p>

              <div className="space-y-3">
                <button
                  onClick={() => goTo('/listings/new')}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-left group"
                >
                  <span className="text-2xl">🏷️</span>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-indigo-700">Create a Listing</p>
                    <p className="text-sm text-gray-500">Sell items you no longer need</p>
                  </div>
                </button>

                <button
                  onClick={() => goTo('/listings')}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-left group"
                >
                  <span className="text-2xl">🛍️</span>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-indigo-700">Browse Items</p>
                    <p className="text-sm text-gray-500">Find deals from people moving out</p>
                  </div>
                </button>

                <button
                  onClick={() => goTo('/moves/new')}
                  className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-left group"
                >
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-indigo-700">Post Your Move</p>
                    <p className="text-sm text-gray-500">Connect with others in your area</p>
                  </div>
                </button>
              </div>

              <div className="text-center mt-6">
                <button
                  onClick={() => goTo('/dashboard')}
                  className="text-sm text-gray-400 hover:text-indigo-600 transition-colors underline"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
