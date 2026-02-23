import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function SignUp() {
  const [kids, setKids] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedKid, setSelectedKid] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: kidsData } = await supabase.from('dependents').select('*');
    const { data: eventsData } = await supabase.from('events').select('*');
    setKids(kidsData || []);
    setEvents(eventsData || []);
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (!selectedKid || !selectedEvent) return;

    const { error } = await supabase
      .from('registrations')
      .insert([{ dependent_id: selectedKid, event_id: selectedEvent }]);

    if (error) {
      if (error.code === '23505') {
        setMessage({ text: "This child is already registered for this event!", type: 'error' });
      } else {
        setMessage({ text: error.message, type: 'error' });
      }
    } else {
      setMessage({ text: "Successfully registered!", type: 'success' });
      setSelectedKid('');
      setSelectedEvent('');
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Event Registration</h1>
        
        {message.text && (
          <div className={`p-4 rounded-lg mb-6 text-center font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">1. Select Child</label>
            <select 
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 outline-none transition"
              value={selectedKid}
              onChange={e => setSelectedKid(e.target.value)}
              required
            >
              <option value="">-- Choose a child --</option>
              {kids.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">2. Select Event</label>
            <select 
              className="w-full border-2 border-gray-200 p-3 rounded-xl focus:border-blue-500 outline-none transition"
              value={selectedEvent}
              onChange={e => setSelectedEvent(e.target.value)}
              required
            >
              <option value="">-- Choose an event --</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({new Date(ev.event_start).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-95">
            Complete Registration
          </button>
        </form>
      </div>
    </div>
  );
}