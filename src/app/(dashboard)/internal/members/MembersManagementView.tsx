'use client';

import React, { useState, useEffect, useTransition, useCallback } from 'react';
import {
  UserPlus,
  Search,
  Phone,
  Mail,
  Pencil,
  Trash2,
} from 'lucide-react';
import { getMembersList } from './actions';
import { MemberData, divisions } from './types';
import { CreateMemberModal } from './CreateMemberModal';
import { EditMemberModal } from './EditMemberModal';
import { DeleteMemberModal } from './DeleteMemberModal';

export function MembersManagementView() {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [selectedDivision, setSelectedDivision] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [, startTransition] = useTransition();

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

  const openEditModal = (member: MemberData) => {
    setSelectedMember(member);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (member: MemberData) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };

  const filteredMembers = members.filter((m) => {
    const matchesSearch =
      m.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.positionTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.memberNumber && m.memberNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner Frameless */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">
        <div>
          <span className="rounded-full bg-[#D8AC41]/15 px-3 py-1 text-[10px] font-bold text-[#B4821E] uppercase tracking-wider">
            Wakil Ketua
          </span>
          <h2 className="mt-2 text-xl font-bold tracking-tight text-slate-900">
            Manajemen Anggota & Jabatan
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Pendaftaran pengurus baru, penerbitan nomor anggota, status keaktifan, dan pembagian divisi
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition cursor-pointer shrink-0"
        >
          <UserPlus className="h-4 w-4 text-[#D8AC41]" />
          <span>Tambah Anggota</span>
        </button>
      </div>

      {/* Kontrol Filter & Pencarian */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.04)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama, jabatan, kode anggota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl bg-slate-50 pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-[#D8AC41]/40 outline-none transition"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedDivision('ALL')}
              className={`rounded-2xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                selectedDivision === 'ALL'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Semua Divisi
            </button>
            {divisions.map((div) => (
              <button
                key={div}
                onClick={() => setSelectedDivision(div)}
                className={`rounded-2xl px-3.5 py-2 text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedDivision === div
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {div}
              </button>
            ))}
          </div>
        </div>

        {/* Daftar Anggota */}
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4 transition-all hover:bg-slate-100/70"
            >
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-xs font-bold text-slate-900">{member.userName}</h4>
                  <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-[#D8AC41]">
                    {member.memberNumber || 'ANG'}
                  </span>
                  <span className="rounded-full bg-[#D8AC41]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#B4821E]">
                    {member.division}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${
                      member.status === 'active'
                        ? 'bg-emerald-100 text-emerald-700'
                        : member.status === 'inactive'
                        ? 'bg-rose-100 text-rose-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {member.status === 'active' ? 'Aktif' : member.status === 'inactive' ? 'Nonaktif' : 'Alumni'}
                  </span>
                </div>

                <p className="mt-1 text-xs font-medium text-slate-700">{member.positionTitle}</p>

                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                  {member.userPhone && (
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3 text-slate-400" />
                      {member.userPhone}
                    </span>
                  )}
                  {member.userEmail && (
                    <>
                      <span>&bull;</span>
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {member.userEmail}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-2 sm:pt-0">
                <button
                  type="button"
                  onClick={() => openEditModal(member)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-600 shadow-2xs hover:text-[#B4821E] transition cursor-pointer"
                  title="Ubah Anggota"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openDeleteModal(member)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-slate-400 shadow-2xs hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                  title="Hapus Anggota"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {filteredMembers.length === 0 && (
            <div className="rounded-2xl bg-slate-50 p-8 text-center text-xs text-slate-400">
              Tidak ada data anggota ditemukan pada filter ini.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateMemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
      />

      <EditMemberModal
        isOpen={isEditModalOpen}
        member={selectedMember}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={loadData}
      />

      <DeleteMemberModal
        isOpen={isDeleteModalOpen}
        member={selectedMember}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
