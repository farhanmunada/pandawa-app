'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Check, MessageSquare } from 'lucide-react';
import { getEventsList, getEventSoundingData } from '../actions';

interface EventOption {
  id: number;
  title: string;
}

export default function SoundingBroadcastPage() {
  const [eventsList, setEventsList] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [soundingText, setSoundingText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getEventsList().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setEventsList(res.data);
        setSelectedEventId(String(res.data[0].id));
      }
    });
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      startTransition(async () => {
        const res = await getEventSoundingData(Number(selectedEventId));
        if (res.success && res.data) {
          setSoundingText(res.data.soundingText);
        }
      });
    }
  }, [selectedEventId]);

  const handleCopy = () => {
    if (soundingText) {
      navigator.clipboard.writeText(soundingText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(soundingText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Kalender Agenda</span>
        </Link>
      </div>

      <div>
        <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
          Divisi Humas
        </span>
        <h2 className="text-xl font-bold tracking-tight text-neutral-900">
          Generator Pesan Sounding WhatsApp
        </h2>
        <p className="text-xs text-neutral-500">
          Memformat pesan siaran resmi kegiatan, sumber dana, rincian iuran, dan surat terkait siap salin ke grup komunitas.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pemilihan Agenda */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
            <label className="block text-xs font-bold text-neutral-900">Pilih Agenda Kegiatan</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="mt-2 w-full rounded-xl border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
            >
              {eventsList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>

            {eventsList.length === 0 && (
              <p className="mt-2 text-[11px] text-neutral-400">
                Belum ada agenda terdaftar. Buat agenda di menu Kalender terlebih dahulu.
              </p>
            )}
          </div>
        </div>

        {/* Kotak Pratinjau Pesan Sounding */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <span className="text-xs font-bold text-neutral-900">Format Teks Siaran (WhatsApp Ready)</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Kirim ke WhatsApp</span>
                </button>
              </div>
            </div>

            <pre className="mt-4 whitespace-pre-wrap font-sans text-xs leading-relaxed text-neutral-800 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
              {isPending ? 'Menyusun pesan siaran...' : soundingText || 'Pilih agenda untuk melihat format siaran.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
