'use client';

import React, { useState, useTransition, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { requestPasswordResetAction, resetPasswordWithTokenAction } from '../actions';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get('token') || '';

  const [step, setStep] = useState<'REQUEST' | 'RESET'>(initialToken ? 'RESET' : 'REQUEST');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRequestToken = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    startTransition(async () => {
      const res = await requestPasswordResetAction(email);
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
      setStatusMessage({ type: 'error', text: 'Konfirmasi kata sandi tidak cocok.' });
      return;
    }

    startTransition(async () => {
      const res = await resetPasswordWithTokenAction({
        email,
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
    <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Header Identitas */}
      <div className="text-center">
        <div className="mx-auto mb-3 h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
          <Image
            src="/favicon.png"
            alt="Logo Pandawa"
            width={48}
            height={48}
            className="h-full w-full object-contain"
            priority
          />
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#D8AC41]/40 bg-[#D8AC41]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
          <span>Pemulihan Akun</span>
        </div>
        <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900">
          Setel Ulang Kata Sandi
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          {step === 'REQUEST'
            ? 'Masukkan email terdaftar untuk menerima token verifikasi.'
            : 'Buat kata sandi baru untuk mengamankan akun Anda.'}
        </p>
      </div>

      {/* Highlight Pesan Notifikasi */}
      {statusMessage && (
        <div
          className={`mt-4 rounded-xl border p-3 text-xs ${
            statusMessage.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Step 1: Minta Token */}
      {step === 'REQUEST' ? (
        <form onSubmit={handleRequestToken} className="mt-5 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <label className="block text-[11px] font-semibold text-slate-700">
              Alamat Email Terdaftar
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#D8AC41]" />
                <span>Memeriksa Email...</span>
              </>
            ) : (
              <>
                <span>Kirim Token Setel Ulang</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#D8AC41]" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* Step 2: Input Token & Password Baru */
        <form onSubmit={handleResetPassword} className="mt-5 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs text-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700">
                Token Verifikasi
              </label>
              <div className="relative mt-1">
                <KeyRound className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Masukkan token verifikasi"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 font-mono focus:border-[#D8AC41] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700">
                Kata Sandi Baru
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-[#D8AC41] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Ulangi kata sandi baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-[#D8AC41] outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#D8AC41]" />
                <span>Memperbarui Sandi...</span>
              </>
            ) : (
              <>
                <span>Simpan Kata Sandi Baru</span>
                <CheckCircle2 className="h-3.5 w-3.5 text-[#D8AC41]" />
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStep('REQUEST')}
            className="w-full text-center text-[11px] font-medium text-slate-500 hover:text-slate-800 cursor-pointer"
          >
            Ubah email atau minta token baru
          </button>
        </form>
      )}

      {/* Footer Navigasi */}
      <div className="mt-5 border-t border-slate-100 pt-4 text-center">
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50/60 px-4 py-8">
      <Suspense fallback={<div className="text-xs text-slate-500">Memuat formulir...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
