import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA] px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 sm:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.04)] text-center">
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

        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-[#D8AC41]/10 text-[#B4821E]">
          <ShieldCheck className="h-5 w-5" />
        </div>

        <h1 className="text-lg font-bold tracking-tight text-slate-900">
          Sistem Akses Tertutup
        </h1>
        <p className="mt-2 text-xs text-slate-500 leading-relaxed">
          Pendaftaran akun mandiri dinonaktifkan. Seluruh kode unik anggota dan hak akses pengguna dikelola langsung oleh Wakil Ketua Organisasi.
        </p>

        <div className="mt-6">
          <Link
            href="/sign-in"
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 transition-all cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-[#D8AC41]" />
            <span>Kembali ke Halaman Masuk</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
