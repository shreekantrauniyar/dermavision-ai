import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Camera, Upload, CheckCircle2, AlertCircle, 
  FileText, Info, ChevronRight
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useScans, type ScanResult } from '../hooks/useScans';

export default function ScanPage() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addScan } = useScans();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target?.result as string);
      setResult(null);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze-skin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      const scanResult: ScanResult = {
        ...data,
        imageUrl: image,
        createdAt: new Date().toISOString(),
      };
      setResult(scanResult);
      await addScan(scanResult);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8 print:hidden">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">New Diagnostic Scan</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Upload a clear photo of the affected skin area for instant AI analysis.</p>
      </div>

      {!result ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden"
        >
          <div 
            className={cn(
              "p-12 flex flex-col items-center justify-center border-b border-gray-50 dark:border-slate-800 transition-colors",
              image ? "bg-indigo-50/30 dark:bg-indigo-950/20" : "bg-white dark:bg-slate-900"
            )}
          >
            {image ? (
              <div className="relative group">
                <img src={image} alt="Upload" className="w-64 h-64 object-cover rounded-2xl shadow-lg" />
                <button 
                  onClick={() => setImage(null)}
                  className="absolute -top-3 -right-3 bg-white dark:bg-slate-800 text-gray-900 dark:text-white w-8 h-8 rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  &times;
                </button>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-64 border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 transition-all group"
              >
                <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Upload size={32} />
                </div>
                <p className="text-gray-900 dark:text-white font-semibold text-lg">Click to upload or drag & drop</p>
                <p className="text-gray-400 dark:text-slate-500 mt-1">PNG, JPG or JPEG (max 10MB)</p>
              </div>
            )}
            <input 
              ref={fileInputRef}
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload} 
            />
          </div>

          <div className="p-8 flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-green-500" />
                <span>AI processing active</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 dark:bg-slate-600 rounded-full"></div>
              <div className="flex items-center gap-1.5">
                <AlertCircle size={16} className="text-indigo-500" />
                <span>HIPAA Compliant</span>
              </div>
            </div>

            <button 
              disabled={!image || analyzing}
              onClick={handleAnalyze}
              className={cn(
                "px-8 py-3 rounded-xl font-semibold transition-all flex items-center gap-2",
                image && !analyzing ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 active:scale-95" : "bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600 cursor-not-allowed"
              )}
            >
              {analyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Camera size={20} />
                  Start Analysis
                </>
              )}
            </button>
          </div>
        </motion.div>
      ) : (
        <AnalysisResult result={result} onReset={() => setResult(null)} />
      )}

      {error && (
        <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      )}
    </div>
  );
}

function AnalysisResult({ result, onReset }: { result: ScanResult, onReset: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6 pb-12"
    >
      {/* Print Only Header */}
      <div className="hidden print:flex flex-col mb-8 border-b-2 border-slate-900 pb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Clinical Analysis Report</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
              <span className="text-slate-900 font-bold tracking-tight">DermaVision AI Diagnostic Suite</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Session Token</p>
            <p className="text-sm font-mono text-slate-900">CUR-{new Date().getTime().toString().slice(-8)}</p>
            <p className="text-xs text-slate-500 font-medium">Issued: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm p-8 flex gap-8">
        <img src={result.imageUrl} alt="Result" className="w-48 h-48 object-cover rounded-2xl shadow-md" />
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="px-3 py-1 bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 text-xs font-bold uppercase rounded-full tracking-wider">Analysis Complete</span>
            <span className="text-gray-400 dark:text-slate-500 text-sm">{new Date(result.createdAt).toLocaleDateString()}</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">{result.diseaseName}</h2>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-2 flex-1 max-w-xs bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence * 100}%` }}
                className={cn("h-full", result.confidence > 0.8 ? "bg-green-500" : "bg-yellow-500")}
              ></motion.div>
            </div>
            <span className="text-sm font-bold text-gray-700 dark:text-slate-300">{(result.confidence * 100).toFixed(1)}% Confidence</span>
          </div>
          <p className="text-gray-600 dark:text-slate-300 leading-relaxed italic">"{result.aiExplanation}"</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <AlertCircle size={20} className="text-orange-500" />
            Symptoms
          </h3>
          <ul className="space-y-2">
            {result.symptoms.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-slate-300">
                <ChevronRight size={18} className="text-indigo-500 dark:text-indigo-400 mt-0.5" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <Info size={20} className="text-indigo-500" />
            Precautions
          </h3>
          <ul className="space-y-2">
            {result.precautions.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-gray-600 dark:text-slate-300">
                <CheckCircle2 size={18} className="text-green-500 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm md:col-span-2">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
            <FileText size={20} className="text-indigo-500" />
            Potential Causes
          </h3>
          <p className="text-gray-600 dark:text-slate-300 leading-relaxed">
            {result.causes && result.causes.length > 0 
              ? result.causes.join(", ") 
              : "Common triggers include environmental factors, genetics, or lifestyle habits."}
          </p>
        </div>
      </div>

      <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 dark:shadow-none">
        <h3 className="text-xl font-bold mb-4">Suggested Treatment Plan</h3>
        <p className="text-slate-50 dark:text-slate-300 opacity-90 leading-relaxed mb-6">{result.treatment}</p>
        <div className="bg-white/10 p-4 rounded-xl border border-white/20">
          <p className="text-sm font-medium flex items-center gap-2">
            <AlertCircle size={16} />
            Medical Disclaimer
          </p>
          <p className="text-xs text-slate-100 dark:text-slate-400 mt-1">This analysis is for informational purposes only. Please consult a licensed dermatologist before starting any medical treatment.</p>
        </div>
      </div>

      <div className="flex gap-4 print:hidden">
        <button 
          onClick={() => window.print()}
          className="flex-1 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-900 dark:text-white font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
        >
          <FileText size={20} />
          Export as PDF
        </button>
        <button 
          onClick={onReset}
          className="flex-1 py-4 rounded-2xl bg-gray-900 dark:bg-indigo-600 text-white font-semibold hover:bg-black dark:hover:bg-indigo-700 transition-all"
        >
          Conduct Another Scan
        </button>
      </div>
    </motion.div>
  );
}
