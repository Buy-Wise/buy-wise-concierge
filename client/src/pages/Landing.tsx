import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Zap, ShieldCheck, FileText, CreditCard, MessageCircle, Clock } from 'lucide-react';
import ServiceTierCard from '../components/ServiceTierCard';
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const timelineData = [
  {
    id: 1,
    title: "Fill Requirements",
    subtitle: "Step 1: Personalized Input",
    content: "Tell us exactly what you need. Our AI analyzes your budget and preferences to filter out the noise.",
    icon: FileText,
    metricLabel: "Average completion time",
    metricValue: "2 Minutes",
    marketingPoint: "Save 15+ hours of confusing YouTube reviews and Reddit threads with one simple form.",
  },
  {
    id: 2,
    title: "Pay Securely",
    subtitle: "Step 2: Instant Activation",
    content: "One-time payment for your specific research. No subscriptions. No hidden fees. Just pure data.",
    icon: CreditCard,
    metricLabel: "Secure checkout",
    metricValue: "Bank-grade Security",
    marketingPoint: "An unbiased ₹199-349 report can prevent you from making a ₹50,000+ buying mistake.",
  },
  {
    id: 3,
    title: "Download Instantly",
    subtitle: "Step 3: Definitive Answer",
    content: "Receive a structured PDF report with clear pros, cons, and a verified 'Best Buy' recommendation.",
    icon: MessageCircle,
    metricLabel: "Clarity Score",
    metricValue: "100% Guaranteed",
    marketingPoint: "Join 500+ smart buyers who secured decision clarity in minutes instead of days.",
  },
];

const Landing = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <HeroGeometric 
        badge="AI-Powered Buying Intelligence"
        title1="We Research."
        title2="You Buy Smart."
        subtitle="Get a structured, personalized buying decision report in minutes. Save 5-10 hours of confusing research and avoid wasting your money."
      >
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Link to="/order" className="bg-[#D4AF37] text-black w-full sm:w-auto px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#b8972e] hover:scale-105 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            Get Your Research Report
          </Link>
          <Link to="/sample" className="bg-[#111111] text-white border border-white/20 w-full sm:w-auto px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#1a1a1a] hover:border-white/40 transition-all">
            See Sample Report
          </Link>
        </div>
      </HeroGeometric>

      {/* How it Works Section */}
      <section className="bg-black border-y border-white/5 py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 relative z-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-gray-400">Three simple steps to buying clarity.</p>
          </div>
          
          <div className="relative h-[600px] -mt-20">
             <RadialOrbitalTimeline timelineData={timelineData} />
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
              "Instant Download"
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
              "Instant Download"
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
              "Delivered in 2 Hours"
            ]}
            ctaText="Add to Order"
            ctaLink="/order"
          />
          <ServiceTierCard 
            title="DEAL WATCH"
            price="FREE"
            features={[
              "Active Price Drop Tracking",
              "Instant Email Alerts",
              "Target Price Monitoring",
              "10 Alerts per User"
            ]}
            ctaText="Setup Alerts"
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

    </div>
  );
};

export default Landing;
