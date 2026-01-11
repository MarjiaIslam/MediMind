import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MealMate from './components/MealMate';
import Settings from './components/Settings'; // ← Add this

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meals" element={<MealMate />} />
        <Route path="/settings" element={<Settings />} /> {/* ← Add this */}
      </Routes>
    </Router>
  );
}

export default App;