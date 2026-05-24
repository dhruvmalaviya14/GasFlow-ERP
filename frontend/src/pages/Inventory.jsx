import { useQuery } from '@tanstack/react-query';
import axios from '../api/axiosInstance';
import { Warehouse, Inbox, RefreshCw, Cylinder, ShieldCheck, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Inventory() {
  
  // Fetch live inventory from Express backend
  const { data: inventory, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await axios.get('/inventory');
      return res.data;
    }
  });

  const isLowStock = inventory && inventory.filledStock < inventory.lowStockThreshold;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Farm Inventory Stocks</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time farm cylinder storage balances and stock thresholds.
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-slate-600 dark:text-slate-350 ${isRefetching ? 'animate-spin' : ''}`} />
          </button>
          
          <Link
            to="/inventory-settings"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-md shadow-teal-500/10 transition-all cursor-pointer"
          >
            Adjust Stock / Log Arrival
          </Link>
        </div>
      </div>

      {/* Main Stock Status widgets */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-44 bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />
          <div className="h-44 bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />
        </div>
      ) : !inventory ? (
        <div className="py-16 text-center text-slate-400 glass-panel rounded-3xl border border-slate-200/50">
          <Inbox className="h-12 w-12 stroke-[1] mb-2 mx-auto" />
          <p className="text-sm">Unable to retrieve inventory data.</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Warn Banner if low stock */}
          {isLowStock && (
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-amber-600 dark:text-amber-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Farm Storage Alert</h4>
                <p className="text-xs text-amber-600/90 dark:text-amber-400/85 mt-0.5">
                  Your filled cylinder count ({inventory.filledStock}) has fallen below your trigger threshold of {inventory.lowStockThreshold} units. Please plan inventory replacements immediately.
                </p>
              </div>
            </div>
          )}

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Filled Cylinders ready for delivery */}
            <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-32 w-32 bg-emerald-500/[0.02] rounded-bl-full" />
              
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Filled Cylinders
                  </span>
                  <h2 className="text-5xl font-black text-slate-800 dark:text-white mt-4 tracking-tight">
                    {inventory.filledStock} <span className="text-sm font-semibold text-slate-400">units</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    LPG cylinders physically stored at farm yard and loaded/ready for rickshaw dispatch.
                  </p>
                </div>
                <div className="h-12 w-12 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center rounded-2xl shadow-sm">
                  <Cylinder className="h-6 w-6 fill-emerald-600 dark:fill-emerald-400" />
                </div>
              </div>
            </div>

            {/* Empty Cylinders outstanding at farm */}
            <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/[0.02] rounded-bl-full" />
              
              <div className="flex justify-between items-start">
                <div>
                  <span className="inline-block px-2.5 py-0.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Empty Cylinders
                  </span>
                  <h2 className="text-5xl font-black text-slate-800 dark:text-white mt-4 tracking-tight">
                    {inventory.emptyStock} <span className="text-sm font-semibold text-slate-400">units</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Collected empties sitting at farm storage, waiting to be loaded on refinery trucks.
                  </p>
                </div>
                <div className="h-12 w-12 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center rounded-2xl shadow-sm">
                  <Cylinder className="h-6 w-6" />
                </div>
              </div>
            </div>

          </div>

          {/* Guidelines */}
          <div className="p-4 bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/20 dark:border-slate-800/35 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-teal-600 shrink-0" />
            <span>Farm Inventory levels are locked into transaction updates. Manually adjusting levels will create security activity audits.</span>
          </div>

        </div>
      )}

    </div>
  );
}
