'use client';

import React, { useEffect, useState, use, Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Printer } from 'lucide-react';
import { Letterhead } from '@/components/letters/Letterhead';
import { getLetterDetail } from '../actions';

interface LetterDetailData {
  id: number;
  direction: string;
  letterType: string;
  letterNumber: string;
  subject: string;
  sender: string;
  recipient: string;
  letterDate: string;
  status: string;
  primarySignatoryName: string | null;
  secondarySignatoryName: string | null;
  signedAt: Date | null;
  requestedByDivision: string | null;
}

interface LetterPageProps {
  params: Promise<{ id: string }>;
}

function LetterDetailInner({ letterId }: { letterId: number }) {
  const [letter, setLetter] = useState<LetterDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLetterDetail(letterId).then((res) => {
      if (res.success && res.data) {
        setLetter(res.data);
      }
      setLoading(false);
    });
  }, [letterId]);

  if (loading) {
    return <div className="py-12 text-center text-xs text-neutral-500">Memuat berkas dokumen surat...</div>;
  }

  if (!letter) {
    return <div className="py-12 text-center text-xs text-neutral-500">Dokumen surat tidak ditemukan.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 print:hidden">
        <Link
          href="/letters"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Persuratan
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Printer className="h-4 w-4 text-[#D8AC41]" />
          Cetak Dokumen (PDF)
        </button>
      </div>

      {/* Printable Sheet View */}
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 md:p-12 shadow-sm print:m-0 print:max-w-none print:border-none print:p-0 print:shadow-none">
        {/* Kop Surat Resmi */}
        <Letterhead />

        {/* Letter Meta */}
        <div className="mt-6 flex justify-between text-xs text-slate-800">
          <div>
            <p><span className="font-semibold">Nomor:</span> {letter.letterNumber}</p>
            <p><span className="font-semibold">Perihal:</span> {letter.subject}</p>
            <p><span className="font-semibold">Lampiran:</span> -</p>
          </div>
          <div className="text-right">
            <p>Wonoboyo, {letter.letterDate}</p>
            <p className="mt-2 text-left">
              Kepada Yth.<br />
              <span className="font-semibold">{letter.recipient}</span><br />
              di Tempat
            </p>
          </div>
        </div>

        {/* Letter Body */}
        <div className="mt-8 space-y-4 text-xs leading-relaxed text-slate-800 text-justify">
          <p>Dengan hormat,</p>
          <p>
            Sehubungan dengan agenda kegiatan organisasi kepemudaan Pandawa Wanangsri, dengan ini kami sampaikan perihal{' '}
            <span className="font-semibold">{letter.subject}</span> demi kelancaran koordinasi dan program kerja bersama.
          </p>
          <p>
            Demikian surat resmi ini kami sampaikan. Atas perhatian, dukungan, serta kerja sama yang baik dari Bapak/Ibu/Saudara/i, kami ucapkan terima kasih.
          </p>
        </div>

        {/* Signatures Area */}
        <div className="mt-16 grid grid-cols-2 text-center text-xs text-slate-800">
          <div>
            <p className="font-semibold">Hormat kami,</p>
            <p className="text-slate-500">Sekretaris Organisasi</p>
            <div className="my-6">
              {letter.status === 'PUBLISHED' ? (
                <div className="inline-block rounded border border-[#D8AC41]/50 bg-[#D8AC41]/10 px-3 py-1 font-serif italic text-[#B4821E]">
                  (Tertanda Secara Sah)
                </div>
              ) : (
                <div className="text-slate-400 italic">Draf Belum Disahkan</div>
              )}
            </div>
            <p className="font-bold underline">{letter.secondarySignatoryName || 'Sekretaris'}</p>
          </div>

          <div>
            <p className="font-semibold">Mengetahui,</p>
            <p className="text-slate-500">Ketua Umum Pandawa</p>
            <div className="my-6">
              {letter.status === 'PUBLISHED' ? (
                <div className="inline-block rounded border border-[#D8AC41]/50 bg-[#D8AC41]/10 px-3 py-1 font-serif italic text-[#B4821E]">
                  (Tertanda Secara Sah)
                </div>
              ) : (
                <div className="text-slate-400 italic">Draf Belum Disahkan</div>
              )}
            </div>
            <p className="font-bold underline">{letter.primarySignatoryName || 'Ketua Umum'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LetterDetailPage({ params }: LetterPageProps) {
  const resolvedParams = use(params);
  const letterId = Number(resolvedParams.id);

  return (
    <Suspense fallback={<div className="py-12 text-center text-xs text-neutral-500">Memuat berkas dokumen...</div>}>
      <LetterDetailInner letterId={letterId} />
    </Suspense>
  );
}
