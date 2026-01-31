'use client';

import { useRouter } from 'next/navigation';

export default function QaLandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-blue-500/30">
      {/* Background Glow */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] bg-indigo-600/5 blur-[100px] rounded-full"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-16 md:pb-24">
        
        {/* Top Navigation */}
        <nav className="py-8 mb-4 flex items-center justify-between border-b border-white/5">
          {/* Left Side: Portal Identity */}
          <div className="flex items-center gap-4">
             <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                QA
             </div>
             <span className="hidden sm:inline text-slate-500 text-xs font-mono uppercase tracking-[0.2em]">
                Automation Portal
             </span>
          </div>

          {/* Right Side: DXC Logo */}
          <div className="relative group">
            {/* Soft glow behind logo */}
            <div className="absolute -inset-2 bg-white/5 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <img 
              src="https://dxc.com/content/dam/dxc/projects/dxc-com/global/logos/dxc/dxc-logo-png-4x.png" 
              alt="DXC Technology" 
              className="h-8 md:h-10 w-auto relative brightness-0 invert" 
            />
          </div>
        </nav>

        {/* Header Section */}
        <header className="mt-12 mb-16 border-l-4 border-blue-600 pl-6 py-2">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
              Internal Lab
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight italic">
            QA <span className="text-blue-500">Automation</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl leading-relaxed">
            Ensuring data integrity across Sisense environments. 
            Validate <span className="text-slate-100 font-medium">Regular vs. Refactor</span> data with precision.
          </p>
        </header>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

          {/* Widget Comparison Card (Primary) */}
          <div
            onClick={() => router.push('/widget')}
            className="relative group cursor-pointer"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all h-full flex flex-col shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 bg-blue-600/10 rounded-xl">
                  <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="bg-blue-500/10 text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest border border-blue-500/20">
                  Primary Tool
                </span>
              </div>

              <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">
                Widget Comparison
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Compare actual widget result sets. Detect row mismatches, value discrepancies, and data structural shifts.
              </p>

              <div className="space-y-4 mb-10 flex-grow">
                {[
                  "Cell-level value validation",
                  "Missing row identification",
                  "Automated diffing reports",
                  "Excel-ready export module"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-blue-400 font-bold group-hover:translate-x-2 transition-transform">
                Launch Comparator
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>

          {/* Dashboard Viewer Card (Optional) */}
          <div
            onClick={() => router.push('/dashboard-view')}
            className="group cursor-pointer flex flex-col"
          >
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 hover:border-slate-600 transition-all h-full flex flex-col shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div className="p-3 bg-slate-800 rounded-xl">
                  <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <span className="bg-slate-800 text-slate-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                  Metadata
                </span>
              </div>

              <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-slate-300 transition-colors">
                Dashboard Viewer
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Inspect the underlying dashboard metadata. Useful for debugging widget IDs, layout positions, and filter logic.
              </p>

              <div className="space-y-4 mb-10 flex-grow">
                {[
                  "Raw dashboard structure",
                  "Inspect layout & widget OIDs",
                  "Download JSON snapshots",
                  "Verify filter definitions"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-500">
                    <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
                    {item}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 text-slate-500 font-bold group-hover:text-slate-300 transition-colors">
                Open Metadata Tool
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-slate-500 text-xs font-mono uppercase tracking-widest">
            DXC Internal Tooling • v2.4.0
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-slate-400 text-sm">Sisense API Connected</span>
          </div>
          <div className="text-slate-500 text-xs italic">
            Developed by Buddha Kharel
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}