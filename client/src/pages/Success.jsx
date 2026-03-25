import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Success = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-32 min-h-[80vh] flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-green-900/30 rounded-full flex items-center justify-center mb-8 border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
        <CheckCircle className="text-green-500 w-12 h-12" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Payment Successful!</h1>
      <p className="text-xl text-gray-400 mb-8 max-w-2xl">
        Your order <span className="text-[#D4AF37] font-mono font-bold">#ORD-SUCCESS</span> has been placed successfully. 
        Your report is being prepared. You'll receive it on WhatsApp within your chosen timeframe.
      </p>

      <div className="bg-[#111] border border-white/10 p-6 rounded-xl mb-10 w-full max-w-md">
        <h3 className="font-bold border-b border-white/10 pb-3 mb-4">Estimated Delivery</h3>
        <p className="text-2xl text-[#D4AF37] font-bold">Within 24 Hours</p>
      </div>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center w-full">
        <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="bg-[#25D366] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#20b958] transition-colors flex justify-center items-center">
          Contact WhatsApp Support
        </a>
        <Link to="/dashboard" className="bg-[#1a1a1a] border border-white/20 text-white px-8 py-3 rounded-lg font-bold hover:bg-[#2a2a2a] transition-colors">
          Track in Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Success;
