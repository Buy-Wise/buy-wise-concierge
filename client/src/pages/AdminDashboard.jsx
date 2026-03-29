import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Package, Activity, MessageSquare, RefreshCw, Download, Clock } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const getToken = () => localStorage.getItem('token');
const authHeaders = () => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' });

const tierColors = { BASIC: 'bg-blue-900/50 text-blue-400 border-blue-700', PRO: 'bg-[#D4AF37]/20 text-[#D4AF37] border-[#D4AF37]/40', EXPRESS: 'bg-purple-900/50 text-purple-400 border-purple-700' };
const statusColors = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  PAID: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  GENERATING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  DELIVERED: 'bg-green-500/20 text-green-400 border-green-500/30',
  GENERATION_FAILED: 'bg-red-500/20 text-red-400 border-red-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border-red-500/30',
};
const PIE_COLORS = ['#D4AF37', '#3b82f6', '#a855f7', '#22c55e'];

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [feedbackData, setFeedbackData] = useState({ feedback: [], total: 0, avgRating: 0, helpfulRate: 0, purchaseRate: 0 });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [syncStatus, setSyncStatus] = useState('');

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/orders`, { headers: authHeaders(), credentials: 'include' });
      const data = await res.json();
      if (data.orders) setOrders(data.orders);
    } catch (e) { console.error('Failed to fetch orders', e); }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/analytics`, { headers: authHeaders(), credentials: 'include' });
      const data = await res.json();
      if (data.overview) setAnalytics(data);
      setLastUpdated(new Date());
    } catch (e) { console.error('Failed to fetch analytics', e); }
  }, []);

  const fetchFeedback = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/admin/feedback`, { headers: authHeaders(), credentials: 'include' });
      const data = await res.json();
      if (data.feedback) setFeedbackData(data);
    } catch (e) { console.error('Failed to fetch feedback', e); }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchOrders(), fetchAnalytics(), fetchFeedback()]);
    setLoading(false);
  }, [fetchOrders, fetchAnalytics, fetchFeedback]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh analytics every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => { fetchAnalytics(); fetchOrders(); }, 30000);
    return () => clearInterval(interval);
  }, [fetchAnalytics, fetchOrders]);

  // SSE listener for admin
  useEffect(() => {
    const token = getToken();
    let eventSource;
    let reconnectTimer;
    const connect = () => {
      eventSource = new EventSource(`${API}/api/events/admin?token=${token}`);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ORDER_STATUS_CHANGED') {
            setOrders(prev => prev.map(o =>
              o.id === data.orderId ? { ...o, status: data.newStatus, pdf_url: data.pdfUrl || o.pdf_url } : o
            ));
            fetchAnalytics();
          }
        } catch (e) {}
      };
      eventSource.onerror = () => { eventSource.close(); reconnectTimer = setTimeout(connect, 5000); };
    };
    connect();
    return () => { eventSource?.close(); clearTimeout(reconnectTimer); };
  }, [fetchAnalytics]);

  const handleGenerateReport = async (orderId) => {
    setIsGenerating(true);
    try {
      const res = await fetch(`${API}/api/admin/generate-pdf/${orderId}`, {
        method: 'POST', headers: authHeaders(), credentials: 'include'
      });
      const data = await res.json();
      if (data.success) { alert('PDF Generation started!'); fetchOrders(); }
      else alert('Generation Failed: ' + data.error);
    } catch (e) { alert('Error triggering generation.'); }
    finally { setIsGenerating(false); }
  };

  const handleSyncSheets = async () => {
    setSyncStatus('syncing');
    try {
      const res = await fetch(`${API}/api/admin/sync-sheets`, {
        method: 'POST', headers: authHeaders(), credentials: 'include'
      });
      const data = await res.json();
      setSyncStatus(data.success ? `✅ ${data.message}` : `⚠️ ${data.message}`);
      setTimeout(() => setSyncStatus(''), 5000);
    } catch (e) { setSyncStatus('❌ Sync failed'); setTimeout(() => setSyncStatus(''), 5000); }
  };

  const ov = analytics?.overview || {};

  return (
    <div className="min-h-screen pt-16 bg-[#050505]">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 border-r border-white/10 min-h-screen bg-black fixed left-0 top-16 pt-6">
          <div className="px-4 mb-6">
            <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Admin Panel</div>
            <div className="text-xs text-[#D4AF37]">Buy Wise Admin</div>
          </div>
          {[
            { id: 'orders', icon: Package, label: 'All Orders' },
            { id: 'analytics', icon: Activity, label: 'Analytics' },
            { id: 'feedback', icon: MessageSquare, label: 'Feedback' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-4 py-3 text-left transition-all ${activeTab === tab.id ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-r-2 border-[#D4AF37]' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <tab.icon size={18} className="mr-3" />
              {tab.label}
            </button>
          ))}

          <div className="mt-4 border-t border-white/10 pt-2">
            <button onClick={handleSyncSheets}
              className="w-full flex items-center px-4 py-3 text-left text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              <RefreshCw size={18} className={`mr-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
              Sync Google Sheets
            </button>
            {syncStatus && syncStatus !== 'syncing' && (
              <div className="px-4 text-xs text-gray-400 mt-1">{syncStatus}</div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 flex-1 p-8">
          {/* ORDERS */}
          {activeTab === 'orders' && (
            <div className="flex gap-8">
              <div className={`${selectedOrder ? 'w-1/2' : 'w-full'} transition-all`}>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">All Orders</h2>
                  <button onClick={fetchOrders} className="text-gray-400 hover:text-[#D4AF37] p-2"><RefreshCw size={18} /></button>
                </div>
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
                      {orders.map(order => (
                        <tr key={order.id} onClick={() => setSelectedOrder(order)}
                          className={`border-b border-white/5 hover:bg-[#1a1a1a] cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-[#1a1a1a]' : ''}`}>
                          <td className="py-3 px-4 font-mono text-gray-400 text-sm truncate max-w-[100px]">{order.id.slice(0,8)}</td>
                          <td className="py-3 px-4">
                            <div className="font-medium">{order.name || 'Anonymous'}</div>
                            <div className="text-xs text-gray-500">{order.email}</div>
                          </td>
                          <td className="py-3 px-4 text-sm">{order.product_category}</td>
                          <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-bold border ${tierColors[order.service_tier] || 'bg-gray-800'}`}>{order.service_tier}</span></td>
                          <td className="py-3 px-4 text-sm">₹{(order.amount / 100).toFixed(0)}</td>
                          <td className="py-3 px-4"><span className={`px-2 py-1 rounded-full text-xs font-bold border ${statusColors[order.status] || 'bg-gray-800'}`}>{order.status}</span></td>
                          <td className="py-3 px-4">
                            <button onClick={e => { e.stopPropagation(); setSelectedOrder(order); }}
                              className="text-xs bg-[#D4AF37] text-black px-3 py-1 rounded font-bold hover:bg-[#b8972e]">Manage</button>
                          </td>
                        </tr>
                      ))}
                      {orders.length === 0 && <tr><td colSpan="7" className="text-center py-8 text-gray-500">No orders found</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Detail Panel */}
              {selectedOrder && (
                <div className="w-1/2 bg-[#111] border border-white/10 rounded-2xl p-6 h-fit space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold">{selectedOrder.id.slice(0,8)}</h3>
                      <p className="text-gray-400">{selectedOrder.name} · {selectedOrder.email}</p>
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
                      {isGenerating ? <span className="flex items-center"><span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full mr-2"></span>Generating…</span> : '📄 Generate/Regen Report'}
                    </button>
                    {selectedOrder.pdf_url ? (
                      <a href={`${API}${selectedOrder.pdf_url}`} target="_blank" rel="noreferrer" className="flex justify-center items-center bg-zinc-800 text-white border border-zinc-700 py-2 rounded-lg font-bold hover:bg-zinc-700 text-sm w-full">
                        <Download size={14} className="mr-2" /> Download PDF
                      </a>
                    ) : (
                      <div className="text-xs text-gray-500 text-center italic">Report not generated yet</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS */}
          {activeTab === 'analytics' && analytics && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Analytics</h2>
                <div className="flex items-center gap-3">
                  {lastUpdated && <span className="text-xs text-gray-500 flex items-center"><Clock size={12} className="mr-1" />Updated {lastUpdated.toLocaleTimeString()}</span>}
                  <button onClick={fetchAnalytics} className="text-gray-400 hover:text-[#D4AF37] p-2"><RefreshCw size={18} /></button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'Total Revenue', value: `₹${(ov.totalRevenue || 0).toLocaleString()}`, sub: `₹${ov.revenueToday || 0} today` },
                  { label: 'Total Orders', value: ov.totalOrders || 0, sub: `${ov.ordersThisWeek || 0} this week` },
                  { label: 'Success Rate', value: `${analytics.topMetrics?.reportSuccessRate || 0}%`, sub: `${analytics.topMetrics?.totalDownloads || 0} downloads` },
                  { label: 'Avg Rating', value: `${analytics.avgRating || 0} ⭐`, sub: `${ov.pendingOrders || 0} pending` },
                ].map(stat => (
                  <div key={stat.label} className="bg-[#111] border border-white/10 rounded-xl p-5">
                    <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
                    <div className="text-2xl font-bold text-[#D4AF37]">{stat.value}</div>
                    <div className="text-xs text-gray-500 mt-1">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Line Chart */}
                <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                  <h3 className="font-bold mb-4">Revenue (Last 30 Days)</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={analytics.revenueByDay || []}>
                      <XAxis dataKey="date" stroke="#555" tick={{ fill: '#888', fontSize: 10 }} tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} />
                      <YAxis stroke="#555" tick={{ fill: '#888' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: 8 }} />
                      <Line type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Orders by Tier */}
                <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                  <h3 className="font-bold mb-4">Orders by Tier</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analytics.ordersByTier || []}>
                      <XAxis dataKey="tier" stroke="#555" tick={{ fill: '#888' }} />
                      <YAxis stroke="#555" tick={{ fill: '#888' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: 8 }} />
                      <Bar dataKey="count" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Orders by Category Pie */}
                <div className="bg-[#111] border border-white/10 rounded-xl p-6">
                  <h3 className="font-bold mb-4">Orders by Category</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={analytics.ordersByCategory || []} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, count }) => `${category}: ${count}`}>
                        {(analytics.ordersByCategory || []).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Top Metrics */}
                <div className="bg-[#111] border border-white/10 rounded-xl p-6 space-y-4">
                  <h3 className="font-bold mb-2">Key Metrics</h3>
                  {[
                    { label: 'Conversion Rate', value: `${analytics.topMetrics?.conversionRate || 0}%` },
                    { label: 'Avg Order Value', value: `₹${analytics.topMetrics?.avgOrderValue || 0}` },
                    { label: 'Pending Orders', value: ov.pendingOrders || 0 },
                    { label: 'Failed Generations', value: ov.failedGenerations || 0 },
                  ].map(m => (
                    <div key={m.label} className="flex justify-between items-center border-b border-white/5 pb-2">
                      <span className="text-gray-400 text-sm">{m.label}</span>
                      <span className="font-bold text-[#D4AF37]">{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* FEEDBACK */}
          {activeTab === 'feedback' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Feedback</h2>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#111] border border-white/10 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Total</div>
                  <div className="text-2xl font-bold text-[#D4AF37]">{feedbackData.total}</div>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Avg Rating</div>
                  <div className="text-2xl font-bold text-[#D4AF37]">{feedbackData.avgRating} ⭐</div>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Found Helpful</div>
                  <div className="text-2xl font-bold text-[#D4AF37]">{feedbackData.helpfulRate}%</div>
                </div>
                <div className="bg-[#111] border border-white/10 rounded-xl p-4">
                  <div className="text-sm text-gray-400">Purchased</div>
                  <div className="text-2xl font-bold text-[#D4AF37]">{feedbackData.purchaseRate}%</div>
                </div>
              </div>

              {/* Feedback List */}
              <div className="space-y-3">
                {feedbackData.feedback.length === 0 && (
                  <div className="bg-[#111] border border-white/10 rounded-xl p-8 text-center text-gray-500">No feedback submitted yet</div>
                )}
                {feedbackData.feedback.map((fb) => (
                  <div key={fb.id} className="bg-[#111] border border-white/10 rounded-xl p-5">
                    <div className="flex justify-between mb-2">
                      <div>
                        <span className="font-bold">{fb.customer_name}</span>
                        <span className="text-xs text-gray-500 ml-2">{fb.customer_email}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-400">{fb.product_category} • {fb.service_tier}</span>
                        {fb.did_purchase && <span className="text-xs bg-green-900/40 text-green-400 border border-green-700 px-2 py-0.5 rounded-full">Purchased</span>}
                        {fb.was_helpful && <span className="text-xs bg-blue-900/40 text-blue-400 border border-blue-700 px-2 py-0.5 rounded-full">Helpful</span>}
                        <span className="text-[#D4AF37]">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
                      </div>
                    </div>
                    {fb.comments && <p className="text-gray-400 text-sm">{fb.comments}</p>}
                    <div className="text-xs text-gray-600 mt-2">{fb.order_id_short} · {new Date(fb.submitted_at).toLocaleDateString('en-IN')}</div>
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
