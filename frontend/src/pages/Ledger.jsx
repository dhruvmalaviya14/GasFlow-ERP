import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  TrendingUp,
  FileDown,
  Building,
  History,
  Coins,
  DollarSign,
  Inbox,
  AlertCircle
} from 'lucide-react';

export default function Ledger() {
  const [selectedHotelId, setSelectedHotelId] = useState('');

  // 1. Fetch Hotels dropdown list
  const { data: hotels, isLoading: hotelsLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: async () => {
      const res = await axios.get('http://127.0.0.1:5000/api/hotels');
      return res.data;
    }
  });

  // 2. Fetch specific Hotel Ledger history populated with entries
  const { data: ledgerData, isLoading: ledgerLoading } = useQuery({
    queryKey: ['ledger', selectedHotelId],
    queryFn: async () => {
      if (!selectedHotelId) return null;
      const res = await axios.get(`http://127.0.0.1:5000/api/ledger/${selectedHotelId}`);
      return res.data;
    },
    enabled: !!selectedHotelId
  });

  const handleDownloadPDF = () => {
    if (!selectedHotelId) return;
    const token = localStorage.getItem('token');
    
    // Direct link to download invoice PDF with Authorization Bearer
    // We open a download link or hit the API.
    // Opening window.open is easiest but requires token auth.
    // In React, we can fetch the blob and download it to support full JWT headers!
    axios({
      url: `http://127.0.0.1:5000/api/ledger/bill/download/${selectedHotelId}`,
      method: 'GET',
      responseType: 'blob', // Important
      headers: { Authorization: `Bearer ${token}` }
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Statement_${ledgerData?.hotel?.name || 'Hotel'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }).catch(err => {
      alert('Failed to generate PDF. Please try again.');
      console.error(err);
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Double-Entry Ledger</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse complete credit/debit historical balance sheets per restaurant.
          </p>
        </div>

        {/* Hotel Dropdown Select */}
        <div className="relative w-full md:w-64">
          <select
            value={selectedHotelId}
            onChange={(e) => setSelectedHotelId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
          >
            <option value="">-- Select Restaurant --</option>
            {hotels?.map(h => (
              <option key={h._id} value={h._id}>{h.name}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedHotelId ? (
        ledgerLoading ? (
          <div className="space-y-4">
            <div className="h-28 bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />
            <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />
          </div>
        ) : !ledgerData ? (
          <div className="py-12 text-center text-slate-400">
            <Inbox className="h-10 w-10 mx-auto stroke-[1] mb-2" />
            <p className="text-sm">Unable to retrieve ledger statement.</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Account Dues Summary Dashboard Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              
              {/* Custom rate */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider block uppercase">Contract Rate</span>
                <h4 className="text-xl font-extrabold text-slate-800 dark:text-white mt-1">
                  Rs. {ledgerData.hotel.rate} <span className="text-xs font-semibold text-slate-400">/ Cylinder</span>
                </h4>
              </div>

              {/* Settled payments */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
                <span className="text-[10px] text-slate-400 font-semibold tracking-wider block uppercase">Total Payments Received</span>
                <h4 className="text-xl font-extrabold text-emerald-600 dark:text-emerald-450 mt-1">
                  Rs. {ledgerData.hotel.totalPaid.toLocaleString()}
                </h4>
              </div>

              {/* Outstanding outstanding balance */}
              <div className="glass-panel p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 flex justify-between items-center relative overflow-hidden">
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider block uppercase">Outstanding Net Dues</span>
                  <h4 className={`text-xl font-black mt-1 ${ledgerData.hotel.pendingBalance > 0 ? 'text-rose-600 dark:text-rose-450' : 'text-slate-800 dark:text-white'}`}>
                    Rs. {ledgerData.hotel.pendingBalance.toLocaleString()}
                  </h4>
                </div>
                
                {/* Export statements */}
                <button
                  onClick={handleDownloadPDF}
                  className="p-2.5 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 text-xs font-bold"
                >
                  <FileDown className="h-4.5 w-4.5" /> Statement
                </button>
              </div>

            </div>

            {/* Ledger Transactions logs Table */}
            <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/40">
              
              <div className="flex items-center gap-2.5 mb-6">
                <History className="h-5 w-5 text-teal-600" />
                <h3 className="text-lg font-bold text-slate-850 dark:text-white">Ledger Audits Statement</h3>
              </div>

              {!ledgerData.ledger || ledgerData.ledger.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Inbox className="h-10 w-10 mx-auto stroke-[1] mb-2" />
                  <p className="text-xs">No ledger transactions found. Create a delivery to start accounts.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200/60 dark:border-slate-800/50 text-slate-400 text-xs uppercase font-semibold">
                        <th className="pb-3">Transaction Date</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Reference Notes</th>
                        <th className="pb-3 text-right">Debit (DR)</th>
                        <th className="pb-3 text-right">Credit (CR)</th>
                        <th className="pb-3 text-right">Outstanding Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                      {ledgerData.ledger.map((entry) => (
                        <tr key={entry._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all">
                          <td className="py-4 text-slate-500 font-mono text-xs">
                            {new Date(entry.createdAt).toLocaleString()}
                          </td>
                          <td className="py-4">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              entry.type === 'delivery'
                                ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400'
                                : entry.type === 'payment'
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450'
                                : 'bg-slate-50 dark:bg-slate-800/40 text-slate-600'
                            }`}>
                              {entry.type}
                            </span>
                          </td>
                          <td className="py-4 text-slate-700 dark:text-slate-350 max-w-xs truncate">
                            {entry.notes}
                          </td>
                          <td className="py-4 text-right font-bold text-rose-600 dark:text-rose-450">
                            {entry.debit > 0 ? `+ Rs. ${entry.debit.toLocaleString()}` : '-'}
                          </td>
                          <td className="py-4 text-right font-bold text-emerald-600 dark:text-emerald-450">
                            {entry.credit > 0 ? `- Rs. ${entry.credit.toLocaleString()}` : '-'}
                          </td>
                          <td className="py-4 text-right font-bold text-slate-850 dark:text-white">
                            Rs. {entry.runningBalance.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>
        )
      ) : (
        <div className="py-20 text-center text-slate-400 glass-panel rounded-3xl border border-slate-200/50 flex flex-col items-center justify-center">
          <TrendingUp className="h-14 w-14 stroke-[1] mb-3 text-slate-300 dark:text-slate-700" />
          <h3 className="font-bold text-slate-700 dark:text-slate-350 text-base">Select Restaurant Accounts</h3>
          <p className="text-xs text-slate-450 mt-1 max-w-sm">
            Choose a customer restaurant from the top dropdown list to analyze detailed credit statements, debit histories, and export statements.
          </p>
        </div>
      )}

    </div>
  );
}
