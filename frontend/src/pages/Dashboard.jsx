import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  Warehouse,
  Building2,
  AlertTriangle,
  Coins,
  History,
  Activity,
  PlusCircle,
  Truck,
  ArrowRight,
  TrendingUp,
  Inbox
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  // 1. Fetch Inventory Levels
  const { data: inventory, isLoading: invLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await axios.get('http://127.0.0.1:5000/api/inventory');
      return res.data;
    }
  });

  // 2. Fetch Hotels Dues/Cylinder Balances
  const { data: hotelsList, isLoading: hotelsLoading } = useQuery({
    queryKey: ['paymentStatus'],
    queryFn: async () => {
      const res = await axios.get('http://127.0.0.1:5000/api/payments/status');
      return res.data;
    }
  });

  // 3. Fetch Recent Deliveries
  const { data: deliveries, isLoading: dlvLoading } = useQuery({
    queryKey: ['deliveries'],
    queryFn: async () => {
      const res = await axios.get('http://127.0.0.1:5000/api/deliveries');
      return res.data;
    }
  });

  // 4. Fetch Activity Logs
  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      const res = await axios.get('http://127.0.0.1:5000/api/logs');
      return res.data;
    }
  });

  // Derived calculations for real-time analytics
  const totals = {
    totalFilledOut: 0,
    totalEmptyOut: 0,
    pendingPayments: 0,
    totalPaid: 0,
    hotelsCount: 0,
  };

  if (hotelsList) {
    totals.hotelsCount = hotelsList.length;
    totals.pendingPayments = hotelsList.reduce((acc, curr) => acc + curr.pending, 0);
    totals.totalPaid = hotelsList.reduce((acc, curr) => acc + curr.paid, 0);
  }

  // Calculate sum of filled and empty cylinders currently with hotels
  if (deliveries) {
    // Deliveries contain hotel cylinders directly or we can read them from hotels
    // Let's get hotel stock balances
    // Since we created standard schemas, we can actually fetch complete hotels
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const isLowStock = inventory && inventory.filledStock < inventory.lowStockThreshold;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header and Welcome */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">System Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gas cylinder logistics & double-entry financials at a glance.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/exchange"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-teal-600 text-white rounded-xl hover:bg-teal-500 shadow-md shadow-teal-500/10 transition-all"
          >
            <Truck className="h-4 w-4" /> Create Delivery
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/add-hotel"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-850 dark:text-slate-200 text-slate-700 rounded-xl transition-all"
            >
              <PlusCircle className="h-4 w-4" /> Register Hotel
            </Link>
          )}
        </div>
      </div>

      {/* Low Stock Warning Alert */}
      {isLowStock && (
        <motion.div
          variants={itemVariants}
          className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3.5 text-amber-600 dark:text-amber-400 text-sm"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold">Farm Inventory Stock Warning</h3>
            <p className="text-xs text-amber-600/90 dark:text-amber-400/80 mt-0.5">
              Refill storage levels are under threshold! Filled Cylinders: <strong>{inventory.filledStock}</strong> (Limit: {inventory.lowStockThreshold}). Please schedule refinery truck deliveries immediately.
            </p>
          </div>
        </motion.div>
      )}

      {/* Primary Analytics Grid */}
      <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Farm Storage Level */}
        <motion.div variants={itemVariants} className="glass-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-teal-500/5 rounded-bl-full" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Farm Storage</span>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1.5">
                {invLoading ? '...' : inventory?.filledStock}
              </h2>
            </div>
            <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Warehouse className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Empty Bottles at Farm:</span>
            <strong className="text-slate-700 dark:text-slate-200">{invLoading ? '...' : inventory?.emptyStock}</strong>
          </div>
        </motion.div>

        {/* Total Outstanding Dues */}
        <motion.div variants={itemVariants} className="glass-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-rose-500/5 rounded-bl-full" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Pending Receivables</span>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1.5">
                Rs. {hotelsLoading ? '...' : totals.pendingPayments.toLocaleString()}
              </h2>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Total Collected History:</span>
            <strong className="text-emerald-600 dark:text-emerald-400">Rs. {hotelsLoading ? '...' : totals.totalPaid.toLocaleString()}</strong>
          </div>
        </motion.div>

        {/* Customer Base (Hotels) */}
        <motion.div variants={itemVariants} className="glass-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-bl-full" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Restaurants</span>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1.5">
                {hotelsLoading ? '...' : totals.hotelsCount}
              </h2>
            </div>
            <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            <Link to="/hotels" className="hover:text-teal-600 font-semibold flex items-center gap-1">
              Manage hotel rates & credit limits <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </motion.div>

        {/* Activity Audits */}
        <motion.div variants={itemVariants} className="glass-card p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/5 rounded-bl-full" />
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Logs</span>
              <h2 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1.5">
                {logsLoading ? '...' : logs?.length}
              </h2>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <History className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-purple-600 dark:text-purple-400">Active ERP Trace Active</span>
          </div>
        </motion.div>

      </motion.div>

      {/* Grid: Deliveries Feed and Activity Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Deliveries Invoice Logs (Left 2 columns) */}
        <motion.div variants={itemVariants} className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/40">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-teal-600" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Recent Delivery Dispatches</h3>
            </div>
            <Link to="/ledger" className="text-xs font-semibold text-teal-600 hover:text-teal-500">
              View all dispatches
            </Link>
          </div>

          {dlvLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : !deliveries || deliveries.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
              <Inbox className="h-12 w-12 stroke-[1] mb-2" />
              <p className="text-sm">No delivery logs recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-slate-800/50 text-slate-400 text-xs uppercase font-semibold">
                    <th className="pb-3 font-semibold">Invoice No</th>
                    <th className="pb-3 font-semibold">Hotel / Location</th>
                    <th className="pb-3 font-semibold text-center">Delivered</th>
                    <th className="pb-3 font-semibold text-center">Returned</th>
                    <th className="pb-3 font-semibold text-right">Value</th>
                    <th className="pb-3 font-semibold text-right">Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                  {deliveries.slice(0, 5).map((dlv) => (
                    <tr key={dlv._id} className="hover:bg-slate-50/55 dark:hover:bg-slate-900/30 transition-all">
                      <td className="py-3.5 font-mono text-xs font-bold text-teal-600 dark:text-teal-400">
                        {dlv.deliveryNo}
                      </td>
                      <td className="py-3.5 font-semibold">
                        {dlv.hotel?.name}
                      </td>
                      <td className="py-3.5 text-center text-slate-700 dark:text-slate-300">
                        {dlv.deliveredQty} Fill
                      </td>
                      <td className="py-3.5 text-center text-slate-500">
                        {dlv.returnedEmptiesQty} Empty
                      </td>
                      <td className="py-3.5 text-right font-semibold text-slate-800 dark:text-white">
                        Rs. {dlv.totalAmount}
                      </td>
                      <td className="py-3.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {dlv.paymentReceived > 0 ? `Rs. ${dlv.paymentReceived}` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Real-time System Trace logs (Right 1 column) */}
        <motion.div variants={itemVariants} className="glass-panel rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/40 flex flex-col">
          <div className="flex items-center gap-2 mb-5">
            <Activity className="h-5 w-5 text-purple-600" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">ERP Activity Feeds</h3>
          </div>

          {logsLoading ? (
            <div className="space-y-4 flex-1">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-10 bg-slate-100 dark:bg-slate-900 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-12">
              <Inbox className="h-10 w-10 stroke-[1] mb-2" />
              <p className="text-xs">No user activities recorded yet.</p>
            </div>
          ) : (
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[350px] pr-1">
              {logs.slice(0, 8).map((log) => (
                <div key={log._id} className="text-xs border-l-2 border-teal-500 pl-3 py-1">
                  <p className="text-slate-600 dark:text-slate-300 font-semibold">{log.action}</p>
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                    <span className="capitalize">By: {log.user}</span>
                    <span>{new Date(log.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

      </div>
    </motion.div>
  );
}
