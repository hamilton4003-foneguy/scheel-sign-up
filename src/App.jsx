import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AdminEvents from './pages/AdminEvents';

// ... other imports
import SignUp from './pages/SignUp';

// new committ 10:12pm

function App() {
  return (
    <Router>
      <nav className="bg-white shadow-md p-4 flex justify-center gap-8 mb-6">
        <Link to="/" className="text-blue-600 font-bold">🏠 My Family</Link>
        <Link to="/signup" className="text-purple-600 font-bold">📝 Event Sign-Up</Link>
        <Link to="/admin" className="text-green-600 font-bold">⚙️ Admin</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/admin" element={<AdminEvents />} />
      </Routes>
    </Router>
  );
}
export default App;