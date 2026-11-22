'use client';

import React, { useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { loginWithMemberCodeAction } from '../actions';
import { ArrowRight, Loader2, AlertCircle } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    startTransition(async () => {
      try {
        const res = await loginWithMemberCodeAction(identifier, password);
        if (res.success) {
          router.push('/');
          router.refresh();
        } else {
          setErrorMessage(res.message || 'Nomor anggota atau kata sandi tidak cocok.');
        }
      } catch (err: unknown) {
        const errorText = err instanceof Error ? err.message : String(err);
        if (
          errorText.includes('failed-to-find-server-action') ||
          errorText.includes('was not found on the server') ||
          errorText.includes('Server Action')
        ) {
          setErrorMessage(
            'Sesi halaman kedaluwarsa karena pembaruan sistem. Silakan muat ulang halaman (tekan F5) lalu masuk kembali.'
          );
        } else {
          setErrorMessage('Terjadi kendala koneksi saat menghubungi server. Silakan muat ulang halaman dan coba lagi.');
        }
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4 py-12">
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
            Akses Internal
          </span>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            Sistem Pandawa
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Masuk menggunakan nomor akses anggota Anda
          </p>
        </div>

        {/* Notifikasi Kesalahan yang Ditangani dengan Baik */}
        {errorMessage && (
          <div className="mt-5 flex items-center gap-2.5 rounded-2xl bg-rose-50/80 px-4 py-3 text-xs text-rose-700 leading-relaxed">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulir Modern Frameless */}
        <form onSubmit={handleSignIn} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800">
              Nomor Anggota / Kode Akses
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 0001, 0002, 1001"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-800">
                Kata Sandi
              </label>
              <Link
                href="/reset-password"
                className="text-xs font-medium text-[#B4821E] hover:underline cursor-pointer"
              >
                Lupa Sandi?
              </Link>
            </div>
            <input
              type="password"
              required
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-[#D8AC41]" />
                <span>Memverifikasi...</span>
              </>
            ) : (
              <>
                <span>Masuk Sekarang</span>
                <ArrowRight className="h-4 w-4 text-[#D8AC41]" />
              </>
            )}
          </button>
        </form>

        {/* Petunjuk Kredensial Uji Akses */}
        <div className="mt-6 rounded-2xl bg-slate-50/70 p-3.5 text-center">
          <p className="text-[11px] font-semibold text-slate-700">
            Akses Uji Demo:
          </p>
          <p className="mt-0.5 text-[10px] text-slate-500">
            Nomor: <span className="font-mono font-bold text-slate-800">0001</span> (Ketua) atau <span className="font-mono font-bold text-slate-800">0002</span> (Wakil)
          </p>
          <p className="text-[10px] text-slate-500">
            Kata Sandi: <span className="font-mono font-bold text-[#B4821E]">1234</span>
          </p>
        </div>

        {/* Catatan Hak Kelola Wakil Ketua */}
        <div className="mt-4 text-center">
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Akun baru diterbitkan langsung oleh Wakil Ketua Organisasi.
          </p>
        </div>
      </div>
    </div>
  );
}
