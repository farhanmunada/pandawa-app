import React from 'react';
import Link from 'next/link';
import {
  Wallet,
  Calendar,
  Package,
  FileText,
  ShieldAlert,
  ArrowRight,
  Clock,
  MapPin,
} from 'lucide-react';
import {
  formatIDR,
  formatDate,
  WalletSummaryItem,
  EventSummaryItem,
  AssetSummaryItem,
  LetterSummaryItem,
  IncidentSummaryItem,
} from '@/lib/dashboard/queries';

export function WalletSummaryCard({
  wallets,
  totalKas,
}: {
  wallets: WalletSummaryItem[];
  totalKas: number;
}) {
  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-[#D8AC41] shadow-xs">
            <Wallet className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Ringkasan Pos Kas</h3>
            <p className="text-[11px] text-slate-400">Total {formatIDR(totalKas)}</p>
          </div>
        </div>
        <Link
          href="/finance"
          className="flex items-center gap-1 text-xs font-semibold text-[#B4821E] hover:underline cursor-pointer"
        >
          <span>Buku Kas</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-5 space-y-3">
        {wallets.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">Belum ada pos dompet terdaftar.</p>
        ) : (
          wallets.map((w) => {
            const percentage = totalKas > 0 ? Math.round((w.currentBalance / totalKas) * 100) : 0;
            return (
              <div key={w.id} className="rounded-2xl bg-slate-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">{w.name}</span>
                  <span className="text-xs font-bold text-slate-900">{formatIDR(w.currentBalance)}</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#D8AC41]"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-400 shrink-0">{percentage}%</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function EventSummaryCard({ events }: { events: EventSummaryItem[] }) {
  const activeEvent = events[0];

  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-[#D8AC41] shadow-xs">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Agenda Terdekat</h3>
            <p className="text-[11px] text-slate-400">Kalender Kegiatan Pemuda</p>
          </div>
        </div>
        <Link
          href="/events"
          className="flex items-center gap-1 text-xs font-semibold text-[#B4821E] hover:underline cursor-pointer"
        >
          <span>Kalender</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-5">
        {!activeEvent ? (
          <div className="rounded-2xl bg-slate-50 p-6 text-center">
            <p className="text-xs font-semibold text-slate-700">Belum ada agenda terdekat</p>
            <p className="text-[11px] text-slate-400 mt-1">Divisi Acara dan Humas dapat merencanakan kegiatan baru</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="inline-block rounded-full bg-[#D8AC41]/15 px-2.5 py-0.5 text-[9px] font-bold text-[#B4821E] uppercase">
                  {activeEvent.status}
                </span>
                <h4 className="mt-1.5 text-sm font-bold text-slate-900">{activeEvent.title}</h4>
              </div>
              <div className="rounded-2xl bg-white px-3 py-1.5 shadow-2xs text-center shrink-0">
                <span className="block text-[10px] font-bold text-slate-400 uppercase">Jadwal</span>
                <span className="block text-xs font-bold text-[#B4821E]">
                  {formatDate(new Date(activeEvent.startTime))}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{activeEvent.location}</span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="truncate">Alokasi: {formatIDR(activeEvent.kasAllocation)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AssetSummaryCard({ assets }: { assets: AssetSummaryItem[] }) {
  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-[#D8AC41] shadow-xs">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Kesiapan Inventaris</h3>
            <p className="text-[11px] text-slate-400">Sirkulasi & Sewa Aset</p>
          </div>
        </div>
        <Link
          href="/inventory"
          className="flex items-center gap-1 text-xs font-semibold text-[#B4821E] hover:underline cursor-pointer"
        >
          <span>Katalog</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-5 space-y-2.5">
        {assets.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">Belum ada aset terdaftar.</p>
        ) : (
          assets.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div className="min-w-0 flex-1 pr-3">
                <p className="text-xs font-bold text-slate-800 truncate">{a.name}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Tarif Warga: {formatIDR(a.internalRatePerDay)} / hari
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="inline-block rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                  {a.availableQuantity} Unit Siap
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function LetterSummaryCard({ letters }: { letters: LetterSummaryItem[] }) {
  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-[#D8AC41] shadow-xs">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Persuratan Resmi</h3>
            <p className="text-[11px] text-slate-400">Arsip & Draf Keluar</p>
          </div>
        </div>
        <Link
          href="/letters"
          className="flex items-center gap-1 text-xs font-semibold text-[#B4821E] hover:underline cursor-pointer"
        >
          <span>Persuratan</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-5 space-y-2.5">
        {letters.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">Belum ada surat diterbitkan.</p>
        ) : (
          letters.map((l) => (
            <div key={l.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div className="min-w-0 flex-1 pr-3">
                <span className="text-[10px] font-bold text-[#B4821E] uppercase">{l.letterNumber}</span>
                <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">{l.subject}</p>
              </div>
              <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-[9px] font-bold text-slate-700 shrink-0">
                {l.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function IncidentSummaryCard({ incidents }: { incidents: IncidentSummaryItem[] }) {
  return (
    <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-[#D8AC41] shadow-xs">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Laporan & Keamanan</h3>
            <p className="text-[11px] text-slate-400">Pengaduan Warga & Penanganan</p>
          </div>
        </div>
        <Link
          href="/incidents"
          className="flex items-center gap-1 text-xs font-semibold text-[#B4821E] hover:underline cursor-pointer"
        >
          <span>Laporan</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-5 space-y-2.5">
        {incidents.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-center">
            <p className="text-xs font-semibold text-slate-700">Kondisi Lingkungan Aman</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Tidak ada laporan insiden darurat aktif</p>
          </div>
        ) : (
          incidents.map((i) => (
            <div key={i.id} className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
              <div className="min-w-0 flex-1 pr-3">
                <span className="text-[10px] font-bold text-slate-500 uppercase">{i.category}</span>
                <p className="text-xs font-semibold text-slate-800 truncate mt-0.5">{i.title}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold shrink-0 ${
                  i.urgency === 'HIGH' || i.urgency === 'EMERGENCY'
                    ? 'bg-rose-50 text-rose-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {i.urgency}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
