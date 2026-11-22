'use client';

import React, { useState } from 'react';
import { compressImageClient } from '@/lib/utils/image-compression';
import { createTransactionAction } from './actions';
import { X, Upload, Loader2 } from 'lucide-react';

interface WalletItem {
  id: number;
  name: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  walletsList: WalletItem[];
  onSuccess: () => void;
}

export function TransactionModal({
  isOpen,
  onClose,
  walletsList,
  onSuccess,
}: TransactionModalProps) {
  const [formWalletId, setFormWalletId] = useState<string>(
    walletsList.length > 0 ? String(walletsList[0].id) : ''
  );
  const [formType, setFormType] = useState<'IN' | 'OUT'>('OUT');
  const [formCategory, setFormCategory] = useState('Konsumsi');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDescription, setFormDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const compressed = await compressImageClient(e.target.files[0]);
        setReceiptFile(compressed);
      } catch {
        setReceiptFile(e.target.files[0]);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const fd = new FormData();
      fd.append('walletId', formWalletId || (walletsList[0] ? String(walletsList[0].id) : '1'));
      fd.append('type', formType);
      fd.append('category', formCategory);
      fd.append('amount', formAmount);
      fd.append('transactionDate', formDate);
      fd.append('description', formDescription);
      if (receiptFile) {
        fd.append('receiptFile', receiptFile);
      }

      const res = await createTransactionAction(fd);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Gagal menyimpan transaksi kas.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kendala saat menyimpan transaksi.');
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
              Buku Kas
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Pencatatan Transaksi Kas
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800">Jenis Mutasi</label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as 'IN' | 'OUT')}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              >
                <option value="OUT">Pengeluaran (Kas Keluar)</option>
                <option value="IN">Pemasukan (Kas Masuk)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800">Dompet Kas</label>
              <select
                value={formWalletId}
                onChange={(e) => setFormWalletId(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              >
                {walletsList.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800">Nominal (Rp)</label>
              <input
                type="number"
                required
                placeholder="150000"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800">Tanggal Transaksi</label>
              <input
                type="date"
                required
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800">Kategori</label>
            <input
              type="text"
              required
              placeholder="e.g. Konsumsi Rapat, Operasional, Kebersihan"
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800">Keterangan Transaksi</label>
            <textarea
              required
              rows={2}
              placeholder="Uraian kebutuhan transaksi kas"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800">Foto Nota / Bukti Transfer</label>
            <div className="mt-1.5 flex items-center gap-3">
              <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                <Upload className="h-4 w-4 text-[#D8AC41]" />
                <span>Pilih Foto Bukti</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-slate-400 truncate">
                {receiptFile ? receiptFile.name : 'Belum ada berkas dipilih'}
              </span>
            </div>
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
                <span>Simpan Transaksi</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
