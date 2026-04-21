import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Incorrect email or password.');

      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      // Role-based redirect: admin → /admin, user → /dashboard
      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        const redirectPath = location.state?.from || '/dashboard';
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
        credentials: 'include'
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(`[BACKEND REASON] ${data.details || data.error || 'Google login failed'}`);
      
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      if (data.isNewUser) {
        localStorage.setItem('showPromo', 'true');
      }
      
      if (data.user?.role === 'admin') {
        navigate('/admin');
      } else {
        const redirectPath = location.state?.from || '/dashboard';
        navigate(redirectPath);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign in was unsuccesful or cancelled.');
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-10">
      <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl w-full max-w-[420px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">BUY<span className="text-[#D4AF37]">WISE</span></h1>
        </div>

        {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input
              type="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors"
            />
          </div>

          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-colors pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white text-sm"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="text-right mt-2">
              <Link to="/forgot-password" className="text-sm text-[#D4AF37] hover:underline">
                Forgot Password?
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black border border-zinc-700 hover:border-[#D4AF37] hover:text-[#D4AF37] text-white font-medium py-3 rounded-lg transition-colors flex justify-center mt-2 group disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-zinc-800"></div>
          <span className="px-3 text-zinc-500 text-sm">or</span>
          <div className="flex-grow border-t border-zinc-800"></div>
        </div>

        <div className="flex justify-center mt-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            theme="filled_black"
            shape="rectangular"
            text="signin_with"
            size="large"
            width="100%"
          />
        </div>

        <p className="text-center mt-6 text-sm text-zinc-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-[#D4AF37] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Login;
