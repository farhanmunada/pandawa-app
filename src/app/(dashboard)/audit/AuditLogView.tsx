'use client';

import React, { useState } from 'react';
import { ClipboardList, RefreshCw } from 'lucide-react';
import { getAuditLogsAction, AuditLogItem } from './actions';

interface AuditLogViewProps {
  initialLogs: AuditLogItem[];
}

export function AuditLogView({ initialLogs }: AuditLogViewProps) {
  const [logs, setLogs] = useState<AuditLogItem[]>(initialLogs);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    const res = await getAuditLogsAction();
    if (res.success && res.data) {
      setLogs(res.data);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Frameless */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
        <div>
          <span className="rounded-full bg-[#D8AC41]/15 px-3 py-1 text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
            Supervisi BPH
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            Jejak Audit Aktivitas Sistem
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Rekam jejak mutasi data, persetujuan transaksi, dan penerbitan berkas resmi organisasi
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#D8AC41]' : 'text-[#D8AC41]'}`} />
          <span>Segarkan Log</span>
        </button>
      </div>

      {/* Daftar Jejak Audit */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-sm font-bold text-slate-900">Log Aktivitas Terbaru</span>
          <span className="text-xs text-slate-400">{logs.length} rekaman</span>
        </div>

        <div className="space-y-2.5">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 transition-all hover:bg-slate-100/70"
            >
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-2xs mt-0.5">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {log.action}
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 shadow-2xs">
                      Tabel: {log.targetTable}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Oleh: <span className="font-semibold text-slate-800">{log.userName || 'Sistem / Tamu'}</span> &bull; Record ID: {log.recordId}
                  </p>
                </div>
              </div>

              <span className="text-[11px] font-medium text-slate-400 shrink-0">
                {new Date(log.createdAt).toLocaleString('id-ID')}
              </span>
            </div>
          ))}

          {!loading && logs.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-400">
              Belum ada riwayat aktivitas yang tercatat pada sistem.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
