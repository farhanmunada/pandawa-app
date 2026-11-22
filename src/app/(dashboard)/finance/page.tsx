'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Check,
  X,
  Plus,
  FileText,
} from 'lucide-react';
import { getFinanceOverview, createTransactionAction, approveTransactionAction } from './actions';
import { compressImageClient } from '@/lib/utils/image-compression';

interface WalletItem {
  id: number;
  name: string;
  description: string | null;
  currentBalance: number;
}

interface TransactionItem {
  id: string;
  walletId: number;
  walletName: string;
  type: string;
  category: string;
  amount: number;
  transactionDate: string;
  description: string;
  receiptDriveUrl: string | null;
  status: string;
  requiresApproval: boolean;
  creatorName: string;
}

export default function FinancePage() {
  const [walletsList, setWalletsList] = useState<WalletItem[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [formWalletId, setFormWalletId] = useState<string>('');
  const [formType, setFormType] = useState<'IN' | 'OUT'>('OUT');
  const [formCategory, setFormCategory] = useState('Konsumsi');
  const [formAmount, setFormAmount] = useState('');
  const [formDate, setFormDate] = useState('2026-11-22');
  const [formDescription, setFormDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const loadData = useCallback(() => {
    startTransition(async () => {
      const res = await getFinanceOverview();
      if (res.success && res.data) {
        setWalletsList(res.data.wallets);
        setTotalBalance(res.data.totalBalance);
        setTransactions(res.data.transactions);
        if (res.data.wallets.length > 0 && !formWalletId) {
          setFormWalletId(String(res.data.wallets[0].id));
        }
      }
    });
  }, [formWalletId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressed = await compressImageClient(file, 800);
        setReceiptFile(compressed);
      } catch {
        setReceiptFile(file);
      }
    }
  };

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const fd = new FormData();
      fd.append('walletId', formWalletId);
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
        setIsModalOpen(false);
        setFormAmount('');
        setFormDescription('');
        setReceiptFile(null);
        loadData();
      } else {
        alert(res.message);
      }
    });
  };

  const handleApprove = async (transactionId: string) => {
    startTransition(async () => {
      const res = await approveTransactionAction(transactionId, 'ketua_demo_id');
      if (res.success) {
        loadData();
      } else {
        alert(res.message);
      }
    });
  };

  const filteredTransactions = transactions.filter((t) =>
    selectedWalletId === 'ALL' ? true : String(t.walletId) === selectedWalletId
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
            Divisi Keuangan
          </span>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Arus Kas & Multi-Wallet
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4 text-[#D8AC41]" />
          <span>Catat Transaksi</span>
        </button>
      </div>

      {/* Ringkasan Total Saldo */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Saldo Kas Organisasi
          </span>
          <span className="rounded-md border border-[#D8AC41]/30 bg-[#D8AC41]/10 px-2 py-0.5 text-[10px] font-bold text-[#B4821E]">
            {walletsList.length} Pos Dompet
          </span>
        </div>
        <h3 className="mt-1.5 text-2xl font-bold tracking-tight text-slate-900">
          Rp {totalBalance.toLocaleString('id-ID')}
        </h3>
      </div>

      {/* Kartu Dompet Kas (Multi-Wallet) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {walletsList.map((w, idx) => (
          <div
            key={w.id}
            onClick={() => setSelectedWalletId(String(w.id))}
            className={`cursor-pointer rounded-xl border p-4 transition-all ${
              selectedWalletId === String(w.id)
                ? 'border-slate-900 bg-slate-50 shadow-xs'
                : 'border-slate-200 bg-white hover:border-slate-300'
            } ${idx === 0 ? 'border-l-4 border-l-[#D8AC41]' : ''}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 truncate">{w.name}</span>
              <Wallet className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <p className="mt-2 text-base font-bold text-slate-900">
              Rp {Number(w.currentBalance).toLocaleString('id-ID')}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400 line-clamp-1">
              {w.description || 'Pos kas aktif'}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Daftar Transaksi */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-900">Mutasi Transaksi</span>
          {selectedWalletId !== 'ALL' && (
            <button
              onClick={() => setSelectedWalletId('ALL')}
              className="text-[10px] text-[#B4821E] hover:underline font-medium cursor-pointer"
            >
              (Tampilkan Semua)
            </button>
          )}
        </div>
        <span className="text-[10px] text-slate-400">{filteredTransactions.length} catatan</span>
      </div>

      {/* Tabel Transaksi */}
      <div className="space-y-2">
        {filteredTransactions.map((trx) => (
          <div
            key={trx.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                  trx.type === 'IN' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {trx.type === 'IN' ? (
                  <ArrowDownLeft className="h-4 w-4" />
                ) : (
                  <ArrowUpRight className="h-4 w-4" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900">{trx.description}</h4>
                  <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                    {trx.category}
                  </span>
                  <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                    {trx.walletName}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-3 text-[10px] text-slate-400">
                  <span>{trx.transactionDate}</span>
                  <span>Oleh: {trx.creatorName}</span>
                  {trx.receiptDriveUrl && (
                    <a
                      href={trx.receiptDriveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-[#B4821E] hover:underline font-medium"
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      <span>Nota</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0">
              <div className="text-right">
                <span
                  className={`text-xs font-bold ${
                    trx.type === 'IN' ? 'text-emerald-700' : 'text-slate-900'
                  }`}
                >
                  {trx.type === 'IN' ? '+' : '-'} Rp {Number(trx.amount).toLocaleString('id-ID')}
                </span>
                <div className="mt-0.5">
                  {trx.status === 'APPROVED' ? (
                    <span className="inline-flex items-center text-[10px] text-emerald-700 font-medium">
                      <Check className="mr-0.5 h-3 w-3" /> Disetujui
                    </span>
                  ) : trx.status === 'PENDING_APPROVAL' ? (
                    <span className="inline-flex items-center text-[10px] text-amber-700 font-medium">
                      <Clock className="mr-0.5 h-3 w-3" /> Verifikasi Ketua (&gt;500k)
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] text-rose-700 font-medium">
                      <X className="mr-0.5 h-3 w-3" /> Ditolak
                    </span>
                  )}
                </div>
              </div>

              {trx.status === 'PENDING_APPROVAL' && (
                <button
                  type="button"
                  onClick={() => handleApprove(trx.id)}
                  disabled={isPending}
                  className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition cursor-pointer"
                >
                  Setujui
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
            Belum ada transaksi tercatat pada dompet ini.
          </div>
        )}
      </div>

      {/* Modal Input Transaksi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              Pencatatan Transaksi Kas
            </h3>

            <form onSubmit={handleSubmitTransaction} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Jenis Mutasi</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as 'IN' | 'OUT')}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  >
                    <option value="OUT">Pengeluaran (Kas Keluar)</option>
                    <option value="IN">Pemasukan (Kas Masuk)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Dompet Kas</label>
                  <select
                    value={formWalletId}
                    onChange={(e) => setFormWalletId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  >
                    {walletsList.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 150000"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Kategori</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Konsumsi, Logistik"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Keterangan</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Uraian kebutuhan transaksi kas"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Foto Nota / Bukti Transfer</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 w-full text-xs text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
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
                  {isPending ? 'Menyimpan...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
