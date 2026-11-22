'use client';

import React, { useState } from 'react';
import { createIncidentAction } from './actions';
import { compressImageClient } from '@/lib/utils/image-compression';
import { X, Upload, Loader2 } from 'lucide-react';

interface ReportIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReportIncidentModal({
  isOpen,
  onClose,
  onSuccess,
}: ReportIncidentModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Aspirasi Warga');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [incidentTime, setIncidentTime] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [urgency, setUrgency] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'>('MEDIUM');
  const [isConfidential, setIsConfidential] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

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
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('category', category);
      fd.append('description', description);
      fd.append('location', location);
      fd.append('incidentTime', incidentTime);
      fd.append('urgency', urgency);
      fd.append('isConfidential', String(isConfidential));
      fd.append('reporterName', 'Anggota Pemuda');
      if (proofFile) {
        fd.append('proofFile', proofFile);
      }

      const res = await createIncidentAction(fd);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(res.message || 'Gagal mengirimkan laporan pengaduan.');
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kendala saat mengirimkan laporan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.1)]">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
              Divisi Keamanan & Pengaduan
            </span>
            <h3 className="text-base font-bold text-slate-900">
              Formulir Pengaduan & Aspirasi
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-800">Judul Pengaduan / Aspirasi</label>
            <input
              type="text"
              required
              placeholder="e.g. Masukan Pengelolaan Fasilitas Lapangan Wanangsri"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800">Kategori</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              >
                <option value="Aspirasi Warga">Aspirasi Warga</option>
                <option value="Fasilitas & Lapangan">Fasilitas & Lapangan</option>
                <option value="Ketertiban Acara">Ketertiban Acara</option>
                <option value="Perselisihan / Konflik">Perselisihan / Konflik</option>
                <option value="Darurat Sosial">Darurat Sosial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-800">Tingkat Urgensi</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY')}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              >
                <option value="LOW">Rendah (Low)</option>
                <option value="MEDIUM">Sedang (Medium)</option>
                <option value="HIGH">Tinggi (High)</option>
                <option value="EMERGENCY">Darurat (Emergency)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-800">Lokasi Kejadian</label>
              <input
                type="text"
                required
                placeholder="e.g. Lapangan Voli Wanangsri"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-800">Waktu Kejadian</label>
              <input
                type="datetime-local"
                required
                value={incidentTime}
                onChange={(e) => setIncidentTime(e.target.value)}
                className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800">Kronologi & Keterangan</label>
            <textarea
              required
              rows={3}
              placeholder="Jelaskan secara rinci situasi atau usulan aspirasi Anda"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5 w-full rounded-2xl bg-slate-50 px-4 py-2 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none"
            />
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
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
              Hanya dapat dibaca dan ditindaklanjuti oleh Pelapor, Divisi Keamanan, dan Ketua Umum.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-800">Lampiran Bukti Foto (Opsional)</label>
            <div className="mt-1.5 flex items-center gap-3">
              <label className="flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer">
                <Upload className="h-4 w-4 text-[#D8AC41]" />
                <span>Pilih Foto Bukti</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-slate-400 truncate">
                {proofFile ? proofFile.name : 'Belum ada berkas foto dipilih'}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 rounded-2xl bg-slate-900 px-5 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#D8AC41]" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <span>Kirim Laporan</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
