import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import Auth from './components/Auth'
import AppointmentCard from './components/AppointmentCard'
import BookingForm from './components/BookingForm'
import Concerns from './components/Concerns'
import PhoneVerification from './components/PhoneVerification'
import ProfileUpdateModal from './components/ProfileUpdateModal'

function App() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [concerns, setConcerns] = useState(null)
  const [activeTab, setActiveTab] = useState('explore')
  const [therapists, setTherapists] = useState([])
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  
  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('All')
  const [maxPrice, setMaxPrice] = useState(250)
  const [sortBy, setSortBy] = useState('rating')

  const specializations = ['All', 'Anxiety', 'Depression', 'Stress', 'Relationships', 'Sleep', 'Focus', 'Trauma']
  const isAnonymous = session?.user?.is_anonymous;

  async function fetchAppointments(userId) {
    if (isAnonymous) return;
    const { data, error } = await supabase
      .from('appointments')
      .select('*, patient:user_id(full_name), therapist:therapist_id(full_name)')
      .or(`user_id.eq.${userId},therapist_id.eq.${userId}`);
    if (error) console.error('Fetch Error:', error);
    else setAppointments(data || []);
  }

  async function fetchProfile(userId) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    if (data) {
      setProfile(data)
      if (data.concerns && data.concerns.length > 0) setConcerns(data.concerns)
    }
  }

  async function fetchTherapists() {
    let query = supabase.from('therapists').select('*');
    if (selectedTag !== 'All') query = query.contains('specialization', [selectedTag]);
    query = query.lte('hourly_rate', maxPrice);
    if (searchQuery) query = query.ilike('full_name', `%${searchQuery}%`);

    const sortColumn = sortBy === 'rating' ? 'rating' : 'experience_years';
    const { data, error } = await query.order(sortColumn, { ascending: false });

    if (error) console.error('Error fetching therapists:', error);
    else setTherapists(data || []);
  }

  // Trigger fetch when any filter changes
  useEffect(() => {
    fetchTherapists();
  }, [selectedTag, maxPrice, sortBy, searchQuery]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
        fetchAppointments(session.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        fetchProfile(session.user.id)
        fetchAppointments(session.user.id)
      } else {
        setProfile(null); setAppointments([]); setConcerns(null); setLoading(false);
      }
    })
    return () => subscription.unsubscribe()
  }, [isAnonymous])

  const handleProtectedAction = (actionName) => {
    if (isAnonymous) setShowPhoneModal(true) 
    else console.log(`Proceeding to ${actionName}`)
  }

  if (loading) return <div className="p-10 text-center text-slate-400 font-medium">Connecting...</div>
  if (!session) return <div className="min-h-screen flex items-center justify-center p-4"><Auth /></div>
  if (isAnonymous && !concerns) return <div className="min-h-screen flex items-center justify-center p-4"><Concerns onComplete={setConcerns} /></div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        
        {isAnonymous && (
          <div className="mb-6 bg-orange-50 border border-orange-100 p-4 rounded-2xl flex justify-between items-center shadow-sm">
            <p className="text-orange-700 text-sm font-medium">🔒 Verify your account to book sessions.</p>
            <button onClick={() => setShowPhoneModal(true)} className="bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-700 transition-colors">
              Verify Now
            </button>
          </div>
        )}

        <header className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Welcome, {profile?.full_name || 'Guest'}</h1>
            <div className="flex gap-2 mt-3 flex-wrap">
              {concerns?.map((c) => (
                <span key={c} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-blue-100">#{c}</span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!isAnonymous && <button onClick={() => setShowProfileModal(true)} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">✏️ Edit Profile</button>}
            <button onClick={() => supabase.auth.signOut()} className="text-xs text-slate-400 hover:text-red-500 font-bold uppercase">Sign Out</button>
          </div>
        </header>

        <nav className="flex gap-8 mb-8 border-b border-slate-200">
          <button onClick={() => setActiveTab('explore')} className={`pb-4 text-xs font-bold uppercase tracking-widest ${activeTab === 'explore' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>Explore</button>
          <button onClick={() => isAnonymous ? handleProtectedAction('view sessions') : setActiveTab('sessions')} className={`pb-4 text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${activeTab === 'sessions' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>
            {isAnonymous && "🔒"} My Sessions
          </button>
        </nav>

        {activeTab === 'explore' ? (
          <div className="space-y-6">
            {/* Filter UI - Correctly placed inside the tab content */}
            <div className="space-y-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                  <span className="absolute left-4 top-3.5 text-slate-400">🔍</span>
                  <input 
                    type="text" placeholder="Search by name..."
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="p-3 bg-white border border-slate-200 rounded-2xl outline-none text-sm font-bold text-slate-600">
                  <option value="rating">⭐ Top Rated</option>
                  <option value="experience">🎓 Experience</option>
                </select>
              </div>

              <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                {specializations.map((tag) => (
                  <button key={tag} onClick={() => setSelectedTag(tag)} className={`px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap border ${selectedTag === tag ? 'bg-blue-600 text-white' : 'bg-white text-slate-500'}`}>
                    {tag}
                  </button>
                ))}
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Max Price</label>
                  <span className="text-sm font-bold text-blue-600">${maxPrice}</span>
                </div>
                <input type="range" min="50" max="250" step="10" className="w-full cursor-pointer accent-blue-600" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {therapists.map((t) => (
                <div key={t.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex gap-4 items-center mb-4">
                    <img src={t.avatar_url} alt={t.full_name} className="w-16 h-16 rounded-2xl bg-slate-100 object-cover" />
                    <div>
                      <h4 className="font-bold text-slate-800">{t.full_name}</h4>
                      <p className="text-xs text-blue-600 font-semibold">{t.specialization.join(' • ')}</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6">{t.bio}</p>
                  <button onClick={() => handleProtectedAction('book a session')} className="w-full py-3 bg-slate-50 text-slate-700 rounded-xl font-bold text-xs hover:bg-blue-600 hover:text-white transition-all">
                    View Profile & Book
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {appointments.length > 0 ? appointments.map((appt) => <AppointmentCard key={appt.id} appointment={appt} role={profile?.role} />) : (
              <div className="col-span-full py-20 text-center text-slate-300 font-medium bg-white rounded-2xl border-2 border-dashed border-slate-100">No active sessions found.</div>
            )}
          </div>
        )}

        {showPhoneModal && <PhoneVerification onVerifySuccess={() => { setShowPhoneModal(false); fetchProfile(session.user.id); }} onClose={() => setShowPhoneModal(false)} />}
        {showProfileModal && <ProfileUpdateModal profile={profile} onSave={() => { setShowProfileModal(false); fetchProfile(session.user.id); }} onClose={() => setShowProfileModal(false)} />}
      </div>
    </div>
  )
}

export default App