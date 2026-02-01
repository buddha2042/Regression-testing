'use client';

import { useQa } from '@/context/QaContext';

export default function DataAuditPage() {
  const { inputs, regularData, refactorData, comparisonReport, phase } = useQa();

  if (!inputs || phase !== 'DATA_AUDIT_PENDING') {
    return (
      <div className="p-12 text-center text-slate-500">
        Please complete Widget QA before entering Data Audit.
      </div>
    );
  }

  const mismatchCount = comparisonReport.filter(r => !r.isMatch).length;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <main className="max-w-7xl mx-auto p-8 space-y-10">

        {/* ===== Phase Header ===== */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h1 className="text-xl font-black mb-1">Phase 2: Data Audit (Context Review)</h1>
          <p className="text-sm text-slate-500">
            Widget structure validation completed. Review context before data-level comparison.
          </p>

          <div className="mt-3">
            {mismatchCount === 0 ? (
              <span className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-black">
                PHASE 1 PASSED
              </span>
            ) : (
              <span className="bg-red-100 text-red-700 px-4 py-1 rounded-full text-xs font-black">
                PHASE 1 FAILED
              </span>
            )}
          </div>
        </div>

        {/* ===== Connection Context ===== */}
        <div className="bg-white border rounded-xl p-6 shadow-sm">
          <h2 className="text-sm font-black mb-4 uppercase tracking-widest text-slate-500">
            Connection Context (Read Only)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
            <div>
              <div className="font-bold mb-1">Regular Environment</div>
              <div>URL: {inputs.regUrl}</div>
              <div>Dashboard ID: {inputs.regDashId}</div>
              <div>Widget ID: {inputs.regWidgetId}</div>
              <div>Token: ********</div>
            </div>

            <div>
              <div className="font-bold mb-1">Refactor Environment</div>
              <div>URL: {inputs.refUrl}</div>
              <div>Dashboard ID: {inputs.refDashId}</div>
              <div>Widget ID: {inputs.refWidgetId}</div>
              <div>Token: ********</div>
            </div>
          </div>
        </div>

        {/* ===== Raw JSON Review ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[{ title: 'Regular Widget JSON', data: regularData },
            { title: 'Refactor Widget JSON', data: refactorData }
          ].map(block => (
            <div key={block.title} className="bg-slate-900 text-slate-400 rounded-xl p-4 h-[500px] overflow-auto text-xs font-mono">
              <h3 className="text-white font-bold mb-2">{block.title}</h3>
              <pre>{JSON.stringify(block.data, null, 2)}</pre>
            </div>
          ))}
        </div>

        {/* ===== Action Placeholder ===== */}
        <div className="flex justify-center pt-8">
          <button
            disabled
            className="px-10 py-4 rounded-full bg-slate-300 text-slate-500 font-black cursor-not-allowed"
          >
            Proceed to Data Comparison (Coming Next)
          </button>
        </div>

      </main>
    </div>
  );
}
