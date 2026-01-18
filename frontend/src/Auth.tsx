import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

function Auth({ setUser }: { setUser: any }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', fullName: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<any>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
    return re.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setSuccessMessage('');
    
    // Client-side validation for registration
    if (!isLogin) {
      const errors: any = {};
      
      if (!formData.fullName || formData.fullName.trim().length < 2) {
        errors.fullName = 'Full name must be at least 2 characters';
      }
      
      if (!formData.username || formData.username.trim().length < 3) {
        errors.username = 'Username must be at least 3 characters';
      }
      
      if (!validateEmail(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
      
      if (!formData.password || formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters';
      }
      
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match!';
      }
      
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return;
      }
    }

    try {
      setLoading(true);
      const url = `/api/auth/${isLogin ? 'login' : 'register'}`;
      const payload = isLogin 
        ? { identifier: formData.username, password: formData.password } 
        : { username: formData.username, email: formData.email, password: formData.password, fullName: formData.fullName };
      
      const res = await axios.post(url, payload);
      
      if (!isLogin) {
        // Registration successful - show message and switch to login
        setSuccessMessage('🎉 Registration successful! Please login with your credentials.');
        setFormData({ username: formData.username, email: '', password: '', confirmPassword: '', fullName: '' });
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMessage('');
        }, 2000);
      } else {
        // Login successful
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        navigate('/dashboard');
      }
    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        if (status === 400 && typeof data === 'object') {
          // Field-specific errors from backend
          setFieldErrors(data);
        } else if (status === 401) {
          setError("Incorrect password. Please try again.");
        } else if (status === 404) {
          setError("Account not found. Please check your username/email or register first.");
        } else if (data?.error) {
          setError(data.error);
        } else if (typeof data === 'string') {
          setError(data);
        } else {
          setError(isLogin ? "Login failed. Please try again." : "Registration failed. Please try again.");
        }
      } else {
        setError("Network error. Please check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-400 via-lavender-300 to-lavender-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h1 className="text-4xl font-bold text-center mb-2 text-sage-700">MediMind</h1>
        <p className="text-center text-lavender-700 mb-8 font-medium">Your Personal Health Companion</p>
        
        {successMessage && (
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4 flex items-center gap-2">
            <CheckCircle size={20} />
            {successMessage}
          </div>
        )}
        
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
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 ${fieldErrors.fullName ? 'border-red-400' : 'border-lavender-300'}`}
                  required
                />
                {fieldErrors.fullName && <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>}
              </div>
              <div>
                <label className="block text-sage-700 font-medium mb-2">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 ${fieldErrors.email ? 'border-red-400' : 'border-lavender-300'}`}
                  required
                />
                {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sage-700 font-medium mb-2">Username</label>
                <input
                  type="text"
                  placeholder="Choose a unique username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 ${fieldErrors.username ? 'border-red-400' : 'border-lavender-300'}`}
                  required
                />
                {fieldErrors.username && <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>}
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password (min 6 characters)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-2 pr-10 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 ${fieldErrors.password ? 'border-red-400' : 'border-lavender-300'}`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sage-700 font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500 ${fieldErrors.confirmPassword ? 'border-red-400' : 'border-lavender-300'}`}
                required
              />
              {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-sage-500 to-lavender-500 text-white py-2 rounded-lg font-semibold hover:from-sage-600 hover:to-lavender-600 transition disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>
        
        <div className="text-center mt-6">
          <p className="text-sage-700">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFieldErrors({});
                setSuccessMessage('');
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
