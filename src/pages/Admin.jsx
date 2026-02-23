import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Admin() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_start: '',
    event_end: '',
    registration_open: '',
    registration_close: '',
    cost: 0,
    max_capacity: 20
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('events')
      .insert([formData]);

    if (error) alert(error.message);
    else {
      alert("Event created successfully!");
      setFormData({ title: '', description: '', event_start: '', event_end: '', registration_open: '', registration_close: '', cost: 0, max_capacity: 20 });
    }
  };

  return (
    <div className="p-10 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Event</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <input className="w-full border p-2" placeholder="Event Title" onChange={e => setFormData({...formData, title: e.target.value})} />
        <textarea className="w-full border p-2" placeholder="Description" onChange={e => setFormData({...formData, description: e.target.value})} />
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm">Event Starts</label>
            <input type="datetime-local" className="w-full border p-2" onChange={e => setFormData({...formData, event_start: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm">Registration Opens</label>
            <input type="datetime-local" className="w-full border p-2" onChange={e => setFormData({...formData, registration_open: e.target.value})} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input type="number" className="w-full border p-2" placeholder="Cost ($)" onChange={e => setFormData({...formData, cost: e.target.value})} />
          <input type="number" className="w-full border p-2" placeholder="Max Capacity" onChange={e => setFormData({...formData, max_capacity: e.target.value})} />
        </div>

        <button type="submit" className="w-full bg-black text-white p-3 rounded font-bold">Create Event</button>
      </form>
    </div>
  );
}