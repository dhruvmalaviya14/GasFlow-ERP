import { useQuery } from '@tanstack/react-query';
import axios from '../api/axiosInstance';
import { Inbox, RefreshCw, Cylinder } from 'lucide-react';

export default function HotelStatus() {
  
  // Fetch Hotels data
  const { data: hotels, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['hotels'],
    queryFn: async () => {
      const res = await axios.get('/hotels');
      return res.data;
    }
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Hotel Cylinder Status</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tracking filled and empty cylinders outstanding at customer locations.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 text-slate-600 dark:text-slate-350 ${isRefetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Main Table / View */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200/50 dark:border-slate-800/40">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !hotels || hotels.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Inbox className="h-12 w-12 stroke-[1] mb-2 mx-auto" />
            <p className="text-sm">No registered hotels found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-800/50 text-slate-400 text-xs uppercase font-semibold">
                  <th className="pb-3">Hotel / Restaurant</th>
                  <th className="pb-3 text-center">Cylinders Held (Balance)</th>
                  <th className="pb-3 text-right">Cylinder Rent (Rate)</th>
                  <th className="pb-3 text-right">Outstanding Dues</th>
                  <th className="pb-3 text-right">Credit Limit</th>
                  <th className="pb-3 text-center">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {hotels.map((hotel) => {
                  const totalCylinders = hotel.filledCylinders + hotel.emptyCylinders;
                  
                  // Compute account health status dynamically
                  let statusText = 'Good Standing';
                  let statusClass = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400';
                  
                  if (hotel.pendingBalance > hotel.creditLimit) {
                    statusText = 'Credit Exceeded';
                    statusClass = 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400';
                  } else if (hotel.pendingBalance > hotel.creditLimit * 0.8) {
                    statusText = 'Near Limit';
                    statusClass = 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400';
                  }

                  return (
                    <tr key={hotel._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all">
                      <td className="py-4 font-bold text-slate-850 dark:text-slate-100">
                        {hotel.name}
                        <span className="block text-[10px] text-slate-400 font-normal mt-0.5">{hotel.address}</span>
                      </td>
                      <td className="py-4 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400">
                          <Cylinder className="h-3 w-3 fill-teal-600 dark:fill-teal-400" />
                          {totalCylinders} units
                        </span>
                      </td>
                      <td className="py-4 text-right font-semibold text-slate-800 dark:text-white">
                        Rs. {hotel.rate}
                      </td>
                      <td className={`py-4 text-right font-bold ${hotel.pendingBalance > 0 ? 'text-rose-600 dark:text-rose-450' : 'text-slate-500'}`}>
                        Rs. {hotel.pendingBalance.toLocaleString()}
                      </td>
                      <td className="py-4 text-right text-slate-500">
                        Rs. {hotel.creditLimit.toLocaleString()}
                      </td>
                      <td className="py-4 text-center">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusClass}`}>
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
