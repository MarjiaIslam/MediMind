import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2, User, Lock, Mail, AtSign, Heart, Shield, UserPlus, Bell } from 'lucide-react';

function Auth({ setUser }: { setUser: any }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '', 
    confirmPassword: '', 
    fullName: '' 
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
    return re.test(email);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!isLogin) {
      if (!formData.fullName || formData.fullName.trim().length < 2) {
        errors.fullName = 'Please enter your full name';
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
        errors.confirmPassword = 'Passwords do not match';
      }
    } else {
      if (!formData.username.trim()) {
        errors.username = 'Please enter your username or email';
      }
      if (!formData.password) {
        errors.password = 'Please enter your password';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError('');
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const url = `/api/auth/${isLogin ? 'login' : 'register'}`;
      const payload = isLogin 
        ? { identifier: formData.username, password: formData.password } 
        : { 
            username: formData.username, 
            email: formData.email, 
            password: formData.password, 
            fullName: formData.fullName 
          };
      
      const res = await axios.post(url, payload);
      
      // Both login and register return user data - auto login
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/dashboard');
      
    } catch (error: any) {
      const status = error.response?.status;
      const data = error.response?.data;
      
      if (status === 400 && typeof data === 'object' && !data.error) {
        // Field-specific errors
        setFieldErrors(data);
      } else if (status === 401) {
        setFieldErrors({ password: 'Incorrect password' });
      } else if (status === 404) {
        setFieldErrors({ username: 'Account not found' });
      } else {
        setGeneralError(data?.error || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFieldErrors({});
    setGeneralError('');
    setFormData({ username: '', email: '', password: '', confirmPassword: '', fullName: '' });
  };

  const InputField = ({ 
    icon: Icon, 
    label, 
    name,
    type = 'text',
    placeholder,
    value,
    onChange,
    autoComplete
  }: { 
    icon: any; 
    label: string; 
    name: string;
    type?: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    autoComplete?: string;
  }) => (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-teal-700">{label}</label>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400 group-focus-within:text-teal-600 transition-colors">
          <Icon size={18} />
        </div>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`w-full pl-10 pr-4 py-3.5 bg-white border-2 rounded-2xl text-gray-800 placeholder-gray-400 
            transition-all duration-300 focus:outline-none focus:scale-[1.01] shadow-sm
            ${fieldErrors[name] 
              ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' 
              : 'border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
            }`}
        />
      </div>
      {fieldErrors[name] && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <AlertCircle size={12} />
          {fieldErrors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-30" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(16, 185, 129, 0.15) 1px, transparent 0)', backgroundSize: '32px 32px'}} />
      
      {/* Floating orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-200/40 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-green-200/30 rounded-full blur-3xl animate-float-slow" />
      
      {/* Content */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-3xl mb-4 shadow-2xl shadow-teal-500/30">
              <Heart className="w-10 h-10 text-white" fill="white" />
            </div>
            <h1 className="text-4xl font-bold text-teal-800 mb-2">MediMind</h1>
            <p className="text-teal-600 text-lg">Your Digital Health Companion</p>
          </div>
          
          {/* Card */}
          <div className="bg-gradient-to-b from-teal-500 to-teal-600 rounded-3xl shadow-2xl shadow-teal-900/20 overflow-hidden">
            {/* Tab Switcher */}
            <div className="flex bg-teal-700/30">
              <button
                type="button"
                onClick={() => { if (!isLogin) switchMode(); }}
                className={`flex-1 py-4 text-sm font-bold transition-all duration-300 relative
                  ${isLogin ? 'text-white bg-teal-400/30' : 'text-white/60 hover:text-white/90 hover:bg-teal-400/10'}`}
              >
                <span className="flex items-center justify-center gap-2">
                  <Shield size={16} />
                  Login
                </span>
                {isLogin && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full" />}
              </button>
              <button
                type="button"
                onClick={() => { if (isLogin) switchMode(); }}
                className={`flex-1 py-4 text-sm font-bold transition-all duration-300 relative
                  ${!isLogin ? 'text-white bg-teal-400/30' : 'text-white/60 hover:text-white/90 hover:bg-teal-400/10'}`}
              >
                <span className="flex items-center justify-center gap-2">
                  <UserPlus size={16} />
                  Sign Up
                </span>
                {!isLogin && <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full" />}
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white/95 backdrop-blur-sm">
              {generalError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm">
                  <AlertCircle size={16} />
                  {generalError}
                </div>
              )}
          
              {!isLogin && (
                <>
                  <InputField
                    icon={User}
                    label="Full Name"
                    name="fullName"
                    placeholder="John Doe"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    autoComplete="name"
                  />
                  
                  <InputField
                    icon={Mail}
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    autoComplete="email"
                  />
                  
                  <InputField
                    icon={AtSign}
                    label="Username"
                    name="username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    autoComplete="username"
                  />
                </>
              )}
              
              {isLogin && (
                <InputField
                  icon={User}
                  label="Username or Email"
                  name="username"
                  placeholder="Enter your username or email"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  autoComplete="username"
                />
              )}
              
              {/* Password field with toggle */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-teal-700">Password</label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400 group-focus-within:text-teal-600 transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder={isLogin ? 'Enter your password' : 'Create a password (min 6 chars)'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    className={`w-full pl-10 pr-12 py-3.5 bg-white border-2 rounded-2xl text-gray-800 placeholder-gray-400 
                      transition-all duration-300 focus:outline-none focus:scale-[1.01] shadow-sm
                      ${fieldErrors.password 
                        ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' 
                        : 'border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-400 hover:text-teal-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <AlertCircle size={12} />
                    {fieldErrors.password}
                  </p>
                )}
              </div>
              
              {!isLogin && (
                <InputField
                  icon={Lock}
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  autoComplete="new-password"
                />
              )}
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-4 rounded-2xl 
                  font-bold text-lg shadow-lg shadow-teal-500/30
                  hover:shadow-xl hover:shadow-teal-500/40 hover:scale-[1.02]
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  transition-all duration-300 flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    {isLogin ? 'Logging in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {isLogin ? <Shield size={20} /> : <UserPlus size={20} />}
                    {isLogin ? 'Login' : 'Create Account'}
                  </>
                )}
              </button>
            </form>
            
            {/* Footer */}
            <div className="px-6 pb-6 text-center bg-white/95">
              <p className="text-gray-600 text-sm">
                {isLogin ? "New to MediMind? " : "Already have an account? "}
                <button
                  type="button"
                  onClick={switchMode}
                  className="text-teal-600 font-bold hover:text-teal-700 hover:underline transition-all"
                >
                  {isLogin ? 'Create an account' : 'Login here'}
                </button>
              </p>
            </div>
          </div>
          
          {/* Features */}
          <div className="flex justify-center gap-8 mt-8 text-teal-700 text-sm">
            <div className="flex items-center gap-2">
              <Heart size={16} className="text-teal-500" />
              <span>Track Health</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield size={16} className="text-teal-500" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-teal-500" />
              <span>Reminders</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Auth;
