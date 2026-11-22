# Task Checklist: Pandawa App Implementation (Updated)

## Phase 1: Inisiasi Proyek & Fondasi Sistem (Struktur Divisi & RBAC)
- [x] Inisialisasi proyek Next.js 15 (TypeScript, Tailwind CSS, App Router) <!-- id: 1.1 -->
- [x] Konfigurasi Tailwind CSS & instalasi pustaka komponen shadcn/ui <!-- id: 1.2 -->
- [x] Konfigurasi koneksi Neon PostgreSQL & instalasi Drizzle ORM + Drizzle Kit <!-- id: 1.3 -->
- [x] Definisi skema tabel Autentikasi & Organisasi di Drizzle ORM (`users`, `roles`, `periods`, `user_roles`, `members`) <!-- id: 1.4 -->
- [x] Definisi skema tabel Audit Log (`audit_logs`) <!-- id: 1.5 -->
- [x] Implementasi Better Auth dengan Dynamic RBAC Guard berbasis Divisi/Jabatan <!-- id: 1.6 -->
- [x] Implementasi seed script untuk peran divisi (Ketua Umum, Wakil Ketua, Sekretaris, Bendahara, Divisi Acara, Divisi Humas, Divisi Logistik, Divisi Keamanan, Anggota) <!-- id: 1.7 -->
- [x] Fitur Wakil Ketua: CRUD Anggota, struktur jabatan, & penugasan divisi <!-- id: 1.8 -->
- [x] Komponen layout mobile-first: Bottom Navigation Bar, Mobile Drawer, Header Bar <!-- id: 1.9 -->

## Phase 2: Modul Keuangan & Persuratan Resmi
- [ ] Definisi skema tabel Keuangan & Iuran (`wallets`, `cash_transactions`, `routine_dues_schedules`, `routine_dues_payments`, `event_dues_schedules`, `event_dues_payments`) <!-- id: 2.1 -->
- [ ] Setup modul Google Drive API v3 (OAuth 2.0 refresh token service) <!-- id: 2.2 -->
- [ ] Implementasi utilitas kompresi gambar sisi browser (< 800 KB) <!-- id: 2.3 -->
- [ ] Manajemen Multi-Wallet Kas & Pencatatan Transaksi Kas Masuk/Keluar <!-- id: 2.4 -->
- [ ] Approval Transaksi Kas (pengeluaran > Rp500.000 wajib approval Ketua Umum) <!-- id: 2.5 -->
- [ ] Modul Iuran Rutin Anggota (matriks tagihan & rekonsiliasi kas) <!-- id: 2.6 -->
- [ ] Definisi skema tabel Persuratan (`letters`, `letter_dispositions`) <!-- id: 2.7 -->
- [ ] Generator Nomor Surat Otomatis berurutan bebas konflik (Undangan, SP 1-3, Girik Iuran, Surat Tugas, Permohonan) <!-- id: 2.8 -->
- [ ] Alur Pengajuan Draf Surat oleh Divisi -> Verifikasi & Penerbitan oleh Sekretaris <!-- id: 2.9 -->
- [ ] Format Surat Resmi dengan TTD Digital (tanpa barcode) & simpan PDF ke GDrive <!-- id: 2.10 -->
- [ ] Pencatatan Surat Masuk & Lembar Disposisi <!-- id: 2.11 -->

## Phase 3: Modul Acara, Kalender Humas, & Inventaris Harga Ganda
- [ ] Definisi skema tabel Kegiatan & Kepanitiaan (`events`, `event_committees`) <!-- id: 3.1 -->
- [ ] Modul Acara: Perencanaan, alokasi kas vs sponsor, & penunjukan kepanitiaan <!-- id: 3.2 -->
- [ ] Modul Iuran Khusus Acara: Generator form tracking pembayaran iuran per anggota <!-- id: 3.3 -->
- [ ] Kalender Agenda Terpadu Humas (Tabel kalender interaktif besar tersinkronisasi ke dashboard seluruh anggota) <!-- id: 3.4 -->
- [ ] Generator Pesan Sounding WhatsApp Humas (Detail acara, sumber dana kas/luar, info iuran, tautan surat) <!-- id: 3.5 -->
- [ ] Definisi skema tabel Inventaris (`assets`, `asset_loans`) <!-- id: 3.6 -->
- [ ] Katalog Aset Inventaris beragam kategori <!-- id: 3.7 -->
- [ ] Skema Harga Ganda: Harga Dalam (Anggota/Warga) vs Harga Luar (Pihak Luar/Komersial) <!-- id: 3.8 -->
- [ ] Sirkulasi Peminjaman/Sewa & Integrasi Otomatis Kas Masuk untuk Sewa Luar <!-- id: 3.9 -->
- [ ] Berita Acara Pengembalian Barang & Pencatatan Kondisi Fisik/Denda <!-- id: 3.10 -->

## Phase 4: Modul Pengaduan, Keamanan & Laporan Publik vs Rahasia
- [ ] Definisi skema tabel Insiden (`incidents`, `incident_assignees`, `incident_logs`) <!-- id: 4.1 -->
- [ ] Formulir Pengaduan Anggota dengan Opsi Visibilitas: Publik (Aspirasi) vs Rahasia (Insiden) <!-- id: 4.2 -->
- [ ] Isolasi Akses Laporan Rahasia: Hanya Pelapor, Divisi Keamanan, dan Ketua/Wakil <!-- id: 4.3 -->
- [ ] Feed Laporan Publik pada Dashboard Forum Anggota <!-- id: 4.4 -->
- [ ] Penunjukan PIC Penanganan Lapangan oleh Divisi Keamanan & Kronologi Progres Mediasi <!-- id: 4.5 -->

## Phase 5: Audit, Pelaporan, & Pengujian
- [ ] UI Viewer Jejak Audit Sistem (`audit_logs`) untuk Ketua Umum & Wakil Ketua <!-- id: 5.1 -->
- [ ] Fitur Ekspor Rekapitulasi Kas & Inventaris ke format CSV / PDF <!-- id: 5.2 -->
- [ ] Pengujian E2E Otorisasi Server Action & Dynamic RBAC Divisi <!-- id: 5.3 -->
- [ ] Pengujian Kompresi Gambar & Upload GDrive <!-- id: 5.4 -->
- [ ] Dokumentasi & Panduan Deployment Vercel + Neon <!-- id: 5.5 -->
