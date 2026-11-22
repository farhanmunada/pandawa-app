'use client';

import React, { useState } from 'react';
import { updateMemberAction } from './actions';
import { MemberData, divisions } from './types';
import { X, Loader2 } from 'lucide-react';

export function EditMemberModal({
  isOpen,
  member,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  member: MemberData | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(member?.userName || '');
  const [email, setEmail] = useState(member?.userEmail || '');
  const [phone, setPhone] = useState(member?.userPhone || '');
  const [positionTitle, setPositionTitle] = useState(member?.positionTitle || '');
  const [division, setDivision] = useState(member?.division || 'Anggota');
  const [status, setStatus] = useState(member?.status || 'active');
  const [memberNumber, setMemberNumber] = useState(member?.memberNumber || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !member) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await updateMemberAction({
        memberId: member.id,
        name,
        email,
        phone,
        positionTitle,
        division,
        status,
        memberNumber,
      });

      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Gagal memperbarui data.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kendala saat memperbarui.');
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
              Tata Kelola
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Ubah Data Anggota
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
            <label className="block text-xs font-semibold text-slate-800">Nama Lengkap</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800">Nomor WhatsApp</label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800">Nomor Anggota</label>
              <input
                type="text"
                value={memberNumber}
                onChange={(e) => setMemberNumber(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800">Divisi</label>
              <select
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              >
                {divisions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800">Jabatan</label>
              <input
                type="text"
                required
                value={positionTitle}
                onChange={(e) => setPositionTitle(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              >
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>
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
                <span>Perbarui Data</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
