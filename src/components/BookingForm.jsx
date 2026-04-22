import { useState } from 'react'
import { supabase } from '../supabaseClient'

export default function BookingForm({ userId, onBookingSuccess }) {
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleBooking = async (e) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('appointments')
      .insert([
        { 
          user_id: userId, 
          therapist_id: userId, // For now, booking with yourself to test
          appointment_time: date,
          notes: notes,
          status: 'pending'
        }
      ])

    setLoading(false)
    if (error) alert(error.message)
    else {
      alert('Appointment requested!')
      onBookingSuccess() // This will refresh the list!
    }
  }

  return (
    <form onSubmit={handleBooking} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-6">
      <h3 className="text-lg font-bold mb-4">Request a Session</h3>
      <div className="space-y-4">
        <input 
          type="datetime-local" 
          required
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setDate(e.target.value)}
        />
        <textarea 
          placeholder="Reason for visit (optional)"
          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          onChange={(e) => setNotes(e.target.value)}
        />
        <button 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-slate-300"
        >
          {loading ? 'Booking...' : 'Confirm Appointment'}
        </button>
      </div>
    </form>
  )
}