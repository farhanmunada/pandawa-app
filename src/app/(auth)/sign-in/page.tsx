'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/auth-client';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    startTransition(async () => {
      try {
        const { error } = await authClient.signIn.email({
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message || 'Email atau kata sandi tidak cocok.');
          return;
        }

        router.push('/');
        router.refresh();
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan sistem.');
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 py-8 dark:bg-neutral-950">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
        <div className="text-center">
          <span className="inline-block rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-600 dark:bg-blue-950 dark:text-blue-400 uppercase tracking-wider">
            Pandawa App
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Masuk ke Akun
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Sistem Informasi Manajemen Organisasi Kepemudaan
          </p>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/60 dark:text-red-400">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSignIn} className="mt-5 space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
              Alamat Email
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="email"
                required
                placeholder="email@organisasi.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 py-2 pl-9 pr-3 text-xs text-neutral-900 focus:border-blue-500 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
              Kata Sandi
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="password"
                required
                placeholder="Kata sandi akun Anda"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-neutral-300 py-2 pl-9 pr-3 text-xs text-neutral-900 focus:border-blue-500 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-neutral-500">
          Belum memiliki akun?{' '}
          <Link href="/sign-up" className="font-semibold text-blue-600 hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
