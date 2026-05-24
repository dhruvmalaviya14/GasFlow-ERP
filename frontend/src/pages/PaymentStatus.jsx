import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coins,
  Search,
  PlusCircle,
  X,
  CreditCard,
  Building,
  CheckCircle,
  Inbox,
  AlertCircle
} from 'lucide-react';

export default function PaymentStatus() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Payment Modal Trigger States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeHotel, setActiveHotel] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [modalError, setModalError] = useState('');

  // 1. Fetch live Accounts Receivable from backend
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['paymentStatus'],
    queryFn: async () => {
      const res = await axios.get('http://127.0.0.1:5000/api/payments/status');
      return res.data;
    }
  });

  // 2. Mutation to record independent settlement credits
  const paymentMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post('http://127.0.0.1:5000/api/payments', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paymentStatus'] });
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });

      // Reset & close
      setIsModalOpen(false);
      setActiveHotel(null);
      setPaymentAmount('');
      setPaymentMethod('cash');
      setNotes('');
      setModalError('');
    },
    onError: (error) => {
      setModalError(error.response?.data?.message || 'Failed to submit payment. Please verify inputs.');
    }
  });

  const handleOpenModal = (hotel) => {
    setActiveHotel(hotel);
    setPaymentAmount(hotel.pending > 0 ? hotel.pending : '');
    setIsModalOpen(true);
    setModalError('');
  };

  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      return setModalError('Please specify a positive settlement amount.');
    }
    setModalError('');
    paymentMutation.mutate({
      hotelId: activeHotel.hotel_id,
      amount: Number(paymentAmount),
      paymentMethod,
      notes
    });
  };

  // Filter accounts
  const filteredAccounts = accounts?.filter(acc =>
    acc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Payment Dues Status</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time accounts receivable audits, partial payments, and ledger logs.
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search hotel payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
          />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/40">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !filteredAccounts || filteredAccounts.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Inbox className="h-12 w-12 stroke-[1] mb-2 mx-auto" />
            <p className="text-sm">No payment records found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-800/50 text-slate-400 text-xs uppercase font-semibold">
                  <th className="pb-3">Restaurant / Hotel</th>
                  <th className="pb-3 text-right">Standard Cylinder Rate</th>
                  <th className="pb-3 text-right">Settled Amount (Paid)</th>
                  <th className="pb-3 text-right">Outstanding Dues (Unpaid)</th>
                  <th className="pb-3 text-center">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {filteredAccounts.map((acc) => (
                  <tr key={acc.hotel_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all">
                    <td className="py-4 font-bold text-slate-850 dark:text-slate-100">
                      {acc.name}
                    </td>
                    <td className="py-4 text-right font-semibold text-slate-500">
                      Rs. {acc.rate}
                    </td>
                    <td className="py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                      Rs. {acc.paid.toLocaleString()}
                    </td>
                    <td className={`py-4 text-right font-bold ${acc.pending > 0 ? 'text-rose-600 dark:text-rose-450' : 'text-slate-600 dark:text-slate-350'}`}>
                      Rs. {acc.pending.toLocaleString()}
                    </td>
                    <td className="py-4 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        acc.pending <= 0
                          ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                      }`}>
                        {acc.pending <= 0 ? 'Settled' : 'Unpaid Dues'}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(acc)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/35 text-xs font-bold transition-all cursor-pointer"
                      >
                        <Coins className="h-3.5 w-3.5" /> Record Payment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-in Payment Modal overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl relative border border-slate-200 dark:border-slate-800"
            >
              
              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              {/* Title Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center rounded-xl">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">Record Direct Payment</h3>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold tracking-wide uppercase">Credits double-entry ledger</span>
                </div>
              </div>

              {modalError && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/30 rounded-xl flex items-start gap-2 text-rose-500 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Quick Info Box */}
              {activeHotel && (
                <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200/20 dark:border-slate-800/35 space-y-2 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-white">
                    <Building className="h-4 w-4 text-teal-600" /> {activeHotel.name}
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Original Dues:</span>
                    <strong className="text-rose-600">Rs. {activeHotel.pending.toLocaleString()}</strong>
                  </div>
                </div>
              )}

              {/* Direct payment input form */}
              <form onSubmit={handleRecordPayment} className="space-y-4">
                
                {/* Payment Amount */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Settled Amount (Rs.)
                  </label>
                  <input
                    type="number"
                    min="0.01"
                    step="any"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    placeholder="Enter amount collected"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Settlement Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
                  >
                    <option value="cash">💵 Cash Payment</option>
                    <option value="gpay_phonepe">📱 GPay / PhonePe UPI</option>
                    <option value="bank_transfer">🏦 Bank Direct Deposit</option>
                    <option value="cheque">📄 Cheque Settlement</option>
                    <option value="other">⚙️ Other Method</option>
                  </select>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Audit notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Received partial cash payment for April deliveries"
                    rows="2"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentMutation.isPending}
                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-500/10 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {paymentMutation.isPending ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" /> Log Payment
                      </>
                    )}
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
