'use client';

import React, { useState } from 'react';
import { createOutgoingLetterDraft, LetterType } from './actions';
import { X, Loader2 } from 'lucide-react';

interface LetterDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function LetterDraftModal({
  isOpen,
  onClose,
  onSuccess,
}: LetterDraftModalProps) {
  const [codeType, setCodeType] = useState('UND');
  const [letterType, setLetterType] = useState<LetterType>('UNDANGAN');
  const [subject, setSubject] = useState('');
  const [recipient, setRecipient] = useState('');
  const [letterDate, setLetterDate] = useState(new Date().toISOString().split('T')[0]);
  const [requestedByDivision, setRequestedByDivision] = useState('Divisi Acara');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const letterCategories = [
    { code: 'UND', type: 'UNDANGAN', label: 'Surat Undangan' },
    { code: 'SP', type: 'PERINGATAN', label: 'Surat Peringatan (SP)' },
    { code: 'GI', type: 'GIRIK_IURAN', label: 'Girik Penagihan Iuran' },
    { code: 'ST', type: 'SURAT_TUGAS', label: 'Surat Tugas' },
    { code: 'SPM', type: 'PERMOHONAN', label: 'Surat Permohonan / Kerjasama' },
    { code: 'SK', type: 'SURAT_KEPUTUSAN', label: 'Surat Keputusan (SK)' },
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await createOutgoingLetterDraft({
        codeType,
        letterType,
        subject,
        recipient,
        letterDate,
        requestedByDivision,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Gagal menerbitkan draf surat.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kendala saat menerbitkan surat.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
              Kesekretariatan
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Pengajuan Draf Surat Keluar
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800">Jenis Dokumen Surat</label>
            <select
              value={codeType}
              onChange={(e) => {
                const sel = letterCategories.find((c) => c.code === e.target.value);
                setCodeType(e.target.value);
                if (sel) setLetterType(sel.type as LetterType);
              }}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
            >
              {letterCategories.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800">Divisi Pemohon</label>
              <input
                type="text"
                required
                value={requestedByDivision}
                onChange={(e) => setRequestedByDivision(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800">Tanggal Surat</label>
              <input
                type="date"
                required
                value={letterDate}
                onChange={(e) => setLetterDate(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800">Tujuan / Penerima</label>
            <input
              type="text"
              required
              placeholder="e.g. Seluruh Anggota, Kepala Desa Wanangsri, Warga RT 02"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800">Perihal Surat</label>
            <input
              type="text"
              required
              placeholder="e.g. Undangan Rapat Koordinasi Panitia Makrab"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D8AC41]" />
                  <span>Menerbitkan...</span>
                </>
              ) : (
                <span>Terbitkan Draf</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
