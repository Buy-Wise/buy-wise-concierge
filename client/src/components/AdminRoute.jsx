import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const [status, setStatus] = useState('loading'); // 'loading' | 'admin' | 'user' | 'unauth'

  useEffect(() => {
    const checkRole = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setStatus('unauth'); return; }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` },
          credentials: 'include'
        });
        if (!res.ok) { setStatus('unauth'); return; }
        const data = await res.json();
        setStatus(data.user?.role === 'admin' ? 'admin' : 'user');
      } catch {
        setStatus('unauth');
      }
    };
    checkRole();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin h-8 w-8 border-2 border-[#D4AF37] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (status === 'unauth') return <Navigate to="/login" replace />;
  if (status === 'user') return <Navigate to="/dashboard" replace />;
  return children;
};

export default AdminRoute;
