import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { useState } from 'react';

function App() {
  // Simple auth state check (User object in localStorage)
  const [user, setUser] = useState(localStorage.getItem('user'));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard"/> : <Navigate to="/login"/>} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register setUser={setUser} />} />
        <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login"/>} />
      </Routes>
    </BrowserRouter>
  )
}
export default App;