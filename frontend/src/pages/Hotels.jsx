import { useState, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Phone,
  MapPin,
  DollarSign,
  Search,
  PlusCircle,
  X,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle,
  Inbox,
  ShieldCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hotels() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [activeHotel, setActiveHotel] = useState(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [rate, setRate] = useState(1000);
  const [creditLimit, setCreditLimit] = useState(50000);
  const [modalError, setModalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Fetch Hotels List
  const { data: hotels, isLoading } = useQuery({
    queryKey: ['hotels'],
    queryFn: async () => {
      const res = await axios.get('http://127.0.0.1:5000/api/hotels');
      return res.data;
    }
  });

  // 2. Edit Mutation
  const editMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.put(`http://127.0.0.1:5000/api/hotels/${payload.id}`, payload.data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['paymentStatus'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });

      setIsEditOpen(false);
      setSuccessMsg('Hotel details updated successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (error) => {
      setModalError(error.response?.data?.message || 'Update failed.');
    }
  });

  // 3. Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await axios.delete(`http://127.0.0.1:5000/api/hotels/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] });
      queryClient.invalidateQueries({ queryKey: ['paymentStatus'] });
      queryClient.invalidateQueries({ queryKey: ['logs'] });

      setSuccessMsg('Hotel removed successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Cannot delete hotel with outstanding cylinders or pending balances.');
    }
  });

  const handleOpenEdit = (hotel) => {
    setActiveHotel(hotel);
    setName(hotel.name);
    setAddress(hotel.address);
    setContact(hotel.contact);
    setRate(hotel.rate);
    setCreditLimit(hotel.creditLimit);
    setIsEditOpen(true);
    setModalError('');
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    if (!name || !address || !contact || rate === undefined) {
      return setModalError('Please fill in all required fields.');
    }
    editMutation.mutate({
      id: activeHotel._id,
      data: { name, address, contact, rate: Number(rate), creditLimit: Number(creditLimit) }
    });
  };

  const handleDelete = (id, hotelName) => {
    if (window.confirm(`Are you sure you want to permanently delete ${hotelName}?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Filter Search
  const filteredHotels = hotels?.filter(h =>
    h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    h.contact.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Active Hotels & Rates</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure rates, credit limits, and addresses for local deliveries.
          </p>
        </div>

        <div className="flex w-full md:w-auto items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search registered hotels..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
            />
          </div>
          
          <Link
            to="/add-hotel"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-md shadow-teal-500/10 transition-all cursor-pointer whitespace-nowrap"
          >
            <PlusCircle className="h-4 w-4" /> Add Hotel
          </Link>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/40 dark:border-emerald-800/35 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Grid List of Hotels */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-100 dark:bg-slate-900 rounded-3xl animate-pulse" />
          ))}
        </div>
      ) : !filteredHotels || filteredHotels.length === 0 ? (
        <div className="py-20 text-center text-slate-400 glass-panel rounded-3xl border border-slate-200/50">
          <Inbox className="h-12 w-12 stroke-[1] mb-2 mx-auto" />
          <p className="text-sm">No registered hotels match your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHotels.map((hotel) => (
            <div
              key={hotel._id}
              className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/40 hover:border-teal-500/20 dark:hover:border-teal-500/10 transition-all duration-300 relative overflow-hidden group flex flex-col justify-between"
            >
              <div>
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-850 dark:text-slate-100 text-base leading-tight group-hover:text-teal-600 transition-colors">
                        {hotel.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block mt-0.5">Rate Group</span>
                    </div>
                  </div>
                </div>

                {/* Info Lines */}
                <div className="space-y-2.5 text-xs text-slate-650 dark:text-slate-350">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{hotel.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{hotel.contact}</span>
                  </div>
                </div>
              </div>

              {/* Dues & Controls */}
              <div className="mt-6 pt-4 border-t border-slate-200/40 dark:border-slate-800/30 flex justify-between items-center">
                <div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Cylinder Rate</span>
                  <strong className="text-base text-slate-850 dark:text-white font-extrabold">Rs. {hotel.rate}</strong>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(hotel)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => handleDelete(hotel._id, hotel.name)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 transition-all cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Edit Hotel Modal */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl relative border border-slate-200 dark:border-slate-800"
            >
              
              <button
                onClick={() => setIsEditOpen(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center rounded-xl">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">Modify Hotel Settings</h3>
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold tracking-wide uppercase">Configure contract rates</span>
                </div>
              </div>

              {modalError && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-800/30 rounded-xl flex items-start gap-2 text-rose-500 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleUpdateSubmit} className="space-y-4">
                
                {/* Hotel Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Hotel Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
                  />
                </div>

                {/* Contact */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Contact Info
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
                  />
                </div>

                {/* Rate & Credit Limit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Rate / Cyl.
                    </label>
                    <input
                      type="number"
                      value={rate}
                      onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Credit Limit
                    </label>
                    <input
                      type="number"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all dark:text-white"
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editMutation.isPending}
                    className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-teal-500/10 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {editMutation.isPending ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <ShieldCheck className="h-3.5 w-3.5" /> Save Changes
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
