'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  Plus,
  Lock,
  Globe,
  CheckCircle2,
  MapPin,
  FileText,
} from 'lucide-react';
import {
  getIncidentsList,
  createIncidentAction,
  assignIncidentPicAction,
  resolveIncidentAction,
} from './actions';
import { compressImageClient } from '@/lib/utils/image-compression';

interface IncidentItem {
  id: number;
  title: string;
  category: string;
  description: string;
  location: string;
  incidentTime: Date;
  urgency: string;
  isConfidential: boolean;
  status: string;
  reporterName: string;
  proofDriveUrl: string | null;
  createdAt: Date;
}

export default function IncidentsPage() {
  const [incidentsList, setIncidentsList] = useState<IncidentItem[]>([]);
  const [filterMode, setFilterMode] = useState<'ALL' | 'PUBLIC' | 'CONFIDENTIAL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Aspirasi Warga');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [incidentTime, setIncidentTime] = useState('2026-11-22T10:00');
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'>('MEDIUM');
  const [isConfidential, setIsConfidential] = useState(false);
  const reporterName = 'Anggota Pemuda';
  const [proofFile, setProofFile] = useState<File | null>(null);

  const loadData = useCallback(() => {
    startTransition(async () => {
      // Mock role: pimpinan/keamanan memiliki akses supervisi
      const res = await getIncidentsList('Wwj2K1c6qWEvYDpWPqJrX3qbhMwg0Mj8', ['divisi_keamanan']);
      if (res.success && res.data) {
        setIncidentsList(res.data);
      }
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressed = await compressImageClient(file, 800);
        setProofFile(compressed);
      } catch {
        setProofFile(file);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('category', category);
      fd.append('description', description);
      fd.append('location', location);
      fd.append('incidentTime', incidentTime);
      fd.append('urgency', urgency);
      fd.append('isConfidential', String(isConfidential));
      fd.append('reporterName', reporterName);
      if (proofFile) {
        fd.append('proofFile', proofFile);
      }

      const res = await createIncidentAction(fd);
      if (res.success) {
        setIsModalOpen(false);
        setTitle('');
        setDescription('');
        setLocation('');
        setProofFile(null);
        loadData();
      } else {
        alert(res.message);
      }
    });
  };

  const handleAssignPic = async (id: number) => {
    startTransition(async () => {
      const res = await assignIncidentPicAction(id, 'Wwj2K1c6qWEvYDpWPqJrX3qbhMwg0Mj8');
      if (res.success) {
        loadData();
      } else {
        alert(res.message);
      }
    });
  };

  const handleResolve = async (id: number) => {
    startTransition(async () => {
      const res = await resolveIncidentAction(id);
      if (res.success) {
        loadData();
      } else {
        alert(res.message);
      }
    });
  };

  const filteredIncidents = incidentsList.filter((item) => {
    if (filterMode === 'PUBLIC') return !item.isConfidential;
    if (filterMode === 'CONFIDENTIAL') return item.isConfidential;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
            Divisi Keamanan
          </span>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Pengaduan & Penanganan Insiden
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Plus className="h-4 w-4 text-[#D8AC41]" />
          <span>Buat Laporan</span>
        </button>
      </div>

      {/* Filter Tab */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setFilterMode('ALL')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
            filterMode === 'ALL'
              ? 'bg-slate-900 text-white font-semibold'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span>Semua ({incidentsList.length})</span>
        </button>
        <button
          onClick={() => setFilterMode('PUBLIC')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
            filterMode === 'PUBLIC'
              ? 'bg-slate-900 text-white font-semibold'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Aspirasi Publik</span>
        </button>
        <button
          onClick={() => setFilterMode('CONFIDENTIAL')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
            filterMode === 'CONFIDENTIAL'
              ? 'bg-slate-900 text-white font-semibold'
              : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Lock className="h-3.5 w-3.5 text-[#D8AC41]" />
          <span>Laporan Rahasia</span>
        </button>
      </div>

      {/* List Laporan */}
      <div className="space-y-3">
        {filteredIncidents.map((inc) => (
          <div
            key={inc.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
          >
            <div>
              <div className="flex items-center gap-2">
                {inc.isConfidential ? (
                  <span className="inline-flex items-center gap-1 rounded border border-[#D8AC41]/40 bg-[#D8AC41]/10 px-1.5 py-0.5 text-[9px] font-bold text-[#B4821E]">
                    <Lock className="h-3 w-3" /> Rahasia
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-bold text-slate-700">
                    <Globe className="h-3 w-3" /> Publik
                  </span>
                )}

                <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-600">
                  {inc.category}
                </span>

                <span
                  className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                    inc.urgency === 'HIGH' || inc.urgency === 'EMERGENCY'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-50 text-slate-700 border border-slate-200'
                  }`}
                >
                  Urgensi: {inc.urgency}
                </span>
              </div>

              <h4 className="mt-1.5 text-xs font-bold text-slate-900">{inc.title}</h4>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed line-clamp-2">{inc.description}</p>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {inc.location}
                </span>
                <span>Waktu: {new Date(inc.incidentTime).toLocaleString('id-ID')}</span>
                <span>Pelapor: {inc.reporterName}</span>
                {inc.proofDriveUrl && (
                  <a
                    href={inc.proofDriveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-[#B4821E] hover:underline font-medium"
                  >
                    <FileText className="mr-0.5 h-3 w-3" />
                    <span>Lampiran Bukti</span>
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0">
              {inc.status === 'OPEN' ? (
                <button
                  type="button"
                  onClick={() => handleAssignPic(inc.id)}
                  disabled={isPending}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  Tugaskan PIC
                </button>
              ) : inc.status === 'IN_PROGRESS' ? (
                <button
                  type="button"
                  onClick={() => handleResolve(inc.id)}
                  disabled={isPending}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700 transition cursor-pointer"
                >
                  Selesaikan
                </button>
              ) : (
                <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Selesai
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredIncidents.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
            Tidak ada laporan tercatat pada kategori ini.
          </div>
        )}
      </div>

      {/* Modal Laporan Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Formulir Pengaduan & Aspirasi</h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Judul Pengaduan</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masukan Pengelolaan Sampah Lapangan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  >
                    <option value="Aspirasi Warga">Aspirasi Warga</option>
                    <option value="Fasilitas & Lapangan">Fasilitas & Lapangan</option>
                    <option value="Ketertiban Acara">Ketertiban Acara</option>
                    <option value="Perselisihan / Konflik">Perselisihan / Konflik</option>
                    <option value="Darurat Sosial">Darurat Sosial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Tingkat Urgensi</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY')}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  >
                    <option value="LOW">Rendah (Low)</option>
                    <option value="MEDIUM">Sedang (Medium)</option>
                    <option value="HIGH">Tinggi (High)</option>
                    <option value="EMERGENCY">Darurat (Emergency)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Lokasi</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lapangan Voli Wanangsri"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">Waktu Kejadian</label>
                  <input
                    type="datetime-local"
                    required
                    value={incidentTime}
                    onChange={(e) => setIncidentTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Kronologi</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                />
              </div>

              {/* Opsi Rahasia */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-900">
                  <input
                    type="checkbox"
                    checked={isConfidential}
                    onChange={(e) => setIsConfidential(e.target.checked)}
                    className="rounded border-slate-300 text-[#D8AC41] focus:ring-[#D8AC41]"
                  />
                  <span>Tandai sebagai Laporan Rahasia</span>
                </label>
                <p className="mt-1 text-[10px] text-slate-400">
                  Hanya dapat dibaca oleh Anda, Divisi Keamanan, dan Ketua Umum.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">Lampiran Bukti Foto (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 w-full text-xs text-slate-500 file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
