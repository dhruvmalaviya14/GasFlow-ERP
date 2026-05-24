import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import HotelStatus from './pages/HotelStatus';
import PaymentStatus from './pages/PaymentStatus';
import Hotels from './pages/Hotels';
import AddHotel from './pages/AddHotel';
import Exchange from './pages/Exchange';
import Inventory from './pages/Inventory';
import InventorySettings from './pages/InventorySettings';
import Ledger from './pages/Ledger';
import Logs from './pages/Logs';
import MonthlyReport from './pages/MonthlyReport';
import ResetSystem from './pages/ResetSystem';
import Sidebar from './components/Sidebar';

// Instantiate TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000
    }
  }
});

// Guard wrapper to protect pages from unauthenticated access
function ProtectedRoute({ children }) {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return token ? children : <Navigate to="/" replace />;
}

function Layout() {
  const { token } = useContext(AuthContext);
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300">
      {token && !isLoginPage && <Sidebar />}

      <div className="flex-1 overflow-x-hidden p-6 lg:p-10">
        <Routes>
          <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Login />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/hotel-status" element={<ProtectedRoute><HotelStatus /></ProtectedRoute>} />
          <Route path="/payment-status" element={<ProtectedRoute><PaymentStatus /></ProtectedRoute>} />
          <Route path="/hotels" element={<ProtectedRoute><Hotels /></ProtectedRoute>} />
          <Route path="/add-hotel" element={<ProtectedRoute><AddHotel /></ProtectedRoute>} />
          <Route path="/exchange" element={<ProtectedRoute><Exchange /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/inventory-settings" element={<ProtectedRoute><InventorySettings /></ProtectedRoute>} />
          <Route path="/ledger" element={<ProtectedRoute><Ledger /></ProtectedRoute>} />
          <Route path="/logs" element={<ProtectedRoute><Logs /></ProtectedRoute>} />
          <Route path="/monthly-report" element={<ProtectedRoute><MonthlyReport /></ProtectedRoute>} />
          <Route path="/reset" element={<ProtectedRoute><ResetSystem /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Layout />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
