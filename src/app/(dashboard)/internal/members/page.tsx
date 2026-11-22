'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  UserPlus,
  Search,
  Phone,
  Mail,
  Pencil,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import {
  getMembersList,
  createMemberAction,
  updateMemberAction,
  deleteMemberAction,
} from './actions';

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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form State Tambah
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [positionTitle, setPositionTitle] = useState('');
  const [division, setDivision] = useState('Divisi Humas');

  // Form State Ubah
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editPositionTitle, setEditPositionTitle] = useState('');
  const [editDivision, setEditDivision] = useState('Divisi Humas');
  const [editStatus, setEditStatus] = useState('active');
  const [editMemberNumber, setEditMemberNumber] = useState('');

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
      if (res.success && res.data) {
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

  const handleOpenEdit = (member: MemberData) => {
    setSelectedMember(member);
    setEditName(member.userName);
    setEditEmail(member.userEmail);
    setEditPhone(member.userPhone || '');
    setEditPositionTitle(member.positionTitle);
    setEditDivision(member.division);
    setEditStatus(member.status);
    setEditMemberNumber(member.memberNumber || '');
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    startTransition(async () => {
      const res = await updateMemberAction({
        memberId: selectedMember.id,
        name: editName,
        email: editEmail,
        phone: editPhone,
        positionTitle: editPositionTitle,
        division: editDivision,
        status: editStatus,
        memberNumber: editMemberNumber,
      });

      if (res.success) {
        setIsEditModalOpen(false);
        setSelectedMember(null);
        loadData();
      } else {
        alert(res.message);
      }
    });
  };

  const handleOpenDelete = (member: MemberData) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedMember) return;

    startTransition(async () => {
      const res = await deleteMemberAction(selectedMember.id);
      if (res.success) {
        setIsDeleteModalOpen(false);
        setSelectedMember(null);
        loadData();
      } else {
        alert(res.message);
      }
    });
  };

  const filteredMembers = members.filter(
    (m) =>
      m.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.positionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.memberNumber && m.memberNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4">
        <div>
          <span className="text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
            Kewenangan Wakil Ketua
          </span>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Manajemen Keanggotaan
          </h2>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <UserPlus className="h-4 w-4 text-[#D8AC41]" />
          <span>Tambah Anggota</span>
        </button>
      </div>

      {/* Filter & Pencarian */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama, nomor, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {divisions.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDivision(d)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-medium whitespace-nowrap transition cursor-pointer ${
                selectedDivision === d
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
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
            className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:border-[#D8AC41]/50 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900">
                      {m.userName}
                    </h4>
                    {m.memberNumber && (
                      <span className="font-mono text-[9px] text-slate-400">
                        ({m.memberNumber})
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-semibold text-[#B4821E]">
                    {m.positionTitle}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${
                      m.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : m.status === 'alumni'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {m.status === 'active' ? 'Aktif' : m.status === 'alumni' ? 'Alumni' : 'Nonaktif'}
                  </span>
                  <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[9px] font-medium text-slate-700">
                    {m.division}
                  </span>
                </div>
              </div>

              <div className="mt-3 space-y-1 border-t border-slate-100 pt-2.5 text-[10px] text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone className="h-3 w-3 text-slate-400" />
                  <a
                    href={`https://wa.me/${(m.userPhone || '').replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-[#B4821E] hover:underline"
                  >
                    {m.userPhone || '-'}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3 w-3 text-slate-400" />
                  <span className="truncate">{m.userEmail}</span>
                </div>
              </div>
            </div>

            {/* Tombol Aksi CRUD: Edit & Delete */}
            <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-slate-100 pt-2.5">
              <button
                type="button"
                onClick={() => handleOpenEdit(m)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-[#D8AC41] hover:text-[#B4821E] transition-colors cursor-pointer"
              >
                <Pencil className="h-3 w-3 text-[#D8AC41]" />
                <span>Ubah</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenDelete(m)}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3 w-3 text-rose-500" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
            Tidak ada data anggota ditemukan.
          </div>
        )}
      </div>

      {/* Modal Tambah Anggota */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              Pendaftaran Anggota Baru
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama lengkap pengurus"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">
                  Nomor WhatsApp
                </label>
                <input
                  type="text"
                  required
                  placeholder="08123456789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="email@pandawa.test"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Divisi
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
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
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Jabatan Struktural
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Koordinator"
                    value={positionTitle}
                    onChange={(e) => setPositionTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  />
                </div>
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
                  {isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Anggota (Edit) */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 border border-slate-200 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">
              Ubah Data Anggota
            </h3>

            <form onSubmit={handleUpdate} className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Nomor WhatsApp
                  </label>
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700">
                    Nomor Anggota
                  </label>
                  <input
                    type="text"
                    value={editMemberNumber}
                    onChange={(e) => setEditMemberNumber(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-700">
                    Divisi
                  </label>
                  <select
                    value={editDivision}
                    onChange={(e) => setEditDivision(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
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
                  <label className="block text-[10px] font-semibold text-slate-700">
                    Jabatan
                  </label>
                  <input
                    type="text"
                    required
                    value={editPositionTitle}
                    onChange={(e) => setEditPositionTitle(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-700">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-[#D8AC41] focus:ring-1 focus:ring-[#D8AC41] outline-none"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                    <option value="alumni">Alumni</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50 cursor-pointer"
                >
                  {isPending ? 'Menyimpan...' : 'Perbarui Data'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Hapus (Delete Confirmation) */}
      {isDeleteModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 border border-slate-200 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-50 border border-rose-200">
                <AlertTriangle className="h-5 w-5 text-rose-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Hapus Anggota</h3>
                <p className="text-[11px] text-slate-500">Konfirmasi tindakan</p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 leading-relaxed">
              Apakah Anda yakin ingin menghapus keanggotaan{' '}
              <span className="font-bold text-slate-900">{selectedMember.userName}</span>{' '}
              ({selectedMember.positionTitle} - {selectedMember.division}) dari sistem?
            </p>

            <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-lg bg-rose-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isPending ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
