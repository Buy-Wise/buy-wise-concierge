import React from 'react';
import { Package, Bell, FileText, Download, X } from 'lucide-react';

const Dashboard = () => {
  // Mock data for UI demonstration
  const orders = [
    { id: 'ORD-98231', product_category: 'LAPTOP', service_tier: 'PRO', status: 'DELIVERED', created_at: '2026-03-24', pdf_url: '#' },
    { id: 'ORD-98232', product_category: 'PHONE', service_tier: 'BASIC', status: 'IN_PROGRESS', created_at: '2026-03-25', pdf_url: null },
  ];

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">PENDING</span>;
      case 'PAID': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-500 border border-blue-500/30">PAID</span>;
      case 'IN_PROGRESS': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-500 border border-blue-500/30">IN PROGRESS</span>;
      case 'DELIVERED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-500 border border-green-500/30">DELIVERED</span>;
      case 'CANCELLED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-500 border border-red-500/30">CANCELLED</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-32 min-h-screen">
      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-[#111] p-6 rounded-2xl border border-white/10">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-[#D4AF37] rounded-full flex items-center justify-center text-black text-2xl font-bold border-2 border-white/20">
                RS
              </div>
              <div>
                <h2 className="text-xl font-bold">Rahul S.</h2>
                <p className="text-sm text-gray-400">rahul@example.com</p>
              </div>
            </div>
            
            <div className="space-y-4 text-sm">
               <div className="flex justify-between border-t border-white/10 pt-4">
                 <span className="text-gray-400">Total Orders</span>
                 <span className="font-bold cursor-default hover:text-[#D4AF37]">2</span>
               </div>
               <div className="flex justify-between border-t border-white/10 pt-4">
                 <span className="text-gray-400">Language</span>
                 <span className="font-bold cursor-default hover:text-[#D4AF37]">English (EN)</span>
               </div>
            </div>
            <button className="w-full mt-6 bg-[#1a1a1a] text-white py-2 rounded-lg border border-white/20 hover:bg-[#2a2a2a] transition-all">Edit Profile</button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          
          <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center">
              <Package className="text-[#D4AF37] mr-3" />
              <h2 className="text-xl font-bold">My Orders</h2>
            </div>
            <div className="divide-y divide-white/5">
              {orders.map((order) => (
                <div key={order.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-[#1a1a1a] transition-colors">
                  <div className="mb-4 md:mb-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="font-mono text-gray-400">{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <div className="font-bold text-lg mb-1">{order.service_tier} Report - {order.product_category}</div>
                    <div className="text-sm text-gray-400">Ordered on {order.created_at}</div>
                  </div>
                  
                  <div className="flex space-x-3">
                    {order.status === 'DELIVERED' ? (
                      <>
                        <button className="flex items-center space-x-2 bg-[#D4AF37] text-black px-4 py-2 rounded-lg font-bold hover:bg-[#b8972e] shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                          <FileText size={18} /> <span>View Preview</span>
                        </button>
                        <button className="flex items-center space-x-2 bg-[#1a1a1a] text-white border border-white/20 px-4 py-2 rounded-lg font-bold hover:bg-[#2a2a2a] hover:text-[#D4AF37] transition-all">
                          <Download size={18} />
                        </button>
                      </>
                    ) : (
                      <div className="text-gray-500 italic text-sm flex items-center">
                         <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-2"></div>
                         Report is being generated...
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center">
                <Bell className="text-[#D4AF37] mr-3" />
                <h2 className="text-xl font-bold">Active Alerts (Deal Watch)</h2>
              </div>
              <button className="text-sm text-[#D4AF37] hover:text-white font-medium px-3 py-1 border border-[#D4AF37] rounded-lg">Add Alert</button>
            </div>
            <div className="p-6">
              <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex items-center justify-between hover:border-white/30 transition-all">
                <div>
                  <div className="font-bold mb-1">MacBook Air M2 256GB</div>
                  <div className="text-sm text-gray-400">Target: ₹75,000 <span className="mx-2">•</span> Current: ₹82,900</div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="px-2 py-1 rounded bg-green-900/30 text-green-500 text-xs border border-green-500/30 font-bold">ACTIVE</span>
                  <button className="text-gray-500 hover:text-red-500 transition-colors"><X size={20} /></button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
