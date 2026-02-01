'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQa } from '@/context/QaContext';
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Download, 
  ArrowRight, 
  Database, 
  Zap,
  Activity,
  ChevronDown,
  Eye
} from 'lucide-react';

type Environment = 'regular' | 'refactor';

interface ComparisonItem {
  path: string;
  regularValue: any;
  refactorValue: any;
  isMatch: boolean;
}

export default function WidgetComparePage() {
  const router = useRouter();
  const { setQaState } = useQa();

  /* ================================
     INPUT STATE
  ================================ */
  const [inputs, setInputs] = useState({
    regUrl: '', regToken: '', regDashId: '', regWidgetId: '',
    refUrl: '', refToken: '', refDashId: '', refWidgetId: ''
  });

  /* ================================
     DATA STATE
  ================================ */
  const [regularData, setRegularData] = useState<any | null>(null);
  const [refactorData, setRefactorData] = useState<any | null>(null);
  const [comparisonReport, setComparisonReport] = useState<ComparisonItem[]>([]);

  /* ================================
     UI STATE
  ================================ */
  const [regLoading, setRegLoading] = useState(false);
  const [refLoading, setRefLoading] = useState(false);
  const [compareLoading, setCompareLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasCompared, setHasCompared] = useState(false);
  const [showRaw, setShowRaw] = useState({ regular: true, refactor: true });

  /* ================================
     RECURSIVE COMPARISON
  ================================ */
  const getFullComparison = (obj1: any, obj2: any, path = ''): ComparisonItem[] => {
    const keys = Array.from(new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]));

    return keys.flatMap(key => {
      const currentPath = path ? `${path}.${key}` : key;
      const val1 = obj1?.[key];
      const val2 = obj2?.[key];

      if (typeof val1 === 'object' && typeof val2 === 'object' && val1 !== null && val2 !== null && !Array.isArray(val1)) {
        return getFullComparison(val1, val2, currentPath);
      }

      return {
        path: currentPath,
        regularValue: val1,
        refactorValue: val2,
        isMatch: JSON.stringify(val1) === JSON.stringify(val2)
      };
    });
  };

  const handleFetch = async (env: Environment) => {
    const isReg = env === 'regular';
    const { regUrl, regToken, regDashId, regWidgetId, refUrl, refToken, refDashId, refWidgetId } = inputs;

    const config = isReg 
      ? { url: regUrl, token: regToken, dashId: regDashId, wid: regWidgetId }
      : { url: refUrl, token: refToken, dashId: refDashId, wid: refWidgetId };

    if (!config.url || !config.token || !config.dashId || !config.wid) {
      setError(`Please complete all ${env} fields.`);
      return;
    }

    setError('');
    isReg ? setRegLoading(true) : setRefLoading(true);

    try {
      const res = await fetch('/api/widget/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: config.url.trim(),
          token: config.token.trim(),
          dashboardId: config.dashId.trim(),
          widgetId: config.wid.trim(),
          environment: env
        })
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      isReg ? setRegularData(json.data) : setRefactorData(json.data);
      setHasCompared(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      isReg ? setRegLoading(false) : setRefLoading(false);
    }
  };

  const runComparison = () => {
    if (!regularData || !refactorData) return;
    setCompareLoading(true);
    const report = getFullComparison(regularData, refactorData);

    setQaState({
      inputs,
      regularData,
      refactorData,
      comparisonReport: report,
      phase: 'DATA_AUDIT_PENDING',
      createdAt: new Date().toISOString()
    });

    setComparisonReport(report);
    setHasCompared(true);
    setCompareLoading(false);
  };

  const exportToExcel = () => {
    const headers = ['Path', 'Regular', 'Refactor', 'Status'];
    const rows = comparisonReport.map(r => [
      r.path,
      JSON.stringify(r.regularValue),
      JSON.stringify(r.refactorValue),
      r.isMatch ? 'MATCH' : 'DIFF'
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Audit_Report_${Date.now()}.csv`;
    link.click();
  };

  const diffCount = comparisonReport.filter(r => !r.isMatch).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans">
      {/* MODERN NAV */}
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-lg font-bold tracking-tight">Quality Lab <span className="text-blue-600">v2</span></span>
          </div>

          {hasCompared && (
            <button
              onClick={() => router.push('/data-audit')}
              className="group flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-blue-900/10"
            >
              Continue to Data Audit
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
        
        {/* INPUTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {(['regular', 'refactor'] as Environment[]).map(env => {
            const isReg = env === 'regular';
            const data = isReg ? regularData : refactorData;
            const loading = isReg ? regLoading : refLoading;

            return (
              <div key={env} className="flex flex-col gap-4">
                <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className={`h-1.5 w-full ${isReg ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-500">
                        <Database size={16} />
                        {isReg ? 'Source: Regular' : 'Target: Refactor'}
                      </h2>
                      {data && (
                        <span className="flex items-center gap-1 text-[10px] bg-slate-100 px-2 py-1 rounded-full font-bold">
                          <CheckCircle2 size={12} className="text-emerald-500" /> FETCHED
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <input
                        placeholder="Base URL (e.g. https://api.env.com)"
                        value={isReg ? inputs.regUrl : inputs.refUrl}
                        onChange={e => setInputs({ ...inputs, [isReg ? 'regUrl' : 'refUrl']: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      />
                      <input
                        type="password"
                        placeholder="JWT Bearer Token"
                        value={isReg ? inputs.regToken : inputs.refToken}
                        onChange={e => setInputs({ ...inputs, [isReg ? 'regToken' : 'refToken']: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          placeholder="Dashboard ID"
                          value={isReg ? inputs.regDashId : inputs.refDashId}
                          onChange={e => setInputs({ ...inputs, [isReg ? 'regDashId' : 'refDashId']: e.target.value })}
                          className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                        />
                        <input
                          placeholder="Widget ID"
                          value={isReg ? inputs.regWidgetId : inputs.refWidgetId}
                          onChange={e => setInputs({ ...inputs, [isReg ? 'regWidgetId' : 'refWidgetId']: e.target.value })}
                          className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleFetch(env)}
                      disabled={loading}
                      className={`w-full py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] ${
                        isReg ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                      } disabled:opacity-50`}
                    >
                      {loading ? 'Fetching...' : `Fetch ${isReg ? 'Regular' : 'Refactor'} JSON`}
                    </button>
                  </div>
                </section>

                {/* RAW DATA PREVIEW */}
                {data && (
                  <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
                    <div className="flex justify-between items-center px-4 py-2 bg-slate-800/50 border-b border-slate-700">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Raw Response Preview</span>
                      <button 
                        onClick={() => setShowRaw(prev => ({...prev, [env]: !prev[env]}))}
                        className="text-slate-400 hover:text-white transition-colors"
                      >
                        <ChevronDown size={14} className={showRaw[isReg ? 'regular' : 'refactor'] ? '' : '-rotate-90'} />
                      </button>
                    </div>
                    {showRaw[isReg ? 'regular' : 'refactor'] && (
                      <pre className="p-4 text-[11px] text-emerald-400 font-mono overflow-auto max-h-[300px] scrollbar-hide">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* COMPARISON TRIGGER */}
        <div className="flex flex-col items-center justify-center py-6 border-y border-slate-200 bg-white rounded-3xl shadow-sm">
          <button
            onClick={runComparison}
            disabled={!regularData || !refactorData || compareLoading}
            className="group relative flex items-center gap-3 px-10 py-5 bg-blue-600 disabled:bg-slate-200 text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-200 transition-all hover:-translate-y-1 hover:shadow-blue-300 active:scale-95 disabled:shadow-none"
          >
            <Activity className={compareLoading ? 'animate-spin' : ''} />
            {compareLoading ? 'Analyzing...' : 'Run Full Audit Comparison'}
          </button>
          {error && <p className="text-rose-600 mt-4 text-sm font-semibold flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-full border border-rose-100">
            <XCircle size={16} /> {error}
          </p>}
        </div>

        {/* RESULTS REPORT */}
        {hasCompared && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* STATS STRIP */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Total Attributes</p>
                  <p className="text-3xl font-black">{comparisonReport.length}</p>
                </div>
                <Search className="text-slate-200" size={40} />
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Matches</p>
                  <p className="text-3xl font-black text-emerald-600">{comparisonReport.length - diffCount}</p>
                </div>
                <CheckCircle2 className="text-emerald-100" size={40} />
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Mismatches</p>
                  <p className="text-3xl font-black text-rose-600">{diffCount}</p>
                </div>
                <XCircle className="text-rose-100" size={40} />
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
                <div>
                  <h3 className="font-bold text-lg">Detailed Audit Logs</h3>
                  <p className="text-xs text-slate-500">Deep-object comparison across all nested keys</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    exportToExcel();
                  }}
                  className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-slate-50"
                >
                  <Download size={14} /> Download CSV
                </button>
              </div>

              <div className="max-h-[600px] overflow-y-auto overscroll-contain scroll-smooth">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-100 z-10">
                    <tr>
                      <th className="p-4 text-[11px] font-black uppercase text-slate-500 border-b">Status</th>
                      <th className="p-4 text-[11px] font-black uppercase text-slate-500 border-b">Object Path</th>
                      <th className="p-4 text-[11px] font-black uppercase text-slate-500 border-b">Regular Value</th>
                      <th className="p-4 text-[11px] font-black uppercase text-slate-500 border-b">Refactor Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {comparisonReport.map((r, i) => (
                      <tr key={i} className={`group hover:bg-slate-50 transition-colors ${!r.isMatch ? 'bg-rose-50/30' : ''}`}>
                        <td className="p-4">
                          {r.isMatch ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                              <CheckCircle2 size={10} /> Match
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase">
                              <XCircle size={10} /> Diff
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <code className="text-[11px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 break-all leading-relaxed">
                            {r.path}
                          </code>
                        </td>
                        <td className="p-4 text-[11px] font-mono text-slate-500 max-w-[200px] truncate group-hover:whitespace-normal group-hover:break-all transition-all">
                          {JSON.stringify(r.regularValue)}
                        </td>
                        <td className={`p-4 text-[11px] font-mono max-w-[200px] truncate group-hover:whitespace-normal group-hover:break-all transition-all ${!r.isMatch ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                          {JSON.stringify(r.refactorValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}