import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="border-t border-white/10 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0 text-center md:text-left">
          <Link to="/" className="text-2xl font-bold tracking-tighter">
            BUY<span className="text-[#D4AF37]">WISE</span>
          </Link>
          <p className="text-zinc-500 mt-2 text-sm max-w-xs">
            Unbiased AI-driven research reports to help you make smarter purchase decisions.
          </p>
          <p className="text-zinc-600 mt-4 text-xs font-mono">
            © {new Date().getFullYear()} Buy Wise India. All rights reserved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-12 text-center sm:text-left">
          <div className="flex flex-col space-y-2">
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Product</span>
            <Link to="/order" className="text-sm text-zinc-500 hover:text-[#D4AF37] transition-colors">Start Research</Link>
            <Link to="/sample" className="text-sm text-zinc-500 hover:text-[#D4AF37] transition-colors">Sample Report</Link>
            <Link to="/deal-watch" className="text-sm text-zinc-500 hover:text-[#D4AF37] transition-colors">Deal Watch</Link>
          </div>
          
          <div className="flex flex-col space-y-2">
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Support</span>
            <Link to="/contact" className="text-sm text-zinc-500 hover:text-[#D4AF37] transition-colors">Contact Us</Link>
            <Link to="/faq" className="text-sm text-zinc-500 hover:text-[#D4AF37] transition-colors">FAQ</Link>
          </div>
          
          <div className="flex flex-col space-y-2">
            <span className="text-zinc-400 text-xs font-bold uppercase tracking-wider mb-2">Legal</span>
            <Link to="/privacy" className="text-sm text-zinc-500 hover:text-[#D4AF37] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-sm text-zinc-500 hover:text-[#D4AF37] transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
