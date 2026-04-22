    export default function AppointmentCard({ appointment, role }) {
    console.log("Card Data:", appointment); // Add this line
  const isTherapist = role === 'therapist';
  
  return (
    <div className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {isTherapist ? "Patient ID" : "Therapist ID"}
          </p>
          <p className="font-medium text-slate-800">
            {isTherapist ? appointment.patient?.full_name : appointment.therapist?.full_name || "Assigned Therapist"}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {appointment.status}
        </span>
      </div>
      
      <div className="flex items-center gap-3 text-slate-600 mb-4">
        <span className="text-sm">📅 {new Date(appointment.appointment_time).toLocaleString()}</span>
      </div>

      {isTherapist && appointment.status === 'pending' && (
        <div className="flex gap-2">
          <button className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Confirm
          </button>
          <button className="flex-1 border border-slate-200 py-2 rounded-lg text-sm font-medium hover:bg-slate-50">
            Decline
          </button>
        </div>
      )}
    </div>
  )
}