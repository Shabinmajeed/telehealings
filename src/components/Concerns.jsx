import { useState } from 'react'

const CONCERNS = [
  { id: 'stress', label: 'Stress', icon: '😫' },
  { id: 'anxiety', label: 'Anxiety', icon: '😟' },
  { id: 'sleep', label: 'Sleep', icon: '😴' },
  { id: 'relationships', label: 'Relationships', icon: '💑' },
  { id: 'selfesteem', label: 'Self-Esteem', icon: '✨' },
  { id: 'focus', label: 'Focus', icon: '🎯' },
]

export default function Concerns({ onComplete }) {
  // US-003: First card (stress) selected by default
  const [selected, setSelected] = useState(['stress'])
  const [error, setError] = useState('')

  const toggleConcern = (id) => {
    setError('')
    if (selected.includes(id)) {
      // Allow unselecting, but button will disable if 0 selected
      setSelected(selected.filter(i => i !== id))
    } else {
      // US-003: Restrict to maximum of 3 cards
      if (selected.length >= 3) {
        setError('You can select up to 3 primary concerns.')
        return
      }
      setSelected([...selected, id])
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 text-center">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">What's on your mind?</h2>
      <p className="text-slate-500 mb-8">Select up to 3 concerns to help us personalize your journey.</p>

      <div className="grid grid-cols-2 gap-4">
        {CONCERNS.map((concern) => (
          <button
            key={concern.id}
            type="button"
            onClick={() => toggleConcern(concern.id)}
            className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 relative ${
              selected.includes(concern.id)
                ? 'border-blue-600 bg-blue-50 shadow-md scale-[1.02]'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            {/* US-003: Clear "active" state with checkmark icon */}
            {selected.includes(concern.id) && (
              <span className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-1 text-[10px]">
                ✓
              </span>
            )}
            <span className="text-3xl">{concern.icon}</span>
            <span className={`font-semibold ${selected.includes(concern.id) ? 'text-blue-700' : 'text-slate-600'}`}>
              {concern.label}
            </span>
          </button>
        ))}
      </div>

      {/* US-003: Subtle error message for 4th card attempt */}
      <div className="h-6 mt-4">
        {error && <p className="text-red-500 text-xs font-medium animate-pulse">{error}</p>}
      </div>

      <button
        disabled={selected.length === 0}
        onClick={() => onComplete(selected)}
        className={`w-full mt-4 py-4 rounded-2xl font-bold transition-all ${
          selected.length > 0 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-blue-700' 
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        Continue to Dashboard
      </button>
    </div>
  )
}