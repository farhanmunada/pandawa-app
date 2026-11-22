'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  Wallet,
  Plus,
  CheckCircle2,
} from 'lucide-react';
import { getFinanceOverview, approveTransactionAction } from './actions';
import { TransactionModal } from './TransactionModal';
import { SelapananTab } from './SelapananTab';
import { TransactionsList, TransactionItem } from './TransactionsList';

interface WalletItem {
  id: number;
  name: string;
  description: string | null;
  currentBalance: number;
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
  const isFinance = userRoles.some((r) => ['super_admin', 'bendahara'].includes(r));
  const [mainTab, setMainTab] = useState<'WALLETS' | 'SELAPANAN'>('WALLETS');

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
            Arus Kas & Kas Selapanan
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Pengelolaan buku kas operasional, persetujuan belanja, dan setoran iuran rutin
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

      {/* Tab Switcher: Buku Kas vs Kas Selapanan */}
      <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.03)] w-fit">
        <button
          type="button"
          onClick={() => setMainTab('WALLETS')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
            mainTab === 'WALLETS'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Wallet className="h-3.5 w-3.5" />
          <span>Buku Kas & Transaksi</span>
        </button>
        <button
          type="button"
          onClick={() => setMainTab('SELAPANAN')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition cursor-pointer ${
            mainTab === 'SELAPANAN'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <CheckCircle2 className="h-3.5 w-3.5 text-[#D8AC41]" />
          <span>Kas Selapanan Wajib (Rp 5.000)</span>
        </button>
      </div>

      {mainTab === 'SELAPANAN' ? (
        <SelapananTab
          isLeaderOrFinance={isLeader || isFinance}
          onRefreshParent={loadData}
        />
      ) : (
        <>
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
                  className={`group relative rounded-3xl p-5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-[0_16px_32px_rgba(0,0,0,0.12)]'
                      : 'bg-white text-slate-900 shadow-[0_12px_40px_rgba(0,0,0,0.03)] hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        isSelected ? 'text-[#D8AC41]' : 'text-slate-400'
                      }`}
                    >
                      Pos Dompet
                    </span>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-2xl transition-colors ${
                        isSelected
                          ? 'bg-white/10 text-[#D8AC41]'
                          : 'bg-slate-50 text-slate-400 group-hover:text-slate-600'
                      }`}
                    >
                      <Wallet className="h-4 w-4" />
                    </div>
                  </div>

                  <h4 className="mt-4 text-sm font-bold">{w.name}</h4>
                  <p
                    className={`mt-1 text-xs line-clamp-1 ${
                      isSelected ? 'text-slate-300' : 'text-slate-400'
                    }`}
                  >
                    {w.description || 'Dompet operasional pemuda'}
                  </p>

                  <div className="mt-4 border-t border-slate-100/10 pt-3">
                    <span
                      className={`text-lg font-bold tracking-tight ${
                        isSelected ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      Rp {Number(w.currentBalance).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Riwayat Mutasi Transaksi */}
          <TransactionsList
            transactions={filteredTransactions}
            selectedWalletId={selectedWalletId}
            onClearFilter={() => setSelectedWalletId('ALL')}
            isLeader={isLeader}
            isPending={isPending}
            onApprove={handleApprove}
          />
        </>
      )}

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
