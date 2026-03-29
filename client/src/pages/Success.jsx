import React, { useEffect, useState } from 'react';
import { CheckCircle, Download, LayoutDashboard } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

const Success = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reports/${orderId}/download`, {
        // Normally credentials or auth header needed if protected
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` }
      })
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const fullUrl = data.pdfUrl.startsWith('http') ? data.pdfUrl : `${baseUrl}${data.pdfUrl}`;
          setPdfUrl(fullUrl);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderId]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-32 min-h-[80vh] flex flex-col items-center justify-center text-center">
      <div className="w-24 h-24 bg-green-900/30 rounded-full flex items-center justify-center mb-8 border-2 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
        <CheckCircle className="text-green-500 w-12 h-12" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold mb-4">Report Ready!</h1>
      <p className="text-xl text-gray-400 mb-8 max-w-2xl">
        Your order <span className="text-[#D4AF37] font-mono font-bold">#{orderId || 'SUCCESS'}</span> is complete. 
        Your personalized AI-powered buying intelligence report is ready for download.
      </p>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center w-full max-w-md mx-auto">
        <a 
          href={pdfUrl || "#"} 
          target="_blank" 
          rel="noreferrer" 
          className={`flex items-center justify-center bg-[#D4AF37] text-black px-8 py-4 rounded-lg font-bold hover:bg-[#b8972e] transition-colors shadow-[0_0_20px_rgba(212,175,55,0.3)] ${!pdfUrl && !loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <Download className="mr-2" size={20} />
          {loading ? 'Loading...' : 'Download PDF Report'}
        </a>
        <Link to="/dashboard" className="flex items-center justify-center bg-[#1a1a1a] border border-white/20 text-white px-8 py-4 rounded-lg font-bold hover:bg-[#2a2a2a] transition-colors">
          <LayoutDashboard className="mr-2" size={20} />
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Success;
