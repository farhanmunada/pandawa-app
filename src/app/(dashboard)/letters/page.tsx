'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Inbox,
  Send,
  Check,
  Clock,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { getLettersList, approveLetterAction } from './actions';
import { LetterDraftModal } from './LetterDraftModal';

interface LetterItem {
  id: number;
  direction: string;
  letterType: string;
  letterNumber: string;
  subject: string;
  sender: string;
  recipient: string;
  letterDate: string;
  status: string;
  primarySignatoryName: string | null;
  secondarySignatoryName: string | null;
  signedAt: Date | null;
  requestedByDivision: string | null;
  creatorName: string;
}

export default function LettersPage() {
  const [lettersList, setLettersList] = useState<LetterItem[]>([]);
  const [activeTab, setActiveTab] = useState<'ALL' | 'OUT' | 'IN'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const loadData = useCallback(() => {
    startTransition(async () => {
      const res = await getLettersList(activeTab);
      if (res.success && res.data) {
        setLettersList(res.data);
      }
    });
  }, [activeTab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (letterId: number) => {
    startTransition(async () => {
      const res = await approveLetterAction(letterId);
      if (res.success) {
        loadData();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Frameless */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
        <div>
          <span className="rounded-full bg-[#D8AC41]/15 px-3 py-1 text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
            Kesekretariatan
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            Tata Kelola Persuratan Resmi
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Penerbitan nomor surat otomatis, verifikasi permohonan draf divisi, dan tanda tangan digital
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 text-[#D8AC41]" />
          <span>Ajukan Draf Surat</span>
        </button>
      </div>

      {/* Tab Filter & List */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-100 flex-wrap">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Semua Dokumen</span>
          </button>
          <button
            onClick={() => setActiveTab('OUT')}
            className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'OUT'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Send className="h-3.5 w-3.5" />
            <span>Surat Keluar</span>
          </button>
          <button
            onClick={() => setActiveTab('IN')}
            className={`flex items-center gap-1.5 rounded-2xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
              activeTab === 'IN'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Inbox className="h-3.5 w-3.5" />
            <span>Surat Masuk</span>
          </button>
        </div>

        {/* Daftar Arsip Surat */}
        <div className="space-y-3">
          {lettersList.map((letItem) => (
            <div
              key={letItem.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 transition-all hover:bg-slate-100/70"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {letItem.letterNumber}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 shadow-2xs">
                    {letItem.direction === 'OUTGOING' ? 'Keluar' : 'Masuk'}
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 shadow-2xs">
                    {letItem.letterType}
                  </span>
                </div>

                <h4 className="mt-1.5 text-xs font-bold text-slate-900">
                  {letItem.subject}
                </h4>

                <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                  <span>Penerima: {letItem.recipient}</span>
                  <span>&bull;</span>
                  <span>Tgl: {letItem.letterDate}</span>
                  {letItem.requestedByDivision && (
                    <>
                      <span>&bull;</span>
                      <span>Divisi: {letItem.requestedByDivision}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                <div>
                  {letItem.status === 'PUBLISHED' ? (
                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                      <Check className="mr-1 h-3 w-3" /> Sah & Diterbitkan
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                      <Clock className="mr-1 h-3 w-3" /> Draf Menunggu Pengesahan
                    </span>
                  )}
                </div>

                {letItem.status === 'DRAFT' && (
                  <button
                    type="button"
                    onClick={() => handleApprove(letItem.id)}
                    disabled={isPending}
                    className="rounded-2xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    Sahkan & TTD
                  </button>
                )}

                <Link
                  href={`/letters/${letItem.id}`}
                  className="flex items-center gap-1.5 rounded-2xl bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:text-[#B4821E] transition cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5 text-slate-400" />
                  <span>Dokumen</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                </Link>
              </div>
            </div>
          ))}

          {lettersList.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-400">
              Belum ada arsip persuratan tercatat pada kategori ini.
            </div>
          )}
        </div>
      </div>

      {/* Modal Pengajuan Draf Surat */}
      <LetterDraftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
