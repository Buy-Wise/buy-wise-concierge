import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    if (token) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(data => { if (data.user) setUserRole(data.user.role); })
        .catch(() => {});
    } else {
      setUserRole(null);
    }
  }, [location]);

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/logout`, { 
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) { /* ignore */ }
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserRole(null);
    setIsOpen(false);
    navigate('/login');
  };

  const dashboardPath = userRole === 'admin' ? '/admin' : '/dashboard';
  const dashboardLabel = userRole === 'admin' ? 'Admin Panel' : 'Dashboard';

  return (
    <nav className="fixed w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-bold tracking-tighter">
              BUY<span className="text-[#D4AF37]">WISE</span>
            </Link>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link to="/sample" className="text-gray-300 hover:text-white transition-colors text-sm">Sample Report</Link>
            <Link to="/deal-watch" className="text-gray-300 hover:text-white transition-colors text-sm">Deal Watch</Link>
            
            {isLoggedIn ? (
              <>
                <Link to={dashboardPath} className="text-gray-300 hover:text-white transition-colors text-sm">{dashboardLabel}</Link>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-400 transition-colors text-sm flex items-center">
                  <LogOut size={16} className="mr-1" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors text-sm">Login</Link>
                <Link to="/register" className="text-gray-300 hover:text-white transition-colors text-sm">Register</Link>
              </>
            )}
            
            <Link to="/order" className="bg-[#D4AF37] text-black px-5 py-2 rounded-lg font-bold text-sm hover:bg-[#b8972e] transition-colors shadow-[0_0_10px_rgba(212,175,55,0.2)]">
              Get Report
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-300 hover:text-white">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-lg border-b border-white/10">
          <div className="px-4 pt-3 pb-4 space-y-2 flex flex-col">
            <Link to="/sample" className="text-gray-300 hover:text-white px-3 py-2.5 rounded-lg font-medium" onClick={() => setIsOpen(false)}>Sample Report</Link>
            <Link to="/deal-watch" className="text-gray-300 hover:text-white px-3 py-2.5 rounded-lg font-medium" onClick={() => setIsOpen(false)}>Deal Watch</Link>
            
            {isLoggedIn ? (
              <>
                <Link to={dashboardPath} className="text-gray-300 hover:text-white px-3 py-2.5 rounded-lg font-medium" onClick={() => setIsOpen(false)}>{dashboardLabel}</Link>
                <button onClick={handleLogout} className="text-red-400 hover:text-red-300 px-3 py-2.5 rounded-lg font-medium text-left flex items-center">
                  <LogOut size={18} className="mr-2" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2.5 rounded-lg font-medium" onClick={() => setIsOpen(false)}>Login</Link>
                <Link to="/register" className="text-gray-300 hover:text-white px-3 py-2.5 rounded-lg font-medium" onClick={() => setIsOpen(false)}>Register</Link>
              </>
            )}
            
            <Link to="/order" className="bg-[#D4AF37] text-black px-4 py-3 rounded-lg font-bold text-center mt-2" onClick={() => setIsOpen(false)}>
              Get Report
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
