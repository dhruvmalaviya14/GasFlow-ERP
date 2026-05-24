import { NavLink, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../store/AuthContext';
import { ThemeContext } from '../store/ThemeContext';
import {
  LayoutDashboard,
  Building2,
  PlusCircle,
  Truck,
  Warehouse,
  Coins,
  History,
  TrendingUp,
  Settings,
  ShieldAlert,
  LogOut,
  Sun,
  Moon,
  ChevronRight,
  ClipboardList
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useContext(AuthContext);
  const { dark, setDark } = useContext(ThemeContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/hotel-status', label: 'Hotel Status', icon: ClipboardList },
    { to: '/payment-status', label: 'Payment Status', icon: Coins },
    { to: '/hotels', label: 'Hotel List', icon: Building2 },
    { to: '/add-hotel', label: 'Add Hotel', icon: PlusCircle },
    { to: '/exchange', label: 'Unified Delivery', icon: Truck },
    { to: '/inventory', label: 'Farm Inventory', icon: Warehouse },
    { to: '/inventory-settings', label: 'Stock Adjust', icon: Settings },
    { to: '/ledger', label: 'Financial Ledger', icon: TrendingUp },
    { to: '/logs', label: 'System Logs', icon: History }
  ];

  if (user?.role === 'admin') {
    navItems.push({ to: '/reset', label: 'System Reset', icon: ShieldAlert, danger: true });
  }

  return (
    <div className="w-64 min-h-screen glass-panel flex flex-col justify-between p-6 border-r border-slate-200/50 dark:border-slate-800/40 relative z-20 transition-all duration-300">
      
      {/* Brand & Identity */}
      <div>
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white font-bold shadow-md shadow-teal-500/20">
            GP
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-none">GasPropel</h1>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold tracking-wider uppercase">ERP Operating OS</span>
          </div>
        </div>

        {/* User Card */}
        {user && (
          <div className="mb-6 p-3.5 bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl border border-slate-200/20 dark:border-slate-800/20">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm uppercase">
                {user.username[0]}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">{user.name}</p>
                <span className="inline-block text-[9px] px-1.5 py-0.5 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 font-semibold rounded-full capitalize">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? item.danger
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                        : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-500/10'
                      : item.danger
                      ? 'text-red-500 hover:bg-red-500/10'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4.5 w-4.5 stroke-[2]" />
                  <span>{item.label}</span>
                </div>
                <ChevronRight className="h-3.5 w-3.5 stroke-[2] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Controls (Theme & Logout) */}
      <div className="space-y-4 pt-4 border-t border-slate-200/40 dark:border-slate-800/30">
        {/* Theme Toggle */}
        <button
          onClick={() => setDark(!dark)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition-all"
        >
          <div className="flex items-center gap-3">
            {dark ? <Sun className="h-4.5 w-4.5 stroke-[2]" /> : <Moon className="h-4.5 w-4.5 stroke-[2]" />}
            <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
          <div className="h-4 w-8 rounded-full bg-slate-200 dark:bg-slate-700 relative p-0.5 transition-colors">
            <div className={`h-3 w-3 rounded-full bg-white dark:bg-slate-300 shadow-sm transition-transform duration-200 ${dark ? 'translate-x-4' : 'translate-x-0'}`} />
          </div>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
        >
          <LogOut className="h-4.5 w-4.5 stroke-[2]" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
