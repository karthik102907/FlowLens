import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  Workflow,
  AlertOctagon,
  SearchCode,
  Sparkles,
  TrendingDown,
  ShieldAlert,
  Repeat,
  Building2,
  GitCompare,
  Lightbulb,
  Sliders,
  FileText,
  Bell,
  Settings,
  Users,
  Building,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
} from 'lucide-react';

export type NavView =
  | 'dashboard'
  | 'upload'
  | 'datasets'
  | 'history'
  | 'quality'
  | 'explorer'
  | 'bottlenecks'
  | 'root-causes'
  | 'predictions'
  | 'anomalies'
  | 'rework'
  | 'departments'
  | 'compare'
  | 'recommendations'
  | 'simulation'
  | 'reports'
  | 'notifications'
  | 'users'
  | 'organization'
  | 'settings';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string;
  count?: number;
  highlight?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  currentView: NavView;
  onNavigate: (view: NavView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  collapsed,
  onToggleCollapse,
  unreadCount = 3,
}) => {
  const navSections: NavSection[] = [
    {
      title: 'OPERATIONAL INTELLIGENCE',
      items: [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'explorer', label: 'Process Journey Map', icon: Workflow },
        { id: 'bottlenecks', label: 'Bottleneck Analysis', icon: AlertOctagon, badge: 'Weighted' },
        { id: 'root-causes', label: 'Root Cause Engine', icon: SearchCode },
        { id: 'predictions', label: 'Delay Risk ML', icon: Sparkles, badge: 'ML' },
        { id: 'anomalies', label: 'Anomaly Detection', icon: ShieldAlert },
        { id: 'rework', label: 'Rework & Loops', icon: Repeat },
        { id: 'departments', label: 'Department Benchmark', icon: Building2 },
        { id: 'compare', label: 'Process Comparison', icon: GitCompare },
      ],
    },
    {
      title: 'OPTIMIZATION & ACTIONS',
      items: [
        { id: 'recommendations', label: 'AI Recommendations', icon: Lightbulb, highlight: true },
        { id: 'simulation', label: 'What-If Simulator', icon: Sliders },
        { id: 'reports', label: 'Executive Reports', icon: FileText },
      ],
    },
    {
      title: 'DATA MANAGEMENT',
      items: [
        { id: 'upload', label: 'Upload & Ingest', icon: UploadCloud },
        { id: 'datasets', label: 'Dataset Inventory', icon: FileSpreadsheet },
        { id: 'history', label: 'Analysis History', icon: History },
        { id: 'quality', label: 'Data Quality Engine', icon: CheckCircle2 },
      ],
    },
    {
      title: 'ENTERPRISE & ADMIN',
      items: [
        { id: 'notifications', label: 'Alerts & Notifications', icon: Bell, count: unreadCount },
        { id: 'users', label: 'User Management', icon: Users },
        { id: 'organization', label: 'Organization & SLAs', icon: Building },
        { id: 'settings', label: 'Platform Settings', icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={`bg-slate-900 text-slate-300 h-screen sticky top-0 flex flex-col border-r border-slate-800 transition-all duration-300 z-40 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800 shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-cyan-500/20">
              FL
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">FlowLens AI</span>
              <span className="text-[10px] text-cyan-400 block -mt-1 font-mono uppercase tracking-wider">
                Process Intelligence
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-linear-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-black mx-auto">
            FL
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors hidden md:block"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {navSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-1">
            {!collapsed && (
              <h5 className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {section.title}
              </h5>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id as NavView)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  } ${collapsed ? 'justify-center' : ''}`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {!collapsed && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-md">
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && item.count > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-600 text-white rounded-full">
                          {item.count}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer / System Status */}
      <div className="p-3 border-t border-slate-800 text-xs text-slate-400 shrink-0">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] text-slate-400 font-mono">Engine v1.0.0</span>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-sm">Enterprise</span>
          </div>
        ) : (
          <div className="flex justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </div>
        )}
      </div>
    </aside>
  );
};
