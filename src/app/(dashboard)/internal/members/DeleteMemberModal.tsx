'use client';

import React, { useState } from 'react';
import { deleteMemberAction } from './actions';
import { MemberData } from './types';
import { Loader2, AlertTriangle } from 'lucide-react';

export function DeleteMemberModal({
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !member) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMsg('');

    try {
      const res = await deleteMemberAction(member.id);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Gagal menghapus data.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kendala saat menghapus.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
        <div className="flex items-center gap-3 text-rose-600">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Hapus Anggota</h3>
            <p className="text-[11px] text-slate-500">Konfirmasi tindakan</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-2xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <p className="mt-4 text-xs text-slate-600 leading-relaxed">
          Apakah Anda yakin ingin menghapus keanggotaan{' '}
          <span className="font-bold text-slate-900">{member.userName}</span>{' '}
          ({member.positionTitle} - {member.division}) dari sistem?
        </p>

        <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 rounded-2xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition cursor-pointer"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <span>Ya, Hapus</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
