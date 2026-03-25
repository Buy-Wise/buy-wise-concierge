import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Feedback = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [helpful, setHelpful] = useState(null);
  const [purchased, setPurchased] = useState(null);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Please select a rating');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000)); // mock
    setSubmitted(true);
    setLoading(false);
  };

  if (submitted) return (
    <div className="max-w-xl mx-auto px-4 py-32 text-center">
      <div className="text-6xl mb-6">🙏</div>
      <h1 className="text-4xl font-bold mb-4">Thank You!</h1>
      <p className="text-gray-400 mb-8">Your feedback helps us serve you better. We appreciate you taking the time.</p>
      <button onClick={() => navigate('/')} className="bg-[#D4AF37] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#b8972e]">Back to Home</button>
    </div>
  );

  return (
    <div className="max-w-xl mx-auto px-4 py-32">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">How was your report?</h1>
        <p className="text-gray-400">Order <span className="font-mono text-[#D4AF37]">#{orderId || 'ORD-001'}</span></p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#111] border border-white/10 rounded-2xl p-8 space-y-8">
        <div>
          <label className="block text-sm text-gray-400 mb-4 text-center">Your Rating</label>
          <div className="flex justify-center space-x-3">
            {[1, 2, 3, 4, 5].map(star => (
              <button type="button" key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className={`text-4xl transition-transform hover:scale-125 ${(hoverRating || rating) >= star ? 'text-[#D4AF37]' : 'text-gray-700'}`}>
                ★
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-3">Was this report helpful?</label>
          <div className="flex space-x-4">
            {[['yes', '👍 Yes, definitely!'], ['no', '👎 Not really']].map(([val, label]) => (
              <button type="button" key={val} onClick={() => setHelpful(val)}
                className={`flex-1 py-2 rounded-lg border-2 font-bold transition-all ${helpful === val ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-3">Did you make a purchase?</label>
          <div className="flex space-x-4">
            {[['yes', '✅ Yes!'], ['no', '❌ Not yet'], ['deciding', '🤔 Still deciding']].map(([val, label]) => (
              <button type="button" key={val} onClick={() => setPurchased(val)}
                className={`flex-1 py-2 rounded-lg border-2 text-sm font-bold transition-all ${purchased === val ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-white/10 text-gray-400 hover:border-white/30'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Any comments? (optional)</label>
          <textarea rows="3" value={comments} onChange={e => setComments(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:outline-none"
            placeholder="What could we do better?" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-[#D4AF37] text-black py-3 rounded-lg font-bold hover:bg-[#b8972e] flex justify-center items-center">
          {loading ? <span className="animate-spin h-5 w-5 border-2 border-black border-t-transparent rounded-full"></span> : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default Feedback;
