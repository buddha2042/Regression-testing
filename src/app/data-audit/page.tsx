'use client';

import { useRouter } from 'next/navigation';
import { useQa } from '@/context/QaContext';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export default function DataAuditPage() {
  const router = useRouter();
  const {
    inputs,
    regularData,
    refactorData,
    comparisonReport,
    phase,
    updateQaState
  } = useQa();

  /* ================================
     Guard: Phase Validation
  ================================ */
  if (!inputs || phase !== 'DATA_AUDIT_PENDING') {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Please complete Widget QA before entering Data Audit.
      </div>
    );
  }

  const mismatchCount = comparisonReport.filter(r => !r.isMatch).length;
  const phase1Passed = mismatchCount === 0;

  /* ================================
     Handlers
  ================================ */
  const proceedToDataCompare = () => {
    updateQaState({
      phase: 'DATA_COMPARE_RUNNING'
    });
    router.push('/data-comparison');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <main className="max-w-7xl mx-auto p-8 space-y-10">

        {/* ============================
           PHASE HEADER
        ============================ */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h1 className="text-2xl font-black text-slate-800 mb-1">
            Phase 2: Data Audit (Context Review)
          </h1>
          <p className="text-sm text-slate-500">
            Widget logic comparison completed. Review execution context before running data-level JAQL queries.
          </p>

          <div className="mt-4">
            {phase1Passed ? (
              <span className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-xs font-black">
                <CheckCircle2 size={14} /> PHASE 1 PASSED
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-xs font-black">
                <XCircle size={14} /> PHASE 1 FAILED ({mismatchCount} mismatches)
              </span>
            )}
          </div>
        </section>

        {/* ============================
           CONNECTION CONTEXT
        ============================ */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6">
            Connection Context (Read Only)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-mono">
            <div className="space-y-1">
              <div className="font-black text-slate-700">Regular Environment</div>
              <div>URL: {inputs.regUrl}</div>
              <div>Dashboard ID: {inputs.regDashId}</div>
              <div>Widget ID: {inputs.regWidgetId}</div>
              <div>Token: ********</div>
            </div>

            <div className="space-y-1">
              <div className="font-black text-slate-700">Refactor Environment</div>
              <div>URL: {inputs.refUrl}</div>
              <div>Dashboard ID: {inputs.refDashId}</div>
              <div>Widget ID: {inputs.refWidgetId}</div>
              <div>Token: ********</div>
            </div>
          </div>
        </section>

        {/* ============================
           RAW JSON REVIEW
        ============================ */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[
            { title: 'Regular Widget JSON', data: regularData },
            { title: 'Refactor Widget JSON', data: refactorData }
          ].map(block => (
            <div
              key={block.title}
              className="bg-[#0F172A] border border-slate-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-800 bg-[#1e293b]/50">
                <h3 className="text-white font-black text-sm">
                  {block.title}
                </h3>
              </div>
              <pre className="p-6 text-[11px] text-emerald-400 font-mono overflow-auto h-[450px] leading-relaxed">
                {JSON.stringify(block.data, null, 2)}
              </pre>
            </div>
          ))}
        </section>

        {/* ============================
           ACTION BAR
        ============================ */}
        <section className="flex justify-center pt-10">
          <button
            onClick={proceedToDataCompare}
            disabled={!phase1Passed}
            className={`
              px-14 py-5 rounded-full font-black text-sm uppercase tracking-widest
              flex items-center gap-3 transition-all shadow-xl
              ${phase1Passed
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'}
            `}
          >
            Proceed to Data Comparison
            <ArrowRight size={16} />
          </button>
        </section>

      </main>
    </div>
  );
}
