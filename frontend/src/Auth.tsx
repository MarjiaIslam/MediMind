import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Eye, EyeOff, Loader2, User, Lock, Mail, AtSign, Heart, Shield, UserPlus, Bell, KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';

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
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Forgot password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  
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
    setSuccessMessage('');
    
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
      
      if (isLogin) {
        // Login - set user and go to dashboard
        setUser(res.data);
        localStorage.setItem('user', JSON.stringify(res.data));
        navigate('/dashboard');
      } else {
        // Registration - show success and switch to login
        setSuccessMessage('Account created successfully! Please login to continue.');
        setFormData({ username: '', email: '', password: '', confirmPassword: '', fullName: '' });
        setIsLogin(true);
      }
      
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

  const handleForgotPassword = async () => {
    setForgotError('');
    setForgotSuccess('');
    
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your email address');
      return;
    }
    
    if (!validateEmail(forgotEmail)) {
      setForgotError('Please enter a valid email address');
      return;
    }
    
    try {
      setForgotLoading(true);
      await axios.post('/api/auth/forgot-password', { email: forgotEmail });
      setOtpSent(true);
      setForgotSuccess('OTP sent to your email. Please check your inbox.');
    } catch (error: any) {
      setForgotError(error.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setForgotError('');
    setForgotSuccess('');
    
    if (!otp.trim()) {
      setForgotError('Please enter the OTP');
      return;
    }
    
    if (newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match');
      return;
    }
    
    try {
      setForgotLoading(true);
      await axios.post('/api/auth/reset-password', {
        email: forgotEmail,
        otp: otp,
        newPassword: newPassword
      });
      setForgotSuccess('Password reset successfully! You can now login.');
      setTimeout(() => {
        setShowForgotPassword(false);
        setOtpSent(false);
        setForgotEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmNewPassword('');
        setForgotSuccess('');
      }, 2000);
    } catch (error: any) {
      setForgotError(error.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFieldErrors({});
    setGeneralError('');
    setSuccessMessage('');
    setFormData({ username: '', email: '', password: '', confirmPassword: '', fullName: '' });
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setOtpSent(false);
    setForgotEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmNewPassword('');
    setForgotError('');
    setForgotSuccess('');
  };

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
              
              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-700 text-sm">
                  <CheckCircle size={16} />
                  {successMessage}
                </div>
              )}
          
              {!isLogin && (
                <>
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-teal-700">Full Name</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400 group-focus-within:text-teal-600 transition-colors">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        name="fullName"
                        placeholder="John Doe"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        autoComplete="name"
                        className={`w-full pl-10 pr-4 py-3.5 bg-white border-2 rounded-2xl text-gray-800 placeholder-gray-400 
                          transition-all duration-300 focus:outline-none focus:scale-[1.01] shadow-sm
                          ${fieldErrors.fullName 
                            ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' 
                            : 'border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
                          }`}
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle size={12} />
                        {fieldErrors.fullName}
                      </p>
                    )}
                  </div>
                  
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-teal-700">Email Address</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400 group-focus-within:text-teal-600 transition-colors">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        autoComplete="email"
                        className={`w-full pl-10 pr-4 py-3.5 bg-white border-2 rounded-2xl text-gray-800 placeholder-gray-400 
                          transition-all duration-300 focus:outline-none focus:scale-[1.01] shadow-sm
                          ${fieldErrors.email 
                            ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' 
                            : 'border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
                          }`}
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle size={12} />
                        {fieldErrors.email}
                      </p>
                    )}
                  </div>
                  
                  {/* Username */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-teal-700">Username</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400 group-focus-within:text-teal-600 transition-colors">
                        <AtSign size={18} />
                      </div>
                      <input
                        type="text"
                        name="username"
                        placeholder="johndoe"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                        autoComplete="username"
                        className={`w-full pl-10 pr-4 py-3.5 bg-white border-2 rounded-2xl text-gray-800 placeholder-gray-400 
                          transition-all duration-300 focus:outline-none focus:scale-[1.01] shadow-sm
                          ${fieldErrors.username 
                            ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' 
                            : 'border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
                          }`}
                      />
                    </div>
                    {fieldErrors.username && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle size={12} />
                        {fieldErrors.username}
                      </p>
                    )}
                  </div>
                </>
              )}
              
              {isLogin && (
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-teal-700">Username or Email</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400 group-focus-within:text-teal-600 transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      name="username"
                      placeholder="Enter your username or email"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      autoComplete="username"
                      className={`w-full pl-10 pr-4 py-3.5 bg-white border-2 rounded-2xl text-gray-800 placeholder-gray-400 
                        transition-all duration-300 focus:outline-none focus:scale-[1.01] shadow-sm
                        ${fieldErrors.username 
                          ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' 
                          : 'border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
                        }`}
                    />
                  </div>
                  {fieldErrors.username && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle size={12} />
                      {fieldErrors.username}
                    </p>
                  )}
                </div>
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
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-teal-700">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400 group-focus-within:text-teal-600 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Re-enter your password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      autoComplete="new-password"
                      className={`w-full pl-10 pr-12 py-3.5 bg-white border-2 rounded-2xl text-gray-800 placeholder-gray-400 
                        transition-all duration-300 focus:outline-none focus:scale-[1.01] shadow-sm
                        ${fieldErrors.confirmPassword 
                          ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100' 
                          : 'border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-100'
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-400 hover:text-teal-600 transition-colors p-1"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle size={12} />
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
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
              
              {isLogin && (
                <div className="text-center mt-3">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-teal-600 text-sm hover:text-teal-700 hover:underline transition-all"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
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
      
      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-teal-100">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={resetForgotPassword}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-teal-800">
                  {otpSent ? 'Reset Password' : 'Forgot Password'}
                </h2>
                <p className="text-gray-500 text-sm">
                  {otpSent ? 'Enter the OTP sent to your email' : 'Enter your email to receive OTP'}
                </p>
              </div>
            </div>
            
            {forgotError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2 text-red-700 text-sm mb-4">
                <AlertCircle size={16} />
                {forgotError}
              </div>
            )}
            
            {forgotSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 text-green-700 text-sm mb-4">
                <CheckCircle size={16} />
                {forgotSuccess}
              </div>
            )}
            
            {!otpSent ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-teal-700">Email Address</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleForgotPassword()}
                      className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-teal-200 rounded-2xl text-gray-800 placeholder-gray-400 
                        focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleForgotPassword}
                  disabled={forgotLoading}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-4 rounded-2xl 
                    font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 
                    transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      <Mail size={20} />
                      Send OTP
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-teal-700">OTP Code</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400">
                      <KeyRound size={18} />
                    </div>
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      onKeyDown={(e) => e.key === 'Enter' && otp.length === 6 && newPassword && confirmNewPassword && handleResetPassword()}
                      maxLength={6}
                      className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-teal-200 rounded-2xl text-gray-800 placeholder-gray-400 
                        focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 text-center text-xl tracking-widest"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-teal-700">New Password</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Enter new password (min 6 chars)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                      className="w-full pl-10 pr-12 py-3.5 bg-white border-2 border-teal-200 rounded-2xl text-gray-800 placeholder-gray-400 
                        focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-400 hover:text-teal-600 transition-colors p-1"
                    >
                      {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-teal-700">Confirm New Password</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                      className="w-full pl-10 pr-4 py-3.5 bg-white border-2 border-teal-200 rounded-2xl text-gray-800 placeholder-gray-400 
                        focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleResetPassword}
                  disabled={forgotLoading}
                  className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 text-white py-4 rounded-2xl 
                    font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-50 
                    transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {forgotLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      <KeyRound size={20} />
                      Reset Password
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setOtpSent(false)}
                  className="w-full text-teal-600 text-sm hover:underline transition-all"
                >
                  Didn't receive OTP? Try again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Auth;
