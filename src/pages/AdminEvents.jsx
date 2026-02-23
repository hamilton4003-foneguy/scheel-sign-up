// AdminEvents.jsx

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const initialForm = {
    title: '',
    description: '',
    location: 'The Park',
    event_start: '',
    event_end: '',
    registration_open: '',
    registration_close: '',
    cost: 0.00,
    max_capacity: 50
  };
  
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetches events AND "joins" the registrations + dependents tables
  async function fetchEvents() {
    setLoading(true);
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        registrations (
          id,
          dependents (
            name,
            shirt_size
          )
        )
      `)
      .order('event_start', { ascending: true });

    if (error) console.error("Error fetching events:", error);
    else setEvents(data || []);
    setLoading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      const { error } = await supabase.from('events').update(formData).eq('id', editingId);
      if (error) alert(error.message);
      else {
        setEditingId(null);
        setFormData(initialForm);
        fetchEvents();
      }
    } else {
      const { error } = await supabase.from('events').insert([formData]);
      if (error) alert(error.message);
      else {
        setFormData(initialForm);
        fetchEvents();
      }
    }
  }

  const startEdit = (event) => {
    setEditingId(event.id);
    // Formatting ISO strings to YYYY-MM-DDTHH:MM for HTML inputs
    setFormData({
      title: event.title,
      description: event.description,
      location: event.location,
      event_start: event.event_start?.substring(0, 16),
      event_end: event.event_end?.substring(0, 16),
      registration_open: event.registration_open?.substring(0, 16),
      registration_close: event.registration_close?.substring(0, 16),
      cost: event.cost,
      max_capacity: event.max_capacity
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  async function deleteEvent(id) {
    if (confirm("Permanently delete this event and all associated registrations?")) {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) alert(error.message);
      else fetchEvents();
    }
  }

  // Add this helper function inside your AdminEvents component
const downloadRoster = (event) => {
  if (!event.registrations || event.registrations.length === 0) {
    alert("No registrations to export!");
    return;
  }

  // 1. Create the CSV Header
  const headers = ["Child Name", "Shirt Size", "Registration Date"];
  
  // 2. Map the data into rows
const rows = event.registrations.map(reg => [
  reg.dependents?.name,
  reg.dependents?.shirt_size,
  reg.dependents?.grade,  // New
  reg.dependents?.school, // New
  reg.dependents?.notes,  // New (Great for allergies!)
  new Date(event.created_at).toLocaleDateString()
]);

  // 3. Combine into a single string
  const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");

  // 4. Create a download link and trigger it
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${event.title.replace(/\s+/g, '_')}_Roster.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};



  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          {editingId ? '📝 Edit Event' : '📅 Event Manager'}
        </h1>
        {editingId && (
          <button 
            onClick={() => {setEditingId(null); setFormData(initialForm);}} 
            className="text-gray-500 hover:text-gray-700 font-medium underline"
          >
            Cancel Edit
          </button>
        )}
      </div>
      
      {/* EVENT EDITOR FORM */}
      <form onSubmit={handleSubmit} className={`p-6 rounded-2xl shadow-sm border mb-12 transition-all ${editingId ? 'bg-orange-50 border-orange-200' : 'bg-white border-gray-200'}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="text-sm font-bold text-gray-700">Event Title</label>
            <input className="w-full border-2 border-gray-100 p-2 rounded-lg mt-1 focus:border-blue-500 outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-bold text-gray-700">Description</label>
            <textarea className="w-full border-2 border-gray-100 p-2 rounded-lg mt-1 focus:border-blue-500 outline-none" rows="2" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700">Event Start</label>
            <input type="datetime-local" className="w-full border-2 border-gray-100 p-2 rounded-lg mt-1" value={formData.event_start} onChange={e => setFormData({...formData, event_start: e.target.value})} required />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700">Event End</label>
            <input type="datetime-local" className="w-full border-2 border-gray-100 p-2 rounded-lg mt-1" value={formData.event_end} onChange={e => setFormData({...formData, event_end: e.target.value})} required />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700">Registration Opens</label>
            <input type="datetime-local" className="w-full border-2 border-gray-100 p-2 rounded-lg mt-1" value={formData.registration_open} onChange={e => setFormData({...formData, registration_open: e.target.value})} required />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700">Registration Closes</label>
            <input type="datetime-local" className="w-full border-2 border-gray-100 p-2 rounded-lg mt-1" value={formData.registration_close} onChange={e => setFormData({...formData, registration_close: e.target.value})} required />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700">Cost ($)</label>
            <input type="number" step="0.01" className="w-full border-2 border-gray-100 p-2 rounded-lg mt-1" value={formData.cost} onChange={e => setFormData({...formData, cost: e.target.value})} />
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700">Max Capacity</label>
            <input type="number" className="w-full border-2 border-gray-100 p-2 rounded-lg mt-1" value={formData.max_capacity} onChange={e => setFormData({...formData, max_capacity: e.target.value})} required />
          </div>
        </div>

        <button className={`w-full mt-8 py-4 rounded-xl font-black text-white uppercase tracking-widest transition-all ${editingId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100'}`}>
          {editingId ? 'Update Event Details' : 'Publish New Event'}
        </button>
      </form>

      {/* LIVE EVENTS & ROSTERS */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Live Events & Rosters</h2>
      
      {loading ? (
        <p className="text-gray-500 animate-pulse">Loading events and rosters...</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-white">
                <div>
                  <h3 className="text-xl font-bold text-blue-900">{event.title}</h3>
                  <p className="text-sm text-gray-500 font-medium">
                    {new Date(event.event_start).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })} — {event.location}
                  </p>
                </div>
                <div className="flex gap-2 mt-4 md:mt-0">
                  <button onClick={() => startEdit(event)} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm border border-blue-100 hover:bg-blue-100">Edit</button>
                  <button onClick={() => deleteEvent(event.id)} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm border border-red-100 hover:bg-red-100">Delete</button>

                  
<button 
  onClick={() => downloadRoster(event)} 
  className="bg-green-50 text-green-600 px-4 py-2 rounded-lg font-bold text-sm border border-green-100 hover:bg-green-100"
>
  📥 Download Roster
</button>
                </div>
              </div>

              {/* ROSTER SECTION */}
              <div className="p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                    Current Roster ({event.registrations?.length || 0} / {event.max_capacity})
                  </h4>
                  <div className="h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500" 
                      style={{ width: `${Math.min((event.registrations?.length / event.max_capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                {event.registrations && event.registrations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {event.registrations.map(reg => (
                      <div key={reg.id} className="bg-white p-3 rounded-lg border border-gray-200 flex justify-between items-center shadow-sm">
                        <span className="font-bold text-gray-700">{reg.dependents?.name}</span>
                        <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded">
                          {reg.dependents?.shirt_size}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 italic">No participants registered yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}