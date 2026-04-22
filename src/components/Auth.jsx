import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function Auth() {
  const [view, setView] = useState('soft') // 'soft' or 'login'
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSoftOnboarding = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInAnonymously({
      options: { data: { full_name: nickname } }
    })
    if (error) alert(error.message)
    setLoading(false)
  }

  const handleFullLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert("Invalid email or password. Please try again.")
    setLoading(false)
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl space-y-6 max-w-sm w-full border border-slate-100">
      {view === 'soft' ? (
        <form onSubmit={handleSoftOnboarding} className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">Telehealings</h2>
            <p className="text-slate-500 text-sm mt-2">Enter a nickname to browse</p>
          </div>
          <input 
            type="text" placeholder="Nickname" value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            required 
          />
          <div className="flex items-start gap-3">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <label className="text-xs text-slate-600">I agree to the Terms & Conditions.</label>
          </div>
          <button 
            disabled={nickname.length < 3 || !agreed || loading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold disabled:bg-slate-200"
          >
            {loading ? 'Entering...' : 'Continue to Home'}
          </button>
          
          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={() => setView('login')}
              className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              Already have an account? Log In
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={handleFullLogin} className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
            <p className="text-slate-500 text-sm mt-2">Log in to your full account</p>
          </div>
          <input 
            type="email" placeholder="Email Address" value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            required 
          />
          <input 
            type="password" placeholder="Password" value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
            required 
          />
          <button 
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
          <div className="text-center pt-2">
            <button 
              type="button"
              onClick={() => setView('soft')}
              className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
            >
              ← Back to Nickname
            </button>
          </div>
        </form>
      )}
    </div>
  )
}