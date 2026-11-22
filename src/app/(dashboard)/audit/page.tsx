'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { getAuditLogsAction, AuditLogItem } from './actions';

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await getAuditLogsAction();
    if (res.success && res.data) {
      setLogs(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    let mounted = true;
    getAuditLogsAction().then((res) => {
      if (mounted) {
        if (res.success && res.data) {
          setLogs(res.data);
        }
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
            Supervisi Pimpinan
          </span>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Jejak Audit Aktivitas
          </h2>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#D8AC41] hover:text-[#B4821E] transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#D8AC41]' : ''}`} />
          <span>Segarkan</span>
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between border-b border-slate-100 py-2.5 last:border-b-0 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-600">
                  <ClipboardList className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="rounded border border-slate-200 bg-slate-50 px-1 py-0.2 text-[9px] text-slate-600">
                      Tabel: {log.targetTable}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-400">
                    Oleh: {log.userName || 'Sistem / Tamu'} | Record ID: {log.recordId}
                  </p>
                </div>
              </div>

              <span className="text-[10px] text-slate-400">
                {new Date(log.createdAt).toLocaleString('id-ID')}
              </span>
            </div>
          ))}

          {!loading && logs.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-400">
              Belum ada riwayat aktivitas yang tercatat pada sistem.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
