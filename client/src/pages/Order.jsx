import React, { useState, useEffect } from 'react';
import { ChevronRight, Loader2, Sparkles, Info } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FeedbackModal from '../components/FeedbackModal';

const formatCurrency = (val) => '₹' + Number(val).toLocaleString('en-IN');
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const Order = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [searchParams] = useSearchParams();
  // Read tier from URL param (e.g. /order?tier=basic or /order?tier=pro)
  const initialTier = searchParams.get('tier')?.toUpperCase() === 'BASIC' ? 'BASIC' : 'PRO';

  const [step, setStep] = useState(1);
  const [tier, setTier] = useState(initialTier);
  const [category, setCategory] = useState('PHONE');
  const [budgetMin, setBudgetMin] = useState(10000);
  const [budgetMax, setBudgetMax] = useState(50000);
  const [name, setName] = useState('');
  const [lang, setLang] = useState('EN');
  const [useCases, setUseCases] = useState([]);
  const [avoid, setAvoid] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [error, setError] = useState('');
  const [freeReportEligible, setFreeReportEligible] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const navigate = useNavigate();

  // On mount: check if user is eligible for free report
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data.user && !data.user.free_report_used) {
          setFreeReportEligible(true);
        }
      })
      .catch(() => {});
  }, []);

  const getFormData = () => ({
    budget_min: budgetMin,
    budget_max: budgetMax,
    primary_use_case: useCases.join(', ') || 'General',
    preferences: `Language: ${lang}`,
    priority_factors: useCases.join(', '),
    additional_notes: avoid
  });

  // ── Task 1: Free Report Bypass flow ──────────────────────────────────────
  const handleClaimFree = async () => {
    setIsProcessingPayment(true);
    setError('');
    const url = `${API_URL}/api/payments/claim-free`;
    console.log('DEBUG: Calling Free Claim API:', url);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ service_tier: tier, product_category: category, formData: getFormData() })
      });

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('Non-JSON Response:', text);
        throw new Error(`Server returned HTML instead of JSON. Check if server is running correctly.`);
      }

      if (!res.ok) throw new Error(data.error || `Claim failed with status ${res.status}`);
      navigate(`/order/processing?orderId=${data.dbOrderId}&free=true`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // ── Existing Razorpay flow (unchanged for returning users) ────────────────
  const loadRazorpayScript = () => new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePayment = async () => {
    setIsProcessingPayment(true);
    setError('');
    try {
      const resLoad = await loadRazorpayScript();
      if (!resLoad) throw new Error('Razorpay SDK failed to load. Are you online?');

      const amount = tier === 'PRO' ? 24900 : 14900;

      const createRes = await fetch(`${API_URL}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
        body: JSON.stringify({ amount, service_tier: tier, product_category: category, formData: getFormData() })
      });
      const orderData = await createRes.json();
      if (!createRes.ok) {
        // Surface the real error message from the server (could be gateway error, auth error, etc.)
        const errMsg = orderData.error || orderData.message || `Failed to create order (HTTP ${createRes.status})`;
        throw new Error(errMsg);
      }
      // Bug 2 Fix: Enforce .env key and log (masked) for verification
      const rzpKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      if (!rzpKey) {
        throw new Error('VITE_RAZORPAY_KEY_ID is missing from your .env file. Please check configuration.');
      }
      console.log('Using Razorpay Key:', rzpKey.substring(0, 8) + '...');

      const options = {
        key: rzpKey,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "BuyWise",
        description: `${tier === 'PRO' ? 'No-Regret Decision' : 'Quick Decision'} Report`,
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            const verifyRes = await fetch(`${API_URL}/api/payments/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token') || ''}` },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                dbOrderId: orderData.dbOrderId
              })
            });
            if (!verifyRes.ok) {
              const errText = await verifyRes.text();
              throw new Error(`Server returned ${verifyRes.status}: ${errText.substring(0, 100)}`);
            }
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              navigate(`/order/processing?orderId=${orderData.dbOrderId}`);
            } else {
              setError(verifyData.error || 'Payment verification failed');
            }
          } catch (e) {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: localStorage.getItem('user_name') || '',
          email: localStorage.getItem('user_email') || ''
        },
        theme: { color: "#D4AF37" }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Payment initiation failed. Please ensure you are logged in.');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // ── Derived price values for the Summary UI ────────────────────────────
  const basePrice = tier === 'PRO' ? 249 : 149;
  const totalPrice = freeReportEligible ? 0 : basePrice;

  return (
    <>
      <FeedbackModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />

      <div className="max-w-4xl mx-auto px-4 py-32 min-h-[80vh]">
        {/* Progress stepper */}
        <div className="flex items-center space-x-4 mb-12 border-b border-white/10 pb-6 overflow-x-auto whitespace-nowrap">
          {[['1', 'Select Tier'], ['2', 'Requirements'], ['3', 'Payment']].map(([num, label], i) => (
            <React.Fragment key={num}>
              {i > 0 && <ChevronRight className="text-gray-600 shrink-0" />}
              <div className={`flex items-center ${step >= Number(num) ? 'text-[#D4AF37]' : 'text-gray-500'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-2 ${step >= Number(num) ? 'border-[#D4AF37]' : 'border-gray-500'}`}>{num}</div>
                <span className="font-bold">{label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 1: Tier Selection ───────────────── */}
        {step === 1 && (
          <div className="animate-in fade-in">
            <h2 className="text-3xl font-bold mb-8 text-center text-white">Step 1: Choose Service Tier</h2>

            {/* Free offer banner */}
            {freeReportEligible && (
              <div className="mb-6 flex items-center space-x-3 bg-[#D4AF37]/10 border border-[#D4AF37]/40 rounded-xl p-4">
                <Sparkles size={22} className="text-[#D4AF37] shrink-0" />
                <p className="text-sm text-white/80">
                  <span className="font-bold text-[#D4AF37]">Welcome Gift Active! </span>
                  Your first report is completely free — no card required.
                </p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div
                onClick={() => setTier('BASIC')}
                className={`p-6 rounded-xl cursor-pointer border-2 transition-all ${tier === 'BASIC' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/10 bg-[#111] hover:border-white/30'}`}
              >
                <h3 className="text-xl font-bold mb-2">Quick Decision</h3>
                <p className="text-gray-400 mb-4">1 Perfect Product Recommendation</p>
                <div className="text-3xl font-bold">
                  {freeReportEligible ? <><span className="line-through text-white/30 text-xl">₹149</span> <span className="text-[#D4AF37]">FREE</span></> : '₹149'}
                </div>
              </div>
              <div
                onClick={() => setTier('PRO')}
                className={`p-6 rounded-xl cursor-pointer border-2 transition-all relative ${tier === 'PRO' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/10 bg-[#111] hover:border-white/30'}`}
              >
                <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">POPULAR</div>
                <h3 className="text-xl font-bold mb-2">No-Regret Decision</h3>
                <p className="text-gray-400 mb-4">Top 3 ranked options • Deep Comparison</p>
                <div className="text-3xl font-bold">
                  {freeReportEligible ? <><span className="line-through text-white/30 text-xl">₹249</span> <span className="text-[#D4AF37]">FREE</span></> : '₹249'}
                </div>
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-white/10 mt-8">
              <button onClick={() => setStep(2)} className="bg-[#D4AF37] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#b8972e]">
                Next: Fill Requirements
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Requirements ─────────────────── */}
        {step === 2 && (
          <div className="animate-in fade-in">
            <h2 className="text-3xl font-bold mb-8 text-center text-white">Step 2: Tell Us Your Needs</h2>

            <form className="space-y-8 bg-[#111] p-6 sm:p-8 rounded-2xl border border-white/10 mb-8" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
              <div>
                <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">A. Basic Info</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                    <input required type="text" value={name} onChange={e => setName(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:outline-none" placeholder="Rahul S" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Language Preference</label>
                    <select value={lang} onChange={e => setLang(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:outline-none">
                      <option value="EN">English</option>
                      <option value="HI">Hindi</option>
                      <option value="TA">Tamil</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Task 2: Category restricted to PHONE and LAPTOP only */}
              <div>
                <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">B. Product Category</h3>
                <div className="flex space-x-6 mb-4">
                  {[['PHONE', 'Mobile Phone'], ['LAPTOP', 'Laptop']].map(([val, label]) => (
                    <label key={val} className="flex items-center space-x-2 cursor-pointer">
                      <input type="radio" checked={category === val} onChange={() => setCategory(val)} className="w-4 h-4 accent-[#D4AF37]" />
                      <span className="font-medium">{label}</span>
                    </label>
                  ))}
                </div>
                {/* Task 2: Expansion info box + Suggestion trigger */}
                <div className="flex items-start space-x-3 bg-white/3 border border-white/8 rounded-xl p-4 mt-2">
                  <Info size={16} className="text-white/40 mt-0.5 shrink-0" />
                  <p className="text-sm text-white/50 leading-relaxed">
                    We currently specialize in <span className="text-white/80 font-medium">Mobile Phones</span> and <span className="text-white/80 font-medium">Laptops</span> due to high purchase complexity. We're expanding soon!{' '}
                    <button
                      type="button"
                      onClick={() => setShowFeedbackModal(true)}
                      className="text-[#D4AF37] underline underline-offset-2 hover:text-white transition-colors"
                    >
                      What product should we analyze next? →
                    </button>
                  </p>
                </div>
              </div>

              <div className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-4 text-[#D4AF37]">C. Requirements (For {category === 'PHONE' ? 'Mobile Phone' : 'Laptop'})</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1 flex justify-between">
                      <span>Budget Range</span>
                      <span className="text-white font-mono">{formatCurrency(budgetMin)} – {formatCurrency(budgetMax)}</span>
                    </label>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs text-gray-500 w-16">Min</span>
                      <input type="range" min="5000" max="200000" step="5000" value={budgetMin}
                        onChange={e => { const v = Number(e.target.value); setBudgetMin(v); if (v > budgetMax) setBudgetMax(v); }}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]" />
                    </div>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500 w-16">Max</span>
                      <input type="range" min="5000" max="200000" step="5000" value={budgetMax}
                        onChange={e => { const v = Number(e.target.value); setBudgetMax(v); if (v < budgetMin) setBudgetMin(v); }}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Primary Use (Select multiple)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {['Gaming', 'Programming', 'Office Work', 'Social Media', 'Photography', 'Battery Life'].map(use => (
                        <label key={use} className="flex items-center space-x-2 bg-black px-3 py-2 rounded-md border border-white/5 cursor-pointer hover:border-white/20">
                          <input type="checkbox" checked={useCases.includes(use)}
                            onChange={e => {
                              if (e.target.checked) setUseCases([...useCases, use]);
                              else setUseCases(useCases.filter(u => u !== use));
                            }}
                            className="accent-[#D4AF37]" />
                          <span className="text-sm">{use}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Anything specifically to AVOID?</label>
                    <textarea rows="2" value={avoid} onChange={e => setAvoid(e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:outline-none" placeholder="E.g. No Exynos processors, don't want a heavy laptop..." />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-12 pt-6 border-t border-white/10">
                <button type="button" onClick={() => setStep(1)} className="text-gray-400 hover:text-white px-6 py-3 font-medium">Back</button>
                <button type="submit" className="bg-[#D4AF37] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#b8972e]">
                  Next: Payment
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 3: Payment / Free Claim ─────────── */}
        {step === 3 && (
          <div className="animate-in fade-in flex flex-col items-center">
            <h2 className="text-3xl font-bold mb-8 text-center text-white">
              {freeReportEligible ? 'Step 3: Claim Your Free Report' : 'Step 3: Secure Payment'}
            </h2>

            <div className="w-full max-w-md bg-[#111] p-8 rounded-2xl border border-white/10 shadow-2xl">
              <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Order Summary</h3>

              <div className="flex justify-between mb-4 text-gray-400">
                <span>{tier === 'PRO' ? 'No-Regret Decision' : 'Quick Decision'} ({category})</span>
                <span>₹{basePrice}</span>
              </div>

              {/* Free discount line */}
              {freeReportEligible && (
                <div className="flex justify-between mb-4 text-green-400 text-sm font-medium">
                  <span>🎁 New User Offer</span>
                  <span>−₹{basePrice}</span>
                </div>
              )}

              {tier === 'PRO' && !freeReportEligible && (
                <div className="flex justify-between mb-4 text-green-400 text-sm">
                  <span>Priority Research</span>
                  <span>Included</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-2xl border-t border-white/10 mt-6 pt-6">
                <span>Total</span>
                <span className={freeReportEligible ? 'text-green-400' : 'text-[#D4AF37]'}>
                  {freeReportEligible ? '₹0' : `₹${basePrice}`}
                </span>
              </div>

              {/* ── CTA Button: Free vs Razorpay ── */}
              {freeReportEligible ? (
                <button
                  onClick={handleClaimFree}
                  disabled={isProcessingPayment}
                  className="w-full mt-8 bg-[#D4AF37] text-black px-8 py-4 rounded-lg font-extrabold text-lg hover:bg-white transition-all flex justify-center items-center shadow-[0_0_25px_rgba(212,175,55,0.5)] disabled:opacity-50 tracking-wide"
                >
                  {isProcessingPayment
                    ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Processing...</>
                    : <><Sparkles className="w-5 h-5 mr-2" />Unlock My Free Research</>
                  }
                </button>
              ) : (
                <button
                  onClick={handlePayment}
                  disabled={isProcessingPayment}
                  className="w-full mt-8 bg-[#D4AF37] text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#b8972e] flex justify-center items-center shadow-[0_0_15px_rgba(212,175,55,0.4)] disabled:opacity-50"
                >
                  {isProcessingPayment ? <><Loader2 className="w-5 h-5 animate-spin mr-2" />Processing...</> : 'Pay Securely with Razorpay'}
                </button>
              )}

              {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}

              <div className="mt-6 flex flex-col items-center">
                {freeReportEligible
                  ? <p className="text-xs text-white/30 text-center pt-4 border-t border-white/5 w-full">No payment. No card needed. Your first report is on us.</p>
                  : <p className="text-xs text-gray-500 mb-2 border-t border-white/5 pt-4 w-full text-center">Secured by Razorpay. UPI, Cards & NetBanking accepted.</p>
                }
              </div>
            </div>
            <button onClick={() => setStep(2)} className="mt-6 text-gray-400 hover:text-white border-b border-transparent hover:border-white">Back to Requirements</button>
          </div>
        )}
      </div>
    </>
  );
};

export default Order;
