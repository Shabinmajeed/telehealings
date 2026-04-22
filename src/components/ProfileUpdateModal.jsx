import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function ProfileUpdateModal({ profile, onSave, onClose }) {
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    gender: profile?.gender || '',
    dob: profile?.dob || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    // US-009: Restrict special characters in name
    const nameRegex = /^[a-zA-Z\s]*$/;
    if (!nameRegex.test(formData.first_name) || !nameRegex.test(formData.last_name)) {
      alert("Names can only contain letters and spaces.");
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        ...formData,
        full_name: `${formData.first_name} ${formData.last_name}`.trim()
      })
      .eq('id', (await supabase.auth.getUser()).data.user.id);

    if (error) alert(error.message);
    else {
      alert("Profile Updated Successfully!"); // US-009 Requirement
      onSave();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Complete Profile</h2>
          <button onClick={onClose} className="text-slate-400 text-xl">&times;</button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">First Name</label>
              <input 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                value={formData.first_name}
                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Last Name</label>
              <input 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                value={formData.last_name}
                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Gender</label>
            <select 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Non-binary">Non-binary</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Date of Birth</label>
            <input 
              type="date"
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
              value={formData.dob}
              onChange={(e) => setFormData({...formData, dob: e.target.value})}
            />
          </div>

          <button 
            onClick={handleSave}
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all mt-4"
          >
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}