// Dashboard.jsx
// Dashboard.jsx

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [dependents, setDependents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    birth_date: '',
    grade: '',
    school: '',
    gender: 'Male',
    shirt_size: '',
    notes: ''
  });

  useEffect(() => {
    fetchUserAndFamily();
  }, []);

  async function fetchUserAndFamily() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // 1. Try to get the profile
  let { data: prof, error: profError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // 2. If profile doesn't exist (406 or no data), create it now
  if (!prof || profError) {
    console.log("Profile missing, creating one now...");
    const { data: newProf } = await supabase
      .from('profiles')
      .insert([{ id: user.id, full_name: user.email.split('@')[0] }])
      .select()
      .single();
    setProfile(newProf);
  } else {
    setProfile(prof);
  }

  // 3. Get Kids
  let { data: deps } = await supabase
    .from('dependents')
    .select('*')
    .eq('parent_id', user.id)
    .order('created_at', { ascending: true });

  setDependents(deps || []);
}

  const startEdit = (kid) => {
    setEditingId(kid.id);
    setFormData({
      name: kid.name || '',
      birth_date: kid.birth_date || '',
      grade: kid.grade || '',
      school: kid.school || '',
      gender: kid.gender || 'Male',
      shirt_size: kid.shirt_size || '',
      notes: kid.notes || ''
    });
    // Smooth scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function handleSubmit(e) {
  e.preventDefault();
  console.log("🚀 Submit button clicked!");
  console.log("Current Form Data:", formData);

  // 1. Get the session (Faster/Local)
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error("❌ Session Error:", sessionError.message);
  }

  // 2. Double check with getUser (Secure/Server-side)
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError) {
    console.error("❌ Auth Error:", authError.message);
  }

  // Debug logs for user
  console.log("Auth User Object:", user);
  console.log("User ID:", user?.id);

  if (!user) {
    console.error("🛑 CRITICAL: No user found in Supabase session.");
    alert("Your session has expired or you are not logged in properly. Please try logging in again.");
    return;
  }

  // Calculate Age
  let calculatedAge = null;
  if (formData.birth_date) {
    const birthDate = new Date(formData.birth_date);
    const today = new Date();
    calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
  }

  const payload = { 
    ...formData, 
    parent_id: user.id, 
    age: calculatedAge 
  };

  console.log("📤 Sending Payload to Supabase:", payload);

  if (editingId) {
    console.log("Mode: UPDATE, Target ID:", editingId);
    const { data, error } = await supabase
      .from('dependents')
      .update(payload)
      .eq('id', editingId)
      .select(); // Ask for data back to confirm success

    if (error) {
      console.error("❌ Update Database Error:", error);
      alert(`Update failed: ${error.message}`);
    } else {
      console.log("✅ Update Success:", data);
      finishTransaction();
    }
  } else {
    console.log("Mode: INSERT");
    const { data, error } = await supabase
      .from('dependents')
      .insert([payload])
      .select();

    if (error) {
      console.error("❌ Insert Database Error:", error);
      alert(`Insert failed: ${error.message}`);
    } else {
      console.log("✅ Insert Success:", data);
      finishTransaction();
    }
  }
}

  function finishTransaction() {
    setEditingId(null);
    setFormData({ name: '', birth_date: '', grade: '', school: '', gender: 'Male', shirt_size: '', notes: '' });
    fetchUserAndFamily();
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Welcome, {profile?.full_name || 'Family Member'}
      </h1>

      <section className="bg-white p-6 rounded-2xl shadow-md mb-8 border border-gray-100">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Your Family Members</h2>

        {/* LIST OF DEPENDENTS */}
        <ul className="space-y-3 mb-8">
          {dependents.map(kid => (
            <li key={kid.id} className="p-4 border rounded-xl flex justify-between items-center bg-gray-50 shadow-sm transition hover:shadow-md">
              <div>
                <span className="font-bold text-gray-800 text-lg">{kid.name}</span>
                <div className="text-xs text-gray-500 uppercase tracking-widest mt-1">
                  {kid.shirt_size || 'No Size'} • {kid.grade || 'No Grade'} • Age: {kid.age || 'N/A'}
                </div>
              </div>
              <button
                onClick={() => startEdit(kid)}
                className="text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 transition"
              >
                Edit
              </button>
            </li>
          ))}
          {dependents.length === 0 && (
            <p className="text-gray-400 italic">No family members added yet. Use the form below to get started.</p>
          )}
        </ul>

        {/* ADD / EDIT FORM */}
        <div className="border-t pt-8">
          <h3 className="text-lg font-bold mb-4 text-gray-800">
            {editingId ? '📝 Update Child Details' : '➕ Add a New Family Member'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 ml-1">Full Name</label>
                <input
                  type="text" placeholder="Child's Name" required
                  className="w-full border p-3 rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 ml-1">Birth Date</label>
                <input
                  type="date"
                  className="w-full border p-3 rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.birth_date}
                  onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 ml-1">Gender</label>
                <select
                  className="w-full border p-3 rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.gender}
                  onChange={e => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 ml-1">Shirt Size</label>
                <select
                  className="w-full border p-3 rounded-xl mt-1 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.shirt_size}
                  onChange={e => setFormData({ ...formData, shirt_size: e.target.value })}
                  required
                >
                  <option value="">-- Select Size --</option>
                  <option value="YS">Youth Small</option>
                  <option value="YM">Youth Medium</option>
                  <option value="YL">Youth Large</option>
                  <option value="AS">Adult Small</option>
                  <option value="AM">Adult Medium</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 ml-1">Grade</label>
                <input
                  type="text" placeholder="e.g. 2nd Grade"
                  className="w-full border p-3 rounded-xl mt-1"
                  value={formData.grade}
                  onChange={e => setFormData({ ...formData, grade: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 ml-1">School</label>
                <input
                  type="text" placeholder="School Name"
                  className="w-full border p-3 rounded-xl mt-1"
                  value={formData.school}
                  onChange={e => setFormData({ ...formData, school: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 ml-1">Medical Notes / Allergies</label>
              <textarea
                placeholder="List any important medical info or allergies..."
                className="w-full border p-3 rounded-xl mt-1 h-24"
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="submit"
                className={`w-full text-white font-black py-4 rounded-xl transition-all transform active:scale-95 shadow-lg ${editingId ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-100' : 'bg-green-600 hover:bg-green-700 shadow-green-100'}`}
              >
                {editingId ? 'SAVE CHANGES' : 'ADD FAMILY MEMBER'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => finishTransaction()}
                  className="w-full py-2 text-gray-500 text-sm font-semibold hover:text-gray-700"
                >
                  Cancel and Go Back
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 rounded-2xl shadow-xl text-white flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Ready for the event?</h2>
          <p className="text-blue-100">Your family profile is updated. Now, pick an event and sign up!</p>
        </div>
        <button
          onClick={() => window.location.href = '/signup'}
          className="bg-white text-blue-700 px-8 py-3 rounded-xl font-black whitespace-nowrap hover:bg-blue-50 transition"
        >
          BROWSE EVENTS
        </button>
      </div>
    </div>
  );
}
