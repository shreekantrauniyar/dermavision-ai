import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import { 
  Activity, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  AlertCircle,
  PlusCircle, 
  Upload, 
  MessageSquare,
  ChevronRight
} from 'lucide-react';
import { useScans } from '../hooks/useScans';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { scans, loading } = useScans(10);
  const latestScan = scans[0];

  const chartData = React.useMemo(() => {
    return scans
      .filter(s => s.createdAt)
      .map((s) => ({
        name: new Date(s.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        confidence: s.confidence * 100,
      })).reverse();
  }, [scans]);

  const prevalenceData = React.useMemo(() => {
    if (scans.length === 0) {
      return [
        { name: 'Acne Vulgaris', val: 0, color: 'bg-slate-200' },
        { name: 'Eczema', val: 0, color: 'bg-slate-200' },
        { name: 'Psoriasis', val: 0, color: 'bg-slate-200' },
        { name: 'Others', val: 0, color: 'bg-slate-200' },
      ];
    }

    const counts: Record<string, number> = {};
    scans.forEach(s => {
      counts[s.diseaseName] = (counts[s.diseaseName] || 0) + 1;
    });

    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);

    const total = scans.length;
    const colors = ['bg-indigo-600', 'bg-indigo-400', 'bg-slate-400', 'bg-slate-300'];

    return sorted.map(([name, count], i) => ({
      name,
      val: Math.round((count / total) * 100),
      color: colors[i] || 'bg-slate-300'
    }));
  }, [scans]);

  return (
    <div className="grid grid-cols-12 grid-rows-6 gap-6 h-[calc(100vh-140px)]">
      
      {/* Instant Analysis / Upload CTA */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="col-span-8 row-span-2 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-center relative overflow-hidden group shadow-sm hover:shadow-md transition-all"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
          <Activity size={120} />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Instant Analysis</h3>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Start a new skin check</h2>
            <Link to="/scan" className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-semibold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
              <PlusCircle size={18} />
              New Scan
            </Link>
          </div>
          <div className="hidden md:block w-48 h-32 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center">
            <Upload className="text-indigo-600 opacity-20" size={48} />
          </div>
        </div>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="col-span-4 row-span-2 bg-indigo-600 rounded-2xl text-white p-6 flex flex-col justify-between shadow-lg shadow-indigo-200"
      >
        <div>
          <h3 className="text-xs font-semibold uppercase opacity-70 tracking-widest">Health Insights</h3>
          <div className="mt-4 space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Total Scans Done</span>
                <span className="font-bold">{scans.length}</span>
              </div>
              <div className="h-1.5 bg-indigo-400/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(scans.length * 10, 100)}%` }}
                  className="h-full bg-white"
                ></motion.div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>Average Confidence</span>
                <span className="font-bold">
                  {scans.length > 0 
                    ? (scans.reduce((acc, s) => acc + s.confidence, 0) / scans.length * 100).toFixed(1) 
                    : '0'
                  }%
                </span>
              </div>
              <div className="h-1.5 bg-indigo-400/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${scans.length > 0 ? (scans.reduce((acc, s) => acc + s.confidence, 0) / scans.length * 100) : 0}%` }}
                  className="h-full bg-white"
                ></motion.div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4 border-t border-indigo-400/30 pt-4">
          <ShieldCheck size={24} className="opacity-70" />
          <p className="text-xs opacity-90 leading-tight">Your data is secured with HIPAA-grade encryption.</p>
        </div>
      </motion.div>

      {/* Latest Analysis Detail */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="col-span-5 row-span-4 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-semibold text-slate-800">Latest Result</h3>
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded uppercase tracking-tighter">Processed</span>
        </div>
        
        {latestScan ? (
          <>
            <div className="flex gap-4 mb-6">
              <img src={latestScan.imageUrl} className="w-24 h-24 bg-slate-100 rounded-lg border border-slate-200 object-cover" alt="Scan" />
              <div className="flex-1">
                <p className="text-[10px] text-slate-500 font-bold uppercase">Detected Condition</p>
                <h4 className="text-xl font-bold text-indigo-700 leading-tight truncate">{latestScan.diseaseName}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className={cn(
                    "w-3 h-3 rounded-full",
                    latestScan.confidence > 0.8 ? "bg-emerald-500" : "bg-amber-500"
                  )}></div>
                  <span className="text-xs font-semibold">{(latestScan.confidence * 100).toFixed(1)}% Match</span>
                </div>
              </div>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Top Precautions</p>
                <div className="space-y-1.5 mt-1">
                  {latestScan.precautions.slice(0, 2).map((p, i) => (
                    <div key={i} className="flex gap-2 text-xs text-slate-600">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0"></div>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Treatment</p>
                  <p className="text-[11px] font-medium text-slate-700 truncate">{latestScan.treatment}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Risk Level</p>
                  <p className={cn(
                    "text-[11px] font-medium",
                    latestScan.confidence > 0.8 ? "text-emerald-600" : "text-amber-600"
                  )}>
                    {latestScan.confidence > 0.8 ? 'Low' : 'Moderate'}
                  </p>
                </div>
              </div>
            </div>
            <Link to="/history" className="mt-4 w-full py-2.5 bg-slate-900 text-white text-[11px] font-bold rounded-lg text-center hover:bg-black transition-colors">
              View Detailed Report
            </Link>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
              <Activity size={32} />
            </div>
            <p className="text-sm font-medium text-slate-400">No scans yet. Your latest results will appear here.</p>
          </div>
        )}
      </motion.div>

      {/* Trend Analytics */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="col-span-7 row-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">Confidence Trends</h3>
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></span>
            <span className="w-2.5 h-2.5 bg-slate-200 rounded-full"></span>
          </div>
        </div>
        <div className="h-32 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="dashboardGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="confidence" stroke="#4f46e5" strokeWidth={2} fill="url(#dashboardGrad)" />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '10px' }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full bg-slate-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="text-slate-200" size={32} />
            </div>
          )}
        </div>
      </motion.div>

      {/* Prevalence Breakdown */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="col-span-4 row-span-2 bg-white rounded-2xl border border-slate-200 p-6 flex flex-col shadow-sm"
      >
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Diagnosis Prevalence</h3>
        <div className="space-y-3 flex-1 overflow-y-auto pr-2">
          {prevalenceData.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={cn("w-2 h-2 rounded-full", item.color)}></div>
              <span className="text-[11px] text-slate-600 flex-1 truncate">{item.name}</span>
              <span className="text-[11px] font-bold text-slate-900">{item.val}%</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* AI Assistant Mini-Chat */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="col-span-3 row-span-2 bg-slate-900 rounded-2xl p-5 flex flex-col text-white shadow-xl shadow-slate-200"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
            <MessageSquare size={12} />
          </div>
          <h3 className="text-xs font-bold">Smart Assistant</h3>
        </div>
        <div className="flex-1 flex flex-col justify-end space-y-4">
           <div className="bg-slate-800 rounded-lg p-3 text-[10px] leading-relaxed border border-slate-700">
             Hello! Ask me any questions about your results or skin care routines.
           </div>
           <Link to="/chat" className="relative group text-left">
             <div className="w-full bg-slate-800 border-none rounded-lg py-2 px-3 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Ask about symptoms...</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
             </div>
           </Link>
        </div>
      </motion.div>

    </div>
  );
}
