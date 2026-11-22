'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth/auth-client';
import { Lock, Mail, User, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

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

    if (password.length < 8) {
      setErrorMessage('Kata sandi harus terdiri dari minimal 8 karakter.');
      return;
    }

    startTransition(async () => {
      try {
        const { error } = await authClient.signUp.email({
          name,
          email,
          password,
        });

        if (error) {
          setErrorMessage(error.message || 'Pendaftaran tidak berhasil. Periksa kembali data Anda.');
          return;
        }

        router.push('/');
        router.refresh();
      } catch (err: unknown) {
        setErrorMessage(err instanceof Error ? err.message : 'Terjadi kendala pada sistem autentikasi.');
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/60 px-4 py-8">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Identitas Organisasi */}
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
            <span>Pendaftaran Akun</span>
          </div>
          <h2 className="mt-2 text-lg font-bold tracking-tight text-slate-900">
            Daftar Pengurus Baru
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Akses sistem administrasi dan operasional terpadu
          </p>
        </div>

        {/* Notifikasi Error */}
        {errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Pendaftaran dengan Background Highlight */}
        <form onSubmit={handleSignUp} className="mt-5 space-y-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <label className="block text-[11px] font-semibold text-slate-700">
              Nama Lengkap
            </label>
            <div className="relative mt-1">
              <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                required
                placeholder="Nama sesuai identitas"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <label className="block text-[11px] font-semibold text-slate-700">
              Alamat Email
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

          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <label className="block text-[11px] font-semibold text-slate-700">
              Kata Sandi
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
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
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#D8AC41]" />
                <span>Mendaftarkan Akun...</span>
              </>
            ) : (
              <>
                <span>Daftar Sekarang</span>
                <ArrowRight className="h-3.5 w-3.5 text-[#D8AC41]" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigasi Masuk */}
        <div className="mt-5 border-t border-slate-100 pt-4 text-center">
          <p className="text-xs text-slate-500">
            Sudah memiliki akun terdaftar?{' '}
            <Link href="/sign-in" className="font-semibold text-[#B4821E] hover:underline cursor-pointer">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
