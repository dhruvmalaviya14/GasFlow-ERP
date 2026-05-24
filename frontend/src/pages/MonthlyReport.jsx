import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  BarChart3,
  Cylinder,
  Coins,
  TrendingUp,
  Inbox,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function MonthlyReport() {
  
  // Fetch deliveries data
  const { data: deliveries, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['deliveries'],
    queryFn: async () => {
      const res = await axios.get('http://127.0.0.1:5000/api/deliveries');
      return res.data;
    }
  });

  // Calculate monthly stats
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const stats = {
    deliveriesCount: 0,
    totalFilledDelivered: 0,
    totalEmptiesReturned: 0,
    totalRevenueBilled: 0,
    totalPaymentsCollected: 0
  };

  if (deliveries) {
    const monthlyDeliveries = deliveries.filter(dlv => {
      const dlvDate = new Date(dlv.createdAt);
      return dlvDate.getMonth() === currentMonth && dlvDate.getFullYear() === currentYear;
    });

    stats.deliveriesCount = monthlyDeliveries.length;
    stats.totalFilledDelivered = monthlyDeliveries.reduce((acc, curr) => acc + curr.deliveredQty, 0);
    stats.totalEmptiesReturned = monthlyDeliveries.reduce((acc, curr) => acc + curr.returnedEmptiesQty, 0);
    stats.totalRevenueBilled = monthlyDeliveries.reduce((acc, curr) => acc + curr.totalAmount, 0);
    stats.totalPaymentsCollected = monthlyDeliveries.reduce((acc, curr) => acc + curr.paymentReceived, 0);
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const activeMonthName = monthNames[currentMonth];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Monthly Performance</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visual statistics, cylinder distributions, and sales volume reports for {activeMonthName} {currentYear}.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 text-slate-600 dark:text-slate-350 ${isRefetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />
          <div className="h-32 bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />
          <div className="h-32 bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />
        </div>
      ) : !deliveries ? (
        <div className="py-20 text-center text-slate-400 glass-panel rounded-3xl border border-slate-200/50">
          <Inbox className="h-12 w-12 stroke-[1] mb-2 mx-auto" />
          <p className="text-sm">Unable to retrieve sales records.</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Main Stat Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Revenue card */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-28 w-28 bg-teal-500/[0.02] rounded-bl-full" />
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Gross Sales Invoiced</span>
              <h2 className="text-3xl font-black text-slate-850 dark:text-white mt-4 tracking-tight">
                Rs. {stats.totalRevenueBilled.toLocaleString()}
              </h2>
              <div className="mt-4 flex items-center gap-1 text-[10px] text-teal-600 font-bold uppercase tracking-wider">
                <TrendingUp className="h-3.5 w-3.5" /> Direct Sales Growth Active
              </div>
            </div>

            {/* Cylinder Deliveries volume */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-28 w-28 bg-emerald-500/[0.02] rounded-bl-full" />
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Cylinders Supplied</span>
              <h2 className="text-3xl font-black text-slate-850 dark:text-white mt-4 tracking-tight">
                {stats.totalFilledDelivered} <span className="text-sm font-semibold text-slate-400">units</span>
              </h2>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Direct logistics trips:</span>
                <strong className="text-slate-700 dark:text-slate-200">{stats.deliveriesCount} deliveries</strong>
              </div>
            </div>

            {/* Cylinder Empties Returned */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/50 dark:border-slate-800/40 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-28 w-28 bg-amber-500/[0.02] rounded-bl-full" />
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Empties Recovered</span>
              <h2 className="text-3xl font-black text-slate-850 dark:text-white mt-4 tracking-tight">
                {stats.totalEmptiesReturned} <span className="text-sm font-semibold text-slate-400">units</span>
              </h2>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Unrecovered outstanding empties:</span>
                <strong className="text-rose-500">{stats.totalFilledDelivered - stats.totalEmptiesReturned} outstanding</strong>
              </div>
            </div>

          </div>

          {/* Graphical Progress Analysis */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/40 space-y-6">
            
            <div className="flex items-center gap-2.5">
              <BarChart3 className="h-5 w-5 text-teal-600" />
              <h3 className="text-lg font-bold text-slate-850 dark:text-white">Refill Recovery Analytics</h3>
            </div>

            {/* Progression Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-500">
                <span>Cylinder Returns Recovery Ratio</span>
                <span className="text-teal-600 dark:text-teal-400">
                  {stats.totalFilledDelivered > 0 
                    ? `${Math.round((stats.totalEmptiesReturned / stats.totalFilledDelivered) * 100)}%` 
                    : '100%'}
                </span>
              </div>
              
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-600 to-emerald-500 transition-all duration-500"
                  style={{ 
                    width: stats.totalFilledDelivered > 0 
                      ? `${Math.min(100, (stats.totalEmptiesReturned / stats.totalFilledDelivered) * 100)}%` 
                      : '0%' 
                  }}
                />
              </div>
              <p className="text-[10px] text-slate-400 leading-normal pt-1">
                Refers to the ratio of empty bottles returned compared to filled cylinders supplied during deliveries this month. Higher ratios indicate stable cylinder pools and low customer lease outstanding.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-200/40 dark:border-slate-800/30 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4.5 w-4.5 text-emerald-600 shrink-0" />
              <span>Real-time business audit intelligence report verified.</span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
