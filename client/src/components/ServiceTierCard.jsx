import React from 'react';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceTierCard = ({ title, price, period, features, highlighted, ctaText, ctaLink }) => {
  return (
    <div className={`p-8 rounded-2xl flex flex-col relative ${highlighted ? 'bg-[#D4AF37] text-black shadow-2xl shadow-[#D4AF37]/20 border-2 border-[#D4AF37] md:-translate-y-4' : 'bg-[#111111] text-white border border-white/10'}`}>
      {highlighted && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black text-[#D4AF37] text-xs font-bold tracking-widest uppercase py-1 px-4 rounded-full border border-[#D4AF37]">
          Most Popular
        </div>
      )}
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <div className="text-4xl font-bold mb-6">
        ₹{price}{period && <span className="text-lg font-normal opacity-70">{period}</span>}
      </div>
      <ul className="mb-8 flex-1 space-y-4">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <Check className={`mr-3 shrink-0 ${highlighted ? 'text-black' : 'text-[#D4AF37]'}`} size={20} />
            <span className={highlighted ? 'font-medium' : 'text-gray-300'}>{feature}</span>
          </li>
        ))}
      </ul>
      <Link 
        to={ctaLink} 
        className={`block text-center py-3 px-6 rounded-lg font-bold transition-all ${
          highlighted 
            ? 'bg-black text-[#D4AF37] hover:bg-gray-900' 
            : 'bg-[#1a1a1a] text-white hover:bg-[#2a2a2a] border border-white/10 hover:border-[#D4AF37]/50'
        }`}
      >
        {ctaText}
      </Link>
    </div>
  );
};

export default ServiceTierCard;
