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
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <Link
          href="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Kembali ke Kalender Agenda</span>
        </Link>
      </div>

      <div>
        <span className="text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
          Divisi Humas
        </span>
        <h2 className="text-lg font-bold tracking-tight text-slate-900">
          Generator Pesan Sounding WhatsApp
        </h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pemilihan Agenda */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <label className="block text-xs font-bold text-slate-900">Pilih Agenda Kegiatan</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
            >
              {eventsList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>

            {eventsList.length === 0 && (
              <p className="mt-2 text-[11px] text-slate-400">
                Belum ada agenda terdaftar.
              </p>
            )}
          </div>
        </div>

        {/* Kotak Pratinjau Pesan Sounding */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-slate-900">Format Pesan WhatsApp</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Tersalin' : 'Salin Teks'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Kirim ke WhatsApp</span>
                </button>
              </div>
            </div>

            <pre className="mt-4 whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {isPending ? 'Menyusun pesan siaran...' : soundingText || 'Pilih agenda untuk melihat format siaran.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
