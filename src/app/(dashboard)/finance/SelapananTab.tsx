'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Search,
  Check,
  TrendingUp,
} from 'lucide-react';
import {
  getSelapananOverviewAction,
  recordSelapananPaymentAction,
} from './dues-actions';

interface MemberDuesItem {
  memberId: number;
  memberNumber: string | null;
  name: string;
  phone: string | null;
  division: string | null;
  positionTitle: string | null;
  hasPaid: boolean;
  paymentDate: string | null;
  amount: number;
}

interface SelapananTabProps {
  isLeaderOrFinance: boolean;
  onRefreshParent?: () => void;
}

export function SelapananTab({ isLeaderOrFinance, onRefreshParent }: SelapananTabProps) {
  const [data, setData] = useState<{
    totalMembers: number;
    paidCount: number;
    unpaidCount: number;
    totalCollected: number;
    percentage: number;
    members: MemberDuesItem[];
  }>({
    totalMembers: 0,
    paidCount: 0,
    unpaidCount: 0,
    totalCollected: 0,
    percentage: 0,
    members: [],
  });

  const now = new Date();
  const defaultLabel = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [periodLabel, setPeriodLabel] = useState(defaultLabel);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNPAID' | 'PAID'>('ALL');
  const [isPending, startTransition] = useTransition();
  const [actionMsg, setActionMsg] = useState<{ text: string; isError: boolean } | null>(null);

  const loadData = useCallback(() => {
    startTransition(async () => {
      const res = await getSelapananOverviewAction(periodLabel);
      if (res.success && res.data) {
        setData(res.data);
      }
    });
  }, [periodLabel]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePay = (memberId: number) => {
    setActionMsg(null);
    startTransition(async () => {
      const res = await recordSelapananPaymentAction({
        memberId,
        periodLabel,
      });

      if (res.success) {
        setActionMsg({ text: res.message || 'Pembayaran berhasil.', isError: false });
        loadData();
        if (onRefreshParent) onRefreshParent();
      } else {
        setActionMsg({ text: res.message || 'Gagal mencatat.', isError: true });
      }
    });
  };

  const filteredMembers = data.members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.memberNumber || '').toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (activeFilter === 'PAID') return m.hasPaid;
    if (activeFilter === 'UNPAID') return !m.hasPaid;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Kartu Ringkasan Metrik Kas Selapanan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Terhimpun
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">
            Rp {data.totalCollected.toLocaleString('id-ID')}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-400">Kas Utama Organisasi</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Persentase Tertagih
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#D8AC41]/15 text-[#B4821E]">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-[#B4821E]">{data.percentage}%</div>
          <p className="mt-0.5 text-[11px] text-slate-400">
            {data.paidCount} dari {data.totalMembers} Anggota
          </p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Sudah Lunas
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-slate-900">{data.paidCount}</div>
          <p className="mt-0.5 text-[11px] text-slate-400">Rp 5.000 / orang</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Belum Menyetor
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
              <Clock className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-2 text-xl font-bold text-rose-600">{data.unpaidCount}</div>
          <p className="mt-0.5 text-[11px] text-slate-400">
            Tunggakan: Rp {(data.unpaidCount * 5000).toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {actionMsg && (
        <div
          className={`rounded-2xl p-4 text-xs font-semibold ${
            actionMsg.isError
              ? 'bg-rose-50 text-rose-700'
              : 'bg-emerald-50 text-emerald-800'
          }`}
        >
          {actionMsg.text}
        </div>
      )}

      {/* Kontrol Filter & Pencarian */}
      <div className="rounded-3xl bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-700">Periode:</label>
            <input
              type="month"
              value={periodLabel}
              onChange={(e) => setPeriodLabel(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-900 focus:outline-hidden focus:border-[#D8AC41]"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nomor/nama anggota..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-56 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:border-[#D8AC41]"
              />
            </div>

            <div className="flex items-center rounded-xl bg-slate-100 p-0.5 text-xs">
              {(['ALL', 'UNPAID', 'PAID'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                    activeFilter === filter
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {filter === 'ALL' ? 'Semua' : filter === 'UNPAID' ? 'Belum' : 'Lunas'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tabel / Daftar Anggota */}
        <div className="space-y-2.5 pt-2">
          {filteredMembers.map((m) => (
            <div
              key={m.memberId}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3.5 transition hover:bg-slate-100/70"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-xs font-bold text-slate-900 shadow-2xs">
                  {m.memberNumber}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{m.name}</span>
                    {m.division && (
                      <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-semibold text-slate-500">
                        Sie {m.division}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {m.positionTitle || 'Anggota'} {m.phone ? `• ${m.phone}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                {m.hasPaid ? (
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                    <Check className="h-3 w-3" />
                    <span>Lunas (Rp 5.000)</span>
                    {m.paymentDate && (
                      <span className="text-[10px] text-emerald-600 font-normal">
                        • {m.paymentDate}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                      Belum Setor
                    </span>
                    {isLeaderOrFinance && (
                      <button
                        type="button"
                        onClick={() => handlePay(m.memberId)}
                        disabled={isPending}
                        className="rounded-xl bg-slate-900 px-3 py-1 text-xs font-semibold text-white hover:bg-slate-800 transition cursor-pointer disabled:opacity-50"
                      >
                        1-Klik Lunas
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {filteredMembers.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-400">
              Tidak ada data anggota yang sesuai dengan penyaringan.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
