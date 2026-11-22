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
        creatorUserId: 'demo_user_id',
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-4">
        <div>
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Divisi Kesekretariatan
          </span>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Administrasi Persuratan Resmi
          </h2>
          <p className="text-xs text-neutral-500">
            Penerbitan surat keluar bernomor otomatis, persetujuan TTD digital resmi, dan surat masuk.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Ajukan Draf Surat Keluar</span>
        </button>
      </div>

      {/* Tab Filter */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            activeTab === 'ALL'
              ? 'bg-neutral-900 text-white font-semibold'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Semua Surat</span>
        </button>
        <button
          onClick={() => setActiveTab('OUT')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            activeTab === 'OUT'
              ? 'bg-neutral-900 text-white font-semibold'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Send className="h-3.5 w-3.5" />
          <span>Surat Keluar</span>
        </button>
        <button
          onClick={() => setActiveTab('IN')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            activeTab === 'IN'
              ? 'bg-neutral-900 text-white font-semibold'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Inbox className="h-3.5 w-3.5" />
          <span>Surat Masuk</span>
        </button>
      </div>

      {/* Daftar Surat */}
      <div className="space-y-3">
        {lettersList.map((letItem) => (
          <div
            key={letItem.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-xs hover:border-neutral-300 transition"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-neutral-900">
                  {letItem.letterNumber}
                </span>
                <span className="rounded-sm bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium text-neutral-600">
                  {letItem.letterType}
                </span>
                {letItem.requestedByDivision && (
                  <span className="rounded-sm bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium text-neutral-600">
                    {letItem.requestedByDivision}
                  </span>
                )}
              </div>

              <h4 className="mt-1 text-xs font-bold text-neutral-900">{letItem.subject}</h4>

              <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-neutral-500">
                <span>Kepada: {letItem.recipient}</span>
                <span>Tanggal: {letItem.letterDate}</span>
                <span>Diajukan: {letItem.creatorName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {letItem.status === 'APPROVED' ? (
                <span className="inline-flex items-center text-[11px] text-emerald-600 font-medium">
                  <Check className="mr-1 h-3.5 w-3.5" /> Resmi Disahkan
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center text-[11px] text-amber-600 font-medium">
                    <Clock className="mr-1 h-3.5 w-3.5" /> Menunggu TTD
                  </span>
                  <button
                    onClick={() => handleApprove(letItem.id)}
                    disabled={isPending}
                    className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                  >
                    Sahkan TTD
                  </button>
                </div>
              )}

              <Link
                href={`/letters/${letItem.id}`}
                className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 px-2.5 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50"
              >
                <Printer className="h-3 w-3" />
                <span>Lihat & Cetak</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}

        {lettersList.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-xs text-neutral-500">
            Belum ada arsip persuratan tercatat.
          </div>
        )}
      </div>

      {/* Modal Pengajuan Draf Surat */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900">
              Pengajuan Draf Surat Keluar
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Nomor surat otomatis dihasilkan berurutan bebas konflik.
            </p>

            <form onSubmit={handleSubmitDraft} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700">Jenis Dokumen Surat</label>
                <select
                  value={codeType}
                  onChange={(e) => {
                    const sel = letterCategories.find((c) => c.code === e.target.value);
                    setCodeType(e.target.value);
                    if (sel) setLetterType(sel.type as LetterType);
                  }}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                >
                  {letterCategories.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700">Divisi Pemohon</label>
                <input
                  type="text"
                  required
                  value={requestedByDivision}
                  onChange={(e) => setRequestedByDivision(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700">Tujuan / Penerima Surat</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Seluruh Anggota, Kepala Desa, Warga RT 02"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700">Perihal / Hal Surat</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Undangan Rapat Koordinasi Panitia"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700">Tanggal Surat</label>
                <input
                  type="date"
                  required
                  value={letterDate}
                  onChange={(e) => setLetterDate(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
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
