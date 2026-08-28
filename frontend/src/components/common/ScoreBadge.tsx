import React from 'react';

interface ScoreBadgeProps {
  level: 'Healthy' | 'Low' | 'Moderate' | 'High' | 'Critical' | string;
  score?: number;
  showScore?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ level, score, showScore = true }) => {
  const normLevel = level.toLowerCase();
  
  let bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let dot = 'bg-emerald-500';

  if (normLevel.includes('crit')) {
    bg = 'bg-rose-50 text-rose-700 border-rose-200';
    dot = 'bg-rose-500 animate-pulse';
  } else if (normLevel.includes('high')) {
    bg = 'bg-amber-50 text-amber-700 border-amber-200';
    dot = 'bg-amber-500';
  } else if (normLevel.includes('mod')) {
    bg = 'bg-blue-50 text-blue-700 border-blue-200';
    dot = 'bg-blue-500';
  } else if (normLevel.includes('low')) {
    bg = 'bg-slate-50 text-slate-700 border-slate-200';
    dot = 'bg-slate-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`}></span>
      {level}
      {showScore && score !== undefined && <span className="opacity-75 font-mono">({score})</span>}
    </span>
  );
};
