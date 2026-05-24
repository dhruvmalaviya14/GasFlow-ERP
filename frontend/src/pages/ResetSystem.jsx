import { useState, useContext } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axiosInstance';
import { AuthContext } from '../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

export default function ResetSystem() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [confirmText, setConfirmText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Reset Mutation
  const resetMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post('/reset/reset-system');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
      setSuccessMsg('ERP transactional operational data reset completed successfully!');
      setErrorMsg('');
      setConfirmText('');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    },
    onError: (error) => {
      setErrorMsg(error.response?.data?.message || 'Database reset failed.');
    }
  });

  const handleResetSubmit = (e) => {
    e.preventDefault();
    if (user?.role !== 'admin') {
      return setErrorMsg('Unauthorized! Restricted to administrator roles.');
    }
    if (confirmText !== 'RESET SYSTEM') {
      return setErrorMsg('Please type the confirmation code exactly to verify action.');
    }

    setErrorMsg('');
    setSuccessMsg('');
    resetMutation.mutate();
  };

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-md mx-auto py-20 text-center text-slate-400 flex flex-col items-center justify-center">
        <ShieldAlert className="h-16 w-16 stroke-[1] text-rose-500 mb-3" />
        <h3 className="font-bold text-slate-800 dark:text-white text-lg">Restricted Access Area</h3>
        <p className="text-xs text-slate-400 mt-2 max-w-sm">
          System operational resets are restricted to Administrator accounts. Your current profile does not possess necessary credentials.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Administrative Reset</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Perform complete operational cleanup of deliveries, payments, ledger logs, and stocks.
        </p>
      </div>

      {/* Caution card */}
      <div className="p-5 bg-rose-500/10 border border-rose-500/30 rounded-3xl flex items-start gap-4 text-rose-600 dark:text-rose-450 text-sm">
        <AlertTriangle className="h-6 w-6 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-base">CRITICAL WARNING! High-Risk Action</h4>
          <p className="text-xs text-rose-600/90 dark:text-rose-400/80 mt-1.5 leading-relaxed">
            Executing this system reset will **permanently delete** all historical deliveries, payment receipts, chronological double-entry financials ledgers, and operator audits log items from the database. All hotel outstanding cylinder counts and pending balances will be reset to zero immediately. This action **cannot be undone**.
          </p>
        </div>
      </div>

      {/* Inputs card */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/40">
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/30 rounded-xl flex items-start gap-2 text-rose-500 text-xs">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-800/35 rounded-xl flex items-start gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
            <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleResetSubmit} className="space-y-5">
          
          <div>
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-widest leading-normal">
              Type <span className="font-mono text-slate-800 dark:text-white px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">RESET SYSTEM</span> to confirm reset:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type verification code exactly"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all dark:text-white font-mono text-center font-bold tracking-wider"
            />
          </div>

          <button
            type="submit"
            disabled={resetMutation.isPending || confirmText !== 'RESET SYSTEM'}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-rose-500/10 disabled:opacity-30 cursor-pointer flex items-center justify-center gap-2"
          >
            {resetMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <ShieldAlert className="h-4.5 w-4.5" /> Wipe Database & Reset ERP
              </>
            )}
          </button>

        </form>
      </div>

    </div>
  );
}
