import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Pickaxe, MessageCircle, AlertTriangle, IndianRupee, Clock, ArrowRight } from 'lucide-react';
import ServiceTierCard from '../components/ServiceTierCard';
import { HeroGeometric } from "@/components/ui/shape-landing-hero";

const Landing = () => {
  return (
    <div className="w-full bg-[#050505] text-[#FAFAFA]">
      
      {/* 1. HERO SECTION */}
      <HeroGeometric 
        badge="Stop guessing. Start buying right."
        title1="Skip the Endless Research."
        title2="Buy the Perfect Product."
        subtitle="Protect your ₹50,000 investment with certainty. Our AI + Expert-Verified reports cut through the noise and give you the one clear answer so you buy right, every time."
      >
        <div className="flex justify-center mt-6 w-full">
          <Link to="/order" className="inline-flex items-center justify-center bg-[#D4AF37] text-black w-full sm:w-auto px-10 py-5 rounded-2xl font-bold text-xl hover:bg-[#b8972e] shadow-[0_4px_30px_rgba(212,175,55,0.4)] transition-all hover:-translate-y-1">
            Get My Recommendation <ArrowRight className="ml-2 w-6 h-6" />
          </Link>
        </div>
      </HeroGeometric>

      {/* 2. PROBLEM SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-white/5 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Buying Online is Broken</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { delay: 0, icon: <Pickaxe className="text-red-500" size={28} />, color: "bg-red-500/10", border: 'hover:border-red-500/30', title: "Too Many Choices", text: "100+ laptops. 50+ phones. Endless tabs open. It takes hours of research just to narrow down the options." },
            { delay: 0.2, icon: <MessageCircle className="text-yellow-500" size={28} />, color: "bg-yellow-500/10", border: 'hover:border-yellow-500/30', title: "Fake & Paid Reviews", text: "You can't trust Amazon reviews, and YouTube influencers are usually paid by brands to say nice things." },
            { delay: 0.4, icon: <AlertTriangle className="text-blue-500" size={28} />, color: "bg-blue-500/10", border: 'hover:border-blue-500/30', title: "Fear of Regret", text: "What if you buy something and find a better, cheaper option two days later? Buying blind leads to regret." }
          ].map((item, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 50 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6, delay: item.delay }}
               className={`bg-[#111] p-8 rounded-2xl border border-white/10 ${item.border} transition-colors`}
             >
                <div className={`${item.color} w-16 h-16 rounded-full flex items-center justify-center mb-6`}>
                   {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.text}</p>
             </motion.div>
          ))}
        </div>
      </section>

      {/* 3. SOLUTION SECTION */}
      <section className="py-24 bg-[#0A0A0A] border-y border-white/5 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
            <span className="text-white">The </span>
            <span className="text-[#D4AF37]">Buy Wise</span>
            <span className="text-white"> Solution</span>
          </h2>
          <p className="text-xl text-gray-400 leading-relaxed max-w-3xl mx-auto">
            We do the boring, confusing research for you. Tell us what you need and your budget. 
            Our intelligent system scans thousands of data points to find the <span className="text-[#D4AF37] font-bold">exact single product</span> you should buy. 
            No jargon. No affiliate bias. Just the clear truth.
          </p>
        </motion.div>
      </section>

      {/* 4. HOW IT WORKS SECTION */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-extrabold mb-4 text-[#D4AF37]">How It Works</h2>
          <p className="text-gray-400 text-lg">Three steps from confusion to clarity.</p>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-12 relative">
          <div className="hidden md:block absolute top-[15%] left-1/6 right-1/6 border-t-2 border-dashed border-white/10 z-0"></div>
          
          {[
            { step: 1, title: "Tell us what you need", text: "Fill out a simple 1-minute form about your budget and how you plan to use the product." },
            { step: 2, title: "We do the research", text: "We analyze specs, real-world issues, and alternatives to find the exact match for your needs." },
            { step: 3, title: "You get the right decision", text: "Receive a clear, simple PDF showing you what to buy and exactly why you should buy it." }
          ].map((item, i) => (
             <motion.div 
               key={i}
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.5, delay: i * 0.2 }}
               className="relative z-10 text-center space-y-4 bg-[#050505] p-6"
             >
                <div className="w-16 h-16 bg-[#111] border-2 border-[#D4AF37] text-[#D4AF37] rounded-full flex items-center justify-center text-2xl font-bold mx-auto">{item.step}</div>
                <h3 className="text-xl font-bold">{item.title}</h3>
                <p className="text-gray-400">{item.text}</p>
             </motion.div>
          ))}
        </div>
      </section>

      {/* 5. VALUE SECTION */}
      <section className="py-24 bg-[#0A0A0A] border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">Why pay for research?</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <Clock className="text-[#D4AF37] mt-1 mr-4 shrink-0" size={24} />
                  <div>
                    <h4 className="text-xl font-bold mb-1">Save your time</h4>
                    <p className="text-gray-400">Stop watching endless tech videos. We've already done the deep dive.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <IndianRupee className="text-[#D4AF37] mt-1 mr-4 shrink-0" size={24} />
                  <div>
                    <h4 className="text-xl font-bold mb-1">Save your money</h4>
                    <p className="text-gray-400">A ₹249 report can prevent you from making a ₹50,000 mistake.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <CheckCircle2 className="text-[#D4AF37] mt-1 mr-4 shrink-0" size={24} />
                  <div>
                    <h4 className="text-xl font-bold mb-1">Zero confusion</h4>
                    <p className="text-gray-400">We speak plain English (or Hindi, or Tamil). No technical jargon.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <ShieldCheck className="text-[#D4AF37] mt-1 mr-4 shrink-0" size={24} />
                  <div>
                    <h4 className="text-xl font-bold mb-1">No regret buying</h4>
                    <p className="text-gray-400">Buy with total confidence knowing you got the best value for your money.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* 8. SAMPLE OUTPUT SECTION */}
            <div className="bg-[#111] p-8 rounded-2xl border border-white/10 shadow-2xl relative">
              <div className="absolute top-0 right-0 bg-[#D4AF37] text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">SAMPLE REPORT PAGE</div>
              <h3 className="text-gray-400 text-sm mb-2 font-mono uppercase tracking-widest">Our Verdict</h3>
              <div className="text-2xl font-bold mb-4 pt-4 border-t border-white/10">🏆 Best Pick: MacBook Air M2 (16GB RAM)</div>
              <p className="text-gray-300 font-medium mb-4">Why you should buy this:</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start"><CheckCircle2 className="text-green-500 mr-2 shrink-0" size={20} /><span className="text-gray-300">Easily handles your heavy video editing needs.</span></li>
                <li className="flex items-start"><CheckCircle2 className="text-green-500 mr-2 shrink-0" size={20} /><span className="text-gray-300">Will last you 5+ years without slowing down.</span></li>
                <li className="flex items-start"><CheckCircle2 className="text-green-500 mr-2 shrink-0" size={20} /><span className="text-gray-300">Currently selling at its lowest price of the year.</span></li>
              </ul>
              
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-center">
                <span className="text-green-400 font-bold uppercase tracking-widest block mb-1">Final Decision</span>
                <span className="text-xl font-bold">BUY NOW</span>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 6. PRICING SECTION */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Affordable Clarity</h2>
          <p className="text-gray-400">Guaranteed satisfaction. If you're not satisfied, we revise your report for free.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <ServiceTierCard 
            title="QUICK DECISION"
            price="149"
            features={[
              "1 Perfect Product Recommendation",
              "Simple plain-English explanation",
              "Delivered as PDF",
              "Free Report Revision"
            ]}
            ctaText="Get Quick Decision"
            ctaLink="/order?tier=basic"
          />
          <ServiceTierCard 
            title="NO-REGRET DECISION"
            price="249"
            highlighted={true}
            features={[
              "Top 3 ranked options for you",
              "Hidden issues to watch out for",
              "Better alternatives mapped out",
              "Best time to buy analysis",
              "Free Report Revision"
            ]}
            ctaText="Get No-Regret Decision"
            ctaLink="/order?tier=pro"
          />
        </div>
      </section>

      {/* 7. TRUST SECTION */}
      <section className="py-16 bg-[#0A0A0A] border-y border-white/5 text-center px-4">
        <div className="max-w-3xl mx-auto">
           <h3 className="text-2xl font-bold mb-4">Powered by AI + Human Intelligence</h3>
           <p className="text-gray-400 text-lg">
             We don't promote products. We don't take brand sponsorships. <br />
             <span className="text-[#D4AF37] font-bold">We only recommend based on your exact needs.</span>
           </p>
        </div>
      </section>

      {/* 9. FINAL CTA */}
      <section className="py-24 text-center px-4">
        <div className="max-w-3xl mx-auto p-12 bg-gradient-to-br from-[#111] to-[#0A0A0A] border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl"></div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-6 relative z-10">Don't buy blindly.</h2>
          <p className="text-xl text-gray-400 mb-10 relative z-10">Get clarity before you spend your hard-earned money.</p>
          
          <motion.div
            animate={{ scale: [1, 1.05, 1], boxShadow: ["0 10px 30px rgba(212,175,55,0.3)", "0 15px 40px rgba(212,175,55,0.6)", "0 10px 30px rgba(212,175,55,0.3)"] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="inline-block relative z-10 rounded-2xl"
          >
            <Link to="/order" className="inline-flex items-center bg-[#D4AF37] text-black px-12 py-6 rounded-2xl font-bold text-2xl hover:bg-[#b8972e] transition-colors shadow-2xl">
              Tell Us What You Need <ArrowRight className="ml-3 w-6 h-6" />
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
