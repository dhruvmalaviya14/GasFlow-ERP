import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { History, Inbox, RefreshCw, Activity } from 'lucide-react';

export default function Logs() {
  
  // Fetch activity logs
  const { data: logs, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['logs'],
    queryFn: async () => {
      const res = await axios.get('http://127.0.0.1:5000/api/logs');
      return res.data;
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">System Activity Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time administrative audit trace and operational logs.
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

      {/* Table Panel */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/40">
        <div className="flex items-center gap-2.5 mb-6">
          <Activity className="h-5 w-5 text-teal-600" />
          <h3 className="text-lg font-bold text-slate-850 dark:text-white">ERP Audit Logs</h3>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-10 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Inbox className="h-12 w-12 stroke-[1] mb-2 mx-auto" />
            <p className="text-sm">No activity logs recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-800/50 text-slate-400 text-xs uppercase font-semibold">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Operator</th>
                  <th className="pb-3">Action Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-900">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-all">
                    <td className="py-3.5 text-slate-500 font-mono text-xs">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {log.user}
                      </span>
                    </td>
                    <td className="py-3.5 font-semibold text-slate-750 dark:text-slate-200">
                      {log.action}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
