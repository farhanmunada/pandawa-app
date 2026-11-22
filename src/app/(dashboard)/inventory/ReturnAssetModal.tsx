'use client';

import React, { useState } from 'react';
import { returnAssetLoanAction } from './actions';
import { X, Loader2 } from 'lucide-react';

interface ReturnAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  loanId: number | null;
  onSuccess: () => void;
}

export function ReturnAssetModal({
  isOpen,
  onClose,
  loanId,
  onSuccess,
}: ReturnAssetModalProps) {
  const [returnCondition, setReturnCondition] = useState('Baik');
  const [returnNotes, setReturnNotes] = useState('Barang kembali utuh, bersih, dan berfungsi normal.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !loanId) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await returnAssetLoanAction({
        loanId,
        returnCondition,
        returnNotes,
      });
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Gagal memproses pengembalian aset.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kendala saat memproses pengembalian.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
              Divisi Logistik
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Berita Acara Pengembalian Aset
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
            <label className="block text-xs font-semibold text-slate-800">Kondisi Fisik Barang</label>
            <select
              value={returnCondition}
              onChange={(e) => setReturnCondition(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
            >
              <option value="Baik">Baik & Berfungsi Utuh</option>
              <option value="Rusak Ringan">Rusak Ringan (Perlu Servis Ringan)</option>
              <option value="Rusak Berat">Rusak Berat (Ganti Komponen)</option>
              <option value="Hilang">Hilang (Wajib Penggantian Unit)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800">Catatan Petugas Logistik</label>
            <textarea
              rows={3}
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
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
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Selesaikan Pengembalian</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
