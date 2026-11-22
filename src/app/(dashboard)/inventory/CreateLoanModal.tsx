'use client';

import React, { useState } from 'react';
import { createLoanOrRentalAction } from './actions';
import { X, Loader2 } from 'lucide-react';

interface AssetItem {
  id: number;
  name: string;
  availableQuantity: number;
}

interface CreateLoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetsList: AssetItem[];
  onSuccess: () => void;
}

export function CreateLoanModal({
  isOpen,
  onClose,
  assetsList,
  onSuccess,
}: CreateLoanModalProps) {
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    assetsList.length > 0 ? String(assetsList[0].id) : ''
  );
  const [clientTier, setClientTier] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [startDate, setStartDate] = useState('');
  const [expectedEndDate, setExpectedEndDate] = useState('');
  const [purpose, setPurpose] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await createLoanOrRentalAction({
        assetId: Number(selectedAssetId || (assetsList[0]?.id ?? 1)),
        clientTier,
        borrowerName,
        borrowerPhone,
        quantity: Number(quantity),
        startDate,
        expectedEndDate,
        purpose,
        processedByUserId: 'Wwj2K1c6qWEvYDpWPqJrX3qbhMwg0Mj8',
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Gagal memproses peminjaman aset.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kendala saat memproses peminjaman.');
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
              Divisi Logistik
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Formulir Pinjam / Sewa Aset
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
            <label className="block text-xs font-semibold text-slate-800">Pilih Barang Inventaris</label>
            <select
              value={selectedAssetId}
              onChange={(e) => setSelectedAssetId(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
            >
              {assetsList.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (Tersedia: {a.availableQuantity})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800">Skema Tarif Klien</label>
            <select
              value={clientTier}
              onChange={(e) => setClientTier(e.target.value as 'INTERNAL' | 'EXTERNAL')}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
            >
              <option value="INTERNAL">Harga Dalam (Warga Dusun / Anggota)</option>
              <option value="EXTERNAL">Harga Luar (Pihak Luar / Komersial Masuk Kas)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800">Nama Peminjam</label>
              <input
                type="text"
                required
                value={borrowerName}
                onChange={(e) => setBorrowerName(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800">No WhatsApp</label>
              <input
                type="text"
                required
                value={borrowerPhone}
                onChange={(e) => setBorrowerPhone(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800">Jumlah Unit</label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800">Mulai Pinjam</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800">Rencana Kembali</label>
              <input
                type="date"
                required
                value={expectedEndDate}
                onChange={(e) => setExpectedEndDate(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800">Keperluan Penggunaan</label>
            <input
              type="text"
              required
              placeholder="e.g. Hajatan Warga Dusun RT 03"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
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
                  <span>Memproses...</span>
                </>
              ) : (
                <span>Konfirmasi Peminjaman</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
