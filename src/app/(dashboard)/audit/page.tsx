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
      <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
        <div>
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Supervisi Pimpinan (Ketua Umum & Wakil Ketua)
          </span>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Jejak Audit Aktivitas Sistem
          </h2>
          <p className="text-xs text-neutral-500">
            Rekam jejak seluruh operasi sensitif: perubahan anggota, mutasi kas, pengesahan surat, dan sirkulasi aset.
          </p>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Segarkan
        </button>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between border-b border-neutral-100 py-2.5 last:border-b-0 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-100 text-neutral-600">
                  <ClipboardList className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold text-neutral-900">{log.action}</span>
                    <span className="rounded-sm bg-neutral-100 px-1 py-0.2 text-[9px] text-neutral-500">
                      Tabel: {log.targetTable}
                    </span>
                  </div>
                  <p className="text-[10px] text-neutral-400">
                    Oleh: {log.userName || 'Sistem / Tamu'} | Record ID: {log.recordId}
                  </p>
                </div>
              </div>

              <span className="text-[10px] text-neutral-400">
                {new Date(log.createdAt).toLocaleString('id-ID')}
              </span>
            </div>
          ))}

          {!loading && logs.length === 0 && (
            <div className="p-8 text-center text-xs text-neutral-400">
              Belum ada riwayat aktivitas yang tercatat pada sistem.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
