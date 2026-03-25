import React from 'react';
import { Link } from 'react-router-dom';

const SampleReport = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-32">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Sample Buy Wise Report</h1>
        <p className="text-gray-400">See exactly what you'll receive — a structured, AI-researched buying analysis.</p>
      </div>

      <div className="relative">
        {/* Report Preview */}
        <div className="bg-white text-gray-900 rounded-2xl overflow-hidden shadow-2xl shadow-[#D4AF37]/10 border border-white/10">
          {/* Header */}
          <div className="bg-black text-white p-8 flex justify-between items-start">
            <div>
              <span className="text-2xl font-bold tracking-wider">BUY<span className="text-[#D4AF37]">WISE</span></span>
              <div className="text-gray-400 text-sm mt-1">Smart Buy Report</div>
            </div>
            <div className="text-right text-sm text-gray-400">
              <div>Order #ORD-SAMPLE</div>
              <div>March 2026</div>
              <div>Customer: Rahul S.</div>
            </div>
          </div>

          <div className="p-8 space-y-8">
            {/* Req Summary */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-black border-b-2 border-[#D4AF37] pb-2">Your Requirements Summary</h2>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                <div><span className="font-medium text-gray-500">Budget:</span> <span className="font-bold">₹70,000 – ₹1,00,000</span></div>
                <div><span className="font-medium text-gray-500">Category:</span> <span className="font-bold">Laptop</span></div>
                <div><span className="font-medium text-gray-500">Use Case:</span> <span className="font-bold">Video Editing + Programming</span></div>
                <div><span className="font-medium text-gray-500">Priorities:</span> <span className="font-bold">Performance, Battery, Portability</span></div>
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-black border-b-2 border-[#D4AF37] pb-2">Top Recommendations</h2>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-xl p-5 hover:border-[#D4AF37] transition-colors">
                  <div className="flex justify-between mb-3">
                    <span className="font-bold text-lg">1. MacBook Air M2 (8GB)</span>
                    <span className="font-bold text-[#D4AF37]">₹1,09,900</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-green-600 mr-1">✅</span> Silent, fanless operation</div>
                    <div><span className="text-green-600 mr-1">✅</span> Best-in-class battery (18 hrs)</div>
                    <div><span className="text-green-600 mr-1">✅</span> M2 chip excels at video rendering</div>
                    <div><span className="text-red-500 mr-1">❌</span> Only 2 USB-C ports</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-black border-b-2 border-[#D4AF37] pb-2">Comparison Table</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-black text-[#D4AF37]">
                      <th className="text-left p-3">Feature</th>
                      <th className="p-3">MacBook Air M2</th>
                      <th className="p-3">Dell XPS 13</th>
                      <th className="p-3">HP Spectre x360</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[['Performance', '9/10', '8/10', '7/10'],['Battery', '10/10', '7/10', '8/10'],['Value', '8/10', '6/10', '7/10'],['Build', '9/10', '9/10', '8/10'],['Overall', '9/10', '7.5/10', '7.5/10']].map(([feat,...vals]) => (
                      <tr key={feat} className="border-b border-gray-100">
                        <td className="p-3 font-medium">{feat}</td>
                        {vals.map((v,i) => <td key={i} className="p-3 text-center font-bold">{v}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Blurred bottom */}
          <div className="relative">
            <div className="p-8 blur-sm select-none pointer-events-none bg-white">
              <h2 className="text-xl font-bold mb-3 text-black">🏆 Buy Wise Recommendation</h2>
              <p className="text-gray-600">Given your primary focus on video editing and programming, the MacBook Air M2 is the clear winner. The M2 chip's dedicated media engine renders video significantly faster than any x86 competitor at this price point, while its fanless design ensures you never hear it struggle...</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent flex flex-col items-center justify-end pb-10">
              <p className="text-white font-bold text-xl mb-2">Get your personalised report</p>
              <p className="text-gray-400 text-sm mb-6">Unlock the full recommendation, buying guide, and price tips.</p>
              <Link to="/order" className="bg-[#D4AF37] text-black px-8 py-3 rounded-lg font-bold hover:bg-[#b8972e] shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                Get My Report — From ₹199
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleReport;
