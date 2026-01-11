import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Auth({ setUser }: { setUser: any }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', fullName: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    try {
      const url = `/api/auth/${isLogin ? 'login' : 'register'}`;
      const payload = isLogin 
        ? { identifier: formData.username, password: formData.password } 
        : { username: formData.username, email: formData.email, password: formData.password, fullName: formData.fullName };
      
      const res = await axios.post(url, payload);
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/dashboard');
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        setError("Invalid Credentials! Please check your username or password.");
      } else if (error.response && error.response.status === 400) {
        setError(error.response.data?.message || "Username already exists!");
      } else {
        setError(isLogin ? "Account doesn't exist. Register first." : "Registration failed.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-400 via-lavender-300 to-lavender-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-sage-700">MediMind</h1>
        <p className="text-center text-lavender-700 mb-8 font-medium">Your Personal Health Companion</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sage-700 font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sage-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sage-700 font-medium mb-2">Username</label>
                <input
                  type="text"
                  placeholder="Choose username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                  required
                />
              </div>
            </>
          )}
          
          {isLogin && (
            <div>
              <label className="block text-sage-700 font-medium mb-2">Username or Email</label>
              <input
                type="text"
                placeholder="Enter username or email"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2 border-2 border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                required
              />
            </div>
          )}
          
          <div>
            <label className="block text-sage-700 font-medium mb-2">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 border-2 border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sage-700 font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border-2 border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                required
              />
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-sage-500 to-lavender-500 text-white py-2 rounded-lg font-semibold hover:from-sage-600 hover:to-lavender-600 transition"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-sage-700">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-lavender-600 font-semibold hover:text-sage-600"
            >
              {isLogin ? 'Register' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
