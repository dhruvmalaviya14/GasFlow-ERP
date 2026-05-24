import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axiosInstance';

import {
  Settings,
  Truck,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export default function InventorySettings() {
  const queryClient = useQueryClient();

  // Manual Adjust form inputs
  const [filled, setFilled] = useState('');
  const [empty, setEmpty] = useState('');
  const [threshold, setThreshold] = useState('15');
  const [adjustError, setAdjustError] = useState('');
  const [adjustSuccess, setAdjustSuccess] = useState('');

  // Truck Arrival form inputs
  const [arrivedFilled, setArrivedFilled] = useState('');
  const [returnedEmpties, setReturnedEmpties] = useState('');
  const [notes, setNotes] = useState('');
  const [truckError, setTruckError] = useState('');
  const [truckSuccess, setTruckSuccess] = useState('');

  // 1. Fetch live Inventory parameters
  useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await axios.get('/inventory');
      // Set default input states
      if (res.data) {
        setFilled(res.data.filledStock);
        setEmpty(res.data.emptyStock);
        setThreshold(res.data.lowStockThreshold);
      }
      return res.data;
    }
  });

  // 2. Mutation for Manual Stock Adjustments
  const adjustMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post('/inventory/update', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });
      setAdjustSuccess('Inventory stock levels manually adjusted successfully.');
      setAdjustError('');
      setTimeout(() => setAdjustSuccess(''), 4000);
    },
    onError: (error) => {
      setAdjustError(error.response?.data?.message || 'Manual adjust failed.');
    }
  });

  // 3. Mutation for Refinery Truck Arrivals
  const truckMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post('/inventory/arrival', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });

      setTruckSuccess('Refinery truck arrival logged successfully! Farm stock updated.');
      setTruckError('');
      
      // Reset truck inputs
      setArrivedFilled('');
      setReturnedEmpties('');
      setNotes('');
      
      setTimeout(() => setTruckSuccess(''), 4000);
    },
    onError: (error) => {
      setTruckError(error.response?.data?.message || 'Logging refinery truck arrival failed.');
    }
  });

  const handleManualAdjust = (e) => {
    e.preventDefault();
    if (filled === '' || empty === '') {
      return setAdjustError('Please specify filled and empty stocks.');
    }
    setAdjustError('');
    setAdjustSuccess('');
    adjustMutation.mutate({
      filled: Number(filled),
      empty: Number(empty),
      lowStockThreshold: Number(threshold)
    });
  };

  const handleTruckArrival = (e) => {
    e.preventDefault();
    if (!arrivedFilled || Number(arrivedFilled) <= 0) {
      return setTruckError('Please specify arrived filled quantity.');
    }
    setTruckError('');
    setTruckSuccess('');
    truckMutation.mutate({
      filledQty: Number(arrivedFilled),
      emptySentQty: Number(returnedEmpties || 0),
      notes
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Stock Controls & Arrival Logs</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Adjust farm stock counts and log deliveries from the gas company refinery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Log Company Truck Arrival */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/40 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center rounded-xl">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">Log Refinery Truck Arrival</h3>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold tracking-wide uppercase">Company Truck → Farm Storage</span>
            </div>
          </div>

          {truckError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/30 rounded-xl flex items-start gap-2 text-rose-500 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{truckError}</span>
            </div>
          )}

          {truckSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-800/35 rounded-xl flex items-start gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{truckSuccess}</span>
            </div>
          )}

          <form onSubmit={handleTruckArrival} className="space-y-4">
            
            {/* Arrived Filled Qty */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Filled Cylinders Received (Qty)
              </label>
              <input
                type="number"
                min="1"
                placeholder="Number of filled cylinders arrived"
                value={arrivedFilled}
                onChange={(e) => setArrivedFilled(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
              />
            </div>

            {/* Sent Empties back */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Empties Loaded Back on Truck (Qty)
              </label>
              <input
                type="number"
                min="0"
                placeholder="Number of empties sent back to refinery"
                value={returnedEmpties}
                onChange={(e) => setReturnedEmpties(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Arrival comments
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Refinery Truck HR-38-9921 arrived. Batch seal verification complete."
                rows="2"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white resize-none"
              />
            </div>

            {/* Action */}
            <button
              type="submit"
              disabled={truckMutation.isPending}
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-teal-500/10 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {truckMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Truck className="h-4.5 w-4.5" /> Log Truck Arrival
                </>
              )}
            </button>

          </form>

        </div>

        {/* Card 2: Manual Stock Adjustments */}
        <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/40 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-50 dark:bg-slate-950/45 text-slate-650 dark:text-slate-350 flex items-center justify-center rounded-xl">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">Manual Stock Override</h3>
              <span className="text-[10px] text-slate-400 font-semibold tracking-wide uppercase">Requires administrative audit</span>
            </div>
          </div>

          {adjustError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/30 rounded-xl flex items-start gap-2 text-rose-500 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{adjustError}</span>
            </div>
          )}

          {adjustSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-800/35 rounded-xl flex items-start gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
              <CheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{adjustSuccess}</span>
            </div>
          )}

          <form onSubmit={handleManualAdjust} className="space-y-4">
            
            {/* Manual Filled */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Farm Filled Stock Override
              </label>
              <input
                type="number"
                min="0"
                value={filled}
                onChange={(e) => setFilled(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
              />
            </div>

            {/* Manual Empty */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Farm Empty Stock Override
              </label>
              <input
                type="number"
                min="0"
                value={empty}
                onChange={(e) => setEmpty(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
              />
            </div>

            {/* Low stock threshold */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                Alert Low Stock Threshold
              </label>
              <input
                type="number"
                min="1"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
              />
            </div>

            {/* Action */}
            <button
              type="submit"
              disabled={adjustMutation.isPending}
              className="w-full py-3 bg-slate-100 hover:bg-slate-250 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {adjustMutation.isPending ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-slate-750 border-t-transparent" />
              ) : (
                <>
                  <Settings className="h-4.5 w-4.5" /> Adjust Stock Counts
                </>
              )}
            </button>

          </form>

        </div>

      </div>
    </div>
  );
}
