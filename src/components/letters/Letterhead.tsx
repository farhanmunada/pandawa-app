import React from 'react';
import Image from 'next/image';

interface LetterheadProps {
  className?: string;
}

export function Letterhead({ className = '' }: LetterheadProps) {
  return (
    <div className={`w-full bg-white text-neutral-900 ${className}`}>
      <div className="flex items-center gap-5 pb-3">
        {/* Logo Organisasi dari /public/logo.png */}
        <div className="relative h-20 w-20 flex-shrink-0">
          <Image
            src="/logo.png"
            alt="Logo Organisasi Kepemudaan Pandawa"
            width={80}
            height={80}
            className="h-full w-full object-contain"
            priority
          />
        </div>

        {/* Teks Identitas Resmi Kop Surat */}
        <div className="flex-1 text-center">
          <h2 className="text-base font-bold tracking-wider uppercase text-neutral-800">
            ORGANISASI KEPEMUDAAN
          </h2>
          <h1 className="text-xl font-extrabold tracking-widest uppercase text-neutral-950">
            PANDAWA
          </h1>
          <p className="mt-1 text-xs text-neutral-600 leading-snug">
            Wanangsri, Tening, Wonoboyo, Temanggung Regency, Central Java 56266
          </p>
          <p className="text-[11px] text-neutral-600">
            Email: <span className="font-medium text-neutral-800">pandawaofficial02@gmail.com</span>
          </p>
        </div>
      </div>

      {/* Garis Ganda Resmi Kop Surat (Double Border Rule) */}
      <div className="border-t-2 border-b border-black py-0.5" />
    </div>
  );
}
