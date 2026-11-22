'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  UserPlus,
  Search,
  Phone,
  Mail,
} from 'lucide-react';
import { getMembersList, createMemberAction } from './actions';

interface MemberData {
  id: number;
  memberNumber: string | null;
  positionTitle: string;
  division: string;
  status: string;
  joinedAt: Date;
  userName: string;
  userEmail: string;
  userPhone: string | null;
}

export default function MembersManagementPage() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [division, setDivision] = useState('Divisi Humas');

  const divisions = [
    'ALL',
    'BPH',
    'Kesekretariatan',
    'Keuangan',
    'Divisi Acara',
    'Divisi Humas',
    'Divisi Logistik',
    'Divisi Keamanan',
    'Anggota',
  ];

  const loadData = useCallback(() => {
    startTransition(async () => {
      const res = await getMembersList(selectedDivision);
      if (res.success) {
        setMembers(res.data);
      }
    });
  }, [selectedDivision]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await createMemberAction({
        name,
        email,
        phone,
        positionTitle,
        division,
      });

      if (res.success) {
        setIsModalOpen(false);
        setName('');
        setEmail('');
        setPhone('');
        setPositionTitle('');
        loadData();
      } else {
        alert(res.message);
      }
    });
  };

  const filteredMembers = members.filter((m) =>
    (m.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.positionTitle || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Kewenangan Wakil Ketua
          </span>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Manajemen Internal Keanggotaan
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Kelola struktur pengurus, pendaftaran anggota, dan penugasan divisi.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-purple-700 transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>Tambah Anggota Baru</span>
        </button>
      </div>

      {/* Filter & Pencarian */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Cari nama atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-white py-2 pl-9 pr-3 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-purple-500 focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {divisions.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDivision(d)}
              className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium whitespace-nowrap transition ${
                selectedDivision === d
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100 dark:bg-neutral-900 dark:border-neutral-800 dark:text-neutral-300'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Daftar Anggota */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredMembers.map((m) => (
          <div
            key={m.id}
            className="rounded-xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  {m.userName}
                </h4>
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  {m.positionTitle}
                </p>
              </div>
              <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                {m.division}
              </span>
            </div>

            <div className="mt-3 space-y-1.5 border-t border-neutral-100 pt-3 text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-neutral-400" />
                <a
                  href={`https://wa.me/${(m.userPhone || '').replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-purple-600 hover:underline"
                >
                  {m.userPhone || '-'}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-neutral-400" />
                <span>{m.userEmail || '-'}</span>
              </div>
            </div>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-neutral-300 p-8 text-center text-xs text-neutral-500 dark:border-neutral-700">
            Belum ada anggota terdaftar untuk divisi ini. Klik &quot;Tambah Anggota Baru&quot; di atas.
          </div>
        )}
      </div>

      {/* Modal Tambah Anggota */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
              Pendaftaran Anggota & Jabatan
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Masukkan data anggota untuk masa periode aktif saat ini.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-purple-500 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  required
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-purple-500 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-purple-500 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                    Divisi
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-purple-500 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  >
                    {divisions
                      .filter((d) => d !== 'ALL')
                      .map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                    Jabatan Struktural
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Koordinator"
                    value={positionTitle}
                    onChange={(e) => setPositionTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-xs text-neutral-900 focus:border-purple-500 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-purple-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
                >
                  {isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
