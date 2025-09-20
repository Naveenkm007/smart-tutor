import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { LearningService, UserBehaviorTracker, supabase } from '../services/supabaseClient';

// Constants
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const DEFAULT_ROLE = 'student';
const AUTH_ERRORS = {
  GOOGLE_NOT_AVAILABLE: 'Google login is not available. Please try again later.',
  GOOGLE_FAILED: 'Failed to start Google login. Please try again.',
  INVALID_CREDENTIALS: 'Please enter both email and password.',
  LOGIN_FAILED: 'Login failed. Please check your credentials.'
};

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (!email || !password) {
        setError(AUTH_ERRORS.INVALID_CREDENTIALS);
        return;
      }

      UserBehaviorTracker.trackFormSubmission('email_login', { email });
      
      // Attempt authentication with Supabase
      const { data, error: authError } = await LearningService.signIn(email, password);
      
      if (authError) {
        console.error('Authentication failed:', authError);
        setError(authError.message || AUTH_ERRORS.LOGIN_FAILED);
        return;
      }
      
      if (data?.user) {
        const userData = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || email.split('@')[0],
          role: data.user.user_metadata?.role || DEFAULT_ROLE,
          avatar: data.user.user_metadata?.avatar_url
        };
        
        onLogin(userData);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(AUTH_ERRORS.LOGIN_FAILED);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      UserBehaviorTracker.trackFormSubmission('google_signin_button');
      
      // Use Supabase Google OAuth
      const { data, error } = await LearningService.signInWithGoogle();
      
      if (error) {
        console.error('Google sign-in error:', error);
        setError(error.message || 'Google sign-in failed. Please try again.');
        return;
      }
      
      // The redirect will be handled by Supabase
      console.log('Google sign-in initiated successfully');
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError('Google sign-in failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle auth state changes
  useEffect(() => {
    const handleAuthChange = (event, session) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          role: DEFAULT_ROLE,
          avatar: session.user.user_metadata?.avatar_url,
          provider: session.user.app_metadata?.provider
        };
        onLogin(userData);
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => subscription.unsubscribe();
  }, [onLogin]);


  const handleRegister = () => {
    UserBehaviorTracker.trackButtonClick('register_link');
    navigate('/signup');
  };

  const clearError = () => setError('');

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="brain-illustration">
          <svg viewBox="0 0 400 400" className="brain-svg">
            {/* Main brain outline */}
            <path 
              d="M200 50 C280 50 340 110 340 190 C340 220 330 250 310 270 C320 290 315 320 290 340 C270 360 240 370 200 370 C160 370 130 360 110 340 C85 320 80 290 90 270 C70 250 60 220 60 190 C60 110 120 50 200 50 Z" 
              fill="none" 
              stroke="#4A90E2" 
              strokeWidth="4" 
              className="main-circle"
            />
            
            {/* Brain center with detailed anatomy */}
            <g transform="translate(180, 220)">
              <circle cx="20" cy="0" r="25" fill="#00D4AA" className="brain-center"/>
              <path d="M5 -15 Q20 -25 35 -15 Q35 15 20 25 Q5 15 5 -15" fill="#4DD0E1" opacity="0.8"/>
              <path d="M10 -10 C15 -15 25 -15 30 -10" stroke="#0277BD" strokeWidth="1.5" fill="none"/>
              <path d="M10 0 C15 -5 25 -5 30 0" stroke="#0277BD" strokeWidth="1.5" fill="none"/>
              <path d="M10 10 C15 5 25 5 30 10" stroke="#0277BD" strokeWidth="1.5" fill="none"/>
            </g>
            
            {/* Book icon - top left */}
            <g transform="translate(110, 100)">
              <rect x="0" y="0" width="28" height="20" fill="#4A90E2" rx="2"/>
              <rect x="2" y="2" width="24" height="16" fill="white"/>
              <line x1="14" y1="2" x2="14" y2="18" stroke="#4A90E2" strokeWidth="1"/>
              <line x1="5" y1="6" x2="12" y2="6" stroke="#4A90E2" strokeWidth="0.8"/>
              <line x1="5" y1="9" x2="12" y2="9" stroke="#4A90E2" strokeWidth="0.8"/>
              <line x1="16" y1="6" x2="23" y2="6" stroke="#4A90E2" strokeWidth="0.8"/>
              <line x1="16" y1="9" x2="23" y2="9" stroke="#4A90E2" strokeWidth="0.8"/>
            </g>
            
            {/* Lightbulb icon - top right */}
            <g transform="translate(270, 100)">
              <circle cx="15" cy="12" r="10" fill="none" stroke="#4A90E2" strokeWidth="3"/>
              <rect x="10" y="22" width="10" height="6" fill="none" stroke="#4A90E2" strokeWidth="2" rx="1"/>
              <line x1="15" y1="28" x2="15" y2="32" stroke="#4A90E2" strokeWidth="2"/>
              <line x1="6" y1="6" x2="10" y2="10" stroke="#4A90E2" strokeWidth="2"/>
              <line x1="20" y1="10" x2="24" y2="6" stroke="#4A90E2" strokeWidth="2"/>
              <line x1="30" y1="12" x2="34" y2="12" stroke="#4A90E2" strokeWidth="2"/>
              <circle cx="15" cy="12" r="3" fill="#FFD54F"/>
            </g>
            
            {/* Trophy icon - bottom right */}
            <g transform="translate(270, 280)">
              <rect x="8" y="15" width="14" height="8" fill="#4A90E2" rx="2"/>
              <path d="M6 8 Q15 4 24 8 L22 15 L8 15 Z" fill="#FFD700" stroke="#4A90E2" strokeWidth="2"/>
              <circle cx="4" cy="12" r="3" fill="none" stroke="#4A90E2" strokeWidth="2"/>
              <circle cx="26" cy="12" r="3" fill="none" stroke="#4A90E2" strokeWidth="2"/>
              <rect x="12" y="23" width="6" height="4" fill="#4A90E2"/>
              <rect x="10" y="27" width="10" height="2" fill="#4A90E2"/>
            </g>
            
            {/* Chart icon - bottom left */}
            <g transform="translate(110, 290)">
              <rect x="2" y="20" width="4" height="8" fill="#4CAF50"/>
              <rect x="8" y="16" width="4" height="12" fill="#4CAF50"/>
              <rect x="14" y="12" width="4" height="16" fill="#4CAF50"/>
              <rect x="20" y="8" width="4" height="20" fill="#4CAF50"/>
              <rect x="26" y="14" width="4" height="14" fill="#4CAF50"/>
              <line x1="0" y1="30" x2="32" y2="30" stroke="#4A90E2" strokeWidth="2"/>
              <line x1="0" y1="30" x2="0" y2="6" stroke="#4A90E2" strokeWidth="2"/>
            </g>
            
            {/* Connecting pathways and nodes */}
            <circle cx="60" cy="80" r="6" fill="#4A90E2"/>
            <circle cx="340" cy="80" r="6" fill="#4A90E2"/>
            <circle cx="60" cy="320" r="6" fill="#4A90E2"/>
            <circle cx="340" cy="320" r="6" fill="#4A90E2"/>
            <circle cx="30" cy="200" r="6" fill="#4A90E2"/>
            <circle cx="370" cy="200" r="6" fill="#4A90E2"/>
            <circle cx="200" cy="30" r="6" fill="#4A90E2"/>
            <circle cx="200" cy="370" r="6" fill="#4A90E2"/>
            
            {/* Neural pathways */}
            <path d="M60 80 Q120 120 160 200" stroke="#4A90E2" strokeWidth="3" fill="none" opacity="0.8"/>
            <path d="M340 80 Q280 120 240 200" stroke="#4A90E2" strokeWidth="3" fill="none" opacity="0.8"/>
            <path d="M60 320 Q120 280 160 200" stroke="#4A90E2" strokeWidth="3" fill="none" opacity="0.8"/>
            <path d="M340 320 Q280 280 240 200" stroke="#4A90E2" strokeWidth="3" fill="none" opacity="0.8"/>
            <path d="M30 200 Q100 200 160 200" stroke="#4A90E2" strokeWidth="3" fill="none" opacity="0.8"/>
            <path d="M370 200 Q300 200 240 200" stroke="#4A90E2" strokeWidth="3" fill="none" opacity="0.8"/>
            <path d="M200 30 Q200 100 200 160" stroke="#4A90E2" strokeWidth="3" fill="none" opacity="0.8"/>
            <path d="M200 370 Q200 300 200 240" stroke="#4A90E2" strokeWidth="3" fill="none" opacity="0.8"/>
            
            {/* Additional smaller nodes */}
            <circle cx="90" cy="150" r="3" fill="#00D4AA"/>
            <circle cx="310" cy="150" r="3" fill="#00D4AA"/>
            <circle cx="90" cy="250" r="3" fill="#00D4AA"/>
            <circle cx="310" cy="250" r="3" fill="#00D4AA"/>
            <circle cx="150" cy="90" r="3" fill="#00D4AA"/>
            <circle cx="250" cy="90" r="3" fill="#00D4AA"/>
            <circle cx="150" cy="310" r="3" fill="#00D4AA"/>
            <circle cx="250" cy="310" r="3" fill="#00D4AA"/>
            
            {/* Data flow arrows */}
            <g transform="translate(80, 340)">
              <path d="M0 0 L20 -20" stroke="#4A90E2" strokeWidth="3" markerEnd="url(#arrowhead)"/>
            </g>
            <g transform="translate(320, 60)">
              <path d="M0 0 L-20 20" stroke="#4A90E2" strokeWidth="3" markerEnd="url(#arrowhead)"/>
            </g>
            
            {/* Arrow marker definition */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#4A90E2"/>
              </marker>
            </defs>
          </svg>
        </div>
      </div>
      
      <div className="login-right">
        <div className="login-form-container">
          <div className="login-header">
            <h1>Welcome to</h1>
            <h1 className="brand-name">CodePlays</h1>
          </div>
          
          <form onSubmit={handleLogin} className="login-form">
            {/* Error Display */}
            {error && (
              <div className="error-message">
                <svg viewBox="0 0 24 24" fill="currentColor" className="error-icon">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                {error}
                <button type="button" onClick={clearError} className="error-close">×</button>
              </div>
            )}
            
            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="google-signin-btn"
              disabled={isLoading}
            >
              <svg className="google-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? 'Signing in...' : 'Continue with Google'}
            </button>
            
            <div className="divider">
              <span>or</span>
            </div>
            
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <div className="input-container">
                <svg className="input-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.89 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@gmail.com"
                  required
                />
              </div>
            </div>
            
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-container">
                <svg className="input-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    {showPassword ? (
                      <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                    ) : (
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                    )}
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="form-options">
              <label className="remember-me">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              <button type="button" className="forgot-password" onClick={() => setError('Password reset feature coming soon!')}>Forgot Password?</button>
            </div>
            
            <button type="submit" className="login-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="loading-spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.3"/>
                    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="31.416" strokeDashoffset="31.416">
                      <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                      <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </button>
            
            <p className="register-link">
              Don't have an account? 
              <button type="button" onClick={handleRegister} className="register-btn">
                Register
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
