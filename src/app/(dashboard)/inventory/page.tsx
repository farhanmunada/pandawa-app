'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  Plus,
  CheckCircle2,
  Phone,
} from 'lucide-react';
import { getInventoryOverview, createLoanOrRentalAction, returnAssetLoanAction } from './actions';

interface AssetItem {
  id: number;
  code: string;
  name: string;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
  condition: string;
  storageLocation: string;
  internalRatePerDay: number;
  externalRatePerDay: number;
}

interface LoanItem {
  id: number;
  assetId: number;
  assetName: string;
  clientTier: string;
  borrowerName: string;
  borrowerPhone: string;
  quantity: number;
  startDate: string;
  expectedEndDate: string;
  purpose: string;
  totalFee: number;
  status: string;
}

export default function InventoryPage() {
  const [assetsList, setAssetsList] = useState<AssetItem[]>([]);
  const [loansList, setLoansList] = useState<LoanItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form State Sewa/Pinjam
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [clientTier, setClientTier] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL');
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerPhone, setBorrowerPhone] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [startDate, setStartDate] = useState('2026-11-22');
  const [expectedEndDate, setExpectedEndDate] = useState('2026-11-23');
  const [purpose, setPurpose] = useState('');

  // Form Pengembalian
  const [returnCondition, setReturnCondition] = useState('Baik');
  const [returnNotes, setReturnNotes] = useState('Barang kembali utuh dan bersih');

  const loadData = useCallback(() => {
    startTransition(async () => {
      const res = await getInventoryOverview();
      if (res.success && res.data) {
        setAssetsList(res.data.assets);
        setLoansList(res.data.loans);
        if (res.data.assets.length > 0 && !selectedAssetId) {
          setSelectedAssetId(String(res.data.assets[0].id));
        }
      }
    });
  }, [selectedAssetId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createLoanOrRentalAction({
        assetId: Number(selectedAssetId),
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
        setIsModalOpen(false);
        setBorrowerName('');
        setBorrowerPhone('');
        setPurpose('');
        loadData();
      } else {
        alert(res.message);
      }
    });
  };

  const handleReturnLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoanId) return;

    startTransition(async () => {
      const res = await returnAssetLoanAction({
        loanId: selectedLoanId,
        returnCondition,
        returnNotes,
      });

      if (res.success) {
        setIsReturnModalOpen(false);
        setSelectedLoanId(null);
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
            Divisi Logistik
          </span>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Katalog Aset & Skema Harga Ganda
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4 text-[#D8AC41]" />
          <span>Pinjam / Sewa Aset</span>
        </button>
      </div>

      {/* Katalog Barang dengan Harga Ganda */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Katalog Inventaris
        </h3>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {assetsList.map((asset) => (
            <div
              key={asset.id}
              className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#D8AC41]/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-slate-400">{asset.code}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      asset.availableQuantity > 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    Tersedia: {asset.availableQuantity} / {asset.totalQuantity}
                  </span>
                </div>

                <h4 className="mt-2 text-xs font-bold text-slate-900">{asset.name}</h4>
                <p className="mt-0.5 text-[10px] text-slate-400">Lokasi: {asset.storageLocation}</p>

                {/* Skema Harga Ganda */}
                <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-2.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Harga Dalam (Warga):</span>
                    <span className="font-bold text-slate-900">
                      Rp {Number(asset.internalRatePerDay).toLocaleString('id-ID')} / hari
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 font-medium">Harga Luar (Komersial):</span>
                    <span className="font-bold text-[#B4821E]">
                      Rp {Number(asset.externalRatePerDay).toLocaleString('id-ID')} / hari
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Kategori: {asset.category}</span>
                <span>Kondisi: {asset.condition}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sirkulasi Peminjaman Aktif */}
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
          Sirkulasi Peminjaman
        </h3>

        <div className="space-y-2.5">
          {loansList.map((loan) => (
            <div
              key={loan.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">
                    {loan.borrowerName} ({loan.quantity} unit {loan.assetName})
                  </h4>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                      loan.clientTier === 'INTERNAL'
                        ? 'border border-slate-200 bg-slate-50 text-slate-700'
                        : 'border border-[#D8AC41]/40 bg-[#D8AC41]/10 text-[#B4821E]'
                    }`}
                  >
                    {loan.clientTier === 'INTERNAL' ? 'Harga Dalam' : 'Harga Luar'}
                  </span>
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" /> {loan.borrowerPhone}
                  </span>
                  <span>Jadwal: {loan.startDate} s/d {loan.expectedEndDate}</span>
                  <span>Keperluan: {loan.purpose}</span>
                  <span className="font-semibold text-slate-700">Biaya: Rp {Number(loan.totalFee).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {loan.status === 'BORROWED' ? (
                  <button
                    onClick={() => {
                      setSelectedLoanId(loan.id);
                      setIsReturnModalOpen(true);
                    }}
                    className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    Proses Pengembalian
                  </button>
                ) : (
                  <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Telah Kembali
                  </span>
                )}
              </div>
            </div>
          ))}

          {loansList.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
              Tidak ada catatan sirkulasi peminjaman aset.
            </div>
          )}
        </div>
      </div>

      {/* Modal Pinjam / Sewa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Formulir Peminjaman / Sewa Aset</h3>

            <form onSubmit={handleCreateLoan} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Pilih Barang</label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                >
                  {assetsList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Tersedia: {a.availableQuantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Skema Tarif Klien</label>
                <select
                  value={clientTier}
                  onChange={(e) => setClientTier(e.target.value as 'INTERNAL' | 'EXTERNAL')}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                >
                  <option value="INTERNAL">Harga Dalam (Warga Lingkungan / Anggota)</option>
                  <option value="EXTERNAL">Harga Luar (Pihak Luar / Komersial Otomatis Kas)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Nama Peminjam</label>
                  <input
                    type="text"
                    required
                    value={borrowerName}
                    onChange={(e) => setBorrowerName(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">No WhatsApp</label>
                  <input
                    type="text"
                    required
                    value={borrowerPhone}
                    onChange={(e) => setBorrowerPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Jumlah Unit</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Mulai</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Kembali</label>
                  <input
                    type="date"
                    required
                    value={expectedEndDate}
                    onChange={(e) => setExpectedEndDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Keperluan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hajatan Warga RT 03"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
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
                  {isPending ? 'Memproses...' : 'Konfirmasi Peminjaman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pengembalian */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Berita Acara Pengembalian</h3>

            <form onSubmit={handleReturnLoan} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Kondisi Barang Kembali</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                >
                  <option value="Baik">Baik & Utuh</option>
                  <option value="Rusak Ringan">Rusak Ringan</option>
                  <option value="Rusak Berat">Rusak Berat</option>
                  <option value="Hilang">Hilang</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Catatan Kondisi</label>
                <textarea
                  rows={2}
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? 'Menyimpan...' : 'Selesaikan Pengembalian'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
