'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type Environment = 'regular' | 'refactor';

interface QaRun {
  runId: string;
  environment: Environment;
  payload: any;
}

export default function QaComparePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const runId = searchParams.get('runId');

  const [regular, setRegular] = useState<QaRun | null>(null);
  const [refactor, setRefactor] = useState<QaRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /* ================================
     Load Comparison Data
     ================================ */
  useEffect(() => {
    if (!runId) return;

    setLoading(true);
    fetch(`/api/runs?runId=${encodeURIComponent(runId)}`)
      .then(res => res.json())
      .then(json => {
        const runs: QaRun[] = json.data || [];
        setRegular(runs.find(r => r.environment === 'regular') || null);
        setRefactor(runs.find(r => r.environment === 'refactor') || null);
      })
      .catch(() => setError('Failed to load comparison data'))
      .finally(() => setLoading(false));
  }, [runId]);

  /* ================================
     Missing Run ID Guard
     ================================ */
  if (!runId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <div className="bg-gray-800 border border-gray-700 rounded p-6 max-w-md w-full text-center">
          <h1 className="text-xl font-semibold text-white mb-2">
            Missing Run ID
          </h1>
          <p className="text-gray-400 mb-6">
            Please start from the Capture page and select a valid Run ID.
          </p>
          <button
            onClick={() => router.push('/qa')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Back to Capture
          </button>
        </div>
      </div>
    );
  }

  /* ================================
     Loading / Error States
     ================================ */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-400">
        Loading comparison…
      </div>
    );
  }

  if (error || !regular || !refactor) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
        <div className="bg-gray-800 border border-gray-700 rounded p-6 max-w-md w-full text-center">
          <h1 className="text-xl text-white mb-2">Comparison unavailable</h1>
          <p className="text-gray-400 mb-6">
            Both Regular and Refactor runs are required.
          </p>
          <button
            onClick={() => router.push('/qa')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Back to Capture
          </button>
        </div>
      </div>
    );
  }

  /* ================================
     UI
     ================================ */
  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Compare – {runId}
            </h1>
            <p className="text-gray-400">
              Regular vs Refactor comparison
            </p>
          </div>

          <button
            onClick={() => router.push('/qa')}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-sm"
          >
            ← Back to Capture
          </button>
        </div>

        {/* ================================
           Comparison 1: Title
           ================================ */}
        <div className="bg-gray-800 border border-gray-700 rounded p-6 mb-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Dashboard Title
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-green-400 mb-1">Regular</div>
              <div className="bg-black/40 p-3 rounded">
                {regular.payload?.[0]?.title || '—'}
              </div>
            </div>

            <div>
              <div className="text-yellow-400 mb-1">Refactor</div>
              <div className="bg-black/40 p-3 rounded">
                {refactor.payload?.[0]?.title || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* ================================
           Raw JSON Side-by-Side
           ================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-green-400 mb-2">
              Regular JSON
            </h3>
            <pre className="bg-black/50 text-[11px] p-4 rounded border border-gray-700 max-h-[600px] overflow-auto">
              {JSON.stringify(regular.payload, null, 2)}
            </pre>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-yellow-400 mb-2">
              Refactor JSON
            </h3>
            <pre className="bg-black/50 text-[11px] p-4 rounded border border-gray-700 max-h-[600px] overflow-auto">
              {JSON.stringify(refactor.payload, null, 2)}
            </pre>
          </div>
        </div>

      </div>
    </div>
  );
}
