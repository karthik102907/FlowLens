import React from 'react';
import { NotificationItem } from '../types';
import { api } from '../services/api';
import { Bell, AlertOctagon, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onRefreshNotifications: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onRefreshNotifications,
}) => {
  const handleMarkRead = async (id: string) => {
    await api.markNotificationRead(id);
    onRefreshNotifications();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Alert & Notification Center</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-time threshold alerts, sudden cycle time spikes, and SLA deterioration triggers.
          </p>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((n) => {
          let icon = <Info className="w-5 h-5 text-blue-600" />;
          let border = 'border-slate-200';
          let bg = n.is_read ? 'bg-white' : 'bg-slate-50/80';

          if (n.severity === 'CRITICAL') {
            icon = <AlertOctagon className="w-5 h-5 text-rose-600" />;
            border = n.is_read ? 'border-slate-200' : 'border-rose-200';
          } else if (n.severity === 'HIGH' || n.severity === 'WARNING') {
            icon = <AlertTriangle className="w-5 h-5 text-amber-600" />;
            border = n.is_read ? 'border-slate-200' : 'border-amber-200';
          }

          return (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border ${border} ${bg} shadow-xs flex items-start justify-between gap-4 transition-all text-xs`}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-white border border-slate-200 shrink-0 mt-0.5 shadow-2xs">
                  {icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-xs">{n.title}</h4>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                      {n.severity}
                    </span>
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-slate-600 mt-1 leading-relaxed text-xs">{n.message}</p>
                  <div className="mt-2 flex items-center gap-3 text-[10px] text-slate-400 font-mono">
                    <span>{new Date(n.timestamp).toLocaleTimeString()}</span>
                    {n.related_process && <span>• Process: {n.related_process}</span>}
                    {n.related_bottleneck && <span>• Stage: {n.related_bottleneck}</span>}
                  </div>
                </div>
              </div>

              {!n.is_read && (
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 rounded-lg text-[11px] font-semibold text-slate-700 shrink-0 transition-colors shadow-2xs"
                >
                  Mark Read
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
