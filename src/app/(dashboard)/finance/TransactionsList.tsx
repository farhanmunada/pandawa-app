'use client';

import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Clock, Check, FileText } from 'lucide-react';

export interface TransactionItem {
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

interface TransactionsListProps {
  transactions: TransactionItem[];
  selectedWalletId: string;
  onClearFilter: () => void;
  isLeader: boolean;
  isPending: boolean;
  onApprove: (id: string) => void;
}

export function TransactionsList({
  transactions,
  selectedWalletId,
  onClearFilter,
  isLeader,
  isPending,
  onApprove,
}: TransactionsListProps) {
  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-slate-900">Riwayat Mutasi Transaksi</h3>
          {selectedWalletId !== 'ALL' && (
            <button
              type="button"
              onClick={onClearFilter}
              className="text-xs text-[#B4821E] hover:underline font-semibold cursor-pointer"
            >
              (Tampilkan Semua)
            </button>
          )}
        </div>
        <span className="text-xs text-slate-400">{transactions.length} catatan</span>
      </div>

      <div className="space-y-3 pt-4">
        {transactions.map((trx) => (
          <div
            key={trx.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 transition-all hover:bg-slate-100/70"
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${
                  trx.type === 'IN'
                    ? 'bg-emerald-100/80 text-emerald-700'
                    : 'bg-rose-100/80 text-rose-700'
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

                <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
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
                        className="flex items-center gap-1 font-semibold text-[#B4821E] hover:underline cursor-pointer"
                      >
                        <FileText className="h-3 w-3" />
                        <span>Nota Bukti</span>
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
                    trx.type === 'IN' ? 'text-emerald-700' : 'text-slate-900'
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
                  onClick={() => onApprove(trx.id)}
                  disabled={isPending}
                  className="rounded-2xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Setujui
                </button>
              )}
            </div>
          </div>
        ))}

        {transactions.length === 0 && (
          <div className="rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-400">
            Belum ada mutasi transaksi pada pos kas yang dipilih.
          </div>
        )}
      </div>
    </div>
  );
}
