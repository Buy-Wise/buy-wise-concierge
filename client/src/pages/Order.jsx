import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';

const formatCurrency = (val) => '₹' + Number(val).toLocaleString('en-IN');

const Order = () => {
  const [step, setStep] = useState(1);
  const [tier, setTier] = useState('PRO');
  const [category, setCategory] = useState('PHONE');
  const [budgetMin, setBudgetMin] = useState(10000);
  const [budgetMax, setBudgetMax] = useState(50000);

  return (
    <div className="max-w-4xl mx-auto px-4 py-32 min-h-[80vh]">
      <div className="flex items-center space-x-4 mb-12 border-b border-white/10 pb-6 overflow-x-auto whitespace-nowrap">
        <div className={`flex items-center ${step >= 1 ? 'text-[#D4AF37]' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-2 ${step >= 1 ? 'border-[#D4AF37]' : 'border-gray-500'}`}>1</div>
          <span className="font-bold">Select Tier</span>
        </div>
        <ChevronRight className="text-gray-600 shrink-0" />
        <div className={`flex items-center ${step >= 2 ? 'text-[#D4AF37]' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-2 ${step >= 2 ? 'border-[#D4AF37]' : 'border-gray-500'}`}>2</div>
          <span className="font-bold">Requirements</span>
        </div>
        <ChevronRight className="text-gray-600 shrink-0" />
        <div className={`flex items-center ${step >= 3 ? 'text-[#D4AF37]' : 'text-gray-500'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 mr-2 ${step >= 3 ? 'border-[#D4AF37]' : 'border-gray-500'}`}>3</div>
          <span className="font-bold">Payment</span>
        </div>
      </div>

      {step === 1 && (
        <div className="animate-in fade-in">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">Step 1: Choose Service Tier</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div 
              onClick={() => setTier('BASIC')}
              className={`p-6 rounded-xl cursor-pointer border-2 transition-all ${tier === 'BASIC' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/10 bg-[#111] hover:border-white/30'}`}
            >
              <h3 className="text-xl font-bold mb-2">Basic Report</h3>
              <p className="text-gray-400 mb-4">2-3 Options • Basic Comparison</p>
              <div className="text-3xl font-bold">₹199</div>
            </div>
            <div 
              onClick={() => setTier('PRO')}
              className={`p-6 rounded-xl cursor-pointer border-2 transition-all relative ${tier === 'PRO' ? 'border-[#D4AF37] bg-[#D4AF37]/10' : 'border-white/10 bg-[#111] hover:border-white/30'}`}
            >
              <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">POPULAR</div>
              <h3 className="text-xl font-bold mb-2">Pro Report</h3>
              <p className="text-gray-400 mb-4">4-6 Options • Deep Comparison</p>
              <div className="text-3xl font-bold">₹349</div>
            </div>
          </div>
          
          <div className="flex justify-end p-6 border-t border-white/10 mt-8">
            <button onClick={() => setStep(2)} className="bg-[#D4AF37] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#b8972e]">
              Next: Fill Requirements
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="animate-in fade-in">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">Step 2: Tell Us Your Needs</h2>
          
          <form className="space-y-8 bg-[#111] p-6 sm:p-8 rounded-2xl border border-white/10 mb-8" onSubmit={(e) => { e.preventDefault(); setStep(3); }}>
            <div>
              <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">A. Basic Info</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                  <input required type="text" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:outline-none" placeholder="Rahul S" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">WhatsApp Number</label>
                  <div className="flex">
                    <span className="bg-[#1a1a1a] border border-r-0 border-white/10 rounded-l-lg p-3 text-gray-400">+91</span>
                    <input required type="tel" className="w-full bg-[#0a0a0a] border border-white/10 rounded-r-lg p-3 text-white focus:border-[#D4AF37] focus:outline-none" placeholder="9876543210" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Language Preference</label>
                  <select className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:outline-none">
                    <option value="EN">English</option>
                    <option value="HI">Hindi</option>
                    <option value="TA">Tamil</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 border-b border-white/10 pb-2">B. Product Category</h3>
              <div className="flex space-x-6">
                {['PHONE', 'LAPTOP', 'OTHER'].map(cat => (
                  <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" checked={category === cat} onChange={() => setCategory(cat)} className="text-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] w-4 h-4 accent-[#D4AF37]" />
                    <span className="font-medium">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-[#D4AF37]/30 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 text-[#D4AF37]">C. Requirements (For {category})</h3>
              
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
                        <input type="checkbox" className="accent-[#D4AF37]" />
                        <span className="text-sm">{use}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Anything specifically to AVOID?</label>
                  <textarea rows="2" className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:outline-none" placeholder="E.g. No Exynos processors, don't want a heavy laptop..."></textarea>
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

      {step === 3 && (
        <div className="animate-in fade-in flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-8 text-center text-white">Step 3: Secure Payment</h2>
          <div className="w-full max-w-md bg-[#111] p-8 rounded-2xl border border-white/10 shadow-2xl">
            <h3 className="text-xl font-bold mb-6 border-b border-white/10 pb-4">Order Summary</h3>
            <div className="flex justify-between mb-4 text-gray-400">
              <span>{tier} Report ({category})</span>
              <span>₹{tier === 'PRO' ? '349' : '199'}</span>
            </div>
            {tier === 'PRO' && (
              <div className="flex justify-between mb-4 text-green-400 text-sm">
                <span>Priority Research</span>
                <span>Included</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-2xl border-t border-white/10 mt-6 pt-6">
              <span>Total</span>
              <span className="text-[#D4AF37]">₹{tier === 'PRO' ? '349' : '199'}</span>
            </div>
            <button className="w-full mt-8 bg-[#D4AF37] text-black px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#b8972e] flex justify-center items-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              Pay Securely with Razorpay
            </button>
            <div className="mt-6 flex flex-col items-center">
              <p className="text-xs text-gray-500 mb-2 border-t border-white/5 pt-4 w-full text-center">Secured by Razorpay. UPI, Cards & NetBanking accepted.</p>
            </div>
          </div>
          <button onClick={() => setStep(2)} className="mt-6 text-gray-400 hover:text-white border-b border-transparent hover:border-white">Back to Requirements</button>
        </div>
      )}
    </div>
  );
};

export default Order;
