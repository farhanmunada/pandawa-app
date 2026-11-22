'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  FileText,
  Clock,
  Check,
} from 'lucide-react';
import { getFinanceOverview, approveTransactionAction } from './actions';
import { TransactionModal } from './TransactionModal';

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
  creatorName: string | null;
}

interface FinanceViewProps {
  userRoles?: string[];
}

export function FinanceView({ userRoles = [] }: FinanceViewProps) {
  const [walletsList, setWalletsList] = useState<WalletItem[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isLeader = userRoles.some((r) =>
    ['super_admin', 'ketua_umum', 'wakil_ketua'].includes(r)
  );

  const loadData = useCallback(() => {
    startTransition(async () => {
      const res = await getFinanceOverview();
      if (res.success && res.data) {
        setWalletsList(res.data.wallets);
        setTotalBalance(res.data.totalBalance);
        setTransactions(res.data.transactions);
      }
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (transactionId: string) => {
    startTransition(async () => {
      const res = await approveTransactionAction(transactionId);
      if (res.success) {
        loadData();
      }
    });
  };

  const filteredTransactions = transactions.filter((t) =>
    selectedWalletId === 'ALL' ? true : String(t.walletId) === selectedWalletId
  );

  return (
    <div className="space-y-6">
      {/* Header Banner Frameless */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
        <div>
          <span className="rounded-full bg-[#D8AC41]/15 px-3 py-1 text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
            Divisi Keuangan
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            Arus Kas & Multi-Wallet
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Pengelolaan buku kas operasional, persetujuan belanja, dan transparansi iuran
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4 text-[#D8AC41]" />
          <span>Catat Transaksi Kas</span>
        </button>
      </div>

      {/* Ringkasan Total Saldo */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Total Saldo Kas Organisasi
          </span>
          <span className="rounded-full bg-[#D8AC41]/15 px-3 py-0.5 text-[10px] font-bold text-[#B4821E]">
            {walletsList.length} Pos Dompet Aktif
          </span>
        </div>
        <h3 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Rp {totalBalance.toLocaleString('id-ID')}
        </h3>
      </div>

      {/* Kartu Dompet Kas (Multi-Wallet) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {walletsList.map((w) => {
          const isSelected = selectedWalletId === String(w.id);
          return (
            <div
              key={w.id}
              onClick={() => setSelectedWalletId(String(w.id))}
              className={`cursor-pointer rounded-3xl p-5 sm:p-6 transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white hover:bg-slate-50 text-slate-900 shadow-[0_12px_40px_rgba(0,0,0,0.03)]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                  {w.name}
                </span>
                <Wallet className={`h-4 w-4 ${isSelected ? 'text-[#D8AC41]' : 'text-slate-400'}`} />
              </div>
              <p className={`mt-3 text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                Rp {Number(w.currentBalance).toLocaleString('id-ID')}
              </p>
              <p className={`mt-1 text-[11px] line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>
                {w.description || 'Pos kas aktif'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Mutasi Transaksi */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">Mutasi Transaksi</span>
            {selectedWalletId !== 'ALL' && (
              <button
                onClick={() => setSelectedWalletId('ALL')}
                className="text-xs text-[#B4821E] hover:underline font-semibold cursor-pointer"
              >
                (Tampilkan Semua)
              </button>
            )}
          </div>
          <span className="text-xs text-slate-400">{filteredTransactions.length} catatan</span>
        </div>

        <div className="space-y-3">
          {filteredTransactions.map((trx) => (
            <div
              key={trx.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 transition-all hover:bg-slate-100/70"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
                    trx.type === 'IN' ? 'bg-emerald-100/80 text-emerald-700' : 'bg-rose-100/80 text-rose-700'
                  }`}
                >
                  {trx.type === 'IN' ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-slate-900">{trx.description}</h4>
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 shadow-2xs">
                      {trx.category}
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-semibold text-slate-700 shadow-2xs">
                      {trx.walletName}
                    </span>
                  </div>

                  <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400">
                    <span>{trx.transactionDate}</span>
                    <span>&bull;</span>
                    <span>Oleh: {trx.creatorName || 'Sistem'}</span>
                    {trx.receiptDriveUrl && (
                      <>
                        <span>&bull;</span>
                        <a
                          href={trx.receiptDriveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center text-[#B4821E] hover:underline font-semibold"
                        >
                          <FileText className="mr-1 h-3 w-3" />
                          <span>Lihat Nota</span>
                        </a>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                <div className="text-right">
                  <span
                    className={`text-sm font-bold ${
                      trx.type === 'IN' ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {trx.type === 'IN' ? '+' : '-'} Rp {trx.amount.toLocaleString('id-ID')}
                  </span>
                  <div className="mt-0.5 flex items-center justify-end gap-1 text-[10px] text-slate-400">
                    {trx.status === 'APPROVED' ? (
                      <span className="flex items-center text-emerald-600 font-semibold">
                        <Check className="mr-0.5 h-3 w-3" /> Sah
                      </span>
                    ) : (
                      <span className="flex items-center text-amber-600 font-semibold">
                        <Clock className="mr-0.5 h-3 w-3" /> Menunggu Persetujuan
                      </span>
                    )}
                  </div>
                </div>

                {trx.status === 'PENDING_APPROVAL' && isLeader && (
                  <button
                    type="button"
                    onClick={() => handleApprove(trx.id)}
                    disabled={isPending}
                    className="rounded-2xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    Setujui
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredTransactions.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-400">
              Belum ada mutasi transaksi pada pos kas yang dipilih.
            </div>
          )}
        </div>
      </div>

      {/* Modal Input Transaksi */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        walletsList={walletsList}
        onSuccess={loadData}
      />
    </div>
  );
}
