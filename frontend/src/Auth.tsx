import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Eye, EyeOff, Mail, RefreshCw } from 'lucide-react';

function Auth({ setUser }: { setUser: any }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirmPassword: '', fullName: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<any>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Email verification states
  const [showVerification, setShowVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [resending, setResending] = useState(false);
  
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9_+&*-]+(?:\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,7}$/;
    return re.test(email);
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }
    
    try {
      setLoading(true);
      const res = await axios.post('/api/auth/verify-email', {
        email: verificationEmail,
        code: verificationCode
      });
      
      setSuccessMessage(res.data.message || 'Email verified successfully! You can now login.');
      setShowVerification(false);
      setVerificationCode('');
      setIsLogin(true);
      
      // Pre-fill username for convenience
      setFormData(prev => ({ ...prev, username: verificationEmail, password: '' }));
    } catch (error: any) {
      setError(error.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    try {
      setResending(true);
      const res = await axios.post('/api/auth/resend-verification', {
        email: verificationEmail
      });
      setSuccessMessage(res.data.message || 'Verification code sent! Check your email.');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
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
        // Registration successful - show verification screen
        if (res.data.requiresVerification) {
          setVerificationEmail(res.data.email || formData.email);
          setShowVerification(true);
          setSuccessMessage('📧 Verification code sent to your email! Please check your inbox.');
        } else {
          setSuccessMessage('🎉 Registration successful! Please login with your credentials.');
          setTimeout(() => {
            setIsLogin(true);
            setSuccessMessage('');
          }, 2000);
        }
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
        
        // Handle email verification required (403)
        if (status === 403 && data?.requiresVerification) {
          setVerificationEmail(data.email);
          setShowVerification(true);
          setError(data.error || 'Please verify your email to continue.');
          return;
        }
        
        if (status === 400 && typeof data === 'object' && !data.error) {
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

  // Verification screen
  if (showVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sage-400 via-lavender-300 to-lavender-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-lavender-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-lavender-600" />
            </div>
            <h1 className="text-2xl font-bold text-sage-700">Verify Your Email</h1>
            <p className="text-gray-600 mt-2">
              We sent a 6-digit code to<br />
              <span className="font-semibold text-lavender-600">{verificationEmail}</span>
            </p>
          </div>
          
          {successMessage && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded mb-4 flex items-center gap-2">
              <CheckCircle size={20} />
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 flex items-center gap-2">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          
          <form onSubmit={handleVerifyEmail} className="space-y-4">
            <div>
              <label className="block text-sage-700 font-medium mb-2">Verification Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-lavender-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage-500"
                maxLength={6}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-gradient-to-r from-sage-500 to-lavender-500 text-white py-3 rounded-lg font-semibold hover:from-sage-600 hover:to-lavender-600 transition disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResendCode}
              disabled={resending}
              className="text-lavender-600 font-semibold hover:text-sage-600 flex items-center justify-center gap-2 mx-auto"
            >
              <RefreshCw size={16} className={resending ? 'animate-spin' : ''} />
              {resending ? 'Sending...' : 'Resend Code'}
            </button>
          </div>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => {
                setShowVerification(false);
                setVerificationCode('');
                setError('');
                setSuccessMessage('');
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ← Back to {isLogin ? 'Login' : 'Register'}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
