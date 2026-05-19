import React, { useState } from 'react';
import { useScans } from '../hooks/useScans';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, ChevronRight, Calendar, AlertCircle, Trash2, X, Info, CheckCircle2, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';
import { ScanResult } from '../types';

export default function HistoryPage() {
  const { scans, loading } = useScans();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScan, setSelectedScan] = useState<ScanResult | null>(null);
  const { user } = useAuth();

  const filteredScans = scans.filter(s => 
    s.diseaseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm("Are you sure you want to delete this scan?")) return;
    
    try {
      const res = await fetch(`/api/scans/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error("Failed to delete scan");
      // UI will refresh on next interval
    } catch (err) {
      console.error("Error deleting scan:", err);
      alert("Failed to delete scan.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Diagnostic History</h1>
          <p className="text-gray-500 mt-1">Review and manage all your previous skin analysis reports.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm flex items-center gap-2">
            <Search size={18} className="text-gray-400" />
            <input 
              type="text" 
              placeholder="Search diseases..." 
              className="bg-transparent border-none focus:outline-none text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 bg-white rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 text-gray-600">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white rounded-3xl h-64 animate-pulse border border-gray-100"></div>
          ))}
        </div>
      ) : filteredScans.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
          <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-300 mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {searchTerm ? "No matches found" : "No scans found"}
          </h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            {searchTerm 
              ? `No results for "${searchTerm}". Try another term.` 
              : "You haven't conducted any scans yet. Start your first analysis to see results here."}
          </p>
          {!searchTerm && (
            <Link to="/scan" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold shadow-lg shadow-blue-200">
              Start First Scan
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print:hidden">
          <AnimatePresence>
            {filteredScans.map((scan, i) => (
              <motion.div 
                key={scan.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                layout
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300"
              >
                <div className="relative h-48">
                  <img src={scan.imageUrl} alt={scan.diseaseName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <div className={cn(
                      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md",
                      scan.confidence > 0.8 ? "bg-green-500/80 text-white" : "bg-yellow-500/80 text-white"
                    )}>
                      {(scan.confidence * 100).toFixed(0)}% Match
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 font-medium">
                    <Calendar size={14} />
                    {new Date(scan.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{scan.diseaseName}</h3>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                    <button 
                      onClick={() => setSelectedScan(scan)}
                      className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                    >
                      View Report
                      <ChevronRight size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleDelete(scan.id!, e)}
                      className="text-xs font-medium text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedScan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedScan(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <button 
                onClick={() => setSelectedScan(null)}
                className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"
              >
                <X size={20} />
              </button>

              <div className="p-8 md:p-12">
                {/* Print Only Header */}
                <div className="hidden print:flex flex-col mb-8 border-b-2 border-slate-900 pb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Clinical Report</h1>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
                        <span className="text-slate-900 font-bold tracking-tight">DermaVision AI Diagnostic Suite</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Document Registry</p>
                      <p className="text-sm font-mono text-slate-900">REF-{selectedScan?.id?.slice(-8).toUpperCase()}</p>
                      <p className="text-xs text-slate-500 font-medium">Issued: {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 mb-10">
                  <img src={selectedScan.imageUrl} alt="Result" className="w-full md:w-64 h-64 object-cover rounded-[1.5rem] shadow-lg" />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase rounded-full tracking-wider">Historical Record</span>
                      <span className="text-slate-400 text-sm font-medium">{new Date(selectedScan.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 mb-4">{selectedScan.diseaseName}</h2>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="h-2.5 flex-1 max-w-xs bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedScan.confidence * 100}%` }}
                          className={cn("h-full", selectedScan.confidence > 0.8 ? "bg-emerald-500" : "bg-amber-500")}
                        ></motion.div>
                      </div>
                      <span className="text-sm font-bold text-slate-700">{(selectedScan.confidence * 100).toFixed(1)}% confidence score</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed italic border-l-4 border-indigo-100 pl-4 py-2 bg-indigo-50/30 rounded-r-lg">
                      "{selectedScan.aiExplanation}"
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-3 text-slate-900">
                      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                        <AlertCircle size={24} />
                      </div>
                      Detected Symptoms
                    </h3>
                    <ul className="space-y-4">
                      {selectedScan.symptoms.map((s, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-600 font-medium">
                          <ChevronRight size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center gap-3 text-slate-900">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                        <CheckCircle2 size={24} />
                      </div>
                      Care Precautions
                    </h3>
                    <ul className="space-y-4">
                      {selectedScan.precautions.map((p, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-600 font-medium">
                          <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 md:col-span-2">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-3 text-slate-900">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                        <Info size={24} />
                      </div>
                      Potential Causes
                    </h3>
                    <p className="text-slate-600 font-medium leading-relaxed">
                      {selectedScan.causes && selectedScan.causes.length > 0
                        ? selectedScan.causes.join(", ")
                        : "Various factors including genetics, environment, or specific triggers."}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Info size={120} />
                   </div>
                   <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                        <FileText size={28} />
                      </div>
                      Suggested Treatment Plan
                    </h3>
                    <p className="text-slate-100 text-lg leading-relaxed mb-8 opacity-90">{selectedScan.treatment}</p>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-md">
                      <p className="text-sm font-bold flex items-center gap-2 mb-2 uppercase tracking-wider text-indigo-400">
                        <AlertCircle size={16} />
                        Medical Disclaimer
                      </p>
                      <p className="text-[13px] text-slate-300 leading-relaxed font-medium">
                        This digital analysis provided by DermaVision AI is for informational and record-keeping purposes only. It is not a substitute for clinical diagnosis. Always seek the advice of a board-certified dermatologist before proceeding with treatments.
                      </p>
                    </div>
                   </div>
                </div>

                <div className="mt-10 flex justify-end print:hidden">
                   <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                   >
                     <FileText size={20} />
                     Generate PDF Report
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
