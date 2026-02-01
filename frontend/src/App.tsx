import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Dashboard from './Dashboard';
import MealMate from './MealMate';
import Profile from './Profile';
import Hydration from './Hydration';
import Badges from './Badges';
import MyMedicine from './MyMedicine';
import Journal from './Journal';

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <Auth setUser={setUser} /> : <Navigate to="/dashboard" />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={user ? <Dashboard user={user} setUser={setUser} logout={handleLogout} /> : <Navigate to="/" />} />
        <Route path="/meals" element={user ? <MealMate user={user} setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/medicine" element={user ? <MyMedicine user={user} setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/profile" element={user ? <Profile user={user} setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/hydration" element={user ? <Hydration user={user} setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/badges" element={user ? <Badges user={user} setUser={setUser} /> : <Navigate to="/" />} />
        <Route path="/journal" element={user ? <Journal user={user} setUser={setUser} /> : <Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;