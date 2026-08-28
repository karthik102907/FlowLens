import React from 'react';
import {
  Workflow,
  Sparkles,
  AlertOctagon,
  SearchCode,
  ShieldAlert,
  Repeat,
  Lightbulb,
  Sliders,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Building2,
  HeartPulse,
  GraduationCap,
  Headphones,
  Cpu,
  FileSpreadsheet,
  Play,
  Layers,
  ShieldCheck,
} from 'lucide-react';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenLogin: () => void;
  onLoadDemo: (type: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenLogin, onLoadDemo }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/20">
            FL
          </div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">FlowLens AI</span>
            <span className="text-[10px] text-cyan-400 block -mt-1 font-mono uppercase tracking-wider">
              Process Intelligence Platform
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-medium text-slate-300">
          <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</a>
          <a href="#features" className="hover:text-cyan-400 transition-colors">Analytical Modules</a>
          <a href="#use-cases" className="hover:text-cyan-400 transition-colors">Industry Demos</a>
          <a href="#architecture" className="hover:text-cyan-400 transition-colors">System Architecture</a>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenLogin}
            className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl transition-all"
          >
            Sign In
          </button>
          <button
            onClick={onEnterApp}
            className="px-4 py-2 text-xs font-semibold bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 font-bold"
          >
            <span>Analyze Your Process</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-24 max-w-5xl mx-auto text-center">
        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Deterministic Process Mining • Statistical Bottleneck Scoring • Explainable ML</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight md:leading-tight">
          Find Where Your Business <br className="hidden md:block" />
          <span className="bg-linear-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
            Process Is Losing Time.
          </span>
        </h1>

        <p className="mt-6 text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          FlowLens AI identifies process bottlenecks using event-log analytics, statistical correlation, and machine learning. Reconstruct case journeys, isolate rework loops, predict delay risks, and receive evidence-based recommendations.
        </p>

        {/* Action CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onLoadDemo('loan')}
            className="px-6 py-3.5 text-sm font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-xl transition-all shadow-lg shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>Try 3-Minute Live Demo</span>
          </button>
          <button
            onClick={onEnterApp}
            className="px-6 py-3.5 text-sm font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span>Upload Custom Event Log</span>
          </button>
          <button
            onClick={() => onLoadDemo('hospital')}
            className="px-6 py-3.5 text-sm font-semibold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <HeartPulse className="w-4 h-4 text-rose-400" />
            <span>Healthcare ER Demo</span>
          </button>
        </div>

        {/* Live Interactive Hero Preview Card */}
        <div className="mt-14 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span className="ml-2 text-xs font-mono text-slate-400">Deterministic Analytics Pipeline • Active Evaluation</span>
            </div>
            <span className="text-xs bg-cyan-950 text-cyan-400 border border-cyan-800 px-2.5 py-0.5 rounded-full font-mono">
              Live Metrics
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Cases Analyzed</span>
              <span className="text-xl font-bold text-white mt-1 block">500 Cases</span>
              <span className="text-emerald-400 text-[11px] font-mono">3,100+ Events Ingested</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Avg Cycle Time</span>
              <span className="text-xl font-bold text-white mt-1 block">74.6 Hours</span>
              <span className="text-amber-400 text-[11px] font-mono">Median: 68.2h</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Primary Bottleneck</span>
              <span className="text-xl font-bold text-rose-400 mt-1 block truncate">Document Verification</span>
              <span className="text-slate-400 text-[11px] font-mono">Weighted Score: 100/100</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-semibold">Recommended Priority</span>
              <span className="text-xl font-bold text-cyan-300 mt-1 block truncate">Checklist Automation</span>
              <span className="text-cyan-400 text-[11px] font-mono">Recovers ~1,790 hrs/yr</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 border-t border-slate-800/80 bg-slate-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">How FlowLens AI Works</h2>
            <p className="text-slate-400 text-sm mt-2">Five-stage deterministic data pipeline from raw event logs to actionable business outcomes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[
              { step: '01', title: 'Upload Process Data', desc: 'Ingest CSV, XLSX, or JSON workflow logs with intelligent column auto-detection.' },
              { step: '02', title: 'Reconstruct Journeys', desc: 'FlowLens maps sequential case trajectories, calculating active durations and queue latencies.' },
              { step: '03', title: 'Discover Bottlenecks', desc: 'Multi-factor weighted scoring identifies critical slowdowns across duration, SLA, and rework.' },
              { step: '04', title: 'Explain Why Delays Occur', desc: 'Statistical correlation isolates likely contributors by department, priority, and category.' },
              { step: '05', title: 'Take Actionable Steps', desc: 'Evidence-based recommendations and what-if simulation scenarios project time and cost recovery.' },
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left relative">
                <span className="text-xl font-mono font-bold text-cyan-400/50 block mb-2">{item.step}</span>
                <h4 className="font-bold text-white text-sm mb-1.5">{item.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section id="features" className="py-20 px-6 border-t border-slate-800/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Enterprise Analytical Intelligence</h2>
            <p className="text-slate-400 text-sm mt-2">Comprehensive analytical engines grounded strictly in computed dataset facts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: AlertOctagon,
                title: 'Multi-Factor Bottleneck Engine',
                desc: 'Balanced 0–100 severity index combining stage duration, queue waiting, volume share, rework loop rate, SLA breach percentage, and variance.',
                color: 'text-rose-400',
              },
              {
                icon: SearchCode,
                title: 'Statistical Root Cause Analysis',
                desc: 'Identifies delay multipliers and likely contributors across teams, case priorities, categories, and day-of-week with transparent non-causal phrasing.',
                color: 'text-cyan-400',
              },
              {
                icon: Sparkles,
                title: 'ML Delay Risk Prediction',
                desc: 'Supervised Random Forest ensemble predicting per-case delay probabilities, evaluated with Accuracy, Precision, Recall, F1, and ROC-AUC.',
                color: 'text-blue-400',
              },
              {
                icon: ShieldAlert,
                title: 'Multimodal Anomaly Detection',
                desc: 'Statistical IQR distributions and multi-stage latency outliers with interactive event-by-event timeline drilldowns.',
                color: 'text-amber-400',
              },
              {
                icon: Repeat,
                title: 'Rework & Return Loop Detection',
                desc: 'Detects backward cycles between review and approval gates, quantifying loop frequency, delay penalties, and financial waste.',
                color: 'text-emerald-400',
              },
              {
                icon: Sliders,
                title: 'What-If Process Simulator',
                desc: 'Interactively simulate the impact of stage duration cuts, capacity staffing multipliers, and rework elimination on projected cycle times.',
                color: 'text-purple-400',
              },
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-left hover:border-slate-700 transition-colors">
                  <div className={`p-3 rounded-xl bg-slate-950 w-fit border border-slate-800 ${f.color} mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-white text-base mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Industry Use Cases */}
      <section id="use-cases" className="py-20 px-6 border-t border-slate-800/80 bg-slate-900/40">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Cross-Industry Adaptability</h2>
            <p className="text-slate-400 text-sm mt-2">FlowLens AI operates on any chronological event-log dataset</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Building2, title: 'Mortgage & Loan Processing', desc: 'Identify document verification queues, credit check latency, and underwriting rework loops.' },
              { icon: HeartPulse, title: 'Hospital Emergency & Inpatient', desc: 'Detect ER triage queues, diagnostic lab latency, doctor consult backlogs, and bed assignment delays.' },
              { icon: GraduationCap, title: 'University Admissions', desc: 'Streamline transcript verification, departmental scholarship reviews, and enrollment pipeline friction.' },
              { icon: Headphones, title: 'IT Service Desk & Incident Response', desc: 'Reduce tier escalation handoffs, identify recurring loops, and accelerate ticket resolution time.' },
            ].map((uc, idx) => {
              const Icon = uc.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-left">
                  <Icon className="w-6 h-6 text-cyan-400 mb-3" />
                  <h4 className="font-bold text-white text-sm mb-1">{uc.title}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{uc.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-10 px-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-300">FlowLens AI</span>
          <span>• Enterprise Process Intelligence Platform</span>
        </div>
        <p>© 2026 FlowLens AI Platform. Deterministic Process Mining • Explainable ML.</p>
      </footer>
    </div>
  );
};
