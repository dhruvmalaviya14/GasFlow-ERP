import { useState, useContext } from 'react';
import { AuthContext } from '../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, AlertTriangle } from 'lucide-react';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      return setError('Please enter both username and password.');
    }
    setError('');
    setLoading(true);

    const res = await login(username, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center relative p-4">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/4 h-72 w-72 bg-teal-400/20 dark:bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 h-72 w-72 bg-emerald-400/20 dark:bg-emerald-500/10 rounded-full blur-3xl" />

      <div className="w-full max-w-md glass-card p-8 relative z-10 transition-all duration-300">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 items-center justify-center text-white font-bold shadow-lg shadow-teal-500/20 mb-3 text-lg">
            GP
          </div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white leading-tight">Welcome Back</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">Sign in to your Gas Cylinder Distribution OS</p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/30 flex items-start gap-2.5 text-rose-600 dark:text-rose-400 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Username Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-11 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Login Trigger */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-sm transition-all duration-300 shadow-md shadow-teal-500/10 focus:ring-2 focus:ring-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials Box */}
        <div className="mt-8 pt-5 border-t border-slate-200/40 dark:border-slate-800/30 text-center">
          <p className="text-[10px] font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-widest mb-2">Seeded Logins</p>
          <div className="flex justify-center gap-4 text-[10px] text-slate-500 dark:text-slate-400">
            <span>Admin: <strong className="text-slate-700 dark:text-slate-200 font-mono">bharat / bharat</strong></span>
            <span>Staff: <strong className="text-slate-700 dark:text-slate-200 font-mono">lalo / lalo</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
}
