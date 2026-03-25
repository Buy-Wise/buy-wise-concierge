import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

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
          <div className="hidden md:flex space-x-8 items-center">
            <Link to="/sample" className="text-gray-300 hover:text-white transition-colors">Sample Report</Link>
            <Link to="/deal-watch" className="text-gray-300 hover:text-white transition-colors">Deal Watch</Link>
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
            <Link to="/dashboard" className="bg-[#D4AF37] text-black px-4 py-2 rounded-md font-medium hover:bg-[#b8972e] transition-colors">
              Dashboard
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
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <Link to="/sample" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium" onClick={() => setIsOpen(false)}>Sample Report</Link>
            <Link to="/deal-watch" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium" onClick={() => setIsOpen(false)}>Deal Watch</Link>
            <Link to="/login" className="text-gray-300 hover:text-white px-3 py-2 rounded-md font-medium" onClick={() => setIsOpen(false)}>Login</Link>
            <Link to="/dashboard" className="text-[#D4AF37] px-3 py-2 rounded-md font-medium" onClick={() => setIsOpen(false)}>Dashboard</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
