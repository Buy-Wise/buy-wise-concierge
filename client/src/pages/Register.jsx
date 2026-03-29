import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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

        <button
          className="w-full bg-white text-black hover:bg-zinc-200 font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Sign up with Google
        </button>

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
