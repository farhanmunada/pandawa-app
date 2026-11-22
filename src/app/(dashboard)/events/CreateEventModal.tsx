'use client';

import React, { useState } from 'react';
import { createEventAction } from './actions';
import { X, Loader2 } from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateEventModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateEventModalProps) {
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
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
        picUserId: 'Wwj2K1c6qWEvYDpWPqJrX3qbhMwg0Mj8',
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Gagal menyimpan agenda acara.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kendala saat menyimpan agenda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
              Divisi Acara & Humas
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Perencanaan Agenda Baru
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800">Nama Acara / Kegiatan</label>
            <input
              type="text"
              required
              placeholder="e.g. Kerja Bakti Bersih Desa Wanangsri"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800">Lokasi Acara</label>
            <input
              type="text"
              required
              placeholder="e.g. Balai Dusun Wanangsri"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800">Waktu Mulai</label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800">Waktu Selesai</label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600">Total Anggaran (Rp)</label>
              <input
                type="number"
                value={plannedBudget}
                onChange={(e) => setPlannedBudget(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600">Alokasi Kas (Rp)</label>
              <input
                type="number"
                value={kasAllocation}
                onChange={(e) => setKasAllocation(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600">Sponsor Luar (Rp)</label>
              <input
                type="number"
                value={externalSponsorAmount}
                onChange={(e) => setExternalSponsorAmount(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={hasSpecialDues}
                onChange={(e) => setHasSpecialDues(e.target.checked)}
                className="rounded border-slate-300 text-[#D8AC41] focus:ring-[#D8AC41]"
              />
              <span>Aktifkan Formulir Iuran Khusus Anggota</span>
            </label>

            {hasSpecialDues && (
              <div className="mt-3 grid grid-cols-2 gap-3 pt-3 border-t border-slate-200/60">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Besaran / Orang (Rp)</label>
                  <input
                    type="number"
                    value={targetDuesPerMember}
                    onChange={(e) => setTargetDuesPerMember(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Batas Penyetoran</label>
                  <input
                    type="date"
                    value={duesDueDate}
                    onChange={(e) => setDuesDueDate(e.target.value)}
                    className="mt-1 w-full rounded-xl bg-white px-3 py-2 text-xs text-slate-900 focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800">Uraian / Catatan</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D8AC41]" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan & Publikasikan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
