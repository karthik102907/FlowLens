import React from 'react';
import { Dataset, User } from '../../types';
import {
  Sparkles,
  Bell,
  Search,
  Calendar,
  Database,
  ChevronDown,
  User as UserIcon,
  LogOut,
  Building,
} from 'lucide-react';

interface HeaderProps {
  datasets: Dataset[];
  selectedDatasetId: string;
  onSelectDataset: (id: string) => void;
  currentUser: User;
  onLogout: () => void;
  onOpenAIChat: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
  dateRange: string;
  onChangeDateRange: (range: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  datasets,
  selectedDatasetId,
  onSelectDataset,
  currentUser,
  onLogout,
  onOpenAIChat,
  onOpenNotifications,
  unreadCount = 0,
  dateRange,
  onChangeDateRange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Dataset Selector & Search */}
      <div className="flex items-center gap-4">
        {/* Dataset Switcher */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700 hover:border-slate-300 transition-colors">
          <Database className="w-4 h-4 text-cyan-600 shrink-0" />
          <select
            value={selectedDatasetId}
            onChange={(e) => onSelectDataset(e.target.value)}
            className="bg-transparent border-none text-xs font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {d.is_demo ? '(DEMO DATA)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Global Search */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search cases, stages, departments..."
            className="w-64 pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Date Filter */}
        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-xl text-xs text-slate-600">
          <Calendar className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={dateRange}
            onChange={(e) => onChangeDateRange(e.target.value)}
            className="bg-transparent border-none text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Events (Full History)</option>
            <option value="today">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
        </div>

        {/* Ask AI Assistant Button */}
        <button
          onClick={onOpenAIChat}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all hover:shadow-md group"
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
          <span>Ask AI Analyst</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          )}
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-cyan-300 font-bold text-xs flex items-center justify-center border border-slate-700">
            {currentUser.full_name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>
          <div className="hidden lg:block text-left">
            <span className="block text-xs font-semibold text-slate-800 leading-tight">
              {currentUser.full_name}
            </span>
            <span className="block text-[10px] text-slate-500">{currentUser.role}</span>
          </div>
          <button
            onClick={onLogout}
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
