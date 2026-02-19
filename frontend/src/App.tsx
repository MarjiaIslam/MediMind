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
import ProfileSetup from './ProfileSetup';

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

  // Check if profile setup is complete
  const isProfileComplete = (user: any) => {
    return user?.profileSetupComplete === true || 
           (user?.fullName && user?.age && user?.height && user?.weight && user?.gender);
  };

  // Determine where to redirect after login
  const getPostLoginRedirect = () => {
    if (!user) return <Navigate to="/" />;
    if (!isProfileComplete(user)) return <Navigate to="/profile-setup" />;
    return <Navigate to="/dashboard" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={!user ? <Auth setUser={setUser} /> : getPostLoginRedirect()} />
        
        {/* Profile Setup Route - Required before accessing dashboard */}
        <Route path="/profile-setup" element={
          user ? (
            isProfileComplete(user) ? <Navigate to="/dashboard" /> : <ProfileSetup user={user} setUser={setUser} />
          ) : <Navigate to="/" />
        } />
        
        {/* Protected Routes - Require complete profile */}
        <Route path="/dashboard" element={
          user ? (
            isProfileComplete(user) ? <Dashboard user={user} setUser={setUser} logout={handleLogout} /> : <Navigate to="/profile-setup" />
          ) : <Navigate to="/" />
        } />
        <Route path="/meals" element={
          user ? (
            isProfileComplete(user) ? <MealMate user={user} setUser={setUser} /> : <Navigate to="/profile-setup" />
          ) : <Navigate to="/" />
        } />
        <Route path="/medicine" element={
          user ? (
            isProfileComplete(user) ? <MyMedicine user={user} setUser={setUser} /> : <Navigate to="/profile-setup" />
          ) : <Navigate to="/" />
        } />
        <Route path="/profile" element={
          user ? (
            isProfileComplete(user) ? <Profile user={user} setUser={setUser} /> : <Navigate to="/profile-setup" />
          ) : <Navigate to="/" />
        } />
        <Route path="/hydration" element={
          user ? (
            isProfileComplete(user) ? <Hydration user={user} setUser={setUser} /> : <Navigate to="/profile-setup" />
          ) : <Navigate to="/" />
        } />
        <Route path="/badges" element={
          user ? (
            isProfileComplete(user) ? <Badges user={user} setUser={setUser} /> : <Navigate to="/profile-setup" />
          ) : <Navigate to="/" />
        } />
        <Route path="/journal" element={
          user ? (
            isProfileComplete(user) ? <Journal user={user} setUser={setUser} /> : <Navigate to="/profile-setup" />
          ) : <Navigate to="/" />
        } />
      </Routes>
    </Router>
  );
}

export default App;