'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  MapPin,
  Clock,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import { getEventsList } from './actions';
import { CreateEventModal } from './CreateEventModal';

interface EventItem {
  id: number;
  title: string;
  description: string | null;
  location: string;
  startTime: Date;
  endTime: Date;
  status: string;
  plannedBudget: number;
  kasAllocation: number;
  externalSponsorAmount: number;
  hasSpecialDues: boolean;
  picName: string;
}

export default function EventsPage() {
  const [eventsList, setEventsList] = useState<EventItem[]>([]);
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(2026, 10, 1));
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [, startTransition] = useTransition();

  const loadData = useCallback(() => {
    startTransition(async () => {
      const res = await getEventsList();
      if (res.success && res.data) {
        setEventsList(res.data);
      }
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Frameless */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
        <div>
          <span className="rounded-full bg-[#D8AC41]/15 px-3 py-1 text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
            Divisi Acara & Humas
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            Kalender Agenda Terpadu
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Jadwal kegiatan pemuda tersinkronisasi otomatis dan siap siar ke grup WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/events/sounding"
            className="flex items-center gap-1.5 rounded-2xl bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <Megaphone className="h-4 w-4 text-[#B4821E]" />
            <span>Buat Sounding WA</span>
          </Link>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
          >
            <Plus className="h-4 w-4 text-[#D8AC41]" />
            <span>Jadwalkan Acara</span>
          </button>
        </div>
      </div>

      {/* Tampilan Kalender Agenda */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">{monthName}</h3>
            <span className="rounded-full bg-[#D8AC41]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#B4821E]">
              {eventsList.length} Agenda Aktif
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Bulan Sebelumnya"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Bulan Berikutnya"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Header Hari */}
        <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <span className="text-rose-500">Min</span>
          <span>Sen</span>
          <span>Sel</span>
          <span>Rab</span>
          <span>Kam</span>
          <span>Jum</span>
          <span className="text-amber-600">Sab</span>
        </div>

        {/* Grid Kotak Tanggal */}
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 rounded-2xl bg-slate-50/40 opacity-40" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dayEvents = eventsList.filter((e) => {
              const d = new Date(e.startTime);
              return d.getFullYear() === year && d.getMonth() === month && d.getDate() === dayNum;
            });

            const hasEvents = dayEvents.length > 0;

            return (
              <div
                key={`day-${dayNum}`}
                onClick={() => hasEvents && setSelectedEvent(dayEvents[0])}
                className={`flex h-20 flex-col justify-between rounded-2xl p-2 transition-all ${
                  hasEvents
                    ? 'cursor-pointer bg-[#D8AC41]/10 hover:bg-[#D8AC41]/20 shadow-xs'
                    : 'bg-slate-50/70 hover:bg-slate-50'
                }`}
              >
                <span
                  className={`text-xs font-bold ${
                    hasEvents ? 'text-[#B4821E]' : 'text-slate-700'
                  }`}
                >
                  {dayNum}
                </span>

                <div className="space-y-1 overflow-hidden">
                  {dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="truncate rounded-xl bg-slate-900 px-1.5 py-0.5 text-[9px] font-bold text-[#D8AC41]"
                    >
                      {evt.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rincian Agenda yang Dipilih */}
      {selectedEvent && (
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
          <div className="flex items-start justify-between">
            <div>
              <span className="rounded-full bg-[#D8AC41]/15 px-3 py-1 text-[10px] font-bold text-[#B4821E] uppercase">
                Agenda Terpilih
              </span>
              <h3 className="mt-2 text-base font-bold text-slate-900">{selectedEvent.title}</h3>
              <p className="mt-0.5 text-xs text-slate-500">{selectedEvent.description || 'Tidak ada deskripsi rincian.'}</p>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Tutup
            </button>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3 pt-4 border-t border-slate-100 text-xs text-slate-700">
            <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-3">
              <Clock className="h-4 w-4 text-[#D8AC41] shrink-0" />
              <span className="font-medium">{new Date(selectedEvent.startTime).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-3">
              <MapPin className="h-4 w-4 text-[#D8AC41] shrink-0" />
              <span className="font-medium">{selectedEvent.location}</span>
            </div>
            <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 p-3">
              <Users className="h-4 w-4 text-[#D8AC41] shrink-0" />
              <span className="font-medium">PIC: {selectedEvent.picName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Agenda Baru */}
      <CreateEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
