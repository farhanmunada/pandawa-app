'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  Plus,
  CheckCircle2,
  Phone,
} from 'lucide-react';
import { getInventoryOverview } from './actions';
import { CreateLoanModal } from './CreateLoanModal';
import { ReturnAssetModal } from './ReturnAssetModal';

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
  const [, startTransition] = useTransition();

  const loadData = useCallback(() => {
    startTransition(async () => {
      const res = await getInventoryOverview();
      if (res.success && res.data) {
        setAssetsList(res.data.assets);
        setLoansList(res.data.loans);
      }
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenReturn = (loanId: number) => {
    setSelectedLoanId(loanId);
    setIsReturnModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Frameless */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
        <div>
          <span className="rounded-full bg-[#D8AC41]/15 px-3 py-1 text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
            Divisi Logistik
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            Katalog Inventaris & Skema Tarif Ganda
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Peminjaman subsidi warga lingkungan dan sewa komersial pihak luar yang otomatis mencatat kas
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 text-[#D8AC41]" />
          <span>Pinjam / Sewa Aset</span>
        </button>
      </div>

      {/* Grid Katalog Aset */}
      <div>
        <div className="mb-3.5 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Katalog Aset Tersedia ({assetsList.length} Item)
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assetsList.map((asset) => (
            <div
              key={asset.id}
              className="flex flex-col justify-between rounded-3xl bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[9px] font-bold text-slate-600">
                    {asset.code}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                      asset.availableQuantity > 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {asset.availableQuantity > 0 ? `${asset.availableQuantity} Unit Siap` : 'Sedang Dipinjam'}
                  </span>
                </div>

                <h4 className="mt-3 text-sm font-bold text-slate-900">{asset.name}</h4>
                <p className="mt-0.5 text-[11px] text-slate-400">Lokasi: {asset.storageLocation}</p>

                {/* Skema Harga Ganda */}
                <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-slate-50 p-3 text-center">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Tarif Warga</span>
                    <span className="mt-0.5 block text-xs font-bold text-slate-800">
                      Rp {asset.internalRatePerDay.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase">Tarif Luar</span>
                    <span className="mt-0.5 block text-xs font-bold text-[#B4821E]">
                      Rp {asset.externalRatePerDay.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Kategori: {asset.category}</span>
                <span className="font-semibold text-slate-700">Kondisi: {asset.condition}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sirkulasi Peminjaman Aktif */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-sm font-bold text-slate-900">Sirkulasi & Status Peminjaman</span>
          <span className="text-xs text-slate-400">{loansList.length} aktivitas aktif</span>
        </div>

        <div className="space-y-3">
          {loansList.map((loan) => (
            <div
              key={loan.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 transition-all hover:bg-slate-100/70"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-slate-900">
                    {loan.assetName} ({loan.quantity} Unit)
                  </h4>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                      loan.clientTier === 'INTERNAL'
                        ? 'bg-[#D8AC41]/15 text-[#B4821E]'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {loan.clientTier === 'INTERNAL' ? 'Harga Warga' : 'Pihak Luar'}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                      loan.status === 'BORROWED'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {loan.status === 'BORROWED' ? 'Sedang Dipinjam' : 'Telah Kembali'}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                  <span className="font-semibold text-slate-700">Peminjam: {loan.borrowerName}</span>
                  <span>&bull;</span>
                  <span className="inline-flex items-center gap-1">
                    <Phone className="h-3 w-3 text-slate-400" />
                    {loan.borrowerPhone}
                  </span>
                  <span>&bull;</span>
                  <span>
                    Jadwal: {loan.startDate} s.d. {loan.expectedEndDate}
                  </span>
                  <span>&bull;</span>
                  <span>Keperluan: {loan.purpose}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                <div className="text-right">
                  <span className="block text-xs font-bold text-slate-900">
                    Rp {loan.totalFee.toLocaleString('id-ID')}
                  </span>
                  <span className="block text-[10px] text-slate-400">Total Tarif</span>
                </div>

                {loan.status === 'BORROWED' && (
                  <button
                    type="button"
                    onClick={() => handleOpenReturn(loan.id)}
                    className="flex items-center gap-1.5 rounded-2xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#D8AC41]" />
                    <span>Kembalikan</span>
                  </button>
                )}
              </div>
            </div>
          ))}

          {loansList.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-400">
              Belum ada peminjaman aset yang sedang berjalan.
            </div>
          )}
        </div>
      </div>

      {/* Modal Buat Peminjaman */}
      <CreateLoanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        assetsList={assetsList}
        onSuccess={loadData}
      />

      {/* Modal Pengembalian Barang */}
      <ReturnAssetModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        loanId={selectedLoanId}
        onSuccess={loadData}
      />
    </div>
  );
}
