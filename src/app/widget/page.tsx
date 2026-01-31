'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Environment = 'regular' | 'refactor';

interface ComparisonItem {
  path: string;
  regularValue: any;
  refactorValue: any;
  isMatch: boolean;
}

export default function WidgetComparePage() {
  const router = useRouter();

  // 1. All State Definitions
  const [inputs, setInputs] = useState({
    regUrl: '',
    regToken: '',
    regDashId: '',
    regWidgetId: '',
    refUrl: '',
    refToken: '',
    refDashId: '',
    refWidgetId: ''
  });
  
  const [regularData, setRegularData] = useState<any | null>(null);
  const [refactorData, setRefactorData] = useState<any | null>(null);
  const [comparisonReport, setComparisonReport] = useState<ComparisonItem[]>([]);
  
  const [regLoading, setRegLoading] = useState(false);
  const [refLoading, setRefLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasCompared, setHasCompared] = useState(false);

  /* ================================
     Logic: Full Recursive Comparison
     ================================ */
  const getFullComparison = (obj1: any, obj2: any, path = ''): ComparisonItem[] => {
    const allKeys = Array.from(new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]));

    return allKeys.flatMap((key) => {
      const currentPath = path ? `${path}.${key}` : key;
      const val1 = obj1?.[key];
      const val2 = obj2?.[key];

      if (
        typeof val1 === 'object' && val1 !== null &&
        typeof val2 === 'object' && val2 !== null &&
        !Array.isArray(val1)
      ) {
        return getFullComparison(val1, val2, currentPath);
      } else {
        return {
          path: currentPath,
          regularValue: val1,
          refactorValue: val2,
          isMatch: JSON.stringify(val1) === JSON.stringify(val2),
        };
      }
    });
  };

  /* ================================
     Logic: Excel Export (Full Audit)
     ================================ */
  const exportToExcel = () => {
    if (comparisonReport.length === 0) return;
    
    const headers = ["Property Path", "Regular Value", "Refactor Value", "Status"];
    const rows = comparisonReport.map(item => {
      const regStr = item.regularValue === undefined ? 'undefined' : JSON.stringify(item.regularValue);
      const refStr = item.refactorValue === undefined ? 'undefined' : JSON.stringify(item.refactorValue);
      return [
        item.path, 
        `"${regStr.replace(/"/g, '""')}"`, 
        `"${refStr.replace(/"/g, '""')}"`,
        item.isMatch ? "MATCH" : "MISMATCH"
      ];
    });

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Full_Audit_Report_${Date.now()}.csv`;
    link.click();
  };

  /* ================================
     Logic: Fetching Data
     ================================ */
  const handleFetch = async (env: Environment) => {
    const isReg = env === 'regular';
    const baseUrl = isReg ? inputs.regUrl : inputs.refUrl;
    const token = isReg ? inputs.regToken : inputs.refToken;
    const dId = isReg ? inputs.regDashId : inputs.refDashId;
    const wId = isReg ? inputs.regWidgetId : inputs.refWidgetId;

    if (!baseUrl || !token || !dId || !wId) {
      setError(`All fields are required for ${env} environment.`);
      return;
    }

    isReg ? setRegLoading(true) : setRefLoading(true);
    setError('');

    try {
      const res = await fetch('/api/widget/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url: baseUrl.trim(),
          token: token.trim(),
          dashboardId: dId.trim(), 
          widgetId: wId.trim(), 
          environment: env 
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      isReg ? setRegularData(json.data) : setRefactorData(json.data);
      setHasCompared(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      isReg ? setRegLoading(false) : setRefLoading(false);
    }
  };

  const runComparison = () => {
    if (!regularData || !refactorData) return;
    setCompareLoading(true);
    const report = getFullComparison(regularData, refactorData);
    setComparisonReport(report);
    setHasCompared(true);
    setCompareLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 py-4 px-8 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded text-white font-bold text-xs">DXC</div>
            <h1 className="text-xl font-semibold tracking-tight">Widget Quality Lab</h1>
          </div>
          <button onClick={() => router.push('/')} className="text-slate-500 hover:text-slate-800 text-sm font-medium transition-colors underline decoration-slate-200 underline-offset-4">
            ← Exit Lab
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8">
        
        {/* Dynamic Input Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          
          {/* Regular Section */}
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex justify-between items-center">
              <h2 className="text-xs font-bold text-red-600 uppercase tracking-widest">Source: Regular</h2>
              {regularData && <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black">LOADED</span>}
            </div>
            <div className="p-6 space-y-4">
              <input 
                placeholder="Base URL (https://...)" 
                value={inputs.regUrl} 
                onChange={e => setInputs({...inputs, regUrl: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
              />
              <input 
                type="password"
                placeholder="JWT Token" 
                value={inputs.regToken} 
                onChange={e => setInputs({...inputs, regToken: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400"
              />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Dash ID" value={inputs.regDashId} onChange={e => setInputs({...inputs, regDashId: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400" />
                <input placeholder="Widget ID" value={inputs.regWidgetId} onChange={e => setInputs({...inputs, regWidgetId: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-red-400" />
              </div>
              <button onClick={() => handleFetch('regular')} disabled={regLoading} className="w-full py-2.5 rounded-lg font-bold text-sm bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                {regLoading ? 'Fetching...' : 'Fetch Regular'}
              </button>
            </div>
          </section>

          {/* Refactor Section */}
          <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex justify-between items-center">
              <h2 className="text-xs font-bold text-green-600 uppercase tracking-widest">Target: Refactor</h2>
              {refactorData && <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-black">LOADED</span>}
            </div>
            <div className="p-6 space-y-4">
              <input 
                placeholder="Base URL (https://...)" 
                value={inputs.refUrl} 
                onChange={e => setInputs({...inputs, refUrl: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
              <input 
                type="password"
                placeholder="JWT Token" 
                value={inputs.refToken} 
                onChange={e => setInputs({...inputs, refToken: e.target.value})}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400"
              />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Dash ID" value={inputs.refDashId} onChange={e => setInputs({...inputs, refDashId: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400" />
                <input placeholder="Widget ID" value={inputs.refWidgetId} onChange={e => setInputs({...inputs, refWidgetId: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-400" />
              </div>
              <button onClick={() => handleFetch('refactor')} disabled={refLoading} className="w-full py-2.5 rounded-lg font-bold text-sm bg-green-600 text-white hover:bg-green-700 disabled:opacity-50">
                {refLoading ? 'Fetching...' : 'Fetch Refactor'}
              </button>
            </div>
          </section>
        </div>

        {/* Global Action */}
        <div className="flex flex-col items-center mb-16">
          <button
            onClick={runComparison}
            disabled={!regularData || !refactorData || compareLoading}
            className={`px-16 py-4 rounded-full font-black text-lg shadow-lg transition-all ${(!regularData || !refactorData) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}
          >
            {compareLoading ? 'Crunching Data...' : 'Run Full Audit Comparison'}
          </button>
          {error && <div className="mt-4 text-red-600 text-sm font-bold bg-red-50 px-4 py-2 rounded-lg border border-red-100">⚠️ {error}</div>}
        </div>

        {/* Full Audit Report Table */}
        {hasCompared && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden mb-16 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="px-6 py-5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Full Audit Report</h3>
                <p className="text-xs text-slate-500 font-medium">
                  {comparisonReport.filter(r => !r.isMatch).length} mismatches identified in {comparisonReport.length} total properties
                </p>
              </div>
              <button onClick={exportToExcel} className="bg-white text-blue-600 px-5 py-2 rounded-lg border border-slate-200 text-xs font-bold hover:bg-slate-50 shadow-sm transition-all">
                Download Full Report (CSV)
              </button>
            </div>

            <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-widest font-black sticky top-0 z-10 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left">Result</th>
                    <th className="px-6 py-4 text-left">Property Path</th>
                    <th className="px-6 py-4 text-left">Regular</th>
                    <th className="px-6 py-4 text-left">Refactor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparisonReport.map((item, i) => (
                    <tr key={i} className={`hover:bg-slate-50 transition-colors ${!item.isMatch ? 'bg-red-50/30' : 'bg-green-50/10'}`}>
                      <td className="px-6 py-4">
                        {item.isMatch ? (
                          <span className="text-[9px] font-black bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">MATCH</span>
                        ) : (
                          <span className="text-[9px] font-black bg-red-100 text-red-700 px-2 py-0.5 rounded-full border border-red-200">DIFF</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <code className="text-[10px] bg-white border border-slate-200 text-slate-600 px-1.5 py-1 rounded font-mono break-all">{item.path}</code>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className={`text-[11px] font-mono p-3 rounded-lg border break-all leading-relaxed ${item.isMatch ? 'text-green-800' : 'text-red-700 bg-red-50 border-red-100 shadow-inner'}`}>
                          {JSON.stringify(item.regularValue)}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className={`text-[11px] font-mono p-3 rounded-lg border break-all leading-relaxed font-bold ${item.isMatch ? 'text-green-800' : 'text-green-700 bg-green-50 border-green-200 shadow-inner'}`}>
                          {JSON.stringify(item.refactorValue)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* JSON Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[
            { id: 'regular', title: 'Regular Raw JSON', data: regularData, color: 'text-red-600' },
            { id: 'refactor', title: 'Refactor Raw JSON', data: refactorData, color: 'text-green-600' }
          ].map((item) => (
            <div key={item.id} className="flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-t border-x border-slate-700 rounded-t-xl">
                <h4 className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>{item.title}</h4>
                {item.data && (
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(item.data, null, 2));
                      alert('Copied!');
                    }}
                    className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
                  >
                    COPY JSON
                  </button>
                )}
              </div>
              <div className="bg-slate-900 text-slate-400 p-6 rounded-b-xl h-[450px] overflow-auto text-[10px] font-mono leading-relaxed shadow-2xl border border-slate-800 custom-scrollbar">
                {item.data ? (
                  <pre>{JSON.stringify(item.data, null, 2)}</pre>
                ) : (
                  <div className="h-full flex items-center justify-center opacity-30 italic font-sans text-xs">Waiting for fetch...</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}