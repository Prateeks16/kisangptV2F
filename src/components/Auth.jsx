import { useState, useEffect, useRef } from 'react';
import { Mail, Lock, User, Sprout, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://127.0.0.1:8000'
  : 'https://kisangptv2.onrender.com';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpinningUp, setIsSpinningUp] = useState(false);

  const spinUpTimerRef = useRef(null);

  useEffect(() => {
    // Clear any timers on unmount
    return () => {
      if (spinUpTimerRef.current) clearTimeout(spinUpTimerRef.current);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const startSpinUpCheck = () => {
    setIsSpinningUp(false);
    spinUpTimerRef.current = setTimeout(() => {
      setIsSpinningUp(true);
    }, 3500);
  };

  const stopSpinUpCheck = () => {
    if (spinUpTimerRef.current) {
      clearTimeout(spinUpTimerRef.current);
      spinUpTimerRef.current = null;
    }
    setIsSpinningUp(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    startSpinUpCheck();

    const { fullName, email, password, confirmPassword } = formData;

    if (!email || !password) {
      setError('Please fill in all required fields.');
      setLoading(false);
      stopSpinUpCheck();
      return;
    }

    if (!isLogin) {
      if (!fullName) {
        setError('Please enter your full name.');
        setLoading(false);
        stopSpinUpCheck();
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        stopSpinUpCheck();
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setLoading(false);
        stopSpinUpCheck();
        return;
      }
    }

    try {
      if (isLogin) {
        // Login Flow
        const params = new URLSearchParams();
        params.append('username', email);
        params.append('password', password);

        const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params,
        });

        const data = await response.json();
        stopSpinUpCheck();

        if (response.ok) {
          localStorage.setItem('auth_token', data.access_token);
          setSuccess('Login successful! Redirecting...');
          setTimeout(() => {
            onLoginSuccess(data.access_token);
          }, 1000);
        } else {
          setError(data.detail || 'Incorrect email or password.');
          setLoading(false);
        }
      } else {
        // Signup Flow
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            full_name: fullName,
          }),
        });

        const data = await response.json();
        stopSpinUpCheck();

        if (response.ok) {
          setSuccess('Account created successfully! Logging you in...');
          
          // Auto-login after signup
          const loginParams = new URLSearchParams();
          loginParams.append('username', email);
          loginParams.append('password', password);

          const loginResponse = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: loginParams,
          });

          const loginData = await loginResponse.json();
          if (loginResponse.ok) {
            localStorage.setItem('auth_token', loginData.access_token);
            setTimeout(() => {
              onLoginSuccess(loginData.access_token);
            }, 1000);
          } else {
            // If auto-login fails, redirect to login tab
            setLoading(false);
            setIsLogin(true);
            setError('Account created, but automatic login failed. Please sign in manually.');
          }
        } else {
          setError(data.detail || 'Registration failed. Please try again.');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error('Authentication error:', err);
      stopSpinUpCheck();
      setError('Could not connect to the authentication server. Please check your internet connection.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      {/* Background Animated Particles */}
      <div className="auth-particles">
        <div className="particle p1"></div>
        <div className="particle p2"></div>
        <div className="particle p3"></div>
      </div>

      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="auth-logo-glow">
            <Sprout size={36} className="auth-logo-icon animate-pulse-green" />
          </div>
          <h2 className="auth-title">KisanGPT</h2>
          <p className="auth-subtitle">Agri-Enterprise Intelligence System</p>
        </div>

        {error && (
          <div className="auth-alert error slide-down">
            <AlertCircle size={18} className="alert-icon" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="auth-alert success slide-down">
            <CheckCircle size={18} className="alert-icon" />
            <span>{success}</span>
          </div>
        )}

        {isSpinningUp && (
          <div className="auth-alert warning pulse-warning">
            <div className="spinner-mini"></div>
            <span>Backend server waking up. This may take ~45s. Please wait...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="input-group">
              <label htmlFor="fullName">Full Name</label>
              <div className="input-wrapper">
                <User size={18} className="input-icon" />
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.fullName}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@enterprise.com"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className={`auth-submit-btn ${loading ? 'btn-loading' : ''}`}
            disabled={loading}
          >
            {loading ? (
              <div className="loader-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>
              New to KisanGPT?{' '}
              <button
                type="button"
                className="toggle-auth-mode"
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                  setSuccess('');
                }}
                disabled={loading}
              >
                Create an Account
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button
                type="button"
                className="toggle-auth-mode"
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                  setSuccess('');
                }}
                disabled={loading}
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
