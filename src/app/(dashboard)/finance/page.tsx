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
      const originalFile = e.target.files[0];
      const compressed = await compressImageClient(originalFile);
      setReceiptFile(compressed);
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-4">
        <div>
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Divisi Keuangan
          </span>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Arus Kas & Multi-Wallet
          </h2>
          <p className="text-xs text-neutral-500">
            Pengelolaan buku kas operasional, sosial, usaha, dan persetujuan pengeluaran.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Catat Transaksi Baru</span>
        </button>
      </div>

      {/* Ringkasan Total Saldo */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
        <span className="text-xs font-medium text-neutral-500">Total Akumulasi Saldo Kas Organisasi</span>
        <h3 className="mt-1 text-2xl font-extrabold text-neutral-900">
          Rp {totalBalance.toLocaleString('id-ID')}
        </h3>
        <p className="mt-1 text-[11px] text-neutral-500">
          Terbagi dalam {walletsList.length} pos dompet aktif.
        </p>
      </div>

      {/* Kartu Dompet Kas (Multi-Wallet) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {walletsList.map((w) => (
          <div
            key={w.id}
            onClick={() => setSelectedWalletId(String(w.id))}
            className={`cursor-pointer rounded-xl border p-4 transition ${
              selectedWalletId === String(w.id)
                ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                : 'border-neutral-200 bg-white hover:border-neutral-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-700 truncate">{w.name}</span>
              <Wallet className="h-4 w-4 text-neutral-400" />
            </div>
            <p className="mt-2 text-base font-bold text-neutral-900">
              Rp {Number(w.currentBalance).toLocaleString('id-ID')}
            </p>
            <p className="mt-1 text-[10px] text-neutral-500 line-clamp-1">
              {w.description || 'Pos kas aktif'}
            </p>
          </div>
        ))}
      </div>

      {/* Filter Daftar Transaksi */}
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-900">Mutasi Buku Kas</span>
          {selectedWalletId !== 'ALL' && (
            <button
              onClick={() => setSelectedWalletId('ALL')}
              className="text-[11px] text-blue-600 hover:underline"
            >
              (Tampilkan Semua Dompet)
            </button>
          )}
        </div>
      </div>

      {/* Tabel Transaksi */}
      <div className="space-y-2.5">
        {filteredTransactions.map((trx) => (
          <div
            key={trx.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-xs"
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${
                  trx.type === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
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
                  <h4 className="text-xs font-bold text-neutral-900">{trx.description}</h4>
                  <span className="rounded-sm bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium text-neutral-600">
                    {trx.category}
                  </span>
                  <span className="rounded-sm bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium text-neutral-600">
                    {trx.walletName}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-3 text-[11px] text-neutral-400">
                  <span>{trx.transactionDate}</span>
                  <span>Oleh: {trx.creatorName}</span>
                  {trx.receiptDriveUrl && (
                    <a
                      href={trx.receiptDriveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-blue-600 hover:underline"
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
                    trx.type === 'IN' ? 'text-emerald-600' : 'text-neutral-900'
                  }`}
                >
                  {trx.type === 'IN' ? '+' : '-'} Rp {Number(trx.amount).toLocaleString('id-ID')}
                </span>
                <div className="mt-0.5">
                  {trx.status === 'APPROVED' ? (
                    <span className="inline-flex items-center text-[10px] text-emerald-600 font-medium">
                      <Check className="mr-0.5 h-3 w-3" /> Disetujui
                    </span>
                  ) : trx.status === 'PENDING_APPROVAL' ? (
                    <span className="inline-flex items-center text-[10px] text-amber-600 font-medium">
                      <Clock className="mr-0.5 h-3 w-3" /> Menunggu Persetujuan Ketua (&gt;500k)
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] text-rose-600 font-medium">
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
                  className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition"
                >
                  Setujui
                </button>
              )}
            </div>
          </div>
        ))}

        {filteredTransactions.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-xs text-neutral-500">
            Belum ada transaksi tercatat pada dompet ini.
          </div>
        )}
      </div>

      {/* Modal Input Transaksi */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900">
              Pencatatan Transaksi Kas
            </h3>

            <form onSubmit={handleSubmitTransaction} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700">Jenis Mutasi</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as 'IN' | 'OUT')}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                  >
                    <option value="OUT">Pengeluaran (Kas Keluar)</option>
                    <option value="IN">Pemasukan (Kas Masuk)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700">Dompet Kas</label>
                  <select
                    value={formWalletId}
                    onChange={(e) => setFormWalletId(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
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
                <label className="block text-[11px] font-semibold text-neutral-700">Nominal (Rp)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 150000"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700">Kategori</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Konsumsi, Logistik"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700">Keterangan / Uraian</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Uraian kebutuhan transaksi kas"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700">Foto Nota / Bukti Transfer</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 w-full text-xs text-neutral-500 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-neutral-700 hover:file:bg-neutral-200"
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
