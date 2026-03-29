import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import Order from './pages/Order';
import OrderProcessing from './pages/OrderProcessing';
import Success from './pages/Success';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import Feedback from './pages/Feedback';
import DealWatch from './pages/DealWatch';
import SampleReport from './pages/SampleReport';
import { Contact, Privacy, Terms, FAQ } from './pages/StaticPages';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-sans selection:bg-[#D4AF37] selection:text-black">
        <Navigation />
        <main className="pt-16">
          <Routes>
            {/* Core User Flow */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            <Route path="/order" element={<Order />} />
            <Route path="/order/processing" element={<OrderProcessing />} />
            <Route path="/order/success" element={<Success />} />
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Features */}
            <Route path="/sample" element={<SampleReport />} />
            <Route path="/deal-watch" element={<DealWatch />} />
            <Route path="/feedback/:orderId" element={<Feedback />} />
            <Route path="/feedback" element={<Feedback />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

            {/* Static */}
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/faq" element={<FAQ />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
