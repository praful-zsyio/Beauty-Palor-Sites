import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { useAuthStore } from './store';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loader from './components/Loader';
import Chatbot from './components/Chatbot';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Services = lazy(() => import('./pages/Services'));
const ServiceDetail = lazy(() => import('./pages/ServiceDetail'));
const BookAppointment = lazy(() => import('./pages/BookAppointment'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Gallery = lazy(() => import('./pages/Gallery'));
const About = lazy(() => import('./pages/About'));
const Academy = lazy(() => import('./pages/Academy'));
const Contact = lazy(() => import('./pages/Contact'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, token } = useAuthStore();
  if (!user && !token) return <Navigate to="/login" replace />;
  return children;
};

// Admin Route
const AdminRoute = ({ children }) => {
  const { user, token } = useAuthStore();
  if (!user && !token) return <Navigate to="/login" replace />;
  if (user && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const { token, getMe } = useAuthStore();

  useEffect(() => {
    if (token) {
      getMe();
    }
  }, [token]);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: "'Inter', sans-serif",
              fontSize: '0.9rem',
              borderRadius: '12px',
              background: '#1a1a2e',
              color: '#fff',
              padding: '12px 20px',
              boxShadow: '0 8px 32px rgba(26,26,46,0.3)',
            },
            success: { iconTheme: { primary: '#f43f5e', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
          }}
        />
        <Navbar />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/about" element={<About />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/book/:serviceId?"
              element={
                <ProtectedRoute>
                  <BookAppointment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Footer />
        <Chatbot />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
