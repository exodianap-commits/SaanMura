import React from 'react';
import type { AuditLog } from '@saanmura/shared-types';

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs }) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-outline-variant/60 gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="material-symbols-outlined text-primary text-[16px]">security</span>
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
              Supabase Row-Level Security & Compliance Audit
            </span>
          </div>
          <h1 className="font-headline text-xl font-bold text-on-surface tracking-tight">
            Security Audit Trail & Governance Logs
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Immutable log of administrative actions, verifier approvals, role changes, and quorum sign-offs.
          </p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-low border-b border-outline-variant/40 text-[11px] font-bold text-outline uppercase tracking-wider">
                <th className="py-2.5 px-4">Timestamp (UTC)</th>
                <th className="py-2.5 px-4">Actor</th>
                <th className="py-2.5 px-4">Action</th>
                <th className="py-2.5 px-4">Target Entity</th>
                <th className="py-2.5 px-4">IP Address</th>
                <th className="py-2.5 px-4">Payload Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-outline">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-on-surface block">{log.actor?.display_name || log.actor_id}</span>
                    <span className="text-[10px] text-outline uppercase font-semibold">{log.actor_role}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-surface-container font-mono text-[10px] font-bold text-primary">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-on-surface-variant">
                    {log.entity_type} / {log.entity_id}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-outline">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                  <td className="py-3 px-4">
                    <code className="text-[10px] font-mono bg-surface-container-low p-1 rounded max-w-xs block truncate">
                      {JSON.stringify(log.new_values || {})}
                    </code>
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
