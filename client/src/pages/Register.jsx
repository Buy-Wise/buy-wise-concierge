import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getPasswordStrength = (pass) => {
    if (pass.length === 0) return { label: '', color: 'bg-zinc-800' };
    if (pass.length < 6) return { label: 'Weak', color: 'bg-red-500 w-1/3' };
    if (pass.length < 10) return { label: 'Good', color: 'bg-yellow-500 w-2/3' };
    return { label: 'Strong', color: 'bg-green-500 w-full' };
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreed) return setError('You must agree to the Terms and Privacy Policy');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    if (formData.password.length < 6) return setError('Password must be at least 6 characters');

    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }),
        credentials: 'include'
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Registration failed');

      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      if (data.isNewUser) {
        localStorage.setItem('showPromo', 'true');
      }

      navigate('/dashboard');
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
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google sign in was unsuccesful or cancelled.');
  };

  const strength = getPasswordStrength(formData.password);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-10">
      <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl w-full max-w-[420px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">BUY<span className="text-[#D4AF37]">WISE</span></h1>
        </div>

        {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            required
            placeholder="Full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
          />
          <input
            type="email"
            required
            placeholder="Email address"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
          />
          
          <div>
            <input
              type="password"
              required
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            />
            {formData.password.length > 0 && (
              <div className="mt-2 flex items-center justify-between">
                <div className="h-1 w-full bg-zinc-800 rounded overflow-hidden flex-grow mr-3">
                  <div className={`h-full ${strength.color} transition-all`}></div>
                </div>
                <span className="text-xs text-zinc-400 w-10 text-right">{strength.label}</span>
              </div>
            )}
          </div>

          <input
            type="password"
            required
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
          />

          <label className="flex items-start gap-2 text-sm text-zinc-400 mt-4 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 accent-[#D4AF37]" />
            <span>I agree to the <Link to="/terms" className="text-[#D4AF37] hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-[#D4AF37] hover:underline">Privacy Policy</Link></span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black border border-zinc-700 hover:border-[#D4AF37] hover:text-[#D4AF37] text-white font-medium py-3 rounded-lg transition-colors flex justify-center mt-4 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Account"}
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
            text="signup_with"
            size="large"
            width="100%"
          />
        </div>

        <p className="text-center mt-6 text-sm text-zinc-400">
          Already have an account?{" "}
          <Link to="/login" className="text-[#D4AF37] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Register;
