import React, { useState } from 'react';
import { User } from '../types';
import { Building, Users, Shield, Clock, CheckCircle2, UserPlus, Key } from 'lucide-react';

interface OrganizationViewProps {
  currentUser: User;
}

export const OrganizationView: React.FC<OrganizationViewProps> = ({ currentUser }) => {
  const [members, setMembers] = useState([
    { id: 'usr_01', name: 'Dr. Sarah Jenkins', email: 'admin@flowlens.ai', role: 'Administrator', status: 'Active' },
    { id: 'usr_02', name: 'Marcus Vance', email: 'analyst@flowlens.ai', role: 'Process Analyst', status: 'Active' },
    { id: 'usr_03', name: 'Elena Rostova', email: 'elena@enterprise.com', role: 'Manager', status: 'Active' },
    { id: 'usr_04', name: 'David Kim', email: 'david@enterprise.com', role: 'Viewer', status: 'Active' },
  ]);

  const [slaThreshold, setSlaThreshold] = useState(48.0);
  const [currency, setCurrency] = useState('USD ($)');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Organization & Access Governance</h2>
        <p className="text-xs text-slate-500 mt-1">
          Manage multi-tenant organization boundaries, role-based user access controls, and global SLA thresholds.
        </p>
      </div>

      {/* Organization Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-100 text-slate-800 rounded-xl">
              <Building className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Global Financial & Healthcare Services</h3>
              <p className="text-xs text-slate-400">Organization ID: org_flowlens_enterprise • Plan: Enterprise Tier</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-semibold">
            Active Tenant
          </span>
        </div>

        {/* Form Settings */}
        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Default SLA Critical Threshold (Hours)</label>
            <input
              type="number"
              value={slaThreshold}
              onChange={(e) => setSlaThreshold(parseFloat(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Standard Operational Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:bg-white font-medium"
            >
              <option value="USD ($)">USD ($) - US Dollar</option>
              <option value="EUR (€)">EUR (€) - Euro</option>
              <option value="GBP (£)">GBP (£) - British Pound</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-center justify-between pt-2">
            {saved && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Organization settings updated successfully.
              </span>
            )}
            <button
              type="submit"
              className="ml-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-xs"
            >
              Save Organization Config
            </button>
          </div>
        </form>
      </div>

      {/* Users & Team Access Management */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Team Members & Role-Based Permissions</h3>
            <p className="text-xs text-slate-500">Access controls configured for organization members</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-2.5 px-3">Full Name</th>
                <th className="py-2.5 px-3">Work Email</th>
                <th className="py-2.5 px-3">Assigned Role</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-semibold text-slate-900">{m.name}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{m.email}</td>
                  <td className="py-3 px-3">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                      {m.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                      {m.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
