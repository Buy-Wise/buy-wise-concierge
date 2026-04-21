import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send, CheckCircle } from 'lucide-react';

const FeedbackModal = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [generalFeedback, setGeneralFeedback] = useState('');
  const [productSuggestion, setProductSuggestion] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/feedback/suggest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ rating, general_feedback: generalFeedback, product_suggestion: productSuggestion, would_recommend: wouldRecommend })
      });

      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text.substring(0, 50) || 'Server returned a non-JSON response.');
      }

      if (!res.ok) throw new Error(data.error || `Submission failed with status ${res.status}`);
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setRating(0);
    setGeneralFeedback('');
    setProductSuggestion('');
    setWouldRecommend(null);
    setError('');
    onClose();
  };

  const ratingLabels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Outstanding!' };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={(e) => e.target === e.currentTarget && handleClose()}
        >
          <motion.div
            initial={{ scale: 0.92, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative"
          >
            {/* Gold top border */}
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />

            <div className="p-7">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Share Your Thoughts</h2>
                  <p className="text-sm text-white/50 mt-0.5">Help us build exactly what you need next</p>
                </div>
                <button onClick={handleClose} className="text-white/30 hover:text-white transition-colors p-1">
                  <X size={20} />
                </button>
              </div>

              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <CheckCircle size={52} className="text-[#D4AF37] mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                  <p className="text-white/60 text-sm">Your feedback shapes the future of BuyWise. We read every single response.</p>
                  <button onClick={handleClose} className="mt-6 bg-[#D4AF37] text-black font-bold px-8 py-3 rounded-xl hover:bg-white transition-all">
                    Close
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Overall Experience *</label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          className="focus:outline-none transition-transform hover:scale-110"
                        >
                          <Star
                            size={30}
                            className={`transition-colors ${star <= (hoveredRating || rating) ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white/20'}`}
                          />
                        </button>
                      ))}
                      {(hoveredRating || rating) > 0 && (
                        <span className="text-sm text-[#D4AF37] ml-2 font-medium">{ratingLabels[hoveredRating || rating]}</span>
                      )}
                    </div>
                  </div>

                  {/* Product Suggestion — the KEY question from Task 2 */}
                  <div>
                    <label className="block text-sm text-white/60 mb-1">
                      What product category should we analyze next?
                    </label>
                    <input
                      type="text"
                      value={productSuggestion}
                      onChange={(e) => setProductSuggestion(e.target.value)}
                      placeholder="e.g. Washing Machines, Smart TVs, Headphones..."
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-[#D4AF37] focus:outline-none placeholder-white/20"
                    />
                  </div>

                  {/* General Feedback */}
                  <div>
                    <label className="block text-sm text-white/60 mb-1">General Experience</label>
                    <textarea
                      rows={3}
                      value={generalFeedback}
                      onChange={(e) => setGeneralFeedback(e.target.value)}
                      placeholder="What did you love? What could be better?"
                      className="w-full bg-black border border-white/10 rounded-lg px-4 py-3 text-white text-sm focus:border-[#D4AF37] focus:outline-none placeholder-white/20 resize-none"
                    />
                  </div>

                  {/* Would Recommend */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Would you recommend BuyWise to a friend?</label>
                    <div className="flex space-x-3">
                      {[{ label: '👍 Yes', val: true }, { label: '👎 Not yet', val: false }].map(({ label, val }) => (
                        <button
                          key={label}
                          type="button"
                          onClick={() => setWouldRecommend(val)}
                          className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                            wouldRecommend === val
                              ? 'border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]'
                              : 'border-white/10 text-white/50 hover:border-white/30'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {error && <p className="text-red-400 text-sm">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#D4AF37] text-black font-bold py-3 rounded-xl hover:bg-white transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {loading ? <span>Sending...</span> : <><Send size={16} /><span>Submit Feedback</span></>}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;
