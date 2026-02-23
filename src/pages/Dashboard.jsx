import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [dependents, setDependents] = useState([]);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchUserAndFamily();
  }, []);

  async function fetchUserAndFamily() {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get Profile
    let { data: prof } = await supabase.from('profiles').select('*').single();
    setProfile(prof);

    // Get Kids/Dependents
    let { data: deps } = await supabase.from('dependents').select('*');
    setDependents(deps || []);
  }

  async function addDependent(e) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase
      .from('dependents')
      .insert([{ name: newName, parent_id: user.id }]);

    if (!error) {
      setNewName('');
      fetchUserAndFamily(); // Refresh list
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Welcome, {profile?.full_name}</h1>
      
      <section className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Family Members</h2>
        <ul className="space-y-3 mb-6">
          {dependents.map(kid => (
            <li key={kid.id} className="p-3 border rounded-md flex justify-between bg-gray-50">
              <span>{kid.name}</span>
              <span className="text-sm text-gray-500">Dependent</span>
            </li>
          ))}
          {dependents.length === 0 && <p className="text-gray-400">No kids added yet.</p>}
        </ul>

        <form onSubmit={addDependent} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Kid's Name" 
            className="border p-2 rounded w-full"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Add Child
          </button>
        </form>
      </section>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold mb-2 text-blue-800">Ready to Register?</h2>
        <p className="mb-4">Browse upcoming park events and sign up yourself or your kids.</p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded font-bold">Browse Events</button>
      </div>
    </div>
  );
}