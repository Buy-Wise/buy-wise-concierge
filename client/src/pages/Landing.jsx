import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, CreditCard, MessageCircle, ShieldCheck, Clock, Zap } from 'lucide-react';
import ServiceTierCard from '../components/ServiceTierCard';

const Landing = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-center">
        <div className="inline-block border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37] px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
          AI-Powered Buying Intelligence
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
          We Research. <br className="md:hidden" />
          <span className="text-[#D4AF37]">You Buy Smart.</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Get a structured, personalized buying decision report in minutes. Save 5-10 hours of confusing research and avoid wasting your money.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link to="/order" className="bg-[#D4AF37] text-black w-full sm:w-auto px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#b8972e] hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            Get Your Research Report
          </Link>
          <Link to="/sample" className="bg-[#111111] text-white border border-white/20 w-full sm:w-auto px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#1a1a1a] hover:border-white/40 transition-all">
            See Sample Report
          </Link>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-[#0a0a0a] border-y border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400">Three simple steps to clarity.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-black border-2 border-[#D4AF37] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                <FileText size={40} className="text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Fill Requirements</h3>
              <p className="text-gray-400">Tell us your budget, preferences, and what you strictly want to avoid.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-black border-2 border-[#D4AF37] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                <CreditCard size={40} className="text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Pay Securely</h3>
              <p className="text-gray-400">Checkout securely with Razorpay via UPI, Net Banking or Cards.</p>
            </div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-black border-2 border-[#D4AF37] rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(212,175,55,0.15)]">
                <MessageCircle size={40} className="text-[#D4AF37]" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Get PDF via WhatsApp</h3>
              <p className="text-gray-400">Receive a structured PDF report directly on your WhatsApp in minutes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing / Tiers */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Skip the generic affiliate blogs. Invest a tiny fraction of your buying budget into certainty.</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <ServiceTierCard 
            title="BASIC REPORT"
            price="199"
            features={[
              "2-3 Curated Options",
              "Basic Comparison Table",
              "Primary Recommendation",
              "Delivered in 24 hours"
            ]}
            ctaText="Select Basic"
            ctaLink="/order?tier=basic"
          />
          <ServiceTierCard 
            title="PRO REPORT"
            price="349"
            highlighted={true}
            features={[
              "4-6 Deep-researched Options",
              "Detailed Pros & Cons",
              "Use-case Mapping",
              "Alternative Picks",
              "Delivered in 24 hours"
            ]}
            ctaText="Get Pro Report"
            ctaLink="/order?tier=pro"
          />
          <ServiceTierCard 
            title="EXPRESS ADD-ON"
            price="149"
            features={[
              "Priority Processing",
              "Delivered in 2 Hours",
              "Skip the queue",
              "Applies to any report"
            ]}
            ctaText="Add to Order"
            ctaLink="/order"
          />
          <ServiceTierCard 
            title="DEAL WATCH"
            price="199"
            period="/mo"
            features={[
              "Active Price Drop Tracking",
              "Instant WhatsApp Alerts",
              "Target Price Monitoring",
              "Cancel Anytime"
            ]}
            ctaText="Start Tracking"
            ctaLink="/deal-watch"
          />
        </div>
      </section>

      {/* Why Buy Wise */}
      <section className="bg-[#0a0a0a] border-t border-white/5 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">Why rely on <span className="text-[#D4AF37]">Buy Wise</span>?</h2>
              <div className="space-y-8">
                <div className="flex">
                  <div className="mt-1 bg-[#111] p-3 rounded-lg border border-white/10 h-min mr-4">
                    <ShieldCheck className="text-[#D4AF37]" size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Unbiased & Independent</h4>
                    <p className="text-gray-400">We don't get paid by brands to push their products. Our AI engine recommends what's best for YOUR stated needs.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="mt-1 bg-[#111] p-3 rounded-lg border border-white/10 h-min mr-4">
                    <Clock className="text-[#D4AF37]" size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Save Hours of Your Life</h4>
                    <p className="text-gray-400">Watching 20 YouTube reviews and reading Reddit threads takes roughly 8 hours. We do it in minutes.</p>
                  </div>
                </div>
                <div className="flex">
                  <div className="mt-1 bg-[#111] p-3 rounded-lg border border-white/10 h-min mr-4">
                    <Zap className="text-[#D4AF37]" size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">Structured Clarity</h4>
                    <p className="text-gray-400">No jargon. Just clear pros, cons, comparison tables, and a definitive best pick in English, Hindi, or Tamil.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/20 to-transparent blur-3xl z-0"></div>
              <div className="relative z-10 bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gray-800 rounded-full"></div>
                  <div>
                    <div className="font-bold">Rahul S.</div>
                    <div className="text-sm text-gray-400">Bought a ₹75,000 Laptop</div>
                  </div>
                </div>
                <p className="text-lg italic text-gray-300">
                  "I was completely overwhelmed deciding between MacBook and Windows for my video editing workflow. The Pro Report completely cleared my confusion. Worth every penny."
                </p>
                <div className="flex mt-6 text-[#D4AF37]">
                  ★ ★ ★ ★ ★
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <span className="text-2xl font-bold tracking-tighter">BUY<span className="text-[#D4AF37]">WISE</span></span>
            <p className="text-gray-500 mt-2 text-sm">© {new Date().getFullYear()} Buy Wise India. All rights reserved.</p>
          </div>
          <div className="flex space-x-6 text-sm text-gray-400">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
