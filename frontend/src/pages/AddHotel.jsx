import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Phone,
  DollarSign,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  Coins
} from 'lucide-react';

export default function AddHotel() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [rate, setRate] = useState(1000);
  const [creditLimit, setCreditLimit] = useState(50000);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const addHotelMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post('/hotels', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['paymentStatus'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });

      setSuccessMsg('New restaurant registered successfully!');
      setErrorMsg('');
      
      // Reset fields
      setName('');
      setAddress('');
      setContact('');
      setRate(1000);
      setCreditLimit(50000);

      // Redirect after brief delay
      setTimeout(() => {
        navigate('/hotels');
      }, 1500);
    },
    onError: (error) => {
      setErrorMsg(error.response?.data?.message || 'Failed to add hotel. Name might be a duplicate.');
      setSuccessMsg('');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !address || !contact || rate === undefined) {
      return setErrorMsg('Please fill in all required fields.');
    }
    setErrorMsg('');
    setSuccessMsg('');

    addHotelMutation.mutate({
      name,
      address,
      contact,
      rate: Number(rate),
      creditLimit: Number(creditLimit)
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Register New Hotel</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure initial pricing contracts and cylinder delivery location.
        </p>
      </div>

      {/* Form Card */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/40">
        
        {errorMsg && (
          <div className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/30 rounded-xl flex items-start gap-2.5 text-rose-500 text-xs">
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-800/35 rounded-xl flex items-start gap-2.5 text-emerald-600 dark:text-emerald-400 text-xs">
            <CheckCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Hotel Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Hotel / Restaurant Name
            </label>
            <div className="relative">
              <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Royal Palace Hotel"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
              />
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Delivery Address
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. 14, Main Ring Road, Sector 3"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
              Contact Info (Mobile/Manager name)
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. +91 98765 00123 (Manager Rajesh)"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
              />
            </div>
          </div>

          {/* Rate and Credit Limit Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            
            {/* Standard Cylinder Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Standard Cylinder Rate (Rs.)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  value={rate}
                  onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
                />
              </div>
            </div>

            {/* Credit Limit */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                Account Credit Limit (Rs.)
              </label>
              <div className="relative">
                <Coins className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <input
                  type="number"
                  min="0"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
                />
              </div>
            </div>

          </div>

          {/* Trigger Button */}
          <button
            type="submit"
            disabled={addHotelMutation.isPending}
            className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-teal-500/10 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {addHotelMutation.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <>
                <PlusCircle className="h-4.5 w-4.5" /> Save & Register Hotel
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
}
