export interface MemberData {
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

export const divisions = [
  'BPH',
  'Kesekretariatan',
  'Keuangan',
  'Divisi Acara',
  'Divisi Humas',
  'Divisi Logistik',
  'Divisi Keamanan',
  'Anggota',
];
