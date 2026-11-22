'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { requestPasswordResetAction, resetPasswordWithTokenAction } from '../actions';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get('token') || '';

  const [step, setStep] = useState<'REQUEST' | 'RESET'>(initialToken ? 'RESET' : 'REQUEST');
  const [identifier, setIdentifier] = useState('');
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRequestToken = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    startTransition(async () => {
      const res = await requestPasswordResetAction(identifier);
      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        if (res.devToken) {
          setToken(res.devToken);
        }
        setStep('RESET');
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    });
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Konfirmasi kata sandi baru tidak cocok.' });
      return;
    }

    startTransition(async () => {
      const res = await resetPasswordWithTokenAction({
        identifier,
        token,
        newPassword,
      });

      if (res.success) {
        setStatusMessage({ type: 'success', text: res.message });
        setTimeout(() => {
          router.push('/sign-in');
        }, 1500);
      } else {
        setStatusMessage({ type: 'error', text: res.message });
      }
    });
  };

  return (
    <div className="w-full max-w-sm rounded-3xl bg-white p-8 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
      {/* Header Identitas */}
      <div className="text-center">
        <div className="mx-auto mb-4 h-14 w-14 overflow-hidden rounded-2xl bg-slate-50 p-1.5 shadow-2xs">
          <Image
            src="/favicon.png"
            alt="Logo Pandawa"
            width={56}
            height={56}
            className="h-full w-full object-contain"
            priority
          />
        </div>

        <span className="inline-block rounded-full bg-[#D8AC41]/15 px-3 py-1 text-[10px] font-bold tracking-wider text-[#B4821E] uppercase">
          Pemulihan Akses
        </span>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
          Setel Ulang Sandi
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          {step === 'REQUEST'
            ? 'Masukkan nomor anggota Anda untuk verifikasi identitas'
            : 'Tentukan kata sandi baru untuk akun Anda'}
        </p>
      </div>

      {/* Notifikasi Status */}
      {statusMessage && (
        <div
          className={`mt-5 flex items-center gap-2 rounded-2xl px-4 py-3 text-xs ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50/80 text-emerald-800'
              : 'bg-rose-50/80 text-rose-800'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Formulir Permintaan Token */}
      {step === 'REQUEST' ? (
        <form onSubmit={handleRequestToken} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800">
              Nomor Anggota / Kode Akses
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 0001, 1001, atau email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#D8AC41]" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Lanjutkan</span>
                <ArrowRight className="h-4 w-4 text-[#D8AC41]" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* Formulir Input Password Baru */
        <form onSubmit={handleResetPassword} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800">
              Token Verifikasi
            </label>
            <input
              type="text"
              required
              placeholder="Masukkan token verifikasi"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-3 font-mono text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800">
              Kata Sandi Baru
            </label>
            <input
              type="password"
              required
              placeholder="Minimal 8 karakter"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800">
              Konfirmasi Kata Sandi Baru
            </label>
            <input
              type="password"
              required
              placeholder="Ulangi kata sandi baru"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#D8AC41]" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <span>Simpan Sandi Baru</span>
                <CheckCircle2 className="h-4 w-4 text-[#D8AC41]" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep('REQUEST')}
            className="w-full text-center text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            Ubah nomor anggota
          </button>
        </form>
      )}

      {/* Navigasi Kembali */}
      <div className="mt-8 text-center">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Kembali ke Halaman Masuk</span>
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4 py-12">
      <Suspense fallback={<div className="text-xs text-slate-400">Memuat formulir...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
