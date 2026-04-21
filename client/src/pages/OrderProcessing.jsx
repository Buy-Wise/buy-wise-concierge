import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const OrderProcessing = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const isFree = searchParams.get('free') === 'true';
  const navigate = useNavigate();
  const [status, setStatus] = useState('GENERATING');

  useEffect(() => {
    if (!orderId) {
      navigate('/dashboard');
      return;
    }

    const checkStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/reports/${orderId}/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.status === 'DELIVERED') {
          navigate(`/order/success?orderId=${orderId}`);
        } else if (data.status === 'GENERATION_FAILED') {
          setStatus('FAILED');
        } else {
          // Treat FREE same as GENERATING for display
          setStatus(data.status === 'FREE' ? 'GENERATING' : data.status);
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);

    return () => clearInterval(interval);
  }, [orderId, navigate]);

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-10 text-center shadow-2xl">
        <h2 className="text-3xl font-bold mb-4 text-[#D4AF37]">
          {isFree ? '🎁 Free Report Claimed!' : 'Payment Successful!'}
        </h2>
        
        {status === 'FAILED' ? (
          <div className="mt-8">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <p className="text-xl font-semibold mb-2 text-white">Generation Encountered an Issue</p>
            <p className="text-zinc-400 mb-4">Our AI engine hit a temporary snag. Don't worry — your order is saved and our team has been notified. A report will be delivered to your dashboard within 24 hours.</p>
            <button onClick={() => navigate('/dashboard')} className="mt-4 bg-[#D4AF37] hover:bg-[#b8972e] text-black px-8 py-3 rounded-lg font-bold transition-colors">
              Go to My Dashboard
            </button>
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center">
            <Loader2 className="w-16 h-16 text-[#D4AF37] animate-spin mb-6" />
            <p className="text-xl font-semibold mb-2 text-white">
              {status === 'PENDING' ? 'Confirming Payment...' : 
               status === 'PAID' ? 'Preparing Research...' : 
               'AI is Generating Your Report...'}
            </p>
            <p className="text-zinc-400 max-w-xs mx-auto text-sm">
              {status === 'PENDING' ? 'Waiting for final confirmation from Razorpay.' : 
               'This typically takes 30-60 seconds. Please do not close this page.'}
            </p>
            
            <div className="w-full bg-zinc-800 h-2 rounded-full mt-8 overflow-hidden">
              <div className="bg-[#D4AF37] h-full rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderProcessing;

