'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/auth-client';
import { Lock, Mail, User, ArrowRight, Loader2 } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    startTransition(async () => {
      try {
        const { error } = await authClient.signUp.email({
          name,
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message || 'Pendaftaran gagal. Silakan coba lagi.');
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
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-8">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-3 h-12 w-12 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-xs">
            <Image
              src="/logo.png"
              alt="Logo Pandawa"
              width={48}
              height={48}
              className="h-full w-full object-contain"
              priority
            />
          </div>

          <span className="inline-block rounded-full border border-[#D8AC41]/40 bg-[#D8AC41]/10 px-2.5 py-0.5 text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
            Pandawa App
          </span>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900">
            Daftar Akun Baru
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Sistem Informasi Manajemen Organisasi
          </p>
        </div>

        {errorMessage && (
          <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSignUp} className="mt-5 space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Nama Lengkap
            </label>
            <div className="relative mt-1">
              <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Nama Anda"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Alamat Email
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
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

          <div>
            <label className="block text-[11px] font-semibold text-slate-700">
              Kata Sandi
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="password"
                required
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#D8AC41]" />
                <span>Mendaftarkan...</span>
              </>
            ) : (
              <>
                <span>Daftar Sekarang</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#D8AC41]" />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-500">
          Sudah memiliki akun?{' '}
          <Link href="/sign-in" className="font-semibold text-[#B4821E] hover:underline cursor-pointer">
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
