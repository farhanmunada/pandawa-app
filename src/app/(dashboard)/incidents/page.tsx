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
      const original = e.target.files[0];
      const compressed = await compressImageClient(original);
      setProofFile(compressed);
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-neutral-200 pb-4">
        <div>
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Divisi Keamanan & Konseling
          </span>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900">
            Pengaduan: Forum Publik & Laporan Rahasia
          </h2>
          <p className="text-xs text-neutral-500">
            Aspirasi umum ditampilkan di forum anggota; laporan rahasia hanya diakses pelapor, Keamanan, dan Ketua.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-neutral-800 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Buat Laporan Baru</span>
        </button>
      </div>

      {/* Filter Tab */}
      <div className="flex items-center gap-2 border-b border-neutral-200 pb-2">
        <button
          onClick={() => setFilterMode('ALL')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            filterMode === 'ALL' ? 'bg-neutral-900 text-white font-semibold' : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <span>Semua ({incidentsList.length})</span>
        </button>
        <button
          onClick={() => setFilterMode('PUBLIC')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            filterMode === 'PUBLIC'
              ? 'bg-neutral-900 text-white font-semibold'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Aspirasi Publik</span>
        </button>
        <button
          onClick={() => setFilterMode('CONFIDENTIAL')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            filterMode === 'CONFIDENTIAL'
              ? 'bg-neutral-900 text-white font-semibold'
              : 'text-neutral-600 hover:bg-neutral-100'
          }`}
        >
          <Lock className="h-3.5 w-3.5" />
          <span>Laporan Rahasia (Terbatas)</span>
        </button>
      </div>

      {/* Daftar Tiket Laporan */}
      <div className="space-y-3">
        {filteredIncidents.map((inc) => (
          <div
            key={inc.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-xs"
          >
            <div>
              <div className="flex items-center gap-2">
                {inc.isConfidential ? (
                  <span className="inline-flex items-center gap-1 rounded-sm bg-rose-50 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
                    <Lock className="h-3 w-3" /> Rahasia
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-sm bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">
                    <Globe className="h-3 w-3" /> Publik
                  </span>
                )}

                <span className="rounded-sm bg-neutral-100 px-1.5 py-0.5 text-[9px] font-medium text-neutral-600">
                  {inc.category}
                </span>

                <span
                  className={`rounded-sm px-1.5 py-0.5 text-[9px] font-bold ${
                    inc.urgency === 'HIGH' || inc.urgency === 'EMERGENCY'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-neutral-100 text-neutral-700'
                  }`}
                >
                  Urgensi: {inc.urgency}
                </span>
              </div>

              <h4 className="mt-1.5 text-xs font-bold text-neutral-900">{inc.title}</h4>
              <p className="mt-1 text-xs text-neutral-600 leading-relaxed line-clamp-2">{inc.description}</p>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-neutral-400">
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
                    className="inline-flex items-center text-blue-600 hover:underline"
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
                  className="rounded-lg bg-neutral-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-neutral-800"
                >
                  Tugaskan PIC
                </button>
              ) : inc.status === 'IN_PROGRESS' ? (
                <button
                  type="button"
                  onClick={() => handleResolve(inc.id)}
                  disabled={isPending}
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-700"
                >
                  Selesaikan (Resolved)
                </button>
              ) : (
                <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Selesai
                </span>
              )}
            </div>
          </div>
        ))}

        {filteredIncidents.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-300 p-8 text-center text-xs text-neutral-500">
            Tidak ada laporan tercatat pada kategori ini.
          </div>
        )}
      </div>

      {/* Modal Laporan Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-bold text-neutral-900">Formulir Pengaduan & Aspirasi</h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700">Judul Pengaduan / Aspirasi</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Masukan Pengelolaan Sampah Lapangan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                  >
                    <option value="Aspirasi Warga">Aspirasi Warga</option>
                    <option value="Fasilitas & Lapangan">Fasilitas & Lapangan</option>
                    <option value="Ketertiban Acara">Ketertiban Acara</option>
                    <option value="Perselisihan / Konflik">Perselisihan / Konflik</option>
                    <option value="Darurat Sosial">Darurat Sosial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700">Tingkat Urgensi</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY')}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
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
                  <label className="block text-[11px] font-semibold text-neutral-700">Lokasi Kejadian</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lapangan Voli Wanangsri"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700">Waktu Kejadian</label>
                  <input
                    type="datetime-local"
                    required
                    value={incidentTime}
                    onChange={(e) => setIncidentTime(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700">Uraian / Kronologi</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:outline-hidden"
                />
              </div>

              {/* Opsi Rahasia */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-neutral-900">
                  <input
                    type="checkbox"
                    checked={isConfidential}
                    onChange={(e) => setIsConfidential(e.target.checked)}
                    className="rounded border-neutral-300"
                  />
                  <span>Tandai sebagai Laporan Rahasia (Confidential)</span>
                </label>
                <p className="mt-1 text-[10px] text-neutral-500">
                  Laporan rahasia tidak akan tampil di forum publik, dan hanya dapat dibaca oleh Anda, Divisi Keamanan, dan Ketua Umum.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700">Lampiran Bukti Foto (Opsional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="mt-1 w-full text-xs text-neutral-500 file:mr-2 file:rounded-md file:border-0 file:bg-neutral-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-neutral-700 hover:file:bg-neutral-200"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-neutral-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
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
