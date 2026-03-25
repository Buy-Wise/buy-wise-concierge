import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Landing from './pages/Landing';
import Order from './pages/Order';
import Success from './pages/Success';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Feedback from './pages/Feedback';
import DealWatch from './pages/DealWatch';
import SampleReport from './pages/SampleReport';
import { Contact, Privacy, Terms } from './pages/StaticPages';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-[#D4AF37] selection:text-black">
        <Navigation />
        <main className="pt-16">
          <Routes>
            {/* Core User Flow */}
            <Route path="/" element={<Landing />} />
            <Route path="/order" element={<Order />} />
            <Route path="/order/success" element={<Success />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Features */}
            <Route path="/sample" element={<SampleReport />} />
            <Route path="/deal-watch" element={<DealWatch />} />
            <Route path="/feedback/:orderId" element={<Feedback />} />
            <Route path="/feedback" element={<Feedback />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminDashboard />} />

            {/* Static */}
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
