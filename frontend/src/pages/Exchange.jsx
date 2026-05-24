import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axiosInstance';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Clipboard,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Building,
  CheckCircle,
  Warehouse
} from 'lucide-react';

export default function Exchange() {
  const queryClient = useQueryClient();

  // Inputs
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [deliveredQty, setDeliveredQty] = useState('');
  const [returnedEmptiesQty, setReturnedEmptiesQty] = useState('');
  const [paymentReceived, setPaymentReceived] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Fetch Hotels List
  const { data: hotels } = useQuery({
    queryKey: ['hotels'],
    queryFn: async () => {
      const res = await axios.get('/hotels');
      return res.data;
    }
  });

  // 2. Fetch Farm Inventory levels
  const { data: inventory, isLoading: invLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: async () => {
      const res = await axios.get('/inventory');
      return res.data;
    }
  });

  // 3. Mutation to Submit Delivery Invoice
  const deliveryMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post('/deliveries', payload);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['paymentStatus'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });

      setSuccessMsg(`Delivery logged successfully! Invoice No: ${data.delivery.deliveryNo}`);
      setErrorMsg('');
      
      // Reset inputs
      setSelectedHotelId('');
      setDeliveredQty('');
      setReturnedEmptiesQty('');
      setPaymentReceived(0);
      setPaymentMethod('cash');
      setNotes('');
    },
    onError: (error) => {
      setErrorMsg(error.response?.data?.message || 'Transaction failed. Please try again.');
      setSuccessMsg('');
    }
  });

  // Find active selected hotel metadata
  const selectedHotel = hotels?.find(h => h._id === selectedHotelId);

  // Live Calculations
  const calculatedCost = selectedHotel ? selectedHotel.rate * Number(deliveredQty || 0) : 0;
  const originalOutstandingEmpties = selectedHotel ? (selectedHotel.emptyCylinders + selectedHotel.filledCylinders) : 0;
  const liveOutstandingEmptiesAfterDelivery = selectedHotel 
    ? (originalOutstandingEmpties - Number(returnedEmptiesQty || 0) + Number(deliveredQty || 0)) 
    : 0;
  
  const originalPendingBalance = selectedHotel ? selectedHotel.pendingBalance : 0;
  const liveOutstandingDuesAfterDelivery = selectedHotel 
    ? (originalPendingBalance + calculatedCost - Number(paymentReceived || 0)) 
    : 0;

  // Alerts triggers
  const creditLimitExceeded = selectedHotel && liveOutstandingDuesAfterDelivery > selectedHotel.creditLimit;
  const insufficientFarmStock = inventory && Number(deliveredQty || 0) > inventory.filledStock;
  const excessEmptiesReturned = selectedHotel && Number(returnedEmptiesQty || 0) > originalOutstandingEmpties;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedHotelId) return setErrorMsg('Please select a hotel.');
    
    const dQty = Number(deliveredQty || 0);
    const eQty = Number(returnedEmptiesQty || 0);

    if (dQty === 0 && eQty === 0) {
      return setErrorMsg('Please specify at least 1 cylinder delivered or returned empty.');
    }
    if (dQty < 0 || eQty < 0) {
      return setErrorMsg('Quantities cannot be negative.');
    }
    if (insufficientFarmStock) return setErrorMsg('Insufficient filled stock at the farm.');
    if (excessEmptiesReturned) return setErrorMsg(`Hotel owes only ${originalOutstandingEmpties} empties.`);

    setErrorMsg('');
    setSuccessMsg('');

    deliveryMutation.mutate({
      hotelId: selectedHotelId,
      deliveredQty: dQty,
      returnedEmptiesQty: eQty,
      paymentReceived: Number(paymentReceived),
      paymentMethod,
      notes
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Unified Delivery Dispatch</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Deduct farm stock, update outstanding cylinders, and debit accounts receivable atomically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Checkout Form Card (Left 2 columns) */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/40">
          
          {/* Notifications */}
          <AnimatePresence mode="wait">
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-800/30 flex items-start gap-3 text-rose-600 dark:text-rose-400 text-xs"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-800/30 flex items-start gap-3 text-emerald-600 dark:text-emerald-400 text-xs"
              >
                <CheckCircle className="h-5 w-5 shrink-0" />
                <span>{successMsg}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Hotel selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Select Destination Restaurant / Hotel
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <select
                  value={selectedHotelId}
                  onChange={(e) => {
                    setSelectedHotelId(e.target.value);
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
                >
                  <option value="">-- Choose Hotel --</option>
                  {hotels?.map(h => (
                    <option key={h._id} value={h._id}>{h.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Double Input Qty */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Cylinders Delivered */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                  Cylinders Delivered (Filled)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={deliveredQty}
                  onChange={(e) => setDeliveredQty(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
                />
                {insufficientFarmStock && (
                  <span className="text-[10px] text-rose-500 mt-1 block">
                    * Farm only has {inventory?.filledStock || 0} cylinders in stock.
                  </span>
                )}
              </div>

              {/* Cylinders Returned */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                  Empties Collected (Returned)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0"
                  value={returnedEmptiesQty}
                  onChange={(e) => setReturnedEmptiesQty(e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
                />
                {excessEmptiesReturned && (
                  <span className="text-[10px] text-rose-500 mt-1 block">
                    * Hotel only owes {originalOutstandingEmpties} empties.
                  </span>
                )}
              </div>

            </div>

            {/* 3. Payments Details (Inline direct invoice cash settlements) */}
            <div className="p-4 bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border border-slate-200/20 dark:border-slate-800/25 space-y-4">
              <h4 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Immediate Delivery Settlement</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                
                {/* Cash Paid */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                    Payment Collected (Amount)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={paymentReceived}
                    onChange={(e) => setPaymentReceived(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    disabled={paymentReceived === 0}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white disabled:opacity-50"
                  >
                    <option value="cash">💵 Cash Payment</option>
                    <option value="gpay">📱 GooglePay / PhonePe</option>
                    <option value="bank_transfer">🏦 Bank Transfer</option>
                  </select>
                </div>

              </div>
            </div>

            {/* 4. Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Driver Notes / Staff Comments
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Write any delivery notes here (e.g. cylinder leakage test completed)"
                rows="2"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white resize-none"
              />
            </div>

            {/* Action Trigger */}
            <button
              type="submit"
              disabled={deliveryMutation.isPending || !selectedHotelId}
              className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-teal-500/10 disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
            >
              {deliveryMutation.isPending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Truck className="h-4.5 w-4.5" /> Dispatch & Log Delivery
                </>
              )}
            </button>

          </form>

        </div>

        {/* Live Calculation Bill Card (Right 1 column) */}
        <div className="space-y-6">
          
          {/* Farm stock status */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-200/50 dark:border-slate-800/40 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center rounded-lg">
                <Warehouse className="h-4.5 w-4.5" />
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Farm Filled Stocks</span>
                <strong className="text-xl text-slate-800 dark:text-white font-black">
                  {invLoading ? '...' : inventory?.filledStock} Cylinders
                </strong>
              </div>
            </div>
          </div>

          {/* Interactive checkout preview */}
          <div className="glass-panel rounded-3xl p-6 border border-teal-500/20 dark:border-teal-500/10 bg-gradient-to-b from-teal-500/[0.02] to-transparent relative overflow-hidden">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 uppercase tracking-wider flex items-center gap-2">
              <Clipboard className="h-4 w-4 text-teal-600" /> Invoice Preview
            </h3>

            {selectedHotel ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200/40 dark:border-slate-800/30">
                  <h4 className="font-bold text-slate-800 dark:text-white text-base">{selectedHotel.name}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Custom Rate: Rs. {selectedHotel.rate} / Unit</p>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Delivered Quantity Row */}
                  <div className="flex justify-between text-slate-500">
                    <span>Delivered Cylinders:</span>
                    <strong className="text-slate-800 dark:text-white">{deliveredQty} Units</strong>
                  </div>

                  {/* Calculated Invoice Cost */}
                  <div className="flex justify-between text-slate-500">
                    <span>Invoice Subtotal:</span>
                    <strong className="text-slate-800 dark:text-white">Rs. {calculatedCost.toLocaleString()}</strong>
                  </div>

                  {/* Outstanding Empties Row */}
                  <div className="flex justify-between text-slate-500 pb-2 border-b border-slate-200/40 dark:border-slate-800/30">
                    <span>Cash Collected:</span>
                    <strong className="text-emerald-600">- Rs. {Number(paymentReceived || 0).toLocaleString()}</strong>
                  </div>

                  {/* Real-time financial balances */}
                  <div className="pt-2 flex justify-between text-slate-500">
                    <span>Original Balance:</span>
                    <strong className="text-slate-800 dark:text-white">Rs. {originalPendingBalance.toLocaleString()}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">New Pending Dues:</span>
                    <strong className="text-teal-600 dark:text-teal-400 font-extrabold text-sm">
                      Rs. {liveOutstandingDuesAfterDelivery.toLocaleString()}
                    </strong>
                  </div>

                  {/* Empties outstanding preview */}
                  <div className="pt-2 border-t border-slate-200/40 dark:border-slate-800/30 flex justify-between text-slate-500">
                    <span>Original Empties:</span>
                    <strong className="text-slate-800 dark:text-white">{originalOutstandingEmpties} units</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">New Empties Due:</span>
                    <strong className="text-teal-600 dark:text-teal-400 font-bold">
                      {liveOutstandingEmptiesAfterDelivery} units
                    </strong>
                  </div>

                </div>

                {/* Credit Limit Alert Banner */}
                {creditLimitExceeded && (
                  <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-2 text-[10px] text-rose-500">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      <strong>Warning!</strong> Total pending balance will exceed hotel's credit limit of Rs. {selectedHotel.creditLimit.toLocaleString()}.
                    </span>
                  </div>
                )}

                {/* Safety Seal Banner */}
                <div className="mt-4 p-3 bg-slate-100/50 dark:bg-slate-900/30 rounded-xl flex items-center gap-2.5 text-[9px] text-slate-400 uppercase tracking-widest font-bold">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" /> Auto ACID Safety Secure
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Please select a hotel from the checkout drop-down list to preview invoice calculations in real-time.
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
