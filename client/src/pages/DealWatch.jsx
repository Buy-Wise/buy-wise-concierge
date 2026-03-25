import React, { useState } from 'react';
import { Bell, Plus, X } from 'lucide-react';

const DealWatch = () => {
  const [alerts, setAlerts] = useState([
    { id: 1, product_name: 'Samsung Galaxy S24', target_price: 60000, current_price: 68000, status: 'ACTIVE' },
    { id: 2, product_name: 'Apple AirPods Pro 2', target_price: 22000, current_price: 26000, status: 'ACTIVE' },
  ]);
  const [form, setForm] = useState({ product_name: '', target_price: '' });
  const [adding, setAdding] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.product_name || !form.target_price) return;
    setAlerts([...alerts, { id: Date.now(), product_name: form.product_name, target_price: parseInt(form.target_price), current_price: null, status: 'ACTIVE' }]);
    setForm({ product_name: '', target_price: '' });
    setAdding(false);
  };

  const cancelAlert = (id) => setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a));

  return (
    <div className="max-w-3xl mx-auto px-4 py-32 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold mb-2">Deal Watch</h1>
          <p className="text-gray-400">Get WhatsApp alerts when your product drops to target price.</p>
        </div>
        <button onClick={() => setAdding(!adding)} className="flex items-center bg-[#D4AF37] text-black px-5 py-2.5 rounded-lg font-bold hover:bg-[#b8972e]">
          <Plus size={18} className="mr-2" /> Add Alert
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="bg-[#111] border border-[#D4AF37]/30 rounded-2xl p-6 mb-6 space-y-4 shadow-lg shadow-[#D4AF37]/5">
          <h3 className="font-bold text-[#D4AF37]">New Price Alert</h3>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Product Name</label>
            <input required value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} type="text"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:outline-none"
              placeholder="e.g. MacBook Air M3, iPhone 16 Pro..." />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Your Target Price (₹)</label>
            <input required value={form.target_price} onChange={e => setForm({...form, target_price: e.target.value})} type="number"
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:outline-none"
              placeholder="e.g. 75000" />
          </div>
          <div className="flex space-x-4">
            <button type="submit" className="flex-1 bg-[#D4AF37] text-black py-2 rounded-lg font-bold hover:bg-[#b8972e]">Add Alert</button>
            <button type="button" onClick={() => setAdding(false)} className="flex-1 bg-[#1a1a1a] text-white border border-white/10 py-2 rounded-lg font-bold hover:bg-[#2a2a2a]">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {alerts.map(alert => (
          <div key={alert.id} className={`bg-[#111] border rounded-xl p-5 flex items-center justify-between transition-all ${alert.status === 'CANCELLED' ? 'border-white/5 opacity-40' : 'border-white/10 hover:border-white/20'}`}>
            <div>
              <div className="font-bold mb-1 flex items-center">
                <Bell size={16} className="text-[#D4AF37] mr-2" /> {alert.product_name}
              </div>
              <div className="text-sm text-gray-400">
                Target: <span className="text-white font-bold">₹{alert.target_price.toLocaleString('en-IN')}</span>
                {alert.current_price && <> · Current: <span className="text-red-400">₹{alert.current_price.toLocaleString('en-IN')}</span></>}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`text-xs font-bold px-2 py-1 rounded-full border ${alert.status === 'ACTIVE' ? 'bg-green-900/30 text-green-400 border-green-700' : 'bg-gray-900 text-gray-500 border-gray-700'}`}>
                {alert.status}
              </span>
              {alert.status === 'ACTIVE' && (
                <button onClick={() => cancelAlert(alert.id)} className="text-gray-500 hover:text-red-400 transition-colors"><X size={18} /></button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-[#111] border border-[#D4AF37]/20 rounded-xl p-6 text-center">
        <h3 className="font-bold text-[#D4AF37] mb-2">₹199 / month</h3>
        <p className="text-gray-400 text-sm mb-4">Unlimited active price alerts across any product. Cancel anytime.</p>
        <button className="bg-[#D4AF37] text-black px-8 py-2.5 rounded-lg font-bold hover:bg-[#b8972e]">Subscribe to Deal Watch</button>
      </div>
    </div>
  );
};

export default DealWatch;
