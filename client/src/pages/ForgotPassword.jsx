import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Something went wrong');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-10">
      <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-xl w-full max-w-[420px]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">BUY<span className="text-[#D4AF37]">WISE</span></h1>
          <p className="text-zinc-400 mt-2">Reset Password</p>
        </div>

        {error && <div className="text-red-500 text-sm mb-4 text-center">{error}</div>}

        {success ? (
          <div className="text-center space-y-4">
            <div className="text-green-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <p className="text-white">Reset link sent to <span className="font-semibold">{email}</span>. Check your inbox.</p>
            <Link to="/login" className="inline-block mt-4 text-[#D4AF37] hover:underline">
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full bg-black border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black border border-zinc-700 hover:border-[#D4AF37] hover:text-[#D4AF37] text-white font-medium py-3 rounded-lg transition-colors flex justify-center disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <div className="text-center mt-4">
              <Link to="/login" className="text-sm text-zinc-400 hover:text-white">
                Back to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default ForgotPassword;
