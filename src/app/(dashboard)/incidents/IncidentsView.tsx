'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  Plus,
  Lock,
  Globe,
  CheckCircle2,
  MapPin,
  FileText,
} from 'lucide-react';
import {
  getIncidentsList,
  assignIncidentPicAction,
  resolveIncidentAction,
} from './actions';
import { ReportIncidentModal } from './ReportIncidentModal';

interface IncidentItem {
  id: number;
  title: string;
  category: string;
  description: string;
  location: string;
  incidentTime: Date;
  urgency: string;
  isConfidential: boolean;
  status: string;
  reporterName: string;
  proofDriveUrl: string | null;
  createdAt: Date;
}

interface IncidentsViewProps {
  userId: string;
  userRoles?: string[];
}

export function IncidentsView({ userId, userRoles = [] }: IncidentsViewProps) {
  const [incidentsList, setIncidentsList] = useState<IncidentItem[]>([]);
  const [filterMode, setFilterMode] = useState<'ALL' | 'PUBLIC' | 'CONFIDENTIAL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isSuperAdmin = userRoles.includes('super_admin');
  const isLeader =
    isSuperAdmin || userRoles.includes('ketua_umum') || userRoles.includes('wakil_ketua');
  const isSecurityOrLeader = isLeader || userRoles.includes('divisi_keamanan');

  const loadData = useCallback(() => {
    startTransition(async () => {
      const res = await getIncidentsList(userId, userRoles);
      if (res.success && res.data) {
        setIncidentsList(res.data);
      }
    });
  }, [userId, userRoles]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssignPic = async (incidentId: number) => {
    startTransition(async () => {
      const res = await assignIncidentPicAction(incidentId, userId);
      if (res.success) {
        loadData();
      }
    });
  };

  const handleResolve = async (incidentId: number) => {
    startTransition(async () => {
      const res = await resolveIncidentAction(incidentId);
      if (res.success) {
        loadData();
      }
    });
  };

  const filteredIncidents = incidentsList.filter((item) => {
    if (filterMode === 'PUBLIC') return !item.isConfidential;
    if (filterMode === 'CONFIDENTIAL') return item.isConfidential;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner Frameless */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
        <div>
          <span className="rounded-full bg-[#D8AC41]/15 px-3 py-1 text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
            Keamanan & Konseling
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            Laporan Pengaduan & Ketertiban
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Kanal aspirasi warga dan penanganan insiden lapangan dengan perlindungan privasi
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 text-[#D8AC41]" />
          <span>Buat Laporan Baru</span>
        </button>
      </div>

      {/* Kontrol Filter & Tab */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`rounded-2xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                filterMode === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua Laporan ({incidentsList.length})
            </button>
            <button
              onClick={() => setFilterMode('PUBLIC')}
              className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                filterMode === 'PUBLIC'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>Publik</span>
            </button>
            <button
              onClick={() => setFilterMode('CONFIDENTIAL')}
              className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
                filterMode === 'CONFIDENTIAL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Rahasia</span>
            </button>
          </div>
        </div>

        {/* Daftar Laporan */}
        <div className="space-y-3">
          {filteredIncidents.map((inc) => (
            <div
              key={inc.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 transition-all hover:bg-slate-100/70"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      inc.isConfidential
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {inc.isConfidential ? (
                      <>
                        <Lock className="h-2.5 w-2.5" />
                        <span>Rahasia</span>
                      </>
                    ) : (
                      <>
                        <Globe className="h-2.5 w-2.5" />
                        <span>Publik</span>
                      </>
                    )}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 shadow-2xs">
                    {inc.category}
                  </span>
                </div>

                <h4 className="mt-1.5 text-xs font-bold text-slate-900">{inc.title}</h4>
                <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">{inc.description}</p>

                <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-slate-400" />
                    {inc.location}
                  </span>
                  <span>&bull;</span>
                  <span>Pelapor: {inc.reporterName}</span>
                  <span>&bull;</span>
                  <span>Waktu: {new Date(inc.incidentTime).toLocaleString('id-ID')}</span>
                  {inc.proofDriveUrl && (
                    <>
                      <span>&bull;</span>
                      <a
                        href={inc.proofDriveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-[#B4821E] hover:underline font-semibold"
                      >
                        <FileText className="mr-1 h-3 w-3" />
                        <span>Lampiran Foto</span>
                      </a>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 shrink-0">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    inc.status === 'RESOLVED'
                      ? 'bg-emerald-100 text-emerald-700'
                      : inc.status === 'IN_PROGRESS'
                      ? 'bg-sky-100 text-sky-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {inc.status === 'RESOLVED'
                    ? 'Selesai'
                    : inc.status === 'IN_PROGRESS'
                    ? 'Investigasi'
                    : 'Terbuka'}
                </span>

                {isSecurityOrLeader && inc.status === 'OPEN' && (
                  <button
                    type="button"
                    onClick={() => handleAssignPic(inc.id)}
                    disabled={isPending}
                    className="rounded-2xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    Tangani
                  </button>
                )}

                {isSecurityOrLeader && inc.status === 'IN_PROGRESS' && (
                  <button
                    type="button"
                    onClick={() => handleResolve(inc.id)}
                    disabled={isPending}
                    className="flex items-center gap-1 rounded-2xl bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Selesaikan</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredIncidents.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-400">
              Tidak ada laporan tercatat pada kategori ini.
            </div>
          )}
        </div>
      </div>

      {/* Modal Laporan Baru */}
      <ReportIncidentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
