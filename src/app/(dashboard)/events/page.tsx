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
import { getEventsList, createEventAction } from './actions';

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
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(2026, 10, 1)); // November 2026
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startTime, setStartTime] = useState('2026-11-28T08:00');
  const [endTime, setEndTime] = useState('2026-11-28T16:00');
  const [plannedBudget, setPlannedBudget] = useState('2500000');
  const [kasAllocation, setKasAllocation] = useState('1500000');
  const [externalSponsorAmount, setExternalSponsorAmount] = useState('500000');
  const [hasSpecialDues, setHasSpecialDues] = useState(false);
  const [targetDuesPerMember, setTargetDuesPerMember] = useState('25000');
  const [duesDueDate, setDuesDueDate] = useState('2026-11-27');

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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createEventAction({
        title,
        description,
        location,
        startTime,
        endTime,
        plannedBudget: Number(plannedBudget),
        kasAllocation: Number(kasAllocation),
        externalSponsorAmount: Number(externalSponsorAmount),
        hasSpecialDues,
        targetDuesPerMember: hasSpecialDues ? Number(targetDuesPerMember) : undefined,
        duesDueDate: hasSpecialDues ? duesDueDate : undefined,
        picUserId: 'Wwj2K1c6qWEvYDpWPqJrX3qbhMwg0Mj8', // Demo User
      });

      if (res.success) {
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        loadData();
      } else {
        alert(res.message);
      }
    });
  };

  // Kalender Grid Calculation
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const monthName = currentMonthDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const prevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-4">
        <div>
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Divisi Humas & Divisi Acara
          </span>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Kalender Agenda Terpadu
          </h2>
          <p className="text-xs text-neutral-500">
            Agenda tersinkronisasi otomatis ke dashboard seluruh anggota dan pembuat sounding WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/events/sounding"
            className="inline-flex items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-800 shadow-xs hover:bg-neutral-50"
          >
            <Megaphone className="h-4 w-4" />
            <span>Pesan Sounding</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800"
          >
            <Plus className="h-4 w-4" />
            <span>Buat Agenda Baru</span>
          </button>
        </div>
      </div>

      {/* Kontrol Bulan Kalender */}
      <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-xs">
        <h3 className="text-sm font-bold text-neutral-900 capitalize">{monthName}</h3>
        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-100"
            aria-label="Bulan sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={nextMonth}
            className="rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-100"
            aria-label="Bulan berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Kalender Besar (Big Calendar View) */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs">
        {/* Nama Hari */}
        <div className="grid grid-cols-7 border-b border-neutral-200 pb-2 text-center text-xs font-semibold text-neutral-500">
          <span>Min</span>
          <span>Sen</span>
          <span>Sel</span>
          <span>Rab</span>
          <span>Kam</span>
          <span>Jum</span>
          <span>Sab</span>
        </div>

        {/* Kotak Tanggal */}
        <div className="grid grid-cols-7 gap-1 pt-2">
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-20 rounded-lg bg-neutral-50/50 p-1" />
          ))}

          {daysArray.map((day) => {
            const dayEvents = eventsList.filter((e) => {
              const d = new Date(e.startTime);
              return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
            });

            return (
              <div
                key={`day-${day}`}
                onClick={() => {
                  if (dayEvents.length > 0) setSelectedEvent(dayEvents[0]);
                }}
                className={`group flex h-20 flex-col justify-between rounded-lg border p-1.5 transition ${
                  dayEvents.length > 0
                    ? 'cursor-pointer border-blue-200 bg-blue-50/40 hover:border-blue-500'
                    : 'border-neutral-100 bg-white hover:border-neutral-200'
                }`}
              >
                <span className="text-[11px] font-bold text-neutral-700">{day}</span>

                <div className="space-y-0.5">
                  {dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="truncate rounded-sm bg-neutral-900 px-1 py-0.5 text-[9px] font-semibold text-white"
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
        <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="rounded-sm bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-600">
                Agenda Terpilih
              </span>
              <h3 className="mt-1 text-base font-bold text-neutral-900">{selectedEvent.title}</h3>
              <p className="mt-1 text-xs text-neutral-500">{selectedEvent.description || 'Tidak ada deskripsi.'}</p>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-xs text-neutral-400 hover:text-neutral-700"
            >
              Tutup
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3 border-t border-neutral-100 pt-3 text-xs text-neutral-700">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-neutral-400" />
              <span>{new Date(selectedEvent.startTime).toLocaleString('id-ID')}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-neutral-400" />
              <span>{selectedEvent.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-neutral-400" />
              <span>PIC: {selectedEvent.picName}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Buat Agenda Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900">Perencanaan Agenda Kegiatan Baru</h3>

            <form onSubmit={handleCreateEvent} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700">Nama Agenda / Kegiatan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kerja Bakti Akbar & Makrab Pemuda"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700">Lokasi Kegiatan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Balai Pertemuan Wanangsri"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700">Waktu Mulai</label>
                  <input
                    type="datetime-local"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700">Waktu Selesai</label>
                  <input
                    type="datetime-local"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700">RAB Total (Rp)</label>
                  <input
                    type="number"
                    value={plannedBudget}
                    onChange={(e) => setPlannedBudget(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700">Alokasi Kas (Rp)</label>
                  <input
                    type="number"
                    value={kasAllocation}
                    onChange={(e) => setKasAllocation(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700">Dana Luar/Sponsor</label>
                  <input
                    type="number"
                    value={externalSponsorAmount}
                    onChange={(e) => setExternalSponsorAmount(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Opsi Iuran Khusus Acara */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-900">
                  <input
                    type="checkbox"
                    checked={hasSpecialDues}
                    onChange={(e) => setHasSpecialDues(e.target.checked)}
                    className="rounded border-neutral-300"
                  />
                  <span>Aktifkan Mekanisme Iuran Khusus Anggota untuk Acara Ini</span>
                </label>

                {hasSpecialDues && (
                  <div className="mt-3 grid grid-cols-2 gap-2 pt-2 border-t border-neutral-200">
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-600">
                        Besaran Iuran / Orang (Rp)
                      </label>
                      <input
                        type="number"
                        value={targetDuesPerMember}
                        onChange={(e) => setTargetDuesPerMember(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-neutral-600">
                        Batas Penyetoran Iuran
                      </label>
                      <input
                        type="date"
                        value={duesDueDate}
                        onChange={(e) => setDuesDueDate(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-xs text-neutral-900 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700">Uraian / Catatan</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
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
                  {isPending ? 'Menyimpan...' : 'Simpan & Publikasikan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
