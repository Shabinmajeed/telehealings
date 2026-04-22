import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function PhoneVerification({ onVerifySuccess, onClose }) {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState('phone') 
  const [timer, setTimer] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let interval
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [timer])

  const handleSendOtp = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({ 
      phone: `${countryCode}${phoneNumber}` 
    })
    if (error) {
      setError(error.message)
    } else {
      setStep('otp')
      setTimer(60) 
    }
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.verifyOtp({
      phone: `${countryCode}${phoneNumber}`,
      token: otp,
      type: 'sms',
    })
    if (error) setError("Invalid OTP. Please try again.")
    else if (data.session) onVerifySuccess()
    setLoading(false)
  }

  const handleSocialLogin = async (provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: window.location.origin }
    })
    if (error) alert(`Unable to connect to ${provider}.`)
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">
          {step === 'phone' ? 'Verify Phone' : 'Enter Code'}
        </h2>
        
        {step === 'phone' ? (
          <div className="space-y-4 mt-6">
            <div className="flex gap-2">
              <select 
                value={countryCode} 
                onChange={(e) => setCountryCode(e.target.value)}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-sm font-bold"
              >
                <option value="+91">🇮🇳 +91</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
              </select>
              <input 
                type="tel" 
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              />
            </div>
            <button 
              disabled={phoneNumber.length < 10 || loading}
              onClick={handleSendOtp}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl disabled:bg-slate-200 transition-all"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            <input 
              type="text" placeholder="6-digit code" maxLength={6}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center text-2xl font-bold tracking-widest outline-none"
              onChange={(e) => setOtp(e.target.value)}
            />
            <button 
              disabled={otp.length < 6 || loading}
              onClick={handleVerifyOtp}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl disabled:bg-slate-200 transition-all"
            >
              Verify & Continue
            </button>
            <button disabled={timer > 0} onClick={handleSendOtp} className="w-full text-xs font-bold text-blue-600 disabled:text-slate-300">
              {timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
            </button>
          </div>
        )}

        {/* Social Options - Always visible at the bottom as per US-006 */}
        <div className="relative py-6">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
            <span className="bg-white px-4 italic">Or continue with</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => handleSocialLogin('google')} className="flex-1 py-3 border border-slate-200 rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-slate-50 transition-all">
            <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" /> Google
          </button>
          <button onClick={() => handleSocialLogin('apple')} className="flex-1 py-3 bg-black text-white rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:bg-zinc-800 transition-all">
            <img src="https://appleid.cdn-apple.com/appleauth/static/bin/cb152244543/dist/assets/apple-logo.svg" className="w-4 h-4 invert" alt="Apple" /> Apple
          </button>
        </div>

        {error && <p className="text-red-500 text-xs mt-4 text-center font-medium">{error}</p>}

        <button onClick={onClose} className="w-full mt-6 text-xs font-bold text-slate-300 uppercase tracking-widest hover:text-slate-500 transition-colors">
          Not now
        </button>
      </div>
    </div>
  )
}