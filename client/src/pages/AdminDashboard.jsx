import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Activity, MessageSquare, RefreshCw } from 'lucide-react';

// Mock data for UI demonstration
const mockOrders = [
  { id: 'ORD-001', name: 'Rahul S.', email: 'r@example.com', phone_whatsapp: '9876543210', product_category: 'LAPTOP', service_tier: 'PRO', status: 'PAID', amount: 34900, pdf_url: null },
  { id: 'ORD-002', name: 'Priya M.', email: 'p@example.com', phone_whatsapp: '9123456789', product_category: 'PHONE', service_tier: 'BASIC', status: 'IN_PROGRESS', amount: 19900, pdf_url: null },
  { id: 'ORD-003', name: 'Karthik V.', email: 'k@example.com', phone_whatsapp: '9988776655', product_category: 'LAPTOP', service_tier: 'PRO', status: 'DELIVERED', amount: 34900, pdf_url: '/sample.pdf' },
];

const tierColors = { BASIC: 'bg-blue-900/50 text-blue-400 border-blue-700', PRO: 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40', EXPRESS: 'bg-purple-900/50 text-purple-400 border-purple-700' };
const statusColors = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PAID: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  IN_PROGRESS: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  DELIVERED: 'bg-green-500/20 text-green-400 border-green-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const analytics = [
  { name: 'Mon', orders: 2 }, { name: 'Tue', orders: 4 }, { name: 'Wed', orders: 3 },
  { name: 'Thu', orders: 7 }, { name: 'Fri', orders: 5 }, { name: 'Sat', orders: 9 }, { name: 'Sun', orders: 6 },
];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reportPreview, setReportPreview] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = async (orderId) => {
    setIsGenerating(true);
    // Simulate API call delay
    await new Promise(r => setTimeout(r, 1500));
    setReportPreview(`## Buy Wise Report – ${orderId}\n\n**Budget:** ₹30,000 – ₹80,000\n**Category:** LAPTOP\n\n### 🏆 #1 — MacBook Air M2 (8GB/256GB) — ₹1,09,900\n✅ Excellent performance for most tasks\n✅ Fanless, runs silent\n✅ Best battery life in class (18 hrs)\n❌ Expensive; limited RAM upgrade path\n❌ Only 2 USB-C ports\n\n### #2 — Dell XPS 13 (i7/16GB/512GB) — ₹1,24,990\n✅ Premium build quality\n✅ Vivid 13.4" display\n❌ Runs warm under load\n\n### Comparison Table\n| Feature | MacBook Air M2 | Dell XPS 13 |\n|---|---|---|\n| Performance | 9/10 | 8/10 |\n| Battery | 10/10 | 7/10 |\n| Value | 8/10 | 7/10 |\n| Overall | **9/10** | 7.5/10 |\n\n### 🏆 Best Pick: MacBook Air M2\nGiven your primary use case (video editing/programming), the M2 chip's media engine makes it significantly faster for rendering while maintaining silent operation. The battery life ensures all-day productivity without charger anxiety.`);
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen pt-16 bg-[#050505]">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 min-h-screen bg-black fixed left-0 top-16 pt-6">
          <div className="px-4 mb-6">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-3">Admin Panel</div>
          </div>
          {[
            { id: 'orders', icon: Package, label: 'Orders' },
            { id: 'analytics', icon: Activity, label: 'Analytics' },
            { id: 'feedback', icon: MessageSquare, label: 'Feedback' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-4 py-3 text-left transition-all ${activeTab === tab.id ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-r-2 border-[#D4AF37]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <tab.icon size={18} className="mr-3" />
              {tab.label}
            </button>
          ))}
          <button onClick={() => alert('Syncing to Google Sheets...')}
            className="w-full flex items-center px-4 py-3 text-left text-gray-400 hover:text-white hover:bg-white/5 transition-all mt-4 border-t border-white/10">
            <RefreshCw size={18} className="mr-3" />
            Sync Google Sheets
          </button>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">

          {/* Orders Panel */}
          {activeTab === 'orders' && (
            <div className="flex gap-8">
              {/* Orders Table */}
              <div className={`${selectedOrder ? 'w-1/2' : 'w-full'} transition-all`}>
                <h2 className="text-2xl font-bold mb-6">All Orders</h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-left">
                        <th className="py-3 px-4 text-gray-400 text-sm font-medium">Order ID</th>
                        <th className="py-3 px-4 text-gray-400 text-sm font-medium">Customer</th>
                        <th className="py-3 px-4 text-gray-400 text-sm font-medium">Product</th>
                        <th className="py-3 px-4 text-gray-400 text-sm font-medium">Tier</th>
                        <th className="py-3 px-4 text-gray-400 text-sm font-medium">Amount</th>
                        <th className="py-3 px-4 text-gray-400 text-sm font-medium">Status</th>
                        <th className="py-3 px-4 text-gray-400 text-sm font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockOrders.map(order => (
                        <tr key={order.id} onClick={() => setSelectedOrder(order)}
                          className={`border-b border-white/5 hover:bg-[#1a1a1a] cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-[#1a1a1a]' : ''}`}>
                          <td className="py-3 px-4 font-mono text-gray-400 text-sm">{order.id}</td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{order.name}</div>
                            <div className="text-xs text-gray-500">{order.phone_whatsapp}</div>
                          </td>
                          <td className="py-3 px-4 text-sm">{order.product_category}</td>
                          <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-bold border ${tierColors[order.service_tier]}`}>{order.service_tier}</span></td>
                          <td className="py-3 px-4 text-sm">₹{(order.amount / 100).toFixed(0)}</td>
                          <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-bold border ${statusColors[order.status]}`}>{order.status}</span></td>
                          <td className="py-3 px-4">
                            <button onClick={e => { e.stopPropagation(); setSelectedOrder(order); setActiveTab('orders'); }}
                              className="text-xs bg-[#D4AF37] text-black px-3 py-1 rounded font-bold hover:bg-[#b8972e]">
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Detail Panel */}
              {selectedOrder && (
                <div className="w-1/2 bg-[#111] border border-white/10 rounded-2xl p-6 h-fit space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{selectedOrder.id}</h3>
                      <p className="text-gray-400">{selectedOrder.name} · {selectedOrder.phone_whatsapp}</p>
                    </div>
                    <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-white">✕</button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><span className="text-gray-500">Category</span><div className="font-bold">{selectedOrder.product_category}</div></div>
                    <div><span className="text-gray-500">Tier</span><div className="font-bold">{selectedOrder.service_tier}</div></div>
                    <div><span className="text-gray-500">Amount</span><div className="font-bold text-[#D4AF37]">₹{(selectedOrder.amount / 100).toFixed(0)}</div></div>
                    <div><span className="text-gray-500">Status</span><div><span className={`px-2 py-1 rounded-full text-xs font-bold border ${statusColors[selectedOrder.status]}`}>{selectedOrder.status}</span></div></div>
                  </div>

                  <div className="space-y-3 border-t border-white/10 pt-4">
                    <h4 className="font-bold">Actions</h4>
                    <button onClick={() => handleGenerateReport(selectedOrder.id)}
                      className="w-full bg-[#D4AF37] text-black py-2 rounded-lg font-bold hover:bg-[#b8972e] flex justify-center items-center"
                      disabled={isGenerating}>
                      {isGenerating ? <span className="flex items-center"><span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full mr-2"></span>Generating…</span> : '🤖 Generate AI Report'}
                    </button>
                    <button className="w-full bg-[#1a1a1a] border border-white/10 text-white py-2 rounded-lg font-bold hover:bg-[#2a2a2a]" onClick={() => alert('Converting to PDF...')}>
                      📄 Convert to PDF
                    </button>
                    <button className="w-full bg-green-900 text-green-400 border border-green-700 py-2 rounded-lg font-bold hover:bg-green-800" onClick={() => alert('Sending via WhatsApp...')}>
                      💬 Send via WhatsApp
                    </button>
                  </div>

                  {reportPreview && (
                    <div className="border-t border-white/10 pt-4">
                      <h4 className="font-bold mb-3">Report Preview</h4>
                      <div className="bg-[#0a0a0a] rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto font-mono text-xs leading-relaxed border border-white/5">
                        {reportPreview}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Analytics Panel */}
          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Analytics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {[
                  { label: 'Total Orders', value: '24', sub: '+7 this week' },
                  { label: 'Total Revenue', value: '₹7,854', sub: 'Across all orders' },
                  { label: 'Avg Rating', value: '4.7 ⭐', sub: 'From 15 reviews' },
                  { label: 'Delivered', value: '18', sub: '75% delivery rate' },
                ].map(stat => (
                  <div key={stat.label} className="bg-[#111] border border-white/10 rounded-xl p-6">
                    <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
                    <div className="text-3xl font-bold text-[#D4AF37]">{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{stat.sub}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                <h3 className="font-bold mb-4">Orders This Week</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics}>
                    <XAxis dataKey="name" stroke="#555" tick={{ fill: '#888' }} />
                    <YAxis stroke="#555" tick={{ fill: '#888' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: 8 }} />
                    <Bar dataKey="orders" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Feedback Panel */}
          {activeTab === 'feedback' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Feedback</h2>
              <div className="space-y-4">
                {[
                  { name: 'Rahul S.', rating: 5, comment: 'Perfect recommendation! Saved me hours of research.', did_purchase: true },
                  { name: 'Priya M.', rating: 4, comment: 'Very detailed but took a bit longer than expected.', did_purchase: false },
                ].map((fb, i) => (
                  <div key={i} className="bg-[#111] border border-white/10 rounded-xl p-6">
                    <div className="flex justify-between mb-2">
                      <span className="font-bold">{fb.name}</span>
                      <div className="flex items-center space-x-3">
                        {fb.did_purchase && <span className="text-xs bg-green-900/40 text-green-400 border border-green-700 px-2 py-1 rounded-full">Purchased</span>}
                        <span className="text-[#D4AF37]">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm">{fb.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
