import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { validateRequired } from '@utils/validators';
import { APP_NAME, COMPANY_NAME } from '@utils/constants';
import { healthService } from '@services/healthService';

const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [healthStatus, setHealthStatus] = useState({
    checking: true,
    server: false,
    database: false,
    apis: 0,
    message: 'Checking backend status...',
  });

  // Check backend health on mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const health = await healthService.checkHealth();

        if (health.status === 'healthy') {
          setHealthStatus({
            checking: false,
            server: true,
            database: health.database || false,
            apis: health.endpoints || 0,
            message: health.message || 'All systems operational',
          });
        } else {
          setHealthStatus({
            checking: false,
            server: false,
            database: false,
            apis: 0,
            message: health.message || 'Backend is not responding',
          });
        }
      } catch (error) {
        setHealthStatus({
          checking: false,
          server: false,
          database: false,
          apis: 0,
          message: 'Failed to connect to backend',
        });
      }
    };

    checkBackendHealth();

    // Refresh health status every 30 seconds
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate username
    const usernameError = validateRequired(formData.username, 'Username');
    if (usernameError) newErrors.username = usernameError;

    // Validate password
    const passwordError = validateRequired(formData.password, 'Password');
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Attempt login
    const result = await login(formData.username, formData.password);

    if (result.success) {
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      setLoginError(result.error);
    }
  };

  return (
    <div className="min-h-screen flex pb-20 bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-100">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-12 flex-col justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">{COMPANY_NAME}</h1>
          <p className="text-xl text-blue-300">{APP_NAME}</p>
        </div>

        <div className="space-y-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-white text-lg font-semibold mb-2">All-in-One Solution</h3>
            <p className="text-white/80 text-sm">
              Manage bookings, inventory, payments, and financial reports in one place.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-white text-lg font-semibold mb-2">Real-Time Insights</h3>
            <p className="text-white/80 text-sm">
              Track your business performance with live dashboards and detailed reports.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-white text-lg font-semibold mb-2">Secure & Reliable</h3>
            <p className="text-white/80 text-sm">
              Your data is protected with enterprise-grade security and daily backups.
            </p>
          </div>
        </div>

        <div className="text-white/60 text-sm">
          &copy; 2025 {COMPANY_NAME}. All rights reserved.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-blue-400 mb-2">{COMPANY_NAME}</h1>
            <p className="text-slate-300">{APP_NAME}</p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-slate-300">Sign in to your account to continue</p>
            </div>

            {/* Error Alert */}
            {loginError && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg">
                <p className="text-red-200 text-sm">{loginError}</p>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username Field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.username
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-600 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter your username"
                  disabled={isLoading}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-400">{errors.username}</p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                    errors.password
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-slate-600 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 bg-slate-700 border-slate-600 rounded focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-slate-300">Remember me</span>
                </label>

                <a
                  href="/forgot-password"
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                >
                  Forgot password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Additional Info */}
            <div className="mt-6 text-center text-sm text-slate-400">
              <p>
                Need access?{' '}
                <a href="/contact" className="text-blue-400 hover:text-blue-300 font-medium">
                  Contact administrator
                </a>
              </p>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-400 flex items-center justify-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              Your connection is secure and encrypted
            </p>
          </div>
        </div>
      </div>

      {/* Backend Status Bar - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-3 py-2 sm:px-4 sm:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
            {/* Status indicators */}
            <div className="flex items-center flex-wrap justify-center sm:justify-start gap-3 sm:gap-6">
              {/* Backend Server Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  healthStatus.checking
                    ? 'bg-yellow-500 animate-pulse'
                    : healthStatus.server
                      ? 'bg-green-500'
                      : 'bg-red-500'
                }`}></div>
                <span className="text-xs sm:text-sm font-medium text-slate-300">
                  <span className="hidden sm:inline">Backend: </span>
                  {healthStatus.checking ? 'Checking...' : healthStatus.server ? 'Online' : 'Offline'}
                </span>
              </div>

              {/* Database Status */}
              <div className="flex items-center space-x-2">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  healthStatus.checking
                    ? 'bg-yellow-500 animate-pulse'
                    : healthStatus.database
                      ? 'bg-green-500'
                      : 'bg-red-500'
                }`}></div>
                <span className="text-xs sm:text-sm font-medium text-slate-300">
                  <span className="hidden sm:inline">Database: </span>
                  {healthStatus.checking ? 'Checking...' : healthStatus.database ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* API Endpoints Count - Hide on very small screens */}
              {!healthStatus.checking && healthStatus.apis > 0 && (
                <div className="hidden md:flex items-center space-x-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-slate-300">
                    {healthStatus.apis} APIs Ready
                  </span>
                </div>
              )}
            </div>

            {/* Status message - Hide on small screens, show badge instead */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <p className="hidden md:block text-xs text-slate-400">
                {healthStatus.message}
              </p>

              {/* Overall status badge */}
              {!healthStatus.checking && (
                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                  healthStatus.server && healthStatus.database
                    ? 'bg-green-900/50 text-green-300 border border-green-700'
                    : 'bg-red-900/50 text-red-300 border border-red-700'
                }`}>
                  <span className="hidden sm:inline">
                    {healthStatus.server && healthStatus.database ? 'All Systems Operational' : 'System Issues Detected'}
                  </span>
                  <span className="sm:hidden">
                    {healthStatus.server && healthStatus.database ? 'OK' : 'Issues'}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
