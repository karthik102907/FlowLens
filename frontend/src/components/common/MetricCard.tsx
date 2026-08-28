import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  variant?: 'primary' | 'rose' | 'amber' | 'emerald' | 'blue' | 'purple';
  badge?: string;
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  change,
  isPositive,
  icon: Icon,
  variant = 'primary',
  badge,
  onClick,
}) => {
  const iconVariants = {
    primary: 'bg-slate-100 text-slate-700',
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-sky-50 text-sky-600',
    purple: 'bg-indigo-50 text-indigo-600',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs transition-all duration-200 hover:shadow-md ${
        onClick ? 'cursor-pointer hover:border-slate-300' : ''
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">{title}</span>
        <div className={`p-2 rounded-lg ${iconVariants[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {badge && (
          <span className="px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md">
            {badge}
          </span>
        )}
      </div>

      {(subtitle || change) && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-600">
          {subtitle && <span>{subtitle}</span>}
          {change && (
            <span className={`font-medium ${isPositive ? 'text-emerald-700' : 'text-rose-700'}`}>
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
