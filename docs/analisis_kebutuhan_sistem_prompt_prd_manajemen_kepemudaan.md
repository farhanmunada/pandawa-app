# Dokumen Analisis Kebutuhan Sistem (System Requirements Analysis)
**Proyek:** Sistem Informasi Manajemen Administrasi & Operasional Organisasi Kepemudaan  
**Model Deployment:** Single-Tenant (1 Organisasi Utama) dengan Multi-User & Multi-Role (Dynamic RBAC)  
**Target Output:** Input Primer untuk Penyusunan *Product Requirements Document* (PRD) & *Database Schema*

---

## 1. Ringkasan Eksekutif & Arsitektur Teknis
Aplikasi ini dirancang untuk mendigitalisasi seluruh tata kelola administrasi, keuangan, aset, kegiatan, dan pelaporan insiden pada satu organisasi kepemudaan (seperti Karang Taruna, organisasi pemuda tingkat desa/kelurahan, atau komunitas pemuda).

### Stack Teknologi (Gratis & Serverless-Ready)
* **Frontend & Backend:** Next.js 15+ (App Router, Server Actions, TypeScript).
* **Database Utama:** Neon (PostgreSQL Serverless) dengan *Connection Pooling* (`-pooler`) dan **Drizzle ORM**.
* **Autentikasi & Otorisasi:** Auth.js (NextAuth) atau Better Auth dengan skema *Dynamic Role-Based Access Control* (RBAC).
* **Penyimpanan File & Media:** **Google Drive API** (menggunakan OAuth 2.0 Refresh Token akun Google resmi organisasi). Database Neon hanya menyimpan metadata file (`drive_file_id`, `web_view_link`, `mime_type`).
* **Hosting:** Vercel (Hobby / Free Tier).

---

## 2. Analisis Aktor & Matriks Hak Akses (*Multi-Role RBAC*)

Sistem menerapkan konsep **Dynamic Multi-Role**, di mana satu pengguna (*user*) dapat memegang satu atau lebih jabatan/peran sekaligus sesuai struktur kepengurusan aktif.

### A. Definisi Role Kepengurusan
1. **Admin 1 (Ketua Umum / Koordinator Utama / Super Admin):**
   * Memiliki visibilitas penuh ke seluruh modul (*Read / Approve / Audit*).
   * Berwenang menyetujui (*approve*) pengeluaran kas di atas batas nominal tertentu, memvalidasi surat keluar resmi, meninjau laporan kejadian rahasia, serta menetapkan pembagian role pengurus.
2. **Admin 2 (Wakil Ketua / Sekretaris Umum):**
   * Mengelola **Struktur Organisasi**, **Database Anggota**, dan **Modul Persuratan** (Surat Masuk/Keluar, penomoran otomatis, disposisi).
   * Memverifikasi laporan kegiatan dan bertindak sebagai *approver* cadangan apabila Admin 1 berhalangan.
3. **Admin Keuangan (Bendahara 1 & Bendahara 2):**
   * Mengelola **Arus Kas** (Pemasukan, Pengeluaran, Iuran Rutin Anggota, dan Realisasi Anggaran Kegiatan).
   * Wajib melampirkan bukti nota/struk transaksi ke Google Drive.
   * Role lain hanya memiliki akses *Read-Only* (transparansi) tanpa izin ubah/hapus.
4. **Admin Inventaris (Sie Perlengkapan / Logistik):**
   * Mengelola **Katalog Aset & Inventaris**, pembaruan kondisi barang, serta sirkulasi peminjaman internal maupun penyewaan eksternal.
5. **Admin Kegiatan (Sie Acara / Humas / Koordinator Lapangan):**
   * Membuat jadwal dan perencanaan kegiatan, menunjuk **Penanggung Jawab (PIC)** kegiatan beserta susunan kepanitiaan, mengunggah dokumentasi ke Google Drive, dan menyusun Laporan Pertanggungjawaban (LPJ).
6. **Admin Keamanan / Pengaduan (Sie Keamanan / Konseling):**
   * Meninjau **Laporan Kejadian/Insiden**, menunjuk PIC penanganan lapangan, mencatat progres mediasi/penyelesaian, dan menutup status kasus.
7. **Member (Anggota Biasa):**
   * Melihat ringkasan transparansi kas, melihat struktur organisasi dan jadwal kegiatan, mengajukan peminjaman inventaris, mengunduh surat edaran publik, serta membuat **Laporan Kejadian/Aspirasi**.

### B. Matriks Izin Akses (*Permission Matrix*)

| Modul / Fitur | Admin 1 (Ketua) | Admin 2 (Sekretaris) | Admin Keuangan | Admin Inventaris | Admin Kegiatan | Admin Keamanan | Member |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Manajemen User & Role** | CRUD | CRU | R | R | R | R | R (Profil) |
| **Struktur Organisasi** | CRUD | CRUD | R | R | R | R | R |
| **Arus Kas & Iuran** | R / Approve | R | CRUD | R | R | R | R (Summary) |
| **Surat Masuk & Keluar** | R / Approve | CRUD | R | R | R (Request) | R | R (Publik) |
| **Inventaris & Peminjaman** | R | R | R (Sewa) | CRUD | R (Pinjam) | R | R (Pinjam) |
| **Laporan Kegiatan & PIC** | R / Approve | R / Verifikasi | R (Audit) | R | CRUD | R | R |
| **Laporan Kejadian & PIC** | CRUD / Assign | CRUD / Assign | - | - | R (Terkait) | CRUD / Assign | Create / R (Milik sendiri) |

*(Keterangan: C = Create, R = Read, U = Update, D = Delete)*

---

## 3. Analisis Kebutuhan Fungsional per Modul (*Functional Requirements*)

### Modul 1: Manajemen Organisasi & Keanggotaan
* **Manajemen Periode Kepengurusan:** Menyimpan data masa bakti (misal: `2026–2028`) sehingga pergantian pengurus tidak menghapus riwayat data periode sebelumnya.
* **Struktur Organisasi & Direktori Anggota:** Pengelompokan pengurus inti, koordinator bidang/divisi, dan anggota aktif lengkap dengan foto profil (GDrive), nomor WhatsApp, jabatan, serta status keanggotaan (`Aktif`, `Non-Aktif`, `Alumni`).
* **Audit Log Sistem (Wajib):** Mencatat seluruh aktivitas sensitif (`user_id`, `action`, `target_table`, `record_id`, `old_data`, `new_data`, `created_at`) untuk menjamin akuntabilitas antar-admin.

### Modul 2: Arus Kas & Keuangan Organisasi
* **Multi-Dompet / Pos Anggaran:** Pemisahan pencatatan saldo berdasarkan pos (Kas Utama, Kas Sosial, Kas Unit Usaha/Sewa Inventaris, Dana Kegiatan).
* **Pencatatan Transaksi & Bukti Wajib:**
  * Setiap pemasukan dan pengeluaran wajib mencantumkan nominal, tanggal, kategori, keterangan, serta lampiran foto nota/bukti transfer yang diunggah ke Google Drive.
  * Modul **Iuran Rutin Anggota** (mingguan/bulanan/selapanan) dengan matriks status pembayaran per anggota.
* **Alur Persetujuan (*Approval Workflow*):** Transaksi pengeluaran di atas nominal batas wajar (misal `> Rp500.000`) berstatus `PENDING_APPROVAL` dan memerlukan persetujuan `Admin 1` sebelum memotong saldo aktif.
* **Laporan & Ekspor:** Filter mutasi berdasarkan rentang tanggal/pos anggaran serta fitur cetak laporan keuangan ke format PDF/CSV.

### Modul 3: Administrasi Persuratan (Surat Masuk & Keluar)
* **Generator Nomor Surat Otomatis:** Penomoran berurutan otomatis berdasarkan kode jenis surat dan bulan/tahun (contoh: `014/SK-PAN/KT/XI/2026`) untuk mencegah duplikasi nomor.
* **Siklus Hidup Surat Keluar:**
  1. Pengajuan draft surat (Undangan, Permohonan Dana, Peminjaman Tempat, Surat Tugas).
  2. Verifikasi redaksi oleh `Admin 2` dan persetujuan oleh `Admin 1` (disertai QR Code verifikasi keaslian surat).
  3. Unggah arsip PDF final yang telah ditandatangani ke Google Drive.
* **Arsip & Disposisi Surat Masuk:** Pencatatan pengirim, nomor surat asal, tanggal terima, perihal, unggah scan dokumen ke Google Drive, serta penunjukan disposisi kepada divisi/PIC terkait.

### Modul 4: Manajemen Inventaris & Peminjaman Aset
* **Database Aset Organisasi:** Kode inventaris unik, nama barang, kategori, total unit, unit tersedia, kondisi (`Baik`, `Rusak Ringan`, `Rusak Berat`, `Hilang`), lokasi penyimpanan, dan foto aset (GDrive).
* **Sirkulasi Peminjaman & Penyewaan:**
  * Pencatatan peminjam (Internal anggota atau Eksternal warga/instansi), tanggal pinjam, jadwal kembali, dan tujuan penggunaan.
  * **Integrasi Otomatis ke Arus Kas:** Jika transaksi bersifat sewa komersial (misal sewa tenda/sound system), konfirmasi pembayaran otomatis membuat draf pemasukan pada Modul Arus Kas.
* **Berita Acara Pengembalian:** Pengecekan kondisi barang saat kembali; pencatatan riwayat perbaikan (*maintenance*) atau denda jika terjadi kerusakan.

### Modul 5: Manajemen Kegiatan & Penanggung Jawab (PIC)
* **Perencanaan & Struktur Kepanitiaan:** Judul acara, deskripsi, waktu, lokasi, Rencana Anggaran Biaya (RAB), serta penunjukan **Ketua Panitia / PIC Utama** dan anggota panitia per seksi.
* **Laporan Pertanggungjawaban (LPJ):**
  * Rekapitulasi realisasi anggaran (ditarik otomatis dari transaksi kas yang ditandai dengan `event_id` terkait).
  * Catatan evaluasi kegiatan, kendala lapangan, dan daftar hadir.
  * **Auto-Folder Google Drive:** Saat kegiatan dibuat, sistem otomatis membuat folder khusus di Google Drive (misal: `/04_KEGIATAN/2026-11_Nama_Kegiatan/`) agar panitia dapat langsung mengunggah dokumentasi foto ke folder tersebut.

### Modul 6: Laporan Kejadian / Insiden & Penanggung Jawab (PIC)
Modul khusus untuk menangani insiden lapangan (misal: keributan acara, kerusakan inventaris saat kegiatan, pelanggaran tata tertib, atau laporan sosial darurat di lingkungan pemuda).
* **Formulir Pelaporan Kejadian:**
  * Dapat dibuat oleh Anggota maupun Admin.
  * Atribut wajib: Judul kejadian, kategori insiden, waktu & lokasi kejadian, kronologi lengkap, tingkat urgensi (`Rendah`, `Sedang`, `Tinggi/Darurat`), pihak terlibat, dan bukti foto/dokumen (GDrive).
  * Opsi **Laporan Rahasia (*Confidential*)**: Hanya dapat diakses oleh pelapor, `Admin 1`, `Admin 2`, dan `PIC` yang ditugaskan.
* **Penunjukan PIC & Ticketing Penyelesaian:**
  1. Status awal: `OPEN` (Dilaporkan).
  2. `Admin 1`, `Admin 2`, atau `Admin Keamanan` meninjau laporan dan menunjuk **1 atau lebih PIC Penanganan**.
  3. PIC memperbarui status menjadi `IN_PROGRESS`, mencatat kronologi tindak lanjut (*progress log*), dan mengunggah berita acara mediasi/bukti penyelesaian.
  4. Status diubah menjadi `RESOLVED` (Selesai) dan divalidasi menjadi `CLOSED`.

---

## 4. Kebutuhan Non-Fungsional & Batasan Teknis (*Constraints*)

1. **Strategi Integrasi Google Drive API (Mengatasi Limit Vercel 4.5 MB):**
   * Karena Vercel Hobby membatasi ukuran *request payload* maksimal **4.5 MB**, seluruh unggahan gambar (foto kegiatan, bukti kejadian, nota kas) wajib melalui **kompresi otomatis di sisi browser (*client-side compression*)** sebelum dikirim (target ukuran `< 1 MB` per gambar), atau menggunakan **Google Drive Resumable Upload URI** langsung dari browser ke Google Drive.
   * Hierarki folder terstandarisasi di Google Drive organisasi:
     * `/ORG_SYSTEM_ROOT/01_KAS_NOTA/`
     * `/ORG_SYSTEM_ROOT/02_PERSURATAN/`
     * `/ORG_SYSTEM_ROOT/03_INVENTARIS/`
     * `/ORG_SYSTEM_ROOT/04_KEGIATAN/`
     * `/ORG_SYSTEM_ROOT/05_LAPORAN_KEJADIAN/`
2. **Optimasi Database Serverless (Neon):**
   * Menggunakan *connection pooling* Neon dan Drizzle ORM untuk menekan waktu *cold start*.
   * Menerapkan *Skeleton Loading* dan *Optimistic UI* pada Next.js agar antarmuka terasa responsif saat database bangun dari status *idle*.
3. **Desain Mobile-First:**
   * Antarmuka dioptimalkan untuk layar smartphone dengan navigasi bawah (*bottom navigation*) atau *drawer* yang mudah diakses saat pengurus berada di lapangan.
4. **Keamanan & Otorisasi Server-Side:**
   * Setiap *Server Action* dan *API Route* wajib memvalidasi sesi dan matriks izin (*RBAC check*) di sisi server, tidak hanya mengandalkan penyembunyian elemen UI.

---

## 5. Prompt Siap Pakai untuk AI Agent (PRD Generator)

Salin dan tempelkan prompt berikut ke AI Agent Anda bersama dokumen ini untuk menghasilkan PRD teknis dan skema database siap coding:

```text
Berdasarkan Dokumen Analisis Kebutuhan Sistem di atas, buatkan Product Requirements Document (PRD) teknis yang sangat detail untuk aplikasi web Manajemen Administrasi Organisasi Kepemudaan (Single-Tenant, Multi-User, Dynamic Multi-Role RBAC).

Spesifikasi Stack Wajib:
- Framework: Next.js 15 (App Router, Server Actions, TypeScript)
- Database: PostgreSQL (Neon Serverless) dengan Drizzle ORM
- Auth & RBAC: Better Auth / Auth.js dengan Dynamic Role & Permission Matrix (Admin 1, Admin 2, Admin Keuangan, Admin Inventaris, Admin Kegiatan, Admin Keamanan, Member)
- File Storage: Google Drive API (OAuth 2.0 Refresh Token) dengan struktur folder otomatis dan client-side image compression agar aman dari limit payload 4.5MB Vercel.

Hasilkan output terstruktur mencakup:
1. Arsitektur Sistem, Alur Autentikasi, dan Mekanisme Validasi Dynamic RBAC di Next.js Server Actions.
2. User Stories & Acceptance Criteria detail untuk seluruh 6 modul (Organisasi, Arus Kas, Persuratan, Inventaris, Kegiatan & PIC, Laporan Kejadian & PIC).
3. Desain Skema Database PostgreSQL lengkap (Schema Drizzle ORM / SQL DDL) meliputi nama tabel, tipe data, relasi foreign key, index, serta tabel `audit_logs`.
4. Spesifikasi Teknis Integrasi Google Drive API (alur pembuatan folder otomatis per kegiatan/modul, upload file terkompresi, dan pengaturan hak akses file rahasia vs publik).
5. Roadmap Pengembangan Bertahap (Fase 1 MVP, Fase 2 Operasional & Pelaporan, Fase 3 Audit & Ekspor Dokumen).
```