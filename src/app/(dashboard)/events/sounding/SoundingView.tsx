'use client';

import React, { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { ArrowLeft, Copy, Check, MessageSquare } from 'lucide-react';
import { getEventsList, getEventSoundingData } from '../actions';

interface EventOption {
  id: number;
  title: string;
}

export function SoundingView() {
  const [eventsList, setEventsList] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [soundingText, setSoundingText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [, startTransition] = useTransition();

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
      {/* Header Banner Frameless */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/events"
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition cursor-pointer"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Kalender</span>
            </Link>
            <span className="text-slate-300">&bull;</span>
            <span className="rounded-full bg-[#D8AC41]/15 px-3 py-0.5 text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
              Divisi Humas
            </span>
          </div>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            Generator Pesan Sounding WhatsApp
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Penyusunan format pesan siaran pengumuman kegiatan resmi siap salin ke grup warga
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pemilihan Agenda */}
        <div className="space-y-4">
          <div className="rounded-3xl bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.04)] space-y-3">
            <label className="block text-xs font-bold text-slate-900">Pilih Agenda Kegiatan</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none transition"
            >
              {eventsList.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title}
                </option>
              ))}
            </select>

            {eventsList.length === 0 && (
              <p className="text-[11px] text-slate-400">
                Belum ada agenda terdaftar pada sistem.
              </p>
            )}
          </div>
        </div>

        {/* Kotak Pratinjau Pesan Sounding */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-900">Pratinjau Pesan Sounding</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-2xl bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-[#B4821E]" />
                      <span>Salin Pesan</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="flex items-center gap-1.5 rounded-2xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-[#D8AC41]" />
                  <span>Kirim ke WhatsApp</span>
                </button>
              </div>
            </div>

            <pre className="rounded-2xl bg-slate-50 p-5 font-mono text-xs leading-relaxed text-slate-800 whitespace-pre-wrap select-all">
              {soundingText || 'Memuat draf sounding kegiatan...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
