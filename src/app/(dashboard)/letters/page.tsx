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
import { getLettersList, createOutgoingLetterDraft, approveLetterAction, LetterType } from './actions';

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

  // Form State Draf Surat
  const [codeType, setCodeType] = useState('UND');
  const [letterType, setLetterType] = useState<LetterType>('UNDANGAN');
  const [subject, setSubject] = useState('');
  const [recipient, setRecipient] = useState('');
  const [letterDate, setLetterDate] = useState('2026-11-22');
  const [requestedByDivision, setRequestedByDivision] = useState('Divisi Acara');

  const letterCategories = [
    { code: 'UND', type: 'UNDANGAN', label: 'Surat Undangan' },
    { code: 'SP', type: 'PERINGATAN', label: 'Surat Peringatan (SP)' },
    { code: 'GI', type: 'GIRIK_IURAN', label: 'Girik Penagihan Iuran' },
    { code: 'ST', type: 'SURAT_TUGAS', label: 'Surat Tugas' },
    { code: 'SPM', type: 'PERMOHONAN', label: 'Surat Permohonan / Kerjasama' },
    { code: 'SK', type: 'SURAT_KEPUTUSAN', label: 'Surat Keputusan (SK)' },
  ];

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

  const handleSubmitDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createOutgoingLetterDraft({
        letterType,
        codeType,
        subject,
        recipient,
        letterDate,
        requestedByDivision,
        creatorUserId: 'Wwj2K1c6qWEvYDpWPqJrX3qbhMwg0Mj8',
      });

      if (res.success) {
        setIsModalOpen(false);
        setSubject('');
        setRecipient('');
        loadData();
      } else {
        alert(res.message);
      }
    });
  };

  const handleApprove = async (id: number) => {
    startTransition(async () => {
      const res = await approveLetterAction(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
            Divisi Kesekretariatan
          </span>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Administrasi Persuratan
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4 text-[#D8AC41]" />
          <span>Ajukan Draf Surat</span>
        </button>
      </div>

      {/* Tab Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
            activeTab === 'ALL'
              ? 'bg-slate-900 text-white font-semibold'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Semua</span>
        </button>
        <button
          onClick={() => setActiveTab('OUT')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
            activeTab === 'OUT'
              ? 'bg-slate-900 text-white font-semibold'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Send className="h-3.5 w-3.5" />
          <span>Surat Keluar</span>
        </button>
        <button
          onClick={() => setActiveTab('IN')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
            activeTab === 'IN'
              ? 'bg-slate-900 text-white font-semibold'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Inbox className="h-3.5 w-3.5" />
          <span>Surat Masuk</span>
        </button>
      </div>

      {/* Daftar Surat */}
      <div className="space-y-2.5">
        {lettersList.map((letItem) => (
          <div
            key={letItem.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#D8AC41]/50 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900">
                  {letItem.letterNumber}
                </span>
                <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                  {letItem.direction === 'OUTGOING' ? 'Keluar' : 'Masuk'}
                </span>
                <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                  {letItem.letterType}
                </span>
              </div>

              <h4 className="mt-1.5 text-xs font-bold text-slate-900">
                {letItem.subject}
              </h4>

              <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400">
                <span>Penerima: {letItem.recipient}</span>
                <span>Tgl: {letItem.letterDate}</span>
                {letItem.requestedByDivision && (
                  <span>Divisi: {letItem.requestedByDivision}</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0">
              <div>
                {letItem.status === 'PUBLISHED' ? (
                  <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <Check className="mr-0.5 h-3 w-3" /> Sah & Terbit
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    <Clock className="mr-0.5 h-3 w-3" /> Draf Menunggu Pengesahan
                  </span>
                )}
              </div>

              {letItem.status === 'DRAFT' && (
                <button
                  type="button"
                  onClick={() => handleApprove(letItem.id)}
                  disabled={isPending}
                  className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition cursor-pointer"
                >
                  Sahkan & TTD
                </button>
              )}

              <Link
                href={`/letters/${letItem.id}`}
                className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-[#D8AC41] hover:text-[#B4821E] transition cursor-pointer"
              >
                <Printer className="h-3 w-3" />
                <span>Dokumen</span>
                <ChevronRight className="h-3 w-3 opacity-40" />
              </Link>
            </div>
          </div>
        ))}

        {lettersList.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
            Belum ada arsip persuratan tercatat.
          </div>
        )}
      </div>

      {/* Modal Pengajuan Draf Surat */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              Pengajuan Draf Surat Keluar
            </h3>

            <form onSubmit={handleSubmitDraft} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Jenis Dokumen Surat</label>
                <select
                  value={codeType}
                  onChange={(e) => {
                    const sel = letterCategories.find((c) => c.code === e.target.value);
                    setCodeType(e.target.value);
                    if (sel) setLetterType(sel.type as LetterType);
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                >
                  {letterCategories.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Divisi Pemohon</label>
                <input
                  type="text"
                  required
                  value={requestedByDivision}
                  onChange={(e) => setRequestedByDivision(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Tujuan / Penerima</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seluruh Anggota, Kepala Desa, Warga RT 02"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Perihal Surat</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Undangan Rapat Koordinasi Panitia"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Tanggal Surat</label>
                <input
                  type="date"
                  required
                  value={letterDate}
                  onChange={(e) => setLetterDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? 'Menerbitkan...' : 'Terbitkan Draf'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
