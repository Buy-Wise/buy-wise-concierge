import React, { useState, useEffect } from 'react';
import { Package, Bell, FileText, Download, X, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'alerts', 'profile'
  const navigate = useNavigate();
    const [user, setUser] = useState({ name: 'Rahul S.', email: 'rahul@example.com', language_preference: 'EN', initial: 'RS', alertsCount: 0 });
  const [profileForm, setProfileForm] = useState({ name: 'Rahul S.', language_preference: 'EN', password: '', confirmPassword: '' });
  const [timers, setTimers] = useState({}); // orderId -> seconds remaining

  const syncPayment = async (orderId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payments/sync/${orderId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success && data.status === 'PAID') {
        // Success! Dashboard will update via SSE, but let's update local state too
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'PAID' } : o));
      }
    } catch (e) {
      console.error('Sync failed', e);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const [userRes, ordersRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/orders/my`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        const userData = await userRes.json();
        const ordersData = await ordersRes.json();

        if (userData.user) {
          const name = userData.user.name || 'User';
          setUser({ ...userData.user, initial: name.substring(0,2).toUpperCase(), alertsCount: 0 });
          setProfileForm({ name: name, language_preference: userData.user.language_preference || 'EN', password: '', confirmPassword: '' });
        }
        if (ordersData.orders) {
          setOrders(ordersData.orders);
          
          // Automatic Sync for PENDING orders
          ordersData.orders.forEach(o => {
            if (o.status === 'PENDING') syncPayment(o.id);
          });

          // Initialize timers for orders that are currently GENERATING
          const initialTimers = {};
          ordersData.orders.forEach(o => {
            if (o.status === 'GENERATING' || o.status === 'PAID') {
              initialTimers[o.id] = 120; // 2 minutes
            }
          });
          setTimers(initialTimers);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);


  // Countdown effect
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(id => {
          if (next[id] > 0) next[id] -= 1;
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // SSE realtime listener
  useEffect(() => {
    if (!user?.id) return;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const token = localStorage.getItem('token');
    let eventSource;
    let reconnectTimer;

    const connect = () => {
      eventSource = new EventSource(`${baseUrl}/api/events/user/${user.id}?token=${token}`);
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ORDER_STATUS_CHANGED') {
            setOrders(prev => prev.map(o =>
              o.id === data.orderId ? { ...o, status: data.newStatus, pdf_url: data.pdfUrl || o.pdf_url } : o
            ));
            
            // If it just started generating, start a timer
            if (data.newStatus === 'GENERATING' || data.newStatus === 'PAID') {
              setTimers(prev => ({ ...prev, [data.orderId]: 120 }));
            }
            // If finished, remove timer
            if (data.newStatus === 'DELIVERED' || data.newStatus === 'GENERATION_FAILED') {
              setTimers(prev => {
                const next = { ...prev };
                delete next[data.orderId];
                return next;
              });
            }
          }
        } catch (e) {}
      };
      eventSource.onerror = () => {
        eventSource.close();
        reconnectTimer = setTimeout(connect, 5000);
      };
    };
    connect();
    return () => { eventSource?.close(); clearTimeout(reconnectTimer); };
  }, [user?.id]);


  const handleDownload = (pdfUrl) => {
    if (!pdfUrl) return alert("Report is being prepared. Please refresh in a moment.");
    window.open(pdfUrl, '_blank', 'noopener,noreferrer');
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">PENDING</span>;
      case 'PAID': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-500 border border-blue-500/30">PAID</span>;
      case 'IN_PROGRESS': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-500 border border-blue-500/30">IN PROGRESS</span>;
      case 'GENERATING': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-500 border border-blue-500/30">GENERATING</span>;
      case 'DELIVERED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-500 border border-green-500/30">DELIVERED</span>;
      case 'CANCELLED': return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-500 border border-red-500/30">CANCELLED</span>;
      default: return null;
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/logout`, { method: 'POST' });
      navigate('/login');
    } catch(e) {
      navigate('/login');
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/profile`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ name: profileForm.name, language_preference: profileForm.language_preference, password: profileForm.password || undefined })
      });
      const data = await res.json();
      if(data.success) {
        setUser({ ...user, name: data.user.name, language_preference: data.user.language_preference, initial: data.user.name.substring(0,2).toUpperCase() });
        setProfileForm({ ...profileForm, password: '', confirmPassword: '' });
        alert("Profile Setup Updated!");
      } else {
        alert(data.error);
      }
    } catch(err) {
      alert("Error updating profile");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 md:py-20 min-h-screen">
      
      {/* Mobile Tab Layout - Sticky top or visible only on mobile */}
      <div className="md:hidden flex overflow-x-auto space-x-2 border-b border-white/10 mb-8 pb-2 mt-16">
        <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 font-medium whitespace-nowrap rounded-lg flex items-center space-x-2 ${activeTab === 'orders' ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:text-white'}`}>
          <Package size={18} /><span>Orders</span>
        </button>
        <button onClick={() => setActiveTab('alerts')} className={`px-4 py-2 font-medium whitespace-nowrap rounded-lg flex items-center space-x-2 ${activeTab === 'alerts' ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:text-white'}`}>
          <Bell size={18} /><span>Price Alerts</span>
        </button>
        <button onClick={() => setActiveTab('profile')} className={`px-4 py-2 font-medium whitespace-nowrap rounded-lg flex items-center space-x-2 ${activeTab === 'profile' ? 'bg-[#D4AF37] text-black' : 'text-gray-400 hover:text-white'}`}>
          <User size={18} /><span>Profile</span>
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Desktop Sidebar */}
        <div className="hidden md:block w-64 shrink-0">
          <div className="bg-[#111] p-6 rounded-2xl border border-white/10 sticky top-24">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-14 h-14 bg-[#D4AF37] rounded-full flex items-center justify-center text-black text-xl font-bold border-2 border-white/20">
                {user.initial}
              </div>
              <div className="overflow-hidden">
                <h2 className="text-lg font-bold truncate">{user.name}</h2>
                <p className="text-sm text-[#D4AF37] truncate">Free Account</p>
              </div>
            </div>
            
            <nav className="space-y-2 mt-6">
              <button 
                onClick={() => setActiveTab('orders')} 
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'orders' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Package size={20} /><span>My Orders</span>
              </button>
              <button 
                onClick={() => setActiveTab('alerts')} 
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'alerts' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <Bell size={20} /><span>Price Alerts</span>
              </button>
              <button 
                onClick={() => setActiveTab('profile')} 
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'profile' ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                <User size={20} /><span>Profile & Settings</span>
              </button>
            </nav>

            <div className="mt-8 border-t border-white/10 pt-6">
              <button onClick={handleLogout} className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                <LogOut size={20} /><span>Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-grow space-y-8">
          
          {/* ORDERS TAB */}
          {activeTab === 'orders' && (
            <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center">
                  <Package className="text-[#D4AF37] mr-3" />
                  <h2 className="text-xl font-bold">My Research Reports</h2>
                </div>
                {orders.some(o => o.status === 'GENERATING' || o.status === 'PAID') && (
                  <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 px-4 py-2 rounded-xl flex items-center space-x-3 animate-pulse">
                    <div className="w-2 h-2 bg-[#D4AF37] rounded-full"></div>
                    <span className="text-[#D4AF37] text-sm font-bold">Generation in progress. Please do not refresh!</span>
                  </div>
                )}
              </div>
              <div className="divide-y divide-white/5">
                {orders.map((order) => (
                  <div key={order.id} className="p-6 flex flex-col xl:flex-row xl:items-center justify-between hover:bg-[#1a1a1a] transition-colors border-l-4 border-transparent hover:border-[#D4AF37]/30">
                    <div className="mb-4 xl:mb-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-mono text-gray-400 text-xs bg-white/5 px-2 py-1 rounded">{order.id.slice(0,8).toUpperCase()}</span>
                        {getStatusBadge(order.status)}
                        {(order.status === 'GENERATING' || order.status === 'PAID') && timers[order.id] > 0 && (
                          <span className="flex items-center text-[#D4AF37] text-xs font-bold animate-pulse">
                            <span className="w-2 h-2 bg-[#D4AF37] rounded-full mr-2"></span>
                            {Math.floor(timers[order.id] / 60)}:{(timers[order.id] % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                      <div className="font-bold text-lg mb-1">{order.service_tier} Research - {order.product_category}</div>
                      <div className="text-sm text-gray-400">Transaction Date: {new Date(order.created_at).toLocaleDateString()}</div>
                      
                      {order.status === 'GENERATING' && (
                        <div className="mt-2 text-[#D4AF37] text-xs flex items-center space-x-2 bg-[#D4AF37]/5 p-2 rounded border border-[#D4AF37]/10 max-w-sm">
                          <Bell size={14} className="animate-bounce" />
                          <span><strong>Live Research in progress:</strong> Please do not refresh. Your report is being generated using real-world data.</span>
                        </div>
                      )}
                    </div>
                    
                     <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mt-4 xl:mt-0">
                      {order.status === 'DELIVERED' ? (
                        <>
                          <button onClick={() => {
                            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                            const url = order.pdf_url.startsWith('http') ? order.pdf_url : `${baseUrl}${order.pdf_url}`;
                            setViewingPdf(url);
                          }} className="flex items-center justify-center space-x-2 bg-zinc-800 text-white border border-zinc-700 px-5 py-2.5 rounded-xl font-bold hover:bg-zinc-700 transition-all">
                            <FileText size={18} /> <span>View</span>
                          </button>
                          <button 
                            onClick={() => {
                              const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                              const url = order.pdf_url.startsWith('http') ? order.pdf_url : `${baseUrl}${order.pdf_url}`;
                              window.open(url, '_blank');
                            }} 
                            className="flex items-center justify-center space-x-2 bg-[#D4AF37] text-black px-8 py-2.5 rounded-xl font-bold hover:bg-[#b8972e] shadow-[0_4px_15px_rgba(212,175,55,0.25)] transition-all hover:-translate-y-0.5"
                          >
                            <Download size={18} /> <span>Download Report</span>
                          </button>
                        </>
                      ) : (
                        <div className="flex flex-col space-y-2">
                          <div className={`text-sm flex items-center px-4 py-2.5 rounded-xl border ${
                            order.status === 'PENDING' 
                              ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' 
                              : 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20 font-bold'
                          }`}>
                             {order.status === 'PENDING' ? (
                               <span className="flex items-center italic"><Package size={16} className="mr-2" /> Waiting for confirmation...</span>
                             ) : (
                               <span className="flex items-center tracking-wide font-bold">
                                 <div className="mr-3 w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                                 Creating Intel Report...
                               </span>
                             )}
                          </div>
                          {order.status === 'PENDING' && (
                            <div className="flex flex-col items-center">
                              <button 
                                onClick={() => syncPayment(order.id)}
                                className="text-[10px] text-[#D4AF37] hover:underline mb-1 flex items-center"
                              >
                                ↻ Paid already? Sync Now
                              </button>
                              <p className="text-[9px] text-gray-500">Usually matches with bank in 30s.</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {orders.length === 0 && (
                  <div className="p-20 text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                       <Package className="text-gray-600" size={32} />
                    </div>
                    <h3 className="text-lg font-bold mb-2">No Research Reports Yet</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mb-8">Start your first intelligent research to see it appearing here.</p>
                    <button onClick={() => navigate('/')} className="bg-[#D4AF37] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#b8972e]">Start Research</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PDF Viewer Modal */}
          {viewingPdf && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-zinc-900 border border-zinc-800 w-full max-w-5xl h-[90vh] rounded-3xl overflow-hidden flex flex-col relative shadow-2xl">
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md">
                  <div className="flex items-center space-x-2">
                    <FileText className="text-[#D4AF37]" size={20} />
                    <span className="font-bold">Report Viewer</span>
                  </div>
                  <button onClick={() => setViewingPdf(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                    <X size={24} />
                  </button>
                </div>
                <div className="flex-1 bg-white">
                  <iframe src={viewingPdf} className="w-full h-full border-none" title="PDF Report Viewer"></iframe>
                </div>
                <div className="p-4 border-t border-white/10 flex justify-center bg-zinc-900">
                  <a href={viewingPdf} download target="_blank" rel="noreferrer" className="bg-[#D4AF37] text-black px-8 py-3 rounded-xl font-bold hover:bg-[#b8972e] flex items-center space-x-2">
                    <Download size={20} /> <span>Download Copy</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* ALERTS TAB */}
          {activeTab === 'alerts' && (
            <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="text-[#D4AF37] mr-3" />
                  <h2 className="text-xl font-bold">Price Alerts</h2>
                </div>
                <div className="text-sm text-gray-400 font-medium">Free Alerts: <span className="text-white">{user.alertsCount}/10</span> Used</div>
              </div>
              <div className="p-6">
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:border-white/30 transition-all">
                  <div className="mb-4 sm:mb-0">
                    <div className="font-bold text-lg mb-1">MacBook Air M2 256GB</div>
                    <div className="text-sm text-gray-400"><span className="text-white">Target:</span> ₹75,000 <span className="mx-2">•</span> <span className="text-white">Current:</span> ₹82,900</div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 rounded bg-green-900/30 text-green-500 text-xs border border-green-500/30 font-bold tracking-wider">ACTIVE</span>
                    <button className="text-gray-500 hover:text-red-500 transition-colors p-2"><X size={20} /></button>
                  </div>
                </div>

                {user.alertsCount < 10 && (
                  <button className="w-full mt-6 py-4 border-2 border-dashed border-white/10 text-gray-400 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] rounded-xl transition-colors font-medium">
                    + Track a new Product Drop
                  </button>
                )}
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="bg-[#111] rounded-2xl border border-white/10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-white/10 flex items-center">
                <User className="text-[#D4AF37] mr-3" />
                <h2 className="text-xl font-bold">Profile Settings</h2>
              </div>
              <div className="p-6">
                <form onSubmit={saveProfile} className="space-y-6 max-w-lg">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                    <input disabled type="email" value={user.email} className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg p-3 text-gray-500 cursor-not-allowed" />
                    <p className="text-xs text-gray-500 mt-1">To change email, contact support.</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Display Name</label>
                    <input required type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Report Language Preference</label>
                    <select value={profileForm.language_preference} onChange={e => setProfileForm({...profileForm, language_preference: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:outline-none">
                      <option value="EN">English</option>
                      <option value="HI">Hindi</option>
                      <option value="TA">Tamil</option>
                    </select>
                  </div>
                  
                  <div className="pt-6 border-t border-white/10">
                    <h3 className="font-bold mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <input type="password" placeholder="New Password" value={profileForm.password} onChange={e => setProfileForm({...profileForm, password: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:outline-none" />
                      <input type="password" placeholder="Confirm New Password" value={profileForm.confirmPassword} onChange={e => setProfileForm({...profileForm, confirmPassword: e.target.value})} className="w-full bg-black border border-white/10 rounded-lg p-3 text-white focus:border-[#D4AF37] focus:outline-none" />
                    </div>
                  </div>

                  <button type="submit" className="bg-[#D4AF37] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#b8972e] transition-colors mt-4">
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
